/**
 * SmartLight Municipal IoT - Routes Management Logic (routes.html)
 * Nguồn dữ liệu: API /TuyenChieuSang, /TuChieuSang, /KhuVuc, /DiemDen
 */

// 1. Live Clock Sync matching system
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function getRouteSearchInput() {
  return document.getElementById('globalSearchInput')
    || document.getElementById('topSearchInput')
    || document.querySelector('.search-box input');
}

function findRouteRow(id) {
  return [...document.querySelectorAll('#routesTableBody tr[data-id]')]
    .find(row => row.dataset.id === id);
}

function apiValue(record, camelName, pascalName) {
  return record?.[camelName] ?? record?.[pascalName];
}

// Danh sách tuyến đang hiển thị (đã chuẩn hoá từ API)
let routesData = [];
// Tra cứu nhanh: mã tuyến -> bản ghi chuẩn hoá
const routeLookup = new Map();

function statusLabel(rawStatus) {
  const value = Number(rawStatus);
  if (value === 1) return 'Hoạt động';
  if (value === 0) return 'Ngừng hoạt động';
  return 'Chưa xác định';
}

function statusPillHtml(status) {
  if (status === 'Hoạt động') {
    return `
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border" style="background-color: rgb(232, 240, 254); color: rgb(26, 115, 232); border-color: rgb(194, 218, 248);">
        <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(26, 115, 232);"></span>
        Hoạt động
      </span>
    `;
  }
  if (status === 'Ngừng hoạt động') {
    return `
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
        Ngừng hoạt động
      </span>
    `;
  }
  return `
    <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
      Chưa xác định
    </span>
  `;
}

function populateFilterOptions(areas, cabinets) {
  const areaSelect = document.getElementById('filterArea');
  if (areaSelect) {
    areaSelect.replaceChildren();
    const allAreas = document.createElement('option');
    allAreas.value = '';
    allAreas.textContent = 'Tất cả khu vực';
    areaSelect.appendChild(allAreas);
    areas.forEach(area => {
      const id = String(apiValue(area, 'maKhuVuc', 'MaKhuVuc') || '').trim();
      const name = String(apiValue(area, 'tenPhuongXa', 'TenPhuongXa') || '').trim();
      if (!id || !name) return;
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      areaSelect.appendChild(option);
    });
  }

  const cabinetSelect = document.getElementById('filterCabinet');
  if (cabinetSelect) {
    cabinetSelect.replaceChildren();
    const allCabinets = document.createElement('option');
    allCabinets.value = '';
    allCabinets.textContent = 'Tất cả tủ chiếu sáng';
    cabinetSelect.appendChild(allCabinets);
    cabinets.forEach(cabinet => {
      const id = String(apiValue(cabinet, 'maTu', 'MaTu') || '').trim();
      const name = String(apiValue(cabinet, 'tenTu', 'TenTu') || '').trim();
      if (!id) return;
      const option = document.createElement('option');
      option.value = name || id;
      option.textContent = name || id;
      cabinetSelect.appendChild(option);
    });
  }
  const statusSelect = document.getElementById('filterStatus');
  if (statusSelect) {
    const currentValue = statusSelect.value;
    statusSelect.replaceChildren();
    const allStatuses = document.createElement('option');
    allStatuses.value = '';
    allStatuses.textContent = 'Tất cả trạng thái';
    statusSelect.appendChild(allStatuses);
    [
      { value: 'Hoạt động', label: 'Hoạt động ổn định' },
      { value: 'Ngừng hoạt động', label: 'Ngừng hoạt động' }
    ].forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      statusSelect.appendChild(option);
    });
    statusSelect.value = currentValue;
  }
}

