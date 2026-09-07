"""Test the demo schema on a private, disposable MySQL instance.

Standard library only. Never reads application configuration or credentials.
Fixture products, prices and benchmark scores are deliberately fictional.
"""

import argparse
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mysql-bin", required=True, type=Path)
    args = parser.parse_args()
    suffix = ".exe" if os.name == "nt" else ""
    server = args.mysql_bin / ("mysqld" + suffix)
    client = args.mysql_bin / ("mysql" + suffix)
    if not server.is_file() or not client.is_file():
        parser.error("mysql and mysqld must both exist in --mysql-bin")

    source = Path(__file__).resolve().parents[1]
    setup = (source / "database.sql").read_text(encoding="utf-8")
    audit = (source / "03-check-data.sql").read_text(encoding="utf-8")
    temp = Path(tempfile.mkdtemp(prefix="pc-dss-mysql-test-"))
    datadir = temp / "data"
    flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
    print(f"Test files and logs: {temp}", flush=True)
    version = subprocess.run([str(server), "--version"], capture_output=True, text=True, check=True)
    print(version.stdout.strip(), flush=True)

    initialized = subprocess.run(
        [str(server), "--no-defaults", "--initialize-insecure",
         f"--basedir={args.mysql_bin.parent}", f"--datadir={datadir}"],
        capture_output=True, text=True, timeout=90, creationflags=flags,
    )
    if initialized.returncode:
        raise RuntimeError(initialized.stdout + initialized.stderr)

    # Reserve a free loopback port. Read @@datadir after startup to verify identity.
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]

    command = [str(server), "--no-defaults", f"--basedir={args.mysql_bin.parent}",
               f"--datadir={datadir}", "--bind-address=127.0.0.1", f"--port={port}",
               "--mysqlx=OFF", "--skip-log-bin", "--local-infile=OFF",
               "--secure-file-priv=NULL", f"--log-error={temp / 'server.log'}"]
    process = subprocess.Popen(command, stdout=subprocess.DEVNULL,
                               stderr=subprocess.DEVNULL, creationflags=flags)
    identified = False
    checks = 0

    def sql(statement, database=True, expect_error=None):
        options = [str(client), "--no-defaults", "--protocol=TCP", "--host=127.0.0.1",
                   f"--port={port}", "--user=root", "--connect-timeout=2", "--batch",
                   "--raw", "--skip-column-names", "--default-character-set=utf8mb4"]
        if database:
            options.append("pc_dss_test")
        result = subprocess.run(options, input=statement, capture_output=True,
                                text=True, encoding="utf-8", timeout=30, creationflags=flags)
        if expect_error is not None:
            if result.returncode == 0 or f"ERROR {expect_error} " not in result.stderr:
                raise AssertionError(f"Expected MySQL error {expect_error}: {result.stdout} {result.stderr}")
        elif result.returncode:
            raise RuntimeError(result.stderr)
        return result.stdout.strip()

    def check(label, condition):
        nonlocal checks
        if not condition:
            raise AssertionError(label)
        checks += 1
        print(f"PASS {checks:02d}: {label}", flush=True)

    def reject(label, statement, error=3819):
        sql(statement, expect_error=error)
        check(label, True)

    def audit_change(label, statement, expected):
        # One client connection keeps the change and ROLLBACK in one transaction.
        output = sql("START TRANSACTION;\n" + statement + "\n" + audit + "\nROLLBACK;")
        check(label, expected in output)

    try:
        deadline = time.monotonic() + 45
        while time.monotonic() < deadline:
            if process.poll() is not None:
                raise RuntimeError((temp / "server.log").read_text(errors="replace"))
            try:
                actual = sql("SELECT @@datadir;", database=False)
                if Path(actual).resolve() != datadir.resolve():
                    raise AssertionError("Port belongs to another server; refusing to use it")
                identified = True
                break
            except RuntimeError:
                time.sleep(0.25)
        if not identified:
            raise RuntimeError("Private MySQL instance did not become ready")

        sql("CREATE DATABASE pc_dss_test CHARACTER SET utf8mb4;", database=False)
        sql(setup)
        check("schema creates exactly 15 tables", sql("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE();") == "15")
        check("catalog has 8 categories and 10 brands", sql("SELECT (SELECT COUNT(*) FROM Categories), (SELECT COUNT(*) FROM Brands);") == "8\t10")
        check("Category columns match the existing backend", sql("SELECT GROUP_CONCAT(COLUMN_NAME ORDER BY ORDINAL_POSITION) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='Categories';") == "CategoryID,CategoryName")
        check("empty catalog audit has no issues", sql(audit) == "")

        # Fictional fixtures only. Never load these into a real product catalog.
        products = [
            ("TEST-CPU-I", "CPU", 2000000), ("TEST-CPU-D", "CPU", 2500000),
            ("TEST-GPU", "GPU", 4000000), ("TEST-RAM", "RAM", 1000000),
            ("TEST-SSD", "SSD", 800000), ("TEST-MAIN", "Mainboard", 2000000),
            ("TEST-PSU", "PSU", 1000000), ("TEST-CASE", "Case", 700000),
            ("TEST-COOLER", "Cooler", 500000),
        ]
        fixture = ["START TRANSACTION;"]
        for code, category, price in products:
            fixture.append(f"""INSERT INTO Products
                (ProductCode, ProductName, CategoryID, BrandID, Price, PriceSourceUrl, PriceCheckedAt, SpecSourceUrl, IsActive)
                SELECT '{code}', '{code} fictional fixture', c.CategoryID, b.BrandID, {price},
                    'https://example.invalid/test-price', '2026-09-05', 'https://example.invalid/test-spec', 1
                FROM Categories c CROSS JOIN Brands b WHERE c.CategoryName='{category}' AND b.BrandName='AMD';""")

        fixture.extend([
            "INSERT INTO CPU (ProductID,Socket,Core,Thread,TdpW,HasIntegratedGPU,HasBoxCooler) SELECT ProductID,'AM4',6,12,65,1,1 FROM Products WHERE ProductCode='TEST-CPU-I';",
            "INSERT INTO CPU (ProductID,Socket,Core,Thread,TdpW,HasIntegratedGPU,HasBoxCooler) SELECT ProductID,'AM4',6,12,65,0,0 FROM Products WHERE ProductCode='TEST-CPU-D';",
            "INSERT INTO GPU (ProductID,Chipset,VramGb,RecommendedPsuW,LengthMm) SELECT ProductID,'TEST-CHIP',8,500,240 FROM Products WHERE ProductCode='TEST-GPU';",
            "INSERT INTO RAM (ProductID,KitCapacityGb,ModuleCount,SpeedMTs,RamType) SELECT ProductID,16,2,3200,'DDR4' FROM Products WHERE ProductCode='TEST-RAM';",
            "INSERT INTO SSD (ProductID,CapacityGb,Interface,FormFactor) SELECT ProductID,500,'NVME','M.2-2280' FROM Products WHERE ProductCode='TEST-SSD';",
            "INSERT INTO Mainboard (ProductID,Socket,Chipset,RamType,MaxRamGb,RamSlots,SupportsNvme2280,HasDisplayOutput,FormFactor) SELECT ProductID,'AM4','TEST-B550','DDR4',128,4,1,1,'MATX' FROM Products WHERE ProductCode='TEST-MAIN';",
            "INSERT INTO PSU (ProductID,Watt,FormFactor) SELECT ProductID,550,'ATX' FROM Products WHERE ProductCode='TEST-PSU';",
            "INSERT INTO `Case` (ProductID,MotherboardSupport,GpuMaxLengthMm,CoolerMaxHeightMm,PsuFormFactor) SELECT ProductID,'MATX|MINI_ITX',300,160,'ATX' FROM Products WHERE ProductCode='TEST-CASE';",
            "INSERT INTO Cooler (ProductID,SocketSupport,HeightMm) SELECT ProductID,'AM4|AM5',150 FROM Products WHERE ProductCode='TEST-COOLER';",
            "INSERT INTO Benchmark (ProductID,TestName,TestVersion,RawScore,SourceUrl,CheckedAt) SELECT ProductID,'FICTIONAL CPU test','1',1000,'https://example.invalid/test-score','2026-09-05' FROM Products WHERE ProductCode IN ('TEST-CPU-I','TEST-CPU-D');",
            "INSERT INTO Benchmark (ProductID,TestName,TestVersion,RawScore,SourceUrl,CheckedAt) SELECT ProductID,'FICTIONAL GPU test','1',3000,'https://example.invalid/test-score','2026-09-05' FROM Products WHERE ProductCode='TEST-GPU';",
            "INSERT INTO Requirement (Budget,Purpose) VALUES (8000000,'Office'),(15000000,'Gaming');",
            "INSERT INTO Recommendation (RequirementID,CPU_ID,GPU_ID,SSD_ID,RAM_ID,Mainboard_ID,PSU_ID,Case_ID,CoolerID,TotalPrice,Score,Reason,`Rank`) VALUES (1,1,NULL,1,1,1,1,1,NULL,7500000,60,'Fictional office fixture, not a real recommendation',1),(2,2,1,1,1,1,1,1,1,12500000,70,'Fictional gaming fixture, not a real recommendation',1);",
            "COMMIT;",
        ])
        sql("\n".join(fixture))
        check("valid Office/Gaming fixtures pass audit", sql(audit) == "")
        check("guest requirements need no user account", sql("SELECT COUNT(*) FROM Requirement WHERE UserID IS NULL;") == "2")
        check("reference prices preserve exact VND amounts", sql("SELECT SUM(Price) FROM Products WHERE ProductCode NOT IN ('TEST-CPU-D','TEST-GPU','TEST-COOLER');") == "7500000")
        reject("negative price rejected", "UPDATE Products SET Price=-1 WHERE ProductCode='TEST-RAM';")
        reject("incomplete price provenance rejected", "UPDATE Products SET PriceSourceUrl=NULL WHERE ProductCode='TEST-RAM';")
        reject("blank specification source rejected", "UPDATE Products SET SpecSourceUrl=' ' WHERE ProductCode='TEST-RAM';")
        reject("duplicate product code rejected", "UPDATE Products SET ProductCode='TEST-CPU-I' WHERE ProductCode='TEST-CPU-D';", 1062)
        reject("unknown brand foreign key rejected", "UPDATE Products SET BrandID=999999 WHERE ProductCode='TEST-RAM';", 1452)
        reject("duplicate CPU detail rejected", "INSERT INTO CPU (ProductID,Socket,Core,Thread,HasIntegratedGPU,HasBoxCooler) SELECT ProductID,'AM4',6,12,1,1 FROM Products WHERE ProductCode='TEST-CPU-I';", 1062)
        reject("invalid RAM kit rejected", "UPDATE RAM SET ModuleCount=3 WHERE RAM_ID=1;")
        reject("zero budget rejected", "INSERT INTO Requirement (Budget,Purpose) VALUES (0,'Office');")
        reject("out-of-scope purpose rejected", "INSERT INTO Requirement (Budget,Purpose) VALUES (10000000,'AI');")
        reject("out-of-range DSS score rejected", "UPDATE Recommendation SET Score=101 WHERE RecommendationID=1;")
        reject("rank beyond top three rejected", "UPDATE Recommendation SET `Rank`=4 WHERE RecommendationID=1;")
        reject("duplicate rank per requirement rejected", "UPDATE Recommendation SET RequirementID=1 WHERE RecommendationID=2;", 1062)
        reject("benchmark requires a source", "UPDATE Benchmark SET SourceUrl='' WHERE BenchmarkID=1;")
        reject("benchmark rejects fake zero for missing data", "UPDATE Benchmark SET RawScore=0 WHERE BenchmarkID=1;")
        reject("referenced product cannot be deleted", "DELETE FROM Products WHERE ProductCode='TEST-RAM';", 1451)
        sql("INSERT INTO Products (ProductCode,ProductName,CategoryID,BrandID,SpecSourceUrl) SELECT 'TEST-DRAFT','Incomplete test draft',CategoryID,(SELECT BrandID FROM Brands WHERE BrandName='AMD'),'https://example.invalid/test-spec' FROM Categories WHERE CategoryName='CPU';")
        check("incomplete product can remain inactive", sql("SELECT IsActive, Price IS NULL FROM Products WHERE ProductCode='TEST-DRAFT';") == "0\t1")
        reject("product cannot be activated without price", "UPDATE Products SET IsActive=1 WHERE ProductCode='TEST-DRAFT';")

        audit_change("audit catches cross-category detail", "UPDATE Products SET CategoryID=(SELECT CategoryID FROM Categories WHERE CategoryName='GPU') WHERE ProductCode='TEST-CPU-I';", "SPEC_TYPE_OR_COUNT")
        audit_change("audit catches two detail tables for one product", "INSERT INTO GPU (ProductID,Chipset,VramGb,RecommendedPsuW) SELECT ProductID,'TEST',8,500 FROM Products WHERE ProductCode='TEST-CPU-I';", "SPEC_TYPE_OR_COUNT")
        audit_change("audit catches missing CPU benchmark", "DELETE FROM Benchmark WHERE ProductID=(SELECT ProductID FROM Products WHERE ProductCode='TEST-CPU-I');", "MISSING_BENCHMARK")
        audit_change("audit catches mixed benchmark versions", "UPDATE Benchmark SET TestVersion='2' WHERE ProductID=(SELECT ProductID FROM Products WHERE ProductCode='TEST-CPU-D');", "MIXED_BENCHMARK_TESTS")
        audit_change("audit catches recommendation over budget", "UPDATE Requirement SET Budget=1000000 WHERE RequirementID=1;", "INVALID_RECOMMENDATION")
        audit_change("audit catches CPU socket mismatch", "UPDATE CPU SET Socket='AM5' WHERE CPU_ID=1;", "INVALID_RECOMMENDATION")
        audit_change("audit catches missing graphics for Office", "UPDATE CPU SET HasIntegratedGPU=0 WHERE CPU_ID=1;", "INVALID_RECOMMENDATION")
        audit_change("audit catches absent required CPU cooler", "UPDATE CPU SET HasBoxCooler=0 WHERE CPU_ID=1;", "INVALID_RECOMMENDATION")
        audit_change("audit catches RAM generation mismatch", "UPDATE RAM SET RamType='DDR5' WHERE RAM_ID=1;", "INVALID_RECOMMENDATION")
        audit_change("audit matches mainboard support by complete token", "UPDATE `Case` SET MotherboardSupport='MINI_ITX' WHERE Case_ID=1;", "INVALID_RECOMMENDATION")
        audit_change("audit catches missing GPU clearance data", "UPDATE GPU SET LengthMm=NULL WHERE GPU_ID=1;", "INVALID_RECOMMENDATION")
        audit_change("audit catches inadequate GPU PSU rating", "UPDATE PSU SET Watt=300 WHERE PSU_ID=1;", "INVALID_RECOMMENDATION")
        check("negative audit fixtures were rolled back", sql(audit) == "")
        print(f"SUCCESS: {checks} database checks passed on private MySQL port {port}.", flush=True)
    finally:
        if process.poll() is None:
            try:
                if identified:
                    sql("SHUTDOWN;", database=False)
                else:
                    process.terminate()
                process.wait(timeout=20)
            except (RuntimeError, subprocess.TimeoutExpired):
                process.terminate()
                process.wait(timeout=10)
        print("Private MySQL process stopped. Existing MySQL service was not used.", flush=True)


if __name__ == "__main__":
    main()
