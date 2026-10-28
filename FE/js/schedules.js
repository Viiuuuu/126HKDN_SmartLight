// ==================== JAVASCRIPT LOGIC FOR SCHEDULES ====================

// Live Clock Updater
const daysOfWeekSchedules = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function updateClock() {
  const now = new Date();
  const dayName = daysOfWeekSchedules[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  const el = document.getElementById('liveClockDisplay');
  if (el) el.textContent = `${dayName}, ${dateStr}`;
}
setInterval(updateClock, 1000);
updateClock();

// Show Toast
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

// Toggle Inline Detail Panel
const inlineDetailSection = document.getElementById('inlineDetailSection');
const btnCloseInlineDetail = document.getElementById('btnCloseInlineDetail');

function openInlineDetail(scheduleId = 'LH-001') {
  if (inlineDetailSection) {
    inlineDetailSection.classList.remove('hidden');
    inlineDetailSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function closeInlineDetail() {
  if (inlineDetailSection) {
    inlineDetailSection.classList.add('hidden');
  }
}

if (btnCloseInlineDetail) {
  btnCloseInlineDetail.addEventListener('click', closeInlineDetail);
}

// Row clicks & View detail buttons
document.querySelectorAll('.btn-view-detail').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.getAttribute('data-id');
    openInlineDetail(id);
  });
});

document.querySelectorAll('.row-schedule').forEach(row => {
  row.addEventListener('click', (e) => {
    // Ignore if clicked directly on checkbox or action button
    if (e.target.tagName === 'INPUT' || e.target.closest('button')) return;
    const id = row.getAttribute('data-id');
    openInlineDetail(id);
  });
});

// Checkbox and Batch Actions
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const rowCheckboxes = document.querySelectorAll('.row-checkbox');
const batchActionBar = document.getElementById('batchActionBar');
const selectedCount = document.getElementById('selectedCount');

function updateBatchBar() {
  const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
  const count = checkedBoxes.length;
  if (batchActionBar && selectedCount) {
    if (count > 0) {
      batchActionBar.classList.remove('hidden');
      selectedCount.textContent = count;
    } else {
      batchActionBar.classList.add('hidden');
    }
  }
}

if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener('change', (e) => {
    rowCheckboxes.forEach(cb => {
      cb.checked = e.target.checked;
      const tr = cb.closest('tr');
      if (tr) {
        if (e.target.checked) {
          tr.style.backgroundColor = 'rgb(239, 245, 250)';
        } else {
          tr.style.backgroundColor = '';
        }
      }
    });
    updateBatchBar();
  });
}

rowCheckboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    const tr = cb.closest('tr');
    if (tr) {
      if (cb.checked) {
        tr.style.backgroundColor = 'rgb(239, 245, 250)';
      } else {
        tr.style.backgroundColor = '';
      }
    }
    updateBatchBar();
  });
});

document.getElementById('btnBatchDeselect')?.addEventListener('click', () => {
  rowCheckboxes.forEach(cb => {
    cb.checked = false;
    const tr = cb.closest('tr');
    if (tr) tr.style.backgroundColor = '';
  });
  if (selectAllCheckbox) selectAllCheckbox.checked = false;
  updateBatchBar();
});

document.getElementById('btnBatchActivate')?.addEventListener('click', () => {
  showToast('Đã gửi lệnh kích hoạt các lịch đã chọn tới Gateway!');
});

document.getElementById('btnBatchPause')?.addEventListener('click', () => {
  showToast('Đã tạm dừng các lịch đã chọn thành công!');
});

document.getElementById('btnBatchDelete')?.addEventListener('click', () => {
  if (confirm('Bạn có chắc chắn muốn xóa các lịch đã chọn?')) {
    showToast('Đã xóa thành công!');
  }
});

// Filters (Search, Area, Type, Status)
const searchInput = document.getElementById('searchInput');
const filterArea = document.getElementById('filterArea');
const filterType = document.getElementById('filterType');
const filterStatus = document.getElementById('filterStatus');
const tableRows = document.querySelectorAll('#scheduleTableBody tr');

