/**
 * SmartLight Municipal IoT - Route Detail Logic (route-detail.html)
 */

// 1. Live Clock Sync matching system
const routeParams = new URLSearchParams(window.location.search);
const currentRouteCode = routeParams.get('id') || 'TL-001';
let currentRouteName = 'Nguyễn Văn Linh';
let routeStatusCode = 1;

function updateLiveClock() {
  const now = new Date();
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayStr = days[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  
  const clockEl = document.getElementById('liveClockDisplay') || document.getElementById('topbarLiveClock');
  if (clockEl) {
    clockEl.textContent = `${dayStr}, ${dateStr}`;
  }
}

function setRouteText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

async function loadRouteDetails() {
  if (!window.api) return;
  try {
    const route = await window.api.get(`/TuyenChieuSang/${encodeURIComponent(currentRouteCode)}`);
    if (!route) throw new Error('API không trả về thông tin tuyến.');
    const cabinetId = String(route.maTu ?? route.MaTu ?? '').trim();
    const [cabinets, areas, allPoints] = await Promise.all([
      window.api.get('/TuChieuSang'),
      window.api.get('/KhuVuc'),
      window.api.get('/DiemDen')
    ]);
    if (![cabinets, areas, allPoints].every(Array.isArray)) {
      throw new TypeError('API hạ tầng phải trả về danh sách hợp lệ.');
    }

    const cabinet = cabinets.find(item =>
      String(item.maTu ?? item.MaTu ?? '').trim() === cabinetId
    );
    const areaId = String(cabinet?.maKhuVuc ?? cabinet?.MaKhuVuc ?? '').trim();
    const area = areas.find(item =>
      String(item.maKhuVuc ?? item.MaKhuVuc ?? '').trim() === areaId
    );
    const points = allPoints.filter(item =>
      String(item.maTuyen ?? item.MaTuyen ?? '').trim() === currentRouteCode
    );
    const name = String(route.tenTuyen ?? route.TenTuyen ?? currentRouteName);
    currentRouteName = name;
    const lengthValue = route.chieuDai ?? route.ChieuDai;
    const rawLength = lengthValue === null || lengthValue === undefined ? NaN : Number(lengthValue);
    const length = Number.isFinite(rawLength) ? `${(rawLength / 1000).toFixed(2)} km` : '—';
    const cabinetName = String(cabinet?.tenTu ?? cabinet?.TenTu ?? cabinetId ?? 'Chưa xác định');
    const cabinetLabel = cabinetName.startsWith('Tủ ') ? cabinetName : `Tủ ${cabinetName}`;
    const areaName = String(area?.tenPhuongXa ?? area?.TenPhuongXa ?? areaId ?? 'Chưa xác định');
    const statusValue = Number(route.trangThaiHoatDong ?? route.TrangThaiHoatDong);
    const status = statusValue === 1 ? 'Đang hoạt động' : statusValue === 0 ? 'Ngừng hoạt động' : 'Chưa xác định';
    routeStatusCode = statusValue === 1 ? 1 : 0;

    document.title = `Chi tiết tuyến ${currentRouteCode} - ${name} | SmartLight`;
    setRouteText('detailRouteTitle', `Tuyến ${currentRouteCode}: ${name}`);
    setRouteText('breadRouteName', `Chi tiết tuyến ${currentRouteCode} - ${name}`);
    setRouteText('infoRouteName', name);
    setRouteText('infoCabinet', cabinetLabel);
    setRouteText('headerCabinetName', cabinetLabel);
    const cabinetLink = document.getElementById('headerCabinetName');
    if (cabinetLink && cabinetId) {
      cabinetLink.setAttribute('href', `device-detail.html?id=${encodeURIComponent(cabinetId)}&type=${encodeURIComponent('Tủ chiếu sáng')}`);
    }
    setRouteText('infoArea', areaName);
    setRouteText('headerAreaName', areaName);
    setRouteText('infoLength', length);
    setRouteText('headerRouteLength', length);
    setRouteText('infoPoints', points.length);
    setRouteText('headerRoutePoints', points.length);

    const statusBadge = document.getElementById('detailStatusBadge');
    if (statusBadge) {
      statusBadge.className = statusValue === 1
        ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
        : 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs';
      statusBadge.textContent = status;
    }

    setRouteText('infoRouteCode', currentRouteCode);
    setRouteText('calibrateRouteSubtitle', `Tuyến ${currentRouteCode} - ${name}`);
    setRouteText('editRouteCodeLabel', `Mã tuyến: ${currentRouteCode}`);
    setRouteText('exportRouteSubtitle', `${currentRouteCode} - ${name}`);
    setRouteText('routeMapSubtitle', `| ${name}, ${areaName}`);
    const editInputs = {
      modalInputRouteName: name,
      modalInputCabinet: cabinetId,
      modalInputArea: areaName,
      modalInputLength: Number.isFinite(rawLength) ? (rawLength / 1000).toFixed(2) : '',
      modalInputPoints: points.length,
      modalRouteCodeInput: currentRouteCode
    };
    Object.entries(editInputs).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) input.value = value;
    });

    populateCabinetSelect(cabinets, cabinetId);

    renderRouteSegments(points);
    await Promise.all([
      loadRouteEnergy(points),
      loadRouteLogs(points)
    ]);
  } catch (error) {
    console.warn(`Không tải được tuyến ${currentRouteCode} từ API.`, error);
    showToast(`Không tải được dữ liệu tuyến ${currentRouteCode}; đang hiển thị thông tin demo.`, 'warning');
  }
}

