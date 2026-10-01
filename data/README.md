# Dữ liệu PC-DSS

## Các bản đang sử dụng

- [raw/Benchmark final.xlsx](raw/Benchmark%20final.xlsx): Excel nguồn để nhập liệu, duyệt mẫu và đối chiếu nguồn benchmark.
- [processed/gaming_dataset.csv](processed/gaming_dataset.csv): 144 mẫu Gaming hợp lệ.
- [processed/rendering_dataset.csv](processed/rendering_dataset.csv): 100 mẫu Render, giữ nguyên 80 train và 20 test.
- [processed/reference.csv](processed/reference.csv): 15 điểm CPU Mark và 12 điểm GPU G3D Mark, kèm nguồn và ngày kiểm tra. Bảng tra cứu đã bổ sung RTX 3050 6 GB sau khi huấn luyện.
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

Notebook trong [notebooks/](../notebooks/README.md) hiện đọc trực tiếp Excel trên Colab. Tải lên bản trong `raw/` để chạy. CSV trong `processed/` là bảng đã chuẩn bị để phân tích, đối chiếu hoặc dùng trong quy trình huấn luyện khác.

Khi sửa dữ liệu nguồn, xuất lại CSV và cập nhật thông tin phiên bản; không sửa trực tiếp điểm trong CSV rồi coi đó là dữ liệu gốc. Giữ dấu vết của bản dữ liệu và mô hình cũ khi tạo phiên bản mới.

Gaming final fit trên toàn bộ 144 mẫu; CSV Gaming không có tập test độc lập. Với Render, dùng `Split=train` để fit và `Split=test` để đánh giá. CSV đã sắp theo RunId, nên không chia ngẫu nhiên lại theo vị trí rồi kỳ vọng giữ đúng tập test cũ.

## Giới hạn hiện tại

- `REF-GPU-012` — GeForce RTX 3050 6GB: G3D Mark 10.741, ngày ghi nhận 01/10/2026, được nhập theo ảnh bảng dữ liệu người dùng cung cấp; URL đã đối chiếu đúng bản desktop. Điểm thấp hơn mức GPU thấp nhất đã train của cả hai mô hình (12.460). Backend hiện trả `isExtrapolation=true` và cảnh báo ngoài phạm vi; việc thêm tham chiếu không phải xác nhận mô hình đã được kiểm chứng trên GPU này.
- Dòng bổ sung được ghi nguồn trong `processed/dataset_info.json`; không thuộc bản Excel gốc hoặc bảng tham chiếu lịch sử trong `models/`. Các bộ train và mô hình đã lưu giữ nguyên.
- Render vẫn có một nhóm CPU–GPU xuất hiện ở cả train và test: Core Ultra 7 265F + RTX 5080. Cách chia theo nhóm chưa được áp dụng; nếu đánh giá lại thì lưu thành phiên bản riêng.
- Các ghi chú render ngoài dòng 031/074 có thể còn nội dung cũ nhắc Productivity; chúng không được dùng làm X hoặc y. Không suy ra sai nhãn chỉ từ ghi chú.
- Các bảng gaming/rendering là dữ liệu benchmark. Danh mục PC có giá được lưu riêng bên dưới, không trộn vào dữ liệu huấn luyện.

## Danh mục PC để test — 01/10/2026

- `processed/pc_catalog.xlsx`: bản Excel chỉnh sửa cục bộ, không đưa lên Git; dữ liệu dùng chung nằm trong CSV bên dưới.
- [processed/pc_catalog.csv](processed/pc_catalog.csv): cùng 12 PC, chỉ giữ 11 cột cần thiết, UTF-8 BOM; sắp theo giá tăng dần.
- [raw/PC_source_links.xlsx](raw/PC_source_links.xlsx): bản sao file nguồn nguyên vẹn.
- [raw/pc_source_review.json](raw/pc_source_review.json): kết quả rà soát 30 link. `catalog_review_details` lưu các thông tin kiểm tra đã tách khỏi bảng PC chính, nối bằng `PcId`; đây là snapshot tại ngày kiểm tra, không phải đầu vào model tự cập nhật.

### 11 cột của bảng PC

`PcId`, `ProductName`, `Store`, `PriceVnd`, `CpuModel`, `GpuModel`, `RamCapacityGb`, `SsdCapacityGb`, `Availability`, `SourceUrl`, `CheckedAt`.

Giá tính VND/thùng máy, không gồm màn hình. RAM/SSD tính GB; 1TB SSD = 1000GB. Giữ đúng cấu hình gốc theo shop, không chỉnh linh kiện rồi dùng lại giá cũ. Nếu cần bộ giả lập để kiểm thử, lưu riêng và đánh dấu rõ. Các nguồn không chỉ có GEARVN.

Có 8 bộ dưới 20 triệu trong 12 bộ. 7 bộ có thông tin còn hàng, 4 bộ chưa rõ (`UNKNOWN`); PC-028 có schema `OUT_OF_STOCK`, dùng test lọc hết hàng. Thông tin VAT chưa đồng nhất, cần đối chiếu nguồn trước khi tư vấn chi phí thanh toán thực tế. Giá và tồn kho có thể thay đổi.

### Tạo đầu vào dự đoán ở backend

Backend hiện tra điểm CPU/GPU từ reference và tạo các biến theo `model_info.json`, thay vì lưu lặp trong danh mục PC. Gaming dùng GpuScore, CpuMultiScore; Render dùng GpuScore, CpuMultiScore, IsIntel, GpuGeneration, IsUltra, IsWindows11. Xem [hướng dẫn backend](../backend/README.md) để chạy API và cập nhật CSV.

Backend chạy render với giả định Windows 11 (`IsWindows11=1`) và trả rõ giả định trong kết quả API. Giao diện khi tích hợp cần hiển thị thông tin này. Không biến giả định này thành thông tin Windows bán kèm. Chỉ PC-029 có Windows 11 Home được nguồn xác nhận; thông tin OS gốc vẫn giữ trong bảng rà soát JSON.

PC-008 và PC-011 dùng RTX 3050 6GB: GpuScore 10741 < mức sàn train 12460; backend phải cảnh báo ngoại suy. Không dùng điểm bản 8GB thay thế. Các trường điểm/cờ kiểm tra cũ vẫn được lưu trong snapshot rà soát, không bị mất khi rút gọn CSV.

PC-027 có mainboard mô tả khác bảng; PC-030 dùng URL cửa hàng cũ do người dùng cung cấp và chưa rõ tồn kho. Không bổ sung kiểm tra tương thích. Danh mục này phục vụ test chức năng DSS, không chứng minh độ chính xác model trên các bộ PC thực tế.

## Model render hiện tại

Dùng rendering-linear-v1-20261001T151656208296Z. RUN-RENDER-031 = 14827 (pcm10b/1958607), RUN-RENDER-074 = 21275 (pcm10b/2083893); giữ split 80/20. Excel nguồn và CSV đã đồng bộ. Ghi chú hai dòng đã cập nhật; RAM speed dòng 074 là 4788 MHz theo nguồn. Các thay đổi mô tả không ảnh hưởng đầu vào hoặc hệ số model.

Bản hiện tại đã được dùng trong project. Backend chỉ nạp metadata trong models/gaming/ và models/rendering/. `source_sha256` là Excel đã làm sạch; `training_source_sha256` là Excel dùng train, khớp `models/rendering/model_info.json`. Giữ lịch sử huấn luyện trong gói model. Xem [báo cáo model](../docs/model-check.md).
