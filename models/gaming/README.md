# Gói mô hình Gaming

Các file được chia thành bốn nhóm để dễ trình bày. Nội dung của 12 file xuất từ Colab được giữ nguyên; chỉ thay đổi vị trí lưu.

| Thư mục | Chứa gì? | Dùng để làm gì? |
|---|---|---|
| `01-Mô-hình-triển-khai` | `model_info.json`, `model.joblib` | Mô hình cuối học trên 158 mẫu. Backend lấy hệ số từ JSON; joblib dùng để nạp lại trong Python. |
| `02-Dữ-liệu-đi-kèm` | `data_used.csv`, `excluded_rows.csv`, `reference.csv` | Lưu 158 mẫu đã sử dụng, 2 dòng không được dùng và bảng tham chiếu của lần train. |
| `03-Đánh-giá-train-test` | Năm file `evaluation_*` | Mô hình riêng học 125 mẫu, cách chia tập và kết quả kiểm tra 33 mẫu. |
| `04-Kiểm-tra-mô-hình` | `training_predictions.csv`, `backend_test_vectors.csv` | Dự đoán trên 158 mẫu đã học và 252 tổ hợp kiểm tra công thức. Các tổ hợp không phải benchmark thực đo. |

## Năm file đánh giá

- `evaluation_model.joblib`: mô hình chỉ học tập train.
- `evaluation_info.json`: phương án đánh giá, hệ số, nguồn dữ liệu.
- `evaluation_split.csv`: mẫu nào thuộc train/test.
- `evaluation_test_predictions.csv`: điểm thực, dự đoán và sai số từng mẫu test.
- `evaluation_metrics.csv`: bảng MAE, RMSE, R² và baseline.

## Backend lấy file nào?

Khi build/publish, dự án backend lấy `01-Mô-hình-triển-khai/model_info.json` và đóng gói thành `DssData/gaming/model_info.json` cạnh ứng dụng. Backend đọc bản đóng gói này, cùng danh mục PC và bảng tham chiếu ở `data/processed`. Backend không đọc các CSV đánh giá để dự đoán và không huấn luyện lại.

Notebook vẫn xuất ZIP với các tên file gốc ở cùng một cấp. Khi nhận một gói mới từ Colab, xếp các file vào bốn nhóm trên trước khi build backend. Các tên file được ghi trong metadata của gói xuất vẫn là tên gốc; dùng bảng trên để tìm vị trí lưu trong dự án.

## Cách nói khi bảo vệ

“Nhóm chia gói xuất thành mô hình triển khai, dữ liệu đi kèm, kết quả đánh giá và các file kiểm tra. Backend sử dụng hệ số từ JSON; các file còn lại giúp truy vết và tái lập quá trình xây dựng mô hình.”
