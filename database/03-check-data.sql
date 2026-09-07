-- Chi doc. Ket qua rong = khong phat hien cac loi duoi day.
-- KHONG thay the viec xac minh linh kien/BIOS/nguon/tan nhiet voi tai lieu hang.
-- Chay sau khi nhap data. Hien ca san pham chua duyet neu da nhap sai loai.
WITH ComponentRows AS (
    SELECT ProductID, 'CPU' AS ExpectedCategory FROM CPU
    UNION ALL SELECT ProductID, 'GPU' FROM GPU
    UNION ALL SELECT ProductID, 'RAM' FROM RAM
    UNION ALL SELECT ProductID, 'SSD' FROM SSD
    UNION ALL SELECT ProductID, 'Mainboard' FROM Mainboard
    UNION ALL SELECT ProductID, 'PSU' FROM PSU
    UNION ALL SELECT ProductID, 'Case' FROM `Case`
    UNION ALL SELECT ProductID, 'Cooler' FROM Cooler
), ProductIssues AS (
    SELECT p.ProductID, 'SPEC_TYPE_OR_COUNT' AS Issue
    FROM Products p JOIN Categories c ON c.CategoryID = p.CategoryID
    LEFT JOIN ComponentRows d ON d.ProductID = p.ProductID
    GROUP BY p.ProductID, p.IsActive, c.CategoryName
    HAVING (p.IsActive = 1 AND COUNT(d.ProductID) <> 1)
        OR COUNT(d.ProductID) > 1
        OR SUM(CASE WHEN d.ProductID IS NOT NULL AND d.ExpectedCategory <> c.CategoryName THEN 1 ELSE 0 END) > 0
    UNION ALL
    SELECT p.ProductID, 'MISSING_BENCHMARK'
    FROM Products p JOIN Categories c ON c.CategoryID = p.CategoryID
    LEFT JOIN Benchmark b ON b.ProductID = p.ProductID
    WHERE p.IsActive = 1 AND c.CategoryName IN ('CPU', 'GPU') AND b.BenchmarkID IS NULL
    UNION ALL
    SELECT p.ProductID, 'BENCHMARK_WRONG_CATEGORY'
    FROM Products p JOIN Categories c ON c.CategoryID = p.CategoryID
    JOIN Benchmark b ON b.ProductID = p.ProductID
    WHERE c.CategoryName NOT IN ('CPU', 'GPU')
)
SELECT p.ProductCode, i.Issue FROM ProductIssues i
JOIN Products p ON p.ProductID = i.ProductID
ORDER BY p.ProductCode, i.Issue;

-- Khong tron bai do/phien ban trong cung nhom CPU hoac GPU.
SELECT c.CategoryName, 'MIXED_BENCHMARK_TESTS' AS Issue
FROM Benchmark b JOIN Products p ON p.ProductID = b.ProductID
JOIN Categories c ON c.CategoryID = p.CategoryID
WHERE p.IsActive = 1 AND c.CategoryName IN ('CPU', 'GPU')
GROUP BY c.CategoryName
HAVING COUNT(DISTINCT b.TestName, b.TestVersion) > 1;

-- Cac rang buoc lien bang don gian do import/API/DSS can kiem tra truoc khi luu.
SELECT r.RecommendationID, 'INVALID_RECOMMENDATION' AS Issue
FROM Recommendation r
JOIN Requirement q ON q.RequirementID = r.RequirementID
JOIN CPU cpu ON cpu.CPU_ID = r.CPU_ID
JOIN Mainboard m ON m.Mainboard_ID = r.Mainboard_ID
JOIN RAM ram ON ram.RAM_ID = r.RAM_ID
JOIN SSD s ON s.SSD_ID = r.SSD_ID
JOIN PSU psu ON psu.PSU_ID = r.PSU_ID
JOIN `Case` ca ON ca.Case_ID = r.Case_ID
LEFT JOIN GPU gpu ON gpu.GPU_ID = r.GPU_ID
LEFT JOIN Cooler co ON co.CoolerID = r.CoolerID
WHERE r.TotalPrice > q.Budget
    OR cpu.Socket <> m.Socket
    OR ram.RamType <> m.RamType
    OR ram.ModuleCount > m.RamSlots OR ram.KitCapacityGb > m.MaxRamGb
    OR ram.KitCapacityGb < 16 OR s.CapacityGb < 500
    OR s.Interface <> 'NVME' OR s.FormFactor <> 'M.2-2280' OR m.SupportsNvme2280 = 0
    OR FIND_IN_SET(m.FormFactor, REPLACE(ca.MotherboardSupport, '|', ',')) = 0
    OR psu.FormFactor <> ca.PsuFormFactor
    OR (r.GPU_ID IS NULL AND (q.Purpose = 'Gaming' OR cpu.HasIntegratedGPU = 0 OR m.HasDisplayOutput = 0))
    OR (r.GPU_ID IS NOT NULL AND (psu.Watt < gpu.RecommendedPsuW
        OR gpu.LengthMm IS NULL OR ca.GpuMaxLengthMm IS NULL OR gpu.LengthMm > ca.GpuMaxLengthMm))
    OR (r.CoolerID IS NULL AND cpu.HasBoxCooler = 0)
    OR (r.CoolerID IS NOT NULL AND (
        FIND_IN_SET(cpu.Socket, REPLACE(co.SocketSupport, '|', ',')) = 0
        OR ca.CoolerMaxHeightMm IS NULL OR co.HeightMm > ca.CoolerMaxHeightMm));
