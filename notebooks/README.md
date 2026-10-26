# Notebook huấn luyện

- [gamingtrain.ipynb](gamingtrain.ipynb): bản Gaming mới nhất, có đầy đủ Markdown và code để chạy trên Colab. Chia theo nhóm CPU–GPU bằng GroupShuffleSplit (20% nhóm test, random_state=42); mô hình đánh giá học 125 mẫu và kiểm tra 33 mẫu trên dữ liệu hiện tại. So sánh thêm với dự đoán bằng trung bình train. Sau đánh giá, mô hình triển khai học lại toàn bộ 158 mẫu; hệ số và dự đoán giữ nguyên so với gói cũ. Gói xuất mới đã được đưa vào `models/gaming/`.
- [rendering_train.ipynb](rendering_train.ipynb): bản Render đã sửa để đọc `OperatingSystem`, nhận cả Win 10/11 và Windows 10/11, báo lỗi khi giá trị không hợp lệ. Đây là bản code dùng cho gói Render mới đã chốt. Giữ yêu cầu 100 mẫu ACCEPT, chia 80/20 và kiểm định chéo KFold như notebook trước.

## Chạy trên Google Colab

1. Mở Colab và tải notebook cần chạy lên.
2. Chạy các ô theo thứ tự; khi được yêu cầu, chọn [Benchmark final.xlsx](../data/raw/Benchmark%20final.xlsx).
3. Xem kết quả và tải gói ZIP được xuất.

Notebook dùng thao tác upload của Colab, không tự đọc đường dẫn tương đối trên máy cá nhân. Chạy lại tạo một phiên bản xuất mới; cần kiểm tra dữ liệu, hệ số và dự đoán trước khi thay các file trong `models/`.

Notebook Render ở đây chưa có kết quả chạy lưu trong ô; kết quả của lần chạy đã chốt nằm tại [models/rendering/](../models/rendering/). Bản gốc trước khi sửa Windows vẫn ở nơi người dùng cung cấp, không dùng làm notebook Render chính.
