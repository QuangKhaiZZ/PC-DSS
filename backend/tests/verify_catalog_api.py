"""Integration checks for the CSV-backed API. No MySQL or third-party Python packages.
Run after dotnet build from any directory. All fixtures live in a temporary directory.
"""
import csv
import json
import math
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, build_opener, ProxyHandler

ROOT = Path(__file__).resolve().parents[2]
DLL = ROOT / 'backend/PcDss.Api/bin/Debug/net10.0/PcDss.Api.dll'
opener = build_opener(ProxyHandler({}))
checks = 0

def expect(condition, message):
    global checks
    assert condition, message
    checks += 1

def read_csv(path):
    with path.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

def write_csv(path, rows):
    with path.open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)

def request(base, route, body=None):
    req = Request(base + route, data=json.dumps(body).encode() if body is not None else None,
                  headers={'Content-Type': 'application/json'})
    try:
        with opener.open(req, timeout=10) as response:
            content = response.read()
            return response.status, json.loads(content) if content else None
    except HTTPError as error:
        content = error.read()
        return error.code, json.loads(content) if content else None

class Server:
    def __init__(self, data, work):
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            port = sock.getsockname()[1]
        self.base = f'http://127.0.0.1:{port}'
        env = dict(os.environ, ASPNETCORE_URLS=self.base, ASPNETCORE_ENVIRONMENT='Production',
                   Dss__DataDirectory=str(data))
        # Starting from an unrelated directory checks path independence.
        self.log_path = work / 'server.log'
        self.log = self.log_path.open('w', encoding='utf8')
        self.process = subprocess.Popen(['dotnet', str(DLL)], cwd=work, env=env,
                                        stdout=self.log, stderr=subprocess.STDOUT)

    def ready(self):
        for _ in range(100):
            if self.process.poll() is not None:
                self.log.flush()
                raise RuntimeError(self.log_path.read_text(encoding='utf8'))
            try:
                if request(self.base, '/health')[0] == 200:
                    return self.base
            except (URLError, TimeoutError, OSError):
                pass
            time.sleep(.1)
        raise RuntimeError('API startup timeout')

    def close(self):
        if self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait()
        self.log.close()

def fixture(work):
    data = work / 'data'
    data.mkdir()
    for name in ['pc_catalog.csv', 'reference.csv']:
        shutil.copy2(ROOT / 'data/processed' / name, data / name)
    for purpose in ['gaming', 'rendering']:
        (data / purpose).mkdir()
        shutil.copy2(ROOT / 'models' / purpose / 'model_info.json', data / purpose / 'model_info.json')
    return data

def close_score(actual, expected):
    expect(math.isclose(actual, float(expected), rel_tol=1e-10, abs_tol=1e-7), f'Score mismatch: {actual} / {expected}')

