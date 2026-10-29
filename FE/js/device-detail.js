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

// Thiết bị có thể là tủ chiếu sáng (mã bắt đầu bằng "TC") hoặc điểm đèn (mã bắt đầu bằng "DEN"/"DD").
// Tham số `type` trên URL chỉ là gợi ý; nếu không có thì suy ra từ mã và xác minh lại qua API.
const requestedType = (params.get('type') || '').toLocaleLowerCase('vi');
let isCabinet = requestedType.includes('tủ')
  || (!requestedType && /^TC/i.test(device.id) && !/^DEN|^DD/i.test(device.id));

function apiField(record, camelCase, pascalCase) {
  return record?.[camelCase] ?? record?.[pascalCase];
}

let parsedKilowatts = device.power.match(/(\d+(?:[.,]\d+)?)\s*kW/i);
let parsedWatts = device.power.match(/(\d+(?:[.,]\d+)?)\s*W/i);
let ratedPower = parsedKilowatts
  ? Number(parsedKilowatts[1].replace(',', '.')) * 1000
  : Number(parsedWatts?.[1] || 120);
const parsedBrightness = device.dim.match(/(\d+(?:[.,]\d+)?)\s*%/);
let initialBrightness = Math.max(0, Math.min(100, parsedBrightness ? Number(parsedBrightness[1].replace(',', '.')) : device.status === 'Mất kết nối' ? 0 : 70));
let brightness = initialBrightness;
let deviceDataSource = 'mô phỏng';

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
  const el = document.getElementById('liveClockDisplay');
  if (el) el.textContent = `${weekdays[now.getDay()]}, ${date}`;
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
  const statusIsOff = device.status.toLocaleLowerCase('vi').includes('đang tắt');
  const kindLabel = isCabinet ? 'Tủ chiếu sáng' : 'Điểm đèn';
  const displayPower = device.power === 'Chưa có dữ liệu'
    ? device.power
    : parsedKilowatts
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
  setText('specLamp', isCabinet
    ? device.power
    : displayPower === 'Chưa có dữ liệu'
      ? 'Chưa có dữ liệu'
      : `LED · ${displayPower}${deviceDataSource === 'mô phỏng' ? ' · Thông số mô phỏng' : ''}`);
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
  status.classList.toggle('is-off', statusIsOffline || statusIsOff);
  status.querySelector('span').textContent = statusIsOffline ? 'Mất kết nối' : statusIsWarning ? 'Cảnh báo' : statusIsOff ? 'Đang tắt' : `Đang sáng · ${initialBrightness}%`;
  document.querySelector('.network-specs .state-online').classList.toggle('is-warning', statusIsWarning);
  document.querySelector('.network-specs .state-online').classList.toggle('is-off', statusIsOffline || statusIsOff);
  document.querySelector('.network-specs .state-online').innerHTML = statusIsOffline
    ? '<i></i> Mất kết nối · Dữ liệu gần nhất'
    : statusIsWarning
      ? '<i></i> Có cảnh báo cần kiểm tra'
      : statusIsOff
        ? '<i></i> Đang tắt'
        : '<i></i> Đang sáng bình thường';
  if (statusIsWarning) {
    status.querySelector('span').textContent = device.status;
  }
  if (statusIsOffline) {
    status.querySelector('span').textContent = `${device.status} · ${device.dim}`;
  }

  updateBrightness(initialBrightness);
}

async function loadCabinetTelemetry(cabinetId) {
  const readings = await window.api.get('/DuLieuGiamSatTu', { maTu: cabinetId, limit: 1 });
  if (!Array.isArray(readings) || !readings[0]) return null;
  const latest = readings[0];
  const voltages = [
    apiField(latest, 'dienApPha1', 'DienApPha1'),
    apiField(latest, 'dienApPha2', 'DienApPha2'),
    apiField(latest, 'dienApPha3', 'DienApPha3')
  ].map(Number).filter(Number.isFinite);
  const currents = [
    apiField(latest, 'dongDienPha1', 'DongDienPha1'),
    apiField(latest, 'dongDienPha2', 'DongDienPha2'),
    apiField(latest, 'dongDienPha3', 'DongDienPha3')
  ].map(Number).filter(Number.isFinite);
  const avg = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  return {
    voltage: avg(voltages),
    current: avg(currents),
    powerKw: apiField(latest, 'congSuat', 'CongSuat'),
    energyKwh: apiField(latest, 'dienNang', 'DienNang')
  };
}

