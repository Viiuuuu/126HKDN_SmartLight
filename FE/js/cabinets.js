// ==================== JAVASCRIPT LOGIC FOR CABINETS ====================
// System Data & States
let cabinetsData = [
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
    note: 'Hoạt động bình thường • Đang 3 khởi động từ',
    routesList: [
      { name: 'Tuyến Hoàng Văn Thái (Đoạn 1 - Ngã Ba Huế)', length: '1.8 km', lights: 42, power: '4.2 kW', contactor: 'K1', status: 'BẬT 100%' },
      { name: 'Tuyến Tôn Đức Thắng nối dài', length: '1.2 km', lights: 28, power: '2.8 kW', contactor: 'K2', status: 'BẬT 100%' },
      { name: 'Nhánh ngõ 84 Hoàng Văn Thái', length: '0.6 km', lights: 14, power: '1.4 kW', contactor: 'K3', status: 'BẬT 100%' }
    ]
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
    note: 'Cảnh báo: Mất điện áp Pha 2 (Nhánh phía Tây)',
    routesList: [
      { name: 'Tuyến ven biển Võ Nguyên Giáp (Đoạn Mỹ Khê)', length: '2.4 km', lights: 56, power: '5.6 kW', contactor: 'K1', status: 'BẬT 100%' },
      { name: 'Tuyến nhánh đường Hồ Nghinh (Mất pha L2)', length: '1.5 km', lights: 34, power: '2.6 kW', contactor: 'K2', status: 'MẤT PHA' }
    ]
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
    note: 'RƠ LE BẢO VỆ ĐÃ NGẮT • Phát hiện đứt cáp nhánh D3',
    routesList: [
      { name: 'Tuyến đường Trần Cao Vân', length: '2.1 km', lights: 48, power: '0.0 kW', contactor: 'K1', status: 'TỰ CẮT CÁP' },
      { name: 'Tuyến nhánh Hà Huy Tập', length: '1.0 km', lights: 22, power: '0.0 kW', contactor: 'K2', status: 'ĐÃ NGẮT BẢO VỆ' },
      { name: 'Nhánh D3 Trần Cao Vân (Đứt cáp trụ 12-14)', length: '0.5 km', lights: 12, power: '0.0 kW', contactor: 'K3', status: 'NGUY HIỂM ĐỨT CÁP' }
    ]
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
    note: 'Mất kết nối viễn thông • Giữ nguyên lịch RTC',
    routesList: [
      { name: 'Tuyến Nguyễn Tất Thành (Cung biển)', length: '3.2 km', lights: 72, power: '7.2 kW', contactor: 'K1', status: 'LỊCH RTC' },
      { name: 'Tuyến nhánh Đặng Huy Trứ', length: '0.8 km', lights: 18, power: '1.8 kW', contactor: 'K2', status: 'LỊCH RTC' },
      { name: 'Tuyến kết nối Nguyễn Sinh Sắc', length: '1.4 km', lights: 32, power: '3.2 kW', contactor: 'K3', status: 'LỊCH RTC' },
      { name: 'Tuyến đường gom Xuân Thiều', length: '0.7 km', lights: 16, power: '1.6 kW', contactor: 'K4', status: 'LỊCH RTC' }
    ]
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
    note: 'Cảnh báo: Cửa tủ đang mở (Công tắc hành trình)',
    routesList: [
      { name: 'Tuyến đường 2 Tháng 9 (Cổ Viện Chàm)', length: '1.9 km', lights: 44, power: '4.4 kW', contactor: 'K1', status: 'BẬT 70%' },
      { name: 'Tuyến Bạch Đằng nối dài (Bờ Tây sông Hàn)', length: '1.6 km', lights: 38, power: '3.8 kW', contactor: 'K2', status: 'BẬT 70%' },
      { name: 'Tuyến kết nối Phan Đăng Lưu', length: '0.9 km', lights: 20, power: '2.0 kW', contactor: 'K3', status: 'BẬT 70%' }
    ]
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
    l3: { v: 220.5, a: 5.5 },
    dim: 30,
    cosPhi: 0.89,
    powerKw: 4.8,
    energyKwh: 68.2,
    mode: 'TIẾT KIỆM SÂU',
    source: 'Lưới điện (Ắc quy yếu)',
    note: 'Cảnh báo: Điện áp ắc quy dự phòng tụt dưới 11.2V',
    routesList: [
      { name: 'Tuyến đường Sơn Trà - Điện Ngọc', length: '2.5 km', lights: 58, power: '3.6 kW', contactor: 'K1', status: 'BẬT 30%' },
      { name: 'Tuyến Nguyễn Văn Thoại dẫn biển', length: '1.3 km', lights: 30, power: '1.2 kW', contactor: 'K2', status: 'BẬT 30%' }
    ]
  }
];

