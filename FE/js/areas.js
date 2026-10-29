/**
 * SmartLight Municipal IoT - Areas Management Logic (areas.html)
 * Nguồn dữ liệu: API /KhuVuc, /TuChieuSang, /TuyenChieuSang, /DiemDen
 */

// Dữ liệu mô phỏng dùng làm fallback khi Backend không sẵn sàng
let fallbackAreasData = [
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

let areasData = [...fallbackAreasData];
let editingAreaId = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function readApiField(item, camelCase, pascalCase) {
  return item?.[camelCase] ?? item?.[pascalCase];
}

function openRequestedAreaEdit() {
  const requestedId = new URLSearchParams(window.location.search).get('edit');
  if (requestedId) editArea(requestedId);
}

function updateAreaStats() {
  const total = areasData.length;
  const active = areasData.filter(item => item.status === 'Hoạt động').length;
  const maintenance = areasData.filter(item => item.status === 'Bảo trì').length;
  const alerts = areasData.filter(item => item.status === 'Có cảnh báo').length;

  document.getElementById('statTotalAreas').textContent = total;
  document.getElementById('statActiveAreas').textContent = active;
  document.getElementById('statMaintenanceAreas').textContent = maintenance;
  document.getElementById('statAlertAreas').textContent = alerts;

  const totalBadge = document.querySelector('.pagination-footer-total');
  if (totalBadge) totalBadge.textContent = total;
}

function openAreaModal(area = null) {
  const modal = document.getElementById('modalAddArea');
  const form = document.getElementById('formAddArea');
  const title = document.getElementById('areaModalTitle');
  const submit = document.getElementById('areaSubmitButton');
  if (!modal || !form || !title || !submit) return;

  form.reset();
  editingAreaId = area?.id || null;
  title.textContent = area ? `Chỉnh sửa khu vực ${area.id}` : 'Thêm khu vực chiếu sáng mới';
  submit.textContent = area ? 'Lưu thay đổi' : 'Tạo khu vực';

  const codeInput = document.getElementById('areaCodeInput');
  if (codeInput) codeInput.readOnly = Boolean(area);

  if (area) {
    document.getElementById('areaCodeInput').value = area.id;
    document.getElementById('areaNameInput').value = area.name;
    document.getElementById('areaDistrictInput').value = area.district;
    document.getElementById('areaStatusInput').value = area.status;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAreaModal() {
  const modal = document.getElementById('modalAddArea');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
  const codeInput = document.getElementById('areaCodeInput');
  if (codeInput) codeInput.readOnly = false;
  editingAreaId = null;
}

async function loadAreasFromApi() {
  if (!window.api) {
    openRequestedAreaEdit();
    return;
  }

  try {
    const [apiAreas, cabinets, routes, lights] = await Promise.all([
      window.api.get('/KhuVuc'),
      window.api.get('/TuChieuSang'),
      window.api.get('/TuyenChieuSang'),
      window.api.get('/DiemDen')
    ]);
    if (![apiAreas, cabinets, routes, lights].every(Array.isArray)) {
      throw new TypeError('API hạ tầng phải trả về danh sách cho từng endpoint.');
    }
    if (!apiAreas.length) {
      showToast('Backend chưa có dữ liệu khu vực; đang hiển thị danh sách mô phỏng.', 'error');
      openRequestedAreaEdit();
      return;
    }

    areasData = apiAreas.map(area => {
      const id = String(readApiField(area, 'maKhuVuc', 'MaKhuVuc') || '').trim();
      const areaCabinets = cabinets.filter(cabinet =>
        String(readApiField(cabinet, 'maKhuVuc', 'MaKhuVuc') || '').trim() === id
      );
      const cabinetIds = new Set(areaCabinets.map(cabinet =>
        String(readApiField(cabinet, 'maTu', 'MaTu') || '').trim()
      ));
      const areaRoutes = routes.filter(route =>
        cabinetIds.has(String(readApiField(route, 'maTu', 'MaTu') || '').trim())
      );
      const routeIds = new Set(areaRoutes.map(route =>
        String(readApiField(route, 'maTuyen', 'MaTuyen') || '').trim()
      ));
      const areaLights = lights.filter(light =>
        routeIds.has(String(readApiField(light, 'maTuyen', 'MaTuyen') || '').trim())
      );
      const onlineCabinets = areaCabinets.filter(cabinet =>
        Boolean(readApiField(cabinet, 'trangThaiKetNoi', 'TrangThaiKetNoi'))
      ).length;
      const rate = areaCabinets.length ? Number((onlineCabinets * 100 / areaCabinets.length).toFixed(1)) : 0;
      const status = !areaCabinets.length || onlineCabinets === areaCabinets.length
        ? 'Hoạt động'
        : onlineCabinets > 0
          ? 'Có cảnh báo'
          : 'Bảo trì';
      const updatedRaw = readApiField(area, 'ngayCapNhat', 'NgayCapNhat') || readApiField(area, 'ngayTao', 'NgayTao');

      return {
        id,
        name: String(readApiField(area, 'tenPhuongXa', 'TenPhuongXa') || id),
        district: String(readApiField(area, 'tenPhuongXa', 'TenPhuongXa') || ''),
        description: String(readApiField(area, 'moTa', 'MoTa') || ''),
        cabinets: areaCabinets.length,
        routes: areaRoutes.length,
        lamps: areaLights.length,
        rate,
        alerts: 0,
        status,
        updated: updatedRaw ? new Date(updatedRaw).toLocaleString('vi-VN') : '—'
      };
    });
    renderAreasTable();
    updateAreaStats();
    openRequestedAreaEdit();
  } catch (error) {
    console.warn('Không tải được dữ liệu khu vực từ API; dùng dữ liệu mô phỏng.', error);
    showToast('Không kết nối được Backend khu vực; đang hiển thị dữ liệu mô phỏng.', 'error');
    openRequestedAreaEdit();
  }
}

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
  const marker = document.createElement('span');
  marker.className = `w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`;
  const text = document.createElement('span');
  text.textContent = message;
  toast.append(marker, text);
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
  const totalBadge = document.querySelector('.pagination-footer-total');
  if (totalBadge) totalBadge.textContent = filtered.length;

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
      <tr class="area-row hover:bg-slate-50/80 transition-colors cursor-pointer" data-area-id="${escapeHtml(item.id)}">
        <td class="py-3.5 px-4 text-center" onclick="event.stopPropagation()">
          <input type="checkbox" class="area-row-checkbox rounded border-slate-300 text-primary focus:ring-primary/20">
        </td>
        <td class="py-3.5 px-4 font-mono font-bold text-primary whitespace-nowrap">${escapeHtml(item.id)}</td>
        <td class="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">${escapeHtml(item.name)}</td>
        <td class="py-3.5 px-4 text-slate-600 whitespace-nowrap">${escapeHtml(item.district)}</td>
        <td class="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">${item.cabinets}</td>
        <td class="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">${item.routes}</td>
        <td class="py-3.5 px-4 text-right font-mono font-bold text-slate-800">${item.lamps.toLocaleString('vi-VN')}</td>
        <td class="py-3.5 px-4 text-center font-mono font-bold ${item.rate >= 95 ? 'text-emerald-600' : 'text-amber-600'}">${item.rate}%</td>
        <td class="py-3.5 px-4 text-center">${alertBadge}</td>
        <td class="py-3.5 px-4 text-center whitespace-nowrap">${statusBadge}</td>
        <td class="py-3.5 px-4 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">${escapeHtml(item.updated)}</td>
        <td class="py-3.5 px-4 text-center" onclick="event.stopPropagation()">
          <div class="flex items-center justify-center gap-1">
            <a href="area-detail.html?id=${encodeURIComponent(item.id)}" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-100 transition" title="Xem chi tiết">
              <span class="material-symbols-outlined text-[17px]">visibility</span>
            </a>
            <button type="button" data-action="edit" data-area-id="${escapeHtml(item.id)}" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-100 transition" title="Chỉnh sửa">
              <span class="material-symbols-outlined text-[17px]">edit</span>
            </button>
            <button type="button" data-action="delete" data-area-id="${escapeHtml(item.id)}" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition" title="Xóa khu vực">
              <span class="material-symbols-outlined text-[17px]">more_vert</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function editArea(id) {
  const area = areasData.find(item => item.id === id);
  if (!area) {
    showToast(`Không tìm thấy khu vực ${id}.`, 'error');
    return;
  }
  openAreaModal(area);
}

async function showMoreAreaMenu(id) {
  const area = areasData.find(item => item.id === id);
  if (!area) return;
  if (!confirm(`Xóa khu vực ${id} (${area.name}) khỏi hệ thống?`)) return;

  if (!window.api) {
    areasData = areasData.filter(item => item.id !== id);
    renderAreasTable();
    updateAreaStats();
    showToast(`Đã xóa khu vực ${id} khỏi dữ liệu mô phỏng.`);
    return;
  }

  try {
    await window.api.delete(`/KhuVuc/${encodeURIComponent(id)}`);
    areasData = areasData.filter(item => item.id !== id);
    renderAreasTable();
    updateAreaStats();
    showToast(`Đã xóa khu vực ${id} trên Backend.`);
  } catch (error) {
    console.warn(`Không xóa được khu vực ${id}.`, error);
    showToast(error.message || `Không xóa được khu vực ${id} trên Backend.`, 'error');
  }
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
  document.getElementById('btnOpenAddAreaModal')?.addEventListener('click', () => {
    openAreaModal();
  });

  ['btnCloseAddAreaModal', 'btnCancelAddAreaModal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', closeAreaModal);
  });

  document.getElementById('formAddArea')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = document.getElementById('areaSubmitButton');
    const id = document.getElementById('areaCodeInput').value.trim();
    const name = document.getElementById('areaNameInput').value.trim();
    const district = document.getElementById('areaDistrictInput').selectedOptions[0]?.textContent.trim() || '';
    const status = document.getElementById('areaStatusInput').value;

    if (!id || !name) {
      showToast('Mã khu vực và tên khu vực không được để trống.', 'error');
      return;
    }

    const duplicate = areasData.some(item => item.id.toLowerCase() === id.toLowerCase() && item.id !== editingAreaId);
    if (duplicate) {
      showToast(`Mã khu vực ${id} đã tồn tại.`, 'error');
      document.getElementById('areaCodeInput').focus();
      return;
    }

    const previousLabel = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Đang lưu...';
    }

    try {
      if (window.api) {
        if (editingAreaId) {
          await window.api.put(`/KhuVuc/${encodeURIComponent(editingAreaId)}`, {
            maKhuVuc: editingAreaId,
            tenPhuongXa: name,
            moTa: district
          });
          const target = areasData.find(item => item.id === editingAreaId);
          if (target) {
            target.name = name;
            target.district = district;
            target.status = status;
            target.updated = new Date().toLocaleString('vi-VN');
          }
          showToast(`Đã cập nhật khu vực ${editingAreaId} trên Backend.`);
        } else {
          await window.api.post('/KhuVuc', {
            maKhuVuc: id,
            tenPhuongXa: name,
            moTa: district
          });
          areasData.unshift({
            id,
            name,
            district,
            description: district,
            cabinets: 0,
            routes: 0,
            lamps: 0,
            rate: 0,
            alerts: 0,
            status,
            updated: new Date().toLocaleString('vi-VN')
          });
          showToast(`Đã tạo khu vực ${id} trên Backend.`);
        }
      } else {
        if (editingAreaId) {
          const area = areasData.find(item => item.id === editingAreaId);
          if (area) {
            area.name = name;
            area.district = district;
            area.status = status;
            area.updated = new Date().toLocaleString('vi-VN');
          }
          showToast(`Đã cập nhật ${id} trong dữ liệu mô phỏng.`);
        } else {
          areasData.unshift({
            id,
            name,
            district,
            description: district,
            cabinets: 0,
            routes: 0,
            lamps: 0,
            rate: 0,
            alerts: 0,
            status,
            updated: new Date().toLocaleString('vi-VN')
          });
          showToast(`Đã thêm ${id} vào dữ liệu mô phỏng.`);
        }
      }

      closeAreaModal();
      renderAreasTable();
      updateAreaStats();
    } catch (error) {
      console.warn('Không lưu được khu vực lên Backend.', error);
      showToast(error.message || 'Không lưu được khu vực lên Backend.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = previousLabel;
      }
    }
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
    document.getElementById('filterStatus')?.focus();
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

  document.getElementById('areasTableBody')?.addEventListener('click', (event) => {
    const actionButton = event.target.closest('button[data-action]');
    if (actionButton) {
      event.stopPropagation();
      const { action, areaId } = actionButton.dataset;
      if (action === 'edit') editArea(areaId);
      if (action === 'delete') showMoreAreaMenu(areaId);
      return;
    }

    const row = event.target.closest('tr.area-row');
    if (row && !event.target.closest('input, a')) {
      window.location.href = `area-detail.html?id=${encodeURIComponent(row.dataset.areaId)}`;
    }
  });

  // Initial render
  renderAreasTable();
  updateAreaStats();
  loadAreasFromApi();
});
