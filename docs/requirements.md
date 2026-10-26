# Yêu cầu hệ thống PC-DSS

Cập nhật: 26/10/2026. Phạm vi bài tập lớn môn Hệ trợ giúp quyết định.

## Mục tiêu

Hỗ trợ lựa chọn bộ PC máy bàn có sẵn theo ngân sách và mục đích sử dụng. Hệ thống lọc phương án, dự đoán điểm benchmark, xếp hạng và giải thích kết quả; người dùng quyết định cuối cùng.

## Đầu vào

- Ngân sách: số nguyên VNĐ dương, là mức tối đa cho thùng máy, không gồm màn hình.
- Mục đích: Gaming hoặc Rendering.
- Số kết quả: từ 1 đến 3, mặc định 3.

Gaming dự đoán 3DMark Time Spy Overall; Rendering dự đoán PCMark 10 Rendering and Visualization. Không diễn giải thành FPS, thời gian render hoặc tỷ lệ phù hợp.

## Dữ liệu

- `data/processed/pc_catalog.csv`: bộ PC, giá, CPU, GPU, RAM, SSD, nguồn và ngày kiểm tra.
- `data/processed/reference.csv`: điểm CPU Mark và GPU G3D Mark.
- `models/gaming/01-Mô-hình-triển-khai/model_info.json`, `models/rendering/model_info.json`: hệ số đã học, thứ tự đầu vào, phiên bản và phạm vi train.
- Excel nguồn, CSV benchmark và notebook được giữ riêng để truy vết, huấn luyện và đánh giá.

Hiện có 36 PC để kiểm thử, phân bố trên nhiều khoảng giá và tổ hợp CPU/GPU. Tăng số PC tư vấn không tự tăng độ chính xác model.

## Chức năng

1. Xem danh sách và chi tiết PC.
2. Dự đoán riêng cho một PC theo mục đích.
3. Nhận ngân sách và mục đích; loại PC vượt ngân sách.
4. Tra reference chính xác sau chuẩn hóa tên; không đổi biến thể CPU/GPU để ghép cho đủ.
5. Loại phương án thiếu reference hoặc không tạo được đầu vào, kèm lý do.
6. Tính điểm bằng model tương ứng.
7. Xếp điểm giảm dần; hòa điểm ưu tiên giá thấp rồi mã PC.
8. Trả tối đa 3 bộ với cấu hình, giá, ngân sách còn lại, lý do và cảnh báo.

Tồn kho tại cửa hàng không ảnh hưởng đến lọc, xếp hạng hoặc cảnh báo DSS. Ngoài khoảng train vẫn được dự đoán và xếp hạng nhưng phải đánh dấu ngoại suy. Không có phương án thì trả danh sách rỗng, không tự nâng ngân sách.

Render dùng giả định Windows 11 và trả rõ giả định trong API; không coi đó là Windows bán kèm. RAM/SSD hiện chỉ mô tả cấu hình, không là đầu vào model hoặc bộ lọc.

## Giao diện đã tích hợp

- Form chọn khoảng giá và Gaming/Rendering; trạng thái đang tải và lỗi nhập liệu/kết nối.
- Kết quả theo thứ hạng API, kèm giải thích, điểm benchmark dự đoán và cảnh báo.
- So sánh cấu hình, giá và điểm của các phương án cùng mục đích.
- Link nguồn sản phẩm và ngày kiểm tra.
- Ảnh sản phẩm từ trường `ImageUrl` trong catalog, phục vụ qua backend; hiển thị khung thay thế nếu không có ảnh hoặc tải ảnh thất bại.
- Không có phương án phù hợp phải được trình bày rõ.

Frontend đã gọi API tư vấn và hiển thị kết quả thực. Hợp đồng API nằm trong [hướng dẫn frontend](../frontend/README.md).

## Phạm vi không triển khai

Không tự ghép linh kiện, kiểm tra tương thích, CRUD Brand/Category/Product, MySQL, đăng nhập, giỏ hàng, thanh toán hoặc cập nhật giá tự động. Giá dùng để giới hạn ngân sách, chưa tối ưu tỷ lệ hiệu năng/giá. Không gộp điểm Gaming và Rendering.

## Tiêu chí nghiệm thu

- API chạy bằng CSV và metadata, không cần database.
- Không đề xuất bộ vượt ngân sách; không loại PC theo tồn kho của cửa hàng.
- Đúng model, thứ tự xếp hạng, số lượng và cảnh báo.
- C# tính khớp công thức/model Python đã xuất trên vector kiểm thử.
- Frontend hiển thị dữ liệu API thật và xử lý trường hợp không có kết quả.
- Báo cáo nêu rõ nguồn, giới hạn dữ liệu và đánh giá độc lập với kiểm thử phần mềm.

Backend đã qua kiểm thử chức năng; điều đó không chứng minh chính xác trên mọi PC mới. Xem [báo cáo model](model-check.md) và [kiểm thử API](../backend/tests/README.md).
