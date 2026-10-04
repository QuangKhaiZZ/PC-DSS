"""Read-only model smoke check; no training or backend changes.

Run with Python plus numpy, scikit-learn 1.6.1 and joblib installed.
Optional --deps PATH loads an isolated dependency directory.
Outputs: data/validation and docs/model-check.md.
Only load the trusted project model.joblib files supplied for this project.
"""
import argparse
import csv
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import warnings

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--deps', type=Path)
args = parser.parse_args()
if args.deps:
    sys.path.insert(0, str(args.deps))
import numpy as np
import joblib
import sklearn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data/validation'
OUT.mkdir(exist_ok=True)

def read_csv(path):
    with path.open(encoding='utf-8-sig', newline='') as stream:
        return list(csv.DictReader(stream))

def write_csv(name, rows):
    with (OUT / name).open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

def norm(value):
    return re.sub('[^a-z0-9]', '', value.lower().split('@')[0].replace('processor', '').replace('nvidia', ''))

def metrics(actual, predicted):
    actual, predicted = np.asarray(actual), np.asarray(predicted)
    error = predicted - actual
    ape = np.abs(error / actual) * 100
    return dict(n=len(actual), MAE=float(np.abs(error).mean()),
                RMSE=float(np.sqrt(np.mean(error ** 2))),
                MAPE_pct=float(ape.mean()), MedianAPE_pct=float(np.median(ape)),
                MaxAPE_pct=float(ape.max()),
                R2=float(1 - np.sum(error ** 2) / np.sum((actual - actual.mean()) ** 2)))

files = [p for p in (ROOT / 'models').rglob('*') if p.is_file()]
before = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
info = {name: json.loads((ROOT / f'models/{name}/model_info.json').read_text(encoding='utf-8')) for name in ['gaming', 'rendering']}
models = {name: joblib.load(ROOT / f'models/{name}/model.joblib') for name in info}

def predict(name, rows):
    keys = info[name]['feature_order']
    x = np.array([[float(r[k]) for k in keys] for r in rows])
    if not np.isfinite(x).all() or (x[:, :2] <= 0).any():
        raise ValueError('Benchmark inputs must be finite and strictly positive')
    if name == 'rendering':
        if not np.isin(x[:, [2, 4, 5]], [0, 1]).all() or not np.isin(x[:, 3], [30, 40, 50]).all():
            raise ValueError('Unknown rendering category or operating system')
    with warnings.catch_warnings():
        warnings.filterwarnings('ignore', message='X does not have valid feature names')
        result = models[name].predict(x)
    if not np.isfinite(result).all():
        raise ValueError('Nonfinite prediction')
    return result

def formula(name, rows):
    c = info[name]['coefficients']
    if name == 'gaming':
        return np.array([c['A'] * float(r['GpuScore']) ** c['b'] * float(r['CpuMultiScore']) ** c['c'] for r in rows])
    return np.array([info[name]['intercept'] + sum(c[k] * float(r[k]) for k in info[name]['feature_order']) for r in rows])

datasets = {name: read_csv(ROOT / f'data/processed/{name}_dataset.csv') for name in info}
checks, metric_results, errors = {}, {}, []
for name, rows in datasets.items():
    assert len({r['RunId'] for r in rows}) == len(rows), 'Duplicate RunId'
    saved_rows = read_csv(ROOT / f'models/{name}/data_used.csv')
    actual_train = rows if name == 'gaming' else [r for r in rows if r['Split'] == 'train']
    assert {r['RunId'] for r in actual_train} == {r['RunId'] for r in saved_rows}
    saved_by_id = {r['RunId']: r for r in saved_rows}
    for r in actual_train:
        for k in [*info[name]['feature_order'], 'Score']:
            assert float(r[k]) == float(saved_by_id[r['RunId']][k]), (name, r['RunId'], k)
    prediction = predict(name, rows)
    delta = float(np.max(np.abs(prediction - formula(name, rows))))
    assert delta < 1e-7, (name, delta)
    checks[name + '_formula_max_delta'] = delta
    for key, bounds in info[name]['training_ranges'].items():
        observed = [float(r[key]) for r in actual_train]
        assert min(observed) == bounds['min'] and max(observed) == bounds['max']
    for split in (['train'] if name == 'gaming' else ['train', 'test']):
        indices = [i for i, r in enumerate(rows) if name == 'gaming' or r['Split'] == split]
        y = [float(rows[i]['Score']) for i in indices]
        pred = prediction[indices]
        result = metrics(y, pred)
        metric_results[name + '_' + split] = result
        published = info[name]['training_metrics_only'] if name == 'gaming' else info[name]['metrics']['training' if split == 'train' else 'test']
        for k in ['MAE', 'RMSE', 'R2']:
            assert math.isclose(result[k], published[k if name == 'gaming' else k.lower()], rel_tol=1e-8, abs_tol=1e-7)
        for idx, actual, p in zip(indices, y, pred):
            r = rows[idx]
            errors.append(dict(Model=name, Split=split, RunId=r['RunId'], MachineGroupId=r['MachineGroupId'],
                               ActualScore=actual, PredictedScore=float(p), Error=float(p-actual),
                               AbsoluteError=float(abs(p-actual)), APE_pct=float(abs(p-actual)/actual*100)))
    saved = read_csv(ROOT / f'models/{name}/' / ('training_predictions.csv' if name == 'gaming' else 'test_predictions.csv'))
    current_by_id = {r['RunId']: r for r in rows}
    expected_ids = {r['RunId'] for r in rows if name == 'gaming' or r['Split'] == 'test'}
    assert {r['RunId'] for r in saved} == expected_ids
    for r in saved:
        for k in [*info[name]['feature_order'], 'Score']:
            assert float(r[k]) == float(current_by_id[r['RunId']][k]), (name, r['RunId'], k)
    value_key = 'Predicted' if name == 'gaming' else 'PredictedScore'
    p = predict(name, saved)
    delta = float(max(abs(a-float(b[value_key])) for a,b in zip(p,saved)))
    assert delta < 1e-7
    checks[name + '_saved_predictions_max_delta'] = delta

