/**
 * SmartLight Municipal IoT - Routes Management Logic (routes.html)
 */

// 1. Live Clock Sync matching system
function updateLiveClock() {
  const now = new Date();
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayStr = days[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  
  const clockEl = document.getElementById('liveClockDisplay');
  if (clockEl) {
    clockEl.textContent = `${dayStr}, ${dateStr}`;
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
}

function handleCreateRoute(e) {
  e.preventDefault();
  const code = document.getElementById('newRouteCode').value.trim();
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
      <input class="row-checkbox rounded border-slate-300 text-brand focus:ring-brand/30 cursor-pointer" type="checkbox" value="${code}">
    </td>
    <td class="py-3.5 px-3 font-semibold text-slate-800">
      <a href="route-detail.html?id=${code}" class="hover:text-primary font-bold">${code}</a>
    </td>
    <td class="py-3.5 px-4 font-semibold text-slate-800">
      <a href="route-detail.html?id=${code}" class="hover:text-primary hover:underline">${name}</a>
    </td>
    <td class="py-3.5 px-3 text-slate-600 font-semibold">${cab}</td>
    <td class="py-3.5 px-4 text-slate-600">${area}</td>
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
        <button onclick="openEditModal('${code}', '${name}', '${cab}', '${area}', '${length}', '${points}', '${status}')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><i class="fa-regular fa-pen-to-square"></i></button>
        <button onclick="toggleActionMenu(event, '${code}')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><i class="fa-solid fa-ellipsis-vertical"></i></button>
      </div>
    </td>
  `;

  document.getElementById('routesTableBody')?.prepend(tr);
  closeAddModal();
  updateTotalCount();
  showToast(`Đã thêm tuyến ${name} (${code}) thành công!`);
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

  const row = document.querySelector(`tr[data-id="${code}"]`);
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
  showToast(`Đã cập nhật thông tin tuyến ${name}`);
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
    showToast(`Đã chuyển ${checkedBoxes.length} tuyến sang trạng thái Hoạt động`);
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
    showToast(`Đã ngừng hoạt động ${checkedBoxes.length} tuyến`, 'info');
  });

  document.getElementById('btnBatchDelete')?.addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkedBoxes.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 tuyến để xoá', 'warning');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xoá ${checkedBoxes.length} tuyến đã chọn khỏi hệ thống không?`)) {
      checkedBoxes.forEach(cb => {
        const row = cb.closest('tr');
        row.remove();
      });
      updateSelectedCount();
      updateTotalCount();
      showToast(`Đã xoá ${checkedBoxes.length} tuyến thành công`);
    }
  });

  // Filter & Search handling
  function applyFilters() {
    const searchInput = document.getElementById('globalSearchInput');
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
    showToast(`Tìm thấy ${visibleCount} tuyến phù hợp`);
  }

  document.getElementById('btnApplyFilters')?.addEventListener('click', applyFilters);
  document.getElementById('globalSearchInput')?.addEventListener('input', applyFilters);

  document.getElementById('btnResetFilters')?.addEventListener('click', () => {
    document.getElementById('globalSearchInput').value = '';
    document.getElementById('filterArea').value = '';
    document.getElementById('filterCabinet').value = '';
    document.getElementById('filterStatus').value = '';
    document.querySelectorAll('#routesTableBody tr').forEach(row => row.style.display = '');
    document.getElementById('pageRangeDisplay').textContent = '1 - 10';
    showToast('Đã làm mới bộ lọc', 'info');
  });

  // Ctrl+K Shortcut to focus search
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('globalSearchInput')?.focus();
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
  document.addEventListener('click', () => {
    rowActionMenu?.classList.add('hidden');
  });

  document.getElementById('actionQuickToggle')?.addEventListener('click', () => {
    if (activeMenuCode) {
      showToast(`Đã gửi lệnh bật/tắt tới tuyến ${activeMenuCode}`);
    }
  });

  document.getElementById('actionEdit')?.addEventListener('click', () => {
    if (activeMenuCode) {
      const row = document.querySelector(`tr[data-id="${activeMenuCode}"]`);
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
      const row = document.querySelector(`tr[data-id="${activeMenuCode}"]`);
      if (row) row.remove();
      updateTotalCount();
      showToast(`Đã xoá tuyến ${activeMenuCode}`);
    }
  });

  // Excel & Print Toolbar
  document.getElementById('btnExportExcel')?.addEventListener('click', () => {
    showToast('Đang xuất danh sách tuyến ra file Excel (.xlsx)...');
    setTimeout(() => {
      showToast('Đã tải xuống Danh_sach_tuyen_chieu_sang.xlsx');
    }, 1200);
  });

  document.getElementById('btnPrintList')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btnColumnSettings')?.addEventListener('click', () => {
    showToast('Tùy chỉnh cột hiển thị: Tất cả 9 cột đang được bật', 'info');
  });
});
