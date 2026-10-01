# PC-DSS

Hệ hỗ trợ ra quyết định lựa chọn bộ PC có sẵn theo ngân sách và mục đích Gaming/Rendering. Phạm vi hiện tại không kiểm tra tương thích linh kiện.

## Công nghệ

- Backend: ASP.NET Core Web API
- Dữ liệu: CSV danh mục PC, CSV reference và hệ số model JSON; backend không cần MySQL.
- Frontend: React 18, Vite 6

## Trạng thái

- Backend có API đọc PC, dự đoán và tư vấn tối đa 3 bộ theo ngân sách. Đã gỡ CRUD linh kiện/PC theo MySQL và migration EF khỏi backend.
- Model Gaming/Rendering đọc hệ số đã train từ JSON; được kiểm tra khớp kết quả Python. Render dùng giả định Windows 11, ngoại suy có cảnh báo.
- Frontend hiện còn giao diện cũ và kết quả minh họa; cần nối API DSS mới. Các màn hình Brand/Category không còn endpoint hoạt động.
- Thư mục `database/` giữ mã SQL giai đoạn trước, không dùng để khởi động backend hiện tại.

## Chạy backend

```powershell
dotnet run --project backend/PcDss.Api/PcDss.Api.csproj --launch-profile http
```

API: `http://localhost:5170`. Xem [hướng dẫn backend](backend/README.md) và request mẫu trong `backend/PcDss.Api/PcDss.Api.http`. Không chạy migration/database update.

## Tài liệu

- [Dataset Gaming và Render](data/README.md)
- [Mô hình đã chốt](models/README.md)
- [Notebook huấn luyện trên Colab](notebooks/README.md)
- [Yêu cầu hệ thống](docs/requirements.md)
- [Bổ sung danh mục PC và reference](docs/data-collection-template.md)
- [Hướng dẫn tích hợp frontend](docs/frontend-integration.md)
- [Mục lục tài liệu](docs/README.md)
- [Thiết kế DSS](docs/dss-design.md)
- [Kiểm thử API CSV và DSS](backend/tests/README.md)