async function loadLampTelemetry(lampId) {
  const readings = await window.api.get('/DuLieuGiamSatDen', { maDen: lampId, limit: 1 });
  if (!Array.isArray(readings) || !readings[0]) return null;
  const latest = readings[0];
  return {
    voltage: apiField(latest, 'dienAp', 'DienAp'),
    current: apiField(latest, 'dongDien', 'DongDien'),
    powerW: apiField(latest, 'congSuatThucTe', 'CongSuatThucTe'),
    dim: apiField(latest, 'doSang', 'DoSang')
  };
}

/**
 * Tìm thiết bị trên cả hai bảng tủ / điểm đèn để không phụ thuộc tham số `type` trên URL.
 * @returns {Promise<{record: object, isCabinet: boolean}>}
 */
async function resolveDeviceRecord(id) {
  const [cabinet, lamp] = await Promise.all([
    window.api.get(`/TuChieuSang/${encodeURIComponent(id)}`).catch(error => {
      if (error.status === 404) return null;
      throw error;
    }),
    window.api.get(`/DiemDen/${encodeURIComponent(id)}`).catch(error => {
      if (error.status === 404) return null;
      throw error;
    })
  ]);
  if (cabinet) return { record: cabinet, isCabinet: true };
  if (lamp) return { record: lamp, isCabinet: false };
  return { record: null, isCabinet };
}