vectors = read_csv(ROOT / 'models/gaming/backend_test_vectors.csv')
checks['gaming_test_vectors_count'] = len(vectors)
assert np.allclose(predict('gaming', vectors), [float(r['ExpectedScore']) for r in vectors], rtol=1e-10, atol=1e-7)
train_groups = {r['MachineGroupId'] for r in datasets['rendering'] if r['Split']=='train'}
test_groups = {r['MachineGroupId'] for r in datasets['rendering'] if r['Split']=='test'}
checks['rendering_overlapping_groups'] = sorted(train_groups & test_groups)
checks['rendering_test_rows_in_overlapping_groups'] = sum(r['Split']=='test' and r['MachineGroupId'] in train_groups for r in datasets['rendering'])
render_source = read_csv(ROOT/'models/rendering/data_used.csv') + read_csv(ROOT/'models/rendering/test_predictions.csv')
checks['rendering_training_notes_mentioning_productivity'] = [r['RunId'] for r in render_source if 'productivity' in r.get('ReviewNote','').lower()]

# Preserve original-export consistency checks above; apply verified label fixes
# only to evaluation below, never to model binaries or historical exports.
correction_path = OUT / 'label_corrections.json'
corrections = json.loads(correction_path.read_text(encoding='utf8')) if correction_path.exists() else []
for correction in corrections:
    matches = [r for r in errors if r['Model'] == correction['Model'] and r['RunId'] == correction['RunId'] and r['Split'] == correction['Split']]
    assert len(matches) == 1
    row = matches[0]
    assert row['ActualScore'] == correction['OriginalScore']
    row['ActualScore'] = float(correction['CorrectedScore'])
    row['Error'] = row['PredictedScore'] - row['ActualScore']
    row['AbsoluteError'] = abs(row['Error'])
    row['APE_pct'] = row['AbsoluteError'] / row['ActualScore'] * 100
for name, split in {(c['Model'], c['Split']) for c in corrections}:
    corrected_rows = [r for r in errors if r['Model'] == name and r['Split'] == split]
    metric_results[name + '_' + split + '_corrected'] = metrics(
        [r['ActualScore'] for r in corrected_rows], [r['PredictedScore'] for r in corrected_rows])
checks['evaluation_label_corrections'] = corrections

refs = read_csv(ROOT/'data/processed/reference.csv')
lookup = {}
for r in refs:
    key = (r['ComponentType'], norm(r['ModelName']))
    assert key not in lookup
    lookup[key] = r
catalog = read_csv(ROOT/'data/processed/pc_catalog.csv')
pc_results = []
for pc in catalog:
    cpu = lookup[('CPU', norm(pc['CpuModel']))]
    gpu = lookup[('GPU', norm(pc['GpuModel']))]
    f = dict(GpuScore=float(gpu['RawScore']), CpuMultiScore=float(cpu['RawScore']),
             IsIntel=int('intel' in pc['CpuModel'].lower()),
             GpuGeneration=int(re.search(r'rtx\s*(\d{2})\d{2}', pc['GpuModel'].lower())[1]),
             IsUltra=int('ultra' in pc['CpuModel'].lower()), IsWindows11=1)
    result = dict(PcId=pc['PcId'], CpuModel=pc['CpuModel'], GpuModel=pc['GpuModel'],
                  PriceVnd=pc['PriceVnd'],
                  ScenarioOS='Windows 11 (assumption)', CpuMultiRefId=cpu['ReferenceId'], GpuRefId=gpu['ReferenceId'], **f)
    for name in info:
        outside = [k for k,b in info[name]['training_ranges'].items() if not b['min'] <= f[k] <= b['max']]
        result[name + '_range'] = 'EXTRAPOLATION' if outside else 'IN_RANGE'
        p = float(predict(name, [f])[0])
        assert p > 0
        result[name + '_predicted_score'] = p
    pc_results.append(result)
