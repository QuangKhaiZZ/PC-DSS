# Kiểm thử API CSV và DSS

Chạy từ gốc project, cần .NET SDK 10 và Python 3 (chỉ thư viện chuẩn). Không cần MySQL, không đọc credentials hay sửa dữ liệu thật.

```powershell
dotnet build backend/PcDss.Api/PcDss.Api.csproj
python backend/tests/verify_catalog_api.py
```

Script khởi động API riêng trên cổng loopback ngẫu nhiên từ thư mục tạm, dùng bản sao dữ liệu, dừng tiến trình do nó tạo và dọn dữ liệu tạm khi kết thúc.

Kiểm tra:

- Danh mục 10 PC, chi tiết, ID không tồn tại, mã không phân biệt hoa/thường.
- Request thiếu/sai mục đích, ngân sách âm/0/thập phân, số lượng kết quả ngoài 1–3 trả 400.
- Ranh giới ngân sách, không có kết quả, mọi PC hợp lệ được xét bất kể tồn kho ở nguồn; cột tồn kho cũ nếu có được bỏ qua, thứ tự xếp hạng và giá khi hòa điểm.
- Dự đoán 10 PC đối chiếu `data/validation/pc_predictions.csv`; 252 vector gaming và 26 vector render đối chiếu model Python đã xuất. Render Win10 trong vector được chuyển sang kịch bản Win11 theo hệ số OS vì API công bố giả định Win11.
- RTX 3050 6GB đã nằm trong phạm vi train mới; kiểm tra ngoại suy bằng fixture điều chỉnh phạm vi train. i5-14400F được kiểm tra trong vector hợp lệ; hậu tố CPU chưa có và RTX 3060 8GB không được ghép gần đúng.
- Thiếu reference trả 422 khi dự đoán riêng và bị loại kèm lý do khi tư vấn.
- CSV BOM/Unicode, ô quote có dấu phẩy/xuống dòng; trùng ID, thiếu cột, giá 0 bị từ chối lúc startup.
- Thay hệ số JSON trong bản sao làm thay đổi kết quả; sai feature_order bị từ chối. Không chép cứng hệ số.
- Các endpoint CRUD MySQL cũ đã được gỡ và trả 404.

Đây là kiểm tra chức năng và tính tương đương C#/Python. Không phải đo độ chính xác mô hình trên máy PC thật, không thay thế đánh giá độc lập dữ liệu benchmark.
