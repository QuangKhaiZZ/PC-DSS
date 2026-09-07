"""Exercise catalog HTTP requests and database conflicts on private MySQL.

Requires .NET 10, restored API packages, Python 3 and MySQL 8.0.16+ binaries.
Only the Python standard library is used. No application credentials are read.
The script stops its own API/MySQL processes and retains temporary test logs.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import tempfile
import time
from urllib.error import HTTPError
from urllib.request import ProxyHandler, Request, build_opener
import uuid


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def stop(process):
    if process is not None and process.poll() is None:
        if os.name == "nt":
            # MySQL on Windows starts a child server process under a monitor.
            # Terminate only the process tree launched by this test.
            subprocess.run(
                ["taskkill", "/PID", str(process.pid), "/T", "/F"],
                capture_output=True, timeout=15,
                creationflags=subprocess.CREATE_NO_WINDOW,
            )
        else:
            process.terminate()
        try:
            process.wait(timeout=15)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=10)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mysql-bin", required=True, type=Path)
    args = parser.parse_args()
    suffix = ".exe" if os.name == "nt" else ""
    server = args.mysql_bin / ("mysqld" + suffix)
    client = args.mysql_bin / ("mysql" + suffix)
    if not server.is_file() or not client.is_file():
        parser.error("mysql and mysqld must exist in --mysql-bin")

    root = Path(__file__).resolve().parents[2]
    project = root / "backend" / "PcDss.Api"
    temp = Path(tempfile.mkdtemp(prefix="pcdss-catalog-api-test-"))
    output = temp / "api"
    datadir = temp / "mysql-data"
    flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
    print(f"Test files and logs: {temp}", flush=True)

    build = subprocess.run(
        ["dotnet", "build", str(project / "PcDss.Api.csproj"),
         "--no-restore", "--nologo", f"-p:OutputPath={output}"],
        capture_output=True, text=True, timeout=120, creationflags=flags,
    )
    print(build.stdout, flush=True)
    if build.returncode:
        raise RuntimeError(build.stderr or "API build failed")
    initialized = subprocess.run(
        [str(server), "--no-defaults", "--initialize-insecure",
         f"--basedir={args.mysql_bin.parent}", f"--datadir={datadir}"],
        capture_output=True, text=True, timeout=90, creationflags=flags,
    )
    if initialized.returncode:
        raise RuntimeError(initialized.stdout + initialized.stderr)

    mysql_port = free_port()
    mysql_process = None
    api_process = None
    api_log = None
    identified = False
    checks = 0
    mysql_env = os.environ.copy()
    mysql_env.pop("MYSQL_PWD", None)
    mysql_env["MYSQL_TEST_LOGIN_FILE"] = str(temp / "unused-login.cnf")
    client_options = [
        str(client), "--no-defaults", "--skip-password",
        "--protocol=TCP", "--host=127.0.0.1", f"--port={mysql_port}",
        "--user=root", "--connect-timeout=2", "--batch", "--raw",
        "--skip-column-names", "--default-character-set=utf8mb4",
    ]

    def sql(statement, database=True):
        command = client_options + (["pc_dss_test"] if database else [])
        result = subprocess.run(
            command, input=statement, capture_output=True, text=True,
            encoding="utf-8", timeout=30, creationflags=flags, env=mysql_env,
        )
        if result.returncode:
            raise RuntimeError(result.stderr)
        return result.stdout.strip()

    def check(label, condition):
        nonlocal checks
        if not condition:
            raise AssertionError(label)
        checks += 1
        print(f"PASS {checks:02d}: {label}", flush=True)

    try:
        mysql_process = subprocess.Popen(
            [str(server), "--no-defaults", f"--basedir={args.mysql_bin.parent}",
             f"--datadir={datadir}", "--bind-address=127.0.0.1",
             f"--port={mysql_port}", "--mysqlx=OFF", "--skip-log-bin",
             "--local-infile=OFF", "--secure-file-priv=NULL",
             f"--log-error={temp / 'mysql.log'}"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            creationflags=flags,
        )
        deadline = time.monotonic() + 45
        last_connection_error = ""
        while time.monotonic() < deadline:
            if mysql_process.poll() is not None:
                raise RuntimeError((temp / "mysql.log").read_text(errors="replace"))
            try:
                actual = sql("SELECT @@datadir;", database=False)
                if Path(actual).resolve() != datadir.resolve():
                    raise AssertionError("Wrong MySQL instance; refusing to use it")
                identified = True
                break
            except RuntimeError as error:
                last_connection_error = str(error)
                time.sleep(0.2)
        if not identified:
            raise RuntimeError("Private MySQL did not become ready: " + last_connection_error)

        sql("CREATE DATABASE pc_dss_test CHARACTER SET utf8mb4;", database=False)
        sql((root / "database" / "database.sql").read_text(encoding="utf-8"))
        original_categories = sql("SELECT * FROM Categories ORDER BY CategoryID;")
        original_brands = sql("SELECT * FROM Brands ORDER BY BrandID;")

        api_port = free_port()
        base_url = f"http://127.0.0.1:{api_port}"
        # Testing skips User Secrets. An isolated content root and explicit
        # connection string keep the API away from the user's database.
        environment = {
            key: value for key, value in os.environ.items()
            if not key.lower().startswith(("aspnetcore_", "connectionstrings__", "kestrel__"))
            and key.lower() not in ("dotnet_environment", "https_port", "https_ports")
        }
        environment.update({
            "DOTNET_ENVIRONMENT": "Testing",
            "ASPNETCORE_ENVIRONMENT": "Testing",
            # This disposable database is bound only to loopback; avoid depending
            # on Windows TLS credentials in the isolated test environment.
            "ConnectionStrings__DefaultConnection":
                f"Server=127.0.0.1;Port={mysql_port};Database=pc_dss_test;User ID=root;Password=;SslMode=Disabled;",
            "Logging__LogLevel__Default": "Warning",
            "Logging__LogLevel__Microsoft.EntityFrameworkCore.Database.Command": "Error",
            # Keep test diagnostics in api.log without requiring Windows Event Log access.
            "Logging__EventLog__LogLevel__Default": "None",
        })
        api_log = (temp / "api.log").open("w", encoding="utf-8")
        api_process = subprocess.Popen(
            ["dotnet", str(output / "PcDss.Api.dll"),
             "--urls", base_url, "--contentRoot", str(output)],
            cwd=output, env=environment, stdout=api_log,
            stderr=subprocess.STDOUT, creationflags=flags,
        )

        def http(method, path, body=None):
            data = json.dumps(body).encode("utf-8") if body is not None else None
            request = Request(base_url + path, data=data, method=method,
                              headers={"Content-Type": "application/json"})
            opener = build_opener(ProxyHandler({}))
            try:
                response = opener.open(request, timeout=20)
            except HTTPError as error:
                response = error
            with response:
                text = response.read().decode("utf-8")
                return response.code, json.loads(text) if text else None

        deadline = time.monotonic() + 30
        while time.monotonic() < deadline:
            if api_process.poll() is not None:
                raise RuntimeError((temp / "api.log").read_text(errors="replace"))
            try:
                if http("GET", "/api/categories")[0] == 200:
                    break
            except OSError:
                pass
            time.sleep(0.2)
        else:
            raise RuntimeError("Private API did not become ready. See " + str(temp / "api.log"))

        # Execute the request files' actual methods, bodies and response IDs.
        # This resolves only the REST Client features used in these files.
        def run_request_file(filename, expected_statuses):
            responses = {}
            expected_bodies = {}
            request_count = 0

            def resolve(match):
                token = match.group(1)
                if token == "host":
                    return base_url
                if token == "$guid":
                    return str(uuid.uuid4())
                name, field = token.split(".response.body.$.", 1)
                return str(responses[name][field])

            contents = (project / filename).read_text(encoding="utf-8")
            for block in re.split(r"^###.*$", contents, flags=re.MULTILINE):
                method_line = re.search(r"^(GET|POST|PUT|DELETE) (.+)$", block, re.MULTILINE)
                if not method_line:
                    continue
                method, url = method_line.groups()
                name_match = re.search(r"^# @name (\w+)$", block, re.MULTILINE)
                url = re.sub(r"\{\{([^{}]+)\}\}", resolve, url)
                body = None
                body_start = block.find("\n{\n")
                if body_start >= 0:
                    body = json.loads(re.sub(r"\{\{([^{}]+)\}\}", resolve,
                                             block[body_start:].strip()))
                if not url.startswith(base_url + "/api/"):
                    raise AssertionError("HTTP test must target the private API")
                status, response = http(method, url[len(base_url):], body)
                expected = expected_statuses[request_count]
                request_count += 1
                check(f"{filename} request {request_count}: {method} -> {expected} (got {status})", status == expected)
                if name_match and status == 201:
                    responses[name_match.group(1)] = response
                if method == "PUT" and status == 200:
                    expected_bodies[url] = {
                        "brandName" if key == "name" else key: value
                        for key, value in body.items()
                    }
                if url in expected_bodies and method in ("GET", "PUT") and status == 200:
                    check("updated fields persisted", all(
                        response.get(key) == value for key, value in expected_bodies[url].items()
                    ))
                if "/api/products" in url and method == "POST" and status == 201:
                    check("new product is inactive and includes related names",
                          response["isActive"] is False and bool(response["categoryName"])
                          and bool(response["brandName"]))
            check(f"all {filename} requests executed", request_count == len(expected_statuses))

        run_request_file("PcDss.Api.http", [200, 201, 200, 200, 200, 204, 404,
                                           200, 201, 200, 200, 200, 204, 404])
        run_request_file("Products.http", [200, 201, 201, 201, 200, 200, 200,
                                          409, 409, 204, 404, 204, 204])

        # Regress the MySQL DATE reader failure, including nullable values.
        status, category = http("POST", "/api/categories", {"categoryName": "TEST-DATE-CATEGORY"})
        check("date fixture category created", status == 201)
        status, brand = http("POST", "/api/brands", {"name": "TEST-DATE-BRAND"})
        check("date fixture brand created", status == 201)
        body = {
            "productCode": "TEST-DATE-PRODUCT", "productName": "Date round trip",
            "categoryId": category["categoryId"], "brandId": brand["brandId"],
            "specSourceUrl": "https://example.invalid/test-spec",
        }
        product_id = None
        for date in (None, "2024-02-29", "2026-09-07", None):
            body.update({
                "price": 1000000 if date else None,
                "priceSourceUrl": "https://example.invalid/test-price" if date else None,
                "priceCheckedAt": date,
            })
            method = "PUT" if product_id is not None else "POST"
            path = f"/api/products/{product_id}" if product_id is not None else "/api/products"
            status, product = http(method, path, body)
            check(f"product date {date}: {method} succeeds", status == (201 if method == "POST" else 200))
            check("write response preserves exact date", product["priceCheckedAt"] == date)
            product_id = product["productId"]
            status, product = http("GET", f"/api/products/{product_id}")
            check("GET preserves stored date including null", status == 200 and product["priceCheckedAt"] == date)
            status, products = http("GET", "/api/products")
            check("list can read stored dates", status == 200 and any(
                item["productId"] == product_id and item["priceCheckedAt"] == date for item in products))
        for path in (f"/api/products/{product_id}", f"/api/categories/{category['categoryId']}",
                     f"/api/brands/{brand['brandId']}"):
            check("date fixture removed", http("DELETE", path)[0] == 204)

        race_targets = []
        for route, table, field, id_field in (
            ("categories", "Categories", "categoryName", "categoryId"),
            ("brands", "Brands", "name", "brandId"),
        ):
            for value in ("", "   ", None, "x" * 101):
                check(f"{route}: invalid name returns 400",
                      http("POST", f"/api/{route}", {field: value})[0] == 400)

            for operation in ("INSERT", "UPDATE"):
                target = f"TEST-RACE-{table}-{operation}"
                race_targets.append(target)
                ids = []
                if operation == "UPDATE":
                    for number in range(2):
                        status, item = http("POST", f"/api/{route}", {field: f"{target}-{number}"})
                        check(f"{route}: update fixture created", status == 201)
                        ids.append(item[id_field])

                # Hold both writes inside a trigger AFTER their name prechecks.
                # Releasing the gate forces the unique-index error path, rather
                # than merely testing a sequential duplicate-name precheck.
                sql(f"""DELIMITER $$
