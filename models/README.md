# Mô hình đã chốt

| Thư mục | Phiên bản | Gói nguồn |
|---|---|---|
| [gaming/](gaming/) | gaming-log-v1-20261003T072837179133Z | gaming_final_20261003T072837179133Z.zip |
| [rendering/](rendering/) | rendering-linear-v1-20261003T141514136988Z | rendering_model_20261003T141514136988Z.zip |

Mỗi thư mục giữ nguyên toàn bộ nội dung gói xuất: `model.joblib`, `model_info.json` và các CSV ghi lại dữ liệu/kết quả của lần huấn luyện đó. Không nạp hoặc train lại mô hình trong bước sắp xếp thư mục.

- `model_info.json` mô tả thứ tự đầu vào, công thức, hệ số, phạm vi dữ liệu và giới hạn. Backend C# hiện tính công thức bằng các hệ số này.
- `model.joblib` là mô hình Python. Phiên bản thư viện đã dùng được ghi trong JSON.
- CSV tại đây là hồ sơ của từng lần xuất mô hình. Dataset đã làm gọn để làm việc nằm trong [data/processed/](../data/processed/).
- Gaming có `backend_test_vectors.csv` để đối chiếu phép tính. Render có `test_predictions.csv` với 26 mẫu test và dự đoán tương ứng.

Không so R² train của Gaming với R² test của Render như hai kết quả đánh giá tương đương. Gaming final fit trên toàn bộ dữ liệu hợp lệ; Render fit trên 104 mẫu. Các giới hạn chia tập được ghi trong [hướng dẫn dữ liệu](../data/README.md).

Hai mô hình đã được tích hợp vào backend. Xem [kiểm thử API](../backend/tests/README.md) để đối chiếu C# với kết quả Python.
