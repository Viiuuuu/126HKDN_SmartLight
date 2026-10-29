// ==============================================================================
// SMARTLIGHT IOT SYSTEM - ALERTS MONITORING MODULE
// ==============================================================================
// Tích hợp REST API Backend (/api/CanhBao, /api/CauHinhCanhBao)
// Sử dụng thư viện api-config.js đồng nhất và chuẩn hóa theo CSDL dbSmartLight
// ==============================================================================

// Biến lưu trữ dữ liệu cảnh báo và cấu hình từ API
let alertsData = [];
let alertConfigs = [];
let devicesMap = {
  cabinets: {},
  routes: {},
  lights: {}
};

// Cấu hình phân trang
const pageSize = 10;
let currentPage = 1;
let currentSelectedAlert = null;

// ==================== TOAST NOTIFICATION ====================
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

// ==================== FORMAT HELPERS ====================
function formatDate(dateInput) {
  if (!dateInput) return '--';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch (_) {
    return String(dateInput);
  }
}

function getSeverityBadge(mucDo) {
  const m = Number(mucDo);
  if (m === 3) {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] bg-rose-50 text-rose-700 border border-rose-200">Nghiêm trọng (3)</span>`;
  } else if (m === 2) {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-amber-50 text-amber-800 border border-amber-200">Trung bình (2)</span>`;
  }
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-sky-50 text-sky-800 border border-sky-200">Thấp (1)</span>`;
}

function getStatusBadge(trangThai) {
  const s = Number(trangThai);
  if (s === 0) {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-rose-50 text-rose-700 border border-rose-200">Chưa xử lý</span>`;
  } else if (s === 1) {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-sky-50 text-primary border border-sky-200">Đang xử lý</span>`;
  } else if (s === 2) {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">Đã xử lý</span>`;
  }
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-slate-100 text-slate-700">Không rõ</span>`;
}

function getTargetInfo(item) {
  if (item.maTu) {
    const code = item.maTu.trim();
    const name = devicesMap.cabinets[code] || code;
    return {
      type: 'Tủ chiếu sáng',
      code: code,
      label: `Tủ: ${name}`,
      icon: 'electrical_services'
    };
  }
  if (item.maTuyen) {
    const code = item.maTuyen.trim();
    const name = devicesMap.routes[code] || code;
    return {
      type: 'Tuyến chiếu sáng',
      code: code,
      label: `Tuyến: ${name}`,
      icon: 'alt_route'
    };
  }
  if (item.maDen) {
    const code = item.maDen.trim();
    const name = devicesMap.lights[code] || code;
    return {
      type: 'Điểm đèn',
      code: code,
      label: `Đèn: ${name}`,
      icon: 'lightbulb'
    };
  }
  return {
    type: 'Hệ thống',
    code: 'SYSTEM',
    label: 'Toàn hệ thống',
    icon: 'hub'
  };
}