function populateCabinetSelect(cabinets, selectedId) {
  const select = document.getElementById('modalInputCabinet');
  if (!select) return;
  select.replaceChildren();
  cabinets.forEach(cabinet => {
    const id = String(cabinet.maTu ?? cabinet.MaTu ?? '').trim();
    if (!id) return;
    const name = String(cabinet.tenTu ?? cabinet.TenTu ?? id);
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${name} (${id})`;
    select.appendChild(option);
  });
  if (selectedId) select.value = selectedId;
}

function renderRouteSegments(points) {
  const tbody = document.getElementById('routeSegmentsBody');
  if (!tbody) return;

  const groups = 3;
  const chunkSize = Math.max(1, Math.ceil(points.length / groups));
  const rows = [];

  for (let index = 0; index < groups; index += 1) {
    const chunk = points.slice(index * chunkSize, (index + 1) * chunkSize);
    if (!chunk.length) continue;
    const activeCount = chunk.filter(point =>
      Number(point.trangThaiHoatDong ?? point.TrangThaiHoatDong) === 1
    ).length;
    const rate = chunk.length ? Number((activeCount * 100 / chunk.length).toFixed(1)) : 0;
    const dimValues = chunk
      .map(point => Number(point.doSang ?? point.DoSang))
      .filter(Number.isFinite);
    const avgDim = dimValues.length
      ? Math.round(dimValues.reduce((sum, value) => sum + value, 0) / dimValues.length)
      : 0;

    rows.push(`
      <tr class="hover:bg-slate-50/70">
        <td class="py-3.5 px-4 font-bold text-slate-800">Đoạn ${index + 1}</td>
        <td class="py-3.5 px-4 text-slate-600">${chunk.length} điểm đèn đầu tiên của tuyến</td>
        <td class="py-3.5 px-4 text-right font-semibold">${chunk.length}</td>
        <td class="py-3.5 px-4 text-right">—</td>
        <td class="py-3.5 px-4 text-center font-bold ${rate >= 95 ? 'text-primary' : rate >= 80 ? 'text-amber-600' : 'text-rose-600'}">${rate}%</td>
        <td class="py-3.5 px-4 text-center">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${rate >= 95 ? 'bg-emerald-50 text-emerald-700' : rate >= 80 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}">
            ${avgDim}% sáng · ${activeCount}/${chunk.length} hoạt động
          </span>
        </td>
      </tr>
    `);
  }

  tbody.innerHTML = rows.length
    ? rows.join('')
    : '<tr><td colspan="6" class="py-8 text-center text-slate-400">Tuyến chưa có điểm đèn nào trên Backend.</td></tr>';
}

async function loadRouteEnergy(points) {
  if (!window.api || !points.length) return;
  try {
    const readings = await Promise.all(points.map(point =>
      window.api.get('/DuLieuGiamSatDen', {
        maDen: String(point.maDen ?? point.MaDen ?? '').trim(),
        limit: 1
      }).catch(() => [])
    ));

    let totalPowerW = 0;
    let totalEnergyKwh = 0;
    readings.forEach(list => {
      const latest = Array.isArray(list) ? list[0] : null;
      if (!latest) return;
      const power = Number(latest.congSuatThucTe ?? latest.CongSuatThucTe);
      const energy = Number(latest.dienNang ?? latest.DienNang);
      if (Number.isFinite(power)) totalPowerW += power;
      if (Number.isFinite(energy)) totalEnergyKwh += energy;
    });

    if (!totalPowerW && !totalEnergyKwh) return;
    const dailyKwh = totalPowerW > 0 ? Number((totalPowerW * 10 / 1000).toFixed(1)) : totalEnergyKwh;
    const monthKwh = Number((dailyKwh * 30).toFixed(1));
    const cost = Math.round(monthKwh * 2500);

    const todayEl = document.getElementById('routeEnergyToday');
    const monthEl = document.getElementById('routeEnergyMonth');
    const costEl = document.getElementById('routeEnergyCost');
    if (todayEl) todayEl.textContent = dailyKwh.toLocaleString('vi-VN');
    if (monthEl) monthEl.textContent = monthKwh.toLocaleString('vi-VN');
    if (costEl) costEl.textContent = cost.toLocaleString('vi-VN');
  } catch (error) {
    console.warn('Không tải được dữ liệu tiêu thụ điện của tuyến.', error);
  }
}

// Nhật ký vận hành được dựng từ dữ liệu giám sát điểm đèn (DuLieuGiamSatDen - phạm vi TV1).
// Lịch sử lệnh điều khiển thuộc endpoint LenhDieuKhien nên không được gọi ở module này.
async function loadRouteLogs(points) {
  const container = document.getElementById('routeLogsList');
  if (!container || !window.api || !points?.length) return;
  try {
    const readings = await Promise.all(points.map(point =>
      window.api.get('/DuLieuGiamSatDen', {
        maDen: String(point.maDen ?? point.MaDen ?? '').trim(),
        limit: 1
      }).catch(() => [])
    ));

    const entries = readings.flat().filter(Boolean).map(reading => {
      const time = reading.thoiGianDo ?? reading.ThoiGianDo;
      const timeText = time ? new Date(time).toLocaleString('vi-VN') : '';
      const dim = Number(reading.doSang ?? reading.DoSang);
      const power = Number(reading.congSuatThucTe ?? reading.CongSuatThucTe);
      const detail = Number.isFinite(dim) ? ` · Mức sáng ${dim}%` : '';
      const summary = Number.isFinite(power) ? `Công suất thực tế ${power.toFixed(1)} W` : 'Có dữ liệu giám sát';
      return { timeText, detail, summary };
    });

    if (!entries.length) return;

    container.innerHTML = entries.map(entry => `
      <div class="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
        <span class="w-2.5 h-2.5 rounded-full bg-primary mt-1.5"></span>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800">Ghi nhận giám sát${escapeHtml(entry.detail)}</span>
            <span class="text-[11px] text-slate-400">${escapeHtml(entry.timeText)}</span>
          </div>
          <p class="text-slate-500 text-[11px] mt-0.5">${escapeHtml(entry.summary)}</p>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.warn('Không tải được nhật ký giám sát của tuyến.', error);
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

// 3. Toast Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const isSuccess = type === 'success';
  const isWarning = type === 'warning';
  const iconClass = isSuccess ? 'fa-circle-check text-emerald-500' : (isWarning ? 'fa-triangle-exclamation text-amber-500' : 'fa-circle-info text-primary');
  const borderColor = isSuccess ? 'border-emerald-200' : (isWarning ? 'border-amber-200' : 'border-blue-200');

  toast.className = `toast-anim pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white border ${borderColor} rounded-xl shadow-xl text-xs font-medium text-slate-800`;
  const icon = document.createElement('i');
  icon.className = `fa-solid ${iconClass} text-base`;
  const text = document.createElement('span');
  text.textContent = message;
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'text-slate-400 hover:text-slate-600 ml-2';
  closeButton.setAttribute('aria-label', 'Đóng thông báo');
  closeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  closeButton.addEventListener('click', () => toast.remove());
  toast.append(icon, text, closeButton);
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 4. Brightness Control & Sliders Synchronization
let currentBrightness = 70;

function updateBrightness(val, triggerToast = false) {
  currentBrightness = parseInt(val);
  const mainSlider = document.getElementById('mainBrightnessSlider');
  const mainDisplay = document.getElementById('mainBrightnessDisplay');
  const quickSlider = document.getElementById('quickBrightnessSlider');
  const quickDisplay = document.getElementById('quickBrightnessDisplay');

  // Cập nhật dải màu gradient trực tiếp trên thanh trượt (100% chuẩn, không bao giờ lệch track)
  const bgGradient = `linear-gradient(to right, #1d4ed8 0%, #1d4ed8 ${currentBrightness}%, #e2e8f0 ${currentBrightness}%, #e2e8f0 100%)`;

  if (mainSlider) {
    mainSlider.value = currentBrightness;
    mainSlider.style.background = bgGradient;
  }
  if (quickSlider) {
    quickSlider.value = currentBrightness;
    quickSlider.style.background = bgGradient;
  }

  if (mainDisplay) mainDisplay.textContent = currentBrightness + '%';
  if (quickDisplay) quickDisplay.textContent = currentBrightness + '%';

  // Update Presets Active State in both places
  document.querySelectorAll('.preset-btn').forEach(btn => {
    if (parseInt(btn.dataset.preset) === currentBrightness) {
      btn.className = 'preset-btn py-1.5 text-xs font-bold rounded-xl bg-primary text-white shadow-xs text-center';
    } else {
      btn.className = 'preset-btn py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-center';
    }
  });

  document.querySelectorAll('.quick-preset-btn').forEach(btn => {
    if (btn.textContent.trim() === currentBrightness + '%') {
      btn.className = 'quick-preset-btn py-1.5 text-xs font-bold rounded-xl bg-primary text-white shadow-xs text-center';
    } else {
      btn.className = 'quick-preset-btn py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors text-center';
    }
  });

  if (triggerToast) {
    showToast(`Mô phỏng: mức sáng tuyến ${currentRouteCode} được đặt thành ${currentBrightness}%. Chưa gửi lệnh thật.`);
  }
}

function setBrightnessPreset(val) {
  updateBrightness(val, true);
}

// 5. Power Toggle (On/Off)
let isPoweredOn = true;
function setPowerState(state) {
  isPoweredOn = state;
  const powerToggleSwitch = document.getElementById('powerToggleSwitch');
  const powerStateText = document.getElementById('powerStateText');
  const powerIndicatorDot = document.getElementById('powerIndicatorDot');
  const btnTogglePowerText = document.getElementById('btnTogglePowerText');
  const routeLinePath = document.getElementById('routeLinePath');

  if (powerToggleSwitch) powerToggleSwitch.checked = isPoweredOn;
  if (isPoweredOn) {
    if (powerStateText) powerStateText.textContent = 'Đang bật';
    if (powerIndicatorDot) powerIndicatorDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
    if (btnTogglePowerText) btnTogglePowerText.textContent = 'Tắt tuyến';
    if (routeLinePath) routeLinePath.setAttribute('stroke', '#074476');
    showToast(`Mô phỏng: đã bật chiếu sáng tuyến ${currentRouteCode}. Chưa gửi lệnh thật.`, 'info');
  } else {
    if (powerStateText) powerStateText.textContent = 'Đã tắt';
    if (powerIndicatorDot) powerIndicatorDot.className = 'w-2.5 h-2.5 rounded-full bg-slate-300';
    if (btnTogglePowerText) btnTogglePowerText.textContent = 'Bật tuyến';
    if (routeLinePath) routeLinePath.setAttribute('stroke', '#94a3b8');
    showToast(`Mô phỏng: đã tắt chiếu sáng tuyến ${currentRouteCode}. Chưa gửi lệnh thật.`, 'info');
  }
}

// 7. Tab Navigation
function switchTab(tabId) {
  const tabs = ['dimming', 'segments', 'energy', 'logs'];
  tabs.forEach(t => {
    const btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
    const content = document.getElementById('tabContent' + t.charAt(0).toUpperCase() + t.slice(1));
    if (t === tabId) {
      if (btn) btn.className = 'py-3.5 border-b-2 border-primary font-bold text-primary transition-colors flex items-center gap-2 whitespace-nowrap';
      if (content) content.classList.remove('hidden');
    } else {
      if (btn) btn.className = 'py-3.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 whitespace-nowrap';
      if (content) content.classList.add('hidden');
    }
  });
}

// Map detail helper functions
function showPointDetail(pointCode, wattage, dim) {
  showToast(`Điểm đèn #${pointCode} • Công suất ${wattage} • Mức sáng ${dim} • Điện áp 224V`, 'info');
}

function showCabinetDetail(cabinetCode) {
  showToast(`${cabinetCode}: Đang cấp nguồn cho 348 điểm đèn • Tải hiện tại: 32.4 kW`, 'info');
}

// Modals global functions
function closeCalibrateModal() {
  const calibrateModal = document.getElementById('calibrateModal');
  if (calibrateModal) calibrateModal.classList.add('hidden');
}

function saveCalibration() {
  closeCalibrateModal();
  showToast('Cấu hình hiệu chỉnh hiện chỉ được mô phỏng; chưa lưu lên máy chủ.', 'warning');
}

function closeEditRouteModal() {
  const editRouteModal = document.getElementById('editRouteModal');
  if (editRouteModal) editRouteModal.classList.add('hidden');
}

function handleSaveEditRoute(e) {
  e.preventDefault();
  const name = document.getElementById('modalInputRouteName').value.trim();
  const cab = document.getElementById('modalInputCabinet').value;
  const area = document.getElementById('modalInputArea').value.trim();
  const length = document.getElementById('modalInputLength').value;
  const points = document.getElementById('modalInputPoints').value;

  currentRouteName = name;
  const titleEl = document.getElementById('detailRouteTitle');
  if (titleEl) titleEl.textContent = `Tuyến ${currentRouteCode}: ${name}`;
  const breadcrumb = document.getElementById('breadRouteName');
  if (breadcrumb) breadcrumb.textContent = `Chi tiết tuyến ${currentRouteCode} - ${name}`;
  const infoRouteName = document.getElementById('infoRouteName');
  if (infoRouteName) infoRouteName.textContent = name;
    const infoCabinet = document.getElementById('infoCabinet');
  if (infoCabinet) infoCabinet.textContent = cab ? `Tủ ${cab}` : 'Chưa xác định';
  const headerCabinetName = document.getElementById('headerCabinetName');
  if (headerCabinetName) headerCabinetName.textContent = cab;
  const infoArea = document.getElementById('infoArea');
  if (infoArea) infoArea.textContent = area;
  const headerAreaName = document.getElementById('headerAreaName');
  if (headerAreaName) headerAreaName.textContent = area;
  const infoLength = document.getElementById('infoLength');
  if (infoLength) infoLength.textContent = length + ' km';
  const headerRouteLength = document.getElementById('headerRouteLength');
  if (headerRouteLength) headerRouteLength.textContent = length + ' km';
  const infoPoints = document.getElementById('infoPoints');
  if (infoPoints) infoPoints.textContent = points;
  const headerRoutePoints = document.getElementById('headerRoutePoints');
  if (headerRoutePoints) headerRoutePoints.textContent = points;

  closeEditRouteModal();

  if (!window.api) {
    showToast('Đã cập nhật thông tin tuyến trong bản demo.', 'warning');
    return;
  }

  const lengthKm = parseFloat(length);
  window.api.put(`/TuyenChieuSang/${encodeURIComponent(currentRouteCode)}`, {
    maTuyen: currentRouteCode,
    tenTuyen: name,
    viTri: area,
    maTu: cab,
    trangThaiHoatDong: Number(routeStatusCode),
    chieuDai: Number.isFinite(lengthKm) ? Math.round(lengthKm * 1000) : null
  }).then(() => {
    showToast(`Đã cập nhật tuyến ${currentRouteCode} trên Backend.`);
  }).catch(error => {
    console.warn('Không cập nhật được tuyến trên Backend.', error);
    showToast(error.message || 'Không cập nhật được tuyến trên Backend.', 'warning');
  });
}

function closeExportModal() {
  const exportModal = document.getElementById('exportModal');
  if (exportModal) exportModal.classList.add('hidden');
}

function downloadReport() {
  const rows = [
    ['Mã tuyến', currentRouteCode],
    ['Tên tuyến', currentRouteName],
    ['Tủ phụ trách', document.getElementById('infoCabinet')?.textContent || ''],
    ['Khu vực', document.getElementById('infoArea')?.textContent || ''],
    ['Chiều dài', document.getElementById('infoLength')?.textContent || ''],
    ['Số điểm đèn', document.getElementById('infoPoints')?.textContent || '']
  ];
  const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `bao-cao-tuyen-${currentRouteCode}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  closeExportModal();
  showToast('Đã tải báo cáo tuyến dạng CSV.');
}

document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('detailRouteTitle');
  const titleText = titleEl?.textContent.trim() || '';
  currentRouteName = titleText.includes(':') ? titleText.split(':').slice(1).join(':').trim() : currentRouteName;
  if (titleEl) titleEl.textContent = `Tuyến ${currentRouteCode}: ${currentRouteName}`;
  const breadcrumb = document.getElementById('breadRouteName');
  if (breadcrumb) breadcrumb.textContent = `Chi tiết tuyến ${currentRouteCode} - ${currentRouteName}`;
  const routeCodeInput = document.getElementById('modalRouteCodeInput');
  if (routeCodeInput) routeCodeInput.value = currentRouteCode;
  loadRouteDetails();

  updateBrightness(currentBrightness, false);
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // Mobile Sidebar Toggle
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

  // Sliders input events
  const mainSlider = document.getElementById('mainBrightnessSlider');
  const quickSlider = document.getElementById('quickBrightnessSlider');
  mainSlider?.addEventListener('input', (e) => updateBrightness(e.target.value));
  quickSlider?.addEventListener('input', (e) => updateBrightness(e.target.value));

  document.getElementById('btnApplyQuickDimming')?.addEventListener('click', () => {
    showToast(`Mô phỏng: áp dụng mức sáng ${currentBrightness}% cho tuyến ${currentRouteCode}. Chưa gửi lệnh thật.`, 'info');
  });

  // Power Switch
  const powerToggleSwitch = document.getElementById('powerToggleSwitch');
  powerToggleSwitch?.addEventListener('change', (e) => setPowerState(e.target.checked));
  document.getElementById('btnTogglePower')?.addEventListener('click', () => setPowerState(!isPoweredOn));

  // Management Status Toggle
  let isManaging = true;
  const managementDot = document.getElementById('managementDot');
  const managementText = document.getElementById('managementText');
  const btnToggleManagementText = document.getElementById('btnToggleManagementText');
  const detailStatusBadge = document.getElementById('detailStatusBadge');

  document.getElementById('btnToggleManagement')?.addEventListener('click', async () => {
    isManaging = !isManaging;
    const nextStatus = isManaging ? 1 : 0;
    routeStatusCode = nextStatus;
    if (isManaging) {
      if (managementDot) managementDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
      if (managementText) managementText.textContent = 'Hoạt động';
      if (btnToggleManagementText) btnToggleManagementText.textContent = 'Ngừng hoạt động';
      if (detailStatusBadge) {
        detailStatusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đang hoạt động';
        detailStatusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
      }
    } else {
      if (managementDot) managementDot.className = 'w-2.5 h-2.5 rounded-full bg-slate-400';
      if (managementText) managementText.textContent = 'Ngừng hoạt động';
      if (btnToggleManagementText) btnToggleManagementText.textContent = 'Kích hoạt lại';
      if (detailStatusBadge) {
        detailStatusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-400"></span> Ngừng hoạt động';
        detailStatusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200';
      }
    }

    if (!window.api) {
      showToast(`Mô phỏng: tuyến được đánh dấu ${isManaging ? 'Hoạt động' : 'Ngừng hoạt động'}.`, 'warning');
      return;
    }

    try {
      await window.api.put(`/TuyenChieuSang/${encodeURIComponent(currentRouteCode)}`, {
        maTuyen: currentRouteCode,
        tenTuyen: currentRouteName,
        viTri: document.getElementById('infoArea')?.textContent.trim() || '',
        maTu: document.getElementById('modalInputCabinet')?.value || '',
        trangThaiHoatDong: nextStatus
      });
      showToast(`Đã cập nhật trạng thái tuyến ${currentRouteCode} trên Backend.`);
    } catch (error) {
      console.warn('Không cập nhật được trạng thái tuyến.', error);
      showToast(error.message || 'Không cập nhật được trạng thái tuyến trên Backend.', 'warning');
    }
  });

  // Map Zoom
  let mapZoomLevel = 1;
  const vectorMap = document.getElementById('vectorMapSvg');

  function zoomMap(delta) {
    mapZoomLevel += delta * 0.2;
    if (mapZoomLevel < 0.8) mapZoomLevel = 0.8;
    if (mapZoomLevel > 2.0) mapZoomLevel = 2.0;
    if (vectorMap) vectorMap.style.transform = `scale(${mapZoomLevel})`;
    showToast(`Độ thu phóng bản đồ: ${Math.round(mapZoomLevel * 100)}%`, 'info');
  }

  document.getElementById('btnMapZoomIn')?.addEventListener('click', () => zoomMap(1));
  document.getElementById('btnMapZoomOut')?.addEventListener('click', () => zoomMap(-1));

  function toggleMapFullscreen() {
    const container = document.getElementById('mapCanvasContainer');
    if (!document.fullscreenElement) {
      container?.requestFullscreen().catch(() => {
        showToast('Trình duyệt không cho phép toàn màn hình', 'warning');
      });
    } else {
      document.exitFullscreen();
    }
  }

  document.getElementById('btnMapFullscreen')?.addEventListener('click', toggleMapFullscreen);

  document.getElementById('btnScrollToMap')?.addEventListener('click', () => {
    document.getElementById('mapCanvasContainer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Đã di chuyển tới khu vực bản đồ tuyến', 'info');
  });

  // Modal Openers
  const calibrateModal = document.getElementById('calibrateModal');
  document.getElementById('btnOpenCalibrateModal')?.addEventListener('click', () => {
    calibrateModal?.classList.remove('hidden');
  });

  const editRouteModal = document.getElementById('editRouteModal');
  document.getElementById('btnOpenEditRouteModal')?.addEventListener('click', () => {
    editRouteModal?.classList.remove('hidden');
  });

  const exportModal = document.getElementById('exportModal');
  document.getElementById('btnOpenExportModal')?.addEventListener('click', () => {
    exportModal?.classList.remove('hidden');
  });

  // Dữ liệu tuyến lấy hoàn toàn từ API (loadRouteDetails), không hard-code theo id.
});
