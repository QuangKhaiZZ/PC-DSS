# Mẫu dữ liệu linh kiện

Mỗi sản phẩm gồm một hàng thông tin chung và một hàng thông số theo loại linh kiện, liên kết bằng `ProductCode`. CPU/GPU có thêm dữ liệu benchmark.

Các bảng dưới đây có thể sao chép sang bảng tính để nhập dữ liệu. ID của database được sinh tự động; mẫu này không thực hiện import.

## Thông tin chung

| ProductCode | ProductName | CategoryName | BrandName | Price | PriceSourceUrl | PriceCheckedAt | SpecSourceUrl | GhiChuThieu |
|---|---|---|---|---:|---|---|---|---|
| | | | | | | | | |

- Mã theo loại: `CPU-001`, `GPU-001`, `RAM-001`, `SSD-001`, `MB-001`, `PSU-001`, `CASE-001`, `COOLER-001`.
- `Price`: số VND nguyên, không có dấu phân cách hoặc ký hiệu tiền tệ.
- `PriceCheckedAt`: `YYYY-MM-DD`. Thiếu giá thì để trống cả giá, nguồn giá và ngày giá; không ghi 0.
- `SpecSourceUrl`: ưu tiên trang đúng model của hãng. Nguồn giá là trang đúng biến thể đang thu thập, không dùng giá cả bộ PC làm giá một linh kiện.
- `GhiChuThieu`: ghi các trường còn thiếu trong mẫu, không lưu vào DB. Sản phẩm chưa đủ dữ liệu giữ trạng thái `IsActive = 0`.

## Thông số linh kiện

### CPU

| ProductCode | Socket | Core | Thread | TdpW | HasIntegratedGPU | HasBoxCooler |
|---|---|---:|---:|---:|---:|---:|
| | | | | | | |

### GPU

| ProductCode | Chipset | VramGb | RecommendedPsuW | LengthMm |
|---|---|---:|---:|---:|
| | | | | |

### RAM

| ProductCode | KitCapacityGb | ModuleCount | SpeedMTs | RamType |
|---|---:|---:|---:|---|
| | | | | |

### SSD

| ProductCode | CapacityGb | Interface | FormFactor |
|---|---:|---|---|
| | | | |

### Mainboard

| ProductCode | Socket | Chipset | RamType | MaxRamGb | RamSlots | SupportsNvme2280 | HasDisplayOutput | FormFactor |
|---|---|---|---|---:|---:|---:|---:|---|
| | | | | | | | | |

### PSU

| ProductCode | Watt | FormFactor | Efficiency |
|---|---:|---|---|
| | | | |

### Case

| ProductCode | MotherboardSupport | GpuMaxLengthMm | CoolerMaxHeightMm | PsuFormFactor |
|---|---|---:|---:|---|
| | | | | |

### Cooler

| ProductCode | SocketSupport | HeightMm |
|---|---|---:|
| | | |

Giá trị chuẩn: RAM `DDR4`/`DDR5`; main `ATX`/`MATX`/`MINI_ITX`; SSD thuộc phạm vi kiểm tra hiện tại là `NVME` và `M.2-2280`; PSU `ATX`/`SFX`/`SFX_L`. Danh sách hỗ trợ dùng dấu `|`, ví dụ `AM4|AM5` hoặc `ATX|MATX`. Boolean 0/1 chỉ nhập khi đã xác minh; giá trị chưa biết được ghi vào `GhiChuThieu`.

## Benchmark CPU/GPU

Các CPU trong tập so sánh sử dụng cùng bài đo và phiên bản. GPU có bài đo và phiên bản thống nhất riêng. Chỉ sử dụng bài đo có điểm càng cao càng tốt.

| ProductCode | TestName | TestVersion | RawScore | SourceUrl | CheckedAt |
|---|---|---|---:|---|---|
| | | | | | |

`RawScore` là điểm từ nguồn được dẫn tại `SourceUrl`, ứng với đúng sản phẩm và bài đo. Giá trị thiếu không được thay bằng 0 hoặc điểm tự đánh giá; sản phẩm thiếu benchmark chưa đủ dữ liệu cho phương pháp xếp hạng dựa trên benchmark.

## Đối chiếu cấu hình

| MaBo | CPU | Mainboard | RAM | SSD | GPU | PSU | Case | Cooler | NguonVaDieuKien | NguoiKiemTra |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

Các cột linh kiện chứa `ProductCode`; GPU/tản có thể trống theo điều kiện trong thiết kế. `NguonVaDieuKien` ghi nguồn xác minh CPU/BIOS, RAM/SSD, công suất và đầu nối PSU, khoảng trống case/tản. Ghi rõ phương pháp xác minh: đối chiếu tài liệu hoặc lắp thử thực tế.

Danh sách này phục vụ đối chiếu dữ liệu và kết quả tư vấn, không thay thế thuật toán lọc và xếp hạng.

## Kiểm tra trước khi nhập

- Mã không trùng; tên/model/biến thể nhất quán giữa nguồn giá và thông số.
- Có thông tin chung và đúng một hàng thông số riêng cho từng sản phẩm.
- Trường thiếu được ghi rõ; đơn vị và các mã thống nhất với `database-demo.md`.
- CPU/GPU có benchmark có nguồn trước khi đưa vào tập xếp hạng dựa trên benchmark.
