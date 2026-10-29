// ==============================================================================
// SMARTLIGHT IOT SYSTEM - ALERT DETAIL MODULE
// ==============================================================================
// Tích hợp REST API Backend (/api/CanhBao, /api/CauHinhCanhBao, /api/NguoiDung, thiết bị)
// Sử dụng thư viện api-config.js đồng nhất và chuẩn hóa theo CSDL dbSmartLight
// ==============================================================================

// Biến trạng thái toàn cục của trang chi tiết
let currentAlert = null;
let alertConfigs = [];
let usersList = [];
let deviceDetail = null;

// ==================== LIVE CLOCK ====================
const daysOfWeekAlertDetail = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function updateClock() {
  const now = new Date();
  const dayName = daysOfWeekAlertDetail[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  const el = document.getElementById('liveClockDisplay');
  if (el) el.textContent = `${dayName}, ${dateStr}`;
}
setInterval(updateClock, 1000);
updateClock();

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all transform translate-y-2 opacity-0 duration-300 ${
    type === 'success' 
      ? 'bg-slate-900 text-white border-slate-800' 
      : 'bg-rose-900 text-white border-rose-800'
  }`;
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });
  
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==================== FORMAT HELPERS ====================
function formatDate(dateInput) {
  if (!dateInput) return '--';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch (_) {
    return String(dateInput);
  }
}

function formatDuration(startDate, endDate = null) {
  if (!startDate) return '--';
  try {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '--';
    
    let diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) diffMs = 0;
    
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days} ngày ${hours} giờ ${minutes} phút`;
    }
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  } catch (_) {
    return '--';
  }
}

function getFormattedAlertCode(id) {
  return `CB-${String(id).padStart(5, '0')}`;
}

// ==================== INITIALIZATION & API FETCH ====================
async function initAlertDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const rawId = urlParams.get('id') || '';
  const numericId = parseInt(rawId.replace(/\D/g, ''), 10);

  // 1. Tải cấu hình cảnh báo và danh sách người dùng
  await Promise.allSettled([
    loadAlertConfigs(),
    loadUsersList()
  ]);

  // 2. Tải thông tin bản ghi cảnh báo từ API (hoặc cache nếu API offline)
  await loadAlertData(numericId, rawId);

  // 3. Tải thông tin thiết bị phụ thuộc vào mã tủ / mã tuyến / mã đèn có trong DB
  if (currentAlert) {
    await loadDeviceDetails(currentAlert);
  }

  // 4. Render toàn bộ giao diện
  renderAll();
}

async function loadAlertConfigs() {
  try {
    const data = await api.get('/CauHinhCanhBao');
    if (Array.isArray(data)) {
      alertConfigs = data;
    }
  } catch (err) {
    console.warn('[AlertDetail] Không thể tải cấu hình cảnh báo:', err);
  }
}

async function loadUsersList() {
  try {
    const data = await api.get('/NguoiDung');
    if (Array.isArray(data)) {
      usersList = data;
    }
  } catch (err) {
    console.warn('[AlertDetail] Không thể tải danh sách người dùng:', err);
  }
}

async function loadAlertData(numericId, rawId) {
  // Thử gọi API lấy chi tiết cảnh báo theo mã
  if (numericId && !isNaN(numericId)) {
    try {
      const data = await api.get(`/CanhBao/${numericId}`);
      if (data && data.maCanhBao) {
        currentAlert = data;
        return;
      }
    } catch (err) {
      console.warn(`[AlertDetail] Không thể tải cảnh báo ID ${numericId} từ API:`, err);
    }
  }

  // Fallback: kiểm tra sessionStorage cache từ trang alerts.html
  try {
    const cached = JSON.parse(sessionStorage.getItem('smartlight_selected_alert') || 'null');
    if (cached) {
      if (cached.maCanhBao == numericId || cached.rawId == numericId || cached.id === rawId) {
        currentAlert = cached;
        return;
      }
    }
  } catch (err) {
    console.warn('[AlertDetail] Lỗi đọc cache alert:', err);
  }

  // Fallback 2: Nếu chưa có, tải danh sách cảnh báo từ API và lấy bản ghi đầu tiên
  try {
    const allAlerts = await api.get('/CanhBao');
    if (Array.isArray(allAlerts) && allAlerts.length > 0) {
      if (numericId) {
        currentAlert = allAlerts.find(x => x.maCanhBao == numericId) || allAlerts[0];
      } else {
        currentAlert = allAlerts[0];
      }
      return;
    }
  } catch (err) {
    console.error('[AlertDetail] Không thể tải danh sách cảnh báo từ API:', err);
  }

  // Trường hợp không có dữ liệu nào
  if (!currentAlert) {
    showToast('Không tìm thấy bản ghi cảnh báo tương ứng trong cơ sở dữ liệu.', 'error');
  }
}

