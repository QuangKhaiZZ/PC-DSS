using PcDss.Api.DTOs.PcCatalog;
using PcDss.Api.DTOs.Recommendations;

namespace PcDss.Api.Services;

public sealed class RecommendationService(CatalogService catalog, PredictionService predictor)
{
    public RecommendationResponse Recommend(RecommendationRequest request)
    {
        var model = predictor.Model(request.Purpose);
        var eligible = new List<(PcCatalogItem Pc, PredictionResult Prediction)>();
        var excluded = new List<ExcludedPc>();
        foreach (var pc in catalog.Items)
        {
            if (pc.PriceVnd > request.Budget)
            {
                excluded.Add(new(pc.PcId, "OVER_BUDGET", "Giá vượt ngân sách."));
                continue;
            }
            if (pc.Availability == "OUT_OF_STOCK")
            {
                excluded.Add(new(pc.PcId, "OUT_OF_STOCK", "Nguồn báo hết hàng."));
                continue;
            }
            try { eligible.Add((pc, predictor.Predict(pc, request.Purpose))); }
            catch (PredictionInputException ex) { excluded.Add(new(pc.PcId, "INVALID_MODEL_INPUT", ex.Message)); }
        }
        var ordered = eligible.OrderByDescending(x => x.Prediction.PredictedScore)
            .ThenBy(x => x.Pc.PriceVnd).ThenBy(x => x.Pc.PcId, StringComparer.Ordinal);
        var items = ordered.Take(request.TopCount).Select((x, i) => new RankedPc(
            i + 1, x.Pc, x.Prediction, request.Budget - x.Pc.PriceVnd,
            $"Trong ngân sách; xếp thứ {i + 1} theo điểm {model.Target} dự đoán trong các bộ đủ điều kiện."
            + (x.Prediction.IsExtrapolation ? " Kết quả này là ngoại suy." : ""))).ToArray();
        return new(request.Budget, request.Purpose, model.Version, model.Target,
            request.Purpose == "Rendering" ? "Windows 11" : null,
            catalog.Items.Count, eligible.Count,
            "Điểm dự đoán giảm dần; bằng điểm ưu tiên giá thấp hơn, sau đó PcId. UNKNOWN được giữ kèm cảnh báo.",
            items.Length == 0 ? "Không có bộ PC đủ điều kiện trong ngân sách." : "Giá tham khảo theo nguồn; xem cảnh báo trên từng bộ.",
            items, excluded);
    }
}