function renderApiRoutes(apiRoutes, cabinets, areas, lights) {
  const tbody = document.getElementById('routesTableBody');
  if (!tbody) return;

  const areaNames = new Map(areas.map(area => [
    String(apiValue(area, 'maKhuVuc', 'MaKhuVuc') || '').trim(),
    String(apiValue(area, 'tenPhuongXa', 'TenPhuongXa') || '').trim()
  ]));
  const cabinetById = new Map(cabinets.map(cabinet => [
    String(apiValue(cabinet, 'maTu', 'MaTu') || '').trim(),
    cabinet
  ]));

  routeLookup.clear();
  routesData = apiRoutes.map(route => {
    const id = String(apiValue(route, 'maTuyen', 'MaTuyen') || '').trim();
    const cabinetId = String(apiValue(route, 'maTu', 'MaTu') || '').trim();
    const cabinet = cabinetById.get(cabinetId);
    const areaId = String(apiValue(cabinet, 'maKhuVuc', 'MaKhuVuc') || '').trim();
    const routeLights = lights.filter(light =>
      String(apiValue(light, 'maTuyen', 'MaTuyen') || '').trim() === id
    );
    const activeLights = routeLights.filter(light =>
      Number(apiValue(light, 'trangThaiHoatDong', 'TrangThaiHoatDong')) === 1
    ).length;
    const rate = routeLights.length
      ? Number((activeLights * 100 / routeLights.length).toFixed(1))
      : 0;
    const rawLength = apiValue(route, 'chieuDai', 'ChieuDai');
    const length = rawLength === null || rawLength === undefined ? NaN : Number(rawLength);

    const record = {
      id,
      raw: route,
      name: String(apiValue(route, 'tenTuyen', 'TenTuyen') || id),
      cabinetId,
      cabinetName: String(apiValue(cabinet, 'tenTu', 'TenTu') || cabinetId || '—'),
      areaId,
      areaName: areaNames.get(areaId) || areaId || '—',
      length: Number.isFinite(length) ? length : null,
      lights: routeLights.length,
      rate,
      status: statusLabel(apiValue(route, 'trangThaiHoatDong', 'TrangThaiHoatDong'))
    };
    routeLookup.set(id, record);
    return record;
  });

  tbody.replaceChildren();
  routesData.forEach(record => {
    const lengthText = record.length !== null ? `${(record.length / 1000).toFixed(2)} km` : '—';
    const row = document.createElement('tr');
    row.className = 'route-row hover:bg-slate-50/80 transition-colors';
    row.dataset.id = record.id;
    row.innerHTML = `
      <td class="py-3.5 px-4 text-center"><input class="row-checkbox rounded border-slate-300 text-brand focus:ring-brand/30 cursor-pointer" type="checkbox" value="${escapeHtml(record.id)}"></td>
      <td class="py-3.5 px-3 font-semibold text-slate-800"><a href="route-detail.html?id=${encodeURIComponent(record.id)}" class="hover:text-primary font-bold">${escapeHtml(record.id)}</a></td>
      <td class="py-3.5 px-4 font-semibold text-slate-800"><a href="route-detail.html?id=${encodeURIComponent(record.id)}" class="hover:text-primary hover:underline">${escapeHtml(record.name)}</a></td>
      <td class="py-3.5 px-3 text-slate-600 font-semibold">${escapeHtml(record.cabinetName)}</td>
      <td class="py-3.5 px-4 text-slate-600">${escapeHtml(record.areaName)}</td>
      <td class="py-3.5 px-3 text-right">${escapeHtml(lengthText)}</td>
      <td class="py-3.5 px-3 text-right">${record.lights}</td>
      <td class="py-3.5 px-6"><div class="flex items-center gap-3"><span class="font-bold text-slate-800 text-[11px] w-9 text-right">${record.rate}%</span><div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden"><div class="bg-primary h-1.5 rounded-full" style="width:${record.rate}%"></div></div></div></td>
      <td class="py-3.5 px-4 text-center">${statusPillHtml(record.status)}</td>
      <td class="py-3.5 px-4 text-center"><div class="flex items-center justify-center gap-1.5"><a href="route-detail.html?id=${encodeURIComponent(record.id)}" class="p-1.5 text-slate-400 hover:text-primary rounded-lg" aria-label="Xem ${escapeHtml(record.id)}"><i class="fa-regular fa-eye"></i></a><button type="button" data-route-action="edit" data-route-id="${escapeHtml(record.id)}" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg" aria-label="Chỉnh sửa ${escapeHtml(record.id)}"><i class="fa-regular fa-pen-to-square"></i></button><button type="button" data-route-action="menu" data-route-id="${escapeHtml(record.id)}" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg" aria-label="Tác vụ ${escapeHtml(record.id)}"><i class="fa-solid fa-ellipsis-vertical"></i></button></div></td>
    `;
    tbody.appendChild(row);
  });

  updateTotalCount();
  const display = document.getElementById('pageRangeDisplay');
  if (display) display.textContent = routesData.length ? `1 - ${routesData.length}` : '0 - 0';
  const stableKpi = document.getElementById('kpiStableRoutes');
  const issueKpi = document.getElementById('kpiIssueRoutes');
  const maintenanceKpi = document.getElementById('kpiMaintRoutes');
  if (stableKpi) stableKpi.textContent = String(routesData.filter(route => route.status === 'Hoạt động').length);
  if (issueKpi) issueKpi.textContent = '—';
  if (maintenanceKpi) maintenanceKpi.textContent = String(routesData.filter(route => route.status === 'Ngừng hoạt động').length);
}