function apiField(record, camelCase, pascalCase) {
  return record?.[camelCase] ?? record?.[pascalCase];
}

function displayReading(value) {
  return value === null || value === undefined ? '--' : Number(value).toLocaleString('vi-VN');
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

async function loadCabinetsFromApi() {
  if (!window.api) return false;

  try {
    const [areas, apiCabinets, routes, lamps] = await Promise.all([
      window.api.get('/KhuVuc'),
      window.api.get('/TuChieuSang'),
      window.api.get('/TuyenChieuSang'),
      window.api.get('/DiemDen')
    ]);
    if (![areas, apiCabinets, routes, lamps].every(Array.isArray)) {
      throw new TypeError('API hạ tầng phải trả về danh sách hợp lệ.');
    }
    if (!apiCabinets.length) {
      showToast('Backend chưa có dữ liệu tủ; đang giữ danh sách mô phỏng.', 'warning');
      return false;
    }

    const areaNames = new Map(areas.map(area => [
      String(apiField(area, 'maKhuVuc', 'MaKhuVuc') || '').trim(),
      String(apiField(area, 'tenPhuongXa', 'TenPhuongXa') || '').trim()
    ]));
    const liveCabinets = await Promise.all(apiCabinets.map(async cabinet => {
      const id = String(apiField(cabinet, 'maTu', 'MaTu') || '').trim();
      const cabinetRoutes = routes.filter(route =>
        String(apiField(route, 'maTu', 'MaTu') || '').trim() === id
      );
      let reading = null;
      try {
        const readings = await window.api.get('/DuLieuGiamSatTu', { maTu: id, limit: 1 });
        if (Array.isArray(readings)) reading = readings[0] || null;
      } catch (error) {
        console.warn(`Không tải được dữ liệu giám sát tủ ${id}.`, error);
      }

      const phase = (voltageName, currentName) => ({
        v: displayReading(reading && apiField(reading, voltageName, voltageName[0].toUpperCase() + voltageName.slice(1))),
        a: displayReading(reading && apiField(reading, currentName, currentName[0].toUpperCase() + currentName.slice(1)))
      });
      const connected = Boolean(apiField(cabinet, 'trangThaiKetNoi', 'TrangThaiKetNoi'));
      const cabinetArea = String(apiField(cabinet, 'maKhuVuc', 'MaKhuVuc') || '').trim();
      const status = connected ? 'online' : 'offline';

      return {
        id,
        code: id,
        name: String(apiField(cabinet, 'tenTu', 'TenTu') || id),
        district: areaNames.get(cabinetArea) || cabinetArea || 'Chưa xác định',
        route: String(apiField(cabinet, 'diaChi', 'DiaChi') || ''),
        status,
        temp: '--',
        network: String(apiField(cabinet, 'maThietBi', 'MaThietBi') || 'Chưa xác định'),
        time: apiField(cabinet, 'lanKetNoiCuoi', 'LanKetNoiCuoi')
          ? new Date(apiField(cabinet, 'lanKetNoiCuoi', 'LanKetNoiCuoi')).toLocaleString('vi-VN')
          : 'Chưa có dữ liệu',
        l1: phase('dienApPha1', 'dongDienPha1'),
        l2: phase('dienApPha2', 'dongDienPha2'),
        l3: phase('dienApPha3', 'dongDienPha3'),
        dim: '—',
        cosPhi: '--',
        powerKw: apiField(reading, 'congSuat', 'CongSuat') ?? '--',
        energyKwh: apiField(reading, 'dienNang', 'DienNang') ?? '--',
        mode: String(apiField(cabinet, 'cheDoVanHanh', 'CheDoVanHanh') ?? 'Chưa xác định'),
        source: String(apiField(cabinet, 'trangThaiNguon', 'TrangThaiNguon') || 'Chưa xác định'),
        note: String(apiField(cabinet, 'moTa', 'MoTa') || ''),
        routesList: cabinetRoutes.map(route => {
          const routeId = String(apiField(route, 'maTuyen', 'MaTuyen') || '').trim();
          const routeLamps = lamps.filter(lamp =>
            String(apiField(lamp, 'maTuyen', 'MaTuyen') || '').trim() === routeId
          );
          return {
            name: String(apiField(route, 'tenTuyen', 'TenTuyen') || routeId),
            length: `${apiField(route, 'chieuDai', 'ChieuDai') ?? '—'} m`,
            lights: routeLamps.length,
            power: '—',
            contactor: '—',
            status: String(apiField(route, 'trangThaiHoatDong', 'TrangThaiHoatDong') ?? 'Chưa xác định')
          };
        })
      };
    }));

    cabinetsData = liveCabinets;
    populateTable();
    btnViewTable?.click();
    return true;
  } catch (error) {
    console.warn('Không tải được danh sách tủ từ API; giữ dữ liệu mô phỏng.', error);
    showToast('Không kết nối được Backend tủ; đang hiển thị danh sách mô phỏng.', 'warning');
    return false;
  }
}

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
  tableBody.innerHTML = cabinetsData.map(c => {
    const routesCount = c.routesList ? c.routesList.length : 3;
    return `
    <tr class="hover:bg-slate-50 transition cursor-pointer" data-code="${escapeHtml(c.code || c.id)}" data-id="${escapeHtml(c.id)}" onclick="goToCabinetDetail(this.dataset.code, event)">
      <td class="py-3 px-4 font-mono font-bold text-brand-600">${escapeHtml(c.code)}</td>
      <td class="py-3 px-4 font-bold text-slate-900 cursor-pointer hover:text-brand-600 hover:underline" onclick="openRoutesPopup(this.closest('tr').dataset.id, event)">${escapeHtml(c.name)}</td>
      <td class="py-3 px-4 text-slate-500">
        <span>${escapeHtml(c.district)}</span> •
        <button type="button" class="btn-routes-pill inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition shadow-2xs" onclick="openRoutesPopup(this.closest('tr').dataset.id, event)">
          🛣️ ${routesCount} tuyến đường
        </button>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
          c.status === 'online' ? 'bg-emerald-50 text-emerald-700' :
          c.status === 'warning' ? 'bg-amber-50 text-amber-700' :
          c.status === 'danger' ? 'bg-rose-100 text-rose-700 font-extrabold' :
          'bg-slate-100 text-slate-600'
        }">${escapeHtml(c.status.toUpperCase())}</span>
      </td>
      <td class="py-3 px-4 text-center font-mono">${escapeHtml(c.l1.v)} / ${escapeHtml(c.l2.v)} / ${escapeHtml(c.l3.v)}</td>
      <td class="py-3 px-4 text-center font-mono text-blue-600 font-semibold">${escapeHtml(c.l1.a)} / ${escapeHtml(c.l2.a)} / ${escapeHtml(c.l3.a)}</td>
      <td class="py-3 px-4 text-center font-mono font-bold">${escapeHtml(c.dim)}${c.dim === '—' ? '' : '%'}</td>
      <td class="py-3 px-4 text-center font-mono font-semibold">${escapeHtml(c.powerKw)} kW</td>
      <td class="py-3 px-4 text-center" onclick="event.stopPropagation()">
        <button type="button" class="px-2.5 py-1 text-[11px] font-bold text-brand-600 hover:bg-brand-50 rounded-lg transition" onclick="goToCabinetDetail(this.closest('tr').dataset.code, event)">
          Chi tiết
        </button>
      </td>
    </tr>
  `;
  }).join('');
}