// ==================== API FETCHING ====================
async function loadAlertsFromApi(silent = false) {
  const spinner = document.getElementById('refreshIcon');
  const syncSpinner = document.getElementById('syncSpinner');
  if (spinner) spinner.classList.add('animate-spin');
  if (syncSpinner) syncSpinner.classList.add('animate-spin');

  try {
    // 1. Tải danh mục cấu hình cảnh báo (CauHinhCanhBao)
    try {
      const configs = await api.get('/CauHinhCanhBao');
      if (Array.isArray(configs)) {
        alertConfigs = configs;
        populateFilterTypeDropdown();
      }
    } catch (cfgErr) {
      console.warn('[Alerts] Không thể tải cấu hình cảnh báo:', cfgErr);
    }

    // 2. Tải danh sách thiết bị bổ trợ (nếu có để map tên thân thiện)
    try {
      const [cabinets, routes, lights] = await Promise.allSettled([
        api.get('/TuChieuSang'),
        api.get('/TuyenChieuSang'),
        api.get('/DiemDen')
      ]);

      if (cabinets.status === 'fulfilled' && Array.isArray(cabinets.value)) {
        cabinets.value.forEach(c => {
          if (c.maTu) devicesMap.cabinets[c.maTu.trim()] = c.tenTu || c.maTu.trim();
        });
      }
      if (routes.status === 'fulfilled' && Array.isArray(routes.value)) {
        routes.value.forEach(r => {
          if (r.maTuyen) devicesMap.routes[r.maTuyen.trim()] = r.tenTuyen || r.maTuyen.trim();
        });
      }
      if (lights.status === 'fulfilled' && Array.isArray(lights.value)) {
        lights.value.forEach(d => {
          if (d.maDen) devicesMap.lights[d.maDen.trim()] = d.tenDen || d.maDen.trim();
        });
      }
    } catch (_) {}

    // 3. Tải danh sách cảnh báo chính từ /api/CanhBao
    const data = await api.get('/CanhBao');
    if (Array.isArray(data)) {
      alertsData = data;
    } else {
      alertsData = [];
    }

    currentPage = 1;
    renderTable();

    if (!silent) {
      showToast(`Đã đồng bộ ${alertsData.length} cảnh báo từ cơ sở dữ liệu!`, 'success');
    }
  } catch (err) {
    console.error('[Alerts] Lỗi khi tải dữ liệu cảnh báo:', err);
    if (!silent) {
      showToast(`Lỗi kết nối Backend: ${err.message || 'Không thể lấy dữ liệu cảnh báo'}`, 'error');
    }
    renderTable();
  } finally {
    if (spinner) spinner.classList.remove('animate-spin');
    if (syncSpinner) syncSpinner.classList.remove('animate-spin');
  }
}

// ==================== DYNAMIC FILTERS ====================
function populateFilterTypeDropdown() {
  const filterType = document.getElementById('filterType');
  if (!filterType) return;

  const currentVal = filterType.value;
  filterType.innerHTML = '<option value="all">Tất cả loại cảnh báo</option>';

  alertConfigs.forEach(cfg => {
    const opt = document.createElement('option');
    opt.value = String(cfg.maCauHinh);
    opt.textContent = cfg.tenCanhBao || cfg.loaiCanhBao;
    filterType.appendChild(opt);
  });

  if (currentVal && filterType.querySelector(`option[value="${currentVal}"]`)) {
    filterType.value = currentVal;
  }
}

