// ==================== JAVASCRIPT LOGIC FOR LIGHT POINT DETAIL ====================
const lightParams = new URLSearchParams(window.location.search);
const lightId = lightParams.get('id') || 'LD-0001';
let currentRatedPower = Number.parseFloat(lightParams.get('power')) || 120;
const initialDim = Number.parseFloat(lightParams.get('dim'));
let currentBrightness = Number.isFinite(initialDim) ? initialDim : 80;
let currentLightName = lightParams.get('location') || 'Đường Lê Duẩn - Điểm số 001';

// Live System Clock update
function updateClock() {
  const now = new Date();
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[now.getDay()];
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  const clockEl = document.getElementById('liveClockDisplay');
  if (clockEl) {
    clockEl.textContent = `${dayName}, ${d}/${m}/${y}`;
  }
}
setInterval(updateClock, 1000);
updateClock();

// Toast Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  let icon = 'check_circle';
  let bgStyle = 'bg-white border-slate-200 text-slate-800';
  let iconColor = 'text-emerald-500';

  if (type === 'info') {
    icon = 'info';
    iconColor = 'text-primary';
  } else if (type === 'warning') {
    icon = 'warning';
    iconColor = 'text-amber-500';
  }

  toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg ${bgStyle} text-xs font-medium toast-anim pointer-events-auto transition-all`;
  const iconElement = document.createElement('span');
  iconElement.className = `material-symbols-outlined text-[18px] ${iconColor}`;
  iconElement.textContent = icon;
  const text = document.createElement('span');
  text.textContent = message;
  toast.append(iconElement, text);

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Dynamic Dimming Control
function updateBrightness(val) {
  val = parseInt(val, 10);
  const display = document.getElementById('dimming-val');
  const beam = document.getElementById('lamp-beam');
  const glow = document.getElementById('ambient-glow');
  const lens = document.getElementById('lamp-lens');
  const statusText = document.getElementById('heroLightStatusText');
  const statusBadge = document.getElementById('heroStatusBadge');
  const markerLabel = document.getElementById('mapMarkerLabel');
  const telemetryPower = document.getElementById('telemetryPower');
  const telemetryCurrent = document.getElementById('telemetryCurrent');

  if (display) display.innerText = val + '%';
  currentBrightness = val;
  if (markerLabel) markerLabel.textContent = `${lightId} (${val}%)`;

  // Scale Light Beam SVG
  if (beam) {
    beam.style.opacity = (val / 100).toString();
  }
  // Scale Warm Ambient Glow
  if (glow) {
    glow.style.opacity = (val / 100).toString();
  }

  // Calculate instantaneous power and current based on dimming
  const power = val === 0 ? 0 : ((val / 100) * currentRatedPower * 0.985).toFixed(1);
  const current = val === 0 ? '0.00 A' : ((power / 224.6)).toFixed(2) + ' A';

  if (telemetryPower) telemetryPower.innerHTML = `${power} <span class="text-xs font-normal text-slate-500">W</span>`;
  if (telemetryCurrent) telemetryCurrent.innerText = current;

  // Update hero status badge
  if (val === 0) {
    if (statusText) statusText.innerText = 'Đã ngắt tải (Tắt) • Chờ lệnh kích hoạt';
    if (statusBadge) {
      statusBadge.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200';
    }
    if (lens) lens.setAttribute('fill', '#94A3B8');
  } else {
    if (statusText) statusText.innerText = `Đang phát sáng (${val}%) • Chế độ thông minh`;
    if (statusBadge) {
      statusBadge.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/80';
    }
    if (lens) lens.setAttribute('fill', '#FCD34D');
  }
}

function setQuickDim(val) {
  const range = document.getElementById('dimming-range');
  if (range) {
    range.value = val;
    updateBrightness(val);
    showToast(`Mô phỏng: mức sáng điểm đèn ${lightId} là ${val}%. Chưa gửi lệnh thật.`, 'info');
  }
}

function toggleLight(turnOn) {
  if (turnOn) {
    setQuickDim(100);
  } else {
    setQuickDim(0);
  }
}

// Detail Tabs Switcher
function switchDetailTab(tabIndex) {
  for (let i = 1; i <= 3; i++) {
    const content = document.getElementById('tab-content-' + i);
    const btn = document.getElementById('tab-btn-' + i);
    if (content) content.classList.add('hidden');
    if (btn) {
      btn.classList.remove('text-primary', 'font-bold', 'border-primary');
      btn.classList.add('text-slate-500', 'font-semibold', 'border-transparent');
    }
  }
  const activeContent = document.getElementById('tab-content-' + tabIndex);
  const activeBtn = document.getElementById('tab-btn-' + tabIndex);
  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-500', 'border-transparent');
    activeBtn.classList.add('text-primary', 'font-bold', 'border-primary');
  }
}

// Modal Edit Light Point
const modalEditLight = document.getElementById('modalEditLight');
const btnOpenEditModal = document.getElementById('btnOpenEditModal');
const btnCloseEditModal = document.getElementById('btnCloseEditModal');
const btnCancelEditModal = document.getElementById('btnCancelEditModal');
const formEditLight = document.getElementById('formEditLight');

btnOpenEditModal?.addEventListener('click', () => {
  if (modalEditLight) {
    modalEditLight.classList.remove('hidden');
    modalEditLight.classList.add('flex');
  }
});

[btnCloseEditModal, btnCancelEditModal].forEach(btn => {
  btn?.addEventListener('click', () => {
    if (modalEditLight) {
      modalEditLight.classList.add('hidden');
      modalEditLight.classList.remove('flex');
    }
  });
});

formEditLight?.addEventListener('submit', (e) => {
  e.preventDefault();
  const newNameEl = document.getElementById('editLampName');
  const newPowerEl = document.getElementById('editLampPower');
  const newHeightEl = document.getElementById('editLampHeight');

  const newName = newNameEl ? newNameEl.value : '';
  const newPower = newPowerEl ? newPowerEl.value : '';
  const newHeight = newHeightEl ? newHeightEl.value : '';

  const lampSubName = document.getElementById('lampSubName');
  const heroLocation = document.getElementById('heroLocationText');
  const lampPoleHeightTag = document.getElementById('lampPoleHeightTag');
  const specRatedPower = document.getElementById('specRatedPower');

  if (lampSubName) lampSubName.innerText = newName;
  if (heroLocation) heroLocation.innerText = newName;
  if (lampPoleHeightTag) lampPoleHeightTag.innerText = `Cột cao ${parseFloat(newHeight).toFixed(1)}m`;
  if (specRatedPower) specRatedPower.innerText = `${newPower}W (Philips)`;

  if (modalEditLight) {
    modalEditLight.classList.add('hidden');
    modalEditLight.classList.remove('flex');
  }
  currentLightName = newName;
  currentRatedPower = Number.parseFloat(newPower) || currentRatedPower;
  showToast('Đã cập nhật thông số trong bản demo; chưa lưu lên Backend.', 'warning');
});

// Action Bar triggers
document.getElementById('btnPrintSpecs')?.addEventListener('click', () => {
  showToast(`Đang mở bản in thông số ${lightId}...`, 'info');
  setTimeout(() => window.print(), 600);
});

document.getElementById('btnShareLamp')?.addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Trình duyệt không cấp quyền clipboard.');
    await navigator.clipboard.writeText(window.location.href);
    showToast(`Đã sao chép liên kết điểm đèn ${lightId}.`);
  } catch (error) {
    console.warn('Không thể sao chép liên kết điểm đèn:', error);
    showToast('Không thể truy cập clipboard. Hãy sao chép liên kết trên thanh địa chỉ.', 'warning');
  }
});

document.getElementById('btnSyncNow')?.addEventListener('click', async () => {
  const icon = document.getElementById('syncIcon');
  if (icon) icon.classList.add('animate-spin');
  try {
    await loadLightTelemetry();
    showToast(`Đã tải lại dữ liệu giám sát ${lightId} từ Backend.`);
  } catch (error) {
    console.warn('Không tải được dữ liệu giám sát điểm đèn:', error);
    showToast('Không thể đồng bộ dữ liệu. Kiểm tra Backend rồi thử lại.', 'warning');
  } finally {
    if (icon) icon.classList.remove('animate-spin');
  }
});

// Map controls
document.getElementById('btnMapStreet')?.addEventListener('click', function() {
  this.className = 'px-3 py-1 rounded-lg bg-white text-primary text-xs font-bold shadow-2xs';
  const satBtn = document.getElementById('btnMapSatellite');
  if (satBtn) satBtn.className = 'px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors';
  document.getElementById('mapWrapper')?.classList.remove('map-satellite-preview');
  showToast('Đang xem sơ đồ minh họa; lớp GIS chưa được kết nối.', 'info');
});

document.getElementById('btnMapSatellite')?.addEventListener('click', function() {
  this.className = 'px-3 py-1 rounded-lg bg-white text-primary text-xs font-bold shadow-2xs';
  const streetBtn = document.getElementById('btnMapStreet');
  if (streetBtn) streetBtn.className = 'px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors';
  document.getElementById('mapWrapper')?.classList.add('map-satellite-preview');
  showToast('Lớp vệ tinh hiện chỉ là mô phỏng; chưa tải ảnh GIS.', 'info');
});

let mapZoom = 1;
function updateMapZoom(delta) {
  mapZoom = Math.max(0.8, Math.min(1.8, mapZoom + delta));
  const mapSvg = document.querySelector('#mapWrapper svg');
  if (mapSvg) mapSvg.style.transform = `scale(${mapZoom})`;
  if (mapSvg) mapSvg.style.transformOrigin = 'center';
}

document.getElementById('btnZoomIn')?.addEventListener('click', () => {
  updateMapZoom(0.15);
});

document.getElementById('btnZoomOut')?.addEventListener('click', () => {
  updateMapZoom(-0.15);
});

function setLightText(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  if (element instanceof HTMLInputElement) element.value = value;
  else element.textContent = value;
}

function applyLightRecord(record) {
  const name = record.tenDen ?? record.TenDen ?? currentLightName;
  const id = record.maDen ?? record.MaDen ?? lightId;
  const location = record.viTri ?? record.ViTri ?? currentLightName;
  const power = Number(record.congSuat ?? record.CongSuat);
  const dim = Number(record.doSang ?? record.DoSang);
  currentLightName = name;
  if (Number.isFinite(power) && power > 0) currentRatedPower = power;
  if (Number.isFinite(dim) && dim >= 0 && dim <= 100) currentBrightness = dim;

  document.title = `Chi tiết điểm đèn: ${id} - SmartLight`;
  setLightText('breadcrumbLampCode', id);
  setLightText('lampCodeDisplay', id);
  setLightText('heroLampTitle', `Điểm đèn: ${id}`);
  setLightText('lampSubName', name);
  setLightText('heroLocationText', location);
  setLightText('editLampCode', id);
  setLightText('editLampName', name);
  setLightText('editLampPower', currentRatedPower);
  const range = document.getElementById('dimming-range');
  if (range) range.value = currentBrightness;
  updateBrightness(currentBrightness);
}

async function loadLightTelemetry() {
  const readings = await window.api.get('/DuLieuGiamSatDen', { maDen: lightId, limit: 1 });
  if (!Array.isArray(readings)) throw new TypeError('API DuLieuGiamSatDen phải trả về danh sách.');
  const latest = readings[0];
  if (!latest) return;

  const power = latest.congSuatThucTe ?? latest.CongSuatThucTe;
  const current = latest.dongDien ?? latest.DongDien;
  if (Number.isFinite(Number(power))) {
    const powerEl = document.getElementById('telemetryPower');
    if (powerEl) powerEl.textContent = `${Number(power).toFixed(1)} W`;
  }
  if (Number.isFinite(Number(current))) setLightText('telemetryCurrent', `${Number(current).toFixed(2)} A`);
}

async function loadLightDetail() {
  if (!window.api) {
    showToast('Chưa nạp API client; đang dùng thông tin mô phỏng.', 'warning');
    return;
  }

  let record;
  try {
    record = await window.api.get(`/DiemDen/${encodeURIComponent(lightId)}`);
    if (!record) throw new Error('API không trả về thông tin điểm đèn.');
  } catch (error) {
    console.warn(`Không tải được điểm đèn ${lightId} từ API; giữ dữ liệu dự phòng.`, error);
    showToast(`Không tải được dữ liệu ${lightId}; đang hiển thị thông tin mô phỏng.`, 'warning');
    return;
  }

  applyLightRecord(record);
  try {
    await loadLightTelemetry();
  } catch (error) {
    console.warn(`Không tải được telemetry của ${lightId}.`, error);
    showToast('Thông tin điểm đèn đã tải; dữ liệu giám sát hiện chưa khả dụng.', 'warning');
  }
}

const initialLightId = document.getElementById('editLampCode');
if (initialLightId) initialLightId.value = lightId;
setLightText('breadcrumbLampCode', lightId);
setLightText('lampCodeDisplay', lightId);
setLightText('heroLampTitle', `Điểm đèn: ${lightId}`);
setLightText('lampSubName', currentLightName);
setLightText('heroLocationText', currentLightName);
setLightText('editLampName', currentLightName);
setLightText('specRatedPower', `${currentRatedPower}W`);
setLightText('mapMarkerLabel', `${lightId} (${currentBrightness}%)`);
const initialBrightnessRange = document.getElementById('dimming-range');
if (initialBrightnessRange) initialBrightnessRange.value = currentBrightness;
updateBrightness(currentBrightness);
loadLightDetail();

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