async function loadRoutesFromApi() {
  if (!window.api) return;
  try {
    const [routes, cabinets, areas, lights] = await Promise.all([
      window.api.get('/TuyenChieuSang'),
      window.api.get('/TuChieuSang'),
      window.api.get('/KhuVuc'),
      window.api.get('/DiemDen')
    ]);
    if (![routes, cabinets, areas, lights].every(Array.isArray)) {
      throw new TypeError('API hạ tầng phải trả về danh sách hợp lệ.');
    }
    if (!routes.length) {
      showToast('Backend chưa có tuyến; đang hiển thị danh sách demo.', 'warning');
      return;
    }
    populateFilterOptions(areas, cabinets);
    populateRouteFormSelects(cabinets, areas);
    renderApiRoutes(routes, cabinets, areas, lights);
  } catch (error) {
    console.warn('Không tải được tuyến từ API; giữ danh sách demo.', error);
    showToast('Không kết nối được Backend tuyến; đang hiển thị danh sách demo.', 'warning');
  }
}

function populateRouteFormSelects(cabinets, areas) {
  const newCabinet = document.getElementById('newRouteCabinet');
  if (newCabinet) {
    newCabinet.replaceChildren();
    cabinets.forEach(cabinet => {
      const id = String(apiValue(cabinet, 'maTu', 'MaTu') || '').trim();
      const name = String(apiValue(cabinet, 'tenTu', 'TenTu') || '').trim();
      if (!id) return;
      const option = document.createElement('option');
      option.value = id;
      option.textContent = name ? `${name} (${id})` : id;
      newCabinet.appendChild(option);
    });
  }

  const newArea = document.getElementById('newRouteArea');
  if (newArea) {
    newArea.replaceChildren();
    areas.forEach(area => {
      const id = String(apiValue(area, 'maKhuVuc', 'MaKhuVuc') || '').trim();
      const name = String(apiValue(area, 'tenPhuongXa', 'TenPhuongXa') || '').trim();
      if (!id || !name) return;
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      newArea.appendChild(option);
    });
  }

  const editCabinet = document.getElementById('editRouteCabinet');
  if (editCabinet) {
    editCabinet.replaceChildren();
    cabinets.forEach(cabinet => {
      const id = String(apiValue(cabinet, 'maTu', 'MaTu') || '').trim();
      const name = String(apiValue(cabinet, 'tenTu', 'TenTu') || '').trim();
      if (!id) return;
      const option = document.createElement('option');
      option.value = id;
      option.textContent = name ? `${name} (${id})` : id;
      editCabinet.appendChild(option);
    });
  }
}

