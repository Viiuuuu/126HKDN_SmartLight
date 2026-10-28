# TÀI LIỆU HƯỚNG DẪN TÍCH HỢP API CHO 3 THÀNH VIÊN
> Dự án: **SmartLight IoT Municipal System**  
> Dùng cho thành viên làm việc song song trên 3 nhánh Git độc lập, cam kết không xung đột code (Zero-Conflict).

---

## 1. NGUYÊN TẮC VÀNG CHỐNG CONFLICT (BẮT BUỘC)
1. **Không sửa CSS chung:** Việc gắn API chỉ thực hiện trong các file JavaScript của trang tương ứng, không đụng vào `style.css`.
2. **Khoanh vùng file tuyệt đối:** Mỗi người chỉ mở và chỉnh sửa các file thuộc phân công của mình bên dưới.
3. **Sử dụng tệp dùng chung `api-config.js`:** Không tự viết hàm `fetch` riêng rẽ với các URL cứng.

---

## 2. PHÂN CÔNG 3 NHÁNH GIT

| Thành viên | Tên Nhánh Git | Danh sách file phụ trách | API Backend kết nối |
| :--- | :--- | :--- | :--- |
| **TV 1** | `feature/api-infrastructure-map` | - `areas.html`, `area-detail.html`<br>- `cabinets.html`, `device-detail.html`<br>- `routes.html`, `route-detail.html`<br>- `lights.html`, `light-detail.html`<br>- `map.html`<br>- Kèm các file JS tương ứng | `api/KhuVuc`<br>`api/TuChieuSang`<br>`api/TuyenChieuSang`<br>`api/DiemDen`<br>`api/DuLieuGiamSatTu`<br>`api/DuLieuGiamSatDen` |
| **TV 2** | `feature/api-control-schedules` | - `control.html` + `control.js`<br>- `schedules.html` + `schedules.js`<br>- `schedule-detail.html` + `schedule-detail.js` | `api/LenhDieuKhien`<br>`api/LichVanHanh`<br>`api/ChiTietLichVanHanh`<br>(Đọc phụ: `api/TuChieuSang`, `api/TuyenChieuSang`) |
| **TV 3** | `feature/api-alerts-reports-auth` | - `alerts.html` + `alerts.js`<br>- `alert-detail.html` + `alert-detail.js`<br>- `reports.html` + `reports.js`<br>- `activity-log.html` + `activity-log.js`<br>- `login.html` + `login.js`<br>- `index.html` + `app.js` | `api/CanhBao`<br>`api/CauHinhCanhBao`<br>`api/NhatKyHeThong`<br>`api/NguoiDung`<br>`api/PhienDangNhap` |

---

## 3. CÁCH SỬ DỤNG FILE DÙNG CHUNG `api-config.js`

### Bước 1: Nhúng vào file HTML của bạn
Trong file HTML do bạn phụ trách, thêm dòng `<script src="js/api-config.js"></script>` **trước** file JS của trang:
```html
<!-- Nền tảng gọi API dùng chung -->
<script src="js/api-config.js"></script>

<!-- Script logic của trang -->
<script src="js/ten-file-cua-ban.js"></script>
```

### Bước 2: Gọi API trong file JS
Đối tượng toàn cục `api` đã được tạo sẵn với các phương thức ngắn gọn:

#### 1. Lấy danh sách (GET kèm query params):
```javascript
try {
  // GET http://localhost:5203/api/TuChieuSang?maKhuVuc=KV01
  const cabinets = await api.get('/TuChieuSang', { maKhuVuc: 'KV01' });
  renderCabinetTable(cabinets);
} catch (error) {
  console.warn('Không kết nối được BE, sử dụng dữ liệu mẫu:', error);
  // Có thể fallback sang mảng mockData cũ nếu BE chưa bật
}
```

#### 2. Lấy chi tiết 1 đối tượng theo ID (GET):
```javascript
const cabinet = await api.get(`/TuChieuSang/${cabinetId}`);
```

