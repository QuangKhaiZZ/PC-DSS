using System.Text.Json;
using System.Text.Json.Serialization;

namespace PcDss.Api.Models;

public sealed class TrainedModel
{
    [JsonPropertyName("model_version")]
    public string Version { get; init; } = "";
    [JsonPropertyName("target")]
    public string Target { get; init; } = "";
    [JsonPropertyName("feature_order")]
    public string[] FeatureOrder { get; init; } = [];
    [JsonPropertyName("coefficients")]
    public Dictionary<string, double> Coefficients { get; init; } = [];
    [JsonPropertyName("intercept")]
    public double Intercept { get; init; }
    [JsonPropertyName("training_ranges")]
    public Dictionary<string, FeatureRange> Ranges { get; init; } = [];

    public static TrainedModel Load(string path, bool gaming)
    {
        var json = File.ReadAllText(path);
        using var document = JsonDocument.Parse(json);
        if (!gaming && !document.RootElement.TryGetProperty("intercept", out _))
            throw new InvalidDataException($"Thiếu intercept của model render: {path}");
        var model = JsonSerializer.Deserialize<TrainedModel>(json)
            ?? throw new InvalidDataException($"Model rỗng: {path}");
        string[] expected = gaming ? ["GpuScore", "CpuMultiScore"]
            : ["GpuScore", "CpuMultiScore", "IsIntel", "GpuGeneration", "IsUltra", "IsWindows11"];
        var requiredCoefficients = gaming ? new[] { "A", "b", "c" } : expected;
        if (string.IsNullOrWhiteSpace(model.Version) || string.IsNullOrWhiteSpace(model.Target)
            || !model.FeatureOrder.SequenceEqual(expected)
            || !model.Coefficients.Keys.Order().SequenceEqual(requiredCoefficients.Order())
            || model.Coefficients.Values.Any(x => !double.IsFinite(x))
            || !double.IsFinite(model.Intercept)
            || expected.Any(k => !model.Ranges.TryGetValue(k, out var r)
                || !double.IsFinite(r.Min) || !double.IsFinite(r.Max) || r.Min > r.Max)
            || (gaming && (model.Coefficients["A"] <= 0 || model.Coefficients["b"] < 0 || model.Coefficients["c"] < 0)))
            throw new InvalidDataException($"Model không đúng cấu trúc được hỗ trợ: {path}");
        return model;
    }
}

public sealed record FeatureRange(
    [property: JsonPropertyName("min")] double Min,
    [property: JsonPropertyName("max")] double Max);
