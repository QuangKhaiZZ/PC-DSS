# Dữ liệu PC-DSS

## Các bản đang sử dụng

- [raw/Benchmark final.xlsx](raw/Benchmark%20final.xlsx): Excel nguồn để nhập liệu, duyệt mẫu và đối chiếu nguồn benchmark.
- [processed/gaming_dataset.csv](processed/gaming_dataset.csv): 158 mẫu Gaming hợp lệ.
- [processed/rendering_dataset.csv](processed/rendering_dataset.csv): 130 mẫu Render, giữ đúng 104 train và 26 test của gói xuất mới.
- [processed/reference.csv](processed/reference.csv): 19 điểm CPU Mark và 14 điểm GPU G3D Mark. Giữ nguyên 32 reference lúc train và thêm i5-12600KF cho suy luận trên catalog; snapshot trong hai gói model được giữ nguyên.
- [processed/dataset_info.json](processed/dataset_info.json): danh sách đầu vào, mã SHA-256, phiên bản mô hình và các kiểm tra đã thực hiện. Tên ZIP trong file này là tên gói mô hình nguồn; nội dung các gói đã được lưu tại `models/gaming/` và `models/rendering/`.

CSV dùng UTF-8 có BOM, dấu phẩy phân cột và dấu chấm thập phân. Các file trong `processed/` có thể được dùng trực tiếp.

## Đầu vào và điểm đích

| Dataset | X theo đúng thứ tự | y: cột Score |
|---|---|---|
| Gaming | GpuScore, CpuMultiScore | 3DMark Time Spy Overall |
| Render | GpuScore, CpuMultiScore, IsIntel, GpuGeneration, IsUltra, IsWindows11 | PCMark 10 Rendering and Visualization |

`RunId` dùng truy vết. `MachineGroupId` là nhóm tên CPU–GPU đã chuẩn hóa, giữ biến thể VRAM; không phải mã máy vật lý. `Split` ghi phần train/test của Render. Ba cột này không phải đầu vào dự đoán; chỉ chọn các cột X trong bảng trên khi chạy mô hình.

Windows lấy từ `OperatingSystem`: Win 11/Windows 11 = 1; Win 10/Windows 10 = 0. Không đọc Windows từ `ReviewNote`, không tự thay giá trị thiếu bằng 0.

Hai dòng Gaming `RUN-GAMING-020` và `RUN-GAMING-032` đang `REVIEW` nên không được xuất. Mọi điểm đầu vào và điểm đích đã được đối chiếu với các gói mô hình đang sử dụng.

## Cách sử dụng và cập nhật

Notebook trong [notebooks/](../notebooks/) hiện đọc trực tiếp Excel trên Colab. Tải lên bản trong `raw/` để chạy. CSV trong `processed/` là bảng đã chuẩn bị để phân tích, đối chiếu hoặc dùng trong quy trình huấn luyện khác.

Khi sửa dữ liệu nguồn, xuất lại CSV và cập nhật thông tin phiên bản; không sửa trực tiếp điểm trong CSV rồi coi đó là dữ liệu gốc. Giữ dấu vết của bản dữ liệu và mô hình cũ khi tạo phiên bản mới.

Gaming final fit trên toàn bộ 158 mẫu; CSV Gaming không có tập test độc lập. Với Render, dùng `Split=train` để fit và `Split=test` để đánh giá. CSV đã sắp theo RunId, nên không chia ngẫu nhiên lại theo vị trí rồi kỳ vọng giữ đúng tập test cũ.

## Giới hạn hiện tại

- RTX 3050 6GB có G3D Mark 10.740, khớp dữ liệu train mới và nằm trong khoảng train của cả hai model. i5-14400F, i5-12400F, i7-12700KF, RTX 5060 Ti 8GB và RTX 4060 đã có reference.
- Render chia theo từng dòng với random_state=42; lần xuất này không có cặp CPU–GPU trùng giữa train và test. Không thay đổi sang thuật toán chia theo nhóm.
- Các ghi chú render ngoài dòng 031/074 có thể còn nội dung cũ nhắc Productivity; chúng không được dùng làm X hoặc y. Không suy ra sai nhãn chỉ từ ghi chú.
- Các bảng gaming/rendering là dữ liệu benchmark. Danh mục PC có giá được lưu riêng bên dưới, không trộn vào dữ liệu huấn luyện.

## Danh mục PC để test — cập nhật 04/10/2026

- [Bản Excel catalog](../outputs/catalog-update-20261004/pc_catalog.xlsx): bản xem/chỉnh sửa cục bộ; backend đọc CSV bên dưới.
- [processed/pc_catalog.csv](processed/pc_catalog.csv): 36 PC, giữ 10 cột cần thiết, UTF-8 BOM; sắp theo giá tăng dần.
- [raw/PC_source_links.xlsx](raw/PC_source_links.xlsx): bản sao file nguồn nguyên vẹn.
- [raw/pc_source_review.json](raw/pc_source_review.json): kết quả rà soát 30 link. `catalog_review_details` lưu các thông tin kiểm tra đã tách khỏi bảng PC chính, nối bằng `PcId`; đây là snapshot tại ngày kiểm tra, không phải đầu vào model tự cập nhật.

### 10 cột của bảng PC

`PcId`, `ProductName`, `Store`, `PriceVnd`, `CpuModel`, `GpuModel`, `RamCapacityGb`, `SsdCapacityGb`, `SourceUrl`, `CheckedAt`.