btnViewGrid?.addEventListener('click', () => {
  if (!btnViewTable || !gridContainer || !tableContainer) return;
  btnViewGrid.className = 'p-1.5 rounded-md bg-white text-slate-800 shadow-sm transition';
  btnViewTable.className = 'p-1.5 rounded-md text-slate-500 hover:text-slate-800 transition';
  gridContainer.classList.remove('hidden');
  tableContainer.classList.add('hidden');
});

btnViewTable?.addEventListener('click', () => {
  if (!btnViewGrid || !gridContainer || !tableContainer) return;
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
  const control = [...document.querySelectorAll('#modalCabinetDetails input[type="checkbox"]')]
    .find(input => input.getAttribute('onchange')?.includes(`'${name}'`));
  const label = control?.closest('.border')?.querySelector('span.text-\\[10px\\]');
  if (label) label.textContent = state ? 'ĐANG ĐÓNG' : 'ĐANG NGẮT';
  showToast(`Mô phỏng: ${name} ${state ? 'đóng' : 'ngắt'}. Chưa gửi lệnh thật.`, 'warning');
}

function pingCabinetModem(code) {
  showToast(`Mô phỏng kiểm tra kết nối tủ ${code}; chưa gửi ping đến thiết bị thật.`, 'warning');
}

function saveCabinetSettings() {
  closeCabinetDetailsModal();
  showToast('Cấu hình chỉ được mô phỏng; Backend chưa có API lưu lệnh tủ.', 'warning');
}

function openInspectionModal(code) {
  openCabinetDetailsModal(code);
  showToast(`Chức năng phân tích lỗi tủ ${code} chưa được kết nối Backend.`, 'warning');
}

function openEmergencyModal(code) {
  openCabinetDetailsModal(code);
  showToast('Tính năng điều động chưa được kết nối; chưa gửi thông báo khẩn cấp.', 'danger');
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
[modalDetails, modalAdd, document.getElementById('modalRoutesPopup')].forEach(m => {
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
    closeRoutesPopup();
    closeCabinetDetailsModal();
    closeAddCabinetModal();
  }
});

document.getElementById('formAddCabinet')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const fields = [...e.currentTarget.querySelectorAll('input, select')];
  const [codeField, nameField, districtField, routeField, networkField, powerField] = fields;
  const code = codeField.value.trim();
  if (cabinetsData.some(cabinet => cabinet.code.toLowerCase() === code.toLowerCase())) {
    showToast(`Mã tủ ${code} đã tồn tại trong danh sách.`, 'danger');
    codeField.focus();
    return;
  }

  const district = districtField.selectedOptions[0]?.textContent.trim() || '';
  cabinetsData.unshift({
    id: code,
    code,
    name: nameField.value.trim(),
    district,
    route: routeField.value.trim(),
    status: 'offline',
    temp: '--',
    network: networkField.selectedOptions[0]?.textContent.trim() || 'Chưa xác định',
    time: 'Chưa có dữ liệu',
    l1: { v: '--', a: '--' },
    l2: { v: '--', a: '--' },
    l3: { v: '--', a: '--' },
    dim: '—',
    cosPhi: '--',
    powerKw: powerField.value || '--',
    energyKwh: '--',
    mode: 'Chưa xác định',
    source: 'Chưa xác định',
    note: '',
    routesList: []
  });
  populateTable();
  btnViewTable?.click();
  closeAddCabinetModal();
  showToast(`Đã thêm ${code} vào danh sách demo; chưa lưu lên Backend.`, 'warning');
});

