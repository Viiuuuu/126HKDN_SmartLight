/**
 * SmartLight Municipal IoT - Area Detail Logic (area-detail.html)
 * Nguồn dữ liệu: API /KhuVuc, /TuChieuSang, /TuyenChieuSang, /DiemDen, /DuLieuGiamSatTu
 */

const areaParams = new URLSearchParams(window.location.search);
const currentAreaId = areaParams.get('id') || 'KV-01';
let currentAreaName = 'Hải Châu';
let currentAreaDistricts = [];

// Live Clock
const daysOfWeekAreaDetail = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function updateClock() {
  const now = new Date();
  const dayName = daysOfWeekAreaDetail[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  const el = document.getElementById('liveClockDisplay');
  if (el) el.textContent = `${dayName}, ${dateStr}`;
}

// Show Toast Alert
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all transform translate-y-2 opacity-0 duration-300 ${
    type === 'success'
      ? 'bg-slate-900 text-white border-slate-800'
      : 'bg-rose-900 text-white border-rose-800'
  }`;
  const indicator = document.createElement('span');
  indicator.className = `w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`;
  const text = document.createElement('span');
  text.textContent = message;
  toast.append(indicator, text);
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
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

function apiField(record, camelName, pascalName) {
  return record?.[camelName] ?? record?.[pascalName];
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString('vi-VN') : '—';
}

/**
 * Dựng bảng tuyến chiếu sáng của khu vực từ dữ liệu API
 */
function renderAreaRoutes(routes, lights, cabinetById) {
  const tbody = document.getElementById('areaRoutesTableBody');
  if (!tbody) return;

  if (!routes.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400 text-[11px]">Khu vực chưa có tuyến chiếu sáng.</td>
      </tr>
    `;
  } else {
    tbody.innerHTML = routes.map(route => {
      const routeId = String(apiField(route, 'maTuyen', 'MaTuyen') || '').trim();
      const name = String(apiField(route, 'tenTuyen', 'TenTuyen') || routeId);
      const cabinetId = String(apiField(route, 'maTu', 'MaTu') || '').trim();
      const cabinetName = String(apiField(cabinetById.get(cabinetId), 'tenTu', 'TenTu') || cabinetId || '—');
      const routeLights = lights.filter(light =>
        String(apiField(light, 'maTuyen', 'MaTuyen') || '').trim() === routeId
      );
      const activeLights = routeLights.filter(light =>
        Number(apiField(light, 'trangThaiHoatDong', 'TrangThaiHoatDong')) === 1
      ).length;
      const rate = routeLights.length
        ? Number((activeLights * 100 / routeLights.length).toFixed(1))
        : 0;
      const isActive = Number(apiField(route, 'trangThaiHoatDong', 'TrangThaiHoatDong')) === 1;
      const statusBadge = isActive
        ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-semibold border border-emerald-200">
             <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Hoạt động
           </span>`
        : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10.5px] font-semibold border border-slate-200">
             <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Ngừng hoạt động
           </span>`;

      return `
        <tr class="hover:bg-slate-50/80 transition-colors">
          <td class="py-3 px-3 font-mono font-bold text-primary">
            <a href="route-detail.html?id=${encodeURIComponent(routeId)}" class="hover:underline">${escapeHtml(routeId)}</a>
          </td>
          <td class="py-3 px-3 font-bold text-slate-900">${escapeHtml(name)}</td>
          <td class="py-3 px-3 font-mono text-[11px] text-slate-600">${escapeHtml(cabinetName)}</td>
          <td class="py-3 px-3 text-center font-mono font-semibold">${routeLights.length}</td>
          <td class="py-3 px-3 text-center font-mono font-bold ${rate >= 95 ? 'text-emerald-600' : 'text-amber-600'}">${rate}%</td>
          <td class="py-3 px-3 text-center">${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  setText('areaRoutesSummary', `Hiển thị ${Math.min(routes.length, 4)} trong tổng số ${routes.length} tuyến`);
  setText('areaRoutesAllLink', `Xem toàn bộ ${routes.length} tuyến →`);
  setText('areaRoutesAllCount', String(routes.length));
}

/**
 * Tải toàn bộ số liệu khu vực từ Backend
 */
async function loadAreaDetails() {
  if (!window.api) {
    showToast('Chưa nạp API client; đang giữ thông tin mô phỏng.', 'error');
    return;
  }

  try {
    const [area, cabinets, routes, lights, areas] = await Promise.all([
      window.api.get(`/KhuVuc/${encodeURIComponent(currentAreaId)}`),
      window.api.get('/TuChieuSang', { maKhuVuc: currentAreaId }),
      window.api.get('/TuyenChieuSang'),
      window.api.get('/DiemDen'),
      window.api.get('/KhuVuc')
    ]);
    if (!Array.isArray(cabinets) || !Array.isArray(routes) || !Array.isArray(lights) || !Array.isArray(areas)) {
      throw new TypeError('API hạ tầng phải trả về danh sách hợp lệ.');
    }

    const name = String(apiField(area, 'tenPhuongXa', 'TenPhuongXa') || currentAreaId);
    currentAreaName = name;
    currentAreaDistricts = areas.map(item =>
      String(apiField(item, 'tenPhuongXa', 'TenPhuongXa') || '')
    ).filter(Boolean);

    const cabinetIds = new Set(cabinets.map(cabinet => String(apiField(cabinet, 'maTu', 'MaTu') || '').trim()));
    const areaRoutes = routes.filter(route => cabinetIds.has(String(apiField(route, 'maTu', 'MaTu') || '').trim()));
    const routeIds = new Set(areaRoutes.map(route => String(apiField(route, 'maTuyen', 'MaTuyen') || '').trim()));
    const areaLights = lights.filter(light => routeIds.has(String(apiField(light, 'maTuyen', 'MaTuyen') || '').trim()));
    const activeLights = areaLights.filter(light => Number(apiField(light, 'trangThaiHoatDong', 'TrangThaiHoatDong')) === 1).length;
    const onlineCabinets = cabinets.filter(cabinet => Boolean(apiField(cabinet, 'trangThaiKetNoi', 'TrangThaiKetNoi'))).length;
    const activeRoutes = areaRoutes.filter(route => Number(apiField(route, 'trangThaiHoatDong', 'TrangThaiHoatDong')) === 1).length;
    const lightRate = areaLights.length ? Number((activeLights * 100 / areaLights.length).toFixed(1)) : 0;

    document.title = `Chi tiết khu vực ${currentAreaId} - ${name} | SmartLight`;
    setText('areaDetailTitle', `Chi tiết khu vực chiếu sáng: ${currentAreaId} – ${name}`);
    setText('areaDetailBreadcrumb', `Chi tiết khu vực ${currentAreaId}`);
    setText('areaDetailSummary', `${name} • ${cabinets.length} tủ điều khiển, ${areaLights.length} điểm đèn trong Backend.`);

    // KPI cards
    setText('areaStatCabinets', formatNumber(cabinets.length));
    setText('areaStatCabinetsOnline', formatNumber(onlineCabinets));
    setText('areaStatCabinetsOffline', formatNumber(cabinets.length - onlineCabinets));
    setText('areaStatRoutes', formatNumber(areaRoutes.length));
    setText('areaStatRoutesActive', formatNumber(activeRoutes));
    setText('areaStatRoutesInactive', formatNumber(areaRoutes.length - activeRoutes));
    setText('areaStatLamps', formatNumber(areaLights.length));
    setText('areaStatLightRate', `${lightRate}%`);
    setText('areaStatLightRateCount', `(${formatNumber(activeLights)}/${formatNumber(areaLights.length)})`);

    // Tiêu thụ điện năng từ dữ liệu giám sát tủ
    let energyKwh = 0;
    await Promise.all(cabinets.map(async cabinet => {
      const cabinetId = String(apiField(cabinet, 'maTu', 'MaTu') || '').trim();
      try {
        const readings = await window.api.get('/DuLieuGiamSatTu', { maTu: cabinetId, limit: 1 });
        const latest = Array.isArray(readings) ? readings[0] : null;
        const value = Number(apiField(latest, 'dienNang', 'DienNang'));
        if (Number.isFinite(value)) energyKwh += value;
      } catch (error) {
        console.warn(`Không tải được dữ liệu giám sát tủ ${cabinetId}.`, error);
      }
    }));
    setText('areaStatEnergy', energyKwh ? formatNumber(Number(energyKwh.toFixed(2))) : '—');

    // Danh sách tủ trong bản đồ phân vùng
    const cabinetById = new Map(cabinets.map(cabinet => [
      String(apiField(cabinet, 'maTu', 'MaTu') || '').trim(),
      cabinet
    ]));
    renderAreaRoutes(areaRoutes, lights, cabinetById);
  } catch (error) {
    console.warn(`Không tải được dữ liệu khu vực ${currentAreaId} từ API.`, error);
    showToast('Không tải được dữ liệu khu vực từ Backend; đang giữ thông tin mô phỏng.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Modal Add Cabinet
  const modalCabinet = document.getElementById('modalAddCabinetToArea');
  document.getElementById('btnAddCabinet')?.addEventListener('click', () => {
    setText('addCabinetAreaTitle', `Thêm tủ điều khiển vào ${currentAreaId}`);
    modalCabinet?.classList.remove('hidden');
    modalCabinet?.classList.add('flex');
  });

  ['btnCloseCabinetModal', 'btnCancelCabinetModal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      modalCabinet?.classList.add('hidden');
      modalCabinet?.classList.remove('flex');
    });
  });

  document.getElementById('formAddCabinet')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('newCabinetCode')?.value.trim() || '';
    const address = document.getElementById('newCabinetAddress')?.value.trim() || '';
    const name = document.getElementById('newCabinetName')?.value.trim() || '';
    const network = document.getElementById('newCabinetNetwork')?.value || '';

    if (!code || !address || !name) {
      showToast('Vui lòng nhập đầy đủ mã tủ, tên tủ và vị trí lắp đặt.', 'error');
      return;
    }

    if (!window.api) {
      showToast('Chưa nạp API client; không thể lưu tủ lên Backend.', 'error');
      return;
    }

    const submitButton = e.currentTarget.querySelector('button[type="submit"]');
    const previousLabel = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Đang lưu...';
    }

    try {
      await window.api.post('/TuChieuSang', {
        maTu: code,
        tenTu: name,
        diaChi: address,
        maKhuVuc: currentAreaId,
        trangThaiKetNoi: false,
        // DB chỉ chấp nhận trangThaiNguon ∈ {UNKNOWN, ON, OFF}
        trangThaiNguon: 'UNKNOWN',
        cheDoVanHanh: 0,
        moTa: network || null
      });
      showToast(`Đã thêm tủ ${code} vào khu vực ${currentAreaId} trên Backend.`);
      modalCabinet?.classList.add('hidden');
      modalCabinet?.classList.remove('flex');
      e.currentTarget.reset();
      await loadAreaDetails();
    } catch (error) {
      console.warn('Không tạo được tủ trên Backend.', error);
      showToast(error.message || 'Không tạo được tủ trên Backend.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = previousLabel;
      }
    }
  });

  // Action button triggers
  document.getElementById('btnFieldMap')?.addEventListener('click', () => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = `map.html?area=${encodeURIComponent(params.get('id') || 'KV-01')}`;
  });

  document.getElementById('btnExportReport')?.addEventListener('click', () => {
    const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [...document.querySelectorAll('.page-content table')].flatMap(table =>
      [...table.rows].map(row => [...row.cells].map(cell => quote(cell.textContent.trim())).join(','))
    );
    if (!rows.length) {
      showToast('Không có dữ liệu bảng để xuất.', 'error');
      return;
    }
    const link = document.createElement('a');
    const url = URL.createObjectURL(new Blob(['\uFEFF', rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    link.href = url;
    link.download = `bao-cao-khu-vuc-${currentAreaId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải báo cáo khu vực dạng CSV.');
  });

  document.getElementById('btnEditArea')?.addEventListener('click', () => {
    window.location.href = `areas.html?edit=${encodeURIComponent(currentAreaId)}`;
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

  setInterval(updateClock, 1000);
  updateClock();
  loadAreaDetails();
});
