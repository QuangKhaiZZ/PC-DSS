import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Layers3 } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../services/categoryService";
import Button from "../components/Button";
import Modal from "../components/Modal";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setItems(await getCategories() || []); }
    catch (e) { setError("Không thể kết nối Backend API. Hãy kiểm tra http://localhost:5170."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async e => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const payload = { categoryName: name.trim() };
      if (editing) {
        await updateCategory(editing.categoryId ?? editing.id, payload);
      } else {
        await createCategory(payload);
      }
      setOpen(false); setEditing(null); setName(""); load();
    } catch { setError("Thao tác thất bại. Hãy kiểm tra DTO của API Category."); }
  };

  const edit = item => { setEditing(item); setName(item.name || item.categoryName || ""); setOpen(true); };
  const remove = async id => { if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return; try { await deleteCategory(id); load(); } catch { setError("Không thể xóa danh mục."); } };

  return <div>
    <div className="page-title">
      <div><span className="eyebrow">DATA MANAGEMENT</span><h2>Danh mục linh kiện</h2><p>Quản lý Categories từ Backend API.</p></div>
      <div className="title-actions"><Button variant="secondary" onClick={load}><RefreshCw size={16}/> Làm mới</Button><Button onClick={()=>{setEditing(null);setName("");setOpen(true)}}><Plus size={17}/> Thêm danh mục</Button></div>
    </div>
    {error && <div className="error-banner">{error}</div>}
    <div className="table-card">
      {loading ? <div className="empty">Đang tải dữ liệu...</div> :
      items.length === 0 ? <div className="empty"><Layers3 size={36}/><strong>Chưa có danh mục</strong><span>Hãy thêm Category hoặc kiểm tra API.</span></div> :
      <table><thead><tr><th>ID</th><th>Tên danh mục</th><th>Thao tác</th></tr></thead><tbody>
        {items.map((item, i) => <tr key={item.id ?? item.categoryId ?? i}><td>{item.id ?? item.categoryId}</td><td><strong>{item.name ?? item.categoryName}</strong></td><td><div className="row-actions"><button onClick={()=>edit(item)}><Pencil size={16}/></button><button className="danger" onClick={()=>remove(item.id ?? item.categoryId)}><Trash2 size={16}/></button></div></td></tr>)}
      </tbody></table>}
    </div>
    <Modal open={open} title={editing ? "Chỉnh sửa danh mục" : "Thêm danh mục"} onClose={()=>setOpen(false)}>
      <form onSubmit={save} className="modal-form"><label>Tên danh mục<input value={name} onChange={e=>setName(e.target.value)} placeholder="VD: CPU, GPU, RAM..." autoFocus/></label><Button type="submit">{editing ? "Lưu thay đổi" : "Thêm danh mục"}</Button></form>
    </Modal>
  </div>;
}
