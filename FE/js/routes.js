/**
 * SmartLight Municipal IoT - Routes Management Logic (routes.html)
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

  tbody.replaceChildren();
  apiRoutes.forEach(route => {
    const id = String(apiValue(route, 'maTuyen', 'MaTuyen') || '').trim();
    const cabinetId = String(apiValue(route, 'maTu', 'MaTu') || '').trim();
    const cabinet = cabinetById.get(cabinetId);
    const areaId = String(apiValue(cabinet, 'maKhuVuc', 'MaKhuVuc') || '').trim();
    const routeLights = lights.filter(light =>
      String(apiValue(light, 'maTuyen', 'MaTuyen') || '').trim() === id
    );
    const rawStatus = apiValue(route, 'trangThaiHoatDong', 'TrangThaiHoatDong');
    const status = Number(rawStatus) === 1
      ? 'Hoạt động'
      : Number(rawStatus) === 0
        ? 'Ngừng hoạt động'
        : 'Chưa xác định';
    const statusClass = status === 'Hoạt động'
      ? 'bg-sky-50 text-brand-600 border-sky-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';
    const rawLength = apiValue(route, 'chieuDai', 'ChieuDai');
    const length = rawLength === null || rawLength === undefined ? NaN : Number(rawLength);
    const lengthText = Number.isFinite(length) ? `${(length / 1000).toFixed(2)} km` : '—';
    const row = document.createElement('tr');
    row.className = 'route-row hover:bg-slate-50/80 transition-colors';
    row.dataset.id = id;
    row.innerHTML = `
      <td class="py-3.5 px-4 text-center"><input class="row-checkbox rounded border-slate-300 text-brand focus:ring-brand/30 cursor-pointer" type="checkbox" value="${escapeHtml(id)}"></td>
      <td class="py-3.5 px-3 font-semibold text-slate-800"><a href="route-detail.html?id=${encodeURIComponent(id)}" class="hover:text-primary font-bold">${escapeHtml(id)}</a></td>
      <td class="py-3.5 px-4 font-semibold text-slate-800"><a href="route-detail.html?id=${encodeURIComponent(id)}" class="hover:text-primary hover:underline">${escapeHtml(apiValue(route, 'tenTuyen', 'TenTuyen') || id)}</a></td>
      <td class="py-3.5 px-3 text-slate-600 font-semibold">${escapeHtml(apiValue(cabinet, 'tenTu', 'TenTu') || cabinetId || '—')}</td>
      <td class="py-3.5 px-4 text-slate-600">${escapeHtml(areaNames.get(areaId) || areaId || '—')}</td>
      <td class="py-3.5 px-3 text-right">${escapeHtml(lengthText)}</td>
      <td class="py-3.5 px-3 text-right">${routeLights.length}</td>
      <td class="py-3.5 px-6"><div class="flex items-center gap-3"><span class="font-bold text-slate-800 text-[11px] w-9 text-right">${routeLights.length ? '—' : '0%'}</span><div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden"><div class="bg-primary h-1.5 rounded-full" style="width:${routeLights.length ? 0 : 0}%"></div></div></div></td>
      <td class="py-3.5 px-4 text-center"><span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border ${statusClass}">${escapeHtml(status)}</span></td>
      <td class="py-3.5 px-4 text-center"><div class="flex items-center justify-center gap-1.5"><a href="route-detail.html?id=${encodeURIComponent(id)}" class="p-1.5 text-slate-400 hover:text-primary rounded-lg" aria-label="Xem ${escapeHtml(id)}"><i class="fa-regular fa-eye"></i></a><button type="button" data-route-action="edit" data-route-id="${escapeHtml(id)}" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg" aria-label="Chỉnh sửa ${escapeHtml(id)}"><i class="fa-regular fa-pen-to-square"></i></button><button type="button" data-route-action="menu" data-route-id="${escapeHtml(id)}" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg" aria-label="Tác vụ ${escapeHtml(id)}"><i class="fa-solid fa-ellipsis-vertical"></i></button></div></td>
    `;
    tbody.appendChild(row);
  });

  updateTotalCount();
  const display = document.getElementById('pageRangeDisplay');
  if (display) display.textContent = apiRoutes.length ? `1 - ${apiRoutes.length}` : '0 - 0';
  const activeCount = apiRoutes.filter(route =>
    Number(apiValue(route, 'trangThaiHoatDong', 'TrangThaiHoatDong')) === 1
  ).length;
  const stableKpi = document.getElementById('kpiStableRoutes');
  const issueKpi = document.getElementById('kpiIssueRoutes');
  const maintenanceKpi = document.getElementById('kpiMaintRoutes');
  if (stableKpi) stableKpi.textContent = String(activeCount);
  if (issueKpi) issueKpi.textContent = '—';
  if (maintenanceKpi) maintenanceKpi.textContent = '—';
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
    renderApiRoutes(routes, cabinets, areas, lights);
  } catch (error) {
    console.warn('Không tải được tuyến từ API; giữ danh sách demo.', error);
    showToast('Không kết nối được Backend tuyến; đang hiển thị danh sách demo.', 'warning');
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
  document.getElementById('editRouteStatus').value = status;
  document.getElementById('editModalSub').textContent = `Mã tuyến: ${code}`;
  editRouteModal.classList.remove('hidden');
}

let activeMenuCode = null;
function toggleActionMenu(e, code) {
  e.stopPropagation();
  activeMenuCode = code;
  const rowActionMenu = document.getElementById('rowActionMenu');
  if (!rowActionMenu) return;
  document.getElementById('actionViewDetail').href = `route-detail.html?id=${code}`;

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

function handleCreateRoute(e) {
  e.preventDefault();
  const code = document.getElementById('newRouteCode').value.trim();
  if (findRouteRow(code)) {
    showToast(`Mã tuyến ${code} đã tồn tại trong danh sách.`, 'warning');
    return;
  }
  const name = document.getElementById('newRouteName').value.trim();
  const cab = document.getElementById('newRouteCabinet').value;
  const area = document.getElementById('newRouteArea').value;
  const length = parseFloat(document.getElementById('newRouteLength').value).toFixed(1);
  const points = parseInt(document.getElementById('newRoutePoints').value);
  const status = document.getElementById('newRouteStatus').value;

  let statusPill = '';
  if (status === 'Hoạt động') {
    statusPill = `
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border" style="background-color: rgb(232, 240, 254); color: rgb(26, 115, 232); border-color: rgb(194, 218, 248);">
        <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(26, 115, 232);"></span>
        Hoạt động
      </span>
    `;
  } else if (status === 'Bảo trì') {
    statusPill = `
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        Bảo trì
      </span>
    `;
  } else {
    statusPill = `
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
        Sự cố
      </span>
    `;
  }

  const tr = document.createElement('tr');
  tr.className = 'route-row hover:bg-slate-50/80 transition-colors';
  tr.dataset.id = code;
  tr.innerHTML = `
    <td class="py-3.5 px-4 text-center">
      <input class="row-checkbox rounded border-slate-300 text-brand focus:ring-brand/30 cursor-pointer" type="checkbox" value="${escapeHtml(code)}">
    </td>
    <td class="py-3.5 px-3 font-semibold text-slate-800">
      <a href="route-detail.html?id=${encodeURIComponent(code)}" class="hover:text-primary font-bold">${escapeHtml(code)}</a>
    </td>
    <td class="py-3.5 px-4 font-semibold text-slate-800">
      <a href="route-detail.html?id=${encodeURIComponent(code)}" class="hover:text-primary hover:underline">${escapeHtml(name)}</a>
    </td>
    <td class="py-3.5 px-3 text-slate-600 font-semibold">${escapeHtml(cab)}</td>
    <td class="py-3.5 px-4 text-slate-600">${escapeHtml(area)}</td>
    <td class="py-3.5 px-3 text-right">${length} km</td>
    <td class="py-3.5 px-3 text-right">${points}</td>
    <td class="py-3.5 px-6">
      <div class="flex items-center gap-3">
        <span class="font-bold text-slate-800 text-[11px] w-9 text-right">100%</span>
        <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div class="bg-primary h-1.5 rounded-full" style="width: 100%"></div>
        </div>
      </div>
    </td>
    <td class="py-3.5 px-4 text-center">${statusPill}</td>
    <td class="py-3.5 px-4 text-center">
      <div class="flex items-center justify-center gap-1.5">
        <a href="route-detail.html?id=${code}" class="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors"><i class="fa-regular fa-eye"></i></a>
        <button type="button" data-route-action="edit" data-route-id="${escapeHtml(code)}" aria-label="Chỉnh sửa tuyến ${escapeHtml(code)}" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><i class="fa-regular fa-pen-to-square"></i></button>
        <button type="button" data-route-action="menu" data-route-id="${escapeHtml(code)}" aria-label="Tác vụ tuyến ${escapeHtml(code)}" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><i class="fa-solid fa-ellipsis-vertical"></i></button>
      </div>
    </td>
  `;

  document.getElementById('routesTableBody')?.prepend(tr);
  closeAddModal();
  updateTotalCount();
  showToast(`Đã thêm tuyến ${name} (${code}) vào danh sách demo; chưa lưu lên Backend.`, 'warning');
}

function handleUpdateRoute(e) {
  e.preventDefault();
  const code = document.getElementById('editRouteCode').value;
  const name = document.getElementById('editRouteName').value;
  const cab = document.getElementById('editRouteCabinet').value;
  const area = document.getElementById('editRouteArea').value;
  const length = document.getElementById('editRouteLength').value;
  const points = document.getElementById('editRoutePoints').value;
  const status = document.getElementById('editRouteStatus').value;

  const row = findRouteRow(code);
  if (row) {
    row.children[2].querySelector('a').textContent = name;
    row.children[3].textContent = cab;
    row.children[4].textContent = area;
    row.children[5].textContent = `${length} km`;
    row.children[6].textContent = points;

    let statusPill = '';
    if (status === 'Hoạt động') {
      statusPill = `
        <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border" style="background-color: rgb(232, 240, 254); color: rgb(26, 115, 232); border-color: rgb(194, 218, 248);">
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(26, 115, 232);"></span>
          Hoạt động
        </span>
      `;
    } else if (status === 'Bảo trì') {
      statusPill = `
        <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Bảo trì
        </span>
      `;
    } else {
      statusPill = `
        <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
          Sự cố
        </span>
      `;
    }
    row.children[8].innerHTML = statusPill;
  }

  closeEditModal();
  showToast(`Đã cập nhật tuyến ${name} trong danh sách demo; chưa lưu lên Backend.`, 'warning');
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

    // Update Row Highlight Styling
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
  document.getElementById('btnBatchActive')?.addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkedBoxes.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 tuyến để kích hoạt', 'warning');
      return;
    }
    checkedBoxes.forEach(cb => {
      const row = cb.closest('tr');
      const statusCell = row.children[8];
      statusCell.innerHTML = `
        <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border" style="background-color: rgb(232, 240, 254); color: rgb(26, 115, 232); border-color: rgb(194, 218, 248);">
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(26, 115, 232);"></span>
          Hoạt động
        </span>
      `;
    });
    showToast(`Đã đổi trạng thái ${checkedBoxes.length} tuyến trong danh sách demo; chưa cập nhật Backend.`, 'warning');
  });

  document.getElementById('btnBatchInactive')?.addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkedBoxes.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 tuyến để ngừng hoạt động', 'warning');
      return;
    }
    checkedBoxes.forEach(cb => {
      const row = cb.closest('tr');
      const statusCell = row.children[8];
      statusCell.innerHTML = `
        <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
          Ngừng hoạt động
        </span>
      `;
    });
    showToast(`Đã đổi trạng thái ${checkedBoxes.length} tuyến trong danh sách demo; chưa cập nhật Backend.`, 'warning');
  });

  document.getElementById('btnBatchDelete')?.addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkedBoxes.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 tuyến để xoá', 'warning');
      return;
    }
    if (confirm(`Xoá ${checkedBoxes.length} tuyến khỏi danh sách demo? Backend sẽ không bị thay đổi.`)) {
      checkedBoxes.forEach(cb => {
        const row = cb.closest('tr');
        row.remove();
      });
      updateSelectedCount();
      updateTotalCount();
      showToast(`Đã xoá ${checkedBoxes.length} tuyến khỏi danh sách demo; Backend không bị thay đổi.`, 'warning');
    }
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
      const matchCab = !cabinet || cab.includes(cabinet);
      const matchStatus = !status || st.includes(status);

      if (matchKeyword && matchArea && matchCab && matchStatus) {
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
      openEditModal(
        routeId,
        row.children[2].textContent.trim(),
        row.children[3].textContent.trim(),
        row.children[4].textContent.trim(),
        row.children[5].textContent.replace(' km', '').trim(),
        row.children[6].textContent.trim(),
        row.children[8].textContent.trim()
      );
    }
  });
  document.addEventListener('click', () => {
    rowActionMenu?.classList.add('hidden');
  });

  document.getElementById('actionQuickToggle')?.addEventListener('click', () => {
    if (activeMenuCode) {
      const row = findRouteRow(activeMenuCode);
      const statusCell = row?.children[8];
      if (!statusCell) return;
      const isActive = statusCell.textContent.includes('Hoạt động');
      statusCell.innerHTML = isActive
        ? '<span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Ngừng hoạt động</span>'
        : '<span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border bg-sky-50 text-brand-600 border-sky-200">Hoạt động</span>';
      showToast(`Đã đổi trạng thái tuyến ${activeMenuCode} trong bản demo.`, 'info');
    }
  });

  document.getElementById('actionEdit')?.addEventListener('click', () => {
    if (activeMenuCode) {
      const row = findRouteRow(activeMenuCode);
      if (row) {
        const name = row.children[2].textContent.trim();
        const cab = row.children[3].textContent.trim();
        const area = row.children[4].textContent.trim();
        const length = row.children[5].textContent.replace(' km', '').trim();
        const points = row.children[6].textContent.trim();
        const status = row.children[8].textContent.trim();
        openEditModal(activeMenuCode, name, cab, area, length, points, status);
      }
    }
  });

  document.getElementById('actionDeleteSingle')?.addEventListener('click', () => {
    if (activeMenuCode && confirm(`Bạn có chắc muốn xoá tuyến ${activeMenuCode}?`)) {
      const row = findRouteRow(activeMenuCode);
      if (row) row.remove();
      updateTotalCount();
      showToast(`Đã xoá tuyến ${activeMenuCode} khỏi danh sách demo; Backend không bị thay đổi.`, 'warning');
    }
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
