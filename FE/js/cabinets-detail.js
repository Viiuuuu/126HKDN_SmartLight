// ==========================================================================
// SmartLight Municipal IoT - Cabinet Details Logic (cabinets-detail.js)
// Đồng bộ 100% hình ảnh SCADA giám sát & điều khiển tủ chiếu sáng
// ==========================================================================

// Mock Dataset Logs (Khớp 100% hình ảnh thiết kế)
const initialLogs = [
  {
    stt: 1,
    time: "23/02/2018 14:29:08",
    sender: "Hệ thống",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Thông báo từ hệ thống",
    typeColor: "blue",
    content: "Khởi tạo hệ thống"
  },
  {
    stt: 2,
    time: "23/02/2018 14:29:09",
    sender: "Hệ thống",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Trạng thái giao tiếp",
    typeColor: "green",
    content: "Đã mở cổng Modem GSM COM5 thành công"
  },
  {
    stt: 3,
    time: "23/02/2018 14:29:09",
    sender: "Hệ thống",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Thông báo từ hệ thống",
    typeColor: "blue",
    content: "Nhận danh sách người điều khiển: 4 tài khoản"
  },
  {
    stt: 4,
    time: "23/02/2018 14:29:09",
    sender: "Hệ thống",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Thông báo từ hệ thống",
    typeColor: "blue",
    content: "Nhận dữ liệu tủ chiếu sáng..."
  },
  {
    stt: 5,
    time: "23/02/2018 14:29:12",
    sender: "Hệ thống",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Thông báo từ hệ thống",
    typeColor: "blue",
    content: "Nhận dữ liệu lịch đóng cắt theo mùa..."
  },
  {
    stt: 6,
    time: "23/02/2018 14:29:15",
    sender: "TUYENNH",
    senderType: "user-tech",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Trạng thái giao tiếp",
    typeColor: "green",
    content: "Tài khoản TUYENNH đăng nhập hệ thống, gửi lệnh kiểm tra"
  },
  {
    stt: 7,
    time: "23/02/2018 14:29:18",
    sender: "Hệ thống",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Phản hồi thực hiện lệnh",
    typeColor: "emerald",
    content: "Cập nhật dữ liệu [2018/02/23 14:29:14, Phase: {U:242.1V, I:3.0A}, {U:238.1V, I:3.0A}, {U:241.8V, I:3.0A}]"
  },
  {
    stt: 8,
    time: "23/02/2018 14:29:22",
    sender: "Hệ thống",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Phản hồi thực hiện lệnh",
    typeColor: "emerald",
    content: "Cập nhật dữ liệu [2018/02/23 14:29:22, Phase: {U:236.4V, I:3.0A}, {U:237.8V, I:3.0A}, {U:236.1V, I:3.0A}]"
  },
  {
    stt: 9,
    time: "23/02/2018 14:30:36",
    sender: "Hệ thống",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Phản hồi thực hiện lệnh",
    typeColor: "emerald",
    content: "Cập nhật dữ liệu [2018/02/23 14:30:34, Phase: {U:229.9V, I:3.0A}, {U:229.4V, I:3.0A}, {U:229.3V, I:3.0A}]"
  },
  {
    stt: 10,
    time: "23/02/2018 14:31:29",
    sender: "Nguyễn Văn Minh",
    senderType: "admin",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Lệnh vận hành",
    typeColor: "purple",
    content: "Gửi lệnh DIM 70% từ Trung tâm điều khiển SCADA"
  },
  {
    stt: 11,
    time: "23/02/2018 14:31:32",
    sender: "Tủ điều khiển",
    senderType: "cabinet",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Thực thi thành công",
    typeColor: "success",
    content: "Đã đóng contactor nhánh 2, kích hoạt chế độ DIM 70%"
  }
];

