# Yêu cầu hệ thống PC-DSS

Cập nhật: 02/10/2026. Phạm vi bài tập lớn môn Hệ trợ giúp quyết định.

## Mục tiêu

Hỗ trợ lựa chọn bộ PC máy bàn có sẵn theo ngân sách và mục đích sử dụng. Hệ thống lọc phương án, dự đoán điểm benchmark, xếp hạng và giải thích kết quả; người dùng quyết định cuối cùng.

## Đầu vào

- Ngân sách: số nguyên VNĐ dương, là mức tối đa cho thùng máy, không gồm màn hình.
- Mục đích: Gaming hoặc Rendering.
- Số kết quả: từ 1 đến 3, mặc định 3.

Gaming dự đoán 3DMark Time Spy Overall; Rendering dự đoán PCMark 10 Rendering and Visualization. Không diễn giải thành FPS, thời gian render hoặc tỷ lệ phù hợp.

## Dữ liệu

- `data/processed/pc_catalog.csv`: bộ PC, giá, CPU, GPU, RAM, SSD, tình trạng hàng, nguồn và ngày kiểm tra.
- `data/processed/reference.csv`: điểm CPU Mark và GPU G3D Mark.
- `models/gaming/model_info.json`, `models/rendering/model_info.json`: hệ số đã học, thứ tự đầu vào, phiên bản và phạm vi train.
- Excel nguồn, CSV benchmark và notebook được giữ riêng để truy vết, huấn luyện và đánh giá.

Hiện có 12 PC để kiểm thử. Mục tiêu mở rộng 40–50 bộ với nhiều khoảng giá và tổ hợp CPU/GPU; đây là kế hoạch dữ liệu, chưa phải số lượng đã có. Tăng số PC tư vấn không tự tăng độ chính xác model.

## Chức năng

1. Xem danh sách và chi tiết PC.
2. Dự đoán riêng cho một PC theo mục đích.
3. Nhận ngân sách và mục đích; loại PC vượt ngân sách hoặc hết hàng.
4. Tra reference chính xác sau chuẩn hóa tên; không đổi biến thể CPU/GPU để ghép cho đủ.
5. Loại phương án thiếu reference hoặc không tạo được đầu vào, kèm lý do.
6. Tính điểm bằng model tương ứng.
7. Xếp điểm giảm dần; hòa điểm ưu tiên giá thấp rồi mã PC.
8. Trả tối đa 3 bộ với cấu hình, giá, ngân sách còn lại, lý do và cảnh báo.

Tồn kho UNKNOWN vẫn được xét kèm cảnh báo. Ngoài khoảng train vẫn được dự đoán và xếp hạng nhưng phải đánh dấu ngoại suy. Không có phương án thì trả danh sách rỗng, không tự nâng ngân sách.

Render dùng giả định Windows 11, phải hiển thị rõ; không coi đó là Windows bán kèm. RAM/SSD hiện chỉ mô tả cấu hình, không là đầu vào model hoặc bộ lọc.

## Giao diện cần tích hợp

- Form ngân sách và Gaming/Rendering; trạng thái đang tải và lỗi nhập liệu/kết nối.
- Kết quả theo thứ hạng API, kèm giải thích, điểm benchmark dự đoán và cảnh báo.
- So sánh cấu hình, giá và điểm của các phương án cùng mục đích.
- Link nguồn sản phẩm và ngày kiểm tra.
- Ảnh chưa bắt buộc; ảnh chung phải ghi là minh họa. Catalog hiện không có ImageUrl.
- Không có phương án phù hợp phải được trình bày rõ.

Frontend hiện chưa nối luồng tư vấn mới. Hợp đồng API nằm trong [hướng dẫn frontend](frontend-integration.md).

## Phạm vi không triển khai

Không tự ghép linh kiện, kiểm tra tương thích, CRUD Brand/Category/Product, MySQL, đăng nhập, giỏ hàng, thanh toán hoặc cập nhật giá tự động. Giá dùng để giới hạn ngân sách, chưa tối ưu tỷ lệ hiệu năng/giá. Không gộp điểm Gaming và Rendering.

## Tiêu chí nghiệm thu

- API chạy bằng CSV và metadata, không cần database.
- Không đề xuất bộ vượt ngân sách hoặc OUT_OF_STOCK.
- Đúng model, thứ tự xếp hạng, số lượng và cảnh báo.
- C# tính khớp công thức/model Python đã xuất trên vector kiểm thử.
- Frontend hiển thị dữ liệu API thật và xử lý trường hợp không có kết quả.
- Báo cáo nêu rõ nguồn, giới hạn dữ liệu và đánh giá độc lập với kiểm thử phần mềm.

Backend đã qua kiểm thử chức năng; điều đó không chứng minh chính xác trên mọi PC mới. Xem [báo cáo model](model-check.md) và [kiểm thử API](../backend/tests/README.md).