// ==================== SYNC & CLOCK & TOAST ====================
document.getElementById('btnSyncStatus')?.addEventListener('click', async () => {
  const icon = document.getElementById('syncIcon');
  if (icon) icon.classList.add('animate-spin');
  try {
    const refreshed = await loadCabinetsFromApi();
    if (refreshed) showToast('Đã tải lại danh sách tủ từ Backend.');
  } finally {
    if (icon) icon.classList.remove('animate-spin');
  }
});

document.getElementById('btnExportData')?.addEventListener('click', () => {
  const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Mã tủ', 'Tên tủ', 'Khu vực', 'Vị trí', 'Trạng thái', 'Điện áp L1', 'Điện áp L2', 'Điện áp L3'],
    ...cabinetsData.map(item => [
      item.code, item.name, item.district, item.route, item.status,
      item.l1.v, item.l2.v, item.l3.v
    ])
  ];
  const csv = rows.map(row => row.map(quote).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'danh-sach-tu-chieu-sang.csv';
  link.click();
  URL.revokeObjectURL(url);
  showToast('Đã tải danh sách tủ dạng CSV.');
});

// Clock
const daysOfWeekCabinets = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function updateClock() {
  const now = new Date();
  const dayName = daysOfWeekCabinets[now.getDay()];
  const date = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const clockEl = document.getElementById('liveClockDisplay');
  if (clockEl) clockEl.textContent = `${dayName}, ${date}/${month}/${year}`;
  const timeSimple = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const footerEl = document.getElementById('footerLiveTime');
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

// Check URL parameters on page load
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view === 'list') {
    switchLeftPanelMode('list');
  } else {
    switchLeftPanelMode('tree');
  }
  loadCabinetsFromApi();
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

