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
- Dự đoán điểm hiệu năng cấu hình theo nhu cầu bằng hồi quy tuyến tính đa biến.
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
- Xem tổng giá, điểm hiệu năng dự đoán và bài đo tương ứng.
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

Nhu cầu xác định mô hình và loại điểm hiệu năng cần dự đoán. Tên nhu cầu trên giao diện có thể dùng cách gọi chung; kết quả phải giải thích phạm vi bài đo đại diện, không khẳng định phù hợp với mọi phần mềm hoặc tác vụ.

Các đầu ra đang được xem xét:

| Nhu cầu | Đầu ra dự kiến | Trạng thái |
|---|---|---|
| Văn phòng và học tập | Điểm Productivity của PCMark 10. | Hướng đã đề xuất; cần xác minh phiên bản và dữ liệu trước khi chốt. |
| Chơi game | Điểm tổng Time Spy chế độ chuẩn. | Hướng đã đề xuất; cần xác minh phiên bản và dữ liệu trước khi chốt. |
| Thiết kế đồ họa cơ bản | Khảo sát Digital Content Creation của PCMark 10 hoặc một bài đo ứng dụng như Puget Bench for Photoshop. | Chưa chốt bài đo; không gộp điểm các bài đo này thành một nhãn. |

Phạm vi sản phẩm giữ đủ ba nhu cầu. Có thể triển khai thử từng mô hình theo thứ tự; việc chạy được một nhu cầu chưa có nghĩa đã hoàn thành toàn bộ hệ thống. Time Spy không được diễn giải trực tiếp thành FPS; Productivity chỉ phản ánh nhóm tác vụ của bài đo, không bao quát mọi hoạt động học tập.

## 6. Dữ liệu linh kiện

Hệ thống dự kiến quản lý các nhóm linh kiện:

- CPU.
- Mainboard.
- RAM.
- GPU.
- Ổ lưu trữ.
- PSU.
- Case.
- Tản nhiệt (Cooler).

Mỗi linh kiện có các thông tin cơ bản:

- Mã linh kiện.
- Tên linh kiện.
- Danh mục.
- Thương hiệu.
- Giá.
- Điểm benchmark tham chiếu cho CPU/GPU, kèm loại điểm, bài đo, phiên bản và nguồn.
- Một số thông số dùng để kiểm tra tương thích.
- Trạng thái đang được sử dụng trong hệ thống.

Dữ liệu được nhập thủ công để phục vụ bài tập lớn.

Hệ thống không yêu cầu tự động thu thập dữ liệu từ website hoặc cập nhật giá theo thời gian thực.

Dữ liệu linh kiện dùng để tạo cấu hình, tính giá và kiểm tra tương thích. Dữ liệu huấn luyện được thu thập riêng theo mục 12; không phải mọi thông số linh kiện đều là đầu vào hồi quy. Phạm vi thu thập ban đầu là máy tính để bàn, không trộn linh kiện hoặc lượt đo laptop vào cùng tập mà chưa kiểm chứng.

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
6. Ghép các đặc trưng đầu vào và dự đoán điểm hiệu năng bằng mô hình của nhu cầu đã chọn.
7. Sắp xếp phương án hợp lệ theo điểm dự đoán giảm dần.
8. Trả về tối đa ba cấu hình tốt nhất.

### 8.1. Vai trò của hồi quy

Thuật toán chính là hồi quy tuyến tính đa biến, thuộc học máy có giám sát. Mô hình học các hệ số từ cấu hình có điểm đo thực tế để dự đoán điểm của cấu hình chưa được đo. Hệ số không phải trọng số do nhóm tự gán.

Mỗi đầu ra được chốt sẽ có mô hình riêng. Không cộng trực tiếp điểm gaming, văn phòng và đồ họa vì chúng có thang đo và ý nghĩa khác nhau. Giá dùng để kiểm tra ngân sách; quy tắc phần cứng dùng để kiểm tra tương thích.