function filterTable() {
  const query = (searchInput ? searchInput.value || '' : '').trim().toLowerCase();
  const areaVal = filterArea ? filterArea.value : 'all';
  const typeVal = filterType ? filterType.value : 'all';
  const statusVal = filterStatus ? filterStatus.value : 'all';

  let visibleCount = 0;
  tableRows.forEach(row => {
    const text = row.innerText.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesArea = areaVal === 'all' || text.includes(areaVal.toLowerCase());
    const matchesType = typeVal === 'all' || text.includes(typeVal.toLowerCase());
    const matchesStatus = statusVal === 'all' || text.includes(statusVal.toLowerCase());

    if (matchesQuery && matchesArea && matchesType && matchesStatus) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  const countEl = document.getElementById('tableShowingCount');
  if (countEl) countEl.textContent = `1 - ${visibleCount}`;
}

searchInput?.addEventListener('input', filterTable);
filterArea?.addEventListener('change', filterTable);
filterType?.addEventListener('change', filterTable);
filterStatus?.addEventListener('change', filterTable);

// Top Search Shortcut (Ctrl+K)
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const topSearch = document.getElementById('topSearchInput');
    if (topSearch) topSearch.focus();
  }
});

// Create Modal Logic
const modalCreate = document.getElementById('modalCreateSchedule');
const btnCreateSchedule = document.getElementById('btnCreateSchedule');
const btnCloseCreateModal = document.getElementById('btnCloseCreateModal');
const btnCancelCreateModal = document.getElementById('btnCancelCreateModal');
const formCreateSchedule = document.getElementById('formCreateSchedule');

btnCreateSchedule?.addEventListener('click', () => {
  if (modalCreate) {
    modalCreate.classList.remove('hidden');
    modalCreate.classList.add('flex');
  }
});

[btnCloseCreateModal, btnCancelCreateModal].forEach(b => {
  b?.addEventListener('click', () => {
    if (modalCreate) {
      modalCreate.classList.add('hidden');
      modalCreate.classList.remove('flex');
    }
  });
});

formCreateSchedule?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (modalCreate) {
    modalCreate.classList.add('hidden');
    modalCreate.classList.remove('flex');
  }
  showToast('Đã tạo lịch mới thành công và đồng bộ tới Gateway!');
});

// Import Modal Logic
const modalImport = document.getElementById('modalImportSchedule');
const btnImportSchedule = document.getElementById('btnImportSchedule');
const btnCloseImportModal = document.getElementById('btnCloseImportModal');
const btnCancelImportModal = document.getElementById('btnCancelImportModal');
const btnConfirmImport = document.getElementById('btnConfirmImport');

btnImportSchedule?.addEventListener('click', () => {
  if (modalImport) {
    modalImport.classList.remove('hidden');
    modalImport.classList.add('flex');
  }
});

[btnCloseImportModal, btnCancelImportModal].forEach(b => {
  b?.addEventListener('click', () => {
    if (modalImport) {
      modalImport.classList.add('hidden');
      modalImport.classList.remove('flex');
    }
  });
});

btnConfirmImport?.addEventListener('click', () => {
  if (modalImport) {
    modalImport.classList.add('hidden');
    modalImport.classList.remove('flex');
  }
  showToast('Đã nạp 86 lịch vận hành từ file thành công!');
});

// Inline Detail Action Buttons
document.getElementById('btnPauseScheduleInline')?.addEventListener('click', () => {
  showToast('Đã tạm dừng lịch LH-001!');
});

document.getElementById('btnDuplicateScheduleInline')?.addEventListener('click', () => {
  showToast('Đã nhân bản kịch bản thành LH-012!');
});

document.getElementById('btnEditScheduleInline')?.addEventListener('click', () => {
  if (modalCreate) {
    modalCreate.classList.remove('hidden');
    modalCreate.classList.add('flex');
  }
  const codeEl = document.getElementById('newScheduleCode');
  const nameEl = document.getElementById('newScheduleName');
  if (codeEl) codeEl.value = 'LH-001';
  if (nameEl) nameEl.value = 'Chiếu sáng ban đêm (Phường Hải Châu)';
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
