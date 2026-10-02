import React from "react";
import { NavLink } from "react-router-dom";
import { Cpu, Home, Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Trang chủ", icon: Home, end: true },
  { to: "/recommendation", label: "Tư vấn cấu hình", icon: Sparkles },
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
      <nav>
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
    </aside>
  );
}
