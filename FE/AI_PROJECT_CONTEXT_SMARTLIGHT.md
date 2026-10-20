# AI Project Context — SmartLight
> Tài liệu ngữ cảnh dành cho AI hỗ trợ phân tích, thiết kế, lập trình, kiểm thử và viết báo cáo cho dự án SmartLight.  
> Nguồn nền tảng: `Báo cáo Smartlight.docx` và tài liệu kỹ thuật tủ điều khiển chiếu sáng đã cung cấp.  
> Ngôn ngữ làm việc mặc định: **Tiếng Việt**.

## 1. Cách AI phải sử dụng tài liệu này

Khi người dùng yêu cầu một công việc liên quan đến dự án, hãy đọc phần liên quan trong file này trước khi trả lời.

### Quy tắc ưu tiên
1. **Yêu cầu mới nhất, cụ thể của người dùng** được ưu tiên đối với các lựa chọn thiết kế của đồ án.
2. Các yêu cầu/đặc tính được ghi rõ trong báo cáo và tài liệu kỹ thuật là căn cứ nghiệp vụ.
3. Các đề xuất mở rộng do AI đưa ra phải được đánh dấu là **đề xuất thiết kế**, không được trình bày như yêu cầu gốc.
4. Không tự ý đổi bố cục, màu sắc, tên chức năng, actor, công nghệ hay phạm vi đã được người dùng chốt.
5. Nếu thiếu thông tin quan trọng, hãy nêu giả định ngắn gọn hoặc hỏi **một câu hỏi cần thiết**; không tự bịa chi tiết kỹ thuật.
6. Không đề xuất mở rộng quá lớn so với dự án sinh viên. Ưu tiên cách làm đơn giản, có thể triển khai và demo được.
7. Khi người dùng yêu cầu đúng form mẫu, phải giữ đúng tên cột, thứ tự mục, cách đánh số luồng và độ dài tương tự mẫu; không tự thêm mục mới.
8. Trả lời ngắn gọn, đi thẳng vào yêu cầu. Không nhắc lại dài dòng những điều người dùng đã chốt.
9. Nếu dựa vào tài liệu nguồn mà nội dung không có trong tài liệu, phải nói rõ đó là giả định hoặc quy ước thiết kế của đồ án.
10. Khi sửa code/giao diện, ưu tiên thay đổi nhỏ nhất để đạt yêu cầu; không tự viết lại toàn bộ nếu người dùng không yêu cầu.

## 2. Tổng quan dự án

- **Tên đề tài:** Phần mềm quản lý, điều khiển và giám sát hệ thống chiếu sáng công cộng.
- **Bối cảnh:** Mô phỏng trung tâm điều hành quản lý hệ thống chiếu sáng công cộng đô thị, định hướng ứng dụng tại thành phố Đà Nẵng.
- **Mục tiêu:** Quản lý tập trung thông tin hạ tầng chiếu sáng; giám sát trạng thái và thông số thiết bị; điều khiển chiếu sáng từ xa; lập lịch tự động; phát hiện và theo dõi cảnh báo; báo cáo, thống kê và lưu nhật ký; áp dụng biện pháp an toàn thông tin theo định hướng cấp độ 3.
- **Phạm vi:** Tập trung vào phần mềm, xử lý dữ liệu, giao diện Web, kết nối thiết bị/phần mềm giả lập và bảo mật. Không nghiên cứu sâu về thiết kế mạch điện, thiết bị điện công suất hoặc triển khai thật trên quy mô toàn thành phố.
- **Đối tượng hạ tầng chính:** Khu vực chiếu sáng, tủ điều khiển/tủ chiếu sáng, tuyến chiếu sáng và điểm đèn.
- **Mô hình vận hành:** Trung tâm quản lý ↔ tủ điều khiển ↔ điểm đèn.
- **Yêu cầu thực tế:** Có thể sử dụng dữ liệu giả lập để demo khi chưa có thiết bị vật lý.

## 3. Công nghệ dự án