// 3. Toast Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const isSuccess = type === 'success';
  const isWarning = type === 'warning';
  const iconClass = isSuccess ? 'fa-circle-check text-emerald-500' : (isWarning ? 'fa-triangle-exclamation text-amber-500' : 'fa-circle-info text-brand');
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

// Global functions for inline HTML calls
function closeAddModal() {
  const addRouteModal = document.getElementById('addRouteModal');
  if (addRouteModal) addRouteModal.classList.add('hidden');
  const form = document.getElementById('addRouteForm');
  if (form) form.reset();
}

function closeEditModal() {
  const editRouteModal = document.getElementById('editRouteModal');
  if (editRouteModal) editRouteModal.classList.add('hidden');
}

function openEditModal(code, name, cab, area, length, points, status) {
  const editRouteModal = document.getElementById('editRouteModal');
  if (!editRouteModal) return;
  document.getElementById('editRouteId').value = code;
  document.getElementById('editRouteCode').value = code;
  document.getElementById('editRouteName').value = name;
  document.getElementById('editRouteCabinet').value = cab;
  document.getElementById('editRouteArea').value = area;
  document.getElementById('editRouteLength').value = length;
  document.getElementById('editRoutePoints').value = points;
  document.getElementById('editRouteStatus').value = status === 'Hoạt động' ? '1' : '0';
  document.getElementById('editModalSub').textContent = `Mã tuyến: ${code}`;
  editRouteModal.classList.remove('hidden');
}

let activeMenuCode = null;
function toggleActionMenu(e, code) {
  e.stopPropagation();
  activeMenuCode = code;
  const rowActionMenu = document.getElementById('rowActionMenu');
  if (!rowActionMenu) return;
  document.getElementById('actionViewDetail').href = `route-detail.html?id=${encodeURIComponent(code)}`;

  const rect = e.currentTarget.getBoundingClientRect();
  rowActionMenu.style.top = `${rect.bottom + 6}px`;
  rowActionMenu.style.left = `${rect.left - 130}px`;
  rowActionMenu.classList.remove('hidden');
}

function updateTotalCount() {
  const rows = document.querySelectorAll('#routesTableBody tr').length;
  const badge = document.getElementById('routeCountBadge');
  if (badge) badge.textContent = `${rows} tuyến`;
  const kpi = document.getElementById('kpiTotalRoutes');
  if (kpi) kpi.textContent = rows < 10 ? '0' + rows : rows;
  const totalDisplay = document.getElementById('totalRoutesDisplay');
  if (totalDisplay) totalDisplay.textContent = rows;
}

async function handleCreateRoute(e) {
  e.preventDefault();
  const code = document.getElementById('newRouteCode').value.trim();
  if (findRouteRow(code)) {
    showToast(`Mã tuyến ${code} đã tồn tại trong danh sách.`, 'warning');
    return;
  }
  const name = document.getElementById('newRouteName').value.trim();
  const cabinetId = document.getElementById('newRouteCabinet').value;
  const lengthKm = parseFloat(document.getElementById('newRouteLength').value);
  const statusCode = Number(document.getElementById('newRouteStatus').value);

  if (!window.api) {
    showToast('Chưa nạp API client; không thể tạo tuyến trên Backend.', 'warning');
    return;
  }

  try {
    await window.api.post('/TuyenChieuSang', {
      maTuyen: code,
      tenTuyen: name,
      viTri: document.getElementById('newRouteArea')?.value || '',
      maTu: cabinetId,
      trangThaiHoatDong: statusCode,
      chieuDai: Number.isFinite(lengthKm) ? Math.round(lengthKm * 1000) : null
    });
    showToast(`Đã tạo tuyến ${name} (${code}) trên Backend.`);
    closeAddModal();
    await loadRoutesFromApi();
  } catch (error) {
    console.warn('Không tạo được tuyến trên Backend.', error);
    showToast(error.message || 'Không tạo được tuyến trên Backend.', 'warning');
  }
}

