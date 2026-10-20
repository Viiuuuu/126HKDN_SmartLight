const params = new URLSearchParams(window.location.search);
const device = {
  id: params.get('id') || 'LD-0002',
  type: params.get('type') || 'Điểm đèn LED thông minh',
  district: params.get('district') || 'Quận Hải Châu',
  route: params.get('route') || 'Tuyến TL-01 (Lê Duẩn)',
  location: params.get('location') || '48 Lê Duẩn, Phường Hải Châu I, Quận Hải Châu, TP. Đà Nẵng',
  status: params.get('status') || 'Hoạt động',
  power: params.get('power') || '120 W',
  dim: params.get('dim') || '70%'
};

const isCabinet = device.type.toLocaleLowerCase('vi').includes('tủ');
const parsedKilowatts = device.power.match(/(\d+(?:[.,]\d+)?)\s*kW/i);
const parsedWatts = device.power.match(/(\d+(?:[.,]\d+)?)\s*W/i);
const ratedPower = parsedKilowatts
  ? Number(parsedKilowatts[1].replace(',', '.')) * 1000
  : Number(parsedWatts?.[1] || 120);
const parsedBrightness = device.dim.match(/(\d+(?:[.,]\d+)?)\s*%/);
const initialBrightness = Math.max(0, Math.min(100, parsedBrightness ? Number(parsedBrightness[1].replace(',', '.')) : device.status === 'Mất kết nối' ? 0 : 70));
let brightness = initialBrightness;

const toastContainer = document.getElementById('toastContainer');

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function currentTime() {
  return new Date().toLocaleTimeString('vi-VN', { hour12: false });
}