Các đầu vào ứng viên gồm điểm CPU đơn nhân/đơn luồng, điểm CPU đa nhân/đa luồng, điểm GPU tham chiếu độc lập, dung lượng và thông tin RAM. Chỉ dùng đúng loại điểm được nguồn định nghĩa; không tự coi các bài đo khác nhau là tương đương. Thông tin lưu trữ có thể được xem xét khi có dữ liệu phù hợp.

Danh sách này chưa phải bộ đầu vào bắt buộc cho cả ba mô hình. Trước khi thu thập số lượng lớn, nhóm phải ghi rõ cho từng mô hình: đầu ra, bài đo/nhóm phiên bản so sánh được, đầu vào, nguồn tham chiếu và quy tắc nhận mẫu. Mọi đầu vào phải có thể biết khi tư vấn cấu hình mới.

### 8.2. Trường hợp chưa đủ dữ liệu

Nếu chưa có mô hình được kiểm chứng cho nhu cầu, hoặc cấu hình thiếu đầu vào cần thiết/nằm ngoài phạm vi áp dụng đã xác định, hệ thống phải thông báo chưa đủ cơ sở dự đoán. Không tự tạo điểm hoặc âm thầm chuyển sang mô hình của nhu cầu khác.

Nếu có ít hơn ba cấu hình hợp lệ thì trả số lượng thực có; nếu không có thì giải thích lý do.

## 9. Kết quả đầu ra

Mỗi cấu hình được đề xuất cần hiển thị:

- Danh sách linh kiện.
- Giá của từng linh kiện.
- Tổng giá cấu hình.
- Điểm hiệu năng dự đoán, tên bài đo và loại điểm.
- Mục đích sử dụng.
- Lý do đề xuất.

Ví dụ lý do:

> Cấu hình được đề xuất vì các linh kiện đáp ứng những quy tắc tương thích đã kiểm tra, tổng giá nằm trong ngân sách và có điểm Time Spy dự đoán cao trong các phương án đã xét.

Điểm benchmark không phải phần trăm phù hợp hoặc cam kết hiệu năng trong mọi ứng dụng. Kết quả cần nêu ngắn gọn phạm vi của bài đo đại diện.

## 10. Yêu cầu chức năng

- FR-01: Hệ thống cho phép nhập ngân sách.
- FR-02: Hệ thống cho phép chọn mục đích sử dụng.
- FR-03: Hệ thống kiểm tra dữ liệu đầu vào.
- FR-04: Hệ thống tạo các phương án cấu hình.
- FR-05: Hệ thống kiểm tra ngân sách.
- FR-06: Hệ thống kiểm tra tương thích cơ bản.
- FR-07: Hệ thống dự đoán điểm hiệu năng bằng mô hình hồi quy của nhu cầu được chọn.
- FR-08: Hệ thống xếp hạng cấu hình.
- FR-09: Hệ thống trả về tối đa ba cấu hình.
- FR-10: Hệ thống hiển thị lý do đề xuất.
- FR-11: Hệ thống cho phép quản lý danh mục linh kiện.
- FR-12: Hệ thống cho phép quản lý thương hiệu. 
- FR-13: Hệ thống cho phép quản lý dữ liệu linh kiện.
- FR-14: Hệ thống thông báo khi thiếu mô hình, dữ liệu hoặc cấu hình hợp lệ để tư vấn.

## 11. Yêu cầu phi chức năng

- Giao diện dễ sử dụng với người không hiểu sâu về phần cứng.
- API sử dụng định dạng JSON.
- Dữ liệu được lưu trong MySQL.
- Hệ thống chạy được trên môi trường local.
- Kết quả đề xuất cần có khả năng giải thích.
- Thời gian tạo đề xuất không quá 5 giây với dữ liệu thử nghiệm.

## 12. Phạm vi dữ liệu

Dữ liệu được chuẩn bị thủ công theo [mẫu thu thập](data-collection-template.md), gồm ba phần:

| Phần dữ liệu | Vai trò |
|---|---|
| Danh mục linh kiện, giá và thông số | Tạo bộ máy, kiểm tra tương thích và ngân sách. |
| Benchmark tham chiếu theo model CPU/GPU | Cung cấp đặc trưng có thể tra cho cấu hình mới. |
| Benchmark cấu hình thực tế | Cung cấp cấu hình và kết quả đo làm mẫu huấn luyện/đánh giá. |

