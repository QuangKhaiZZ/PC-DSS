# Tích hợp frontend

Frontend Vite chạy tại http://localhost:5173, backend tại http://localhost:5170. CORS hiện cho phép origin frontend này. Đặt địa chỉ API trong biến môi trường frontend, ví dụ VITE_API_BASE_URL.

## API

| Method | URL | Kết quả |
|---|---|---|
| GET | /health | Trạng thái API |
| GET | /api/pc-catalog | Danh sách PC |
| GET | /api/pc-catalog/{pcId} | Chi tiết PC |
| GET | /api/pc-catalog/{pcId}/prediction?purpose=Gaming | Dự đoán riêng; cũng nhận Rendering |
| POST | /api/recommendations | Tư vấn theo ngân sách |

Body POST:

```json
{"budget":20000000,"purpose":"Gaming","topCount":3}
```

purpose đúng Gaming hoặc Rendering, budget nguyên dương tính VNĐ, topCount từ 1 đến 3.

Response tư vấn có budget, purpose, modelVersion, target, operatingSystemAssumption, totalPcCount, eligiblePcCount, rankingRule, message, items và excluded.

Mỗi phần tử items có rank, pc, prediction, budgetRemainingVnd và reason. pc chứa 10 trường catalog dạng camelCase. prediction có predictedScore, target, modelVersion, features, cpuReferenceId, gpuReferenceId, operatingSystemAssumption, isExtrapolation và warnings.

Dùng [Postman](PC-DSS.postman_collection.json) hoặc /openapi/v1.json trong Development để xem hợp đồng đầy đủ.

## Hiển thị

- Form ngân sách và Gaming/Rendering, nút Tư vấn.
- Tối đa 3 thẻ PC giữ nguyên thứ hạng API: tên, giá, CPU/GPU/RAM/SSD, tiền còn lại và lý do.
- Điểm ghi rõ là benchmark dự đoán, không phải FPS hoặc phần trăm phù hợp.
- So sánh các kết quả trong cùng mục đích; không so trực tiếp Gaming với Rendering.
- Bỏ ô cảnh báo Windows 11 và toàn bộ nhãn/cảnh báo tồn kho trên thẻ kết quả. Backend vẫn tính theo Windows 11 nhưng không thêm cảnh báo này vào warnings. Giữ hiển thị cảnh báo ngoại suy nếu có.
- Giữ ngày kiểm tra (checkedAt) và liên kết “Xem nguồn giá” (sourceUrl); không hiển thị IN_STOCK/UNKNOWN hoặc tự tạo cảnh báo tồn kho.
- Ảnh không bắt buộc. Chưa có imageUrl; ảnh dùng chung phải ghi là minh họa.

Không tự tính lại hoặc đổi thứ hạng ở frontend. Không cần các màn hình CRUD Brand/Category/Product. Dữ liệu thử cố định không thay kết quả API thật.

## Trạng thái và lỗi

- 200 và items=[]: không có phương án phù hợp, hiển thị message.
- 400: nhập liệu không hợp lệ; phản ánh lỗi trường khi có.
- 404: PC không tồn tại.
- 422 ở dự đoán riêng: PC thiếu đầu vào hợp lệ.
- Lỗi mạng/500: thông báo thử lại; không hiển thị kết quả giả.
- Đang tải: vô hiệu nút gửi hoặc tránh gửi lặp; tránh response cũ ghi đè kết quả của yêu cầu mới.

Kiểm thử giao diện với ngân sách thấp không có kết quả, Gaming/Rendering, RTX 3050 6GB trong phạm vi train mới, cảnh báo ngoại suy bằng dữ liệu thử ngoài phạm vi và backend ngừng chạy.


## Khoảng giá (04/10/2026)

API nhận thêm `minBudget` (mặc định 0, nguyên không âm, không vượt `budget`). Response trả lại `minBudget`. Lọc `minBudget <= PriceVnd <= budget` trước khi xếp hạng. Request cũ chỉ có budget vẫn hoạt động.

```json
{"minBudget":10000000,"budget":14999999,"purpose":"Gaming","topCount":3}
```

Giao diện dùng “Khoảng giá”, chỉ có đúng 7 lựa chọn sau:

| Nhãn | minBudget | budget |
|---|---:|---:|
| 10 đến dưới 15 triệu | 10000000 | 14999999 |
| 15 đến dưới 20 triệu | 15000000 | 19999999 |
| 20 đến dưới 25 triệu | 20000000 | 24999999 |
| 25 đến dưới 35 triệu | 25000000 | 34999999 |
| 35 đến dưới 45 triệu | 35000000 | 44999999 |
| 45 đến dưới 60 triệu | 45000000 | 59999999 |
| Từ 60 triệu trở lên | 60000000 | max(60000000, giá cao nhất catalog) |

Không thêm lựa chọn dưới 10 triệu hoặc chia nhỏ các khoảng trên. Gửi mức cuối trừ 1 VND để các khoảng không trùng; máy đúng mốc thuộc nhóm tiếp theo. Backend vẫn nhận hai cận để lọc đúng khoảng.

`excluded` có mã `BELOW_MIN_BUDGET` khi giá dưới khoảng và `OVER_BUDGET` khi vượt khoảng. Không lọc lại sau khi lấy top 3.

Frontend xanh trong ảnh nằm ở máy thành viên khác, chưa push vào repository. Những hướng dẫn hiển thị này chờ tích hợp ở bản đó; frontend do thành viên phụ trách thực hiện; thay đổi dropdown của trợ lý đã được hoàn tác theo yêu cầu người dùng.
