import React, { useEffect, useState } from "react";//trang quan ly Brands
import { Plus, Pencil, Trash2, RefreshCw, Tags } from "lucide-react";//import cac icon tu lucide-react
import { getBrands, createBrand, updateBrand, deleteBrand } from "../services/brandService";//import cac ham tu brandService
import Button from "../components/Button";//import Button tu component Button
import Modal from "../components/Modal";//import Modal tu component Modal

export default function Brands() {//trang quan ly Brands
  const [items, setItems] = useState([]);//state luu danh sach Brands
  const [loading, setLoading] = useState(true);//state luu trang thai dang tai du lieu
  const [error, setError] = useState("");//state luu thong bao loi
  const [open, setOpen] = useState(false);//state luu trang thai cua modal
  const [editing, setEditing] = useState(null); //state luu thong tin cua Brand dang chinh sua
  const [name, setName] = useState("");//state luu ten cua Brand dang chinh sua

  const load = async () => {//ham load du lieu tu backend
    setLoading(true); setError("");// set trang thai dang tai du lieu va thong bao loi
    try { setItems(await getBrands() || []); }//goi ham getBrands tu brandService va set danh sach Brands
    catch { setError("Không thể kết nối Backend API. Hãy kiểm tra http://localhost:5170."); }//neu khong the ket noi backend thi set thong bao loi
    finally { setLoading(false); }//set trang thai dang tai du lieu la false
  };
  useEffect(() => { load(); }, []);//goi ham load khi component duoc render lan dau tien

  const save = async e => {//ham luu du lieu khi submit form
    e.preventDefault(); if (!name.trim()) return;//neu ten rong thi return
    try {
      if (editing) await updateBrand(editing.brandId ?? editing.id, { name });//neu dang chinh sua thi goi ham updateBrand tu brandService
      else await createBrand({ name });//neu khong dang chinh sua thi goi ham createBrand tu brandService
      setOpen(false); setEditing(null); setName(""); load();//set trang thai modal la false, set thong tin Brand dang chinh sua la null, set ten rong va load lai danh sach Brands
    } catch { setError("Thao tác thất bại. Hãy kiểm tra DTO của API Brand."); }//neu khong thanh cong thi set thong bao loi
  };

  const edit = item => { setEditing(item); setName(item.name || item.brandName || ""); setOpen(true); };//ham chinh sua Brand, set thong tin Brand dang chinh sua va set ten cua Brand vao input, set trang thai modal la true
  const remove = async id => { if (!confirm("Bạn có chắc muốn xóa thương hiệu này?")) return; try { await deleteBrand(id); load(); } catch { setError("Không thể xóa thương hiệu."); } };//ham xoa Brand, hoi nguoi dung co chac muon xoa hay khong, neu co thi goi ham deleteBrand tu brandService va load lai danh sach Brands, neu khong thanh cong thi set thong bao loi

  return <div>
    <div className="page-title">
      <div>
        <h2>Thương hiệu</h2>
        <p>Quản lý Brands của hệ thống</p>
      </div>
      <div className="title-actions">
        <Button variant="secondary" onClick={load}><RefreshCw size={16}/> Làm mới</Button><Button onClick={()=>{setEditing(null);setName("");setOpen(true)}}><Plus size={17}/> Thêm thương hiệu</Button></div>
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