Theo báo cáo:
- **Backend:** C# / ASP.NET.
- **Frontend:** HTML, CSS, JavaScript.
- **Cơ sở dữ liệu:** Microsoft SQL Server.
- **Ứng dụng:** Web Dashboard quản lý, giám sát và điều khiển.
- **API:** REST API.
- **Giao tiếp thiết bị:** TCP/IP Socket; có thể dùng phần mềm/thiết bị giả lập để kiểm thử.
- **Máy chủ tối thiểu tham khảo:** 4 vCPU, RAM 8 GB, SSD từ 100 GB, Ethernet 1 Gbps; Windows Server 2019/2022.
- **Bảo mật kết nối:** Báo cáo mô tả TLS cho kết nối Server; tài liệu kỹ thuật thiết bị nêu AES-256. Khi thiết kế phải phân biệt bối cảnh và không tự khẳng định hai cơ chế này là cùng một lớp.
- **Thiết bị:** Xác thực bằng Device ID + Key; kiểm tra tính toàn vẹn gói tin/checksum theo tài liệu.
- Không tự đổi sang framework/ngôn ngữ khác nếu người dùng không yêu cầu.

## 4. Mô hình dữ liệu và quan hệ hạ tầng

Quan hệ nghiệp vụ người dùng đang sử dụng:
- Một **khu vực chiếu sáng** có nhiều **tủ chiếu sáng**.
- Một **tủ chiếu sáng** có nhiều **tuyến chiếu sáng**.
- Một **tuyến chiếu sáng** có nhiều **điểm đèn**.

Khi thiết kế CSDL, API, bộ lọc, bản đồ, phân quyền hoặc giao diện chi tiết, cần giữ nhất quán quan hệ cha–con này, trừ khi người dùng cung cấp mô hình mới.

Thông tin có thể quản lý/giám sát:
- Khu vực: mã/tên khu vực và thông tin quản lý.
- Tủ: mã tủ, tên, khu vực, vị trí, trạng thái kết nối, trạng thái hoạt động và thông số điện.
- Tuyến: mã/tên tuyến, tủ cha, trạng thái, chế độ chiếu sáng.
- Điểm đèn: mã điểm đèn, tuyến cha, trạng thái, mức sáng và thông số được hỗ trợ.
- Vị trí thiết bị có thể hiển thị trên bản đồ nếu có tọa độ.
- Không giả định rằng tài liệu gốc quy định mọi trường dữ liệu chi tiết; những trường bổ sung là lựa chọn thiết kế của đồ án.

## 5. Actor và phân quyền

### 5.1. Quy ước actor hiện tại của đồ án
Người dùng đã chọn mô hình Use Case chỉ có **2 actor chính**:
1. **Quản trị viên (Admin)**
2. **Nhân viên vận hành (Operator)**

Báo cáo nguồn có mô tả thêm **Nhân viên kỹ thuật**, nhưng nếu người dùng tiếp tục yêu cầu mô hình 2 actor thì phải giữ 2 actor trên. Khi đó:
- Công việc sửa chữa vật lý ngoài hiện trường của kỹ thuật viên được xem là **quy trình bên ngoài hệ thống**.
- Không thiết kế chức năng đăng nhập/phân quyền cho kỹ thuật viên nếu người dùng chưa đổi quyết định.
- Nếu người dùng yêu cầu tiếp tục dùng giao diện có actor Nhân viên kỹ thuật, cần làm rõ thay đổi phạm vi trước khi sửa mô hình tổng thể.

### 5.2. Quản trị viên
Các chức năng chính:
- Đăng nhập/đăng xuất.
- Quản lý tài khoản người dùng.
- Phân quyền theo vai trò/chức năng và khu vực.
- Quản lý khu vực chiếu sáng.
- Quản lý tủ chiếu sáng.
- Quản lý tuyến chiếu sáng.
- Quản lý điểm đèn.
- Theo dõi nhật ký hoạt động hệ thống/người dùng.
- Cấu hình cảnh báo.
- Các chức năng dùng chung mà mô hình Use Case cho phép kế thừa từ Nhân viên vận hành.

