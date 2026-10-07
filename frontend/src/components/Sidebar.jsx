import React from "react";
import { NavLink } from "react-router-dom";
import { Cpu, Home, SlidersHorizontal } from "lucide-react";

const links = [
  { to: "/", label: "Trang chủ", icon: Home, end: true },
  { to: "/recommendation", label: "Tư vấn cấu hình", icon: SlidersHorizontal },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Cpu size={34} /></div>
        <div>
          <strong>PC DSS</strong>
          <span>Decision Support System</span>
        </div>
      </div>

      <div className="menu-title">MENU</div>
      <nav aria-label="Điều hướng chính">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            end={end}
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <svg className="sidebar-landscape" viewBox="0 0 250 220" fill="none" aria-hidden="true">
          <path d="M139 41 205 63 205 173 139 151Z M139 41 105 60 105 105 M139 151 105 168 M205 173 173 191 139 180 M173 191V82L205 63 M173 82 139 60 M153 89 162 92V119L153 116Z M151 133 163 137 M151 146 163 150 M183 86 196 90 M183 103 196 107 M183 143 196 147" />
          <rect x="24" y="106" width="110" height="70" rx="4" />
          <path d="M28 169H130 M67 176V192 M92 176V192 M54 195H105 M27 106 130 176" />
        </svg>
        <footer className="sidebar-footer"><strong>PC DSS</strong><p>Hỗ trợ bạn đưa ra quyết định cấu hình PC phù hợp.</p></footer>
      </div>
    </aside>
  );
}