async function handleUpdateRoute(e) {
  e.preventDefault();
  const code = document.getElementById('editRouteCode').value;
  const name = document.getElementById('editRouteName').value.trim();
  const cabinetId = document.getElementById('editRouteCabinet').value;
  const area = document.getElementById('editRouteArea').value.trim();
  const lengthKm = parseFloat(document.getElementById('editRouteLength').value);
  const statusCode = Number(document.getElementById('editRouteStatus').value);

  if (!window.api) {
    showToast('Chưa nạp API client; không thể cập nhật tuyến trên Backend.', 'warning');
    return;
  }

  try {
    await window.api.put(`/TuyenChieuSang/${encodeURIComponent(code)}`, {
      maTuyen: code,
      tenTuyen: name,
      viTri: area,
      maTu: cabinetId,
      trangThaiHoatDong: statusCode,
      chieuDai: Number.isFinite(lengthKm) ? Math.round(lengthKm * 1000) : null
    });
    showToast(`Đã cập nhật tuyến ${name} (${code}) trên Backend.`);
    closeEditModal();
    await loadRoutesFromApi();
  } catch (error) {
    console.warn('Không cập nhật được tuyến trên Backend.', error);
    showToast(error.message || 'Không cập nhật được tuyến trên Backend.', 'warning');
  }
}

async function deleteRouteById(code) {
  if (!window.api) {
    const row = findRouteRow(code);
    row?.remove();
    updateTotalCount();
    showToast(`Đã xoá tuyến ${code} khỏi danh sách demo.`, 'warning');
    return;
  }
  try {
    await window.api.delete(`/TuyenChieuSang/${encodeURIComponent(code)}`);
    showToast(`Đã xoá tuyến ${code} trên Backend.`);
    await loadRoutesFromApi();
  } catch (error) {
    console.warn(`Không xoá được tuyến ${code}.`, error);
    showToast(error.message || `Không xoá được tuyến ${code} trên Backend.`, 'warning');
  }
}

