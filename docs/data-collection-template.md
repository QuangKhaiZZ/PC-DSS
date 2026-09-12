# Mẫu thu thập dữ liệu PC-DSS

Mỗi sản phẩm gồm một hàng thông tin chung và một hàng thông số theo loại linh kiện, liên kết bằng `ProductCode`. CPU/GPU có thêm dữ liệu benchmark.

Các bảng dưới đây có thể sao chép sang bảng tính để nhập dữ liệu. ID của database được sinh tự động; mẫu này không thực hiện import.

Mẫu gồm dữ liệu linh kiện, benchmark tham chiếu và benchmark cấu hình thực tế cho ba nhu cầu: văn phòng và học tập, chơi game, thiết kế đồ họa cơ bản. Các cột/bảng bổ sung phục vụ thu thập trước; cần ánh xạ vào database khi triển khai, không mặc định SQL hiện tại đã hỗ trợ.

## Trước khi giao thu thập

- Có thể thu thập thông tin sản phẩm và thông số linh kiện ngay theo các bảng bên dưới.
- Với dữ liệu hồi quy, ghép thử khoảng 5 mẫu đầy đủ mỗi nhu cầu trước khi mở rộng. Mốc này chỉ kiểm tra quy trình thu thập, chưa đủ để kết luận độ chính xác.
- Theo [yêu cầu hệ thống](requirements.md), gaming đang đề xuất Time Spy overall; văn phòng đề xuất PCMark 10 Productivity. Đồ họa đang khảo sát PCMark 10 Digital Content Creation hoặc một bài đo ứng dụng như Puget Bench for Photoshop; chưa chốt.
- Nhóm cần ghi lại đầu ra, bài đo/phiên bản so sánh được, đầu vào, nguồn tham chiếu và quy tắc nhận mẫu của từng mô hình trước khi thu thập hàng loạt. Không coi tất cả cột thu thập là đầu vào bắt buộc của hồi quy.
- Phạm vi ban đầu là máy bàn. Không ghép nhầm CPU/GPU laptop với linh kiện máy bàn cùng tên gần giống.

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

Trong từng loại điểm dùng để so sánh, thống nhất bài đo và phiên bản hoặc nhóm phiên bản đã xác minh khả năng so sánh. CPU có thể có nhiều dòng, chẳng hạn điểm đơn luồng và đa luồng. Chỉ sử dụng bài đo có điểm càng cao càng tốt trong mẫu hiện tại.

| ReferenceId | ProductCode | ModelName | TestName | TestVersion | Metric | RawScore | SourceUrl | CheckedAt |
|---|---|---|---|---|---|---:|---|---|
| | | | | | | | | |

- `ReferenceId`: mã duy nhất của dòng tham chiếu, ví dụ `REF-001`; dùng để truy vết khi ghép dữ liệu học.
- `ModelName`: model/biến thể đúng theo nguồn. `ProductCode` liên kết danh mục nếu đã có sản phẩm tương ứng; có thể để trống trong giai đoạn khảo sát, không tạo mã sản phẩm giả.
- `Metric`: tên loại điểm đúng theo nguồn, ví dụ `Single Thread Rating`, `CPU Mark`, `G3D Mark`. Không tự đổi điểm đơn luồng thành một loại điểm đơn nhân khác hoặc trộn các bài đo khác thang.
- `RawScore`: điểm từ `SourceUrl`. Nếu nguồn là điểm tổng hợp theo model, ghi nhận đúng bản chất đó; không coi đây là kết quả của mọi máy dùng model ấy.
- `CheckedAt`: ngày thu thập `YYYY-MM-DD`; điểm tham chiếu có thể thay đổi, cần giữ lại bản đã dùng cho từng phiên bản dữ liệu.
- Phiên bản không rõ thì để trống và giữ dòng ở bước khảo sát; không tự gán phiên bản. Giá trị thiếu không thay bằng 0 hoặc điểm tự đánh giá.
- Bảng này cung cấp đầu vào độc lập cho cấu hình chưa benchmark. Không lấy điểm thành phần của chính lượt đo đầu ra để điền vào bảng tham chiếu cho lượt đó.

## Benchmark cấu hình thực tế

Một `RunId` đại diện cho một lượt đo từ nguồn, ví dụ `RUN-001`. Ba bảng dưới đây liên kết bằng mã này để tránh một bảng quá rộng. Một lượt PCMark có thể có cả Productivity và Digital Content Creation: ghi hai dòng kết quả cùng `RunId`, không tính thành hai máy độc lập.

### Cấu hình của lượt đo

