// RecommendationRequest accepts integer VND with inclusive lower/upper bounds.
export const MAX_API_BUDGET = 999_999_999_999_999;

export const PRICE_RANGES = [
  { id: "10-15", label: "10 – dưới 15 triệu", minBudget: 10_000_000, budget: 14_999_999 },
  { id: "15-20", label: "15 – dưới 20 triệu", minBudget: 15_000_000, budget: 19_999_999 },
  { id: "20-25", label: "20 – dưới 25 triệu", minBudget: 20_000_000, budget: 24_999_999 },
  { id: "25-35", label: "25 – dưới 35 triệu", minBudget: 25_000_000, budget: 34_999_999 },
  { id: "35-45", label: "35 – dưới 45 triệu", minBudget: 35_000_000, budget: 44_999_999 },
  { id: "45-60", label: "45 – dưới 60 triệu", minBudget: 45_000_000, budget: 59_999_999 },
  // Use the DTO's maximum for the open-ended range, not an arbitrary price cap.
  { id: "60-plus", label: "Từ 60 triệu trở lên", minBudget: 60_000_000, budget: MAX_API_BUDGET },
];

export function getPriceRangeLabel(minBudget, budget) {
  const range = PRICE_RANGES.find((r) => r.minBudget === minBudget && r.budget === budget);
  if (range) return range.label;
  const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
  return `${vnd.format(minBudget)} – ${vnd.format(budget)}`;
}
