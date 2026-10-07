import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Monitor, Gamepad2, Settings2, ClipboardList, CheckCircle2, AlertTriangle, Info, Loader2, PackageSearch } from "lucide-react";
import Button from "../components/Button";
import { getRecommendations, getPcImageUrl } from "../services/recommendationService";
import { PRICE_RANGES, MAX_API_BUDGET, getPriceRangeLabel } from "../constants/recommendationPriceRanges";
/* ─── Hằng số ────────────────────────────────────────────────── */
const PURPOSES = ["Gaming", "Rendering"];

const INITIAL_FORM = { purpose: "Gaming", priceRangeId: "", topCount: 3 };

/* ─── Helpers ─────────────────────────────────────────────────── */
function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function validateForm(form) {
  if (!PRICE_RANGES.some((range) => range.id === form.priceRangeId))
    return "Vui lòng chọn khoảng giá phù hợp.";
  if (!PURPOSES.includes(form.purpose))
    return "Mục đích sử dụng không hợp lệ.";
  if (!Number.isInteger(form.topCount) || form.topCount < 1 || form.topCount > 3)
    return "Số lượng gợi ý phải từ 1 đến 3.";
  return null;
}

/* ─── Sub-components ──────────────────────────────────────────── */
function WarningList({ warnings }) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <ul className="warning-list">
      {warnings.map((w, i) => (
        <li key={i}>
          <AlertTriangle size={12} />
          {w}
        </li>
      ))}
    </ul>
  );
}

function PcImage({ pc }) {
  const src = getPcImageUrl(pc.imageUrl);
  const [failedSrc, setFailedSrc] = useState(null);
  return (
    <div className="ranked-pc-image">
      {src && failedSrc !== src ? (
        <img src={src} alt={`Ảnh ${pc.productName}`} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} />
      ) : (
        <div className="pc-image-placeholder"><Monitor size={36} aria-hidden="true" /><span>Chưa có ảnh sản phẩm</span></div>
      )}
    </div>
  );
}

