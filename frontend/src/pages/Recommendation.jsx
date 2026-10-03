import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Monitor, Gamepad2, Settings2, ClipboardList, CheckCircle2, AlertTriangle, Info, Loader2, PackageSearch } from "lucide-react";
import Button from "../components/Button";
import { getRecommendations } from "../services/recommendationService";
/* ─── Hằng số ────────────────────────────────────────────────── */
const PURPOSES = ["Gaming", "Rendering"];

const BUDGET_PRESETS = [
  { label: "10 triệu",  value: 10_000_000 },
  { label: "15 triệu",  value: 15_000_000 },
  { label: "20 triệu",  value: 20_000_000 },
  { label: "25 triệu",  value: 25_000_000 },
  { label: "30 triệu",  value: 30_000_000 },
  { label: "40 triệu",  value: 40_000_000 },
  { label: "50 triệu",  value: 50_000_000 },
];

const INITIAL_FORM = { purpose: "Gaming", budget: "", topCount: 3 };

/* ─── Helpers ─────────────────────────────────────────────────── */
function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function validateForm(form) {
  const budget = Number(form.budget);
  if (!form.budget || !Number.isFinite(budget) || budget <= 0)
    return "Vui lòng nhập ngân sách hợp lệ (số nguyên dương VNĐ).";
  if (!Number.isInteger(budget))
    return "Ngân sách VNĐ phải là số nguyên.";
  if (budget > 999_999_999_999_999)
    return "Ngân sách không được vượt quá 999.999.999.999.999 VNĐ.";
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

function RankedPcCard({ item }) {
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

      {/* Price & remaining */}
      <div className="ranked-pc-footer">
        <div className="price-block">
          <span>Giá niêm yết</span>
          <strong>{formatVnd(pc.priceVnd)}</strong>
        </div>
        <div className="price-block remaining">
          <span>Còn dư ngân sách</span>
          <strong>{formatVnd(budgetRemainingVnd)}</strong>
        </div>
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
        {pc.pcId} · {pc.availability} · Kiểm tra: {pc.checkedAt}
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
    { title: "Giá và ngân sách còn lại", text: "Tổng chi phí và số tiền còn dư trong ngân sách." },
    { title: "Lý do xếp hạng", text: "Giải thích vì sao cấu hình được đề xuất." },
    { title: "Cảnh báo (nếu có)", text: "Các điểm cần lưu ý từ kết quả dự đoán." },
  ];
  return (
    <section className="recommend-preview" aria-labelledby="recommend-preview-title">
      <div className="recommend-card-heading"><ClipboardList size={26} aria-hidden="true" /><div><h2 id="recommend-preview-title">Bạn sẽ nhận được gì?</h2><p>Hệ thống phân tích dữ liệu và gợi ý cấu hình phù hợp với nhu cầu và ngân sách của bạn. Mỗi kết quả bao gồm:</p></div></div>
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
        budget: Number(form.budget),
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
          <p>Chọn nhu cầu, ngân sách tối đa và số lượng gợi ý để tìm cấu hình phù hợp với bạn.</p>
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
            <div className="recommend-section-heading"><span className="recommend-step">2</span><div><h3>Ngân sách tối đa (VND)</h3><p>Chọn mức nhanh hoặc nhập số tiền cụ thể.</p></div></div>
            <div className="budget-presets" role="group" aria-label="Mức ngân sách nhanh">
              {BUDGET_PRESETS.map(({ label, value }) => (
                <button key={value} type="button" aria-pressed={Number(form.budget) === value} className={Number(form.budget) === value ? "option selected" : "option"} onClick={() => set("budget", value)} disabled={isLoading}>{label}</button>
              ))}
            </div>
            <label htmlFor="budget-input" className="recommend-budget-label">Nhập ngân sách thủ công</label>
            <div className="recommend-budget-input"><input id="budget-input" type="number" min="1" max="999999999999999" step="1" required placeholder="Ví dụ: 25000000" value={form.budget} onChange={(e) => set("budget", e.target.value)} disabled={isLoading} aria-label="Ngân sách VNĐ" aria-invalid={Boolean(formError)} aria-describedby={formError ? "budget-help form-error" : "budget-help"} /><span>VNĐ</span></div>
            <p id="budget-help" className="recommend-helper">Hệ thống sẽ tìm các cấu hình có giá không vượt quá ngân sách này.</p>
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
          <div className="recommend-summary"><p>Bạn đang chọn: <strong>{form.purpose}</strong> • {form.budget && Number.isFinite(Number(form.budget)) && Number(form.budget) > 0 ? <>tối đa <strong>{Number(form.budget) % 1_000_000 === 0 ? `${Number(form.budget) / 1_000_000} triệu` : formatVnd(Number(form.budget))}</strong></> : "chưa nhập ngân sách"} • <strong>Top {form.topCount}</strong></p></div>
        </form>

        <aside className="recommend-aside" aria-label="Hướng dẫn tư vấn">
          <RecommendationSummary />
        </aside>
      </div>
      {/* ─── Results area ─── */}
      <p role="status" aria-live="polite" className="request-status">
        {status === "idle" && "Chọn mục đích và nhập ngân sách để bắt đầu tư vấn."}
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
            Ngân sách: {formatVnd(result.budget)} · Đủ điều kiện: {result.eligiblePcCount}/{result.totalPcCount} PC
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
                {result.purpose} · Ngân sách {formatVnd(result.budget)} ·{" "}
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
              <RankedPcCard key={item.pc.pcId} item={item} />
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
