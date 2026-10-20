/**
 * SmartLight Municipal IoT - Route Detail Logic (route-detail.html)
 */

// 1. Live Clock Sync matching system
function updateLiveClock() {
  const now = new Date();
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const dayStr = days[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
  
  const clockEl = document.getElementById('liveClockDisplay');
  if (clockEl) {
    clockEl.innerHTML = `${dayStr}, ${dateStr} • <span class="font-mono text-slate-700 font-semibold" id="liveTime">${timeStr} GMT+7</span>`;
  }
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
  toast.innerHTML = `
    <i class="fa-solid ${iconClass} text-base"></i>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 ml-2">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;
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
  const mainTrack = document.getElementById('mainSliderFillTrack');

  const quickSlider = document.getElementById('quickBrightnessSlider');
  const quickDisplay = document.getElementById('quickBrightnessDisplay');
  const quickTrack = document.getElementById('quickSliderFillTrack');

  if (mainSlider) mainSlider.value = currentBrightness;
  if (quickSlider) quickSlider.value = currentBrightness;

  if (mainDisplay) mainDisplay.textContent = currentBrightness + '%';
  if (quickDisplay) quickDisplay.textContent = currentBrightness + '%';

  if (mainTrack) mainTrack.style.width = currentBrightness + '%';
  if (quickTrack) quickTrack.style.width = currentBrightness + '%';

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
    showToast(`Đã thiết lập mức sáng tuyến TL-001 về ${currentBrightness}%`);
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
    showToast('Đã BẬT hệ thống chiếu sáng tuyến TL-001');
  } else {
    if (powerStateText) powerStateText.textContent = 'Đã tắt';
    if (powerIndicatorDot) powerIndicatorDot.className = 'w-2.5 h-2.5 rounded-full bg-slate-300';
    if (btnTogglePowerText) btnTogglePowerText.textContent = 'Bật tuyến';
    if (routeLinePath) routeLinePath.setAttribute('stroke', '#94a3b8');
    showToast('Đã TẮT toàn bộ chiếu sáng tuyến TL-001', 'info');
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
  showToast('Đã lưu cấu hình hiệu chỉnh tuyến thành công!');
}

function closeEditRouteModal() {
  const editRouteModal = document.getElementById('editRouteModal');
  if (editRouteModal) editRouteModal.classList.add('hidden');
}

function handleSaveEditRoute(e) {
  e.preventDefault();
  const name = document.getElementById('modalInputRouteName').value;
  const cab = document.getElementById('modalInputCabinet').value;
  const area = document.getElementById('modalInputArea').value;
  const length = document.getElementById('modalInputLength').value;
  const points = document.getElementById('modalInputPoints').value;

  const titleEl = document.getElementById('detailRouteTitle');
  if (titleEl) titleEl.innerHTML = `Chi tiết tuyến chiếu sáng: <span class="font-extrabold text-primary">TL-001</span> – ${name}`;
  const infoRouteName = document.getElementById('infoRouteName');
  if (infoRouteName) infoRouteName.textContent = name;
  const infoCabinet = document.getElementById('infoCabinet');
  if (infoCabinet) infoCabinet.textContent = 'Tủ ' + cab;
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
  showToast('Đã cập nhật thông tin tuyến thành công!');
}

function closeExportModal() {
  const exportModal = document.getElementById('exportModal');
  if (exportModal) exportModal.classList.add('hidden');
}

function downloadReport() {
  closeExportModal();
  showToast('Đang khởi tạo báo cáo tuyến TL-001...');
  setTimeout(() => {
    showToast('Đã tải xuống Bao_cao_tuyen_TL-001.pdf');
  }, 1200);
}

document.addEventListener('DOMContentLoaded', () => {
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
    showToast(`Đã áp dụng mức sáng ${currentBrightness}% cho toàn bộ tuyến Nguyễn Văn Linh!`);
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

  document.getElementById('btnToggleManagement')?.addEventListener('click', () => {
    isManaging = !isManaging;
    if (isManaging) {
      if (managementDot) managementDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
      if (managementText) managementText.textContent = 'Hoạt động';
      if (btnToggleManagementText) btnToggleManagementText.textContent = 'Ngừng hoạt động';
      if (detailStatusBadge) {
        detailStatusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đang hoạt động';
        detailStatusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
      }
      showToast('Tuyến đã được chuyển sang chế độ Hoạt động');
    } else {
      if (managementDot) managementDot.className = 'w-2.5 h-2.5 rounded-full bg-slate-400';
      if (managementText) managementText.textContent = 'Ngừng hoạt động';
      if (btnToggleManagementText) btnToggleManagementText.textContent = 'Kích hoạt lại';
      if (detailStatusBadge) {
        detailStatusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-400"></span> Ngừng hoạt động';
        detailStatusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200';
      }
      showToast('Tuyến đã chuyển sang trạng thái Ngừng hoạt động', 'warning');
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

  // Check URL params for custom route id (e.g., route-detail.html?id=TL-002)
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  if (id && id !== 'TL-001') {
    const infoRouteCode = document.getElementById('infoRouteCode');
    if (infoRouteCode) infoRouteCode.textContent = id;
    const titleEl = document.getElementById('detailRouteTitle');
    if (id === 'TL-002') {
      if (titleEl) titleEl.innerHTML = `Chi tiết tuyến chiếu sáng: <span class="font-extrabold text-primary">${id}</span> – Võ Nguyên Giáp`;
      const infoRouteName = document.getElementById('infoRouteName');
      if (infoRouteName) infoRouteName.textContent = 'Võ Nguyên Giáp';
      const infoCabinet = document.getElementById('infoCabinet');
      if (infoCabinet) infoCabinet.textContent = 'Tủ CS-02';
      const headerCabinetName = document.getElementById('headerCabinetName');
      if (headerCabinetName) headerCabinetName.textContent = 'CS-02';
      const infoLength = document.getElementById('infoLength');
      if (infoLength) infoLength.textContent = '5.6 km';
      const headerRouteLength = document.getElementById('headerRouteLength');
      if (headerRouteLength) headerRouteLength.textContent = '5.6 km';
      const infoPoints = document.getElementById('infoPoints');
      if (infoPoints) infoPoints.textContent = '412';
      const headerRoutePoints = document.getElementById('headerRoutePoints');
      if (headerRoutePoints) headerRoutePoints.textContent = '412';
    }
  }
});
