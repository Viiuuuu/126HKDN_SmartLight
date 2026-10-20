// ==================== JAVASCRIPT LOGIC FOR CABINETS ====================
// System Data & States
const cabinetsData = [
  {
    id: 'T-TK003',
    code: 'T-HC003',
    name: 'T3 Hoàng Văn Thái',
    district: 'Thanh Khê',
    route: 'Hoàng Văn Thái',
    status: 'online',
    temp: '28.5°C',
    network: '4G VIETTEL',
    time: '24/10/2024 - 19:42:15',
    l1: { v: 221.4, a: 15.1 },
    l2: { v: 220.7, a: 15.3 },
    l3: { v: 221.8, a: 15.2 },
    dim: 100,
    cosPhi: 0.95,
    powerKw: 10.4,
    energyKwh: 148.2,
    mode: 'AUTO',
    source: 'Lưới 380V',
    note: 'Hoạt động bình thường • Đang 3 khởi động từ'
  },
  {
    id: 'T-ST011',
    code: 'T-ST011',
    name: 'T11 Võ Nguyên Giáp',
    district: 'Sơn Trà',
    route: 'Võ Nguyên Giáp',
    status: 'warning',
    temp: '29.1°C',
    network: '4G VINAPHONE',
    time: '24/10/2024 - 19:41:20',
    l1: { v: 221.0, a: 17.4 },
    l2: { v: 0.0, a: 0.0 },
    l3: { v: 220.5, a: 16.8 },
    dim: 100,
    cosPhi: 0.93,
    powerKw: 8.2,
    energyKwh: 94.5,
    mode: 'AUTO',
    source: 'Lưới 380V',
    note: 'Cảnh báo: Mất điện áp Pha 2 (Nhánh phía Tây)'
  },
  {
    id: 'T-TK009',
    code: 'T-TK009',
    name: 'T9 Trần Cao Vân',
    district: 'Thanh Khê',
    route: 'Trần Cao Vân',
    status: 'danger',
    temp: '38.2°C',
    network: '4G VIETTEL (LỖI ĐỎ)',
    time: '24/10/2024 - 19:35:00',
    l1: { v: 0.0, a: 0.0 },
    l2: { v: 0.0, a: 0.0 },
    l3: { v: 0.0, a: 0.0 },
    dim: 0,
    cosPhi: 0.00,
    powerKw: 0.0,
    energyKwh: 0.0,
    mode: 'TỰ CẮT CÁP',
    source: 'RƠ LE BẢO VỆ NGẮT',
    note: 'RƠ LE BẢO VỆ ĐÃ NGẮT • Phát hiện đứt cáp nhánh D3'
  },
  {
    id: 'T-TK007',
    code: 'T-TK007',
    name: 'T7 Nguyễn Tất Thành',
    district: 'Thanh Khê',
    route: 'Nguyễn Tất Thành',
    status: 'offline',
    temp: '--',
    network: '4G VIETTEL',
    time: 'Gián đoạn: 24/10/2024',
    l1: { v: '--', a: '--' },
    l2: { v: '--', a: '--' },
    l3: { v: '--', a: '--' },
    dim: 'RTC',
    cosPhi: '--',
    powerKw: '--',
    energyKwh: '--',
    mode: 'LỊCH RTC',
    source: 'Lưới điện',
    note: 'Mất kết nối viễn thông • Giữ nguyên lịch RTC'
  },
  {
    id: 'T-HC002',
    code: 'T-HC002',
    name: 'T2 Đường 2/9',
    district: 'Hải Châu',
    route: 'Đường 2 Tháng 9',
    status: 'online',
    temp: '27.8°C',
    network: '4G VINAPHONE',
    time: '24/10/2024 - 19:42:00',
    l1: { v: 221.1, a: 12.4 },
    l2: { v: 221.3, a: 12.4 },
    l3: { v: 220.9, a: 12.5 },
    dim: 70,
    cosPhi: 0.91,
    powerKw: 8.6,
    energyKwh: 112.4,
    mode: 'TIẾT KIỆM',
    source: 'Lưới ổn định',
    note: 'Cảnh báo: Cửa tủ đang mở (Công tắc hành trình)'
  },
  {
    id: 'T-ST013',
    code: 'T-ST013',
    name: 'T13 Sơn Trà Điện Ngọc',
    district: 'Sơn Trà',
    route: 'Sơn Trà Điện Ngọc',
    status: 'warning',
    temp: '28.2°C',
    network: '4G VIETTEL',
    time: '24/10/2024 - 19:40:45',
    l1: { v: 220.0, a: 5.4 },
    l2: { v: 221.0, a: 5.3 },
    l3: { v: 220.2, a: 5.4 },
    dim: 30,
    cosPhi: 0.88,
    powerKw: 3.7,
    energyKwh: 51.1,
    mode: 'LỊCH TIẾT KIỆM',
    source: 'Ắc quy DC dự phòng',
    note: 'Cảnh báo: Ắc quy yếu 11.2V'
  }
];