### 5.3. Nhân viên vận hành
Các chức năng chính:
- Đăng nhập/đăng xuất.
- Xem Dashboard.
- Theo dõi trạng thái tủ, tuyến và điểm đèn.
- Xem vị trí thiết bị trên bản đồ.
- Điều khiển chiếu sáng trong phạm vi được phân quyền.
- Thiết lập lịch vận hành tự động nếu được phân quyền.
- Xem báo cáo/thống kê nếu được phân quyền.
- Theo dõi cảnh báo sự cố.
- Xem lịch sử hoạt động cá nhân.

### 5.4. Nhật ký
- **Admin:** xem nhật ký hoạt động hệ thống/người dùng trong phạm vi quyền quản trị.
- **Nhân viên vận hành:** xem nhật ký hoạt động của chính tài khoản mình.
- Các hành động quan trọng cần ghi nhận: đăng nhập/đăng xuất; thay đổi tài khoản/quyền; điều khiển đóng/cắt; thay đổi lịch/chế độ; thay đổi cấu hình; kết nối/mất kết nối/xác thực thiết bị; cảnh báo và lỗi truyền nhận dữ liệu.

## 6. Các chức năng chính

### 6.1. Quản lý hạ tầng
- Quản lý khu vực chiếu sáng.
- Quản lý tủ chiếu sáng.
- Quản lý tuyến chiếu sáng.
- Quản lý điểm đèn.
- Hỗ trợ thêm/sửa/xóa khi phù hợp với quyền và trạng thái dữ liệu.
- Kiểm tra quan hệ cha–con khi tạo hoặc sửa dữ liệu.
- Không xóa dữ liệu cha nếu còn dữ liệu con phụ thuộc, trừ khi có quy tắc xóa rõ ràng.

### 6.2. Giám sát
Các trạng thái/thông số có căn cứ trong tài liệu:
- Trạng thái kết nối thiết bị.
- Trạng thái đóng/cắt chiếu sáng.
- Trạng thái đóng/mở cửa tủ.
- Dòng điện, điện áp, công suất, cosφ, điện năng và thời gian hoạt động tùy khả năng thiết bị.
- Nhiệt độ, mất pha, mất điện lưới, quá dòng, quá áp và trạng thái bất thường khác khi thiết bị hỗ trợ.
- Giám sát theo tủ, tuyến và điểm đèn tùy thiết bị/tính năng được triển khai.
- Có thể hiển thị dữ liệu giả lập khi không có thiết bị thật; cần ghi rõ trong tài liệu/demo rằng dữ liệu đang được mô phỏng.

### 6.3. Điều khiển chiếu sáng
- Điều khiển bật/tắt tức thời.
- Điều khiển theo tủ, tuyến, nhóm hoặc khu vực theo quyền.
- Hỗ trợ các mức điều khiển chiếu sáng 0%, 30%, 70%, 100% theo mô tả kỹ thuật.
- Thiết lập lịch vận hành tự động.
- Sau khi gửi lệnh, hệ thống cần hiển thị kết quả/phản hồi thiết bị nếu có.
- **Phân biệt rõ:** điều khiển đóng/cắt nguồn chiếu sáng không đồng nghĩa với điều khiển cánh cửa vật lý của tủ.

### 6.4. Bản đồ và chi tiết thiết bị
- Bản đồ hiển thị thiết bị theo tọa độ có sẵn.
- Bộ lọc có thể gồm khu vực, tủ, tuyến, loại thiết bị và trạng thái.
- Khi thiết bị mất kết nối, có thể vẫn hiển thị thông tin/vị trí gần nhất và thời điểm cập nhật cuối.
- Trang chi tiết thiết bị hiển thị thông tin chung, trạng thái/kết nối và số liệu đo hiện tại.
- Không bịa tọa độ thật; dùng dữ liệu demo có nhãn mô phỏng nếu cần.

### 6.5. Báo cáo và nhật ký
- Tra cứu theo khoảng thời gian và tiêu chí.
- Hiển thị bảng/biểu đồ khi phù hợp.
- Xuất báo cáo nếu chức năng được yêu cầu.
- Phân trang dữ liệu lịch sử để tránh tải quá nhiều dữ liệu.
- Ghi nhận các thao tác quan trọng để hỗ trợ kiểm tra và truy vết.

## 7. Quy tắc nghiệp vụ cảnh báo

