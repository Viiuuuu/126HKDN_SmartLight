/**
 * SmartLight Municipal IoT - Areas Management Logic (areas.html)
 */

// Master Areas Data (From Screenshot 1)
const areasData = [
  {
    id: "KV-01",
    name: "Hải Châu",
    district: "Quận Hải Châu",
    cabinets: 18,
    routes: 42,
    lamps: 2580,
    rate: 98.4,
    alerts: 2,
    status: "Hoạt động",
    updated: "18/10/2024 14:20"
  },
  {
    id: "KV-02",
    name: "Sơn Trà",
    district: "Quận Sơn Trà",
    cabinets: 16,
    routes: 38,
    lamps: 2120,
    rate: 99.1,
    alerts: 0,
    status: "Hoạt động",
    updated: "17/10/2024 09:15"
  },
  {
    id: "KV-03",
    name: "Thanh Khê",
    district: "Quận Thanh Khê",
    cabinets: 14,
    routes: 31,
    lamps: 1680,
    rate: 97.8,
    alerts: 0,
    status: "Hoạt động",
    updated: "16/10/2024 16:45"
  },
  {
    id: "KV-04",
    name: "Ngũ Hành Sơn",
    district: "Quận Ngũ Hành Sơn",
    cabinets: 12,
    routes: 28,
    lamps: 1450,
    rate: 82.0,
    alerts: 1,
    status: "Bảo trì",
    updated: "15/10/2024 11:30"
  },
  {
    id: "KV-05",
    name: "Liên Chiểu",
    district: "Quận Liên Chiểu",
    cabinets: 11,
    routes: 25,
    lamps: 1260,
    rate: 89.5,
    alerts: 5,
    status: "Có cảnh báo",
    updated: "18/10/2024 10:40"
  },
  {
    id: "KV-06",
    name: "Cẩm Lệ",
    district: "Quận Cẩm Lệ",
    cabinets: 10,
    routes: 24,
    lamps: 1090,
    rate: 96.5,
    alerts: 0,
    status: "Hoạt động",
    updated: "14/10/2024 10:10"
  }
];

