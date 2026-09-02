# PC-DSS-Frontend

Frontend React + Vite cho đề tài:
**Xây dựng hệ thống gợi ý lựa chọn cấu hình máy tính cá nhân theo nhu cầu người dùng**

## Yêu cầu
- Node.js 18+
- Backend ASP.NET Core chạy tại `http://localhost:5170`

## Chạy project

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal (thường là http://localhost:5173).

## API đang kết nối

- GET/POST `/api/categories`
- GET/PUT/DELETE `/api/categories/{id}`
- GET/POST `/api/brands`
- GET/PUT/DELETE `/api/brands/{id}`

## Lưu ý
Frontend đã có trang DSS và dữ liệu kết quả minh họa. Khi bạn có API thuật toán gợi ý thật, chỉ cần thay phần xử lý submit trong `src/pages/Recommendation.jsx` bằng API recommendation của backend.

Nếu API trả về field khác `id/name` (ví dụ `categoryId/categoryName`), trang quản lý đã có fallback đọc hai kiểu tên phổ biến. Payload POST/PUT hiện dùng `{ name }`; nếu DTO backend dùng tên khác, sửa payload trong service/page tương ứng.