### 7.1. Phân biệt vai trò
- **Admin cấu hình quy tắc:** xác định loại cảnh báo, thông số, điều kiện, ngưỡng, mức độ, phân loại xử lý và trạng thái kích hoạt.
- **Hệ thống tự động giám sát:** nhận dữ liệu thiết bị, so sánh với quy tắc đang bật và tạo cảnh báo khi điều kiện thỏa mãn.
- **Nhân viên vận hành theo dõi:** lọc/tìm kiếm, xem chi tiết, tiếp nhận hoặc cập nhật tình trạng xử lý và ghi chú.
- Không yêu cầu Admin tự tạo thủ công từng cảnh báo phát sinh từ thông số thiết bị.

### 7.2. Luồng tổng quát
1. Admin tạo/cập nhật và kích hoạt quy tắc cảnh báo.
2. Thiết bị hoặc bộ mô phỏng gửi dữ liệu lên hệ thống.
3. Hệ thống kiểm tra dữ liệu với quy tắc đang bật.
4. Nếu điều kiện cảnh báo được thỏa mãn, hệ thống tạo bản ghi cảnh báo.
5. Cảnh báo xuất hiện trong danh sách của Nhân viên vận hành theo phạm vi được phân quyền.
6. Nhân viên xem chi tiết, kiểm tra thông số/vị trí/lịch sử, ghi nhận và cập nhật trạng thái.
7. Nếu cần sửa chữa vật lý, nhân viên ghi nhận/chuyển thông tin cho bộ phận kỹ thuật ngoài hệ thống (trong mô hình 2 actor).
8. Khi trạng thái trở về bình thường, người có quyền cập nhật/đóng sự cố theo quy tắc triển khai; lịch sử xử lý vẫn được lưu.

### 7.3. Các trạng thái nên dùng
Có thể dùng các trạng thái đơn giản:
- **Chưa xử lý**
- **Đang xử lý**
- **Đã xử lý**

Nếu cần thể hiện riêng việc tiếp nhận, có thể bổ sung **Chưa tiếp nhận**, nhưng phải thống nhất giữa danh sách và trang chi tiết. Không sử dụng quá nhiều trạng thái nếu không cần cho đồ án.

### 7.4. Phân nhóm cảnh báo
Các loại sau là ví dụ phù hợp với dữ liệu kỹ thuật, không phải ngưỡng cố định bắt buộc:
- Quá dòng — thường phân nhóm Kỹ thuật.
- Quá áp — thường phân nhóm Kỹ thuật.
- Mất pha — thường phân nhóm Kỹ thuật.
- Mất điện lưới — thường phân nhóm Kỹ thuật.
- Nhiệt độ cao — thường phân nhóm Kỹ thuật.
- Mất kết nối tủ — thường phân nhóm Kỹ thuật.
- Lỗi đóng/cắt — thường phân nhóm Kỹ thuật.
- Điện áp ắc quy thấp — thường phân nhóm Kỹ thuật nếu thiết bị có pin dự phòng.
- Đứt/trộm cáp — Kỹ thuật.
- Mở cửa tủ — là **trạng thái cửa vật lý được cảm biến phát hiện**. Có thể tạo cảnh báo theo quy tắc, ví dụ cửa mở ngoài thời gian bảo trì; không mặc định mọi lần mở cửa đều là lỗi kỹ thuật.
- Các ngưỡng cụ thể (ví dụ 25 A, 250 V, 60°C, 5 phút) phải được xem là dữ liệu cấu hình/demo cho tới khi được người dùng hoặc tài liệu kỹ thuật xác nhận.

### 7.5. Cửa tủ và điều khiển chiếu sáng
- “Mở cửa tủ” là cánh cửa tủ vật lý ngoài hiện trường chuyển sang trạng thái OPEN, được cảm biến/bộ điều khiển gửi về phần mềm.
- Phần mềm giám sát trạng thái cửa và có thể phát cảnh báo dựa trên điều kiện cấu hình.
- Không tạo chức năng mở/đóng cánh cửa tủ từ xa nếu chưa có yêu cầu phần cứng khóa/motor được xác nhận.
- Lệnh bật/tắt/điều chỉnh mức sáng là lệnh điều khiển thiết bị chiếu sáng/contactor, không phải lệnh mở cánh cửa tủ.