function updateClock() {
  const now = new Date();
  const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  document.getElementById('liveClockDisplay').textContent = `${weekdays[now.getDay()]}, ${date} • ${currentTime()} GMT+7`;
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function updateBrightness(value, notify = false) {
  brightness = Math.max(0, Math.min(100, Number(value)));
  const watts = brightness === 0 ? 0 : Number((ratedPower * brightness / 100 * 0.98).toFixed(1));
  const current = watts === 0 ? '0.00' : (watts / 224.6).toFixed(2);
  const isOn = brightness > 0;

  document.getElementById('telemetryPower').innerHTML = `${watts.toFixed(1)} <small>W</small>`;
  document.getElementById('telemetryCurrent').innerHTML = `${current} <small>A</small>`;
  setText('dimmingState', isOn ? `Dimming ${brightness}%` : 'Đang tắt');
  setText('brightnessLabel', isOn ? `${brightness}% (Dimming)` : '0% (Tắt)');
  document.getElementById('brightnessBar').style.width = `${brightness}%`;
  setText('chartTooltipValue', `${watts.toFixed(1)} W · ${brightness}%`);
  setText('chartPeak', `${watts.toFixed(1)} W`);
  setText('chartCurrentTime', currentTime());
  setText('syncTime', currentTime());
  setText('lastUpdateTime', `${currentTime()} GMT+7 (mô phỏng)`);
  if (notify) {
    document.getElementById('deviceStatus').querySelector('span').textContent = isOn ? `Đang sáng · ${brightness}%` : 'Đã tắt · Chế độ chờ';
    document.getElementById('deviceStatus').classList.toggle('is-off', !isOn);
    document.getElementById('networkStatus').innerHTML = isOn ? '<i></i> Đang sáng bình thường' : '<i></i> Đèn đang tắt';
    document.getElementById('networkStatus').classList.toggle('is-off', !isOn);
  }

  document.querySelectorAll('.quick-presets button').forEach((button) => {
    button.classList.toggle('selected', Number(button.dataset.brightness) === brightness);
  });

  if (notify) {
    showToast(`Đã cập nhật mức sáng mô phỏng của ${device.id} thành ${brightness}%. Chưa gửi lệnh đến thiết bị thật.`);
  }
}

function renderDevice() {
  const displayId = device.id;
  const district = device.district;
  const route = device.route.replace(/^Tuyến\s*/i, '');
  const type = device.type;
  const statusIsWarning = device.status.toLocaleLowerCase('vi').includes('cảnh báo');
  const statusIsOffline = device.status.toLocaleLowerCase('vi').includes('mất kết nối');
  const kindLabel = isCabinet ? 'Tủ chiếu sáng' : 'Điểm đèn';
  const displayPower = parsedKilowatts
    ? `${parsedKilowatts[1].replace(',', '.')} kW`
    : `${ratedPower.toLocaleString('vi-VN')} W`;

  document.title = `Chi tiết thiết bị ${displayId} | SmartLight`;
  setText('toolbarDevice', `${kindLabel} (${displayId})`);
  setText('deviceId', displayId);
  setText('specDeviceId', displayId);
  setText('deviceLocation', device.location);
  setText('specLocation', device.location);
  setText('specType', type);
  setText('specDistrict', `${district}, TP. Đà Nẵng`);
  setText('specRoute', route);
  setText('specCabinet', isCabinet ? displayId : 'Chưa có dữ liệu liên kết');
  setText('deviceSource', isCabinet ? displayId : 'Chưa có dữ liệu liên kết');
  setText('specLamp', isCabinet ? device.power : `LED · ${displayPower} · Thông số mô phỏng`);
  setText('ratedPower', isCabinet ? `Tổng tải ${displayPower}` : `Định mức ${displayPower}`);
  setText('chartRatedPower', ratedPower.toLocaleString('vi-VN'));
  setText('chartMax', ratedPower.toLocaleString('vi-VN'));
  setText('commandStatus', `${device.status} · Dữ liệu mô phỏng`);

  if (isCabinet) {
    document.querySelector('.device-icon').textContent = 'electrical_services';
    document.querySelector('.mesh-tag').textContent = 'TỦ ĐIỀU KHIỂN';
    document.querySelector('.quick-control > strong').textContent = 'Điều khiển mô phỏng';
    document.querySelector('.network-specs > div:nth-child(5) > strong').textContent = 'Theo thiết bị hỗ trợ';
  }

  const status = document.getElementById('deviceStatus');
  status.classList.toggle('is-warning', statusIsWarning);
  status.classList.toggle('is-off', statusIsOffline);
  status.querySelector('span').textContent = statusIsOffline ? 'Mất kết nối' : statusIsWarning ? 'Cảnh báo' : `Đang sáng · ${initialBrightness}%`;
  document.querySelector('.network-specs .state-online').classList.toggle('is-warning', statusIsWarning);
  document.querySelector('.network-specs .state-online').classList.toggle('is-off', statusIsOffline);
  document.querySelector('.network-specs .state-online').innerHTML = statusIsOffline
    ? '<i></i> Mất kết nối · Dữ liệu gần nhất'
    : statusIsWarning
      ? '<i></i> Có cảnh báo cần kiểm tra'
      : '<i></i> Đang sáng bình thường';
  if (statusIsWarning) {
    status.querySelector('span').textContent = device.status;
  }
  if (statusIsOffline) {
    status.querySelector('span').textContent = `${device.status} · ${device.dim}`;
  }

  updateBrightness(initialBrightness);
}

renderDevice();
updateClock();
window.setInterval(() => {
  updateClock();
  setText('syncTime', currentTime());
  setText('lastUpdateTime', `${currentTime()} GMT+7 (mô phỏng)`);
}, 5000);

const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('visible');
}
document.getElementById('btnToggleMobileSidebar').addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarBackdrop.classList.toggle('visible', sidebar.classList.contains('open'));
});
document.getElementById('btnCloseSidebar').addEventListener('click', closeSidebar);
sidebarBackdrop.addEventListener('click', closeSidebar);

document.getElementById('btnQuickControl').addEventListener('click', () => {
  document.getElementById('quickControl').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.querySelector('.quick-presets button').focus({ preventScroll: true });
});
document.querySelectorAll('.quick-presets button').forEach((button) => {
  button.addEventListener('click', () => updateBrightness(button.dataset.brightness, true));
});

document.querySelectorAll('.history-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.history-tab').forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.hidden = panel.id !== tab.dataset.tab;
    });
  });
});

document.querySelectorAll('.range-switch button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.range-switch button').forEach((item) => item.classList.toggle('active', item === button));
    showToast(`Đang xem biểu đồ mô phỏng trong ${button.dataset.period}.`);
  });
});

document.getElementById('btnDownloadChart').addEventListener('click', () => {
  const svg = document.querySelector('.power-chart').cloneNode(true);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const file = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = `bieu-do-cong-suat-${device.id}.svg`;
  link.click();
  URL.revokeObjectURL(link.href);
});

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    document.querySelector('.global-search input').focus();
  }
});
