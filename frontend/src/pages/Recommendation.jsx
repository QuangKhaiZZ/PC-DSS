import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Cpu, Monitor, MemoryStick, HardDrive, Zap, Gauge } from "lucide-react";
import Button from "../components/Button";

const initial = {
  purpose: "Gaming",
  budget: "20 - 30 triệu",
  cpu: "Ưu tiên hiệu năng",
  gpu: "Ưu tiên hiệu năng",
  ram: "32 GB",
  storage: "1 TB SSD",
};

const result = [
  ["CPU", "AMD Ryzen 7 7700", "8 Core / 16 Thread", Cpu],
  ["GPU", "NVIDIA GeForce RTX 4060 Ti", "8 GB GDDR6", Monitor],
  ["RAM", "32 GB DDR5 6000 MHz", "2 × 16 GB", MemoryStick],
  ["SSD", "1 TB NVMe Gen4", "Đọc nhanh ~7.000 MB/s", HardDrive],
  ["PSU", "650W 80+ Bronze", "Công suất phù hợp", Zap],
];

export default function Recommendation() {
  const [form, setForm] = useState(initial);
  const [submitted, setSubmitted] = useState(false);

  const set = (key, value) => setForm({...form, [key]: value});

  return (
    <div>
      <div className="page-title">
        <div><span className="eyebrow">DSS RECOMMENDATION</span><h2>Tư vấn cấu hình PC</h2><p>Nhập nhu cầu để hệ thống đưa ra cấu hình phù hợp.</p></div>
        <Link to="/" className="btn btn-secondary"><ArrowLeft size={17}/> Trang chủ</Link>
      </div>

      {!submitted ? (
        <div className="recommend-layout">
          <div className="form-card">
            <div className="form-section">
              <h3>1. Nhu cầu sử dụng</h3>
              <div className="option-grid">
                {["Gaming", "Văn phòng", "Đồ họa", "Lập trình"].map(x =>
                  <button key={x} className={form.purpose === x ? "option selected" : "option"} onClick={() => set("purpose", x)}>{x}</button>
                )}
              </div>
            </div>
            <div className="form-section">
              <h3>2. Ngân sách</h3>
              <select value={form.budget} onChange={e => set("budget", e.target.value)}>
                <option>Dưới 15 triệu</option><option>15 - 20 triệu</option><option>20 - 30 triệu</option><option>30 - 50 triệu</option><option>Trên 50 triệu</option>
              </select>
            </div>
            <div className="form-section two-cols">
              <label>CPU<select value={form.cpu} onChange={e=>set("cpu",e.target.value)}><option>Ưu tiên hiệu năng</option><option>Cân bằng giá/hiệu năng</option><option>Tiết kiệm</option></select></label>
              <label>GPU<select value={form.gpu} onChange={e=>set("gpu",e.target.value)}><option>Ưu tiên hiệu năng</option><option>Cân bằng giá/hiệu năng</option><option>Tiết kiệm</option></select></label>
              <label>RAM<select value={form.ram} onChange={e=>set("ram",e.target.value)}><option>16 GB</option><option>32 GB</option><option>64 GB</option></select></label>
              <label>Storage<select value={form.storage} onChange={e=>set("storage",e.target.value)}><option>500 GB SSD</option><option>1 TB SSD</option><option>2 TB SSD</option></select></label>
            </div>
            <Button onClick={() => setSubmitted(true)}>Phân tích & gợi ý <ArrowRight size={17}/></Button>
          </div>

          <div className="tip-card">
            <Gauge size={30}/>
            <h3>Hệ thống DSS hoạt động thế nào?</h3>
            <p>Các tiêu chí bạn nhập sẽ được sử dụng làm đầu vào cho mô hình ra quyết định. Kết quả có thể được tích hợp với thuật toán tính điểm/trọng số ở backend.</p>
            <div className="mini-flow"><span>01</span> Nhu cầu → <span>02</span> Tiêu chí → <span>03</span> Chấm điểm → <span>04</span> Gợi ý</div>
          </div>
        </div>
      ) : (
        <div>
          <div className="result-top">
            <div><span className="eyebrow">KẾT QUẢ DSS</span><h2>Cấu hình đề xuất</h2><p>{form.purpose} · Ngân sách {form.budget}</p></div>
            <div className="match-score"><span>MỨC ĐỘ PHÙ HỢP</span><strong>94%</strong><small>Rất phù hợp</small></div>
          </div>
          <div className="result-card">
            {result.map(([type, name, spec, Icon]) => (
              <div className="spec-row" key={type}>
                <div className="spec-icon"><Icon size={21}/></div>
                <div><span>{type}</span><strong>{name}</strong><small>{spec}</small></div>
                <CheckCircle2 className="check" size={20}/>
              </div>
            ))}
            <div className="reason-box"><strong>Vì sao cấu hình này phù hợp?</strong><p>Cấu hình được minh họa dựa trên nhu cầu {form.purpose.toLowerCase()} và mức ngân sách đã chọn, ưu tiên sự cân bằng giữa hiệu năng, khả năng nâng cấp và chi phí.</p></div>
          </div>
          <div className="result-actions"><Button onClick={() => setSubmitted(false)} variant="secondary">Điều chỉnh nhu cầu</Button></div>
        </div>
      )}
    </div>
  );
}