async function loadDeviceDetails(alert) {
  deviceDetail = null;
  try {
    if (alert.maTu) {
      const code = alert.maTu.trim();
      const res = await api.get(`/TuChieuSang/${code}`);
      if (res && res.maTu) {
        deviceDetail = {
          type: 'cabinet',
          code: code,
          name: res.tenTu || `Tủ điều khiển ${code}`,
          address: res.diaChi || 'Chưa cập nhật địa chỉ',
          gps: (res.viDo && res.kinhDo) ? `${res.viDo}° N, ${res.kinhDo}° E` : 'Đang cập nhật GPS',
          lat: res.viDo,
          lng: res.kinhDo,
          statusText: res.trangThaiKetNoi ? 'Online' : 'Offline',
          isOnline: !!res.trangThaiKetNoi,
          powerStatus: res.trangThaiNguon || 'Ổn định',
          mode: res.cheDoVanHanh === 1 ? 'Thủ công (Manual)' : 'Tự động (Auto)'
        };
      }
    } else if (alert.maTuyen) {
      const code = alert.maTuyen.trim();
      const res = await api.get(`/TuyenChieuSang/${code}`);
      if (res && res.maTuyen) {
        deviceDetail = {
          type: 'route',
          code: code,
          name: res.tenTuyen || `Tuyến đèn ${code}`,
          address: res.viTri || 'Chưa cập nhật vị trí',
          gps: 'Theo tọa độ tuyến đèn',
          lat: null,
          lng: null,
          statusText: res.trangThaiHoatDong === 1 ? 'Đang bật' : 'Đang tắt',
          isOnline: res.trangThaiHoatDong === 1,
          parentCabinet: res.maTu ? res.maTu.trim() : '--',
          length: res.chieuDai ? `${res.chieuDai} m` : '--',
          brightness: res.mucSangHienTai !== null ? `${res.mucSangHienTai}%` : '--'
        };
      }
    } else if (alert.maDen) {
      const code = alert.maDen.trim();
      const res = await api.get(`/DiemDen/${code}`);
      if (res && res.maDen) {
        deviceDetail = {
          type: 'light',
          code: code,
          name: res.tenDen || `Điểm đèn ${code}`,
          address: res.viTri || 'Chưa cập nhật vị trí',
          gps: (res.viDo && res.kinhDo) ? `${res.viDo}° N, ${res.kinhDo}° E` : 'Đang cập nhật GPS',
          lat: res.viDo,
          lng: res.kinhDo,
          statusText: res.trangThai === 1 ? 'Bật sáng' : 'Đang tắt',
          isOnline: res.trangThai === 1,
          lampType: res.loaiBongDen || 'LED Tiết kiệm điện',
          power: res.congSuat ? `${res.congSuat} W` : '--',
          voltage: res.dienAp ? `${res.dienAp} V` : '--',
          current: res.dongDien ? `${res.dongDien} A` : '--'
        };
      }
    }
  } catch (err) {
    console.warn('[AlertDetail] Không thể tải chi tiết thiết bị:', err);
  }
}

