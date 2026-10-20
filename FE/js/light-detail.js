// ==================== JAVASCRIPT LOGIC FOR LIGHT POINT DETAIL ====================

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
    clockEl.innerHTML = `${dayName}, ${d}/${m}/${y} • <span class="font-mono text-slate-700 font-semibold" id="liveTime">${hh}:${mm}:${ss} GMT+7</span>`;
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
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[18px] ${iconColor}">${icon}</span>
    <span>${message}</span>
  `;

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
  if (markerLabel) markerLabel.textContent = `LD-0001 (${val}%)`;

  // Scale Light Beam SVG
  if (beam) {
    beam.style.opacity = (val / 100).toString();
  }
  // Scale Warm Ambient Glow
  if (glow) {
    glow.style.opacity = (val / 100).toString();
  }

  // Calculate instantaneous power and current based on dimming
  const maxPower = 120;
  const power = val === 0 ? 0 : ((val / 100) * maxPower * 0.985).toFixed(1);
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
    showToast(`Đã điều chỉnh mức sáng điểm đèn LD-0001 về ${val}%`);
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
  showToast('Cập nhật thông số điểm đèn LD-0001 thành công!');
});

// Action Bar triggers
document.getElementById('btnPrintSpecs')?.addEventListener('click', () => {
  showToast('Đang kết xuất biểu mẫu thông số kỹ thuật LD-0001 ra máy in...');
  setTimeout(() => window.print(), 600);
});

document.getElementById('btnShareLamp')?.addEventListener('click', () => {
  navigator.clipboard?.writeText(window.location.href);
  showToast('Đã sao chép liên kết thông số điểm đèn LD-0001 vào clipboard!');
});

document.getElementById('btnSyncNow')?.addEventListener('click', () => {
  const icon = document.getElementById('syncIcon');
  if (icon) icon.classList.add('animate-spin');
  showToast('Đang đồng bộ tham số NB-IoT tức thời với máy chủ EVN...', 'info');
  setTimeout(() => {
    if (icon) icon.classList.remove('animate-spin');
    showToast('Đồng bộ dữ liệu tức thời thành công! RSSI: -78 dBm • Phản hồi: 45ms');
  }, 1000);
});

// Map controls
document.getElementById('btnMapStreet')?.addEventListener('click', function() {
  this.className = 'px-3 py-1 rounded-lg bg-white text-primary text-xs font-bold shadow-2xs';
  const satBtn = document.getElementById('btnMapSatellite');
  if (satBtn) satBtn.className = 'px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors';
  showToast('Chuyển sang chế độ Sơ đồ phố GIS đô thị', 'info');
});

document.getElementById('btnMapSatellite')?.addEventListener('click', function() {
  this.className = 'px-3 py-1 rounded-lg bg-white text-primary text-xs font-bold shadow-2xs';
  const streetBtn = document.getElementById('btnMapStreet');
  if (streetBtn) streetBtn.className = 'px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors';
  showToast('Chuyển sang chế độ ảnh vệ tinh độ phân giải cao', 'info');
});

document.getElementById('btnZoomIn')?.addEventListener('click', () => {
  showToast('Phóng to bản đồ GIS khu vực Lê Duẩn (+25%)', 'info');
});

document.getElementById('btnZoomOut')?.addEventListener('click', () => {
  showToast('Thu nhỏ bản đồ GIS khu vực Lê Duẩn (-25%)', 'info');
});

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