let currentViewMode = 'tree'; // 'tree' | 'list'

// ==================== PANEL MODE SWITCHER ====================
function switchLeftPanelMode(mode) {
  currentViewMode = mode;
  const btnTree = document.getElementById('btnSwitchToTree');
  const btnList = document.getElementById('btnSwitchToList');
  const treeView = document.getElementById('treeViewContent');
  const listView = document.getElementById('listViewContent');
  const titleText = document.getElementById('leftPanelTitleText');
  const titleIcon = document.getElementById('leftPanelIcon');
  const notice = document.getElementById('hierarchyNotice');
  const collapseBtn = document.getElementById('btnCollapseAllText');
  const searchInput = document.getElementById('leftFilterInput');

  if (mode === 'tree') {
    if (btnTree) btnTree.classList.add('active');
    if (btnList) btnList.classList.remove('active');
    if (treeView) treeView.classList.remove('hidden');
    if (listView) listView.classList.add('hidden');
    if (titleText) titleText.textContent = 'Cây quản lý tủ';
    if (titleIcon) titleIcon.textContent = 'account_tree';
    if (notice) notice.textContent = 'Phân cấp: Khu vực | Tuyến | Điểm đèn';
    if (collapseBtn) collapseBtn.textContent = 'Thu gọn hết';
    if (searchInput) searchInput.placeholder = 'Lọc theo tên khu vực, tuyến, điểm đèn...';
    showToast('Đang xem: Cây quản lý phân cấp tủ & điểm đèn');
  } else {
    if (btnList) btnList.classList.add('active');
    if (btnTree) btnTree.classList.remove('active');
    if (listView) listView.classList.remove('hidden');
    if (treeView) treeView.classList.add('hidden');
    if (titleText) titleText.textContent = 'Danh sách tủ';
    if (titleIcon) titleIcon.textContent = 'list_alt';
    if (notice) notice.textContent = 'Phân cấp: Khu vực | Tuyến | Tủ';
    if (collapseBtn) collapseBtn.textContent = 'Thu gọn';
    if (searchInput) searchInput.placeholder = 'Lọc theo tên khu vực, tuyến, phường...';
    showToast('Đang xem: Danh sách tủ theo Phường & Tuyến');
  }

  // Sync URL without refresh
  const url = new URL(window.location);
  url.searchParams.set('view', mode);
  window.history.replaceState({}, '', url);
}

// Toggle Tree Node Expand/Collapse
function toggleTreeNode(event, childId) {
  event.stopPropagation();
  const chevron = event.currentTarget;
  const children = document.getElementById(childId);
  if (!children) return;

  const isExpanded = chevron.classList.contains('expanded');
  if (isExpanded) {
    chevron.classList.remove('expanded');
    children.classList.add('collapsed');
  } else {
    chevron.classList.add('expanded');
    children.classList.remove('collapsed');
  }
}

// Toggle Ward in List View
function toggleWardGroup(header) {
  const body = header.nextElementSibling;
  if (body) {
    body.classList.toggle('hidden');
  }
}