Danh mục ban đầu dự kiến khoảng 5–10 sản phẩm mỗi nhóm, điều chỉnh theo các cấu hình cần minh họa. Số sản phẩm không phải số mẫu huấn luyện. Giá chỉ mang tính tham khảo, phải có nguồn và thời điểm thu thập.

Một lượt đo có thể cung cấp nhiều loại điểm, nhưng các điểm đó thuộc cùng lượt đo và không tạo thành các máy độc lập. Không tự đặt điểm đầu ra bằng cách cộng điểm linh kiện.

### 12.1. Thu thập thử và chốt dữ liệu

- Ghép thử khoảng 5 mẫu đầy đủ cho mỗi nhu cầu để kiểm tra khả năng thu thập; đây không phải số mẫu đủ để kết luận độ chính xác.
- Kiểm tra model/biến thể, đơn vị, nguồn, điều kiện đo và khả năng so sánh phiên bản. Giữ dữ liệu gốc và lý do nhận, tạm giữ hoặc loại mẫu.
- Nhận diện đo lặp/cùng máy; không xem mọi mã lượt đo khác nhau là các cấu hình độc lập.
- Chỉ thu thập mở rộng sau khi thống nhất đầu ra và mẫu dữ liệu. Số mẫu chính thức phụ thuộc số đầu vào, độ đa dạng và kết quả đánh giá, không có một số lượng cố định bảo đảm mô hình tốt.
- Lưu phiên bản bộ dữ liệu, bảng tham chiếu và danh sách chia tập để tái hiện kết quả. Các trường chưa biết phải được ghi rõ, không thay bằng 0.

### 12.2. Huấn luyện và đánh giá

- Chia dữ liệu theo nhóm máy/cấu hình phù hợp với mục tiêu dự đoán; các lượt cùng nhóm không được xuất hiện ở cả phần học và phần đánh giá.
- Chỉ học phép chuẩn hóa, điền thiếu và lựa chọn biến trên dữ liệu huấn luyện; giữ tập kiểm tra cuối cùng ngoài quá trình điều chỉnh mô hình.
- Không dùng điểm thành phần của chính lượt đo đầu ra làm đặc trưng, như Graphics/CPU Score của cùng lượt Time Spy hoặc Writing/Spreadsheets của cùng lượt Productivity.
- Báo cáo MAE, RMSE và R² cho từng đầu ra; so sánh với mô hình luôn dự đoán trung bình của tập huấn luyện trên cùng dữ liệu đánh giá. R² không phải phần trăm dự đoán đúng.
- Thống nhất tiêu chí sai số chấp nhận được trước khi đánh giá cuối cùng; lưu đầu vào, hệ số, cách tiền xử lý, phiên bản dữ liệu và phạm vi áp dụng của mỗi mô hình.
- Kiểm tra ngân sách và tương thích riêng với đánh giá sai số hồi quy.

## 13. Ngoài phạm vi phiên bản đầu

Phiên bản đầu không yêu cầu:

- Đăng ký và đăng nhập.
- Phân quyền phức tạp.
- Thanh toán hoặc đặt mua linh kiện.
- Theo dõi đơn hàng.
- Thu thập giá tự động.
- Cập nhật giá theo thời gian thực.
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
- Cả ba nhu cầu có đầu ra, dữ liệu và mô hình được kiểm chứng trong phạm vi đã công bố.
- Các cấu hình được xếp hạng theo điểm hiệu năng dự đoán của nhu cầu tương ứng.
- Có báo cáo sai số và so sánh với dự đoán trung bình trên dữ liệu giữ ngoài huấn luyện; kết quả đáp ứng tiêu chí đã thống nhất.
- Trường hợp thiếu dữ liệu/mô hình hoặc không có cấu hình hợp lệ được thông báo rõ.
- Kết quả có giải thích ngắn gọn.
- Frontend gọi được API backend.
- Hệ thống chạy được với dữ liệu thử nghiệm.