async function setRouteStatus(code, statusCode) {
  const record = routeLookup.get(code);
  if (!record) return;
  try {
    if (window.api) {
      await window.api.put(`/TuyenChieuSang/${encodeURIComponent(code)}`, {
        maTuyen: code,
        tenTuyen: record.name,
        viTri: record.areaName,
        maTu: record.cabinetId,
        trangThaiHoatDong: statusCode,
        chieuDai: record.length
      });
    }
    const row = findRouteRow(code);
    if (row && row.children[8]) {
      row.children[8].innerHTML = statusPillHtml(statusLabel(statusCode));
    }
    record.status = statusLabel(statusCode);
    showToast(`Đã đổi trạng thái tuyến ${code} thành ${statusLabel(statusCode)}.`);
  } catch (error) {
    console.warn(`Không đổi được trạng thái tuyến ${code}.`, error);
    showToast(error.message || `Không đổi được trạng thái tuyến ${code}.`, 'warning');
  }
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

  // Selection & Checkbox handling
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  const selectedCountBadge = document.getElementById('selectedCountBadge');

  function updateSelectedCount() {
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
    const count = checkedBoxes.length;
    if (selectedCountBadge) {
      if (count > 0) {
        selectedCountBadge.classList.remove('hidden');
        selectedCountBadge.textContent = `Đã chọn ${count}`;
      } else {
        selectedCountBadge.classList.add('hidden');
      }
    }

    document.querySelectorAll('.route-row').forEach(row => {
      const cb = row.querySelector('.row-checkbox');
      if (cb && cb.checked) {
        row.style.borderLeft = '3px solid rgb(30, 78, 140)';
        row.style.backgroundColor = 'rgb(240, 246, 255)';
      } else {
        row.style.borderLeft = 'none';
        row.style.backgroundColor = '';
      }
    });
  }

  selectAllCheckbox?.addEventListener('change', (e) => {
    document.querySelectorAll('.row-checkbox').forEach(cb => {
      cb.checked = e.target.checked;
    });
    updateSelectedCount();
  });

  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('row-checkbox')) {
      const total = document.querySelectorAll('.row-checkbox').length;
      const checked = document.querySelectorAll('.row-checkbox:checked').length;
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = (total > 0 && total === checked);
      }
      updateSelectedCount();
    }
  });

  // Batch Operations
  document.getElementById('btnBatchActive')?.addEventListener('click', async () => {
    const checkedBoxes = [...document.querySelectorAll('.row-checkbox:checked')];
    if (checkedBoxes.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 tuyến để kích hoạt', 'warning');
      return;
    }
    for (const cb of checkedBoxes) {
      await setRouteStatus(cb.value, 1);
    }
  });

  document.getElementById('btnBatchInactive')?.addEventListener('click', async () => {
    const checkedBoxes = [...document.querySelectorAll('.row-checkbox:checked')];
    if (checkedBoxes.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 tuyến để ngừng hoạt động', 'warning');
      return;
    }
    for (const cb of checkedBoxes) {
      await setRouteStatus(cb.value, 0);
    }
  });

  document.getElementById('btnBatchDelete')?.addEventListener('click', async () => {
    const checkedBoxes = [...document.querySelectorAll('.row-checkbox:checked')];
    if (checkedBoxes.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 tuyến để xoá', 'warning');
      return;
    }
    if (!confirm(`Xoá ${checkedBoxes.length} tuyến khỏi hệ thống?`)) return;
    for (const cb of checkedBoxes) {
      await deleteRouteById(cb.value);
    }
    updateSelectedCount();
    updateTotalCount();
  });

  // Filter & Search handling
  function applyFilters() {
    const searchInput = getRouteSearchInput();
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const area = document.getElementById('filterArea')?.value;
    const cabinet = document.getElementById('filterCabinet')?.value;
    const status = document.getElementById('filterStatus')?.value;

    let visibleCount = 0;
    document.querySelectorAll('#routesTableBody tr').forEach(row => {
      const code = row.children[1].textContent.toLowerCase();
      const name = row.children[2].textContent.toLowerCase();
      const cab = row.children[3].textContent.trim();
      const ar = row.children[4].textContent.trim();
      const st = row.children[8].textContent.trim();

      const matchKeyword = !keyword || code.includes(keyword) || name.includes(keyword) || ar.toLowerCase().includes(keyword);
      const matchArea = !area || ar.includes(area);
      const matchCabinet = !cabinet || cab.includes(cabinet);
      const matchStatus = !status || st.includes(status);

      if (matchKeyword && matchArea && matchCabinet && matchStatus) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    const display = document.getElementById('pageRangeDisplay');
    if (display) display.textContent = visibleCount > 0 ? `1 - ${visibleCount}` : '0 - 0';
    return visibleCount;
  }

  document.getElementById('btnApplyFilters')?.addEventListener('click', () => {
    showToast(`Tìm thấy ${applyFilters()} tuyến phù hợp`);
  });
  getRouteSearchInput()?.addEventListener('input', applyFilters);

  document.getElementById('btnResetFilters')?.addEventListener('click', () => {
    const searchInput = getRouteSearchInput();
    if (searchInput) searchInput.value = '';
    ['filterArea', 'filterCabinet', 'filterStatus'].forEach(id => {
      const filter = document.getElementById(id);
      if (filter) filter.value = '';
    });
    document.querySelectorAll('#routesTableBody tr').forEach(row => row.style.display = '');
    const rangeDisplay = document.getElementById('pageRangeDisplay');
    if (rangeDisplay) rangeDisplay.textContent = `1 - ${document.querySelectorAll('#routesTableBody tr').length}`;
    showToast('Đã làm mới bộ lọc', 'info');
  });

  // Ctrl+K Shortcut to focus search
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      getRouteSearchInput()?.focus();
    }
  });

  // Add Route Modal Trigger
  const addRouteModal = document.getElementById('addRouteModal');
  document.getElementById('btnOpenAddModal')?.addEventListener('click', () => {
    addRouteModal?.classList.remove('hidden');
    document.getElementById('newRouteCode')?.focus();
  });

  // Row Action Menu Click Outside
  const rowActionMenu = document.getElementById('rowActionMenu');
  document.getElementById('routesTableBody')?.addEventListener('click', event => {
    const actionButton = event.target.closest('[data-route-action]');
    if (!actionButton) return;
    const { routeAction, routeId } = actionButton.dataset;
    const row = findRouteRow(routeId);
    if (!row) return;

    if (routeAction === 'menu') {
      toggleActionMenu(event, routeId);
      return;
    }

    if (routeAction === 'edit') {
      const record = routeLookup.get(routeId);
      openEditModal(
        routeId,
        row.children[2].textContent.trim(),
        record?.cabinetId || row.children[3].textContent.trim(),
        record?.areaName || row.children[4].textContent.trim(),
        record?.length !== null && record?.length !== undefined
          ? (record.length / 1000).toFixed(2)
          : row.children[5].textContent.replace(' km', '').trim(),
        row.children[6].textContent.trim(),
        row.children[8].textContent.includes('Hoạt động') ? 'Hoạt động' : 'Ngừng hoạt động'
      );
    }
  });
  document.addEventListener('click', () => {
    rowActionMenu?.classList.add('hidden');
  });

  document.getElementById('actionQuickToggle')?.addEventListener('click', async () => {
    if (!activeMenuCode) return;
    const record = routeLookup.get(activeMenuCode);
    const nextStatus = record?.status === 'Hoạt động' ? 0 : 1;
    await setRouteStatus(activeMenuCode, nextStatus);
  });

  document.getElementById('actionEdit')?.addEventListener('click', () => {
    if (!activeMenuCode) return;
    const row = findRouteRow(activeMenuCode);
    if (!row) return;
    const record = routeLookup.get(activeMenuCode);
    openEditModal(
      activeMenuCode,
      row.children[2].textContent.trim(),
      record?.cabinetId || row.children[3].textContent.trim(),
      record?.areaName || row.children[4].textContent.trim(),
      record?.length !== null && record?.length !== undefined
        ? (record.length / 1000).toFixed(2)
        : row.children[5].textContent.replace(' km', '').trim(),
      row.children[6].textContent.trim(),
      row.children[8].textContent.includes('Hoạt động') ? 'Hoạt động' : 'Ngừng hoạt động'
    );
  });

  document.getElementById('actionDeleteSingle')?.addEventListener('click', async () => {
    if (!activeMenuCode) return;
    if (!confirm(`Bạn có chắc muốn xoá tuyến ${activeMenuCode}?`)) return;
    await deleteRouteById(activeMenuCode);
  });

  // Excel & Print Toolbar
  document.getElementById('btnExportExcel')?.addEventListener('click', () => {
    const rows = [...document.querySelectorAll('#routesTableBody tr')]
      .filter(row => row.style.display !== 'none')
      .map(row => [...row.cells].slice(1, 9).map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`));
    const csv = ['Mã tuyến,Tên tuyến,Tủ,Khu vực,Chiều dài,Số điểm,Tỷ lệ hoạt động,Trạng thái', ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'danh-sach-tuyen-chieu-sang.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Đã tải danh sách tuyến CSV.');
  });

  document.getElementById('btnPrintList')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btnColumnSettings')?.addEventListener('click', () => {
    const table = document.querySelector('#routesTableBody')?.closest('table');
    if (!table) return;
    const columns = [...table.querySelectorAll('thead th')];
    const hiddenColumns = columns.filter(column => column.hidden).length;
    columns.forEach((column, index) => {
      const hideColumn = hiddenColumns === 0 && index === columns.length - 1;
      column.hidden = hideColumn;
      table.querySelectorAll('tbody tr').forEach(row => {
        if (row.cells[index]) row.cells[index].hidden = hideColumn;
      });
    });
    showToast(hiddenColumns === 0 ? 'Đã ẩn cột thao tác.' : 'Đã hiện lại cột thao tác.', 'info');
  });

  loadRoutesFromApi();
});