Giá tính VND/thùng máy, không gồm màn hình. RAM/SSD tính GB; 1TB SSD = 1000GB. Giữ đúng cấu hình gốc theo shop, không chỉnh linh kiện rồi dùng lại giá cũ. Nếu cần bộ giả lập để kiểm thử, lưu riêng và đánh dấu rõ. Các nguồn không chỉ có GEARVN.

Có 13 bộ dưới 20 triệu trong 36 bộ. Tất cả đều được xét theo ngân sách và đầu vào model, không dựa vào tồn kho tại link. Giá là giá tham khảo theo nguồn và ngày ghi nhận.

### Tạo đầu vào dự đoán ở backend

Backend hiện tra điểm CPU/GPU từ reference và tạo các biến theo `model_info.json`, thay vì lưu lặp trong danh mục PC. Gaming dùng GpuScore, CpuMultiScore; Render dùng GpuScore, CpuMultiScore, IsIntel, GpuGeneration, IsUltra, IsWindows11. Xem [hướng dẫn backend](../backend/README.md) để chạy API và cập nhật CSV.

Backend chạy render với giả định Windows 11 (`IsWindows11=1`) và trả rõ giả định trong kết quả API. Theo yêu cầu ngày 04/10/2026, không hiển thị cảnh báo Windows 11 trên thẻ kết quả. Không biến giả định này thành thông tin Windows bán kèm. Chỉ PC-029 có Windows 11 Home được nguồn xác nhận; thông tin OS gốc vẫn giữ trong bảng rà soát JSON.

PC-008 và PC-011 dùng RTX 3050 6GB: backend tra đúng điểm 10.740 của bản 6GB. Hai PC này hiện nằm trong khoảng train; không dùng điểm bản 8GB thay thế.

PC-027 có mainboard mô tả khác bảng; PC-030 dùng URL cửa hàng cũ do người dùng cung cấp. Không bổ sung kiểm tra tương thích. Danh mục này phục vụ test chức năng DSS, không chứng minh độ chính xác model trên các bộ PC thực tế.

## Bản model cập nhật ngày 03/10/2026

Gaming dùng `gaming-log-v1-20261003T072837179133Z`; Rendering dùng `rendering-linear-v1-20261003T141514136988Z`. Nội dung hai ZIP được giữ nguyên trong `models/`. CSV Gaming có 158 mẫu; CSV Render có 104 train và 26 test, không chia lại khi nhập.

Excel raw là bản sao nguyên vẹn của `Benchmark finals.xlsx`, khớp SHA-256 đầu vào train Rendering. Điểm, cấu hình Gaming và reference cũng khớp gói Gaming; hash file lúc train Gaming khác và được giữ riêng trong metadata, không ghi đè lịch sử bằng hash mới.

Bản dự phòng trước khi thay được ghi ở `backup_archive` trong `processed/dataset_info.json`. Danh mục PC có giá được giữ nguyên. Xem [báo cáo model](../docs/model-check.md) và [kiểm thử API](../backend/tests/README.md).

## Thu gọn danh mục ngày 03/10/2026

Đã bỏ PC-022 (XGEAR C.N 01) và PC-024 (PC79 GMN3203). Hai bộ cùng i3-12100F / RTX 3060 12GB với PC-021 nhưng có giá cao hơn và không tạo thêm tổ hợp đầu vào model. Đây là quyết định giảm mẫu lặp, không kết luận cửa hàng hoặc nguồn sai. Giữ PC-021 làm đại diện tổ hợp này. Danh mục ở thời điểm thu gọn còn 10 bộ, trong đó 6 bộ i3.


## Bổ sung catalog ngày 04/10/2026

Thêm 26 link người dùng cung cấp, PC-031 đến PC-056; tổng 36 PC. Không bỏ các sản phẩm khác URL dù trùng CPU/GPU. Windows 11 là kịch bản dự đoán được người dùng lựa chọn cho toàn bộ danh mục, không phải xác nhận giấy phép OS bán kèm.

| Giá (triệu VND) | Số bộ |
|---|---:|
| Dưới 15 | 5 |
| 15 đến dưới 20 | 8 |
| 20 đến dưới 25 | 4 |
| 25 đến dưới 35 | 6 |
| 35 đến dưới 45 | 6 |
| 45 đến dưới 60 | 4 |
| Từ 60 | 3 |

Nguồn và bảng linh kiện mới: [pc_catalog_sources_20261004.json](raw/pc_catalog_sources_20261004.json). Dùng bảng linh kiện chi tiết khi trang nguồn mâu thuẫn với tên URL hoặc ô thông số tóm tắt:

- PC-039: ASUS RTX 3060 OC 12GB V2, không dùng giá trị 8GB trong tóm tắt.
- PC-043: i5-12400F + MSI RTX 5060 Ti Shadow 2X OC Plus 16GB; URL còn ghi 13400F, ô CPU tóm tắt ghi 14400F và GPU tóm tắt ghi 8GB.
- PC-056: Ultra 9 285K + RTX 5080, RAM 64GB, SSD 1TB, giá 130.000.000 VND. Tóm tắt CPU/RAM/SSD không khớp bảng linh kiện.

Reference runtime thêm i5-12600KF (CPU Mark 27.500), link PassMark và ngày kiểm tra ở CSV/JSON nguồn. Không sửa reference snapshot lúc train, workbook benchmark, dataset huấn luyện hay model. Nằm trong khoảng điểm train không chứng minh model chính xác trên CPU mới.

Các bộ cùng CPU/GPU có cùng điểm dự đoán trong kịch bản Windows 11 vì model hiện tại không dùng RAM, SSD, vỏ hoặc hãng card làm đặc trưng. Đây là giới hạn model; không tự cộng điểm cho RAM/SSD.
