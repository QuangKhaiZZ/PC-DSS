# Báo cáo giữa kỳ PC-DSS

**Đề tài: Hỗ trợ lựa chọn cấu hình máy tính theo nhu cầu và ngân sách**

**Cập nhật: 22/09/2026**

Nhóm đã chuẩn bị dữ liệu, thử nghiệm mô hình gaming, xây dựng backend quản lý dữ liệu và giao diện ban đầu. **Hiện chưa hoàn thành luồng tư vấn từ đầu đến cuối.** Báo cáo này tập trung vào mô hình gaming đang chọn; chi tiết các phương án trước nằm trong mục mở rộng cuối tài liệu.

## Nội dung

1. [Bài toán](#bai-toan)
2. [Dữ liệu và ý nghĩa các loại điểm](#du-lieu)
3. [Đầu vào và đầu ra của mô hình](#dau-vao)
4. [Công thức hiện tại và cách huấn luyện](#mo-hinh)
5. [Kết quả và cách đọc chỉ số](#ket-qua)
6. [Những phần đã làm và công việc tiếp theo](#tien-do)
7. [Thông tin giải thích thêm](#chi-tiet)

<a id="bai-toan"></a>

## 1. Bài toán

Một người có **20 triệu đồng để lắp máy chơi game** cần chọn các linh kiện vừa tương thích, vừa nằm trong ngân sách. PC-DSS dự kiến giúp người dùng so sánh các phương án và lựa chọn cấu hình.

```text
Nhận nhu cầu và ngân sách
→ Tạo các phương án từ dữ liệu linh kiện
→ Loại phương án vượt ngân sách hoặc không tương thích
→ Dự đoán điểm hiệu năng, xếp hạng và đề xuất tối đa ba cấu hình
```

**Đây là luồng dự kiến.** Mô hình gaming làm nhiệm vụ dự đoán điểm hiệu năng. Việc tính giá, kiểm tra tương thích và lựa chọn cấu hình cần được xây dựng thêm trong hệ thống.

<a id="du-lieu"></a>

## 2. Dữ liệu và ý nghĩa các loại điểm

Nhóm có hai file Excel:

| File | Nội dung và mục đích |
|---|---|
| `dữ liệu PC.xlsx` | Thông tin linh kiện, giá và thông số, dùng để chuẩn bị nhập vào backend |
| `Benchmark (6) (1).xlsx` | Chứa các lượt benchmark gaming, văn phòng và bảng điểm tham chiếu để xây dựng mô hình |

Trong file benchmark, ba sheet cần phân biệt là:

| Sheet | Chứa gì? |
|---|---|
| `Benchmark_Gaming` | Cấu hình và điểm **Time Spy Overall thực tế** của từng lượt đo |
| `ReferenceBenchmark` | Điểm **PassMark tham chiếu** theo model CPU/GPU |
| `Benchmark_VanPhong` | Cấu hình và điểm **PCMark 10 Productivity**; mô hình văn phòng đang xử lý |

**Time Spy là gì?** Đây là một bài đo hiệu năng thuộc phần mềm 3DMark của UL Solutions. Nhóm chọn điểm tổng của bài đo, gọi là **Overall**, làm điểm cần dự đoán cho gaming. Điểm này **không phải FPS của một trò chơi hoặc phần trăm phù hợp**. [Nguồn UL](https://benchmarks.ul.com/3dmark-time-spy).

**Điểm tham chiếu là gì?** Đây là điểm tra theo model linh kiện, được lưu trong bảng `ReferenceBenchmark`. Mô hình hiện dùng **CPU Mark** cho CPU và **G3D Mark** cho GPU, đều từ PassMark. Chúng là phép đo khác với Time Spy. [Nguồn CPU](https://www.cpubenchmark.net/cpu_test_info.html), [nguồn GPU](https://www.videocardbenchmark.net/gpu_test_info.html).

**Vì sao cần cả hai?** Các lượt Time Spy đã có giúp mô hình học. Khi xét cấu hình mới chưa chạy Time Spy, nhóm tra điểm tham chiếu CPU/GPU rồi dùng mô hình để ước lượng điểm tổng.

Dữ liệu gaming có **146 dòng, dùng 144 dòng và tạm để ngoài 2 dòng còn cần kiểm tra**. Mỗi dòng ghi một lượt đo thu thập từ nguồn công khai, có đường dẫn ở cột `SourceUrl`; không có nghĩa nhóm tự lắp và đo 146 máy.

<a id="dau-vao"></a>

## 3. Đầu vào và đầu ra của mô hình

| Thành phần | Nội dung |
|---|---|
| Đầu vào thứ nhất — `GpuScore` | Điểm PassMark G3D Mark của GPU |
| Đầu vào thứ hai — `CpuMultiScore` | Điểm PassMark CPU Mark của CPU |
| Đầu ra | Điểm **Time Spy Overall dự đoán** |
| Nhãn khi học — `Score` | Điểm Time Spy Overall thực tế, dùng làm đáp án để học và đánh giá |

**Ví dụ từ Excel:** dòng `RUN-GAMING-001`, dòng 2 của sheet `Benchmark_Gaming`, dùng Ryzen 5 5500 và RTX 3050 **8GB**.

| Dữ liệu | Giá trị | Vị trí đối chiếu |
|---|---:|---|
| CPU Mark tham chiếu | 19.252 | `ReferenceBenchmark`, mã `REF-CPU-001-M` |
| G3D Mark tham chiếu | 12.460 | `ReferenceBenchmark`, mã `REF-GPU-001` |
| Time Spy thực tế | 7.185 | `Benchmark_Gaming`, cột `Score` |

Mô hình nhận **hai điểm tham chiếu**, học cách dự đoán **điểm Time Spy**. Khi dùng cho cấu hình mới, không cần biết trước điểm Time Spy của cấu hình đó.

Người dùng nhập **nhu cầu và ngân sách cho hệ thống**. Backend sẽ tra điểm CPU/GPU cho mô hình; ngân sách không nằm trong công thức dự đoán này.

<a id="mo-hinh"></a>

## 4. Công thức hiện tại và cách huấn luyện

Hồi quy dùng dữ liệu đã biết để học mối quan hệ giữa đầu vào và một giá trị số cần dự đoán. Trong bài toán này, đầu vào là điểm CPU/GPU tham chiếu và giá trị cần dự đoán là Time Spy Overall.

Nhóm chọn **hồi quy tuyến tính nhiều biến trên thang log, với hệ số không âm**. Công thức dự đoán có dạng nhân:

```text
Điểm dự đoán = A × G^b × C^c
```

- `G`: điểm GPU tham chiếu; `C`: điểm CPU tham chiếu.
- `A`, `b`, `c`: các giá trị thu được sau khi học từ dữ liệu, không tự đặt trọng số.
- Dấu `^` là lũy thừa. Hai số mũ `b`, `c` không phải phần trăm đóng góp.

**Khi train, mô hình được đưa về dạng cộng bằng log để học các hệ số. Khi sử dụng, kết quả được đổi ngược về công thức dạng nhân để tính điểm Time Spy dự đoán.**

```text
Khi học:      ln(y) ≈ a + b × ln(G) + c × ln(C)
Khi dự đoán:  ŷ = A × G^b × C^c, với A = exp(a)

Điều kiện: G, C > 0; b, c ≥ 0.
```

`ln` là logarit tự nhiên; `exp` là phép đổi ngược. Mô hình tìm các hệ số để tổng bình phương sai số **trên thang log** nhỏ nhất, rồi đổi dự đoán về đơn vị điểm Time Spy.

**Lý do chọn:** nhóm đã thử hồi quy trực tiếp trên điểm gốc và thêm biến tương tác. Khi thử thay CPU, giữ nguyên GPU và dung lượng RAM, mô hình tương tác có trường hợp CPU mới có CPU Mark cao hơn nhưng điểm dự đoán lại thấp hơn. Nhóm muốn mô hình mới tránh hành vi này.

Với cách hiện tại, **giữ điểm GPU cố định thì tăng điểm CPU không làm giảm dự đoán, và ngược lại**. Đây là tính chất nhóm muốn có để dễ giải thích kết quả tư vấn; chưa có nghĩa mô hình mới luôn dự đoán chính xác hơn các phương án trước.

### Quy trình huấn luyện

1. Lọc đúng lượt đo **Time Spy Overall**, có trạng thái `ACCEPT`; ghép đúng điểm tham chiếu CPU/GPU và kiểm tra dữ liệu thiếu hoặc không hợp lệ.
2. Chia **115 dòng train để học** và **29 dòng test để đánh giá**. Các lượt cùng cặp CPU–GPU phải ở cùng một phía.
3. Trong phần train, kiểm định chéo **5 phần**: lần lượt học trên 4 phần và đánh giá phần còn lại, giữ các nhóm CPU–GPU cùng nhau.
4. Học mô hình, dự đoán và tính các chỉ số trên **điểm gốc**.
5. Sau khi chọn phương án, học lại trên **toàn bộ 144 dòng** để xuất bản mô hình cuối.

**Train** là tìm hệ số từ dữ liệu. Khi sử dụng, chỉ tra điểm đầu vào và tính bằng hệ số đã lưu; không phải train lại mỗi lần người dùng yêu cầu tư vấn.

<a id="ket-qua"></a>

## 5. Kết quả và cách đọc chỉ số

### Ba chỉ số cần theo dõi

| Chỉ số | Hiểu đơn giản |
|---|---|
| **MAE** | Trung bình độ lệch tuyệt đối giữa dự đoán và thực tế. Càng nhỏ càng tốt |
| **RMSE** | Cũng đo sai số bằng đơn vị điểm, nhưng các lần sai nhiều ảnh hưởng mạnh hơn so với MAE. Càng nhỏ càng tốt |
| **R²** | So sánh sai số bình phương với mức biến thiên của điểm thực tế quanh trung bình. 1 là khớp hoàn toàn, 0 tương ứng mốc đoán trung bình của tập đang chấm; có thể âm |

Nguồn định nghĩa: [MAE](https://scikit-learn.org/1.6/modules/generated/sklearn.metrics.mean_absolute_error.html), [RMSE](https://scikit-learn.org/1.6/modules/generated/sklearn.metrics.root_mean_squared_error.html), [R²](https://scikit-learn.org/1.6/modules/generated/sklearn.metrics.r2_score.html).

### Kết quả của phương pháp đang chọn

| Lần đánh giá | MAE | RMSE | R² |
|---|---:|---:|---:|
| Test 29 dòng, mô hình học trên 115 dòng | **1.521,01** | **1.907,20** | **0,9294** |
| Trung bình 5 lần kiểm định chéo trong tập train | 1.529,38 | 1.893,59 | 0,9255 |
| Bản cuối học và chấm lại trên toàn bộ 144 dòng | 1.525,96 | 1.956,81 | 0,9261 |

Nguồn: `gaming_comparison.zip` cho test/CV; `gaming_final.zip` cho kết quả trên tập học của bản cuối.

**Cách đọc:** trên 29 dòng test của vòng thử nghiệm, dự đoán lệch trung bình khoảng **1.521 điểm** theo MAE. **R² = 0,9294 không có nghĩa chính xác 92,94%.**

Ví dụ trong bảng test, `RUN-GAMING-001` có điểm thực tế **7.185**, dự đoán **6.508,05**, lệch **676,95 điểm**. Đây là dự đoán của mô hình học trên 115 dòng. Có lượt khác lệch hơn 4.000 điểm, nên MAE không phải sai số tối đa của mỗi cấu hình.

**Giới hạn đánh giá:** tập test đã được xem trong quá trình phát triển; bản cuối còn học lại cả 144 dòng. Vì vậy, cần lượt đo mới để kiểm chứng độc lập bản cuối. Các kết quả hiện tại là kết quả thử nghiệm, chưa chứng minh toàn bộ hệ thống tư vấn đã hoạt động tốt.

<a id="tien-do"></a>

## 6. Những phần đã làm và công việc tiếp theo

| Phần việc | Hiện trạng giữa kỳ |
|---|---|
| Dữ liệu | Có file linh kiện ban đầu, benchmark gaming/văn phòng và bảng tham chiếu |
| Gaming | Đã thử nghiệm, đánh giá và xuất mô hình dạng nhân hiện tại |
| Văn phòng | Có dữ liệu nhưng đang xử lý lỗi, chưa chốt kết quả |
| Backend | Có API thêm, xem, sửa, xóa danh mục, thương hiệu và sản phẩm |
| Frontend | Có giao diện và phần Category gọi backend; trang tư vấn vẫn dùng dữ liệu minh họa |
| Luồng tư vấn hoàn chỉnh | Chưa tích hợp xong việc tạo cấu hình, kiểm tra ràng buộc, tính điểm và trả kết quả thật |

Số **“94% phù hợp”** trên giao diện hiện tại là nội dung minh họa viết sẵn, không phải kết quả của mô hình.

**Tiếp theo:** rà soát dữ liệu, bổ sung linh kiện còn thiếu, xử lý mô hình văn phòng, tích hợp gaming vào backend và giao diện, rồi kiểm tra trên dữ liệu mới. Phạm vi đồ họa cơ bản trong tài liệu yêu cầu chưa có kết quả ở báo cáo này.

<a id="chi-tiet"></a>

## 7. Thông tin giải thích thêm

Các mục dưới đây bổ sung công thức, minh chứng và giới hạn cho phần báo cáo trên.

<details>
<summary>Hệ số bản cuối và ví dụ tính điểm</summary>

Gói `gaming_final.zip`, phiên bản `gaming-log-v1-20260920T194416994761Z`, lưu:

```text
Score = 0.006512728314282055
        × GpuScore^1.2396715874601234
        × CpuMultiScore^0.21617706922388444
```

Với đầu vào ví dụ ở mục 3, công thức cho khoảng **6.562,45 điểm**. Nhãn thực tế của lượt `RUN-GAMING-001` là **7.185 điểm**, độ lệch tuyệt đối khoảng **622,55 điểm**. Đây là ví dụ tính bằng bản cuối đã học toàn bộ 144 dòng, gồm chính dòng này, **không phải kiểm tra trên mẫu mới**.

Hai điểm đầu vào phải hữu hạn và lớn hơn 0. Thiếu điểm tham chiếu thì cần báo chưa đủ dữ liệu, không điền 0 hoặc tự thay bằng 1 để tính tiếp.

</details>

<details>
<summary>Công thức và một ví dụ tính tay</summary>

Đặt `yᵢ` là điểm thực tế, `ŷᵢ` là điểm dự đoán, `n` là số mẫu, `ȳ` là điểm thực tế trung bình **của tập đang được đánh giá**.

```text
MAE  = Σ |yᵢ − ŷᵢ| / n

RMSE = √[Σ (yᵢ − ŷᵢ)² / n]

R²   = 1 − [Σ (yᵢ − ŷᵢ)² / Σ (yᵢ − ȳ)²]
```

Trong các công thức trên, `Σ` là tổng từ mẫu 1 đến mẫu n; `|…|` là giá trị tuyệt đối; `√` là căn bậc hai.

**Ví dụ minh họa cách tính, không phải kết quả thực nghiệm của nhóm:**

| Mẫu | Điểm thực tế | Điểm dự đoán | Độ lệch tuyệt đối |
|---|---:|---:|---:|
| A | 10.000 | 9.000 | 1.000 |
| B | 12.000 | 12.500 | 500 |
| C | 14.000 | 16.000 | 2.000 |

- MAE = `(1000 + 500 + 2000) / 3` ≈ **1.166,67 điểm**.
- RMSE = `sqrt((1000² + 500² + 2000²) / 3)` ≈ **1.322,88 điểm**.
- Điểm thực tế trung bình là 12.000; R² = `1 − 5250000 / 8000000` = **0,34375**.

R² âm nghĩa là tổng sai số bình phương còn lớn hơn mốc đoán trung bình của tập được chấm. Công thức thông thường cần mẫu số khác 0, tức các điểm thực tế không hoàn toàn bằng nhau.

**Phân biệt hai “điểm trung bình”:** mẫu số của R² dùng trung bình của tập đang chấm. Mô hình mốc `DummyRegressor` trong thí nghiệm lại học trung bình **tập train**, rồi dùng số đó dự đoán mọi dòng test. Vì hai trung bình có thể khác nhau, R² test của mô hình mốc không nhất thiết bằng 0.

</details>

<details>
<summary>Vì sao dùng log, vì sao vẫn gọi là hồi quy tuyến tính, và hệ số không âm làm gì?</summary>

**Log giúp biểu diễn quan hệ dạng nhân thành dạng cộng để học:**

```text
ln(A × G^b × C^c) = ln(A) + b × ln(G) + c × ln(C)
```

Đặt `z = ln(y)`, `u = ln(G)`, `v = ln(C)`, ta có `z ≈ a + bu + cv`. Phương trình tuyến tính theo ba hệ số `a`, `b`, `c`; trên thang điểm gốc, quan hệ là dạng nhân lũy thừa. Đây là **hồi quy log–log**, không phải hồi quy logistic.

Trong mô hình này, tăng đầu vào theo tỷ lệ làm dự đoán thay đổi theo tỷ lệ. Chẳng hạn giữ `G` cố định và nhân `C` với `k`, điểm dự đoán nhân với `k^c`. Các số mũ không phải phần trăm đóng góp của CPU/GPU và không cần cộng thành 1.

**Log tự nó không ngăn hệ số âm.** Mã huấn luyện dùng `LinearRegression(positive=True)` để ràng buộc `b, c ≥ 0`. Hệ số chặn `a` vẫn có thể âm; `A = exp(a)` luôn dương. Tham khảo: [LinearRegression](https://scikit-learn.org/1.6/modules/generated/sklearn.linear_model.LinearRegression.html).

Với `G, C > 0` và các số mũ không âm, tăng từng đầu vào khi giữ đầu vào kia cố định sẽ không làm giảm dự đoán. Đây là giả định thiết kế của mô hình, không phải khẳng định mọi CPU có CPU Mark cao hơn đều chơi mọi game tốt hơn.

Mô hình hai biến cũng có giới hạn: cùng `G` và `C` thì dự đoán giống nhau dù dung lượng RAM hay điều kiện chạy khác nhau. Bỏ RAM và điểm CPU đơn luồng khỏi bản cuối **không có nghĩa các yếu tố đó không ảnh hưởng đến hiệu năng thực tế**.

</details>

<details>
<summary>Mô hình tối ưu gì trong lúc huấn luyện?</summary>

Với `n` mẫu trong phần học, mô hình log tìm `a`, `b`, `c` để làm nhỏ:

```text
Sai số log của mẫu i = ln(yᵢ) − [a + b × ln(Gᵢ) + c × ln(Cᵢ)]

L = Σ (sai số log của mẫu i)², với i chạy từ 1 đến n

Tìm a, b, c để L nhỏ nhất, với b ≥ 0 và c ≥ 0.
```

Ký hiệu `Σ` nghĩa là cộng các giá trị của tất cả mẫu trong phần học; chỉ số `i` chỉ từng mẫu.

Đây là **tổng bình phương sai số trên thang log**. Mô hình không trực tiếp tối ưu MAE trên điểm gốc, cũng không trực tiếp tối ưu thứ hạng cấu hình.

Phần mã chính của phương án này:

```python
TransformedTargetRegressor(
    regressor=Pipeline([
        ("log_input", FunctionTransformer(np.log, validate=True)),
        ("linear", LinearRegression(positive=True))
    ]),
    func=np.log,
    inverse_func=np.exp
)
```

`FunctionTransformer` lấy log đầu vào. `TransformedTargetRegressor` lấy log nhãn khi học và dùng `exp` để đổi dự đoán về điểm gốc. Thư viện giải bài toán tìm hệ số; đoạn mã này không yêu cầu nhóm tự chọn số epoch hoặc learning rate. Tham khảo: [TransformedTargetRegressor](https://scikit-learn.org/1.6/modules/generated/sklearn.compose.TransformedTargetRegressor.html).

Quy trình so sánh còn kiểm tra đủ các cột của bản tương tác, gồm CPU đơn luồng và RAM, để các phương án được đánh giá trên cùng tập mẫu. Công thức bản cuối chỉ nhận hai điểm `GpuScore`, `CpuMultiScore`.

</details>

<details>
<summary>Các phương án trước và bảng so sánh</summary>

Nhóm bắt đầu với **hồi quy tuyến tính nhiều biến**: dùng nhiều thông tin đầu vào để dự đoán một điểm số liên tục. Các hệ số được học từ dữ liệu, không phải trọng số nhóm tự đặt.

| Giai đoạn | Cách làm | Nhận xét và lý do tiếp tục điều chỉnh |
|---|---|---|
| **1. Dạng cộng trên điểm gốc** | Dùng điểm CPU đơn luồng, CPU Mark, GPU G3D Mark và dung lượng RAM | Dễ giải thích, làm mốc thử nghiệm. Mỗi biến có hệ số cố định; chưa có thành phần biểu diễn tác động kết hợp CPU–GPU |
| **2. Thêm biến tương tác** | Giữ bốn đầu vào trên, thêm hai tích điểm CPU × GPU | Giảm sai số so với bản đầu trong vòng thử nghiệm cũ, nhưng có trường hợp điểm dự đoán giảm khi chuyển sang CPU có CPU Mark cao hơn |
| **3. Hồi quy trên thang log với hệ số không âm** | Dùng GPU G3D Mark và CPU Mark; đổi cả đầu vào và nhãn sang log để học | Công thức gọn hơn, điểm dự đoán dương và không giảm khi tăng từng điểm đầu vào, giữ đầu vào còn lại cố định |

### Vì sao không giữ phương án có biến tương tác?

Trong bảng thử thay CPU, giữ **RTX 3050 8GB và RAM 32GB**, mô hình tương tác của vòng so sánh cho kết quả:

| CPU | CPU Mark tham chiếu | Điểm dự đoán của mô hình tương tác |
|---|---:|---:|
| Ryzen 5 5500 | 19.252 | 7.760,18 |
| Core Ultra 9 285K | 67.264 | 5.601,75 |

Đây là ví dụ về hành vi của công thức trên các tổ hợp thử, **không phải điểm benchmark thực đo của hai cấu hình này**. Khi thay model CPU, điểm đơn luồng cũng thay đổi. Ví dụ này không chứng minh CPU Mark quyết định toàn bộ hiệu năng chơi game, nhưng cho thấy mô hình có thể tạo ra thứ tự khó giải thích khi dùng để tư vấn.

Vì vậy, nhóm chọn một yêu cầu cho công thức mới: **giữ điểm GPU cố định thì tăng CPU Mark không làm giảm dự đoán, và ngược lại**. Tính chất này gọi là *không giảm theo từng đầu vào*.

Việc đổi mô hình là một lựa chọn có đánh đổi: bản log đáp ứng yêu cầu trên, nhưng **không đạt sai số thấp hơn mô hình tương tác ở mọi cách đánh giá**. Kết quả so sánh nằm ngay dưới đây.

**Công thức các phương án trước**

Đặt `S` là điểm CPU đơn luồng, `C` là CPU Mark, `G` là GPU G3D Mark và `R` là dung lượng RAM tính bằng GB.

**Dạng cộng ban đầu:**

```text
ŷ = β₀ + β₁ × S + β₂ × C + β₃ × G + β₄ × R
```

`ŷ` là điểm dự đoán; `β₀` là hệ số chặn, còn `β₁` đến `β₄` là các hệ số của đầu vào, được học từ dữ liệu.

Ví dụ, khi tăng `C` một lượng cố định và giữ các biến còn lại không đổi, mức thay đổi dự đoán luôn bằng hệ số của `C` nhân với lượng tăng đó, bất kể điểm GPU đang cao hay thấp.

**Dạng có tương tác:**

```text
ŷ = β₀ + β₁ × S + β₂ × C + β₃ × G + β₄ × R
    + β₅ × (S × G / 10000)
    + β₆ × (C × G / 10000)
```

Hai cột bổ sung trong notebook là `CpuSingle_x_Gpu` và `CpuMulti_x_Gpu`. Tích giúp mức ảnh hưởng của CPU có thể thay đổi theo điểm GPU. Chia cho `10000` chỉ đổi thang số của hai cột, không có nghĩa chúng đóng góp một tỷ lệ cố định.

Cả hai phương án đều tuyến tính theo các hệ số cần học. Chỉ nhìn một hệ số âm riêng lẻ của bản tương tác chưa đủ kết luận toàn bộ tác động của biến đó, vì còn có các tích liên quan.



**Các vòng dùng bản dữ liệu ở thời điểm khác nhau; chỉ so sánh trực tiếp trong cùng một bảng.**

### Vòng ban đầu — từ dạng cộng sang thêm tương tác

Nguồn: `gaming_model.zip` → `model_info.json` → `test_results`. Kết quả trên **29 dòng test**, các mô hình học trên **115 dòng train** của vòng đó.

| Phương án | MAE | RMSE | R² |
|---|---:|---:|---:|
| Luôn đoán trung bình tập train | 6.180,51 | 7.408,16 | −0,0635 |
| Dạng cộng, bốn đầu vào | 2.304,94 | 2.811,90 | 0,8468 |
| Thêm tương tác CPU–GPU | **1.662,86** | **2.206,23** | **0,9057** |

Trong vòng này, thêm tương tác làm giảm sai số so với dạng cộng. Tuy nhiên, kết quả sai số chưa đủ để kết luận cách xếp hạng luôn phù hợp, nên nhóm tiếp tục kiểm tra hành vi của mô hình.

### Vòng sau — so sánh tương tác với mô hình log

Nguồn: `gaming_comparison.zip` → `test_metrics.csv`, `cv_results.csv`. Hai phương án dùng cùng dữ liệu và danh sách chia của vòng so sánh này.

**Kết quả trên 29 dòng test:**

| Phương án | MAE | RMSE | R² |
|---|---:|---:|---:|
| Tương tác CPU–GPU | 1.646,85 | 2.203,73 | 0,9058 |
| Log với hệ số không âm | **1.521,01** | **1.907,20** | **0,9294** |

**Trung bình chỉ số qua 5 lần kiểm định chéo trong 115 dòng train:**

| Phương án | MAE trung bình | RMSE trung bình | R² trung bình |
|---|---:|---:|---:|
| Tương tác CPU–GPU | **1.310,31** | **1.727,02** | **0,9372** |
| Log với hệ số không âm | 1.529,38 | 1.893,59 | 0,9255 |

Bản log có kết quả tốt hơn trên tập test này, nhưng **MAE trung bình CV cao hơn khoảng 16,7%** so với bản tương tác. Nhóm chọn bản log để có công thức hai đầu vào và đáp ứng yêu cầu không giảm theo từng điểm đầu vào. Chưa thể khẳng định bản log chính xác hơn toàn diện hoặc đã đủ tốt cho mọi cấu hình.

</details>

<details>
<summary>Các giới hạn và điểm dữ liệu cần rà soát</summary>

- **Văn phòng:** đang xử lý lỗi và kiểm tra lại mô hình. Điểm đích trong dữ liệu là `PCMark 10 Productivity`; không dùng kết quả gaming để kết luận cho văn phòng.
- **Tích hợp DSS:** chưa hoàn thiện luồng tạo cấu hình, lọc ngân sách/tương thích, gọi mô hình, xếp hạng và trả kết quả thật lên giao diện.
- **Phạm vi đề tài:** tài liệu yêu cầu còn có nhu cầu đồ họa cơ bản. Phần đó chưa có kết quả trong báo cáo giữa kỳ này.
- **Chất lượng dữ liệu:** điều kiện chạy benchmark chưa đồng nhất; nhiều ô phiên bản hoặc thiết lập còn thiếu. Dòng `RUN-GAMING-137` có ghi chú về VRAM/điều kiện đo cần đối chiếu lại với nguồn và trạng thái `ACCEPT`. Trạng thái đã duyệt không bảo đảm mọi thông tin đều hoàn toàn đúng.
- **Phạm vi dự đoán:** bản cuối học trên GPU G3D Mark từ **12.460–35.623** và CPU Mark từ **13.953–70.109**. Đầu vào ngoài khoảng cần được đánh dấu là dự đoán ngoài phạm vi dữ liệu đã học; nằm trong khoảng cũng chưa bảo đảm mọi cặp CPU–GPU đều đã được kiểm chứng.
- **Đánh giá:** chưa có kiểm chứng độc lập cho bản cuối và chưa đánh giá chất lượng thứ hạng của toàn bộ hệ thống tư vấn. Công thức không giảm theo đầu vào cũng chưa mô tả đầy đủ hiện tượng một linh kiện giới hạn hiệu năng của cả máy.
- **Báo cáo chương 1–2:** phần mô hình cần được đồng bộ với phương án hiện tại; công thức cộng có thể giữ ở phần lý thuyết hoặc mô tả phương án ban đầu.

</details>

<details>
<summary>Phân biệt công thức điểm Time Spy của UL với công thức dự đoán của nhóm</summary>

Theo UL, điểm tổng Time Spy được tính từ Graphics Score và CPU Score **của chính bài đo Time Spy** bằng trung bình điều hòa có trọng số:

```text
Điểm Time Spy = 1 / (0.85 / Graphics Score + 0.15 / CPU Score)
```

Nhóm không đưa điểm PassMark vào công thức này, vì chúng không phải hai điểm thành phần mà công thức yêu cầu. Nhóm xây dựng một mô hình học từ dữ liệu để **ước lượng** điểm tổng, khi chỉ biết điểm tham chiếu CPU/GPU.

Vì vậy, công thức hồi quy dạng nhân của nhóm không phải công thức chính thức tính điểm Time Spy của UL. Nguồn: [UL giải thích cách tính điểm Time Spy](https://support.benchmarks.ul.com/support/solutions/articles/44002136143-how-is-the-3dmark-time-spy-score-calculated-).

</details>

<details>
<summary>Vì sao không lấy Graphics Score và CPU Score của chính lượt Time Spy làm đầu vào?</summary>

Khi tư vấn cấu hình mới, hai điểm đó thường chưa có vì máy chưa được lắp và chạy bài đo. Chúng còn là thành phần trực tiếp tạo nên điểm tổng cần dự đoán. Dùng chúng sẽ khiến bài toán đánh giá khác với điều kiện tư vấn thực tế. Nhóm dùng điểm PassMark tham chiếu tra được từ model linh kiện.

</details>

<details>
<summary>144 dòng đã đủ để kết luận mô hình tốt chưa?</summary>

144 dòng cho phép xây dựng và thử nghiệm mô hình hiện tại. Số lượng này chưa bảo đảm độ chính xác cho mọi cấu hình. Còn phải xét độ đa dạng CPU/GPU, các lượt đo lặp, chất lượng nguồn và kết quả trên dữ liệu mới. Các lượt cùng cặp CPU–GPU được giữ cùng nhóm khi chia tập để giảm việc đánh giá trên những trường hợp quá giống phần đã học.

</details>

<details>
<summary>165 tổ hợp trong file kiểm tra có phải 165 mẫu benchmark mới không?</summary>

Không. Bảng thử có 15 CPU × 11 GPU = 165 tổ hợp để kiểm tra phép tính hoặc hành vi dự đoán. Nó không cung cấp thêm 165 điểm thực đo, nên không thể dùng số tổ hợp này để tăng số mẫu huấn luyện hay chứng minh độ chính xác.

</details>

<details>
<summary>Tên file minh chứng, phiên bản và tài liệu tham khảo</summary>

### Hồ sơ dữ liệu và kết quả

Tên file dưới đây dùng để đối chiếu với Excel, notebook và gói kết quả khi trình bày. Chúng là các tệp riêng; nội dung README không tự đính kèm các file đó.

| Tài liệu | Phần liên quan |
|---|---|
| `dữ liệu PC.xlsx` | Các sheet linh kiện đang thu thập |
| `Benchmark (6) (1).xlsx` | `Benchmark_Gaming`, `Benchmark_VanPhong`, `ReferenceBenchmark` |
| `PC_DSS_Gaming.ipynb` | Mã mô hình cộng, thêm tương tác, chia nhóm và đánh giá vòng đầu |
| `Untitled4.ipynb` | Notebook so sánh tương tác với log; phần `make_log`, bảng CV và test |
| `gaming_model.zip` | Kết quả vòng đầu ở `model_info.json` |
| `gaming_comparison.zip` | Bảng test/CV, dự đoán từng dòng, bảng thử CPU và danh sách chia ở `data_used.csv` |
| `gaming_final.zip` | Hệ số bản cuối ở `model_info.json`, `training_predictions.csv`, bảng tham chiếu và các mẫu kiểm tra phép tính |

**Thông tin nhận diện phiên bản dữ liệu và mô hình**

- Mô hình cuối: `gaming-log-v1-20260920T194416994761Z`.
- Tệp nguồn: `Benchmark (6) (1).xlsx`.
- SHA-256 của tệp nguồn: `2d3e796ca57f027c86cdfb5598d61390d4e07c1eb0acca86ee225e2948666895`.
- Gói so sánh sau và gói cuối ghi cùng dấu nhận diện tệp nguồn này.
- Phiên bản scikit-learn được ghi trong gói: `1.6.1`.

Dấu SHA-256 giúp xác định đúng bản Excel dùng để tạo kết quả, tránh nhầm giữa nhiều file có tên gần giống nhau.



### Tài liệu trong dự án

- [README tổng quan](README.md)
- [Yêu cầu hệ thống](docs/requirements.md)
- [Mẫu thu thập dữ liệu](docs/data-collection-template.md)
- [Thiết kế cơ sở dữ liệu](docs/database-demo.md)
- [Kịch bản kiểm tra API](backend/tests/README.md)

</details>

