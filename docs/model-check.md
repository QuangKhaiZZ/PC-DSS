# Kiểm tra nhanh hai model PC-DSS

Đã nạp trực tiếp hai file model.joblib và chạy predict; đối chiếu công thức JSON, dự đoán đã lưu, đầu vào train và các test vector gaming. Tất cả khớp trong sai số số thực 1e-7. Không sửa backend, không train lại, SHA-256 các file model giữ nguyên.

## Sai số tính lại

| Model / tập dữ liệu | Số mẫu | MAE (điểm) | RMSE (điểm) | MAPE | R² |
|---|---:|---:|---:|---:|---:|
| gaming_train | 158 | 1464.66 | 1904.39 | 8.15% | 0.9307 |
| rendering_train | 104 | 1640.59 | 2391.79 | 9.94% | 0.8227 |
| rendering_test | 26 | 1726.93 | 2006.24 | 8.92% | 0.8774 |

Gaming: sai số trên 158 mẫu đã học, không phải test độc lập. Render: 26 mẫu giữ lại theo cách chia hiện có; cross-validation ghi trong model_info chưa được chạy lại trong lượt kiểm tra này.

## Những điểm cần lưu ý

- Render có 0 nhóm CPU–GPU trùng giữa train/test, gồm 0 dòng test: . Cách chia gốc theo từng dòng; số nhóm trùng được kiểm tra từ dữ liệu hiện tại.
- Có 79 dòng train render còn ghi Productivity trong ReviewNote dù target khai báo Rendering and Visualization. Script không dùng note làm nhãn; chưa xác minh nguồn web nên chưa thể kết luận cột Score thực sự đúng loại benchmark. Cần đối chiếu nguồn trước khi khẳng định chất lượng nhãn.
- Hệ số Windows 11 là +3306.14 điểm khi giữ nguyên các biến khác. Đây là quan hệ thống kê của dữ liệu, không phải chứng minh nâng Windows làm máy nhanh thêm từng đó.
- Gaming dự đoán Time Spy Overall, không phải FPS. Render dự đoán PCMark 10 Rendering and Visualization, không phải thời gian render Blender.

## Chạy thử danh mục PC

- Chạy được 36/36 bộ, ghép CPU/GPU với reference thành công; điểm trả về hữu hạn và dương. Có 30 cặp CPU–GPU khác nhau.
- Render dùng giả định Windows 11 cho toàn bộ lượt thử; không ghi đây là OS bán kèm theo shop.
- PC ngoài phạm vi train: không có trong danh mục hiện tại. Cờ được tính từ reference và khoảng train của từng model.
- Các bộ cùng CPU/GPU sẽ có cùng điểm dự đoán trong kịch bản này dù giá/RAM/SSD khác nhau: model không dùng RAM/SSD hay giá.
- Danh mục dùng cấu hình và giá tham khảo để chạy DSS; tồn kho cửa hàng không phải đầu vào hay điều kiện lọc.
- Không có benchmark thực đo cho 36 PC, nên không tính độ chính xác trên danh mục. IN_RANGE không phải chứng nhận dự đoán đúng.

## Các mẫu lệch nhiều nhất ở tập test render

| RunId | Điểm thật | Dự đoán | Lệch tuyệt đối | Lệch % |
|---|---:|---:|---:|---:|
| RUN-RENDER-101 | 11034 | 8790 | 2244 | 20.34% |
| RUN-RENDER-106 | 16497 | 19640 | 3143 | 19.05% |
| RUN-RENDER-005 | 12947 | 10838 | 2109 | 16.29% |
| RUN-RENDER-019 | 16610 | 19304 | 2694 | 16.22% |
| RUN-RENDER-094 | 18641 | 21633 | 2992 | 16.05% |

## Kết luận và cách chạy lại

Đạt kiểm tra thực thi và tính nhất quán của file xuất. Backend đã tích hợp hai model và có kiểm thử tương đương C#/Python; xem [kiểm thử API](../backend/tests/README.md). Báo cáo này đo mô hình Python riêng, không thay thế kiểm thử luồng tư vấn. Chưa đủ bằng chứng để tuyên bố chính xác trên cấu hình mới. Ưu tiên đối chiếu nhãn render còn ghi Productivity; sau đó đánh giá gaming độc lập và render chia theo nhóm nếu cần báo cáo khả năng tổng quát hóa.

`python scripts/check_models.py` hoặc thêm `--deps PATH`. Lượt này dùng numpy 2.3.5, scikit-learn 1.6.1, joblib 1.5.2; đã nạp và đối chiếu dự đoán thành công.

Chi tiết: [model_check.json](../data/validation/model_check.json), [benchmark_errors.csv](../data/validation/benchmark_errors.csv), [pc_predictions.csv](../data/validation/pc_predictions.csv).
