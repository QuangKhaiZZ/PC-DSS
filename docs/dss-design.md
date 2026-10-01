# Thiết kế DSS

## Luồng quyết định

Ngân sách + mục đích → danh mục PC → lọc giá/tồn kho → tra reference → tạo đặc trưng → dự đoán → xếp hạng → trả phương án và giải thích.

Backend đọc CSV và metadata khi khởi động. Không huấn luyện lại trên mỗi request. Nguồn dữ liệu, mô hình và quy tắc lựa chọn là ba phần riêng của hệ trợ giúp quyết định.

## Model

| Nhu cầu | Đặc trưng | Công thức |
|---|---|---|
| Gaming | GpuScore, CpuMultiScore | A × GpuScore^b × CpuMultiScore^c |
| Rendering | GpuScore, CpuMultiScore, IsIntel, GpuGeneration, IsUltra, IsWindows11 | intercept + tổng(coefficient × feature) |

Hệ số lấy từ model_info.json đúng phiên bản. C# triển khai hai công thức được hỗ trợ, không trực tiếp nạp joblib. Đổi sang loại model khác cần sửa bộ tính và kiểm thử.

CpuMultiScore là CPU Mark, GpuScore là G3D Mark. Tên linh kiện được chuẩn hóa nhưng vẫn giữ hậu tố và VRAM. Rendering tạo biến theo quy tắc trong PredictionService, dùng IsWindows11=1 và trả giả định rõ ràng.

RAM, SSD và giá không tham gia công thức. Vì vậy các bộ cùng CPU/GPU có thể cùng điểm dù RAM/SSD khác nhau.

## Lọc và xếp hạng

- Loại giá lớn hơn ngân sách và OUT_OF_STOCK.
- Giữ UNKNOWN kèm cảnh báo xác nhận lại cửa hàng.
- Thiếu reference hoặc không tạo được đầu vào hợp lệ: loại và trả lý do.
- Ngoài khoảng train: vẫn xét, gắn isExtrapolation và warnings.
- Sắp điểm giảm dần, giá tăng dần, rồi PcId; trả tối đa 3 bộ.
- Không đủ bộ trả ít hơn; không có trả items rỗng với message.

Ngân sách là ràng buộc, không là trọng số hiệu năng. Đây không phải tối ưu tỷ lệ hiệu năng/giá. Không cộng điểm hai benchmark khác thang đo.

## Giải thích và giới hạn

Mỗi kết quả trả điểm dự đoán, benchmark đích, phiên bản model, reference ID, đặc trưng, lý do xếp hạng và ngân sách còn lại. Giao diện cần hiển thị cảnh báo ngoại suy và Windows; thông tin kỹ thuật có thể thu gọn.

Kiểm thử tương đương C#/Python xác nhận triển khai công thức. Đánh giá sai số cần benchmark thực đo độc lập. Phạm vi train hợp lệ không bảo đảm dự đoán đúng. Xem [báo cáo model](model-check.md).
