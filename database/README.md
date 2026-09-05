# Database PC-DSS

Cơ sở dữ liệu gồm 15 bảng lưu linh kiện, giá tham khảo, benchmark, yêu cầu tư vấn và cấu hình đề xuất.

## Các file

| File | Dùng để làm gì |
|---|---|
| `database.sql` | Tạo 15 bảng, khóa ngoại, ràng buộc và thêm 8 danh mục, 10 thương hiệu; chưa có sản phẩm/giá/benchmark |
| `03-check-data.sql` | Tìm lỗi nhập nhầm loại linh kiện, thiếu benchmark và một số cấu hình không hợp lệ |
| `../docs/database-demo.md` | ERD, mô tả trường và các quy tắc kiểm tra |
| `../docs/data-collection-template.md` | Mẫu dữ liệu và quy ước nhập thông số linh kiện |
| `tests/verify_database.py` | Bộ kiểm thử dành cho phát triển, chạy trên MySQL tạm riêng; không bắt buộc để khởi tạo database hoặc chạy ứng dụng |

## Chạy bằng MySQL Workbench

Yêu cầu **MySQL 8.0.16 trở lên** để `CHECK` được thực thi. Chỉ cần file `database.sql` để khởi tạo trên **database mới, rỗng**; đây không phải migration của database hiện có.

1. Tạo một schema mới tên `pc_dss_demo` trong Workbench, dùng `utf8mb4`. Nếu tên đã tồn tại, chọn tên mới thay vì xóa dữ liệu cũ.
2. Nhấp đúp schema mới để chọn làm schema mặc định. Chạy `SELECT DATABASE();` để xác nhận đúng tên.
3. Mở và chạy toàn bộ `database.sql` một lần. File tạo bảng trước, sau đó thêm danh mục và thương hiệu. Không chạy lại trên schema đã có bảng/dữ liệu.
4. Khi khởi tạo thành công, schema có 15 bảng, 8 danh mục và 10 thương hiệu. Sau khi nhập sản phẩm, có thể chạy `03-check-data.sql` để kiểm tra. Mỗi kết quả có dòng là vấn đề cần xem; kết quả rỗng chỉ xác nhận các kiểm tra có trong file.

File khởi tạo không tạo tài khoản. Nếu chạy bị lỗi giữa chừng, kiểm tra nguyên nhân và dùng một schema mới rỗng khi thử lại; DDL MySQL không được hoàn tác toàn bộ bằng transaction.

## Quan hệ với backend hiện tại

Backend hiện có model/migration `Categories`, dùng các cột `CategoryID`, `CategoryName` và index `IX_Categories_CategoryName`. **Các bảng còn lại chưa được ánh xạ vào EF Core và chưa có API.**

File `database.sql` khởi tạo schema độc lập với EF migrations. Không chạy migration tạo bảng `Categories` lên schema đã có bảng này. Khi tích hợp các bảng còn lại vào backend, cần đồng bộ model và migration với cấu trúc SQL.

## Kiểm thử SQL (tùy chọn)

`tests/verify_database.py` kiểm tra việc tạo bảng, khóa ngoại và ràng buộc dữ liệu sau khi chỉnh sửa SQL. Script dùng dữ liệu giả lập trên MySQL tạm riêng, không phải dữ liệu nhập vào ứng dụng. Khởi tạo database bằng Workbench không cần Python hoặc chạy script này.

Để chạy bộ kiểm thử, máy cần Python 3 và MySQL Server/Client 8.0.16+. Script nhận đường dẫn thư mục `bin` của MySQL:

```powershell
python database/tests/verify_database.py --mysql-bin "C:\Program Files\MySQL\MySQL Server 8.0\bin"
```

Script tự khởi tạo MySQL trong thư mục tạm của hệ điều hành, chọn cổng loopback riêng, tạo schema `pc_dss_test`, chạy các file SQL và kiểm tra. Nó không đọc cấu hình/mật khẩu ứng dụng, không kết nối service MySQL đang dùng và dừng đúng tiến trình vừa tạo. Thư mục tạm được giữ để xem log khi cần.

Đã chạy ngày 2026-09-05 trên MySQL Community Server 8.0.46: **37 kiểm tra đạt**, gồm khởi tạo schema/catalog, dữ liệu Office/Gaming giả lập, khóa ngoại, dữ liệu không hợp lệ và truy vấn phát hiện lỗi sau nhập. Kiểm tra này xác minh cấu trúc SQL, chưa xác minh phần cứng thực tế hay API/DSS chưa được triển khai.

Dữ liệu kiểm thử có tên `TEST-*`, URL `example.invalid` và giá trị giả lập, chỉ dùng để kiểm tra SQL. Dữ liệu sản phẩm được nhập theo [mẫu dữ liệu linh kiện](../docs/data-collection-template.md).
