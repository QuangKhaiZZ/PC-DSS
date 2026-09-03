# Yêu cầu hệ thống PC-DSS

## 1. Giới thiệu

PC-DSS là hệ hỗ trợ người dùng lựa chọn cấu hình máy tính cá nhân dựa trên nhu cầu sử dụng, ngân sách, hiệu năng và khả năng tương thích giữa các linh kiện.

Đây là bài tập lớn môn Hệ trợ giúp quyết định. Hệ thống được xây dựng ở mức cơ bản, tập trung vào quá trình tạo phương án, đánh giá và đề xuất cấu hình phù hợp.

## 2. Bài toán

Người dùng không có nhiều kiến thức về phần cứng thường gặp khó khăn khi lựa chọn linh kiện máy tính vì:

- Có nhiều loại linh kiện khác nhau.
- Mỗi linh kiện có giá và hiệu năng khác nhau.
- Một số linh kiện không tương thích với nhau.
- Cấu hình phù hợp còn phụ thuộc vào mục đích sử dụng.
- Người dùng phải lựa chọn trong giới hạn ngân sách.

PC-DSS hỗ trợ giảm số lượng phương án cần xem xét và đưa ra những cấu hình phù hợp để người dùng tham khảo.

## 3. Mục tiêu

Hệ thống cần:

- Cho phép người dùng nhập nhu cầu sử dụng.
- Cho phép người dùng nhập ngân sách tối đa.
- Tạo các cấu hình PC từ dữ liệu linh kiện có sẵn.
- Loại bỏ các cấu hình không tương thích.
- Loại bỏ các cấu hình vượt quá ngân sách.
- Chấm điểm cấu hình theo nhu cầu sử dụng.
- Xếp hạng và đề xuất tối đa ba cấu hình.
- Hiển thị lý do đề xuất để người dùng tham khảo.

Hệ thống chỉ hỗ trợ quyết định. Người dùng vẫn là người đưa ra lựa chọn cuối cùng.

## 4. Người sử dụng

### 4.1. Người dùng

Người dùng có thể:

- Chọn mục đích sử dụng máy tính.
- Nhập ngân sách tối đa.
- Yêu cầu hệ thống đề xuất cấu hình.
- Xem danh sách cấu hình được đề xuất.
- Xem tổng giá và điểm phù hợp.
- Xem lý do cấu hình được đề xuất.

### 4.2. Người quản lý dữ liệu

Trong phiên bản bài tập lớn, không yêu cầu xây dựng đăng nhập hoặc phân quyền.

Người quản lý dữ liệu có thể sử dụng các màn hình quản trị đơn giản để:

- Quản lý danh mục linh kiện.
- Quản lý thương hiệu.
- Quản lý thông tin linh kiện.

## 5. Dữ liệu đầu vào

Người dùng cung cấp:

### 5.1. Ngân sách

Người dùng nhập số tiền tối đa muốn sử dụng để lắp máy, tính bằng Việt Nam đồng.

Ví dụ:

- 10.000.000 VNĐ.
- 15.000.000 VNĐ.
- 20.000.000 VNĐ.

### 5.2. Mục đích sử dụng

Phiên bản đầu hỗ trợ ba nhu cầu:

- Văn phòng và học tập.
- Chơi game.
- Thiết kế đồ họa cơ bản.

Mỗi nhu cầu có mức độ ưu tiên linh kiện khác nhau.

Ví dụ:

- Chơi game ưu tiên GPU và CPU.
- Văn phòng ưu tiên CPU, RAM và chi phí hợp lý.
- Thiết kế đồ họa ưu tiên GPU, CPU và RAM.

## 6. Dữ liệu linh kiện

Hệ thống dự kiến quản lý các nhóm linh kiện:

- CPU.
- Mainboard.
- RAM.
- GPU.
- Ổ lưu trữ.
- PSU.
- Case.

Mỗi linh kiện có các thông tin cơ bản:

- Mã linh kiện.
- Tên linh kiện.
- Danh mục.
- Thương hiệu.
- Giá.
- Điểm hiệu năng.
- Một số thông số dùng để kiểm tra tương thích.
- Trạng thái đang được sử dụng trong hệ thống.

Dữ liệu được nhập thủ công để phục vụ bài tập lớn.

Hệ thống không yêu cầu tự động thu thập dữ liệu từ website hoặc cập nhật giá theo thời gian thực.

## 7. Quy tắc tương thích cơ bản

Phiên bản đầu chỉ kiểm tra những quy tắc chính:

### 7.1. CPU và Mainboard

Socket của CPU phải phù hợp với socket của Mainboard.

### 7.2. RAM và Mainboard

Loại RAM phải được Mainboard hỗ trợ.

Ví dụ:

- DDR4 sử dụng với Mainboard hỗ trợ DDR4.
- DDR5 sử dụng với Mainboard hỗ trợ DDR5.

### 7.3. Nguồn điện

Công suất PSU phải đủ cho công suất dự kiến của cấu hình.

### 7.4. Ngân sách

Tổng giá của tất cả linh kiện không được vượt quá ngân sách người dùng nhập.

Các quy tắc nâng cao như kích thước GPU, chiều cao tản nhiệt và số lượng cổng kết nối chưa bắt buộc trong phiên bản đầu.

## 8. Xử lý hỗ trợ quyết định

Hệ thống thực hiện theo các bước:

1. Nhận ngân sách và mục đích sử dụng.
2. Lấy dữ liệu linh kiện từ database.
3. Tạo các phương án cấu hình.
4. Loại bỏ phương án vượt ngân sách.
5. Loại bỏ phương án không tương thích.
6. Tính điểm phù hợp của từng phương án.
7. Sắp xếp phương án theo điểm.
8. Trả về tối đa ba cấu hình tốt nhất.

Hệ thống sử dụng phương pháp chấm điểm có trọng số.

Mỗi mục đích sử dụng có trọng số khác nhau. Các trọng số cụ thể sẽ được mô tả trong tài liệu thiết kế DSS.

Hệ thống không sử dụng Machine Learning trong phiên bản đầu.

## 9. Kết quả đầu ra

Mỗi cấu hình được đề xuất cần hiển thị:

- Danh sách linh kiện.
- Giá của từng linh kiện.
- Tổng giá cấu hình.
- Điểm phù hợp.
- Mục đích sử dụng.
- Lý do đề xuất.

Ví dụ lý do:

> Cấu hình phù hợp cho nhu cầu chơi game vì có GPU tốt, CPU đủ mạnh, các linh kiện tương thích và tổng giá không vượt quá ngân sách.

## 10. Yêu cầu chức năng

- FR-01: Hệ thống cho phép nhập ngân sách.
- FR-02: Hệ thống cho phép chọn mục đích sử dụng.
- FR-03: Hệ thống kiểm tra dữ liệu đầu vào.
- FR-04: Hệ thống tạo các phương án cấu hình.
- FR-05: Hệ thống kiểm tra ngân sách.
- FR-06: Hệ thống kiểm tra tương thích cơ bản.
- FR-07: Hệ thống tính điểm phù hợp.
- FR-08: Hệ thống xếp hạng cấu hình.
- FR-09: Hệ thống trả về tối đa ba cấu hình.
- FR-10: Hệ thống hiển thị lý do đề xuất.
- FR-11: Hệ thống cho phép quản lý danh mục linh kiện.
- FR-12: Hệ thống cho phép quản lý thương hiệu. 
- FR-13: Hệ thống cho phép quản lý dữ liệu linh kiện.

## 11. Yêu cầu phi chức năng

- Giao diện dễ sử dụng với người không hiểu sâu về phần cứng.
- API sử dụng định dạng JSON.
- Dữ liệu được lưu trong MySQL.
- Hệ thống chạy được trên môi trường local.
- Kết quả đề xuất cần có khả năng giải thích.
- Thời gian tạo đề xuất không quá 5 giây với dữ liệu thử nghiệm.

## 12. Phạm vi dữ liệu

Dữ liệu được chuẩn bị thủ công.

Mỗi danh mục dự kiến có khoảng 5 đến 10 linh kiện. Tổng dữ liệu khoảng 35 đến 70 linh kiện là đủ để minh họa hoạt động của hệ thống.

Giá linh kiện chỉ mang tính tham khảo và cần ghi thời điểm thu thập.

## 13. Ngoài phạm vi phiên bản đầu

Phiên bản đầu không yêu cầu:

- Đăng ký và đăng nhập.
- Phân quyền phức tạp.
- Thanh toán hoặc đặt mua linh kiện.
- Theo dõi đơn hàng.
- Thu thập giá tự động.
- Cập nhật giá theo thời gian thực.
- Machine Learning.
- Lưu lịch sử hành vi người dùng.
- Kiểm tra toàn bộ quy tắc phần cứng nâng cao.
- Triển khai hệ thống cho lượng người dùng lớn.

## 14. Tiêu chí hoàn thành

Bài tập được xem là hoàn thành khi:

- Người dùng nhập được nhu cầu và ngân sách.
- Hệ thống trả về tối đa ba cấu hình.
- Cấu hình không vượt quá ngân sách.
- CPU, Mainboard và RAM tương thích.
- PSU có công suất phù hợp.
- Các cấu hình được xếp hạng theo điểm.
- Kết quả có giải thích ngắn gọn.
- Frontend gọi được API backend.
- Hệ thống chạy được với dữ liệu thử nghiệm.