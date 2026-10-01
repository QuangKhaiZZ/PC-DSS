# Kiểm tra nhanh hai model PC-DSS

## Bản dữ liệu hiện tại

Model: rendering-linear-v1-20261001T151656208296Z. Hash Excel lúc train được giữ trong metadata; Excel hiện tại đã làm sạch ghi chú và thông tin RAM, không đổi đầu vào/nhãn model.
Người dùng đã thay lượt benchmark và URL ở RUN-RENDER-031 (14827 điểm) và RUN-RENDER-074 (21275 điểm). Hai dòng vẫn ở tập test; hệ số model không đổi. Điểm test tốt hơn do tập test thay đổi, không chứng minh model được cải thiện. Nên có tập đánh giá độc lập chưa chọn lại theo sai số nếu cần kết luận tổng quát hóa.
Ghi chú dòng 031/074 đã đồng bộ với lượt mới; RAM speed dòng 074 là 4788 MHz. Các trường này không thuộc đầu vào model.
Backend dùng metadata trong models/gaming/ và models/rendering/. Các bản lưu trữ không được nạp khi dự đoán.

Đã nạp trực tiếp hai file model.joblib và chạy predict; đối chiếu công thức JSON, dự đoán đã lưu, đầu vào train và các test vector gaming. Tất cả khớp trong sai số số thực 1e-7. Không sửa backend, không train lại, SHA-256 các file model giữ nguyên.

## Sai số tính lại

| Model / tập dữ liệu | Số mẫu | MAE (điểm) | RMSE (điểm) | MAPE | R² |
|---|---:|---:|---:|---:|---:|
| gaming_train | 144 | 1525.96 | 1956.81 | 8.29% | 0.9261 |
| rendering_train | 80 | 1730.15 | 2541.66 | 10.03% | 0.8022 |
| rendering_test | 20 | 1771.69 | 2157.74 | 9.55% | 0.8746 |

Gaming: sai số trên 144 mẫu đã học, không phải test độc lập. Render: 20 mẫu giữ lại theo cách chia hiện có; cross-validation ghi trong model_info chưa được chạy lại trong lượt này.

## Những điểm cần lưu ý

- Render có 1 nhóm CPU–GPU trùng giữa train/test, gồm 1 dòng test: intelcoreultra7265f__geforcertx5080. Kết quả test chưa hoàn toàn đại diện cho cặp CPU–GPU mới.
- Có 80 dòng train render còn ghi Productivity trong ReviewNote dù target khai báo Rendering and Visualization. Script không dùng note làm nhãn; chưa xác minh nguồn web nên chưa thể kết luận cột Score thực sự đúng loại benchmark. Cần đối chiếu nguồn trước khi khẳng định chất lượng nhãn.
- Hệ số Windows 11 là +4587.05 điểm khi giữ nguyên các biến khác. Đây là quan hệ thống kê của dữ liệu, không phải chứng minh nâng Windows làm máy nhanh thêm từng đó.
- Gaming dự đoán Time Spy Overall, không phải FPS. Render dự đoán PCMark 10 Rendering and Visualization, không phải thời gian render Blender.

## Chạy thử danh mục PC

- Chạy được 12/12 bộ, ghép CPU/GPU với reference thành công; điểm trả về hữu hạn và dương. Có 8 cặp CPU–GPU khác nhau.
- Render dùng giả định Windows 11 cho toàn bộ lượt thử; không ghi đây là OS bán kèm theo shop.
- PC-008 và PC-011 (RTX 3050 6GB) được đánh dấu ngoại suy: 10741 thấp hơn mức GPU tối thiểu train 12460.
- Các bộ cùng CPU/GPU sẽ có cùng điểm dự đoán trong kịch bản này dù giá/RAM/SSD khác nhau: model không dùng RAM/SSD hay giá.
- Tồn kho chỉ được mang theo để kiểm thử; không lọc bỏ bộ hết hàng và không đề xuất mua trong script này.
- Không có benchmark thực đo cho 12 PC, nên không tính độ chính xác trên danh mục. IN_RANGE không phải chứng nhận dự đoán đúng.

## Các mẫu lệch nhiều nhất ở tập test render

| RunId | Điểm thật | Dự đoán | Lệch tuyệt đối | Lệch % |
|---|---:|---:|---:|---:|
| RUN-RENDER-013 | 12411 | 17827 | 5416 | 43.64% |
| RUN-RENDER-019 | 16610 | 19351 | 2741 | 16.50% |
| RUN-RENDER-005 | 12947 | 11258 | 1689 | 13.04% |
| RUN-RENDER-011 | 12969 | 14607 | 1638 | 12.63% |
| RUN-RENDER-054 | 30095 | 26343 | 3752 | 12.47% |

## Kết luận và cách chạy lại

Đạt kiểm tra thực thi và tính nhất quán của file xuất. Backend đã tích hợp hai model và có kiểm thử tương đương C#/Python; xem [kiểm thử API](../backend/tests/README.md). Báo cáo này đo mô hình Python riêng, không thay thế kiểm thử luồng tư vấn. Chưa đủ bằng chứng để tuyên bố chính xác trên cấu hình mới. Ưu tiên đối chiếu nhãn render còn ghi Productivity; sau đó đánh giá gaming độc lập và render chia theo nhóm nếu cần báo cáo khả năng tổng quát hóa.

`python scripts/check_models.py` (numpy 2.1.3, scikit-learn 1.6.1, joblib 1.5.3). Có thể thêm `--deps PATH` để dùng thư viện ở thư mục riêng. Metadata gốc ghi joblib 1.6.0; lượt kiểm tra này dùng 1.5.3, đã nạp và đối chiếu dự đoán thành công.

Chi tiết: [model_check.json](../data/validation/model_check.json), [benchmark_errors.csv](../data/validation/benchmark_errors.csv), [pc_predictions.csv](../data/validation/pc_predictions.csv).
