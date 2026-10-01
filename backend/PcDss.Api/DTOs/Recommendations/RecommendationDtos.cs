using System.ComponentModel.DataAnnotations;
using PcDss.Api.DTOs.PcCatalog;

namespace PcDss.Api.DTOs.Recommendations;

public sealed class RecommendationRequest : IValidatableObject
{
    [Range(typeof(decimal), "1", "999999999999999")]
    public decimal Budget { get; set; }

    [Required, RegularExpression("^(Gaming|Rendering)$")]
    public string Purpose { get; set; } = string.Empty;

    [Range(1, 3)]
    public int TopCount { get; set; } = 3;

    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (Budget != decimal.Truncate(Budget))
            yield return new ValidationResult("Ngân sách VNĐ phải là số nguyên.", [nameof(Budget)]);
    }
}

public sealed record PredictionResult(
    string PcId, string Purpose, string ModelVersion, string Target,
    double PredictedScore, string? OperatingSystemAssumption,
    string CpuReferenceId, string GpuReferenceId,
    IReadOnlyDictionary<string, double> Features, bool IsExtrapolation,
    IReadOnlyList<string> Warnings);

public sealed record RankedPc(int Rank, PcCatalogItem Pc, PredictionResult Prediction,
    decimal BudgetRemainingVnd, string Reason);
public sealed record ExcludedPc(string PcId, string Code, string Reason);
public sealed record RecommendationResponse(decimal Budget, string Purpose,
    string ModelVersion, string Target, string? OperatingSystemAssumption,
    int TotalPcCount, int EligiblePcCount, string RankingRule, string Message,
    IReadOnlyList<RankedPc> Items, IReadOnlyList<ExcludedPc> Excluded);
