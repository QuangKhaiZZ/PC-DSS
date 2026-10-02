# PC-DSS Frontend

React + Vite, tư vấn cấu hình từ API ASP.NET Core.

## Chạy và build

```bash
npm install
npm run dev
npm run build
```

Sao chép `.env.example` thành `.env` để cấu hình backend:

```env
VITE_API_BASE_URL=http://localhost:5170
```

Giá trị là URL gốc, không chứa `/api/recommendations`. Mặc định là
`http://localhost:5170`; giá trị rỗng dùng cùng origin. Vite đọc biến khi khởi động
hoặc build, nên cần khởi động/build lại sau khi đổi. Backend hiện chỉ cho phép
CORS từ `http://localhost:5173`; dùng đúng origin này khi chạy frontend riêng.

## Contract đang dùng

Nguồn chuẩn: `backend/PcDss.Api/Controllers/RecommendationsController.cs` và
`backend/PcDss.Api/DTOs/Recommendations/RecommendationDtos.cs`.

Frontend gọi `POST /api/recommendations`, `Content-Type: application/json`:

```json
{ "budget": 25000000, "purpose": "Gaming", "topCount": 3 }
```

- `budget`: số VNĐ nguyên, từ 1 đến 999999999999999.
- `purpose`: chỉ `Gaming` hoặc `Rendering`.
- `topCount`: số nguyên từ 1 đến 3.

Response dùng camelCase: metadata `budget`, `purpose`, `modelVersion`, `target`,
`operatingSystemAssumption`, `totalPcCount`, `eligiblePcCount`, `rankingRule`,
`message`; danh sách `items` và `excluded`.
Mỗi item chứa `rank`, `pc`, `prediction`, `budgetRemainingVnd`, `reason`.
UI hiển thị cấu hình, giá, điểm dự đoán, cảnh báo, ngoại suy, nguồn giá và lý do
loại PC từ response. Không tự tạo kết quả hay phần trăm phù hợp.

Không có trang/service Categories hoặc Brands vì backend không cung cấp API đó.

## Kiểm tra UI

Form có nhãn `Nhu cầu cấu hình PC`, input `Ngân sách VNĐ`, nhóm nút
`Mục đích sử dụng` và `Số lượng gợi ý`, nút `Phân tích và gợi ý`.
Nút lựa chọn có `aria-pressed`; thông báo tiến trình có `role="status"`,
lỗi có `role="alert"`, mỗi cấu hình là một `article` có tên theo hạng/sản phẩm.

Các luồng cần kiểm tra: idle, loading (khóa form), success-empty, success,
validation, lỗi mạng/HTTP/JSON và gửi lại sau lỗi. Budget trống, 0, âm, số lẻ
hoặc vượt giới hạn không được gửi request. Kiểm tra cả Gaming và Rendering,
TopCount 1–3, cảnh báo và danh sách PC bị loại với response thực từ backend.
