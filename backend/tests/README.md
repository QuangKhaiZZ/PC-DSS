# Kiểm thử API CSV và DSS

Chạy từ gốc project, cần .NET SDK 10 và Python 3 (chỉ thư viện chuẩn). Không cần MySQL, không đọc credentials hay sửa dữ liệu thật.

```powershell
dotnet build backend/PcDss.Api/PcDss.Api.csproj
python backend/tests/verify_catalog_api.py
```

Script khởi động API riêng trên cổng loopback ngẫu nhiên từ thư mục tạm, dùng bản sao dữ liệu, dừng tiến trình do nó tạo và dọn dữ liệu tạm khi kết thúc.

Kiểm tra:

- Danh mục 12 PC, chi tiết, ID không tồn tại, mã không phân biệt hoa/thường.
- Request thiếu/sai mục đích, ngân sách âm/0/thập phân, số lượng kết quả ngoài 1–3 trả 400.
- Ranh giới ngân sách, không có kết quả, lọc hết hàng, giữ UNKNOWN có cảnh báo, thứ tự xếp hạng và giá khi hòa điểm.
- Dự đoán 12 PC đối chiếu `data/validation/pc_predictions.csv`; 165 vector gaming và 20 vector render đối chiếu model Python đã xuất. Render Win10 trong vector được chuyển sang kịch bản Win11 theo hệ số OS vì API công bố giả định Win11.
- RTX 3050 6GB đánh dấu ngoại suy; không ghép i5-14400F vào i5-14400 hoặc RTX 3060 8GB vào bản 12GB.
- Thiếu reference trả 422 khi dự đoán riêng và bị loại kèm lý do khi tư vấn.
- CSV BOM/Unicode, ô quote có dấu phẩy/xuống dòng; trùng ID, thiếu cột, giá 0 bị từ chối lúc startup.
- Thay hệ số JSON trong bản sao làm thay đổi kết quả; sai feature_order bị từ chối. Không chép cứng hệ số.
- Các endpoint CRUD MySQL cũ đã được gỡ và trả 404.

Đây là kiểm tra chức năng và tính tương đương C#/Python. Không phải đo độ chính xác mô hình trên máy PC thật, không thay thế đánh giá độc lập dữ liệu benchmark.
