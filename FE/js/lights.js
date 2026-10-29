/**
 * SmartLight Municipal IoT - Lights (điểm đèn) Management Logic (lights.html)
 * Nguồn dữ liệu: API /DiemDen, /TuyenChieuSang, /TuChieuSang, /KhuVuc
 */

const fallbackLights = [
  { id: 'LD-0001', name: 'Đèn LED đường Lê Duẩn', type: 'LED 120W', route: 'TL-03', location: '48 Lê Duẩn, Hải Châu', power: 120, dim: 80, status: 'Hoạt động' },
  { id: 'LD-0002', name: 'Đèn LED đường Bạch Đằng', type: 'LED 150W', route: 'TL-01', location: 'Đường Bạch Đằng, Hải Châu', power: 150, dim: 100, status: 'Hoạt động' },
  { id: 'LD-0003', name: 'Đèn LED đường Trần Phú', type: 'LED 100W', route: 'TL-02', location: 'Đường Trần Phú, Hải Châu', power: 100, dim: 0, status: 'Cảnh báo' }
];

let lights = [];
let routeLookup = new Map();
let cabinetLookup = new Map();
let areaLookup = new Map();

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function apiValue(record, camelName, pascalName) {
  return record?.[camelName] ?? record?.[pascalName];
}

function normalizeLight(item) {
  const rawStatus = apiValue(item, 'trangThaiHoatDong', 'TrangThaiHoatDong');
  const status = typeof rawStatus === 'string'
    ? rawStatus
    : rawStatus === undefined || rawStatus === null
      ? 'Chưa xác định'
      : Number(rawStatus) === 1
        ? 'Hoạt động'
        : Number(rawStatus) === 0
          ? 'Đang tắt'
          : 'Cảnh báo';

  return {
    id: String(apiValue(item, 'maDen', 'MaDen') || ''),
    name: String(apiValue(item, 'tenDen', 'TenDen') || 'Điểm đèn'),
    type: String(apiValue(item, 'loaiBongDen', 'LoaiBongDen') || 'Điểm đèn LED'),
    route: String(apiValue(item, 'maTuyen', 'MaTuyen') || ''),
    location: String(apiValue(item, 'viTri', 'ViTri') || ''),
    power: Number(apiValue(item, 'congSuat', 'CongSuat') ?? 0),
    dim: Number(apiValue(item, 'doSang', 'DoSang') ?? 0),
    status,
    raw: item
  };
}

function getVisibleLights() {
  const keyword = document.getElementById('lightSearchInput').value.trim().toLocaleLowerCase('vi');
  const status = document.getElementById('lightStatusFilter').value;
  return lights.filter(light => {
    const searchable = `${light.id} ${light.name} ${light.type} ${light.routeName} ${light.location}`.toLocaleLowerCase('vi');
    return (!keyword || searchable.includes(keyword)) && (status === 'all' || light.status === status);
  });
}

function renderLights() {
  const tbody = document.getElementById('lightsTableBody');
  const visibleLights = getVisibleLights();
  document.getElementById('lightsCount').textContent = `${visibleLights.length} / ${lights.length} điểm đèn`;

  if (!visibleLights.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-10 text-center text-slate-500">Không tìm thấy điểm đèn phù hợp.</td></tr>';
    return;
  }

  tbody.innerHTML = visibleLights.map(light => {
    const statusClass = light.status === 'Hoạt động'
      ? 'bg-emerald-50 text-emerald-700'
      : light.status === 'Cảnh báo'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-slate-100 text-slate-600';
    const params = new URLSearchParams({
      id: light.id,
      type: light.type,
      route: light.route,
      location: light.location,
      power: `${light.power} W`,
      dim: `${light.dim}%`,
      status: light.status
    });

    return `
      <tr class="hover:bg-slate-50">
        <td class="whitespace-nowrap px-4 py-3 font-mono font-bold text-blue-800">${escapeHtml(light.id)}</td>
        <td class="px-4 py-3 font-semibold text-slate-800">${escapeHtml(light.name)}</td>
        <td class="px-4 py-3">
          ${light.routeName
            ? `<a href="route-detail.html?id=${encodeURIComponent(light.route)}" class="font-semibold text-blue-800 hover:underline">${escapeHtml(light.routeName)}</a>`
            : escapeHtml(light.route || '—')}
        </td>
        <td class="px-4 py-3 text-slate-600">${escapeHtml(light.location || '—')}</td>
        <td class="px-4 py-3 text-right font-mono">${escapeHtml(light.power)} W</td>
        <td class="px-4 py-3"><span class="rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}">${escapeHtml(light.status)}</span></td>
        <td class="px-4 py-3 text-right"><a class="font-semibold text-blue-800 hover:underline" href="light-detail.html?${escapeHtml(params.toString())}">Chi tiết</a></td>
      </tr>
    `;
  }).join('');
}