### 7.6. Giao diện cảnh báo
**Màn hình danh sách Theo dõi cảnh báo sự cố** dành cho Nhân viên vận hành nên có:
- Thẻ tổng quan: tổng cảnh báo và số lượng theo mức độ.
- Bộ lọc theo nhóm sự cố, loại cảnh báo, mức độ, trạng thái, thời gian.
- Tìm kiếm theo tủ/tuyến/thông số.
- Bảng danh sách: thời gian, loại cảnh báo, phân nhóm, thông số, thiết bị/vị trí, mức độ, trạng thái, thao tác.
- Thao tác xem chi tiết; các hành động cập nhật trạng thái/ghi chú đặt trong trang chi tiết.
- Không đặt nút **“Tạo quy tắc cảnh báo”** trên màn hình Nhân viên vận hành; chức năng này thuộc màn hình **Admin – Cấu hình cảnh báo**.
- Màn hình chi tiết có thể gồm: mã cảnh báo, loại, phân nhóm, mức độ, thời gian, thiết bị/vị trí, thông số hiện tại và ngưỡng, tóm tắt/hướng xử lý, ghi chú, trạng thái và dòng thời gian xử lý.
- Nếu người dùng yêu cầu giữ bố cục/màu của ảnh mẫu, chỉ sửa nội dung/nhãn/hành động cần thiết; không tự thay layout hoặc palette.

## 8. Giao diện và màu sắc

### 8.1. Nguyên tắc
- Giao diện tiếng Việt.
- Phong cách dashboard quản lý hạ tầng công cộng: rõ ràng, gọn, ưu tiên khả năng đọc bảng và trạng thái.
- Dùng sidebar điều hướng, thanh tìm kiếm/thông tin tài khoản phía trên và vùng nội dung chính nếu ảnh mẫu đang dùng bố cục này.
- **Nếu người dùng cung cấp ảnh giao diện và yêu cầu giữ bố cục/màu sắc thì phải giữ nguyên bố cục, vị trí thành phần, màu nền và palette gốc.** Chỉ thay đổi thành phần nghiệp vụ được yêu cầu.
- Không tự tạo thêm trang/khối lớn hoặc thay đổi màu nếu người dùng chỉ yêu cầu chỉnh một lỗi nghiệp vụ.

### 8.2. Palette từ mẫu SmartLight
Mẫu giao diện đã dùng:
- Xanh dương đậm làm màu chủ đạo cho nút chính, mục sidebar được chọn và các hành động quan trọng.
- Các sắc xanh dương nhạt cho nền phụ, bộ lọc, thông tin/trạng thái nhẹ.
- Nền tổng thể trắng hoặc xanh xám rất nhạt.
- Cam/đào cho nhãn cảnh báo, trạng thái chờ xử lý và mức độ trung bình.
- Đỏ cho cảnh báo nghiêm trọng/cao.
- Xanh lá hoặc xanh lam nhạt cho trạng thái bình thường/đã xử lý.
- Xám đậm cho nội dung chữ; xám nhạt cho đường viền và thông tin phụ.
- Không tự suy diễn mã HEX chính xác từ ảnh; nếu cần mã màu chính xác, lấy từ CSS/repository hoặc yêu cầu người dùng cung cấp mã màu.

### 8.3. Phân biệt hai màn hình
- **Admin – Cấu hình cảnh báo:** quản lý quy tắc cảnh báo (thêm, sửa, bật/tắt, xóa); cấu hình loại, thông số, điều kiện, ngưỡng, mức độ, phân nhóm.
- **Nhân viên vận hành – Theo dõi cảnh báo sự cố:** xem danh sách cảnh báo đã được hệ thống phát sinh, lọc/tìm kiếm, xem chi tiết và theo dõi/cập nhật xử lý.
- Hai màn hình phải là **hai giao diện riêng biệt**, không gộp quyền cấu hình và quyền theo dõi vào cùng một form.

## 9. Form chuẩn đặc tả Use Case

