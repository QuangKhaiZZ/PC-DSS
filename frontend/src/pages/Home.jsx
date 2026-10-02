import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gamepad2,
  Palette,
  ShieldCheck,
  BrainCircuit,
  Cpu
} from "lucide-react";

const useCases = [
  { icon: Gamepad2, title: "Gaming", text: "Chơi game AAA, FPS và game online mượt mà." },
  { icon: Palette, title: "Rendering", text: "Render 3D, dựng phim và các tác vụ sáng tạo chuyên nghiệp." },
];

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-copy">
          <h2>Tìm cấu hình PC<br/><span>phù hợp với bạn.</span></h2>
          <p>
            Hệ thống hỗ trợ lựa chọn cấu hình máy tính dựa trên nhu cầu sử dụng,
            ngân sách và điểm hiệu năng dự đoán.
          </p>
          <Link to="/recommendation" className="btn btn-primary btn-large">
            Bắt đầu tư vấn <ArrowRight size={18}/>
          </Link>
        </div>
        <div className="hero-card">
          <div className="pc-visual"><Cpu size={76}/></div>
          <div className="hero-specs">
            <span>Gaming / Rendering</span>
            <span>Cấu hình cân bằng</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><span className="eyebrow">CHỌN NHU CẦU</span><h3>Bạn sử dụng PC cho mục đích gì?</h3></div>
          <Link to="/recommendation">Xem tất cả →</Link>
        </div>
        <div className="use-grid">
          {useCases.map(({icon: Icon, title, text}) => (
            <Link to="/recommendation" className="use-card" key={title}>
              <div className="use-icon"><Icon size={24}/></div>
              <h4>{title}</h4><p>{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="info-strip">
        <div><ShieldCheck size={28}/><div><strong>Gợi ý có cơ sở</strong><span>Xếp hạng theo điểm hiệu năng dự đoán.</span></div></div>
        <div><BrainCircuit size={28}/><div><strong>Tối ưu ngân sách</strong><span>Cân bằng hiệu năng và chi phí.</span></div></div>
        <div><Cpu size={28}/><div><strong>Cấu hình đồng bộ</strong><span>Hướng tới bộ PC cân đối.</span></div></div>
      </section>
    </div>
  );
}