// Toggle All Expand
let isAllExpanded = true;
function toggleCollapseAll() {
  isAllExpanded = !isAllExpanded;
  const chevrons = document.querySelectorAll('.tree-chevron');
  const children = document.querySelectorAll('.tree-children');
  const btn = document.getElementById('btnCollapseAllText');

  if (isAllExpanded) {
    chevrons.forEach(c => c.classList.add('expanded'));
    children.forEach(c => c.classList.remove('collapsed'));
    if (btn) btn.textContent = 'Thu gọn hết';
  } else {
    chevrons.forEach(c => c.classList.remove('expanded'));
    children.forEach(c => c.classList.add('collapsed'));
    if (btn) btn.textContent = 'Mở rộng hết';
  }
}

// Focus Card on Right
function focusCabinetCard(code) {
  const targetCard = document.querySelector(`[data-code="${code}"]`);
  if (targetCard) {
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetCard.classList.add('ring-4', 'ring-brand-500/30', 'scale-[1.01]');
    setTimeout(() => {
      targetCard.classList.remove('ring-4', 'ring-brand-500/30', 'scale-[1.01]');
    }, 1800);
    showToast(`Đã chọn tủ: ${targetCard.getAttribute('data-name')}`);
  }
}

function handleTreeNodeClick(district) {
  showToast(`Lọc tủ theo: ${district.toUpperCase()}`);
}

function handleCheckboxClick(e, id) {
  e.stopPropagation();
  showToast(`Đã cập nhật trạng thái chọn nhóm ${id}`);
}

// ==================== FILTERING LOGIC ====================
function selectMainTab(tabKey, btn) {
  document.querySelectorAll('#mainTabList button').forEach(b => {
    b.className = 'px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition';
  });
  btn.className = 'px-4 py-2 text-xs font-bold rounded-xl transition bg-slate-900 text-white shadow-sm';
  applyFilters();
}

function filterByDim(dimVal, btn) {
  document.querySelectorAll('#dimFilterGroup button').forEach(b => {
    b.classList.remove('bg-slate-800', 'text-white', 'active');
    b.classList.add('bg-white', 'text-slate-700');
  });
  btn.classList.add('bg-slate-800', 'text-white', 'active');
  btn.classList.remove('bg-white', 'text-slate-700');
  applyFilters();
}

function filterByCard(type) {
  const mainTabs = document.querySelectorAll('#mainTabList button');
  if (type === 'all' && mainTabs[0]) selectMainTab('all', mainTabs[0]);
  if (type === 'online' && mainTabs[0]) selectMainTab('all', mainTabs[0]);
  if (type === 'offline' && mainTabs[1]) selectMainTab('offline', mainTabs[1]);
  if (type === 'warning' && mainTabs[2]) selectMainTab('warning', mainTabs[2]);
}

function applyFilters() {
  const activeDimBtn = document.querySelector('#dimFilterGroup button.active');
  const activeDim = activeDimBtn ? activeDimBtn.getAttribute('data-dim') : 'all';
  const searchInput = document.getElementById('cabinetSearchInput');
  const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const cards = document.querySelectorAll('.cabinet-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const status = card.getAttribute('data-status');
    const dim = card.getAttribute('data-dim');
    const name = card.getAttribute('data-name').toLowerCase();
    const code = card.getAttribute('data-code').toLowerCase();

    let matchDim = (activeDim === 'all') || (activeDim === dim) || (activeDim === 'warning' && (status === 'warning' || status === 'danger'));
    let matchSearch = !searchText || name.includes(searchText) || code.includes(searchText);

    if (matchDim && matchSearch) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });
}

document.getElementById('cabinetSearchInput')?.addEventListener('input', applyFilters);

// Filter inside Left Panel
document.getElementById('leftFilterInput')?.addEventListener('input', (e) => {
  const val = e.target.value.toLowerCase().trim();
  const treeRows = document.querySelectorAll('.tree-node-row');
  const listItems = document.querySelectorAll('.cabinet-list-item');

  treeRows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.opacity = (!val || text.includes(val)) ? '1' : '0.3';
  });

  listItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = (!val || text.includes(val)) ? 'flex' : 'none';
  });
});