// Mock Dataset 6 Cảnh báo sự cố liên quan đến tủ
const initialAlerts = [
  {
    stt: 1,
    time: "23/02/2018 14:15:20",
    sender: "Hệ thống SCADA",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Cảnh báo điện áp cao",
    typeColor: "rose",
    content: "Điện áp tức thời Pha 1 đạt 244.5V (> 240V ngưỡng cảnh báo mềm)"
  },
  {
    stt: 2,
    time: "23/02/2018 13:40:12",
    sender: "Cảm biến cửa",
    senderType: "cabinet",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Cảnh báo an ninh",
    typeColor: "amber",
    content: "Phát hiện mở cửa tủ lúc 13:40 (Đội tuần tra kỹ thuật kiểm định)"
  },
  {
    stt: 3,
    time: "23/02/2018 11:20:00",
    sender: "Modem IoT",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Tín hiệu mạng",
    typeColor: "blue",
    content: "Chuyển vùng kênh sóng Viettel NB-IoT sang 4G LTE băng tần B3"
  },
  {
    stt: 4,
    time: "23/02/2018 09:12:44",
    sender: "Rơ le bảo vệ",
    senderType: "cabinet",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Dòng rò tiếp địa",
    typeColor: "amber",
    content: "Dòng rò tiếp địa tăng nhẹ 18mA trong cơn mưa sáng (Ngưỡng an toàn < 30mA)"
  },
  {
    stt: 5,
    time: "22/02/2018 23:00:00",
    sender: "Bộ lập trình RTC",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Chuyển chế độ",
    typeColor: "purple",
    content: "Kích hoạt kịch bản tiết giảm công suất đêm khuya DIM 50%"
  },
  {
    stt: 6,
    time: "22/02/2018 18:00:00",
    sender: "Lịch thiên văn",
    senderType: "system",
    cabinet: "T3 Nguyễn Tất Thành",
    type: "Đóng điện tự động",
    typeColor: "success",
    content: "Đóng Contactor chính K1-K2 theo giờ hoàng hôn tự động"
  }
];

let activeLogs = [...initialLogs];
let activeAlerts = [...initialAlerts];
let currentTab = 'logs'; // 'logs' or 'events'

// ==================== API INTEGRATION ====================
const cabinetParams = new URLSearchParams(window.location.search);
const cabinetCode = cabinetParams.get('code') || cabinetParams.get('id') || 'TU-NTT-03';

function apiField(record, camelName, pascalName) {
  return record?.[camelName] ?? record?.[pascalName];
}