// ==================== RENDER FUNCTIONS ====================
function renderAll() {
  if (!currentAlert) return;

  renderBanner();
  renderConfigCard();
  renderDeviceCard();
  renderDispatchForm();
  renderTimeline();
}

function renderBanner() {
  const codeStr = getFormattedAlertCode(currentAlert.maCanhBao);
  const cfg = alertConfigs.find(c => c.maCauHinh === currentAlert.maCauHinh);
  const typeName = cfg ? (cfg.tenCanhBao || cfg.loaiCanhBao) : 'Cảnh báo hệ thống';

  // Title và Breadcrumb
  document.title = `Chi tiết cảnh báo ${codeStr} - SmartLight IoT Municipal System`;
  const elBreadcrumb = document.getElementById('alertBreadcrumbId');
  if (elBreadcrumb) elBreadcrumb.textContent = codeStr;

  const elTitle = document.getElementById('alertDetailTitle');
  if (elTitle) elTitle.textContent = `${codeStr}: ${currentAlert.noiDung || typeName}`;

  // Loại cảnh báo badge
  const elCategoryBadgeText = document.getElementById('alertDetailCategoryText');
  if (elCategoryBadgeText) elCategoryBadgeText.textContent = typeName;

  // Mức độ badge (mucDo: 1, 2, 3)
  const elSev = document.getElementById('alertDetailSeverity');
  const m = Number(currentAlert.mucDo);
  if (elSev) {
    if (m === 3) {
      elSev.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200';
      elSev.textContent = 'Mức độ 3 (Nghiêm trọng)';
    } else if (m === 2) {
      elSev.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200';
      elSev.textContent = 'Mức độ 2 (Trung bình)';
    } else {
      elSev.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200';
      elSev.textContent = 'Mức độ 1 (Thấp)';
    }
  }

  // Trạng thái badge (trangThaiXuLy: 0, 1, 2)
  const elStatus = document.getElementById('detailCurrentStatusBadge');
  const s = Number(currentAlert.trangThaiXuLy);
  if (elStatus) {
    if (s === 0) {
      elStatus.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200';
      elStatus.textContent = 'Chưa xử lý';
    } else if (s === 1) {
      elStatus.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-primary border border-sky-200';
      elStatus.textContent = 'Đang xử lý';
    } else if (s === 2) {
      elStatus.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
      elStatus.textContent = 'Đã xử lý';
    }
  }

  // Thiết bị & Vị trí trên Banner
  const elLocation = document.getElementById('alertDetailLocation');
  const elTargetIcon = document.getElementById('alertTargetIcon');
  if (deviceDetail) {
    if (elLocation) elLocation.textContent = `${deviceDetail.name} • ${deviceDetail.address}`;
    if (elTargetIcon) {
      elTargetIcon.textContent = deviceDetail.type === 'cabinet' ? 'electrical_services' :
                                 deviceDetail.type === 'route' ? 'alt_route' : 'lightbulb';
    }
  } else {
    const rawTargetCode = (currentAlert.maTu || currentAlert.maTuyen || currentAlert.maDen || 'Hệ thống').trim();
    if (elLocation) elLocation.textContent = `Thiết bị: ${rawTargetCode}`;
  }

  // Thời gian phát sinh
  const elTime = document.getElementById('alertDetailTime');
  if (elTime) elTime.textContent = formatDate(currentAlert.thoiGianPhatSinh);

  // Thời gian tồn đọng / thời gian hoàn thành
  const elDurationText = document.getElementById('alertDurationText');
  const elDurationBadge = document.getElementById('alertDurationBadge');
  if (s === 2 && currentAlert.thoiGianXuLy) {
    const durStr = formatDuration(currentAlert.thoiGianPhatSinh, currentAlert.thoiGianXuLy);
    if (elDurationText) elDurationText.textContent = `Đã hoàn thành sau: ${durStr}`;
    if (elDurationBadge) {
      elDurationBadge.className = 'flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0 border border-emerald-200';
    }
  } else {
    const durStr = formatDuration(currentAlert.thoiGianPhatSinh);
    if (elDurationText) elDurationText.textContent = `Thời gian tồn đọng: ${durStr}`;
    if (elDurationBadge) {
      elDurationBadge.className = 'flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold shrink-0 border border-amber-200';
    }
  }
}

