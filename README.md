# PC-DSS — Hướng dẫn chạy demo

Bài tập môn Hệ trợ giúp quyết định của Nhóm 5. Hệ thống gợi ý các bộ máy tính có sẵn theo nhu cầu **Gaming** hoặc **Rendering** và khoảng ngân sách người dùng lựa chọn.

Ứng dụng gồm frontend React + Vite và backend ASP.NET Core Web API. Backend sử dụng dữ liệu CSV và hệ số mô hình JSON để dự đoán hiệu năng, sau đó xếp hạng cấu hình. Không cần cài cơ sở dữ liệu hoặc huấn luyện lại mô hình để chạy demo.

## 1. Yêu cầu chuẩn bị

- **.NET SDK 10** để chạy backend; cài SDK, không chỉ cài Runtime.
- **Node.js 22 hoặc 24**, kèm npm, để chạy frontend.
- Trình duyệt web và kết nối Internet trong lần đầu tải các gói phụ thuộc.
- Python chỉ cần cho notebook hoặc script kiểm tra mô hình, không bắt buộc để chạy web.

Hướng dẫn dưới đây dùng Windows PowerShell. Sau khi cài công cụ, mở lại terminal và kiểm tra:

```powershell
dotnet --list-sdks
node --version
npm.cmd --version
```

Danh sách SDK cần có phiên bản `10.0.x`. Dùng `npm.cmd` để tránh lỗi PowerShell chặn chạy `npm.ps1`.

## 2. Mở dự án

Giải nén toàn bộ mã nguồn và mở thư mục **PC-DSS** bằng VS Code hoặc PowerShell. Thư mục gốc là nơi chứa file README này cùng các thư mục `backend`, `frontend`, `data` và `models`.

Giữ nguyên cấu trúc thư mục vì backend cần dữ liệu và hệ số mô hình khi build. Các bước tiếp theo dùng **hai terminal riêng**, đều bắt đầu tại thư mục gốc PC-DSS.

## 3. Chạy backend ở terminal thứ nhất

```powershell
dotnet run --project backend/PcDss.Api/PcDss.Api.csproj --launch-profile http
```

Lệnh tự khôi phục các gói NuGet, build và khởi động API. Chờ terminal hiển thị địa chỉ `http://localhost:5170` rồi giữ terminal này mở.

