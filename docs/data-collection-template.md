# Hướng dẫn bổ sung dữ liệu PC

## Danh mục tư vấn

Cập nhật `data/processed/pc_catalog.csv`. Có thể dùng Excel để nhập nhưng khi xuất phải giữ đúng 10 tên cột và kiểu dữ liệu. CSV dùng UTF-8, dấu phẩy phân cột; ô chứa dấu phẩy hoặc xuống dòng phải được quote.

| Cột | Quy tắc |
|---|---|
| PcId | Mã duy nhất, ví dụ PC-031 |
| ProductName | Tên bộ PC đúng nguồn |
| Store | Tên cửa hàng |
| PriceVnd | Giá thùng máy, VNĐ nguyên dương; không gồm màn hình |
| CpuModel | Đúng CPU, giữ hậu tố F/K/KF |
| GpuModel | Đúng GPU và VRAM; không đồng nhất bản 6GB/8GB |
| RamCapacityGb | Tổng dung lượng RAM, GB nguyên dương |
| SsdCapacityGb | Tổng dung lượng SSD, GB nguyên dương; 1TB = 1000GB |
| SourceUrl | URL HTTP/HTTPS đúng sản phẩm |
| CheckedAt | Ngày kiểm tra YYYY-MM-DD |

Không điền 0 thay giá hoặc dung lượng chưa biết. Không tự đổi cấu hình rồi giữ giá/link bộ gốc. Không suy Windows bán kèm từ mức độ phổ biến của Windows 11.

Danh mục hiện có 10 PC. Khi mở rộng đến 40–50 bộ, phân bố nhiều khoảng giá, tránh lặp quá nhiều tổ hợp CPU/GPU. Link dùng làm nguồn cấu hình và giá; không cần thu thập tồn kho.

## Reference

Dùng schema hiện có trong `data/processed/reference.csv`. Giữ ReferenceId duy nhất, ComponentType, ModelName, TestName, TestVersion, Metric, RawScore, SourceUrl và CheckedAt.

CPU dùng CPU Mark, GPU dùng G3D Mark. Tra đúng model/biến thể; điểm đơn luồng không thay cho CPU Mark. Điểm phải có nguồn và ngày ghi nhận. Không đoán hoặc dùng điểm GPU có VRAM khác để lấp dữ liệu.

Thêm reference chỉ giúp tạo đầu vào. Model chưa được xác nhận trên linh kiện mới; xem cảnh báo phạm vi train. Backend không hỗ trợ mọi họ GPU cho Rendering chỉ vì đã có điểm reference.

## Benchmark huấn luyện

Giữ Excel nguồn trong `data/raw/`, CSV chuẩn hóa trong `data/processed/`, notebook trong `notebooks/`. Xem [hướng dẫn dữ liệu](../data/README.md).

- Gaming: GpuScore, CpuMultiScore → Time Spy Overall.
- Rendering: GpuScore, CpuMultiScore, IsIntel, GpuGeneration, IsUltra, IsWindows11 → Rendering and Visualization.
- Hệ điều hành đọc từ OperatingSystem, không trích tự do từ ReviewNote.
- Giữ nguồn, ghi chú duyệt và trạng thái ở dữ liệu nguồn; không đưa toàn bộ cột mô tả vào model.
- Đối chiếu đúng nhãn benchmark, không trộn Productivity vào Rendering and Visualization.
- Thay mẫu/nhãn phải ghi nhận và đánh giá lại; không dùng việc chọn lại mẫu test để kết luận model tốt hơn.

Danh mục PC có giá và dữ liệu benchmark huấn luyện là hai bảng phục vụ hai việc khác nhau.

## Sau khi cập nhật

1. Kiểm tra ID, kiểu dữ liệu, nguồn và CPU/GPU có reference tương ứng.
2. Dừng API rồi chạy lại `dotnet run` như [hướng dẫn backend](../backend/README.md), không dùng --no-build.
3. Gọi danh sách PC, dự đoán riêng và tư vấn bằng [Postman](PC-DSS.postman_collection.json).
4. Kiểm tra các cảnh báo, thứ hạng và ngân sách.
5. Khi thay catalog, cập nhật snapshot kỳ vọng của test danh mục sau khi kiểm tra độc lập; không sửa kỳ vọng chỉ để test qua.

Không cần train lại chỉ vì thêm bộ PC. Nếu thay thuật toán hoặc đầu vào model, cần cập nhật notebook, metadata, backend và kiểm thử tương ứng.