async function loadDeviceFromApi() {
  if (!window.api) return;
  try {
    const resolved = await resolveDeviceRecord(device.id);
    isCabinet = resolved.isCabinet;
    let record = resolved.record;
    const endpoint = isCabinet ? '/TuChieuSang' : '/DiemDen';

    if (!record) {
      const records = await window.api.get(endpoint);
      if (!Array.isArray(records)) throw new TypeError('API thiết bị phải trả về danh sách hợp lệ.');
      record = records.find(item => String(
        apiField(item, isCabinet ? 'maTu' : 'maDen', isCabinet ? 'MaTu' : 'MaDen') || ''
      ).trim() === device.id);
    }
    if (!record) throw new Error(`Không tìm thấy thiết bị ${device.id}.`);

    const location = apiField(record, isCabinet ? 'diaChi' : 'viTri', isCabinet ? 'DiaChi' : 'ViTri');
    const type = apiField(record, 'loaiBongDen', 'LoaiBongDen');
    const routeId = apiField(record, 'maTuyen', 'MaTuyen');
    const statusValue = isCabinet
      ? (apiField(record, 'trangThaiKetNoi', 'TrangThaiKetNoi') ? 1 : 0)
      : apiField(record, 'trangThaiHoatDong', 'TrangThaiHoatDong');
    const powerValue = apiField(record, 'congSuat', 'CongSuat');
    if (location) device.location = String(location);
    if (isCabinet) device.type = 'Tủ chiếu sáng';
    else if (type) device.type = String(type);
    if (routeId) device.route = String(routeId);
    if (powerValue !== undefined && powerValue !== null) {
      device.power = `${powerValue} W`;
      parsedWatts = device.power.match(/(\d+(?:[.,]\d+)?)\s*W/i);
      parsedKilowatts = device.power.match(/(\d+(?:[.,]\d+)?)\s*kW/i);
      ratedPower = Number(powerValue);
    } else {
      device.power = 'Chưa có dữ liệu';
      parsedWatts = null;
      parsedKilowatts = null;
      ratedPower = 0;
    }
    const brightnessValue = apiField(record, 'doSang', 'DoSang');
    if (brightnessValue !== undefined && brightnessValue !== null) {
      initialBrightness = Math.max(0, Math.min(100, Number(brightnessValue)));
      device.dim = `${initialBrightness}%`;
    }
    if (statusValue !== undefined && statusValue !== null) {
      if (isCabinet) {
        device.status = Number(statusValue) === 1 ? 'Hoạt động' : 'Mất kết nối';
      } else {
        device.status = Number(statusValue) === 1 ? 'Hoạt động' : Number(statusValue) === 0 ? 'Đang tắt' : `Trạng thái ${statusValue}`;
        if (Number(statusValue) === 0) initialBrightness = 0;
      }
    }
    const [routes, cabinets, areas] = await Promise.all([
      window.api.get('/TuyenChieuSang'),
      window.api.get('/TuChieuSang'),
      window.api.get('/KhuVuc')
    ]);
    if (![routes, cabinets, areas].every(Array.isArray)) {
      throw new TypeError('API liên kết thiết bị phải trả về danh sách hợp lệ.');
    }
    let cabinet;
    if (!isCabinet && routeId) {
      const route = routes.find(item => String(apiField(item, 'maTuyen', 'MaTuyen') || '').trim() === String(routeId));
      const cabinetId = apiField(route, 'maTu', 'MaTu');
      cabinet = cabinets.find(item => String(apiField(item, 'maTu', 'MaTu') || '').trim() === String(cabinetId || ''));
    } else if (isCabinet) {
      cabinet = record;
      device.route = String(apiField(record, 'tenTu', 'TenTu') || device.route);
    }
    const areaId = apiField(cabinet, 'maKhuVuc', 'MaKhuVuc');
    const area = areas.find(item => String(apiField(item, 'maKhuVuc', 'MaKhuVuc') || '').trim() === String(areaId || '').trim());
    if (area) {
      device.district = String(apiField(area, 'tenPhuongXa', 'TenPhuongXa') || device.district);
    }

    let telemetry = null;
    try {
      telemetry = isCabinet
        ? await loadCabinetTelemetry(device.id)
        : await loadLampTelemetry(device.id);
    } catch (telemetryError) {
      console.warn(`Không tải được dữ liệu giám sát ${device.id}.`, telemetryError);
    }

    if (isCabinet && telemetry) {
      if (telemetry.powerKw !== null && telemetry.powerKw !== undefined) {
        device.power = `${Number(telemetry.powerKw).toFixed(2)} kW`;
        parsedKilowatts = device.power.match(/(\d+(?:[.,]\d+)?)\s*kW/i);
        parsedWatts = null;
        ratedPower = Number(telemetry.powerKw) * 1000;
        if (Number(telemetry.powerKw) > 0) initialBrightness = Math.max(initialBrightness, 70);
        else if (Number(telemetry.powerKw) === 0) {
          initialBrightness = 0;
          device.status = device.status === 'Mất kết nối' ? device.status : 'Đang tắt';
        }
      }
    } else if (!isCabinet && telemetry) {
      if (telemetry.powerW !== null && telemetry.powerW !== undefined) {
        device.power = `${Number(telemetry.powerW).toFixed(1)} W`;
        parsedWatts = device.power.match(/(\d+(?:[.,]\d+)?)\s*W/i);
        parsedKilowatts = null;
        ratedPower = Number(telemetry.powerW) || ratedPower;
      }
      if (telemetry.dim !== null && telemetry.dim !== undefined) {
        initialBrightness = Math.max(0, Math.min(100, Number(telemetry.dim)));
        device.dim = `${initialBrightness}%`;
      }
    }

    deviceDataSource = 'Backend';
    renderDevice();
    if (telemetry?.current !== null && telemetry?.current !== undefined) {
      const currentEl = document.getElementById('telemetryCurrent');
      if (currentEl) currentEl.innerHTML = `${Number(telemetry.current).toFixed(2)} <small>A</small>`;
    }
    if (!isCabinet && telemetry?.powerW !== null && telemetry?.powerW !== undefined) {
      const powerEl = document.getElementById('telemetryPower');
      if (powerEl) powerEl.innerHTML = `${Number(telemetry.powerW).toFixed(1)} <small>W</small>`;
    }
    if (isCabinet && telemetry?.powerKw !== null && telemetry?.powerKw !== undefined) {
      const powerEl = document.getElementById('telemetryPower');
      if (powerEl) powerEl.innerHTML = `${Number(telemetry.powerKw).toFixed(2)} <small>kW</small>`;
    }
    setText('commandStatus', `${device.status} · Dữ liệu từ Backend`);
    const disclaimer = document.querySelector('.demo-disclaimer');
    if (disclaimer) disclaimer.textContent = 'Thông tin thiết bị và số liệu đo được tải từ Backend; biểu đồ lịch sử và thao tác điều khiển vẫn là mô phỏng.';
  } catch (error) {
    console.warn(`Không tải được thiết bị ${device.id} từ API.`, error);
    showToast(`Không tải được thiết bị ${device.id} từ Backend; đang hiển thị dữ liệu demo.`);
  }
}

renderDevice();
loadDeviceFromApi();
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