Mở [trang kiểm tra backend](http://localhost:5170/health). Khi API sẵn sàng, trình duyệt hiển thị:

```json
{"status":"ok","storage":"csv"}
```

Cổng 5170 phục vụ API, không phải giao diện sử dụng.

## 4. Chạy frontend ở terminal thứ hai

Từ thư mục gốc PC-DSS:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev -- --host localhost --port 5173 --strictPort
```

`npm.cmd ci` cài các gói theo `package-lock.json`. Cần chạy lần đầu, sau khi xóa `node_modules` hoặc khi file khóa phụ thuộc thay đổi. Những lần sau chỉ cần chạy lệnh `npm.cmd run dev` với các tham số như trên từ thư mục `frontend`.

Giữ terminal này mở và truy cập **[http://localhost:5173](http://localhost:5173)**.

Frontend mặc định gọi API tại `http://localhost:5170`. Nếu có file `frontend/.env`, kiểm tra giá trị:

```dotenv
VITE_API_BASE_URL=http://localhost:5170
```

Không bắt buộc tạo `.env` khi dùng địa chỉ mặc định. Sau khi sửa `.env`, dừng và khởi động lại frontend. Dùng đúng `http://localhost:5173` vì backend hiện cho phép giao diện tại địa chỉ này gọi API.

## 5. Thao tác demo

1. Mở mục **Tư vấn cấu hình**, hoặc truy cập [trang tư vấn](http://localhost:5173/recommendation).
2. Chọn nhu cầu **Gaming** hoặc **Rendering**.
3. Chọn khoảng giá và số lượng cấu hình muốn nhận, từ 1 đến 3.
4. Nhấn **Phân tích & gợi ý cấu hình**.
5. Xem thứ hạng, cấu hình, giá, điểm dự đoán, nguồn sản phẩm và cảnh báo nếu có.

Có thể thử Gaming, khoảng giá **15 đến dưới 20 triệu đồng**, chọn **Top 3**, sau đó đổi sang Rendering để xem kết quả theo nhu cầu khác.

Hệ thống lọc các PC theo điều kiện, dự đoán điểm và xếp hạng theo điểm giảm dần; khi bằng điểm thì ưu tiên giá thấp hơn, rồi mã PC. Điểm Gaming là Time Spy Overall; điểm Rendering là PCMark 10 Rendering and Visualization theo kịch bản Windows 11. Hai loại điểm có thang đo khác nhau, không so sánh trực tiếp. Điểm dự đoán hỗ trợ lựa chọn, không phải FPS hoặc phần trăm phù hợp.

Để dừng demo, nhấn `Ctrl+C` trong từng terminal.

## 6. Các thư mục chính

| Thư mục | Nội dung |
|---|---|
| `backend/` | Mã nguồn API, ảnh sản phẩm và mã kiểm thử API. |
| `frontend/` | Mã nguồn giao diện và tài nguyên hiển thị. |
| `data/raw/` | Dữ liệu Excel nguồn và thông tin nguồn thu thập. |
| `data/processed/` | Danh mục PC, bảng tham chiếu CPU/GPU và dữ liệu benchmark đã xử lý. |
| `data/validation/` | Kết quả kiểm tra, đối chiếu mô hình đã lưu. |
| `models/` | Mô hình Gaming/Rendering, hệ số JSON và kết quả đánh giá. |
| `notebooks/` | Notebook huấn luyện Gaming và Rendering trên Google Colab. |
| `scripts/` | Script kiểm tra mô hình; không cần chạy khi khởi động demo web. |

Backend sử dụng các tệp sau để đóng gói dữ liệu khi build:

- `data/processed/pc_catalog.csv`
- `data/processed/reference.csv`
- `models/gaming/01-Mô-hình-triển-khai/model_info.json`
- `models/rendering/model_info.json`

Giữ cả thư mục `backend/PcDss.Api/wwwroot` để giao diện hiển thị ảnh sản phẩm. Các thư mục `bin`, `obj` và `node_modules` có thể không có trong gói nộp; chúng được tạo lại khi chạy các lệnh ở trên.

Khi đưa dự án lên Git, `.gitignore` loại các thư mục build, gói phụ thuộc, cấu hình `.env` cục bộ và các bản giao diện cũ không còn được sử dụng. Giữ `frontend/.env.example`, `package-lock.json`, dữ liệu, notebook và mô hình để người khác có thể cài đặt, chạy demo và đối chiếu kết quả.

## 7. Xem quá trình huấn luyện và kiểm tra

Phần này phục vụ đối chiếu mô hình, không bắt buộc để chạy demo.

- Mở `notebooks/gamingtrain.ipynb` hoặc `notebooks/rendering_train.ipynb` trên Google Colab. Chạy các ô theo thứ tự và tải lên `data/raw/Benchmark final.xlsx` khi notebook yêu cầu.
- Xem hệ số, dữ liệu chia tập và kết quả đánh giá đã lưu trong `models/gaming/` và `models/rendering/`.
- `scripts/check_models.py` dùng Python cùng NumPy, scikit-learn 1.6.1 và joblib để đối chiếu mô hình. Script ghi kết quả vào `data/validation/` và `docs/model-check.md`.
- Để kiểm tra chức năng API, cài Python 3 rồi chạy từ thư mục gốc:

```powershell
dotnet build backend/PcDss.Api/PcDss.Api.csproj
python backend/tests/verify_catalog_api.py
```

## 8. Xử lý lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Không nhận lệnh `dotnet`, `node` hoặc `npm.cmd` | Cài công cụ tương ứng, sau đó mở lại terminal hoặc VS Code. |
| Báo SDK không hỗ trợ .NET 10 | Kiểm tra `dotnet --list-sdks` và cài .NET SDK 10. |
| Lỗi tải gói khi chạy lần đầu | Kiểm tra Internet và khả năng truy cập NuGet/npm, rồi chạy lại. |
| Cổng 5170 hoặc 5173 đang được sử dụng | Dừng phiên backend/frontend cũ bằng `Ctrl+C`, rồi chạy lại. Lệnh frontend dùng `--strictPort` để không tự chuyển sang cổng khác. |
| Giao diện mở được nhưng không lấy được kết quả | Kiểm tra `/health`, giữ backend đang chạy, kiểm tra `VITE_API_BASE_URL` và mở giao diện bằng đúng `http://localhost:5173`. |
| Báo thiếu CSV hoặc JSON khi build/chạy backend | Giải nén đầy đủ dự án và giữ nguyên vị trí `data`, `models`. |
| Không có cấu hình phù hợp | Thử khoảng giá khác; danh sách rỗng có thể là kết quả hợp lệ với điều kiện đã chọn. |
| Không thấy ảnh sản phẩm | Kiểm tra backend đang chạy và thư mục `backend/PcDss.Api/wwwroot` còn đầy đủ. |

Sau khi sửa CSV, hệ số JSON hoặc ảnh backend, dừng backend và chạy lại lệnh ở mục 3 để build và nạp dữ liệu mới. Không thêm `--no-build` khi các tệp này vừa thay đổi.
    