function renderConfigCard() {
  const codeStr = getFormattedAlertCode(currentAlert.maCanhBao);
  const cfg = alertConfigs.find(c => c.maCauHinh === currentAlert.maCauHinh);

  const elCodeTag = document.getElementById('alertCodeTag');
  if (elCodeTag) elCodeTag.textContent = `Mã CB: #${codeStr}`;

  const elDesc = document.getElementById('alertIssueDescription');
  if (elDesc) elDesc.textContent = currentAlert.noiDung || 'Không có mô tả nội dung cảnh báo';

  const elTen = document.getElementById('cfgTenCanhBao');
  if (elTen) elTen.textContent = cfg ? (cfg.tenCanhBao || cfg.loaiCanhBao) : '--';

  const elLoai = document.getElementById('cfgLoaiCanhBao');
  if (elLoai) elLoai.textContent = cfg ? (cfg.loaiCanhBao || '--') : '--';

  const elNguong = document.getElementById('cfgNguong');
  if (elNguong) {
    if (cfg && cfg.nguongGiaTri !== null && cfg.nguongGiaTri !== undefined) {
      const unit = cfg.loaiCanhBao === 'QUA_NHIET' ? '°C' : 'giây';
      elNguong.textContent = `${cfg.nguongGiaTri} ${unit}`.trim();
    } else {
      elNguong.textContent = 'Không áp dụng';
    }
  }

  const elDangBat = document.getElementById('cfgDangBat');
  if (elDangBat) {
    const isAct = cfg ? !!cfg.dangBat : true;
    elDangBat.textContent = isAct ? 'Đang kích hoạt' : 'Tạm dừng';
    elDangBat.className = `text-xs font-bold mt-1 ${isAct ? 'text-emerald-600' : 'text-slate-400'}`;
  }
}