function populateStatusFilter() {
  const select = document.getElementById('lightStatusFilter');
  if (!select) return;
  const currentValue = select.value;
  const available = ['Hoạt động', 'Đang tắt', 'Cảnh báo', 'Chưa xác định'];
  select.replaceChildren();
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Tất cả trạng thái';
  select.appendChild(allOption);
  available.forEach(status => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    select.appendChild(option);
  });
  select.value = currentValue && [...select.options].some(option => option.value === currentValue)
    ? currentValue
    : 'all';
}

async function loadLights() {
  const notice = document.getElementById('lightsDataNotice');
  notice.hidden = true;

  try {
    if (!window.api) throw new Error('Chưa nạp API client.');

    const [result, routes, cabinets, areas] = await Promise.all([
      window.api.get('/DiemDen'),
      window.api.get('/TuyenChieuSang'),
      window.api.get('/TuChieuSang'),
      window.api.get('/KhuVuc')
    ]);
    if (!Array.isArray(result)) throw new TypeError('API DiemDen phải trả về một danh sách.');

    routeLookup = new Map((routes || []).map(route => [
      String(apiValue(route, 'maTuyen', 'MaTuyen') || '').trim(),
      route
    ]));
    cabinetLookup = new Map((cabinets || []).map(cabinet => [
      String(apiValue(cabinet, 'maTu', 'MaTu') || '').trim(),
      cabinet
    ]));
    areaLookup = new Map((areas || []).map(area => [
      String(apiValue(area, 'maKhuVuc', 'MaKhuVuc') || '').trim(),
      area
    ]));

    lights = (result.length ? result : fallbackLights).map(normalizeLight);
    lights.forEach(light => {
      const route = routeLookup.get(light.route);
      light.routeName = route ? String(apiValue(route, 'tenTuyen', 'TenTuyen') || light.route) : '';
      const cabinet = route ? cabinetLookup.get(String(apiValue(route, 'maTu', 'MaTu') || '').trim()) : null;
      light.cabinetId = cabinet ? String(apiValue(cabinet, 'maTu', 'MaTu') || '') : '';
      light.cabinetName = cabinet ? String(apiValue(cabinet, 'tenTu', 'TenTu') || '') : '';
      const area = cabinet ? areaLookup.get(String(apiValue(cabinet, 'maKhuVuc', 'MaKhuVuc') || '').trim()) : null;
      light.areaName = area ? String(apiValue(area, 'tenPhuongXa', 'TenPhuongXa') || '') : '';
    });

    if (!result.length) {
      notice.textContent = 'Backend chưa có dữ liệu điểm đèn; đang hiển thị dữ liệu mô phỏng.';
      notice.hidden = false;
    }
  } catch (error) {
    console.warn('Không tải được điểm đèn từ API; dùng dữ liệu mô phỏng.', error);
    lights = fallbackLights.map(normalizeLight);
    notice.textContent = 'Không kết nối được Backend; đang hiển thị dữ liệu mô phỏng.';
    notice.hidden = false;
  }

  populateStatusFilter();
  renderLights();
}

function exportLightsCsv() {
  const rows = getVisibleLights().map(light => [
    light.id, light.name, light.type, light.routeName || light.route, light.location, light.power, light.dim, light.status
  ]);
  const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [
    ['Mã điểm đèn', 'Tên điểm đèn', 'Loại', 'Mã tuyến', 'Vị trí', 'Công suất (W)', 'Độ sáng (%)', 'Trạng thái'].map(quote).join(','),
    ...rows.map(row => row.map(quote).join(','))
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'danh-sach-diem-den.csv';
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById('lightSearchInput').addEventListener('input', renderLights);
document.getElementById('lightStatusFilter').addEventListener('change', renderLights);
document.getElementById('btnReloadLights').addEventListener('click', loadLights);
document.getElementById('btnExportLights').addEventListener('click', exportLightsCsv);
loadLights();