// ==================== VIEW GRID VS TABLE SWITCHER ====================
const btnViewGrid = document.getElementById('btnViewGrid');
const btnViewTable = document.getElementById('btnViewTable');
const gridContainer = document.getElementById('cabinetsGridContainer');
const tableContainer = document.getElementById('cabinetsTableContainer');
const tableBody = document.getElementById('cabinetTableBody');

function populateTable() {
  if (!tableBody) return;
  tableBody.innerHTML = cabinetsData.map(c => `
    <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="openCabinetDetailsModal('${c.id}')">
      <td class="py-3 px-4 font-mono font-bold text-brand-600">${c.code}</td>
      <td class="py-3 px-4 font-bold text-slate-900">${c.name}</td>
      <td class="py-3 px-4 text-slate-500">${c.district} • ${c.route}</td>
      <td class="py-3 px-4 text-center">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
          c.status === 'online' ? 'bg-emerald-50 text-emerald-700' :
          c.status === 'warning' ? 'bg-amber-50 text-amber-700' :
          c.status === 'danger' ? 'bg-rose-100 text-rose-700 font-extrabold' :
          'bg-slate-100 text-slate-600'
        }">${c.status.toUpperCase()}</span>
      </td>
      <td class="py-3 px-4 text-center font-mono">${c.l1.v} / ${c.l2.v} / ${c.l3.v}</td>
      <td class="py-3 px-4 text-center font-mono text-blue-600 font-semibold">${c.l1.a} / ${c.l2.a} / ${c.l3.a}</td>
      <td class="py-3 px-4 text-center font-mono font-bold">${c.dim}%</td>
      <td class="py-3 px-4 text-center font-mono font-semibold">${c.powerKw} kW</td>
      <td class="py-3 px-4 text-center" onclick="event.stopPropagation()">
        <button class="px-2.5 py-1 text-[11px] font-bold text-brand-600 hover:bg-brand-50 rounded-lg transition" onclick="openCabinetDetailsModal('${c.id}')">
          Chi tiết
        </button>
      </td>
    </tr>
  `).join('');
}

btnViewGrid?.addEventListener('click', () => {
  btnViewGrid.className = 'p-1.5 rounded-md bg-white text-slate-800 shadow-sm transition';
  btnViewTable.className = 'p-1.5 rounded-md text-slate-500 hover:text-slate-800 transition';
  gridContainer.classList.remove('hidden');
  tableContainer.classList.add('hidden');
});

btnViewTable?.addEventListener('click', () => {
  btnViewTable.className = 'p-1.5 rounded-md bg-white text-slate-800 shadow-sm transition';
  btnViewGrid.className = 'p-1.5 rounded-md text-slate-500 hover:text-slate-800 transition';
  populateTable();
  gridContainer.classList.add('hidden');
  tableContainer.classList.remove('hidden');
});

// ==================== MODAL HANDLERS ====================
const modalDetails = document.getElementById('modalCabinetDetails');
const modalAdd = document.getElementById('modalAddCabinet');

function openCabinetDetailsModal(id) {
  const item = cabinetsData.find(c => c.id === id || c.code === id) || cabinetsData[0];
  const titleEl = document.getElementById('detailCabinetTitle');
  const subEl = document.getElementById('detailCabinetSub');
  if (titleEl) titleEl.textContent = `Chi tiết tủ: ${item.name}`;
  if (subEl) subEl.textContent = `Mã tủ: ${item.code} • Quận ${item.district} • ${item.network}`;
  
  const l1v = document.getElementById('detailL1V');
  const l1a = document.getElementById('detailL1A');
  const l2v = document.getElementById('detailL2V');
  const l2a = document.getElementById('detailL2A');
  const l3v = document.getElementById('detailL3V');
  const l3a = document.getElementById('detailL3A');
  if (l1v) l1v.textContent = `${item.l1.v} V`;
  if (l1a) l1a.textContent = `${item.l1.a} A`;
  if (l2v) l2v.textContent = `${item.l2.v} V`;
  if (l2a) l2a.textContent = `${item.l2.a} A`;
  if (l3v) l3v.textContent = `${item.l3.v} V`;
  if (l3a) l3a.textContent = `${item.l3.a} A`;
  
  const dimNum = parseInt(item.dim) || 0;
  const slider = document.getElementById('detailDimSlider');
  const display = document.getElementById('detailDimDisplay');
  if (slider) slider.value = dimNum;
  if (display) display.textContent = `${dimNum}%`;

  if (modalDetails) {
    modalDetails.classList.remove('hidden');
    modalDetails.classList.add('flex');
  }
}

