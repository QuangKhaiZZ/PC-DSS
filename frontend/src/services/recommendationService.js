const BASE = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5170"
).trim().replace(/\/+$/, "");

/**
 * POST /api/recommendations
 *
 * @param {{ budget: number, purpose: "Gaming"|"Rendering", topCount: number }} params
 * @throws {Error} với message từ backend hoặc HTTP status khi request thất bại
 */
export async function getRecommendations({ budget, purpose, topCount }) {
  const response = await fetch(`${BASE}/api/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ budget, purpose, topCount }),
  });

  if (!response.ok) {
    // Cố parse JSON error body (ASP.NET ProblemDetails / validation errors)
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      // ASP.NET trả về { errors: { Budget: [...] } } hoặc { message: "..." }
      if (body?.errors) {
        const msgs = Object.values(body.errors).flat();
        message = msgs.join(" | ");
      } else if (body?.message) {
        message = body.message;
      } else if (body?.detail) {
        message = body.detail;
      } else if (body?.title) {
        message = body.title;
      }
    } catch {
      // không parse được, giữ nguyên HTTP status
    }
    throw new Error(message);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("API trả về dữ liệu không phải JSON hợp lệ.");
  }
  // Reject incompatible responses instead of showing a blank result or crashing JSX.
  if (
    !data || !Array.isArray(data.items) || !Array.isArray(data.excluded) ||
    !Number.isFinite(data.budget) || !["Gaming", "Rendering"].includes(data.purpose) ||
    !Number.isInteger(data.totalPcCount) || !Number.isInteger(data.eligiblePcCount) ||
    ![data.modelVersion, data.target, data.rankingRule, data.message].every(value => typeof value === "string") ||
    !(data.operatingSystemAssumption == null || typeof data.operatingSystemAssumption === "string") ||
    !data.items.every(item => item && validItem(item)) ||
    !data.excluded.every(pc => pc && [pc.pcId, pc.code, pc.reason].every(value => typeof value === "string"))
  ) {
    throw new Error("Response API không đúng contract recommendation.");
  }
  return data;
}

function validItem({ rank, pc, prediction, budgetRemainingVnd, reason }) {
  return Number.isInteger(rank) && pc && prediction &&
    [pc.pcId, pc.productName, pc.store, pc.cpuModel, pc.gpuModel,
      pc.availability, pc.checkedAt, pc.sourceUrl, prediction.target, reason].every(value => typeof value === "string") &&
    [pc.priceVnd, pc.ramCapacityGb, pc.ssdCapacityGb, prediction.predictedScore, budgetRemainingVnd].every(Number.isFinite) &&
    typeof prediction.isExtrapolation === "boolean" &&
    Array.isArray(prediction.warnings) && prediction.warnings.every(value => typeof value === "string");
}
