import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gamepad2,
  BriefcaseBusiness,
  Palette,
  Code2,
  ShieldCheck,
  BrainCircuit,
  Cpu
} from "lucide-react";

const useCases = [
  { icon: Gamepad2, title: "Gaming", text: "Chơi game AAA, FPS và game online mượt mà." },
  { icon: BriefcaseBusiness, title: "Văn phòng", text: "Word, Excel, trình duyệt và tác vụ hằng ngày." },
  { icon: Palette, title: "Đồ họa", text: "Photoshop, Illustrator, Premiere và thiết kế." },
  { icon: Code2, title: "Lập trình", text: "IDE, Docker, máy ảo và phát triển phần mềm." },
];

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><BrainCircuit size={16}/> DECISION SUPPORT SYSTEM</div>
          <h2>Tìm cấu hình PC<br/><span>phù hợp với bạn.</span></h2>
          <p>
            Hệ thống hỗ trợ lựa chọn cấu hình máy tính dựa trên nhu cầu sử dụng,
            ngân sách và các tiêu chí phần cứng của người dùng.
          </p>
          <Link to="/recommendation" className="btn btn-primary btn-large">
            Bắt đầu tư vấn <ArrowRight size={18}/>
          </Link>
        </div>
        <div className="hero-card">
          <div className="pc-visual"><Cpu size={76}/></div>
          <div className="score-badge">DSS SCORE <strong>94%</strong></div>
          <div className="hero-specs">
            <span>Gaming / Workstation</span>
            <span>Balanced configuration</span>
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
        <div><ShieldCheck size={28}/><div><strong>Gợi ý có cơ sở</strong><span>Dựa trên tiêu chí và trọng số DSS.</span></div></div>
        <div><BrainCircuit size={28}/><div><strong>Tối ưu ngân sách</strong><span>Cân bằng hiệu năng và chi phí.</span></div></div>
        <div><Cpu size={28}/><div><strong>Cấu hình đồng bộ</strong><span>Hướng tới bộ PC cân đối.</span></div></div>
      </section>
    </div>
  );
}