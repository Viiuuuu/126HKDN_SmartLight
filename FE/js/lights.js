const fallbackLights = [
  { id: 'LD-0001', name: 'Đèn LED đường Lê Duẩn', type: 'LED 120W', route: 'TL-03', location: '48 Lê Duẩn, Hải Châu', power: 120, dim: 80, status: 'Hoạt động' },
  { id: 'LD-0002', name: 'Đèn LED đường Bạch Đằng', type: 'LED 150W', route: 'TL-01', location: 'Đường Bạch Đằng, Hải Châu', power: 150, dim: 100, status: 'Hoạt động' },
  { id: 'LD-0003', name: 'Đèn LED đường Trần Phú', type: 'LED 100W', route: 'TL-02', location: 'Đường Trần Phú, Hải Châu', power: 100, dim: 0, status: 'Cảnh báo' }
];

let lights = [];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function normalizeLight(item) {
  const rawStatus = item.trangThaiHoatDong ?? item.TrangThaiHoatDong;
  const status = typeof rawStatus === 'string'
    ? rawStatus
    : rawStatus === undefined
      ? 'Chưa xác định'
      : Number(rawStatus) === 1
        ? 'Hoạt động'
        : Number(rawStatus) === 0
          ? 'Đang tắt'
          : `Trạng thái ${rawStatus}`;

  return {
    id: String(item.maDen ?? item.MaDen ?? ''),
    name: String(item.tenDen ?? item.TenDen ?? 'Điểm đèn'),
    type: String(item.loaiBongDen ?? item.LoaiBongDen ?? 'Điểm đèn LED'),
    route: String(item.maTuyen ?? item.MaTuyen ?? ''),
    location: String(item.viTri ?? item.ViTri ?? ''),
    power: Number(item.congSuat ?? item.CongSuat ?? 0),
    dim: Number(item.doSang ?? item.DoSang ?? 0),
    status
  };
}

function getVisibleLights() {
  const keyword = document.getElementById('lightSearchInput').value.trim().toLocaleLowerCase('vi');
  const status = document.getElementById('lightStatusFilter').value;
  return lights.filter(light => {
    const searchable = `${light.id} ${light.name} ${light.type} ${light.route} ${light.location}`.toLocaleLowerCase('vi');
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
        <td class="px-4 py-3">${escapeHtml(light.route || '—')}</td>
        <td class="px-4 py-3 text-slate-600">${escapeHtml(light.location || '—')}</td>
        <td class="px-4 py-3 text-right font-mono">${escapeHtml(light.power)} W</td>
        <td class="px-4 py-3"><span class="rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}">${escapeHtml(light.status)}</span></td>
        <td class="px-4 py-3 text-right"><a class="font-semibold text-blue-800 hover:underline" href="light-detail.html?${escapeHtml(params.toString())}">Chi tiết</a></td>
      </tr>
    `;
  }).join('');
}

async function loadLights() {
  const notice = document.getElementById('lightsDataNotice');
  notice.hidden = true;

  try {
    const result = await window.api.get('/DiemDen');
    if (!Array.isArray(result)) throw new TypeError('API DiemDen phải trả về một danh sách.');
    lights = result.length ? result.map(normalizeLight) : fallbackLights;
    if (!result.length) {
      notice.textContent = 'Backend chưa có dữ liệu điểm đèn; đang hiển thị dữ liệu mô phỏng.';
      notice.hidden = false;
    }
  } catch (error) {
    console.warn('Không tải được điểm đèn từ API; dùng dữ liệu mô phỏng.', error);
    lights = fallbackLights;
    notice.textContent = 'Không kết nối được Backend; đang hiển thị dữ liệu mô phỏng.';
    notice.hidden = false;
  }

  renderLights();
}

function exportLightsCsv() {
  const rows = getVisibleLights().map(light => [
    light.id, light.name, light.type, light.route, light.location, light.power, light.dim, light.status
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
