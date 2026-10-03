import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Wallet, ListOrdered, Cpu, SlidersHorizontal, ChartNoAxesColumnIncreasing } from "lucide-react";

const steps = [
  { title: "Nhu cầu", heading: "Chọn nhu cầu", icon: SlidersHorizontal, text: "Chọn Gaming hoặc Rendering theo công việc của bạn." },
  { title: "Ngân sách", heading: "Thiết lập ngân sách", icon: Wallet, text: "Nhập ngân sách để lọc các bộ PC phù hợp." },
  { title: "Dự đoán", heading: "Dự đoán hiệu năng", icon: ChartNoAxesColumnIncreasing, text: "Dự đoán điểm benchmark theo mục đích sử dụng." },
  { title: "Xếp hạng", heading: "Xếp hạng kết quả", icon: ListOrdered, text: "So sánh các cấu hình theo điểm dự đoán giảm dần." },
];

const useCases = [
  {
    title: "Gaming", image: "/images/home-gaming-natural.png",
    alt: "Góc máy tính chơi game gọn gàng trong ánh sáng tự nhiên",
    text: "Khám phá các bộ PC cho nhu cầu chơi game, so sánh hiệu năng theo điểm benchmark dự đoán.",
    benchmark: "3DMark Time Spy",
  },
  {
    title: "Rendering", image: "/images/home-rendering-natural.png",
    alt: "Góc làm việc với màn hình hiển thị mô hình kiến trúc 3D",
    text: "Lựa chọn cấu hình cho nhu cầu dựng hình và trực quan hóa, với benchmark phù hợp cho công việc.",
    benchmark: "PCMark 10 Rendering and Visualization",
  },
];

const benefits = [
  { title: "Gợi ý có cơ sở", icon: ShieldCheck, text: "Dựa trên điểm benchmark dự đoán theo mục đích sử dụng." },
  { title: "Tối ưu ngân sách", icon: Wallet, text: "Lọc cấu hình trong ngân sách trước khi so sánh hiệu năng." },
  { title: "Tiết kiệm thời gian", icon: ShieldCheck, text: "Nhanh chóng tìm cấu hình phù hợp thay vì tự so sánh từng bộ PC." },
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <h1 id="home-title">Tìm cấu hình PC<br /><span>phù hợp với bạn</span></h1>
          <p>PC DSS giúp bạn tìm kiếm cấu hình máy tính phù hợp dựa trên nhu cầu sử dụng, ngân sách và điểm hiệu năng dự đoán theo benchmark.</p>
          <div className="home-hero-actions">
            <Link to="/recommendation" className="btn btn-primary home-cta">Bắt đầu tư vấn <ArrowRight size={18} aria-hidden="true" /></Link>
            <a href="#home-process" className="home-secondary-cta">Tìm hiểu thêm</a>
          </div>
        </div>

        <div className="home-dss-panel" aria-label="Minh họa quy trình DSS">
          <img className="home-dss-background" src="/images/home-office-daylight.png" alt="" fetchPriority="high" />
          <div className="home-dss-diagram">
            <svg className="home-dss-connectors" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true">
              <path d="M180 65 C230 65 240 130 300 130 M420 65 C370 65 360 130 300 130 M180 195 C230 195 240 130 300 130 M420 195 C370 195 360 130 300 130" />
              <circle cx="180" cy="65" r="4" /><circle cx="420" cy="65" r="4" /><circle cx="180" cy="195" r="4" /><circle cx="420" cy="195" r="4" />
            </svg>
            <div className="home-dss-core" aria-hidden="true"><div className="home-chip"><Cpu size={44} strokeWidth={1.5} /></div></div>
            <ol className="home-flow">
              {steps.map(({ title, icon: Icon, text }, index) => (
                <li key={title}>
                  <span className="home-flow-icon"><Icon size={23} aria-hidden="true" /></span>
                  <div><span className="home-flow-number">0{index + 1}</span><strong>{title}</strong><p>{text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="home-purpose-section" aria-labelledby="home-purpose-title">
        <div className="home-section-heading"><div><span className="home-kicker">CHỌN NHU CẦU</span><h2 id="home-purpose-title">Bạn sử dụng PC cho mục đích gì?</h2><p>Mỗi nhu cầu có tiêu chí đánh giá hiệu năng riêng.</p></div></div>
        <div className="home-purpose-grid">
          {useCases.map(({ title, image, alt, text, benchmark }) => (
            <Link to={`/recommendation?purpose=${encodeURIComponent(title)}`} className="home-purpose-card" key={title} aria-label={`Tư vấn cấu hình ${title}`}>
              <div className="home-purpose-image"><img src={image} alt={alt} loading="lazy" /></div>
              <div className="home-purpose-content">
                <div className="home-purpose-description"><h3>{title}</h3><p>{text}</p></div>
                <div className="home-benchmark"><span>{benchmark}</span></div>
              </div>
              <span className="home-purpose-arrow"><ArrowRight size={19} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section id="home-process" className="home-process" aria-labelledby="home-process-title">
        <div className="home-section-heading"><div><span className="home-kicker">QUY TRÌNH HOẠT ĐỘNG</span><h2 id="home-process-title">Hệ thống hoạt động như thế nào?</h2></div></div>
        <ol className="home-process-grid">
          {steps.map(({ heading, text }, index) => (
            <li key={heading}><span className="home-step-number">{index + 1}</span><div><h3>{heading}</h3><p>{text}</p></div>{index < steps.length - 1 && <ArrowRight className="home-step-connector" size={18} aria-hidden="true" />}</li>
          ))}
        </ol>
      </section>

      <section className="home-benefits-section" aria-label="Lợi ích của PC DSS">
        <div className="home-section-heading"><div><span className="home-kicker">LÝ DO NÊN SỬ DỤNG PC DSS</span><h2>Lợi ích dành cho bạn</h2></div></div>
        <div className="home-benefits">
          {benefits.map(({ title, icon: Icon, text }) => (
            <div className="home-benefit" key={title}><span><Icon size={25} aria-hidden="true" /></span><div><h3>{title}</h3><p>{text}</p></div></div>
          ))}
        </div>
      </section>
    </div>
  );
}
