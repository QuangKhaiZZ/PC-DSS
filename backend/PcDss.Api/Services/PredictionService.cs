using System.Text.RegularExpressions;
using PcDss.Api.Data;
using PcDss.Api.DTOs.PcCatalog;
using PcDss.Api.DTOs.Recommendations;
using PcDss.Api.Models;

namespace PcDss.Api.Services;

public sealed class PredictionInputException(string message) : Exception(message);

public sealed class PredictionService
{
    private sealed record Reference(string Id, double Score);
    private readonly Dictionary<string, Reference> _references = new();
    private readonly TrainedModel _gaming;
    private readonly TrainedModel _rendering;

    public PredictionService(string dataDirectory)
    {
        _gaming = TrainedModel.Load(Path.Combine(dataDirectory, "gaming", "model_info.json"), true);
        _rendering = TrainedModel.Load(Path.Combine(dataDirectory, "rendering", "model_info.json"), false);
        var rows = CsvTable.Read(Path.Combine(dataDirectory, "reference.csv"),
            ["ReferenceId", "ComponentType", "ModelName", "Metric", "RawScore", "SourceUrl", "CheckedAt"]);
        var ids = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var r in rows)
        {
            var type = CsvTable.Required(r, "ComponentType");
            if (type is not ("CPU" or "GPU") || r["Metric"] != (type == "CPU" ? "CPU Mark" : "G3D Mark"))
                throw new InvalidDataException("Reference phải là CPU Mark hoặc G3D Mark đúng loại linh kiện");
            var name = CsvTable.Required(r, "ModelName");
            var id = CsvTable.Required(r, "ReferenceId");
            CsvTable.Url(r, "SourceUrl");
            CsvTable.Date(r, "CheckedAt");
            if (!ids.Add(id) || !_references.TryAdd(type + ":" + Normalize(name),
                    new Reference(id, (double)CsvTable.PositiveInteger(r, "RawScore"))))
                throw new InvalidDataException($"Reference bị trùng: {id} / {name}");
        }
    }

    // Preserve CPU suffixes and GPU VRAM variants; never fuzzy-match 6GB to 8GB.
    private static string Normalize(string value) =>
        Regex.Replace(value.ToLowerInvariant().Split('@')[0]
            .Replace("processor", "").Replace("nvidia", ""), "[^a-z0-9]", "");

    public TrainedModel Model(string purpose) => purpose switch
    {
        "Gaming" => _gaming,
        "Rendering" => _rendering,
        _ => throw new ArgumentException("Purpose phải là Gaming hoặc Rendering")
    };

    private Reference FindReference(string type, string name)
    {
        if (_references.TryGetValue(type + ":" + Normalize(name), out var reference)) return reference;
        throw new PredictionInputException($"Không tìm thấy reference chính xác cho {type}: {name}");
    }

    public PredictionResult Predict(PcCatalogItem pc, string purpose)
    {
        var model = Model(purpose);
        var cpu = FindReference("CPU", pc.CpuModel);
        var gpu = FindReference("GPU", pc.GpuModel);
        var features = new Dictionary<string, double>
        {
            ["GpuScore"] = gpu.Score, ["CpuMultiScore"] = cpu.Score
        };
        var warnings = new List<string>();
        if (purpose == "Rendering")
        {
            // The exported model only defines these Nvidia RTX generations and CPU families.
            var match = Regex.Match(pc.GpuModel, @"(?i)rtx\s*(30|40|50)\d{2}");
            var intel = pc.CpuModel.Contains("Intel", StringComparison.OrdinalIgnoreCase);
            if (!match.Success || (!intel && !pc.CpuModel.Contains("AMD", StringComparison.OrdinalIgnoreCase)))
                throw new PredictionInputException("Chưa hỗ trợ tạo đặc trưng render cho dòng CPU/GPU này");
            features["IsIntel"] = intel ? 1 : 0;
            features["GpuGeneration"] = int.Parse(match.Groups[1].Value);
            features["IsUltra"] = pc.CpuModel.Contains("Ultra", StringComparison.OrdinalIgnoreCase) ? 1 : 0;
            features["IsWindows11"] = 1;
            warnings.Add("Dự đoán theo giả định Windows 11, không xác nhận hệ điều hành bán kèm.");
        }
        var outside = model.FeatureOrder.Where(k =>
            features[k] < model.Ranges[k].Min || features[k] > model.Ranges[k].Max).ToArray();
        if (outside.Length > 0)
            warnings.Add("Ngoại suy ngoài phạm vi train: " + string.Join(", ", outside) + ". Độ chính xác chưa được kiểm chứng.");
        if (pc.Availability == "UNKNOWN") warnings.Add("Chưa xác nhận tồn kho; cần kiểm tra với cửa hàng.");
        if (pc.Availability == "OUT_OF_STOCK") warnings.Add("Nguồn báo hết hàng; chỉ tính thử, không đưa vào đề xuất.");
        var c = model.Coefficients;
        var score = purpose == "Gaming"
            ? c["A"] * Math.Pow(gpu.Score, c["b"]) * Math.Pow(cpu.Score, c["c"])
            : model.Intercept + model.FeatureOrder.Sum(k => c[k] * features[k]);
        if (!double.IsFinite(score) || score <= 0)
            throw new PredictionInputException("Model trả điểm không hợp lệ cho cấu hình này");
        return new PredictionResult(pc.PcId, purpose, model.Version, model.Target, score,
            purpose == "Rendering" ? "Windows 11" : null, cpu.Id, gpu.Id,
            features, outside.Length > 0, warnings);
    }
}