function renderDeviceCard() {
  const elMainName = document.getElementById('deviceMainName');
  const elSubInfo = document.getElementById('deviceSubInfo');
  const elStatusBadge = document.getElementById('deviceStatusBadge');
  const elMainIcon = document.getElementById('deviceMainIcon');
  const elMetaCode = document.getElementById('deviceMetaCode');
  const elMetaAddress = document.getElementById('deviceMetaAddress');
  const elMetaGps = document.getElementById('deviceMetaGps');

  if (deviceDetail) {
    if (elMainName) elMainName.textContent = deviceDetail.name;
    if (elSubInfo) {
      if (deviceDetail.type === 'cabinet') {
        elSubInfo.textContent = `Nguồn: ${deviceDetail.powerStatus} • Vận hành: ${deviceDetail.mode}`;
      } else if (deviceDetail.type === 'route') {
        elSubInfo.textContent = `Trực thuộc tủ: ${deviceDetail.parentCabinet} • Chiều dài: ${deviceDetail.length} • Mức sáng: ${deviceDetail.brightness}`;
      } else if (deviceDetail.type === 'light') {
        elSubInfo.textContent = `Loại bóng: ${deviceDetail.lampType} • Công suất: ${deviceDetail.power} (${deviceDetail.voltage}, ${deviceDetail.current})`;
      }
    }

    if (elStatusBadge) {
      elStatusBadge.textContent = deviceDetail.statusText;
      elStatusBadge.className = `px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
        deviceDetail.isOnline 
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
          : 'bg-rose-50 text-rose-700 border border-rose-200'
      }`;
    }

    if (elMainIcon) {
      elMainIcon.textContent = deviceDetail.type === 'cabinet' ? 'electrical_services' :
                               deviceDetail.type === 'route' ? 'alt_route' : 'lightbulb';
    }

    if (elMetaCode) elMetaCode.textContent = deviceDetail.code;
    if (elMetaAddress) elMetaAddress.textContent = deviceDetail.address;
    if (elMetaGps) elMetaGps.textContent = deviceDetail.gps;

    // Cập nhật dữ liệu cho Modal Bản đồ
    const mapTitle = document.getElementById('mapModalTitle');
    const mapGps = document.getElementById('mapModalGps');
    const mapLabel = document.getElementById('mapModalDeviceLabel');
    const mapSub = document.getElementById('mapModalDeviceSub');
    const mapIcon = document.getElementById('mapModalIcon');
    const linkMapLarge = document.getElementById('linkMapLarge');

    if (mapTitle) mapTitle.textContent = `Vị trí ${deviceDetail.name}`;
    if (mapGps) mapGps.textContent = `Tọa độ GPS: ${deviceDetail.gps}`;
    if (mapLabel) mapLabel.textContent = `${deviceDetail.name} (${deviceDetail.code})`;
    if (mapSub) mapSub.textContent = `Địa chỉ: ${deviceDetail.address}`;
    if (mapIcon) {
      mapIcon.textContent = deviceDetail.type === 'cabinet' ? 'electrical_services' :
                            deviceDetail.type === 'route' ? 'alt_route' : 'lightbulb';
    }
    if (linkMapLarge && deviceDetail.lat && deviceDetail.lng) {
      linkMapLarge.href = `map.html?lat=${deviceDetail.lat}&lng=${deviceDetail.lng}`;
    }
  } else {
    // Không có thiết bị cụ thể
    const rawCode = (currentAlert.maTu || currentAlert.maTuyen || currentAlert.maDen || 'Chung').trim();
    if (elMainName) elMainName.textContent = `Thiết bị liên quan (${rawCode})`;
    if (elSubInfo) elSubInfo.textContent = 'Thông tin chi tiết thiết bị đang được đồng bộ';
    if (elMetaCode) elMetaCode.textContent = rawCode;
    if (elMetaAddress) elMetaAddress.textContent = 'Khu vực đô thị thông minh';
    if (elMetaGps) elMetaGps.textContent = '--';
  }
}