Khi người dùng yêu cầu đặc tả Use Case theo form mẫu đã gửi, phải dùng bảng 2 cột, đúng thứ tự mục sau:

| Cột trái | Cột phải |
|---|---|
| Use-case name | Tên Use Case |
| Description | Mô tả ngắn |
| Actors | Tác nhân |
| Input | Dữ liệu đầu vào |
| Output | Kết quả đầu ra |
| Basic flow | Các bước chính, đánh số 1, 2, 3... |
| Alternative flow | Các nhánh thay thế tham chiếu bước, ví dụ `3a.` |
| Exception flow | Các lỗi/ngoại lệ tham chiếu bước, ví dụ `6a.` |

Quy tắc:
- Không tự thêm “Tiền điều kiện”, “Hậu điều kiện”, “Quy tắc nghiệp vụ” nếu người dùng chỉ yêu cầu form trên.
- Nội dung gọn, đầy đủ và bám sát giao diện thực tế.
- **Thêm/Sửa/Xóa** đặt ở Alternative flow khi phù hợp với mẫu.
- Luồng ngoại lệ phải tham chiếu đúng bước phát sinh lỗi.
- Dùng thuật ngữ tiếng Việt thống nhất.
- Nếu hai actor cùng dùng một Use Case, mô tả đúng vai trò từng actor; không thêm actor thứ ba trái với quyết định hiện tại của người dùng.

## 10. Kiểm thử (Test Case)

Khi được yêu cầu tạo test case:
- Bám theo giao diện, use case, yêu cầu trong báo cáo và quy tắc nghiệp vụ đã chốt.
- Nếu yêu cầu **high-level**, viết test case ở mức chức năng/nghiệp vụ, không biến thành kiểm thử từng nút nhỏ trừ khi được yêu cầu.
- Dùng tiếng Việt.
- Các cột nên theo mẫu người dùng cung cấp; nếu chưa có mẫu trong ngữ cảnh hiện tại, có thể đề xuất: Mã TC, Chức năng, Mục tiêu kiểm thử, Tiền điều kiện, Bước kiểm thử, Dữ liệu kiểm thử, Kết quả mong đợi, Mức ưu tiên.
- Bao phủ: luồng thành công, dữ liệu không hợp lệ, phân quyền, dữ liệu rỗng, bộ lọc/tìm kiếm, lỗi kết nối/lưu dữ liệu, trạng thái thiết bị và lịch sử/audit khi phù hợp.
- Không tự khẳng định test đã chạy thành công nếu chỉ mới lập danh sách.

## 11. An toàn thông tin

Định hướng cấp độ 3 trong đồ án cần xem xét:
- Xác thực người dùng trước khi truy cập.
- Phân quyền theo vai trò, chức năng và khu vực.
- Kiểm soát thao tác điều khiển có ảnh hưởng đến hệ thống.
- Xác thực thiết bị bằng Device ID + Key.
- Bảo vệ dữ liệu truyền; báo cáo nêu TLS cho kết nối Server, tài liệu kỹ thuật nêu AES-256 cho dữ liệu thiết bị.
- Kiểm tra tính toàn vẹn dữ liệu/gói tin.
- Ghi nhật ký các thao tác quan trọng và sự kiện bất thường.
- Hạn chế truy cập trực tiếp cơ sở dữ liệu; thao tác nghiệp vụ qua lớp ứng dụng.
- Có chính sách sao lưu và kiểm tra khả năng khôi phục phù hợp.
- Đây là định hướng thiết kế; không được tuyên bố hệ thống đạt chứng nhận/cấp độ 3 chính thức chỉ vì có các chức năng trên.

## 12. Kiến trúc và dữ liệu — gợi ý triển khai trong phạm vi sinh viên

