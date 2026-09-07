# Kiểm thử API catalog

`verify_catalog_api.py` kiểm tra Category, Brand và luồng Product dùng trong hai file `.http`. Script tạo MySQL tạm riêng trên cổng loopback, xác nhận đúng thư mục dữ liệu, khởi tạo schema từ `database/database.sql`, build và chạy một API riêng. Nó không dùng service MySQL, User Secrets hoặc database ứng dụng hiện có.

Yêu cầu: .NET SDK 10, Python 3 và MySQL Server/Client 8.0.16+. Restore package API trước lần chạy đầu. Chạy từ thư mục gốc dự án:

```powershell
dotnet restore backend/PcDss.Api/PcDss.Api.csproj
python backend/tests/verify_catalog_api.py --mysql-bin "C:\Program Files\MySQL\MySQL Server 8.0\bin"
```

Script kiểm tra:

- Luồng thêm, đọc, sửa, xóa từ các file `PcDss.Api.http` và `Products.http`, bao gồm ID lấy từ response POST.
- Category/Brand đang có Product phải trả `409` khi xóa; xóa được sau khi Product đã được dọn.
- Tên trống, null hoặc quá dài trả `400`.
- Ngày ghi nhận giá đọc/ghi đúng qua MySQL DATE: gồm ngày thường, ngày nhuận và giá trị null, qua cả POST/PUT/GET chi tiết/danh sách.
- Hai request đồng thời thêm hoặc sửa thành cùng một tên: một request thành công, một request trả `409`. Trigger và khóa chỉ được tạo trong MySQL tạm để buộc cả hai request vượt qua kiểm tra tên trước khi ghi; log được kiểm tra để xác nhận thực sự gặp lỗi unique từ MySQL.
- Danh mục/thương hiệu seed còn nguyên và không còn Product thử sau khi chạy.

Các tiến trình API/MySQL do script tạo sẽ được dừng khi kết thúc; thư mục tạm được giữ lại để xem log. Script không chạy EF migration. Đây là kiểm thử dành cho phát triển, không phải bước bắt buộc mỗi khi chạy ứng dụng. Việc thực thi file `.http` trong script chỉ hỗ trợ những cú pháp REST Client đang dùng trong hai file đó.