function renderDispatchForm() {
  const selectStatus = document.getElementById('selectStatus');
  const selectTechnician = document.getElementById('selectTechnician');
  const dispatchNotes = document.getElementById('dispatchNotes');
  const btnAcceptText = document.getElementById('btnAcceptText');
  const btnAcceptDispatch = document.getElementById('btnAcceptDispatch');

  // Trạng thái select
  if (selectStatus) {
    selectStatus.value = String(currentAlert.trangThaiXuLy);
  }

  // Người xử lý select
  if (selectTechnician) {
    const currentTech = (currentAlert.maNguoiXuLy || '').trim();
    selectTechnician.innerHTML = `
      <option value="">-- Chưa chỉ định nhân sự --</option>
      ${usersList.map(u => {
        const uCode = (u.maNguoiDung || '').trim();
        const isSelected = uCode === currentTech;
        const roleLabel = u.vaiTro || u.phongBan || 'Kỹ thuật viên';
        return `<option value="${uCode}" ${isSelected ? 'selected' : ''}>${u.hoTen} (${uCode}) - ${roleLabel}</option>`;
      }).join('')}
    `;
  }

  // Ghi chú xử lý
  if (dispatchNotes) {
    dispatchNotes.value = currentAlert.ghiChuXuLy || '';
  }

  // Nút tiếp nhận xử lý
  const s = Number(currentAlert.trangThaiXuLy);
  if (btnAcceptText) {
    btnAcceptText.textContent = s === 0 ? 'Tiếp nhận' : s === 1 ? 'Đang xử lý' : 'Đã xử lý';
  }
  if (btnAcceptDispatch) {
    btnAcceptDispatch.disabled = s === 2;
    if (s === 2) {
      btnAcceptDispatch.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      btnAcceptDispatch.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}

function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  const label = document.getElementById('timelineCountLabel');
  if (!container) return;

  const s = Number(currentAlert.trangThaiXuLy);
  const codeStr = getFormattedAlertCode(currentAlert.maCanhBao);
  const timeGen = formatDate(currentAlert.thoiGianPhatSinh);
  const timeDone = formatDate(currentAlert.thoiGianXuLy);
  const techUser = usersList.find(u => (u.maNguoiDung || '').trim() === (currentAlert.maNguoiXuLy || '').trim());
  const techName = techUser ? `${techUser.hoTen} (${techUser.maNguoiDung.trim()})` : (currentAlert.maNguoiXuLy || 'Nhân viên kỹ thuật');

  let timelineHtml = `
    <!-- Sự kiện 1: Phát sinh cảnh báo -->
    <div class="relative">
      <div class="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-rose-100"></div>
      <div class="flex flex-col">
        <span class="text-[11px] text-rose-600 font-bold font-mono">${timeGen}</span>
        <span class="text-xs font-bold text-slate-800">Phát sinh cảnh báo tự động</span>
        <span class="text-[11px] text-slate-500 leading-relaxed">${currentAlert.noiDung || 'Hệ thống giám sát ghi nhận chỉ số bất thường'}</span>
      </div>
    </div>
  `;

  // Sự kiện 2: Tiếp nhận xử lý
  if (s >= 1) {
    timelineHtml += `
      <div class="relative">
        <div class="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-primary ring-2 ring-sky-100"></div>
        <div class="flex flex-col">
          <span class="text-[11px] text-primary font-bold font-mono">Đã tiếp nhận</span>
          <span class="text-xs font-bold text-slate-800">Nhân sự kỹ thuật phụ trách</span>
          <span class="text-[11px] text-slate-500">Phân công: <strong class="text-slate-700">${techName}</strong></span>
        </div>
      </div>
    `;
  } else {
    timelineHtml += `
      <div class="relative">
        <div class="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-slate-300 ring-2 ring-slate-100"></div>
        <div class="flex flex-col">
          <span class="text-[11px] text-slate-400 font-bold">Chờ xử lý</span>
          <span class="text-xs font-bold text-slate-600">Chưa chỉ định nhân sự</span>
          <span class="text-[11px] text-slate-400">Sẵn sàng tiếp nhận và điều phối hiện trường</span>
        </div>
      </div>
    `;
  }

  // Sự kiện 3: Hoàn thành & Đóng sự cố
  if (s === 2) {
    timelineHtml += `
      <div class="relative">
        <div class="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></div>
        <div class="flex flex-col">
          <span class="text-[11px] text-emerald-600 font-bold font-mono">${timeDone}</span>
          <span class="text-xs font-bold text-slate-800">Khắc phục sự cố hoàn tất</span>
          <span class="text-[11px] text-slate-600 leading-relaxed font-medium">Ghi chú: ${currentAlert.ghiChuXuLy || 'Đã kiểm tra và đóng cảnh báo thành công.'}</span>
        </div>
      </div>
    `;
  } else {
    timelineHtml += `
      <div class="relative">
        <div class="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-slate-200 ring-2 ring-slate-50"></div>
        <div class="flex flex-col">
          <span class="text-[11px] text-slate-400 font-bold">Kết thúc sự cố</span>
          <span class="text-xs font-bold text-slate-400">Đang trong tiến trình xử lý</span>
          <span class="text-[11px] text-slate-400">Sẽ ghi nhận khi đóng sự cố thành công</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = timelineHtml;
  if (label) {
    label.textContent = s === 2 ? '3/3 sự kiện' : s === 1 ? '2/3 sự kiện' : '1/3 sự kiện';
  }
}

// ==================== DISPATCH ACTIONS ====================
// 1. Lưu cập nhật xử lý
document.getElementById('btnSaveDispatch')?.addEventListener('click', async () => {
  if (!currentAlert) return;
  const btn = document.getElementById('btnSaveDispatch');
  if (btn) btn.disabled = true;

  const selectStatus = document.getElementById('selectStatus');
  const selectTechnician = document.getElementById('selectTechnician');
  const dispatchNotes = document.getElementById('dispatchNotes');

  const payload = {
    trangThaiXuLy: Number(selectStatus?.value ?? currentAlert.trangThaiXuLy),
    maNguoiXuLy: (selectTechnician?.value || '').trim() || null,
    ghiChuXuLy: (dispatchNotes?.value || '').trim() || null
  };

  try {
    const updated = await api.put(`/CanhBao/${currentAlert.maCanhBao}`, payload);
    if (updated && updated.maCanhBao) {
      currentAlert = updated;
    } else {
      // Cập nhật local nếu API trả về void hoặc text
      currentAlert.trangThaiXuLy = payload.trangThaiXuLy;
      currentAlert.maNguoiXuLy = payload.maNguoiXuLy;
      currentAlert.ghiChuXuLy = payload.ghiChuXuLy;
      if (payload.trangThaiXuLy === 2) {
        currentAlert.thoiGianXuLy = new Date().toISOString();
      }
    }

    // Cập nhật lại cache sessionStorage
    try {
      sessionStorage.setItem('smartlight_selected_alert', JSON.stringify(currentAlert));
    } catch (_) {}

    showToast('Đã lưu cập nhật xử lý cảnh báo thành công!');
    renderAll();
  } catch (err) {
    console.error('[AlertDetail] Lỗi lưu cập nhật cảnh báo:', err);
    showToast('Không thể lưu cập nhật: ' + (err.message || 'Lỗi kết nối'), 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
});

// 2. Tiếp nhận xử lý nhanh
document.getElementById('btnAcceptDispatch')?.addEventListener('click', async () => {
  if (!currentAlert) return;
  if (Number(currentAlert.trangThaiXuLy) === 2) {
    showToast('Sự cố này đã được xử lý hoàn tất!', 'error');
    return;
  }

  // Lấy mã người dùng đang đăng nhập nếu có
  let currentUserId = null;
  try {
    const sessionRaw = sessionStorage.getItem('smartlight_user_session');
    if (sessionRaw) {
      const sess = JSON.parse(sessionRaw);
      currentUserId = sess.maNguoiDung || sess.userId;
    }
  } catch (_) {}

  // Nếu không có trong session, lấy người dùng đầu tiên trong danh sách KTV
  if (!currentUserId && usersList.length > 0) {
    currentUserId = usersList[0].maNguoiDung;
  }

  const payload = {
    trangThaiXuLy: 1, // Đang xử lý
    maNguoiXuLy: currentAlert.maNguoiXuLy || currentUserId || null,
    ghiChuXuLy: currentAlert.ghiChuXuLy || 'Nhân sự kỹ thuật đã tiếp nhận xử lý sự cố tại hiện trường.'
  };

  try {
    const updated = await api.put(`/CanhBao/${currentAlert.maCanhBao}`, payload);
    if (updated && updated.maCanhBao) {
      currentAlert = updated;
    } else {
      currentAlert.trangThaiXuLy = 1;
      if (payload.maNguoiXuLy) currentAlert.maNguoiXuLy = payload.maNguoiXuLy;
      currentAlert.ghiChuXuLy = payload.ghiChuXuLy;
    }

    try {
      sessionStorage.setItem('smartlight_selected_alert', JSON.stringify(currentAlert));
    } catch (_) {}

    showToast('Đã tiếp nhận xử lý sự cố thành công!');
    renderAll();
  } catch (err) {
    console.error('[AlertDetail] Lỗi tiếp nhận cảnh báo:', err);
    showToast('Không thể tiếp nhận: ' + (err.message || 'Lỗi kết nối'), 'error');
  }
});

// 3. Modal xác nhận đóng sự cố
const modalClose = document.getElementById('modalCloseIncident');
document.getElementById('btnCloseIncident')?.addEventListener('click', () => {
  if (!currentAlert) return;
  const codeStr = getFormattedAlertCode(currentAlert.maCanhBao);
  const elAlertId = document.getElementById('closeIncidentAlertId');
  if (elAlertId) elAlertId.textContent = codeStr;

  const closeNotes = document.getElementById('closeNotes');
  if (closeNotes) {
    closeNotes.value = currentAlert.ghiChuXuLy || 'Đã kiểm tra hiện trường, khắc phục hoàn tất và đo tải ổn định.';
  }

  if (modalClose) {
    modalClose.classList.remove('hidden');
    modalClose.classList.add('flex');
  }
});

document.getElementById('btnCancelCloseModal')?.addEventListener('click', () => {
  if (modalClose) {
    modalClose.classList.add('hidden');
    modalClose.classList.remove('flex');
  }
});

document.getElementById('btnConfirmCloseModal')?.addEventListener('click', async () => {
  if (!currentAlert) return;
  const btn = document.getElementById('btnConfirmCloseModal');
  if (btn) btn.disabled = true;

  const closeNotes = document.getElementById('closeNotes');
  const noteVal = (closeNotes?.value || '').trim() || 'Đã khắc phục hoàn tất và đóng sự cố.';

  const payload = {
    trangThaiXuLy: 2, // Đã xử lý
    ghiChuXuLy: noteVal,
    maNguoiXuLy: currentAlert.maNguoiXuLy || null
  };

  try {
    const updated = await api.put(`/CanhBao/${currentAlert.maCanhBao}`, payload);
    if (updated && updated.maCanhBao) {
      currentAlert = updated;
    } else {
      currentAlert.trangThaiXuLy = 2;
      currentAlert.ghiChuXuLy = payload.ghiChuXuLy;
      currentAlert.thoiGianXuLy = new Date().toISOString();
    }

    try {
      sessionStorage.setItem('smartlight_selected_alert', JSON.stringify(currentAlert));
    } catch (_) {}

    if (modalClose) {
      modalClose.classList.add('hidden');
      modalClose.classList.remove('flex');
    }

    showToast('Đã xác nhận hoàn thành và đóng sự cố thành công!');
    renderAll();
  } catch (err) {
    console.error('[AlertDetail] Lỗi đóng cảnh báo:', err);
    showToast('Không thể đóng sự cố: ' + (err.message || 'Lỗi kết nối'), 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
});

// ==================== MODAL MAP ====================
const modalMap = document.getElementById('modalCabinetMap');
document.getElementById('btnOpenCabinetMap')?.addEventListener('click', () => {
  if (modalMap) {
    modalMap.classList.remove('hidden');
    modalMap.classList.add('flex');
  }
});

document.getElementById('btnCloseMapModal')?.addEventListener('click', () => {
  if (modalMap) {
    modalMap.classList.add('hidden');
    modalMap.classList.remove('flex');
  }
});

// Close modal khi click backdrop
window.addEventListener('click', (e) => {
  if (e.target === modalMap) {
    modalMap.classList.add('hidden');
    modalMap.classList.remove('flex');
  }
  if (e.target === modalClose) {
    modalClose.classList.add('hidden');
    modalClose.classList.remove('flex');
  }
});

// ==================== PRINT & SHARE ====================
document.getElementById('btnPrintAlert')?.addEventListener('click', () => {
  window.print();
});

document.getElementById('btnShareAlert')?.addEventListener('click', () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    showToast('Đã sao chép liên kết phiếu sự cố vào bộ nhớ tạm!');
  } else {
    showToast('Đã tạo liên kết chia sẻ phiếu sự cố!');
  }
});

// ==================== MOBILE SIDEBAR ====================
const sidebar = document.getElementById('sidebar');
const btnCloseSidebar = document.getElementById('btnCloseSidebar');
const btnToggleMobileSidebar = document.getElementById('btnToggleMobileSidebar');

if (btnToggleMobileSidebar && sidebar) {
  btnToggleMobileSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}
if (btnCloseSidebar && sidebar) {
  btnCloseSidebar.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
}

// Khởi chạy khi tài liệu HTML đã tải xong
document.addEventListener('DOMContentLoaded', () => {
  initAlertDetailPage();
});