#### 3. Gửi lệnh / Tạo mới dữ liệu (POST):
```javascript
const result = await api.post('/LenhDieuKhien', {
  maTu: 'TC00001',
  loaiLenh: 1, // 1: Bật, 0: Tắt, 2: Dimming
  mucDim: 70,
  ghiChu: 'Bật đèn tuyến đường chính'
});
alert('Gửi lệnh thành công!');
```

#### 4. Cập nhật dữ liệu (PUT):
```javascript
await api.put(`/LichVanHanh/${scheduleId}`, {
  tenLich: 'Lịch mùa đông 2026',
  trangThai: 1
});
```

#### 5. Xóa dữ liệu (DELETE):
```javascript
await api.delete(`/LichVanHanh/${scheduleId}`);
```

---

## 4. BẢNG TRA CỨU CÁC API ENDPOINTS TRÊN BACKEND

### 1. Nhóm Hạ tầng & Giám sát (Dành cho TV 1)
- `GET /api/KhuVuc` - Lấy danh sách khu vực
- `GET /api/TuChieuSang?maKhuVuc={id}` - Lấy danh sách tủ
- `GET /api/TuChieuSang/{id}` - Lấy chi tiết tủ điện
- `GET /api/TuyenChieuSang?maTu={id}` - Lấy danh sách tuyến đèn
- `GET /api/DiemDen?maTuyen={id}` - Lấy danh sách điểm đèn
- `GET /api/DuLieuGiamSatTu?maTu={id}&limit=20` - Lấy chỉ số điện (U, I, P, cosφ) của tủ
- `GET /api/DuLieuGiamSatDen?maDen={id}&limit=20` - Lấy chỉ số đo của điểm đèn

### 2. Nhóm Điều khiển & Lập lịch (Dành cho TV 2)
- `GET /api/LenhDieuKhien?maTu={id}&limit=50` - Lấy lịch sử lệnh điều khiển
- `POST /api/LenhDieuKhien` - Gửi lệnh điều khiển mới
- `GET /api/LichVanHanh` - Lấy danh sách lịch vận hành
- `GET /api/LichVanHanh/{id}` - Lấy chi tiết lịch
- `POST /api/LichVanHanh` - Tạo lịch mới
- `PUT /api/LichVanHanh/{id}` - Cập nhật lịch
- `DELETE /api/LichVanHanh/{id}` - Xóa lịch
- `GET, POST, PUT, DELETE /api/ChiTietLichVanHanh` - Cấu hình các mốc thời gian bật/tắt/dim

### 3. Nhóm Cảnh báo, Báo cáo & Hệ thống (Dành cho TV 3)
- `GET /api/CanhBao?trangThaiXuLy={0/1/2}&mucDo={1/2/3}&limit=100` - Lấy danh sách cảnh báo
- `GET /api/CanhBao/{id}` - Chi tiết sự cố
- `GET /api/CauHinhCanhBao` - Cấu hình ngưỡng cảnh báo
- `GET /api/NhatKyHeThong?limit=100` - Lấy nhật ký thao tác
- `GET /api/NguoiDung` - Danh sách người dùng
- `GET /api/PhienDangNhap` - Danh sách phiên đăng nhập

---

## 5. MẸO FALLBACK AN TOÀN TRONG KHI CODE
Để đảm bảo giao diện vẫn chạy mượt mà ngay cả khi database chưa có dữ liệu hoặc BE chưa bật:
```javascript
async function loadData() {
  try {
    const data = await api.get('/CanhBao');
    if (Array.isArray(data) && data.length > 0) {
      renderTable(data);
      return;
    }
  } catch (err) {
    console.warn('Lỗi kết nối API CanhBao, chuyển sang dữ liệu dự phòng:', err);
  }
  // Giữ lại mảng mock dữ liệu có sẵn làm fallback
  renderTable(alertItemsMock);
}
```
