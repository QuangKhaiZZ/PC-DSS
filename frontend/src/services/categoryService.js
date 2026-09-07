const API_BASE_URL = (//  lay duong dan backend tu file .env hoac mac dinh la http://localhost:5170
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5170"//  lay duong dan backend tu file .env hoac mac dinh la http://localhost:5170
).replace(/\/$/, "");//loai bo dau / o cuoi duong dan

const API_URL = `${API_BASE_URL}/api/categories`;

async function request(url, options) {//ham gui yeu cau den backend
  const response = await fetch(url, options);//gui yeu cau den backend
  if (!response.ok) {
    const message = await response.text();//lay thong bao loi tu backend
    throw new Error(message || `HTTP ${response.status}`);//neu khong thanh cong thi tra ve loi
  }
  if (response.status === 204) return null;//neu khong co du lieu tra ve thi tra ve null
  const text = await response.text();//lay du lieu tra ve tu backend
  return text ? JSON.parse(text) : null;//phan tich du lieu tra ve
}

export const getCategories = () => request(API_URL);//lay tat ca danh muc
export const getCategoryById = (id) => request(`${API_URL}/${id}`);//lay danh muc theo id

export const createCategory = (data) =>//tao danh muc moi
  request(API_URL, {//gui yeu cau den backend
    method: "POST",//phuong thuc gui yeu cau la POST
    headers: { "Content-Type": "application/json" },//loai du lieu gui di la json
    body: JSON.stringify(data),//chuyen doi du lieu thanh json
  });//tao danh muc moi

export const updateCategory = (id, data) =>//cap nhat danh muc theo id
  request(`${API_URL}/${id}`, {//gui yeu cau den backend
    method: "PUT",//phuong thuc gui yeu cau la PUT
    headers: { "Content-Type": "application/json" },//loai du lieu gui di la json
    body: JSON.stringify(data),//chuyen doi du lieu thanh json
  });//cap nhat danh muc theo id

export const deleteCategory = (id) =>//xoa danh muc theo id
  request(`${API_URL}/${id}`, { method: "DELETE" });//xoa danh muc theo id