| RunId | MachineGroupId | CpuModel | GpuModel | RamCapacityGb | RamType | RamSpeedRaw | RamSpeedUnit | StorageModel |
|---|---|---|---|---:|---|---:|---|---|
| | | | | | | | | |

- `MachineGroupId`: nhóm các lượt cùng máy/cấu hình có căn cứ nhận diện; lưu căn cứ trong ghi chú kiểm tra. Chưa xác định thì để trống, không tự coi mỗi lượt là một máy độc lập. Cần xử lý việc nhóm trước khi chia tập học/đánh giá.
- CPU/GPU giữ đúng model và biến thể từ chính lượt đo; không lấy cấu hình tham chiếu được website chèn vào trang. Không bắt buộc các model này đã có trong danh mục bán hàng.
- `RamCapacityGb`: tổng dung lượng RAM. Giữ nguyên tốc độ và đơn vị nguồn ở `RamSpeedRaw`/`RamSpeedUnit`; chỉ chuyển sang MT/s khi đã xác minh. Không suy loại DDR từ tốc độ.
- `StorageModel`: ghi theo nguồn nếu có; ghi chú nếu chưa biết đó có phải ổ chạy bài đo. Không suy tốc độ ổ từ dung lượng.
- Thông tin bổ sung như số thanh RAM, mainboard, VRAM, iGPU/GPU rời có thể ghi trong `Settings`/`ReviewNote`. Không coi bộ nhớ chia sẻ iGPU là VRAM rời.

### Điểm đo và nguồn

| RunId | Need | TestName | TestVersion | AppVersion | Metric | Score | SourceUrl | CheckedAt |
|---|---|---|---|---|---|---:|---|---|
| | | | | | | | | |

- `Need`: mã thống nhất `OFFICE_STUDY`, `GAMING`, `GRAPHICS`; nhãn này giúp phân nhóm, không phải giá trị số để hồi quy dự đoán.
- `Metric`: loại điểm thực tế, ví dụ `Overall`, `Productivity`, `Digital Content Creation`. Mỗi cặp `RunId` và `Metric` chỉ có một dòng trong bảng này.
- `Score`: kết quả đo thực tế làm đầu ra y. Không tự cộng điểm CPU/GPU/RAM để tạo y. Chỉ ghi điểm càng cao càng tốt; nếu khảo sát thời gian hoàn thành tác vụ, cần thiết kế thang đo riêng trước khi dùng.
- `AppVersion`: phiên bản ứng dụng khi bài đo phụ thuộc phần mềm như Photoshop. Bỏ trống khi không áp dụng; nếu cần nhưng nguồn thiếu thì nêu rõ trong `ReviewNote`.
- `SourceUrl`: trang kết quả cụ thể, chứa hoặc dẫn tới mã kết quả gốc. `CheckedAt` là ngày thu thập, không phải ngày benchmark.
- Cùng tên bài đo nhưng khác phiên bản chưa được xác minh thì giữ riêng. Không trộn điểm Time Spy, PCMark hoặc Puget Bench trong một đầu ra.

### Điều kiện đo và trạng thái kiểm tra

| RunId | MeasuredAt | Os | Driver | Settings | ReviewStatus | ReviewNote |
|---|---|---|---|---|---|---|
| | | | | | | |

- `MeasuredAt`: ngày đo do nguồn ghi; chưa biết thì để trống. Ghi OS, driver, chế độ bài đo, dấu hiệu ép xung/profile RAM và điều kiện khác khi nguồn có.
- `ReviewStatus`: `REVIEW` (chưa kiểm tra đủ), `HOLD` (chờ xác minh), `ACCEPT` (đạt quy tắc dữ liệu đã thống nhất), `EXCLUDE` (loại). `ReviewNote` ghi người kiểm tra, lý do và phạm vi bài đo/mô hình được nhận nếu có nhiều loại điểm.
- Nhãn “Valid result” trên website không tự đồng nghĩa mẫu đã được nhóm nhận hoặc máy chạy mặc định.
- Mẫu thiếu y hoặc đầu vào bắt buộc của mô hình chưa được nhận để huấn luyện mô hình đó. Thiếu thông tin bổ sung cần được ghi rõ và xử lý theo quy tắc đã thống nhất.
- Không bắt buộc biết đủ giá, PSU, case, tản của lượt benchmark mới ghi nhận được mẫu khảo sát. Tuy nhiên, cấu hình dùng để tư vấn phải có đủ dữ liệu giá và tương thích trong phạm vi hệ thống.

## Ghép dữ liệu cho hồi quy

Bảng dưới đây lưu liên kết tới nguồn điểm tham chiếu. Các đầu vào là ứng viên; chỉ điền những tham chiếu mà mô hình đã chốt sử dụng.