// ==================== RENDER TABLE & STATS ====================
function renderTable() {
  const tbody = document.getElementById('alertTableBody');
  if (!tbody) return;

  const filterType = document.getElementById('filterType');
  const filterSeverity = document.getElementById('filterSeverity');
  const filterStatus = document.getElementById('filterStatus');
  const searchInput = document.getElementById('searchInput');

  const filterTypeVal = filterType ? filterType.value : 'all';
  const filterSeverityVal = filterSeverity ? filterSeverity.value : 'all';
  const filterStatusVal = filterStatus ? filterStatus.value : 'all';
  const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

  // Lọc dữ liệu dựa trên các trường có trong DB
  const filtered = alertsData.filter(item => {
    // 1. Lọc theo mã cấu hình loại cảnh báo
    if (filterTypeVal !== 'all') {
      if (String(item.maCauHinh) !== filterTypeVal) return false;
    }

    // 2. Lọc theo mức độ (mucDo: 1, 2, 3)
    if (filterSeverityVal !== 'all') {
      if (String(item.mucDo) !== filterSeverityVal) return false;
    }

    // 3. Lọc theo trạng thái xử lý (trangThaiXuLy: 0, 1, 2)
    if (filterStatusVal !== 'all') {
      if (String(item.trangThaiXuLy) !== filterStatusVal) return false;
    }

    // 4. Tìm kiếm từ khóa (theo mã cảnh báo, thiết bị, nội dung)
    if (searchVal) {
      const codeStr = `cb-${String(item.maCanhBao).padStart(5, '0')}`;
      const rawIdStr = String(item.maCanhBao);
      const noiDungStr = (item.noiDung || '').toLowerCase();
      const tuStr = (item.maTu || '').toLowerCase();
      const tuyenStr = (item.maTuyen || '').toLowerCase();
      const denStr = (item.maDen || '').toLowerCase();

      const matched = codeStr.includes(searchVal) ||
                      rawIdStr.includes(searchVal) ||
                      noiDungStr.includes(searchVal) ||
                      tuStr.includes(searchVal) ||
                      tuyenStr.includes(searchVal) ||
                      denStr.includes(searchVal);
      if (!matched) return false;
    }

    return true;
  });

  // Cập nhật các chỉ số tổng quan trên Metric Bar (theo dữ liệu DB)
  const statTotal = document.getElementById('statTotalCount');
  const statHigh = document.getElementById('statHighCount');
  const statMedium = document.getElementById('statMediumCount');
  const statLow = document.getElementById('statLowCount');
  const sidebarAlertCount = document.getElementById('sidebarAlertCount');
  const tableRecordCount = document.getElementById('tableRecordCount');

  if (statTotal) statTotal.textContent = String(alertsData.length);
  if (statHigh) statHigh.textContent = String(alertsData.filter(x => Number(x.mucDo) === 3).length);
  if (statMedium) statMedium.textContent = String(alertsData.filter(x => Number(x.mucDo) === 2).length);
  if (statLow) statLow.textContent = String(alertsData.filter(x => Number(x.mucDo) === 1).length);
  if (sidebarAlertCount) sidebarAlertCount.textContent = String(alertsData.filter(x => Number(x.trangThaiXuLy) !== 2).length);
  if (tableRecordCount) tableRecordCount.textContent = `${filtered.length} bản ghi`;

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(firstIndex, firstIndex + pageSize);

  const showingEl = document.getElementById('paginationShowing');
  const totalEl = document.getElementById('paginationTotal');
  if (showingEl) showingEl.textContent = filtered.length ? `${firstIndex + 1} - ${firstIndex + pageItems.length}` : '0';
  if (totalEl) totalEl.textContent = String(filtered.length);

  renderPagination(totalPages);

  // Hiển thị nếu không có bản ghi
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-12 text-center text-slate-400">
          <span class="material-symbols-outlined text-[36px] text-slate-300 mb-1">search_off</span>
          <p class="text-xs font-semibold">Không tìm thấy cảnh báo nào phù hợp với bộ lọc</p>
        </td>
      </tr>
    `;
    return;
  }

  // Render các hàng dữ liệu (Đúng 5 trường theo yêu cầu: STT, Thời gian, Đối tượng, Loại cảnh báo, Mức độ)
  tbody.innerHTML = pageItems.map((item, idx) => {
    const stt = firstIndex + idx + 1;
    const cfg = alertConfigs.find(c => c.maCauHinh === item.maCauHinh);
    const typeName = cfg ? (cfg.tenCanhBao || cfg.loaiCanhBao) : 'Cảnh báo hệ thống';
    const timeFormatted = formatDate(item.thoiGianPhatSinh);
    const target = getTargetInfo(item);
    const sevBadge = getSeverityBadge(item.mucDo);

    return `
      <tr class="cursor-pointer hover:bg-sky-50/70 transition-colors group" onclick="openAlertDetail(${item.maCanhBao})" title="Nhấn để xem chi tiết cảnh báo #${item.maCanhBao}">
        <td class="py-3.5 px-4 text-center font-bold text-slate-400 font-mono text-[11px]">${stt}</td>
        <td class="py-3.5 px-4 font-medium whitespace-nowrap text-slate-800">
          <div class="flex items-center gap-1.5 font-mono text-[11px]">
            ${Number(item.mucDo) === 3 ? '<span class="w-2 h-2 rounded-full bg-error shrink-0"></span>' : '<span class="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>'}
            ${timeFormatted}
          </div>
        </td>
        <td class="py-3.5 px-4 whitespace-nowrap">
          <div class="flex items-center gap-2 font-semibold text-slate-800">
            <span class="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary transition">${target.icon}</span>
            <span>${target.label}</span>
          </div>
        </td>
        <td class="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
          ${typeName}
        </td>
        <td class="py-3.5 px-4 text-center whitespace-nowrap">${sevBadge}</td>
      </tr>
    `;
  }).join('');
}

// ==================== PAGINATION ====================
function renderPagination(totalPages) {
  const container = document.getElementById('alertPagination');
  if (!container) return;

  container.replaceChildren();
  const addButton = (label, page, { disabled = false, active = false, ariaLabel = label } = {}) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = active
      ? 'w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white font-bold text-xs shadow-sm'
      : 'w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-40';
    button.disabled = disabled;
    button.setAttribute('aria-label', ariaLabel);
    if (active) button.setAttribute('aria-current', 'page');
    button.innerHTML = label;
    button.addEventListener('click', () => {
      currentPage = page;
      renderTable();
    });
    container.appendChild(button);
  };

  addButton('<span class="material-symbols-outlined text-[18px]">chevron_left</span>', currentPage - 1, {
    disabled: currentPage <= 1,
    ariaLabel: 'Trang trước'
  });
  for (let page = 1; page <= totalPages; page += 1) {
    addButton(String(page), page, { active: page === currentPage, ariaLabel: `Trang ${page}` });
  }
  addButton('<span class="material-symbols-outlined text-[18px]">chevron_right</span>', currentPage + 1, {
    disabled: currentPage >= totalPages,
    ariaLabel: 'Trang sau'
  });
}

// ==================== NAVIGATION TO DETAIL ====================
function openAlertDetail(maCanhBao) {
  const item = alertsData.find(x => x.maCanhBao == maCanhBao);
  if (!item) {
    showToast('Không tìm thấy thông tin cảnh báo.', 'error');
    return;
  }

  const cfg = alertConfigs.find(c => c.maCauHinh === item.maCauHinh);
  const typeName = cfg ? (cfg.tenCanhBao || cfg.loaiCanhBao) : 'Cảnh báo hệ thống';
  const target = getTargetInfo(item);

  // Tạo đối tượng tương thích với alert-detail.js
  const mappedAlert = {
    id: `CB-${String(item.maCanhBao).padStart(5, '0')}`,
    rawId: item.maCanhBao,
    maCanhBao: item.maCanhBao,
    time: formatDate(item.thoiGianPhatSinh),
    type: typeName,
    category: Number(item.mucDo) === 3 ? 'tech' : 'ops',
    categoryLabel: cfg?.loaiCanhBao || 'Sự cố giám sát',
    param: target.code,
    location: target.label,
    district: 'Đà Nẵng',
    severity: Number(item.mucDo) === 3 ? 'Cao' : Number(item.mucDo) === 2 ? 'Trung bình' : 'Thấp',
    status: Number(item.trangThaiXuLy) === 0 ? 'Chưa xử lý' : Number(item.trangThaiXuLy) === 1 ? 'Đang xử lý' : 'Đã xử lý',
    headline: item.noiDung,
    description: item.noiDung + (item.ghiChuXuLy ? ` (Ghi chú: ${item.ghiChuXuLy})` : ''),
    maTu: item.maTu,
    maTuyen: item.maTuyen,
    maDen: item.maDen,
    thoiGianPhatSinh: item.thoiGianPhatSinh,
    thoiGianXuLy: item.thoiGianXuLy,
    ghiChuXuLy: item.ghiChuXuLy,
    maNguoiXuLy: item.maNguoiXuLy
  };

  try {
    sessionStorage.setItem('smartlight_selected_alert', JSON.stringify(mappedAlert));
  } catch (err) {
    console.error('Không thể lưu cache alert:', err);
  }

  window.location.href = `alert-detail.html?id=${encodeURIComponent(item.maCanhBao)}`;
}

// ==================== STATUS UPDATE MODAL ====================
const modalStatus = document.getElementById('modalUpdateStatus');
const formUpdateStatus = document.getElementById('formUpdateStatus');

function openStatusModal(maCanhBao) {
  const item = alertsData.find(x => x.maCanhBao == maCanhBao);
  if (!item || !modalStatus) return;

  currentSelectedAlert = item;
  document.getElementById('editAlertId').value = item.maCanhBao;
  document.getElementById('modalAlertCode').textContent = `Mã: CB-${String(item.maCanhBao).padStart(5, '0')}`;
  document.getElementById('modalAlertContent').textContent = item.noiDung || 'Không có nội dung mô tả';
  document.getElementById('editAlertStatus').value = String(item.trangThaiXuLy || 0);
  document.getElementById('editAlertNote').value = item.ghiChuXuLy || '';

  modalStatus.classList.remove('hidden');
  modalStatus.classList.add('flex');
}

function closeStatusModal() {
  if (modalStatus) {
    modalStatus.classList.add('hidden');
    modalStatus.classList.remove('flex');
  }
}

['btnCloseStatusModal', 'btnCancelStatusModal'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', closeStatusModal);
});

formUpdateStatus?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const alertId = document.getElementById('editAlertId').value;
  const newStatus = Number(document.getElementById('editAlertStatus').value);
  const note = document.getElementById('editAlertNote').value.trim();

  // Đọc thông tin người dùng đang đăng nhập
  let currentUser = 'ND0001';
  try {
    const sessionRaw = sessionStorage.getItem('smartlight_user_session');
    if (sessionRaw) {
      const u = JSON.parse(sessionRaw);
      currentUser = u.maNguoiDung || u.username || currentUser;
    }
  } catch (_) {}

  const btnSave = document.getElementById('btnSaveStatus');
  if (btnSave) {
    btnSave.disabled = true;
    btnSave.textContent = 'Đang lưu...';
  }

  try {
    // Gọi REST API PUT: /api/CanhBao/{id}
    await api.put(`/CanhBao/${alertId}`, {
      trangThaiXuLy: newStatus,
      ghiChuXuLy: note,
      maNguoiXuLy: currentUser
    });

    // Cập nhật lại trong mảng local
    const target = alertsData.find(x => x.maCanhBao == alertId);
    if (target) {
      target.trangThaiXuLy = newStatus;
      target.ghiChuXuLy = note;
      target.maNguoiXuLy = currentUser;
      if (newStatus === 2) {
        target.thoiGianXuLy = new Date().toISOString();
      }
    }

    closeStatusModal();
    renderTable();
    showToast(`Đã cập nhật trạng thái cảnh báo CB-${String(alertId).padStart(5, '0')} thành công!`, 'success');
  } catch (err) {
    console.error('Lỗi khi cập nhật cảnh báo:', err);
    showToast(`Lỗi cập nhật: ${err.message || 'Không thể lưu trạng thái'}`, 'error');
  } finally {
    if (btnSave) {
      btnSave.disabled = false;
      btnSave.innerHTML = `<span class="material-symbols-outlined text-[16px]">save</span><span>Lưu cập nhật</span>`;
    }
  }
});

// ==================== EXPORT DATA ====================
const modalExport = document.getElementById('modalExport');

document.getElementById('btnExportAlerts')?.addEventListener('click', () => {
  if (modalExport) {
    modalExport.classList.remove('hidden');
    modalExport.classList.add('flex');
  }
});

['btnCloseExportModal', 'btnCancelExportModal'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () => {
    if (modalExport) {
      modalExport.classList.add('hidden');
      modalExport.classList.remove('flex');
    }
  });
});

document.getElementById('btnConfirmExport')?.addEventListener('click', () => {
  const scope = document.getElementById('exportScopeSelect')?.value || 'all';
  let exportItems = alertsData;

  if (scope === 'high') {
    exportItems = alertsData.filter(x => Number(x.mucDo) === 3);
  } else if (scope === 'unhandled') {
    exportItems = alertsData.filter(x => Number(x.trangThaiXuLy) === 0);
  }

  if (exportItems.length === 0) {
    showToast('Không có dữ liệu cảnh báo để xuất file.', 'error');
    if (modalExport) {
      modalExport.classList.add('hidden');
      modalExport.classList.remove('flex');
    }
    return;
  }

  // Tạo tệp CSV có BOM UTF-8 hỗ trợ Excel hiển thị tiếng Việt có dấu chuẩn 100%
  const headers = ['STT', 'Mã Cảnh Báo', 'Thời Gian Phát Sinh', 'Loại Cảnh Báo', 'Đối Tượng', 'Nội Dung', 'Mức Độ', 'Trạng Thái', 'Người Xử Lý', 'Ghi Chú'];
  const rows = exportItems.map((item, idx) => {
    const cfg = alertConfigs.find(c => c.maCauHinh === item.maCauHinh);
    const typeName = cfg ? (cfg.tenCanhBao || cfg.loaiCanhBao) : 'Cảnh báo';
    const target = getTargetInfo(item);
    const sevLabel = Number(item.mucDo) === 3 ? 'Nghiêm trọng (3)' : Number(item.mucDo) === 2 ? 'Trung bình (2)' : 'Thấp (1)';
    const statusLabel = Number(item.trangThaiXuLy) === 0 ? 'Chưa xử lý' : Number(item.trangThaiXuLy) === 1 ? 'Đang xử lý' : 'Đã xử lý';

    return [
      idx + 1,
      `CB-${String(item.maCanhBao).padStart(5, '0')}`,
      formatDate(item.thoiGianPhatSinh),
      `"${typeName.replace(/"/g, '""')}"`,
      `"${target.label.replace(/"/g, '""')}"`,
      `"${(item.noiDung || '').replace(/"/g, '""')}"`,
      `"${sevLabel}"`,
      `"${statusLabel}"`,
      item.maNguoiXuLy || '',
      `"${(item.ghiChuXuLy || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Danh_Sach_Canh_Bao_SmartLight_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (modalExport) {
    modalExport.classList.add('hidden');
    modalExport.classList.remove('flex');
  }
  showToast(`Đã xuất thành công ${exportItems.length} bản ghi cảnh báo!`, 'success');
});

// ==================== FILTER & SEARCH LISTENERS ====================
['filterType', 'filterSeverity', 'filterStatus'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', () => {
    currentPage = 1;
    renderTable();
  });
});

document.getElementById('searchInput')?.addEventListener('input', () => {
  currentPage = 1;
  renderTable();
});

// Search từ Topbar (Ctrl+K)
const topSearchInput = document.getElementById('topSearchInput');
if (topSearchInput) {
  topSearchInput.addEventListener('input', (e) => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = e.target.value;
    }
    currentPage = 1;
    renderTable();
  });
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (topSearchInput) {
      topSearchInput.focus();
      topSearchInput.select();
    }
  }
});

// Nút Làm mới
document.getElementById('btnRefreshAlerts')?.addEventListener('click', () => {
  loadAlertsFromApi();
});

document.getElementById('syncSpinner')?.addEventListener('click', () => {
  loadAlertsFromApi();
});

// ==================== LIVE CLOCK & TOPBAR ====================
const daysOfWeekAlerts = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function updateClock() {
  const now = new Date();
  const dayName = daysOfWeekAlerts[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  const el = document.getElementById('topbarLiveClock');
  if (el) el.textContent = `${dayName}, ${dateStr}`;
}
setInterval(updateClock, 1000);
updateClock();

// Topbar Dropdowns (Notification & User Profile)
const btnNotifications = document.getElementById('btnNotifications');
const notificationDropdown = document.getElementById('notificationDropdown');
const btnUserProfile = document.getElementById('btnUserProfile');
const userDropdown = document.getElementById('userDropdown');

if (btnNotifications && notificationDropdown) {
  btnNotifications.addEventListener('click', (e) => {
    e.stopPropagation();
    if (userDropdown) userDropdown.classList.remove('active');
    notificationDropdown.classList.toggle('active');
  });
}

if (btnUserProfile && userDropdown) {
  btnUserProfile.addEventListener('click', (e) => {
    e.stopPropagation();
    if (notificationDropdown) notificationDropdown.classList.remove('active');
    userDropdown.classList.toggle('active');
  });
}

document.addEventListener('click', () => {
  if (notificationDropdown) notificationDropdown.classList.remove('active');
  if (userDropdown) userDropdown.classList.remove('active');
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

// Đưa các hàm mở chi tiết và mở modal ra phạm vi window để onclick trong HTML hoạt động
window.openAlertDetail = openAlertDetail;
window.openStatusModal = openStatusModal;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadAlertsFromApi(true);
});
if (document.readyState !== 'loading') {
  loadAlertsFromApi(true);
}