CREATE TRIGGER test_gate BEFORE {operation} ON {table} FOR EACH ROW
BEGIN
    DO GET_LOCK('pcdss_api_test_gate', 15);
    DO RELEASE_LOCK('pcdss_api_test_gate');
END$$
DELIMITER ;
""")
                holder = subprocess.Popen(
                    client_options + ["pc_dss_test"], stdin=subprocess.PIPE,
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                    text=True, creationflags=flags, env=mysql_env,
                )
                try:
                    holder.stdin.write("SELECT GET_LOCK('pcdss_api_test_gate', 5); SELECT SLEEP(30);")
                    holder.stdin.close()
                    deadline = time.monotonic() + 5
                    while sql("SELECT IS_USED_LOCK('pcdss_api_test_gate');") == "NULL":
                        if time.monotonic() > deadline:
                            raise AssertionError("Could not acquire test gate")
                        time.sleep(0.1)
                    with ThreadPoolExecutor(max_workers=2) as pool:
                        method = "POST" if operation == "INSERT" else "PUT"
                        paths = [f"/api/{route}" for _ in range(2)] if not ids else [
                            f"/api/{route}/{item_id}" for item_id in ids]
                        futures = [pool.submit(http, method, path, {field: target}) for path in paths]
                        try:
                            deadline = time.monotonic() + 8
                            while True:
                                waiting = int(sql("SELECT COUNT(*) FROM information_schema.PROCESSLIST "
                                                  "WHERE STATE='User lock' AND DB=DATABASE();"))
                                if waiting == 2:
                                    break
                                if time.monotonic() > deadline:
                                    raise AssertionError("Both writes did not reach the test gate")
                                time.sleep(0.1)
                        finally:
                            stop(holder)
                        results = [future.result() for future in futures]
                    success = 201 if operation == "INSERT" else 200
                    check(f"{route}: overlapping {method} returns {success} and 409",
                          sorted(result[0] for result in results) == [success, 409])
                    check(f"{route}: conflict has readable message",
                          all(result[1].get("message") for result in results if result[0] == 409))
                    if not ids:
                        ids = [result[1][id_field] for result in results if result[0] == 201]
                finally:
                    stop(holder)
                    sql("DROP TRIGGER test_gate;")
                for item_id in ids:
                    check(f"{route}: race fixture removed",
                          http("DELETE", f"/api/{route}/{item_id}")[0] == 204)

        logs = (temp / "api.log").read_text(encoding="utf-8", errors="replace")
        check("all four race cases exercised real MySQL duplicate-key failures",
              all(f"Duplicate entry '{target}'" in logs for target in race_targets))
        check("original categories unchanged", sql("SELECT * FROM Categories ORDER BY CategoryID;") == original_categories)
        check("original brands unchanged", sql("SELECT * FROM Brands ORDER BY BrandID;") == original_brands)
        check("all test products removed", sql("SELECT COUNT(*) FROM Products;") == "0")
        print(f"SUCCESS: {checks} catalog API checks passed.", flush=True)
    finally:
        stop(api_process)
        if api_log is not None:
            api_log.close()
        if identified and mysql_process is not None and mysql_process.poll() is None:
            try:
                sql("SHUTDOWN;", database=False)
                mysql_process.wait(timeout=15)
            except (RuntimeError, subprocess.TimeoutExpired):
                stop(mysql_process)
        else:
            stop(mysql_process)
        print("Private API/MySQL stopped. Existing databases were not used.", flush=True)


if __name__ == "__main__":
    main()