| RunId | Metric | CpuSingleRefId | CpuMultiRefId | GpuRefId |
|---|---|---|---|---|
| | | | | |

- Các cột `*RefId` trỏ tới `ReferenceId` của đúng model, loại điểm và bài đo đã chọn. Xác minh ánh xạ model trước khi ghép; chưa có điểm thì để trống và ghi thiếu.
- Bảng học được tạo bằng cách lấy điểm số từ các tham chiếu, dung lượng/thông tin RAM từ bảng cấu hình và y từ dòng kết quả tương ứng. Các mã, URL và tên model phục vụ liên kết/truy vết, không tự coi mã sản phẩm là số hiệu năng.
- Không dùng `CPU Score`/`Graphics Score` của chính lượt Time Spy để dự đoán tổng Time Spy; không dùng Writing/Spreadsheets cùng lượt để dự đoán Productivity. Quy tắc tương tự áp dụng với điểm thành phần của đầu ra đồ họa.
- Xung/nhiệt độ đo trong lượt chạy dùng kiểm tra điều kiện; không dùng làm đầu vào nếu khi tư vấn máy chưa lắp không biết giá trị đó.
- Lưu nhóm máy và cách chia tập. Mọi bước học cách điền thiếu, chuẩn hóa và chọn biến chỉ dùng tập huấn luyện. Giữ phiên bản dữ liệu gốc, tham chiếu và bảng ghép để tái hiện kết quả.

## Nguồn để khảo sát

Các nguồn dưới đây đã xác định có thông tin công khai; chưa phải cam kết mọi model đều có mẫu đầy đủ hoặc quyết định chọn nguồn chính thức:

- [PassMark CPU](https://www.cpubenchmark.net/cpu_list.php) và [GPU](https://www.videocardbenchmark.net/gpu_list.php): tra điểm theo model; lưu đúng loại điểm, phiên bản và ngày lấy.
- [Kết quả UL](https://www.3dmark.com/search): khảo sát các lượt Time Spy và PCMark có cấu hình kèm kết quả.
- [PCMark 10 Productivity](https://support.benchmarks.ul.com/support/solutions/articles/44002162287-overview-of-pcmark-10-productivity-test-group): nhóm tác vụ soạn thảo và bảng tính.
- [PCMark 10 Digital Content Creation](https://support.benchmarks.ul.com/support/solutions/articles/44002162395-overview-of-pcmark-10-digital-content-creation-test-group): nhóm tác vụ chỉnh ảnh, video, dựng/hiển thị 3D; là một ứng viên cho đầu ra đồ họa.
- [Puget Bench for Photoshop](https://www.pugetsystems.com/pugetbench/creators/photoshop/): ứng viên khác nếu chọn phạm vi tác vụ Photoshop; kiểm tra nhóm phiên bản benchmark và ứng dụng trước khi gộp.

## Đối chiếu cấu hình

| MaBo | CPU | Mainboard | RAM | SSD | GPU | PSU | Case | Cooler | NguonVaDieuKien | NguoiKiemTra |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

Các cột linh kiện chứa `ProductCode`; GPU/tản có thể trống theo điều kiện trong thiết kế. `NguonVaDieuKien` ghi nguồn xác minh CPU/BIOS, RAM/SSD, công suất và đầu nối PSU, khoảng trống case/tản. Ghi rõ phương pháp xác minh: đối chiếu tài liệu hoặc lắp thử thực tế.

Danh sách này phục vụ đối chiếu dữ liệu và kết quả tư vấn, không thay thế thuật toán lọc và xếp hạng. Đây không phải bảng benchmark huấn luyện: một bộ đã xác minh lắp được vẫn cần điểm đo thực tế nếu muốn dùng làm mẫu học.

## Kiểm tra trước khi nhập

- Mã không trùng; tên/model/biến thể nhất quán giữa nguồn giá và thông số.
- Có thông tin chung và đúng một hàng thông số riêng cho từng sản phẩm.
- Trường thiếu được ghi rõ; đơn vị và các mã thống nhất với `database-demo.md`.
- CPU/GPU có các benchmark tham chiếu mà mô hình yêu cầu trước khi dùng cấu hình để dự đoán/xếp hạng.
- Mẫu học có đầu ra thực tế, đầu vào đã ghép đúng nguồn, trạng thái kiểm tra và nhóm chia tập; không có rò rỉ từ kết quả đầu ra.
- Nhóm đã ghi rõ những đầu ra/biến/nguồn còn ở bước khảo sát; không đánh dấu bộ dữ liệu là hoàn chỉnh chỉ vì đủ số dòng.
