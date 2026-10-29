/**
 * SmartLight Municipal IoT - Area Detail Logic (area-detail.html)
 */

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

async function loadAreaDetails() {
  const areaId = new URLSearchParams(window.location.search).get('id') || 'KV-01';
  try {
    const [area, cabinets, routes, lights] = await Promise.all([
      window.api.get(`/KhuVuc/${encodeURIComponent(areaId)}`),
      window.api.get('/TuChieuSang', { maKhuVuc: areaId }),
      window.api.get('/TuyenChieuSang'),
      window.api.get('/DiemDen')
    ]);
    if (!Array.isArray(cabinets) || !Array.isArray(routes) || !Array.isArray(lights)) {
      throw new TypeError('API hạ tầng phải trả về danh sách hợp lệ.');
    }

    const name = area.tenPhuongXa || area.TenPhuongXa || areaId;
    const cabinetIds = new Set(cabinets.map(cabinet => String(cabinet.maTu || cabinet.MaTu || '').trim()));
    const areaRoutes = routes.filter(route => cabinetIds.has(String(route.maTu || route.MaTu || '').trim()));
    const routeIds = new Set(areaRoutes.map(route => String(route.maTuyen || route.MaTuyen || '').trim()));
    const lampCount = lights.filter(light => routeIds.has(String(light.maTuyen || light.MaTuyen || '').trim())).length;

    document.title = `Chi tiết khu vực ${areaId} - ${name} | SmartLight`;
    const title = document.getElementById('areaDetailTitle');
    if (title) title.textContent = `Chi tiết khu vực chiếu sáng: ${areaId} – ${name}`;
    const breadcrumb = document.getElementById('areaDetailBreadcrumb');
    if (breadcrumb) breadcrumb.textContent = `Chi tiết khu vực ${areaId}`;
    const summary = document.getElementById('areaDetailSummary');
    if (summary) {
      summary.textContent = `${name} • ${cabinets.length} tủ điều khiển, ${lampCount} điểm đèn trong Backend.`;
    }
  } catch (error) {
    console.warn(`Không tải được dữ liệu khu vực ${areaId} từ API.`, error);
    showToast('Không tải được dữ liệu khu vực từ Backend; đang giữ thông tin mô phỏng.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Modal Add Cabinet
  const modalCabinet = document.getElementById('modalAddCabinetToArea');
  document.getElementById('btnAddCabinet')?.addEventListener('click', () => {
    modalCabinet?.classList.remove('hidden');
    modalCabinet?.classList.add('flex');
  });

  ['btnCloseCabinetModal', 'btnCancelCabinetModal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      modalCabinet?.classList.add('hidden');
      modalCabinet?.classList.remove('flex');
    });
  });

  document.getElementById('formAddCabinet')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Backend hiện chưa có API thêm tủ; chưa có thay đổi nào được lưu.', 'error');
  });

  // Action button triggers
  document.getElementById('btnFieldMap')?.addEventListener('click', () => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = `map.html?district=hai-chau&area=${encodeURIComponent(params.get('id') || 'KV-01')}`;
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
    link.download = 'bao-cao-khu-vuc.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải báo cáo khu vực dạng CSV.');
  });

  document.getElementById('btnEditArea')?.addEventListener('click', () => {
    const areaId = new URLSearchParams(window.location.search).get('id') || 'KV-01';
    window.location.href = `areas.html?edit=${encodeURIComponent(areaId)}`;
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