function RankedPcCard({ item, showUpperBoundDifference }) {
  const { rank, pc, prediction, budgetRemainingVnd, reason } = item;
  const specs = [
    { type: "CPU", value: pc.cpuModel },
    { type: "GPU", value: pc.gpuModel },
    { type: "RAM", value: `${pc.ramCapacityGb} GB` },
    { type: "SSD", value: `${pc.ssdCapacityGb} GB` },
  ];

  return (
    <article className="ranked-pc-card" aria-label={`Hạng ${rank}: ${pc.productName}`}>
      {/* Header */}
      <div className="ranked-pc-header">
        <span className="rank-badge">#{rank}</span>
        <div className="ranked-pc-title">
          <h3>{pc.productName}</h3>
          <span className="store-label">{pc.store}</span>
        </div>
        <PcImage pc={pc} />
        <div className="ranked-pc-score">
          <span className="score-label">{prediction.target}</span>
          <strong className="score-value">
            {prediction.predictedScore.toFixed(1)}
          </strong>
        </div>
      </div>

      {/* Spec rows */}
      <div className="result-card" style={{ marginTop: 0, padding: "0 22px" }}>
        {specs.map(({ type, value }) => (
          <div className="spec-row" key={type}>

            <div>
              <span>{type}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Backend price and difference to the selected range's upper bound. */}
      <div className="ranked-pc-footer">
        <div className="price-block">
          <span>Giá niêm yết</span>
          <strong>{formatVnd(pc.priceVnd)}</strong>
        </div>
        {showUpperBoundDifference && <div className="price-block remaining">
          <span>Chênh lệch tới cận trên</span>
          <strong>{formatVnd(budgetRemainingVnd)}</strong>
        </div>}
      </div>

      {/* Reason */}
      <div className="reason-box" style={{ margin: "0 0 0 0" }}>
        <strong>Lý do xếp hạng</strong>
        <p>{reason}</p>
        {prediction.isExtrapolation && (
          <p className="extrapolation-note">
            <Info size={11} /> Kết quả này là ngoại suy — nằm ngoài phạm vi huấn luyện, độ chính xác chưa được kiểm chứng.
          </p>
        )}
      </div>

      {/* Warnings */}
      <WarningList warnings={prediction.warnings} />
      <p className="catalog-source">
        Kiểm tra: {pc.checkedAt}
        {/^https?:\/\//i.test(pc.sourceUrl) && (
          <> · <a href={pc.sourceUrl} target="_blank" rel="noopener noreferrer">Xem nguồn giá</a></>
        )}
      </p>
    </article>
  );
}

export function RecommendationSummary() {
  const features = [
    { title: "Điểm benchmark dự đoán", text: "Hiệu năng ước tính theo nhu cầu sử dụng." },
    { title: "Giá trong khoảng đã chọn", text: "Giá niêm yết của cấu hình phù hợp với khoảng ngân sách." },
    { title: "Lý do xếp hạng", text: "Giải thích vì sao cấu hình được đề xuất." },
    { title: "Cảnh báo (nếu có)", text: "Các điểm cần lưu ý từ kết quả dự đoán." },
  ];
  return (
    <section className="recommend-preview" aria-labelledby="recommend-preview-title">
      <div className="recommend-card-heading"><ClipboardList size={26} aria-hidden="true" /><div><h2 id="recommend-preview-title">Bạn sẽ nhận được gì?</h2><p>Hệ thống phân tích dữ liệu và gợi ý cấu hình phù hợp với nhu cầu và khoảng giá bạn chọn. Mỗi kết quả bao gồm:</p></div></div>
      <ul className="preview-features">
        {features.map(({ title, text }) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}
      </ul>
      <p className="preview-disclaimer">Thông số CPU, GPU, RAM, SSD và nguồn giá được hiển thị trong kết quả thực tế bên dưới.</p>
    </section>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
export default function Recommendation() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(() => {
    const purpose = searchParams.get("purpose");
    return { ...INITIAL_FORM, purpose: PURPOSES.includes(purpose) ? purpose : INITIAL_FORM.purpose };
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success-empty | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [formError, setFormError] = useState("");

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const selectedRange = PRICE_RANGES.find((range) => range.id === form.priceRangeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;

    // Client-side validation
    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError("");

    // Reset trạng thái cũ, bắt đầu loading
    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const data = await getRecommendations({
        minBudget: selectedRange.minBudget,
        budget: selectedRange.budget,
        purpose: form.purpose,
        topCount: Number(form.topCount),
      });
      setResult(data);
      setStatus(data.items.length === 0 ? "success-empty" : "success");
    } catch (err) {
      setErrorMsg(err.message || "Lỗi không xác định từ API.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
    setFormError("");
  };

  const isLoading = status === "loading";

  return (
    <div className="recommendation-page">
      {/* ─── Page title ─── */}
      <div className="page-title">
        <div>
          <nav className="recommend-breadcrumb" aria-label="Breadcrumb"><Link to="/">PC DSS</Link><ArrowRight size={12} aria-hidden="true" /><span>Tư vấn cấu hình</span></nav>
          <h1>Tư vấn cấu hình <span>PC phù hợp</span></h1>
          <p>Chọn nhu cầu, khoảng giá và số lượng gợi ý để tìm cấu hình phù hợp với bạn.</p>
        </div>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={17} /> Trang chủ
        </Link>
      </div>

      <div className="recommend-layout">
        <form className="form-card" aria-label="Nhu cầu cấu hình PC" aria-busy={isLoading} onSubmit={handleSubmit} noValidate>
          <div className="form-section">
            <div className="recommend-section-heading"><span className="recommend-step">1</span><div><h3>Mục đích sử dụng</h3><p>Bạn sử dụng PC chủ yếu cho mục đích nào?</p></div></div>
            <div className="option-grid purpose-options" role="group" aria-label="Mục đích sử dụng">
              {PURPOSES.map((p) => (
                <button key={p} type="button" aria-label={p} aria-pressed={form.purpose === p} className={form.purpose === p ? "option selected" : "option"} onClick={() => set("purpose", p)} disabled={isLoading}>
                  {p === "Gaming" ? <Gamepad2 size={27} aria-hidden="true" /> : <Monitor size={27} aria-hidden="true" />}
                  <span><strong>{p}</strong><small>{p === "Gaming" ? "Chơi game, giải trí" : "Dựng hình, trực quan hóa"}</small></span>
                  {form.purpose === p && <CheckCircle2 className="selection-check" size={16} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="recommend-section-heading"><span className="recommend-step">2</span><div><h3>Khoảng giá (VND)</h3><p>Chọn khoảng ngân sách phù hợp với bạn.</p></div></div>
            <div className="price-range-options" role="group" aria-label="Khoảng giá" aria-describedby={formError ? "form-error" : undefined}>
              {PRICE_RANGES.map(({ id, label }) => (
                <button key={id} type="button" aria-pressed={form.priceRangeId === id} className={form.priceRangeId === id ? "option selected" : "option"} onClick={() => set("priceRangeId", id)} disabled={isLoading}>{label}</button>
              ))}
            </div>
            {formError && <div id="form-error" role="alert" className="error-banner">{formError}</div>}
          </div>

          <div className="form-section">
            <div className="recommend-section-heading"><span className="recommend-step">3</span><div><h3>Số lượng gợi ý</h3><p>Bạn muốn xem bao nhiêu cấu hình được xếp hạng?</p></div></div>
            <div className="option-grid top-options" role="group" aria-label="Số lượng gợi ý">
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" aria-label={`Top ${n}`} aria-pressed={form.topCount === n} className={form.topCount === n ? "option selected" : "option"} onClick={() => set("topCount", n)} disabled={isLoading}>
                  Top {n}
                  {form.topCount === n && <CheckCircle2 size={14} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="btn btn-primary recommend-submit" disabled={isLoading} aria-label="Phân tích và gợi ý cấu hình">
            {isLoading ? <><Loader2 size={18} className="spin-icon" /> Đang phân tích...</> : <><Settings2 size={18} aria-hidden="true" /> Phân tích &amp; gợi ý cấu hình <ArrowRight size={18} aria-hidden="true" /></>}
          </Button>
          <div className="recommend-summary"><p>Bạn đang chọn: <strong>{form.purpose}</strong> • {selectedRange ? <strong>{selectedRange.label}</strong> : "chưa chọn khoảng giá"} • <strong>Top {form.topCount}</strong></p></div>
        </form>

        <aside className="recommend-aside" aria-label="Hướng dẫn tư vấn">
          <RecommendationSummary />
        </aside>
      </div>
      {/* ─── Results area ─── */}
      <p role="status" aria-live="polite" className="request-status">
        {status === "idle" && "Chọn mục đích và khoảng giá để bắt đầu tư vấn."}
        {isLoading && "Đang phân tích cấu hình, vui lòng chờ..."}
        {status === "success-empty" && "Không có cấu hình phù hợp."}
        {status === "success" && `Đã tìm thấy ${result.items.length} cấu hình đề xuất.`}
      </p>

      {/* Error */}
      {status === "error" && (
        <div role="alert" className="error-banner" style={{ marginTop: 24 }}>
          <AlertTriangle size={15} style={{ marginRight: 6, flexShrink: 0 }} />
          <span>
            <strong>Lỗi API:</strong> {errorMsg}
          </span>
        </div>
      )}

      {/* Success — no items */}
      {status === "success-empty" && (
        <div
          className="empty"
          style={{
            minHeight: 200,
            marginTop: 24,
            background: "#fff",
            border: "1px solid #DCE7F3",
            borderRadius: 15,
          }}
        >
          <PackageSearch size={40} />
          <strong>Không có cấu hình phù hợp</strong>
          <span>{result.message}</span>
          <span style={{ fontSize: 10, color: "#64748B", marginTop: 4 }}>
            Khoảng giá: {getPriceRangeLabel(result.minBudget, result.budget)} · Đủ điều kiện: {result.eligiblePcCount}/{result.totalPcCount} PC
          </span>
          <Button
            variant="secondary"
            onClick={handleReset}
            style={{ marginTop: 12 }}
          >
            Điều chỉnh nhu cầu
          </Button>
        </div>
      )}

      {/* Success — has items */}
      {status === "success" && (
        <section aria-label="Cấu hình đề xuất" style={{ marginTop: 24 }}>
          {/* Result header */}
          <div className="result-top">
            <div>
              <span className="eyebrow">KẾT QUẢ DSS</span>
              <h2>Kết quả gợi ý</h2>
              <p>
                {result.purpose} · Khoảng giá: {getPriceRangeLabel(result.minBudget, result.budget)} ·{" "}
                {result.eligiblePcCount}/{result.totalPcCount} PC đủ điều kiện
                {result.operatingSystemAssumption && (
                  <> · Giả định OS: {result.operatingSystemAssumption}</>
                )}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleReset}
              aria-label="Điều chỉnh nhu cầu"
            >
              Điều chỉnh nhu cầu
            </Button>
          </div>

          {/* Ranked PC cards */}
          <div className="ranked-list">
            {result.items.map((item) => (
              <RankedPcCard key={item.pc.pcId} item={item} showUpperBoundDifference={result.budget !== MAX_API_BUDGET} />
            ))}
          </div>

        </section>
      )}

      {(status === "success" || status === "success-empty") && (
        <section aria-label="Thông tin kết quả DSS">
          <div className="reason-box" style={{ marginTop: 16 }}>
            <p>{result.purpose} · Mô hình: {result.modelVersion} · Chỉ số: {result.target}</p>
            {result.operatingSystemAssumption && <p>Giả định OS: {result.operatingSystemAssumption}</p>}
            <strong>Quy tắc xếp hạng</strong>
            <p>{result.rankingRule}</p>
            {status === "success" && <p style={{ marginTop: 6 }}>{result.message}</p>}
          </div>
          {result.excluded.length > 0 && (
            <details className="reason-box">
              <summary>PC bị loại ({result.excluded.length})</summary>
              <ul>
                {result.excluded.map((pc) => <li key={pc.pcId}>{pc.pcId} · {pc.code}: {pc.reason}</li>)}
              </ul>
            </details>
          )}
        </section>
      )}
    </div>
  );
}
