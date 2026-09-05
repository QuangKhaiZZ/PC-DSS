import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Tags } from "lucide-react";
import { getBrands, createBrand, updateBrand, deleteBrand } from "../services/brandService";
import Button from "../components/Button";
import Modal from "../components/Modal";

export default function Brands() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setItems(await getBrands() || []); }
    catch { setError("Không thể kết nối Backend API. Hãy kiểm tra http://localhost:5170."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async e => {
    e.preventDefault(); if (!name.trim()) return;
    try {
      if (editing) await updateBrand(editing.brandId ?? editing.id, { name });
      else await createBrand({ name });
      setOpen(false); setEditing(null); setName(""); load();
    } catch { setError("Thao tác thất bại. Hãy kiểm tra DTO của API Brand."); }
  };

  const edit = item => { setEditing(item); setName(item.name || item.brandName || ""); setOpen(true); };
  const remove = async id => { if (!confirm("Bạn có chắc muốn xóa thương hiệu này?")) return; try { await deleteBrand(id); load(); } catch { setError("Không thể xóa thương hiệu."); } };

  return <div>
    <div className="page-title">
      <div><span className="eyebrow">DATA MANAGEMENT</span><h2>Thương hiệu</h2><p>Quản lý Brands của hệ thống.</p></div>
      <div className="title-actions"><Button variant="secondary" onClick={load}><RefreshCw size={16}/> Làm mới</Button><Button onClick={()=>{setEditing(null);setName("");setOpen(true)}}><Plus size={17}/> Thêm thương hiệu</Button></div>
    </div>
    {error && <div className="error-banner">{error}</div>}
    <div className="table-card">
      {loading ? <div className="empty">Đang tải dữ liệu...</div> :
      items.length === 0 ? <div className="empty"><Tags size={36}/><strong>Chưa có thương hiệu</strong><span>Hãy thêm Brand hoặc kiểm tra API.</span></div> :
      <table><thead><tr><th>ID</th><th>Tên thương hiệu</th><th>Thao tác</th></tr></thead><tbody>
        {items.map((item, i) => <tr key={item.id ?? item.brandId ?? i}><td>{item.id ?? item.brandId}</td><td><strong>{item.name ?? item.brandName}</strong></td><td><div className="row-actions"><button onClick={()=>edit(item)}><Pencil size={16}/></button><button className="danger" onClick={()=>remove(item.id ?? item.brandId)}><Trash2 size={16}/></button></div></td></tr>)}
      </tbody></table>}
    </div>
    <Modal open={open} title={editing ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"} onClose={()=>setOpen(false)}>
      <form onSubmit={save} className="modal-form"><label>Tên thương hiệu<input value={name} onChange={e=>setName(e.target.value)} placeholder="VD: Intel, AMD, NVIDIA..." autoFocus/></label><Button type="submit">{editing ? "Lưu thay đổi" : "Thêm thương hiệu"}</Button></form>
    </Modal>
  </div>;
}