def main():
    expect(DLL.exists(), 'Run dotnet build first')
    with tempfile.TemporaryDirectory(prefix='pc-dss-api-') as temp:
        work = Path(temp)
        data = fixture(work)
        original = read_csv(data / 'pc_catalog.csv')
        server = Server(data, work)
        try:
            base = server.ready()
            status, catalog = request(base, '/api/pc-catalog')
            expect(status == 200 and len(catalog) == 12, 'Catalog count')
            expect([r['priceVnd'] for r in catalog] == sorted(r['priceVnd'] for r in catalog), 'Catalog order')
            expect(request(base, '/api/pc-catalog/not-found')[0] == 404, 'Unknown PC')
            expect(request(base, '/api/pc-catalog/pc-016')[0] == 200, 'Case-insensitive PcId')
            expect(request(base, '/api/pc-catalog/PC-016/prediction?purpose=Office')[0] == 400, 'Invalid purpose')
            expect(request(base, '/api/pc-catalog/PC-016/prediction')[0] == 400, 'Missing purpose')
            for route in ['/api/brands', '/api/categories', '/api/products', '/api/pc-configurations']:
                expect(request(base, route)[0] == 404, 'Removed SQL API still present')
            for body in [{}, {'budget': 0, 'purpose': 'Gaming'}, {'budget': -1, 'purpose': 'Gaming'},
                         {'budget': 1000.5, 'purpose': 'Gaming'}, {'budget': 20000000, 'purpose': 'Office'},
                         {'budget': 20000000, 'purpose': None}, {'budget': 20000000, 'purpose': 'Gaming', 'topCount': 0},
                         {'budget': 20000000, 'purpose': 'Gaming', 'topCount': 4}]:
                expect(request(base, '/api/recommendations', body)[0] == 400, f'Accepted invalid request {body}')
            for purpose in ['Gaming', 'Rendering']:
                status, result = request(base, '/api/recommendations', {'budget': 20000000, 'purpose': purpose})
                expect(status == 200 and len(result['items']) == 3, 'Top three')
                order = [(r['prediction']['predictedScore'], r['pc']['priceVnd'], r['pc']['pcId']) for r in result['items']]
                expect(order == sorted(order, key=lambda x: (-x[0], x[1], x[2])), 'Ranking rule')
                expect(all(r['pc']['priceVnd'] <= 20000000 for r in result['items']), 'Budget filtering')
                _, result = request(base, '/api/recommendations', {'budget': 1, 'purpose': purpose})
                expect(result['items'] == [] and result['eligiblePcCount'] == 0, 'Empty recommendations')
                _, result = request(base, '/api/recommendations', {'budget': 9950000, 'purpose': purpose})
                expect(result['items'][0]['pc']['pcId'] == 'PC-016', 'Inclusive budget boundary')
                _, result = request(base, '/api/recommendations', {'budget': 100000000, 'purpose': purpose})
                expect(any(r['pcId'] == 'PC-028' and r['code'] == 'OUT_OF_STOCK' for r in result['excluded']), 'Out-of-stock filtering')
            for row in read_csv(ROOT / 'data/validation/pc_predictions.csv'):
                for purpose in ['Gaming', 'Rendering']:
                    status, result = request(base, f"/api/pc-catalog/{row['PcId']}/prediction?purpose={purpose}")
                    expect(status == 200, 'PC prediction failed')
                    close_score(result['predictedScore'], row[purpose.lower() + '_predicted_score'])
                    expect(result['isExtrapolation'] == (row['PcId'] in ['PC-008', 'PC-011']), 'Extrapolation flag')
                    if purpose == 'Rendering':
                        expect(result['operatingSystemAssumption'] == 'Windows 11', 'OS assumption')
            _, unknown_stock = request(base, '/api/pc-catalog/PC-019/prediction?purpose=Gaming')
            expect(any('tồn kho' in w for w in unknown_stock['warnings']), 'Missing stock warning')
        finally:
            server.close()

        # Exercise exported Python test vectors using temporary catalog entries.
        vectors = read_csv(ROOT / 'models/gaming/backend_test_vectors.csv')
        render_vectors = read_csv(ROOT / 'models/rendering/test_predictions.csv')
        rows = []
        for i, v in enumerate(vectors + render_vectors):
            rows.append(dict(original[0], PcId=f'VECTOR-{i:03}', CpuModel=v['CpuModel'], GpuModel=v['GpuModel']))
        rows += [dict(original[0], PcId='MISSING-CPU', CpuModel='Intel Core i5-14400F'),
                 dict(original[0], PcId='MISSING-GPU', GpuModel='GeForce RTX 3060 8GB'),
                 dict(original[0], PcId='QUOTED', ProductName='PC "DSS", thử\nTiếng Việt', PriceVnd='1', Availability='UNKNOWN')]
        write_csv(data / 'pc_catalog.csv', rows)
        server = Server(data, work)
        try:
            base = server.ready()
            for i, v in enumerate(vectors):
                status, result = request(base, f'/api/pc-catalog/VECTOR-{i:03}/prediction?purpose=Gaming')
                expect(status == 200, 'Gaming vector failed')
                close_score(result['predictedScore'], v['ExpectedScore'])
            metadata = json.loads((data / 'rendering/model_info.json').read_text(encoding='utf8'))
            for i, v in enumerate(render_vectors, len(vectors)):
                status, result = request(base, f'/api/pc-catalog/VECTOR-{i:03}/prediction?purpose=Rendering')
                expect(status == 200, 'Render vector failed')
                expected = float(v['PredictedScore']) + (1-float(v['IsWindows11'])) * metadata['coefficients']['IsWindows11']
                close_score(result['predictedScore'], expected)
            for pc in ['MISSING-CPU', 'MISSING-GPU']:
                expect(request(base, f'/api/pc-catalog/{pc}/prediction?purpose=Gaming')[0] == 422, 'Missing reference must not guess')
            _, quoted = request(base, '/api/pc-catalog/QUOTED')
            expect(quoted['productName'] == 'PC "DSS", thử\nTiếng Việt', 'CSV quoting/UTF-8')
            _, rec = request(base, '/api/recommendations', {'budget': 10000000, 'purpose': 'Gaming'})
            expect({x['pcId'] for x in rec['excluded']} >= {'MISSING-CPU', 'MISSING-GPU'}, 'Invalid references excluded')
            # All vectors differ, so isolate equal predictions to verify price tie-break.
        finally:
            server.close()
        write_csv(data/'pc_catalog.csv', [dict(original[0], PcId='TIE-EXPENSIVE', PriceVnd='200'),
                                         dict(original[0], PcId='TIE-CHEAP', PriceVnd='100')])
        modelpath = data/'gaming/model_info.json'
        model = json.loads(modelpath.read_text(encoding='utf8'))
        model['coefficients']['A'] *= 2
        model['model_version'] = 'test-coefficients-from-file'
        modelpath.write_text(json.dumps(model), encoding='utf8')
        server = Server(data, work)
        try:
            base = server.ready()
            _, result = request(base, '/api/recommendations', {'budget': 200, 'purpose': 'Gaming'})
            expect([x['pc']['pcId'] for x in result['items']] == ['TIE-CHEAP', 'TIE-EXPENSIVE'], 'Price tie-break')
            expect(result['modelVersion'] == 'test-coefficients-from-file', 'Model metadata not loaded')
            close_score(result['items'][0]['prediction']['predictedScore'], float(vectors[0]['ExpectedScore'])*2)
        finally:
            server.close()

        def invalid_startup():
            server = Server(data, work)
            try:
                try:
                    server.process.wait(timeout=15)
                except subprocess.TimeoutExpired:
                    raise AssertionError('Invalid data did not fail startup')
                expect(server.process.returncode != 0, 'Invalid data accepted')
            finally:
                server.close()

        write_csv(data/'pc_catalog.csv', [original[0], original[0]])
        invalid_startup()
        write_csv(data/'pc_catalog.csv', [dict(original[0], PriceVnd='0')])
        invalid_startup()
        (data/'pc_catalog.csv').write_text('PcId,ProductName\nA,B\n', encoding='utf8')
        invalid_startup()
        write_csv(data/'pc_catalog.csv', [original[0]])
        model['feature_order'] = ['CpuMultiScore', 'GpuScore']
        modelpath.write_text(json.dumps(model), encoding='utf8')
        invalid_startup()
    print(f'PASS: {checks} assertions; 12 real PCs, 165 gaming vectors, 20 render vectors, API validation, CSV parsing, filters and ranking. No MySQL.')

if __name__ == '__main__':
    main()
