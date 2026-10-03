# Backend PC-DSS — CSV + model đã train

Yêu cầu .NET SDK 10. Không cần MySQL, EF, migration, Python hay joblib để chạy API.

```powershell
dotnet run --project backend/PcDss.Api/PcDss.Api.csproj --launch-profile http
```

Địa chỉ mặc định `http://localhost:5170`. Development có OpenAPI tại `/openapi/v1.json`.

## API

| Method | Endpoint | Công dụng |
|---|---|---|
| GET | `/health` | Xác nhận API hoạt động, storage=csv |
| GET | `/api/pc-catalog` | Danh mục theo giá tăng dần |
| GET | `/api/pc-catalog/PC-016` | Chi tiết PC; không có trả 404 |
| GET | `/api/pc-catalog/PC-016/prediction?purpose=Gaming` | Tính thử Gaming hoặc Rendering cho một PC |
| POST | `/api/recommendations` | Lọc ngân sách và xếp hạng |

Ví dụ POST:

```json
{"budget":20000000,"purpose":"Gaming","topCount":3}
```

`purpose`: chính xác `Gaming` hoặc `Rendering`; ngân sách là số nguyên VND dương; `topCount` từ 1 đến 3 (mặc định 3). Dữ liệu request sai trả 400. Không có bộ phù hợp trả 200 với `items=[]` và thông báo; không trả bộ vượt ngân sách.

Kết quả có `items`, lý do xếp hạng, số tiền còn lại, phiên bản model, tên benchmark đích, đầu vào model và cảnh báo. `excluded` giải thích các bộ vượt ngân sách hoặc thiếu đầu vào model. Bộ hợp lệ ngoài top 3 chỉ không được chọn, không bị ghi là dữ liệu lỗi.

## Dữ liệu và cập nhật

- Sửa/thêm PC tại `data/processed/pc_catalog.csv`, dùng `PcId` duy nhất.
- `data/processed/reference.csv` cung cấp CPU Mark/G3D Mark. CPU/GPU phải khớp reference sau chuẩn hóa chữ hoa/thường, dấu phân cách, từ NVIDIA/Processor và hậu tố @x GHz; giữ hậu tố F/K/KF và VRAM. Không tự đổi 3050 6GB thành 8GB.
- `models/gaming/model_info.json`, `models/rendering/model_info.json` cung cấp đúng hệ số đã học, phiên bản và phạm vi train. C# tính công thức được hỗ trợ; không tự đọc file joblib hoặc tự train. Đổi loại thuật toán cần cập nhật code và kiểm thử, không chỉ đổi JSON.
- API chỉ đọc; chưa có API thêm/sửa/xóa CSV. Dừng và chạy lại bằng lệnh `dotnet run` (không dùng `--no-build`) sau khi sửa dữ liệu để sao chép file mới và nạp lại.
- CSV UTF-8/BOM, có thể có dấu phẩy và xuống dòng trong ô được quote. Tên cột bắt buộc đúng schema. Lỗi cấu trúc, trùng ID, giá không hợp lệ hoặc metadata model sai làm startup thất bại với lỗi cụ thể, không âm thầm mất dòng.
- Thiếu reference của một PC: vẫn xem được cấu hình; API dự đoán riêng trả 422; API tư vấn bỏ bộ đó và trả lý do.

Build/publish tự đóng gói 4 file vào `DssData` cạnh DLL. Không phụ thuộc thư mục hiện tại khi khởi chạy. Có thể đặt `Dss__DataDirectory` thành đường dẫn tuyệt đối tới thư mục có pc_catalog.csv, reference.csv, gaming/model_info.json, rendering/model_info.json. Các file chỉ được nạp khi khởi động.

## Quy tắc DSS

1. Chỉ xét PC có minBudget <= giá <= budget (minBudget mặc định 0); tình trạng tồn kho ở link nguồn không ảnh hưởng đến DSS.
2. Tra đúng CPU/GPU từ reference; đủ đầu vào thì tính model đúng mục đích.
3. Điểm dự đoán giảm dần; bằng điểm ưu tiên giá thấp, rồi PcId để ổn định kết quả. Không dùng RAM/SSD làm bộ lọc hoặc biến model lúc này.
4. Trả tối đa 3 bộ với lý do và cảnh báo. Không tự bịa phần trăm phù hợp, không gộp thang điểm gaming và render.

Render luôn dùng kịch bản Windows 11, không khẳng định Windows bán kèm. Ngoài min/max train vẫn được tính và xếp hạng kèm `isExtrapolation=true`; không coi IN_RANGE là đảm bảo chính xác. RTX 3050 6GB đã nằm trong phạm vi train của hai model cập nhật ngày 03/10/2026. Dự đoán là điểm benchmark, không phải FPS hoặc số giây render. Giá theo shop và thời điểm CheckedAt, chưa đồng nhất VAT.

## Kiểm thử và chuyển đổi

Xem [tests/README.md](tests/README.md). Các test CRUD/MySQL cũ được thay bằng test API CSV, lọc/xếp hạng và đối chiếu mô hình. Cơ sở dữ liệu MySQL cũ và credentials trên máy không bị xóa; backend không còn đọc chúng.

Frontend vẫn còn menu/API cũ và kết quả minh họa. Chưa dùng giao diện đó để đánh giá backend DSS mới; dùng file HTTP hoặc Postman. Bước tích hợp giao diện là công việc tiếp theo.

API hỗ trợ khoảng giá qua `minBudget` và `budget`, đều nguyên VND, `0 <= minBudget <= budget`. Ví dụ 10 đến dưới 15 triệu: `{"minBudget":10000000,"budget":14999999,"purpose":"Gaming"}`. Windows 11 vẫn là kịch bản model; không trả cảnh báo OS trong `warnings`. Giữ cảnh báo ngoại suy.