// ==================== NAVIGATION TO CABINET DETAIL ====================
function goToCabinetDetail(code, event) {
  if (event) {
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  const targetCode = code || 'TU-NTT-03';
  window.location.href = `cabinets-detail.html?code=${encodeURIComponent(targetCode)}`;
}

// ==================== ROUTES POPUP HANDLERS ====================
function openRoutesPopup(id, event, specificRoute) {
  if (event) {
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  const item = cabinetsData.find(c => c.id === id || c.code === id) || cabinetsData[0];
  const modal = document.getElementById('modalRoutesPopup');
  if (!modal) return;

  // Set title and metadata
  const titleEl = document.getElementById('popupRoutesTitle');
  const subEl = document.getElementById('popupRoutesSub');
  if (titleEl) titleEl.textContent = `Danh sách tuyến đường phụ trách - ${item.name}`;
  if (subEl) subEl.textContent = `Mã tủ: ${item.code} • Quận ${item.district} • Mạng: ${item.network}`;

  // Set summary stats
  const routes = item.routesList || [
    { name: `Tuyến ${item.route} nhánh 1`, length: '1.6 km', lights: 36, power: '3.6 kW', contactor: 'K1', status: 'BẬT 100%' },
    { name: `Tuyến ${item.route} nhánh 2`, length: '1.2 km', lights: 28, power: '2.8 kW', contactor: 'K2', status: 'BẬT 100%' }
  ];

  const countEl = document.getElementById('statPopupRoutesCount');
  const lengthEl = document.getElementById('statPopupLength');
  const lightsEl = document.getElementById('statPopupLights');
  const powerEl = document.getElementById('statPopupPower');

  if (countEl) countEl.textContent = `${routes.length} tuyến`;
  if (lengthEl) {
    const totalKm = routes.reduce((sum, r) => sum + (parseFloat(r.length) || 0), 0);
    lengthEl.textContent = `${totalKm.toFixed(1)} km`;
  }
  if (lightsEl) {
    const totalLights = routes.reduce((sum, r) => sum + (parseInt(r.lights) || 0), 0);
    lightsEl.textContent = `${totalLights} đèn`;
  }
  if (powerEl) {
    powerEl.textContent = `${item.powerKw || 10.4} kW`;
  }

  // Render table rows
  const tbody = document.getElementById('popupRoutesTableBody');
  if (tbody) {
    tbody.innerHTML = routes.map(r => {
      const isHighlighted = specificRoute && r.name.toLowerCase().includes(specificRoute.toLowerCase());
      return `
        <tr class="hover:bg-slate-50 transition ${isHighlighted ? 'bg-blue-50/80 font-bold' : ''}">
          <td class="py-2.5 px-3">
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>${r.name}</span>
            </div>
          </td>
          <td class="py-2.5 px-3 text-center font-mono text-slate-600">${r.length}</td>
          <td class="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">${r.lights} đèn</td>
          <td class="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">${r.power}</td>
          <td class="py-2.5 px-3 text-center">
            <span class="inline-flex px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700">${r.contactor}</span>
          </td>
          <td class="py-2.5 px-3 text-center">
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
              r.status.includes('100%') ? 'bg-emerald-50 text-emerald-700' :
              r.status.includes('70%') || r.status.includes('30%') ? 'bg-blue-50 text-brand-700' :
              r.status.includes('MẤT') || r.status.includes('NGUY HIỂM') || r.status.includes('CẮT') ? 'bg-rose-100 text-rose-700 font-extrabold' :
              'bg-slate-100 text-slate-600'
            }">${r.status}</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Nút chuyển sang trang chi tiết tủ từ popup
  const btnDetail = document.getElementById('btnPopupGoToCabinetDetail');
  if (btnDetail) {
    btnDetail.onclick = () => goToCabinetDetail(item.code || item.id);
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeRoutesPopup() {
  const modal = document.getElementById('modalRoutesPopup');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}
