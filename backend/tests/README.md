# Kiểm thử API PC-DSS

Chạy từ thư mục gốc dự án. Cần .NET SDK 10 và Python 3; script Python chỉ dùng thư viện chuẩn.

```powershell
dotnet build backend/PcDss.Api/PcDss.Api.csproj
python backend/tests/verify_catalog_api.py
```

Script khởi động API riêng trên cổng loopback ngẫu nhiên, dùng bản sao dữ liệu trong thư mục tạm và dọn tiến trình sau khi kiểm tra. Không cần dừng API demo đang chạy.

Các nội dung kiểm tra gồm:

- Danh mục hiện tại, chi tiết PC và ảnh sản phẩm.
- Từ chối request sai nhu cầu, ngân sách hoặc số lượng gợi ý.
- Lọc khoảng giá, kết quả rỗng và thứ tự điểm giảm dần, giá tăng dần, rồi mã PC.
- Đối chiếu dự đoán với 252 vector Gaming và 26 mẫu Rendering; kiểm tra kịch bản Windows 11 của API.
- Xử lý thiếu reference, cảnh báo ngoại suy và phân biệt đúng phiên bản linh kiện.
- Đọc CSV có BOM, Unicode, ô chứa dấu phẩy hoặc xuống dòng; từ chối danh mục sai cấu trúc, trùng mã hoặc giá không hợp lệ.
- Kiểm tra backend sử dụng hệ số mô hình từ JSON.

Lần kiểm tra ngày 16/10/2026 trên bản sao mã nguồn được build lại từ đầu: **PASS — 1.056 kiểm tra, danh mục 36 PC, 252 vector Gaming và 26 mẫu Rendering**.

Đây là kiểm tra chức năng API và tính nhất quán của phép tính, không phải xác nhận độ chính xác trên benchmark mới hoặc trên các PC thực tế trong danh mục.
