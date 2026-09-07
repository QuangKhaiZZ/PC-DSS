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

Sao chép `.env.example` thành `.env` nếu cần đổi địa chỉ backend:

```env
VITE_API_BASE_URL=http://localhost:5170
```

## API đang kết nối

- GET/POST `/api/categories`
- GET/PUT/DELETE `/api/categories/{id}`
- API Brand chưa được triển khai ở backend hiện tại.

## Lưu ý
Frontend đã có trang DSS và dữ liệu kết quả minh họa. Khi có API thuật toán gợi ý thật, thay phần xử lý submit trong `src/pages/Recommendation.jsx` bằng API recommendation của backend.

Trang Category đang dùng đúng DTO của backend: `{ categoryName }` và đọc `categoryId/categoryName`.