function closeCabinetDetailsModal() {
  if (modalDetails) {
    modalDetails.classList.add('hidden');
    modalDetails.classList.remove('flex');
  }
}

function updateModalDim(val) {
  const display = document.getElementById('detailDimDisplay');
  if (display) display.textContent = `${val}%`;
}

function toggleContactor(name, state) {
  showToast(`Đã gửi lệnh ${state ? 'ĐÓNG' : 'NGẮT'} khởi động từ ${name}`);
}

function pingCabinetModem(code) {
  showToast(`Đang Ping tới modem tủ ${code}... Độ trễ 42ms (Rất tốt)`);
}

function saveCabinetSettings() {
  closeCabinetDetailsModal();
  showToast('Đã lưu cấu hình và phát lệnh điều khiển thành công!');
}

function openInspectionModal(code) {
  openCabinetDetailsModal(code);
  showToast(`Đang mở giao diện phân tích lỗi điện áp Pha 2 tủ ${code}`);
}

function openEmergencyModal(code) {
  openCabinetDetailsModal(code);
  showToast('CẢNH BÁO KHẨN CẤP: Đã gửi thông báo điều động đội sửa chữa cơ động EVN!', 'danger');
}

// Modal Add Cabinet
document.getElementById('btnOpenAddCabinetModal')?.addEventListener('click', () => {
  if (modalAdd) {
    modalAdd.classList.remove('hidden');
    modalAdd.classList.add('flex');
  }
});

function closeAddCabinetModal() {
  if (modalAdd) {
    modalAdd.classList.add('hidden');
    modalAdd.classList.remove('flex');
  }
}

// Close modals on backdrop click
[modalDetails, modalAdd].forEach(m => {
  m?.addEventListener('click', (e) => {
    if (e.target === m) {
      closeCabinetDetailsModal();
      closeAddCabinetModal();
    }
  });
});

// Close modals on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCabinetDetailsModal();
    closeAddCabinetModal();
  }
});

document.getElementById('formAddCabinet')?.addEventListener('submit', (e) => {
  e.preventDefault();
  closeAddCabinetModal();
  showToast('Đã thêm tủ điều khiển chiếu sáng mới thành công!');
});

// ==================== SYNC & CLOCK & TOAST ====================
document.getElementById('btnSyncStatus')?.addEventListener('click', () => {
  const icon = document.getElementById('syncIcon');
  if (icon) icon.classList.add('animate-spin');
  setTimeout(() => {
    if (icon) icon.classList.remove('animate-spin');
    showToast('Đã hoàn tất đồng bộ tức thời 950 tủ điều khiển trên toàn TP!');
  }, 1200);
});

document.getElementById('btnExportData')?.addEventListener('click', () => {
  showToast('Đang tạo và tải xuống file báo cáo Danh_Sach_Tu_Chieu_Sang_DaNang.xlsx');
});

// Clock
function updateClock() {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} GMT+7`;
  const timeSimple = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const el = document.getElementById('liveTime');
  const footerEl = document.getElementById('footerLiveTime');
  if (el) el.textContent = timeStr;
  if (footerEl) footerEl.textContent = timeSimple;
}
setInterval(updateClock, 1000);
updateClock();

// Toast
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

// Check URL parameters on page load
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view === 'list') {
    switchLeftPanelMode('list');
  } else {
    switchLeftPanelMode('tree');
  }
});

// Mobile Sidebar
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