// Toast Alert
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all transform translate-y-2 opacity-0 duration-300 ${
    type === 'success' 
      ? 'bg-slate-900 text-white border-slate-800' 
      : 'bg-rose-900 text-white border-rose-800'
  }`;
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });
  
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Render Table
function renderAreasTable() {
  const tbody = document.getElementById('areasTableBody');
  if (!tbody) return;
  const searchInput = document.getElementById('searchAreaInput');
  const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const statusFilter = document.getElementById('filterStatus');
  const statusVal = statusFilter ? statusFilter.value : 'all';

  const filtered = areasData.filter(item => {
    if (statusVal !== 'all' && item.status !== statusVal) return false;
    if (searchVal) {
      const match = item.id.toLowerCase().includes(searchVal) ||
                    item.name.toLowerCase().includes(searchVal) ||
                    item.district.toLowerCase().includes(searchVal);
      if (!match) return false;
    }
    return true;
  });

  const countEl = document.getElementById('showingCount');
  if (countEl) {
    countEl.textContent = filtered.length > 0 ? `1 - ${filtered.length}` : '0';
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" class="py-12 text-center text-slate-400">
          <span class="material-symbols-outlined text-[36px] text-slate-300 mb-1">search_off</span>
          <p class="text-xs font-semibold">Không tìm thấy khu vực chiếu sáng nào</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    // Status Badge
    let statusBadge = '';
    if (item.status === 'Hoạt động') {
      statusBadge = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-brand-600 border border-sky-200">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
          Hoạt động
        </span>
      `;
    } else if (item.status === 'Bảo trì') {
      statusBadge = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Bảo trì
        </span>
      `;
    } else {
      statusBadge = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Có cảnh báo
        </span>
      `;
    }

    // Alert Badge
    let alertBadge = '';
    if (item.alerts > 0) {
      alertBadge = `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${item.alerts >= 3 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}">${item.alerts}</span>`;
    } else {
      alertBadge = `<span class="text-slate-400 font-mono">0</span>`;
    }

    return `
      <tr class="hover:bg-slate-50/80 transition-colors cursor-pointer" onclick="window.location.href='area-detail.html?id=${item.id}'">
        <td class="py-3.5 px-4 text-center" onclick="event.stopPropagation()">
          <input type="checkbox" class="area-row-checkbox rounded border-slate-300 text-primary focus:ring-primary/20">
        </td>
        <td class="py-3.5 px-4 font-mono font-bold text-primary whitespace-nowrap">${item.id}</td>
        <td class="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">${item.name}</td>
        <td class="py-3.5 px-4 text-slate-600 whitespace-nowrap">${item.district}</td>
        <td class="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">${item.cabinets}</td>
        <td class="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">${item.routes}</td>
        <td class="py-3.5 px-4 text-right font-mono font-bold text-slate-800">${item.lamps.toLocaleString('vi-VN')}</td>
        <td class="py-3.5 px-4 text-center font-mono font-bold ${item.rate >= 95 ? 'text-emerald-600' : 'text-amber-600'}">${item.rate}%</td>
        <td class="py-3.5 px-4 text-center">${alertBadge}</td>
        <td class="py-3.5 px-4 text-center whitespace-nowrap">${statusBadge}</td>
        <td class="py-3.5 px-4 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">${item.updated}</td>
        <td class="py-3.5 px-4 text-center" onclick="event.stopPropagation()">
          <div class="flex items-center justify-center gap-1">
            <a href="area-detail.html?id=${item.id}" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-100 transition" title="Xem chi tiết">
              <span class="material-symbols-outlined text-[17px]">visibility</span>
            </a>
            <button onclick="editArea('${item.id}')" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-100 transition" title="Chỉnh sửa">
              <span class="material-symbols-outlined text-[17px]">edit</span>
            </button>
            <button onclick="showMoreAreaMenu('${item.id}')" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition" title="Tác vụ khác">
              <span class="material-symbols-outlined text-[17px]">more_vert</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Actions
function editArea(id) {
  showToast(`Mở hộp thoại chỉnh sửa khu vực ${id}`);
}

function showMoreAreaMenu(id) {
  showToast(`Mở menu tùy chọn cho ${id}`);
}

// Live Clock
const daysOfWeekAreas = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function updateClock() {
  const now = new Date();
  const dayName = daysOfWeekAreas[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  const el = document.getElementById('liveClockDisplay');
  if (el) el.textContent = `${dayName}, ${dateStr}`;
}

document.addEventListener('DOMContentLoaded', () => {
  // Modal Add Area
  const modalAdd = document.getElementById('modalAddArea');
  document.getElementById('btnOpenAddAreaModal')?.addEventListener('click', () => {
    modalAdd?.classList.remove('hidden');
    modalAdd?.classList.add('flex');
  });

  ['btnCloseAddAreaModal', 'btnCancelAddAreaModal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      modalAdd?.classList.add('hidden');
      modalAdd?.classList.remove('flex');
    });
  });

  document.getElementById('formAddArea')?.addEventListener('submit', (e) => {
    e.preventDefault();
    modalAdd?.classList.add('hidden');
    modalAdd?.classList.remove('flex');
    showToast('Đã thêm mới khu vực chiếu sáng thành công!');
  });

  // Select All Checkbox
  document.getElementById('selectAllCheckbox')?.addEventListener('change', (e) => {
    const checked = e.target.checked;
    document.querySelectorAll('.area-row-checkbox').forEach(cb => cb.checked = checked);
  });

  // Filters
  document.getElementById('searchAreaInput')?.addEventListener('input', renderAreasTable);
  document.getElementById('filterStatus')?.addEventListener('change', renderAreasTable);
  document.getElementById('btnFilterToggle')?.addEventListener('click', () => {
    showToast('Đang áp dụng bộ lọc nâng cao');
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

  // Initial render
  renderAreasTable();
});