assert len(pc_results) == len(catalog) and len(pc_results) > 0
checks['pc_count'] = len(pc_results)
checks['pc_extrapolation_ids'] = [r['PcId'] for r in pc_results if r['gaming_range']=='EXTRAPOLATION' or r['rendering_range']=='EXTRAPOLATION']
checks['distinct_pc_cpu_gpu_pairs'] = len({(r['CpuModel'],r['GpuModel']) for r in pc_results})
checks['model_files_unchanged'] = before == {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
assert checks['model_files_unchanged']
write_csv('benchmark_errors.csv', sorted(errors, key=lambda r: (r['Model'], r['Split'], -r['APE_pct'])))
write_csv('pc_predictions.csv', pc_results)
report = dict(runtime=dict(python=sys.version.split()[0], numpy=np.__version__, sklearn=sklearn.__version__, joblib=joblib.__version__),
              metrics=metric_results, checks=checks, model_sha256={k:v for k,v in before.items() if k.endswith('model.joblib')},
              scope='Existing models only; no retraining, no independent gaming evaluation, no web source revalidation; Windows 11 scenario for PC catalog.')
(OUT/'model_check.json').write_text(json.dumps(report, ensure_ascii=False, indent=2),encoding='utf8')
lines=['# Kiểm tra nhanh hai model PC-DSS', '',
       'Đã nạp trực tiếp hai file model.joblib và chạy predict; đối chiếu công thức JSON, dự đoán đã lưu, đầu vào train và các test vector gaming. Tất cả khớp trong sai số số thực 1e-7. Không sửa backend, không train lại, SHA-256 các file model giữ nguyên.', '',
       '## Sai số tính lại', '', '| Model / tập dữ liệu | Số mẫu | MAE (điểm) | RMSE (điểm) | MAPE | R² |', '|---|---:|---:|---:|---:|---:|']
for name,m in metric_results.items():
    lines.append(f"| {name} | {m['n']} | {m['MAE']:.2f} | {m['RMSE']:.2f} | {m['MAPE_pct']:.2f}% | {m['R2']:.4f} |")
lines += ['', f"Gaming: sai số trên {len(datasets['gaming'])} mẫu đã học, không phải test độc lập. Render: {info['rendering']['test_row_count']} mẫu giữ lại theo cách chia hiện có; cross-validation ghi trong model_info chưa được chạy lại trong lượt kiểm tra này.", '',
          '## Những điểm cần lưu ý', '',
          f"- Render có {len(checks['rendering_overlapping_groups'])} nhóm CPU–GPU trùng giữa train/test, gồm {checks['rendering_test_rows_in_overlapping_groups']} dòng test: {', '.join(checks['rendering_overlapping_groups'])}. Cách chia gốc theo từng dòng; số nhóm trùng được kiểm tra từ dữ liệu hiện tại.",
          f"- Có {len(checks['rendering_training_notes_mentioning_productivity'])} dòng train render còn ghi Productivity trong ReviewNote dù target khai báo Rendering and Visualization. Script không dùng note làm nhãn; chưa xác minh nguồn web nên chưa thể kết luận cột Score thực sự đúng loại benchmark. Cần đối chiếu nguồn trước khi khẳng định chất lượng nhãn.",
          f"- Hệ số Windows 11 là {info['rendering']['coefficients']['IsWindows11']:+.2f} điểm khi giữ nguyên các biến khác. Đây là quan hệ thống kê của dữ liệu, không phải chứng minh nâng Windows làm máy nhanh thêm từng đó.",
          '- Gaming dự đoán Time Spy Overall, không phải FPS. Render dự đoán PCMark 10 Rendering and Visualization, không phải thời gian render Blender.', '',
          '## Chạy thử danh mục PC', '',
          f"- Chạy được {len(pc_results)}/{len(catalog)} bộ, ghép CPU/GPU với reference thành công; điểm trả về hữu hạn và dương. Có {checks['distinct_pc_cpu_gpu_pairs']} cặp CPU–GPU khác nhau.",
          '- Render dùng giả định Windows 11 cho toàn bộ lượt thử; không ghi đây là OS bán kèm theo shop.',
          f"- PC ngoài phạm vi train: {', '.join(checks['pc_extrapolation_ids']) or 'không có trong danh mục hiện tại'}. Cờ được tính từ reference và khoảng train của từng model.",
          '- Các bộ cùng CPU/GPU sẽ có cùng điểm dự đoán trong kịch bản này dù giá/RAM/SSD khác nhau: model không dùng RAM/SSD hay giá.',
          '- Danh mục dùng cấu hình và giá tham khảo để chạy DSS; tồn kho cửa hàng không phải đầu vào hay điều kiện lọc.',
          f'- Không có benchmark thực đo cho {len(pc_results)} PC, nên không tính độ chính xác trên danh mục. IN_RANGE không phải chứng nhận dự đoán đúng.', '',
          '## Các mẫu lệch nhiều nhất ở tập test render', '', '| RunId | Điểm thật | Dự đoán | Lệch tuyệt đối | Lệch % |', '|---|---:|---:|---:|---:|']
for r in sorted([r for r in errors if r['Model']=='rendering' and r['Split']=='test'], key=lambda r:r['APE_pct'], reverse=True)[:5]:
    lines.append(f"| {r['RunId']} | {r['ActualScore']:.0f} | {r['PredictedScore']:.0f} | {r['AbsoluteError']:.0f} | {r['APE_pct']:.2f}% |")
lines += ['', '## Kết luận và cách chạy lại', '',
          'Đạt kiểm tra thực thi và tính nhất quán của file xuất. Backend đã tích hợp hai model và có kiểm thử tương đương C#/Python; xem [kiểm thử API](../backend/tests/README.md). Báo cáo này đo mô hình Python riêng, không thay thế kiểm thử luồng tư vấn. Chưa đủ bằng chứng để tuyên bố chính xác trên cấu hình mới. Ưu tiên đối chiếu nhãn render còn ghi Productivity; sau đó đánh giá gaming độc lập và render chia theo nhóm nếu cần báo cáo khả năng tổng quát hóa.', '',
          f'`python scripts/check_models.py` hoặc thêm `--deps PATH`. Lượt này dùng numpy {np.__version__}, scikit-learn {sklearn.__version__}, joblib {joblib.__version__}; đã nạp và đối chiếu dự đoán thành công.', '',
          'Chi tiết: [model_check.json](../data/validation/model_check.json), [benchmark_errors.csv](../data/validation/benchmark_errors.csv), [pc_predictions.csv](../data/validation/pc_predictions.csv).']
if corrections:
    lines[2:2] = [
        '## Đính chính nhãn benchmark', '',
        *[f"- {c['RunId']}: điểm gốc {c['OriginalScore']} được đính chính thành **{c['CorrectedScore']}**, xác nhận [{c['Metric']}]({c['SourceUrl']}). Chỉ sửa nhãn khi đánh giá; mẫu thuộc tập {c['Split']}, không train lại model." for c in corrections],
        '- Trong bảng sai số, `_test` là kết quả theo nhãn xuất gốc; `_test_corrected` là kết quả sau đính chính. Bảng mẫu lệch lớn và benchmark_errors.csv dùng nhãn đã đính chính.',
        '- Dataset CSV và Excel nguồn vẫn giữ bản gốc; trước lần train/export tiếp theo phải áp dụng label_corrections.json vào nguồn. Không dùng lại số sai 9488 khi đánh giá RUN-RENDER-074.', '',
    ]
dataset_manifest = json.loads((ROOT/'data/processed/dataset_info.json').read_text(encoding='utf8'))
if dataset_manifest.get('rendering_source_update'):
    lines[2:2] = ['## Bản dữ liệu hiện tại', '',
        f"Model: {info['rendering']['model_version']}. Hash Excel lúc train được giữ trong metadata; Excel hiện tại đã làm sạch ghi chú và thông tin RAM, không đổi đầu vào/nhãn model.",
        'Người dùng đã thay lượt benchmark và URL ở RUN-RENDER-031 (14827 điểm) và RUN-RENDER-074 (21275 điểm). Hai dòng vẫn ở tập test; hệ số model không đổi. Điểm test tốt hơn do tập test thay đổi, không chứng minh model được cải thiện. Nên có tập đánh giá độc lập chưa chọn lại theo sai số nếu cần kết luận tổng quát hóa.',
        'Ghi chú dòng 031/074 đã đồng bộ với lượt mới; RAM speed dòng 074 là 4788 MHz. Các trường này không thuộc đầu vào model.',
        'Backend dùng metadata trong models/gaming/ và models/rendering/. Các bản lưu trữ không được nạp khi dự đoán.', '']
(ROOT/'docs/model-check.md').write_text('\n'.join(lines)+'\n',encoding='utf8')
print(json.dumps({'metrics': metric_results, 'pc_count': len(pc_results),
                  'model_files_unchanged': checks['model_files_unchanged'],
                  'report': 'docs/model-check.md'}, ensure_ascii=False, indent=2))