- Ưu tiên cấu trúc dễ hiểu, dễ demo và phù hợp C# / ASP.NET / SQL Server.
- Có thể tách các phần logic: quản lý tài khoản/quyền, hạ tầng chiếu sáng, điều khiển/lịch, giám sát/cảnh báo, báo cáo/nhật ký.
- Dữ liệu cảnh báo nên lưu tối thiểu: mã cảnh báo, quy tắc, thiết bị liên quan, thời gian phát sinh, giá trị đo, ngưỡng, mức độ, phân nhóm, trạng thái, ghi chú và thời điểm cập nhật.
- Quy tắc cảnh báo nên lưu tối thiểu: tên, loại, thông số, toán tử/điều kiện, ngưỡng (nếu là thông số số), mức độ, phân nhóm, trạng thái kích hoạt.
- Tránh tạo cảnh báo trùng liên tục cho cùng một sự cố đang mở; có thể cập nhật giá trị/thời điểm cuối của cảnh báo hiện hành hoặc áp dụng cơ chế chống lặp đơn giản.
- Dữ liệu thiết bị mất kết nối cần có thời điểm nhận dữ liệu cuối cùng.
- Đây là gợi ý triển khai; hãy điều chỉnh theo code và database hiện có, không tạo schema mới khi người dùng yêu cầu sửa trên dự án đang tồn tại.

## 13. Những điều AI không được tự ý làm

- Không tự thay đổi bố cục hoặc màu sắc của ảnh giao diện khi người dùng yêu cầu giữ nguyên.
- Không gộp giao diện Admin và Nhân viên vận hành khi người dùng yêu cầu hai giao diện riêng.
- Không đặt chức năng cấu hình quy tắc cảnh báo vào màn hình theo dõi cảnh báo của Nhân viên vận hành.
- Không nhầm mở/đóng cánh cửa tủ vật lý với bật/tắt hệ thống chiếu sáng.
- Không gán ngưỡng kỹ thuật minh họa thành ngưỡng bắt buộc của tài liệu.
- Không thêm actor Nhân viên kỹ thuật vào mô hình Use Case đang được người dùng giới hạn còn hai actor, trừ khi người dùng đổi quyết định.
- Không dùng AI/ML hoặc giải pháp phức tạp để phát hiện cảnh báo nếu rule-based đủ đáp ứng.
- Không mở rộng “Cấu hình hệ thống” thành cấu hình mạng, khóa bảo mật, firmware hoặc thông số phần cứng nếu người dùng chưa yêu cầu.
- Không bịa dữ liệu thật, tọa độ, kết quả kiểm thử, kết nối phần cứng hoặc khả năng đã triển khai.
- Không trả lời dài dòng khi người dùng yêu cầu “tóm gọn”, “đúng form”, hoặc chỉ yêu cầu một chỉnh sửa cụ thể.

## 14. Cách làm việc với code hiện có

Khi người dùng gửi repository, file code, ảnh lỗi hoặc yêu cầu sửa:
1. Kiểm tra cấu trúc và công nghệ đang dùng trước.
2. Xác định file/component/API/database liên quan.
3. Tóm tắt ngắn nguyên nhân hoặc kế hoạch sửa nếu cần.
4. Sửa tối thiểu và giữ phong cách code hiện tại.
5. Không giả định tên file, tên bảng, tên route hoặc package chưa kiểm tra.
6. Nếu thiếu file hoặc không thể truy cập repository, yêu cầu người dùng cung cấp file/đoạn liên quan thay vì bịa.
7. Khi viết code, phải đồng bộ validation, phân quyền, lỗi và nhật ký nếu chức năng có tác động dữ liệu hoặc điều khiển.

## 15. Checklist trước khi trả lời

- [ ] Đã bám yêu cầu mới nhất của người dùng chưa?
- [ ] Có đúng actor và quyền đã chốt không?
- [ ] Có giữ quan hệ Khu vực → Tủ → Tuyến → Điểm đèn không?
- [ ] Có phân biệt điều khiển chiếu sáng và trạng thái cửa tủ không?
- [ ] Có tách Admin cấu hình cảnh báo và Operator theo dõi cảnh báo không?
- [ ] Có giữ nguyên palette/bố cục khi người dùng yêu cầu không?
- [ ] Nếu viết Use Case, có đúng form bảng mẫu không?
- [ ] Có phân biệt yêu cầu nguồn với giả định/đề xuất thiết kế không?
- [ ] Có giữ giải pháp đủ đơn giản để nhóm sinh viên triển khai không?