function formatNumber(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '--';
  return number.toLocaleString('vi-VN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatDateTime(value) {
  if (!value) return 'Chưa có dữ liệu';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa có dữ liệu';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}:${seconds}`;
}

function setCabinetText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setCabinetInput(id, value) {
  const element = document.getElementById(id);
  if (element) element.value = value;
}

function applyCabinetRecord(cabinet) {
  if (!cabinet) return;
  const id = String(apiField(cabinet, 'maTu', 'MaTu') || cabinetCode).trim();
  const name = String(apiField(cabinet, 'tenTu', 'TenTu') || id);
  const address = String(apiField(cabinet, 'diaChi', 'DiaChi') || '');
  const device = String(apiField(cabinet, 'maThietBi', 'MaThietBi') || 'Chưa xác định');
  const viDo = apiField(cabinet, 'viDo', 'ViDo');
  const kinhDo = apiField(cabinet, 'kinhDo', 'KinhDo');
  const gpsText = viDo !== null && viDo !== undefined && kinhDo !== null && kinhDo !== undefined
    ? `${Number(viDo).toFixed(4)}° N, ${Number(kinhDo).toFixed(4)}° E`
    : 'Chưa có dữ liệu';

  document.title = `Chi tiết tủ ${id} | SmartLight`;
  setCabinetText('dispCabinetName', `Tủ điều khiển ${name}`);
  setCabinetText('dispCabinetCode', id);
  setCabinetText('breadCabinetName', `Chi tiết tủ ${id}`);
  setCabinetText('dispCabinetDevice', device);
  setCabinetText('dispCabinetArea', address || 'Chưa có dữ liệu');
  setCabinetText('dispCabinetGps', gpsText);

  setCabinetInput('editCabinetName', name);
  setCabinetInput('editCabinetCode', id);
  setCabinetInput('editCabinetArea', address);
  setCabinetInput('editCabinetGps', viDo !== null && viDo !== undefined && kinhDo !== null && kinhDo !== undefined
    ? `${Number(viDo).toFixed(4)}, ${Number(kinhDo).toFixed(4)}`
    : '');
}

function applyCabinetTelemetry(reading) {
  if (!reading) return;
  const phase = (voltageId, currentId, powerId, voltage, current) => {
    setCabinetText(voltageId, formatNumber(voltage, 1));
    setCabinetText(currentId, `${formatNumber(current, 1)}A`);
    const v = Number(voltage);
    const a = Number(current);
    if (Number.isFinite(v) && Number.isFinite(a)) {
      setCabinetText(powerId, `${formatNumber(v * a / 1000, 2)}kW`);
    }
  };

  phase(
    'dispL1V', 'dispL1A', 'dispL1P',
    apiField(reading, 'dienApPha1', 'DienApPha1'),
    apiField(reading, 'dongDienPha1', 'DongDienPha1')
  );
  phase(
    'dispL2V', 'dispL2A', 'dispL2P',
    apiField(reading, 'dienApPha2', 'DienApPha2'),
    apiField(reading, 'dongDienPha2', 'DongDienPha2')
  );
  phase(
    'dispL3V', 'dispL3A', 'dispL3P',
    apiField(reading, 'dienApPha3', 'DienApPha3'),
    apiField(reading, 'dongDienPha3', 'DongDienPha3')
  );

  const totalPower = apiField(reading, 'congSuat', 'CongSuat');
  if (totalPower !== null && totalPower !== undefined) {
    setCabinetText('dispTotalP', `${formatNumber(totalPower, 2)} kW`);
  }
  const energy = apiField(reading, 'dienNang', 'DienNang');
  if (energy !== null && energy !== undefined) {
    setCabinetText('dispTotalE', `${formatNumber(energy, 1)} kWh`);
  }
}

// Ghi chú: mapping lệnh điều khiển / cảnh báo thuộc endpoint LenhDieuKhien & CanhBao
// (phạm vi API của Thành viên khác) nên không được dùng ở module này.
async function loadCabinetDetailsFromApi() {
  if (!window.api) return;

  try {
    const [cabinet, areas, routes] = await Promise.all([
      window.api.get(`/TuChieuSang/${encodeURIComponent(cabinetCode)}`),
      window.api.get('/KhuVuc'),
      window.api.get('/TuyenChieuSang')
    ]);
    if (cabinet) {
      const areaId = String(apiField(cabinet, 'maKhuVuc', 'MaKhuVuc') || '').trim();
      const area = (areas || []).find(item =>
        String(apiField(item, 'maKhuVuc', 'MaKhuVuc') || '').trim() === areaId
      );
      applyCabinetRecord(cabinet);
      if (area) {
        setCabinetText('dispCabinetAreaName', String(apiField(area, 'tenPhuongXa', 'TenPhuongXa') || ''));
      }
    }
  } catch (error) {
    console.warn(`Không tải được thông tin tủ ${cabinetCode}.`, error);
    showToast(`Không tải được thông tin tủ ${cabinetCode}; giữ dữ liệu mô phỏng.`, 'warning');
  }

  try {
    const readings = await window.api.get('/DuLieuGiamSatTu', { maTu: cabinetCode, limit: 1 });
    if (Array.isArray(readings) && readings[0]) applyCabinetTelemetry(readings[0]);
  } catch (error) {
    console.warn('Không tải được dữ liệu giám sát tủ.', error);
  }

  // Ghi chú: lịch sử lệnh điều khiển và cảnh báo thuộc phạm vi API của Thành viên khác
  // (LenhDieuKhien / CanhBao) nên tại đây chỉ giữ dữ liệu mô phỏng sẵn có.
  renderTable();
}

// Render Table
function renderTable() {
  const tbody = document.getElementById('logsTableBody');
  if (!tbody) return;

  const dataset = currentTab === 'logs' ? activeLogs : activeAlerts;
  const searchKey = (document.getElementById('filterSearchLog')?.value || '').trim().toLowerCase();

  const filtered = dataset.filter(item => {
    if (!searchKey) return true;
    return (
      item.content.toLowerCase().includes(searchKey) ||
      item.sender.toLowerCase().includes(searchKey) ||
      item.type.toLowerCase().includes(searchKey) ||
      item.time.includes(searchKey)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400">
          <div class="flex flex-col items-center justify-center gap-2">
            <span class="text-2xl">🔍</span>
            <p>Không tìm thấy bản ghi nào phù hợp với điều kiện lọc</p>
          </div>
        </td>
      </tr>
    `;
    updatePagination(0);
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    // Badge Người gửi
    let senderBadge = '';
    if (item.senderType === 'system') {
      senderBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-brand-700 border border-blue-100">${item.sender}</span>`;
    } else if (item.senderType === 'admin') {
      senderBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-navy text-white shadow-xs">${item.sender}</span>`;
    } else if (item.senderType === 'cabinet') {
      senderBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">${item.sender}</span>`;
    } else {
      senderBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">${item.sender}</span>`;
    }

    // Badge Loại lệnh / Trạng thái
    let typeBadge = '';
    if (item.typeColor === 'blue') {
      typeBadge = `<span class="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-[11px]"><span class="w-2 h-2 rounded-full bg-blue-500"></span>${item.type}</span>`;
    } else if (item.typeColor === 'green') {
      typeBadge = `<span class="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>${item.type}</span>`;
    } else if (item.typeColor === 'emerald') {
      typeBadge = `<span class="inline-flex items-center gap-1.5 text-teal-600 font-semibold text-[11px]"><span class="w-2 h-2 rounded-full bg-teal-500"></span>${item.type}</span>`;
    } else if (item.typeColor === 'purple') {
      typeBadge = `<span class="inline-flex items-center gap-1.5 text-purple-600 font-semibold text-[11px]"><span class="w-2 h-2 rounded-full bg-purple-500"></span>${item.type}</span>`;
    } else if (item.typeColor === 'success') {
      typeBadge = `<span class="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-emerald-600"><polyline points="20 6 9 17 4 12"></polyline></svg>${item.type}</span>`;
    } else if (item.typeColor === 'rose') {
      typeBadge = `<span class="inline-flex items-center gap-1.5 text-rose-600 font-bold text-[11px]"><span class="w-2 h-2 rounded-full bg-rose-500"></span>${item.type}</span>`;
    } else if (item.typeColor === 'amber') {
      typeBadge = `<span class="inline-flex items-center gap-1.5 text-amber-600 font-bold text-[11px]"><span class="w-2 h-2 rounded-full bg-amber-500"></span>${item.type}</span>`;
    }

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="py-3 px-3 text-center font-mono text-slate-500">${item.stt}</td>
        <td class="py-3 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">${item.time}</td>
        <td class="py-3 px-3">${senderBadge}</td>
        <td class="py-3 px-3 font-bold text-brand-navy">${item.cabinet}</td>
        <td class="py-3 px-3 whitespace-nowrap">${typeBadge}</td>
        <td class="py-3 px-4 text-slate-700 leading-snug font-sans">${item.content}</td>
      </tr>
    `;
  }).join('');

  updatePagination(filtered.length);
}

function updatePagination(count) {
  const rangeEl = document.getElementById('dispPageRange');
  const totalEl = document.getElementById('dispTotalRows');
  if (rangeEl) rangeEl.textContent = count > 0 ? `1 - ${count}` : '0';
  if (totalEl) totalEl.textContent = `${count}`;
}

// Toast Notifications Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    info: 'bg-brand-navy text-white border-blue-400',
    success: 'bg-emerald-600 text-white border-emerald-400',
    warning: 'bg-amber-600 text-white border-amber-400',
    danger: 'bg-rose-600 text-white border-rose-400'
  };

  toast.className = `flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border ${colors[type] || colors.info} animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'danger' ? '⚠️' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Set Cabinet DIM Mode
async function setCabinetDim(percent) {
  const dimMenu = document.getElementById('dimMenu');
  if (dimMenu) dimMenu.classList.add('hidden');

  // Phạm vi API của Thành viên 1 chỉ gồm các endpoint hạ tầng giám sát (TuChieuSang,
  // KhuVuc, TuyenChieuSang, DuLieuGiamSatTu). Lệnh điều khiển contactor thuộc
  // LenhDieuKhien nên không được gọi ở module này.
  showToast(`Đã gửi lệnh thiết lập chế độ DIM ${percent}% tới tủ ${cabinetCode}`, 'success');

  // Thêm log vào bảng
  const now = new Date();
  const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  activeLogs.unshift({
    stt: activeLogs.length + 1,
    time: timeStr,
    sender: "Nguyễn Văn Minh",
    senderType: "admin",
    cabinet: cabinetCode,
    type: "Lệnh vận hành",
    typeColor: "purple",
    content: `Thiết lập chế độ tiết giảm độ sáng DIM ${percent}% thành công`
  });

  // Cập nhật số liệu tải giả lập theo mức DIM
  const totalPEl = document.getElementById('dispTotalP');
  if (totalPEl) {
    const kw = (2.14 * (percent / 100)).toFixed(2);
    totalPEl.textContent = `${kw} kW`;
  }

  renderTable();
}

// Contactor Modal Handlers
function openContactorModal() {
  const modal = document.getElementById('modalContactor');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeContactorModal() {
  const modal = document.getElementById('modalContactor');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function executeContactorAction(action) {
  closeContactorModal();
  const isClose = action === 'CLOSE';
  const msg = isClose
    ? 'Đã gửi lệnh ĐÓNG khởi động từ KĐT 3 pha (Tất cả các nhánh)'
    : 'CẢNH BÁO: Đã gửi lệnh CẮT KHẨN CẤP contactor tủ T3 Nguyễn Tất Thành!';

  // Xem ghi chú ở setCabinetDim: LenhDieuKhien thuộc phạm vi API của Thành viên khác.
  showToast(msg, isClose ? 'success' : 'danger');

  const now = new Date();
  const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  activeLogs.unshift({
    stt: activeLogs.length + 1,
    time: timeStr,
    sender: "Nguyễn Văn Minh",
    senderType: "admin",
    cabinet: cabinetCode,
    type: isClose ? "Lệnh vận hành" : "Cắt khẩn cấp",
    typeColor: isClose ? "purple" : "rose",
    content: isClose ? "Lệnh ĐÓNG toàn bộ khởi động từ contactor thành công" : "Phát lệnh CẮT contactor khẩn cấp từ SCADA trung tâm"
  });

  renderTable();
}

// Edit Modal Handlers
function openEditModal() {
  const modal = document.getElementById('modalEdit');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeEditModal() {
  const modal = document.getElementById('modalEdit');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Export Excel (CSV format tương thích UTF-8)
function exportLogsToCSV() {
  const dataset = currentTab === 'logs' ? activeLogs : activeAlerts;
  let csvContent = "\uFEFFSTT,Thời gian gửi,Người gửi,Tên tủ,Loại lệnh / Trạng thái,Nội dung chi tiết\n";

  dataset.forEach(r => {
    const row = [
      r.stt,
      `"${r.time}"`,
      `"${r.sender}"`,
      `"${r.cabinet}"`,
      `"${r.type}"`,
      `"${r.content.replace(/"/g, '""')}"`
    ];
    csvContent += row.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Nhat_ky_Tu_T3_Nguyen_Tat_Thanh_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Đã xuất thành công file Excel / CSV nhật ký tủ!', 'success');
}

// Realtime Clock Updater
function startRealtimeClocks() {
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const updateClock = () => {
    const now = new Date();
    const dayName = daysOfWeek[now.getDay()];
    const date = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');

    const topbarClockEl = document.getElementById('topbarLiveClock');
    if (topbarClockEl) {
      topbarClockEl.textContent = `${dayName}, ${date}/${month}/${year}`;
    }

    const bottomClockEl = document.getElementById('bottomClock');
    if (bottomClockEl) {
      bottomClockEl.textContent = `${h}:${m}:${s}`;
    }
  };
  updateClock();
  setInterval(updateClock, 1000);
}

// Live Micro-Fluctuation for SCADA telemetry (Tạo cảm giác hệ thống sống động)
let scadaFluctuationEnabled = true;
function startScadaTelemetryFluctuation() {
  setInterval(() => {
    if (!scadaFluctuationEnabled) return;
    const l1v = document.getElementById('dispL1V');
    const l2v = document.getElementById('dispL2V');
    const l3v = document.getElementById('dispL3V');

    if (l1v) {
      const v1 = (240.3 + (Math.random() * 0.4 - 0.2)).toFixed(1);
      l1v.textContent = v1;
    }
    if (l2v) {
      const v2 = (236.6 + (Math.random() * 0.4 - 0.2)).toFixed(1);
      l2v.textContent = v2;
    }
    if (l3v) {
      const v3 = (238.3 + (Math.random() * 0.4 - 0.2)).toFixed(1);
      l3v.textContent = v3;
    }
  }, 2500);
}

// Initialization & Event Binding
document.addEventListener('DOMContentLoaded', () => {
  // Check Query Params for Dynamic Cabinet Loading
  const params = new URLSearchParams(window.location.search);
  const cabCode = params.get('code') || params.get('id');
  if (cabCode && cabCode !== 'TU-NTT-03') {
    const titleEl = document.getElementById('dispCabinetName');
    const codeEl = document.getElementById('dispCabinetCode');
    const breadEl = document.getElementById('breadCabinetName');
    if (titleEl) titleEl.textContent = `Tủ điều khiển ${cabCode}`;
    if (codeEl) codeEl.textContent = cabCode;
    if (breadEl) breadEl.textContent = `Chi tiết tủ ${cabCode}`;
  }

  // Render initial table
  renderTable();

  // Clocks
  startRealtimeClocks();
  startScadaTelemetryFluctuation();

  // Load dữ liệu thật từ Backend
  loadCabinetDetailsFromApi().then(() => {
    scadaFluctuationEnabled = false;
  });

  // Tab switching
  const tabBtnLogs = document.getElementById('tabBtnLogs');
  const tabBtnEvents = document.getElementById('tabBtnEvents');

  tabBtnLogs?.addEventListener('click', () => {
    currentTab = 'logs';
    tabBtnLogs.className = 'px-4 py-2.5 text-xs font-extrabold rounded-t-xl bg-brand-navy text-white transition flex items-center gap-2 shadow-sm';
    tabBtnEvents.className = 'px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-2 rounded-t-xl hover:bg-slate-50';
    renderTable();
  });

  tabBtnEvents?.addEventListener('click', () => {
    currentTab = 'events';
    tabBtnEvents.className = 'px-4 py-2.5 text-xs font-extrabold rounded-t-xl bg-brand-navy text-white transition flex items-center gap-2 shadow-sm';
    tabBtnLogs.className = 'px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-2 rounded-t-xl hover:bg-slate-50';
    renderTable();
  });

  // Search filter
  document.getElementById('filterSearchLog')?.addEventListener('input', () => {
    renderTable();
  });

  // Button View Filter
  document.getElementById('btnViewFilter')?.addEventListener('click', () => {
    showToast('Đang áp dụng bộ lọc ngày giờ...', 'info');
    renderTable();
  });

  // Button Clear List
  document.getElementById('btnClearList')?.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn làm sạch bộ lọc và làm mới danh sách?')) {
      const searchInput = document.getElementById('filterSearchLog');
      if (searchInput) searchInput.value = '';
      activeLogs = [...initialLogs];
      renderTable();
      showToast('Đã làm mới danh sách nhật ký', 'info');
    }
  });

  // Export Excel
  document.getElementById('btnExportExcel')?.addEventListener('click', exportLogsToCSV);

  // Sync Button
  document.getElementById('btnSyncImmediate')?.addEventListener('click', async () => {
    const icon = document.getElementById('syncSpinIcon');
    if (icon) icon.classList.add('animate-spin');
    try {
      await loadCabinetDetailsFromApi();
      showToast(`Đã đồng bộ dữ liệu tủ ${cabinetCode} từ Backend.`, 'success');
    } catch (error) {
      console.warn('Không đồng bộ được dữ liệu tủ.', error);
      showToast('Không đồng bộ được dữ liệu. Kiểm tra Backend rồi thử lại.', 'warning');
    } finally {
      if (icon) icon.classList.remove('animate-spin');
    }
  });

  // DIM Dropdown
  const btnDimDropdown = document.getElementById('btnDimDropdown');
  const dimMenu = document.getElementById('dimMenu');
  btnDimDropdown?.addEventListener('click', (e) => {
    e.stopPropagation();
    dimMenu?.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!dimMenu?.contains(e.target) && e.target !== btnDimDropdown) {
      dimMenu?.classList.add('hidden');
    }
  });

  // Contactor Modal
  document.getElementById('btnToggleContactor')?.addEventListener('click', openContactorModal);

  // Edit Modal
  document.getElementById('btnEditCabinet')?.addEventListener('click', openEditModal);
  document.getElementById('formEditCabinet')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = document.getElementById('editCabinetName')?.value.trim();
    const newCode = document.getElementById('editCabinetCode')?.value.trim();
    const newArea = document.getElementById('editCabinetArea')?.value.trim();
    const newGps = document.getElementById('editCabinetGps')?.value.trim();

    if (newName) {
      document.getElementById('dispCabinetName').textContent = `Tủ điều khiển ${newName}`;
      document.getElementById('breadCabinetName').textContent = `Chi tiết tủ ${newCode || cabinetCode}`;
    }
    if (newCode) document.getElementById('dispCabinetCode').textContent = newCode;
    if (newArea) document.getElementById('dispCabinetArea').textContent = newArea;
    if (newGps) {
      document.getElementById('dispCabinetGps').textContent = newGps
        .split(',').map(value => `${Number(value.trim()).toFixed(4)}°`).join(', ');
    }

    closeEditModal();

    if (!window.api) {
      showToast('Cập nhật thông số tủ trong bản demo; chưa lưu lên Backend.', 'warning');
      return;
    }

    let viDo = null;
    let kinhDo = null;
    if (newGps && newGps.includes(',')) {
      const [lat, lng] = newGps.split(',').map(value => parseFloat(value.trim()));
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        viDo = lat;
        kinhDo = lng;
      }
    }

    try {
      await window.api.put(`/TuChieuSang/${encodeURIComponent(cabinetCode)}`, {
        maTu: cabinetCode,
        tenTu: newName || undefined,
        diaChi: newArea || undefined,
        viDo,
        kinhDo
      });
      showToast(`Đã cập nhật thông số tủ ${cabinetCode} trên Backend.`);
    } catch (error) {
      console.warn('Không cập nhật được thông số tủ.', error);
      showToast(error.message || 'Không cập nhật được thông số tủ trên Backend.', 'warning');
    }
  });

  
  // Notification & Profile dropdowns toggle (Đồng bộ index.html)
  const btnNotifications = document.getElementById('btnNotifications');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const btnUserProfile = document.getElementById('btnUserProfile');
  const userDropdown = document.getElementById('userDropdown');

  btnNotifications?.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown?.classList.remove('active');
    notificationDropdown?.classList.toggle('active');
  });

  btnUserProfile?.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationDropdown?.classList.remove('active');
    userDropdown?.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!notificationDropdown?.contains(e.target) && e.target !== btnNotifications) {
      notificationDropdown?.classList.remove('active');
    }
    if (!userDropdown?.contains(e.target) && !btnUserProfile?.contains(e.target)) {
      userDropdown?.classList.remove('active');
    }
  });

  // Mobile menu toggle
  const btnMobile = document.getElementById('btnToggleMobileSidebar');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const btnCloseSidebar = document.getElementById('btnCloseSidebar');

  const openMobileNav = () => {
    sidebar?.classList.add('show-mobile');
    backdrop?.classList.add('active');
  };
  const closeMobileNav = () => {
    sidebar?.classList.remove('show-mobile');
    backdrop?.classList.remove('active');
  };

  btnMobile?.addEventListener('click', openMobileNav);
  btnCloseSidebar?.addEventListener('click', closeMobileNav);
  backdrop?.addEventListener('click', closeMobileNav);
});

