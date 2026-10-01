# Notebook huấn luyện

- [gaming_final_train.ipynb](gaming_final_train.ipynb): bản Gaming final do nhóm cung cấp, giữ nguyên nội dung. Dùng hai điểm GpuScore và CpuMultiScore; fit trên toàn bộ mẫu hợp lệ. Notebook đánh giá/so sánh riêng chưa được đưa vào thư mục này.
- [rendering_train.ipynb](rendering_train.ipynb): bản Render đã sửa để đọc `OperatingSystem`, nhận cả Win 10/11 và Windows 10/11, báo lỗi khi giá trị không hợp lệ. Đây là bản code dùng cho gói Render mới đã chốt. Giữ yêu cầu 100 mẫu ACCEPT, chia 80/20 và kiểm định chéo KFold như notebook trước.

## Chạy trên Google Colab

1. Mở Colab và tải notebook cần chạy lên.
2. Chạy các ô theo thứ tự; khi được yêu cầu, chọn [Benchmark final.xlsx](../data/raw/Benchmark%20final.xlsx).
3. Xem kết quả và tải gói ZIP được xuất.

Notebook dùng thao tác upload của Colab, không tự đọc đường dẫn tương đối trên máy cá nhân. Chạy lại tạo một phiên bản xuất mới; cần kiểm tra dữ liệu, hệ số và dự đoán trước khi thay các file trong `models/`.

Notebook Render ở đây chưa có kết quả chạy lưu trong ô; kết quả của lần chạy đã chốt nằm tại [models/rendering/](../models/rendering/). Bản gốc trước khi sửa Windows vẫn ở nơi người dùng cung cấp, không dùng làm notebook Render chính.
