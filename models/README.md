# Mô hình đã chốt

| Thư mục | Phiên bản | Gói nguồn |
|---|---|---|
| [gaming/](gaming/) | gaming-log-v1-20261012T164839924602Z | gaming_final_20261012T164839924602Z.zip |
| [rendering/](rendering/) | rendering-linear-v1-20261003T141514136988Z | rendering_model_20261003T141514136988Z.zip |

Mỗi thư mục giữ nội dung gói xuất: `model.joblib`, `model_info.json` và các CSV ghi lại dữ liệu/kết quả của lần huấn luyện đó. Gaming được chia thành bốn thư mục con có tên tiếng Việt; xem [hướng dẫn Gaming](gaming/README.md) để tìm từng file. Nội dung các file được giữ nguyên và không train lại khi sắp xếp.

- `model_info.json` mô tả thứ tự đầu vào, công thức, hệ số, phạm vi dữ liệu và giới hạn. Backend C# hiện tính công thức bằng các hệ số này.
- `model.joblib` là mô hình Python. Phiên bản thư viện đã dùng được ghi trong JSON.
- CSV tại đây là hồ sơ của từng lần xuất mô hình. Dataset đã làm gọn để làm việc nằm trong [data/processed/](../data/processed/).
- Gaming có `backend_test_vectors.csv` để đối chiếu phép tính. Render có `test_predictions.csv` với 26 mẫu test và dự đoán tương ứng.
- Gaming mới được tạo bằng [gamingtrain.ipynb](../notebooks/gamingtrain.ipynb). Các tệp `evaluation_*` lưu đánh giá riêng: 125 mẫu train/33 mẫu test, chia theo nhóm CPU–GPU, không trùng nhóm. R² test = 0,929341714; MAE = 1324,177879; RMSE = 1781,294489 điểm. `evaluation_model.joblib` chỉ học tập train; backend vẫn sử dụng hệ số của mô hình cuối học toàn bộ 158 mẫu. Hệ số cuối giống gói Gaming trước, nên điểm dự đoán không đổi. Đây là đánh giá lại trên dữ liệu hiện có, không phải kiểm chứng bằng benchmark mới thu thập.

Không so R² train của Gaming với R² test của Render như hai kết quả đánh giá tương đương. Gaming final fit trên toàn bộ dữ liệu hợp lệ; Render fit trên 104 mẫu. Các giới hạn chia tập được ghi trong [hướng dẫn dữ liệu](../data/README.md).

Hai mô hình đã được tích hợp vào backend. Xem [kiểm thử API](../backend/tests/README.md) để đối chiếu C# với kết quả Python.
