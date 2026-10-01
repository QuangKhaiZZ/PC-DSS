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

Mỗi phần tử items có rank, pc, prediction, budgetRemainingVnd và reason. pc chứa 11 trường catalog dạng camelCase. prediction có predictedScore, target, modelVersion, features, cpuReferenceId, gpuReferenceId, operatingSystemAssumption, isExtrapolation và warnings.

Dùng [Postman](PC-DSS.postman_collection.json) hoặc /openapi/v1.json trong Development để xem hợp đồng đầy đủ.

## Hiển thị

- Form ngân sách và Gaming/Rendering, nút Tư vấn.
- Tối đa 3 thẻ PC giữ nguyên thứ hạng API: tên, giá, CPU/GPU/RAM/SSD, tiền còn lại và lý do.
- Điểm ghi rõ là benchmark dự đoán, không phải FPS hoặc phần trăm phù hợp.
- So sánh các kết quả trong cùng mục đích; không so trực tiếp Gaming với Rendering.
- Hiển thị warnings và giả định Windows 11; UNKNOWN dịch thành chưa rõ tồn kho.
- Nguồn cửa hàng và checkedAt; phần kỹ thuật model có thể thu gọn.
- Ảnh không bắt buộc. Chưa có imageUrl; ảnh dùng chung phải ghi là minh họa.

Không tự tính lại hoặc đổi thứ hạng ở frontend. Không cần các màn hình CRUD Brand/Category/Product. Dữ liệu thử cố định không thay kết quả API thật.

## Trạng thái và lỗi

- 200 và items=[]: không có phương án phù hợp, hiển thị message.
- 400: nhập liệu không hợp lệ; phản ánh lỗi trường khi có.
- 404: PC không tồn tại.
- 422 ở dự đoán riêng: PC thiếu đầu vào hợp lệ.
- Lỗi mạng/500: thông báo thử lại; không hiển thị kết quả giả.
- Đang tải: vô hiệu nút gửi hoặc tránh gửi lặp; tránh response cũ ghi đè kết quả của yêu cầu mới.

Kiểm thử giao diện với ngân sách thấp không có kết quả, Gaming/Rendering, ngoại suy RTX 3050 6GB và backend ngừng chạy.
