import React from "react";
import { Bell, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <header className="navbar">
      <div>
        <div className="breadcrumb">PC DSS / Hệ thống hỗ trợ quyết định</div>
        <h1>PC Configuration Advisor</h1>
      </div>
      <div className="nav-actions">
        <button className="icon-button" title="Thông báo"><Bell size={19} /></button>
        <div className="user-chip">
          <UserCircle size={28} />
          <div>
            <strong>Người dùng</strong>
            <span>Personal account</span>
          </div>
        </div>
      </div>
    </header>
  );
}