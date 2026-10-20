// ==================== JAVASCRIPT LOGIC FOR ALERTS ====================

// Master Alerts Data (18 items)
const alertItems = [
  {
    stt: 1,
    id: "ALR-20241024-001",
    time: "09:15 24/10/2024",
    type: "Quá dòng",
    category: "tech",
    categoryLabel: "Sự cố Kỹ thuật",
    param: "Dòng điện (32 A)",
    location: "Tủ A1 - Tuyến 01",
    district: "Quận Ba Đình",
    severity: "Cao",
    status: "Chưa xử lý",
    headline: "Quá dòng trên Tuyến 01",
    description: "Dòng điện đo được qua rơle tủ A1 vượt quá ngưỡng an toàn định mức cho phép (32 A > 25 A). Cần kiểm tra rò rỉ hoặc ngắn mạch các pha chiếu sáng trên tuyến."
  },
  {
    stt: 2,
    id: "ALR-20241024-002",
    time: "08:50 24/10/2024",
    type: "Mất điện lưới",
    category: "ops",
    categoryLabel: "Sự cố Vận hành",
    param: "Điện áp (0 V)",
    location: "Tủ B2 - Tuyến 03",
    district: "Quận Hoàn Kiếm",
    severity: "Cao",
    status: "Chưa xử lý",
    headline: "Mất điện lưới diện rộng Tủ B2",
    description: "Điện áp đầu vào tủ B2 giảm về 0V trên cả 3 pha. Cần liên hệ điều độ lưới điện khu vực kiểm tra cấp nguồn."
  },
  {
    stt: 3,
    id: "ALR-20241024-003",
    time: "08:12 24/10/2024",
    type: "Mất kết nối tủ",
    category: "ops",
    categoryLabel: "Sự cố Vận hành",
    param: "Offline",
    location: "Tủ C3 - Tuyến 02",
    district: "Quận Đống Đa",
    severity: "Trung bình",
    status: "Đang xử lý",
    headline: "Mất tín hiệu kết nối LoRa/4G Tủ C3",
    description: "Mất tín hiệu kết nối LoRa/4G NB-IoT liên tục trong 15 phút. KTV đã được điều động đến kiểm tra anten và sim gateway."
  },
  {
    stt: 4,
    id: "ALR-20241024-004",
    time: "07:45 24/10/2024",
    type: "Nhiệt độ cao",
    category: "tech",
    categoryLabel: "Sự cố Kỹ thuật",
    param: "Nhiệt độ (62 °C)",
    location: "Tủ A1 - Tuyến 01",
    district: "Quận Ba Đình",
    severity: "Trung bình",
    status: "Đang xử lý",
    headline: "Nhiệt độ khoang tủ vượt 60°C",
    description: "Cảm biến nhiệt độ trong khoang tủ báo 62°C vượt ngưỡng tiêu chuẩn (55°C). Quạt thông gió làm mát tủ cần được kiểm tra."
  },
  {
    stt: 5,
    id: "ALR-20241024-005",
    time: "06:30 24/10/2024",
    type: "Quá áp",
    category: "tech",
    categoryLabel: "Sự cố Kỹ thuật",
    param: "Điện áp (260 V)",
    location: "Tủ D4 - Tuyến 04",
    district: "Quận Cầu Giấy",
    severity: "Cao",
    status: "Chưa xử lý",
    headline: "Quá áp tức thời 260V đầu ngày",
    description: "Điện áp pha A tăng vọt 260V vào thời điểm ngắt tải đầu ngày. Cần rà soát ổn áp bảo vệ và biến áp trạm."
  },
  {
    stt: 6,
    id: "ALR-20241024-006",
    time: "05:20 24/10/2024",
    type: "Mở cửa tủ",
    category: "ops",
    categoryLabel: "Sự cố Vận hành",
    param: "Trạng thái (Mở)",
    location: "Tủ B2 - Tuyến 03",
    district: "Quận Hoàn Kiếm",
    severity: "Trung bình",
    status: "Đã xử lý",
    headline: "Cảnh báo mở cửa tủ ngoài giờ quy định",
    description: "Công tắc hành trình báo cửa tủ mở ngoài giờ bảo trì. Đội tuần tra đã xác minh đóng chốt an toàn lúc 05:40."
  },
  {
    stt: 7,
    id: "ALR-20241024-007",
    time: "04:10 24/10/2024",
    type: "Mất pha",
    category: "tech",
    categoryLabel: "Sự cố Kỹ thuật",
    param: "Pha B lệch",
    location: "Tủ C3 - Tuyến 02",
    district: "Quận Đống Đa",
    severity: "Cao",
    status: "Chưa xử lý",
    headline: "Lệch pha sụt áp nghiêm trọng",
    description: "Lệch pha B sụt áp nghiêm trọng gây chập chờn cho nhánh đèn LED 150W. Cần cân pha khẩn cấp."
  },
  {
    stt: 8,
    id: "ALR-20241024-008",
    time: "02:35 24/10/2024",
    type: "Ắc quy điện áp thấp",
    category: "ops",
    categoryLabel: "Sự cố Vận hành",
    param: "Điện áp (10.5 V)",
    location: "Tủ A1 - Tuyến 01",
    district: "Quận Ba Đình",
    severity: "Trung bình",
    status: "Đã xử lý",
    headline: "Ắc quy UPS dự phòng sụt áp",
    description: "Nguồn dự phòng UPS tụt áp dưới ngưỡng danh định. Đã kích hoạt sạc phục hồi và thay cell pin dự phòng."
  },
  {
    stt: 9,
    id: "ALR-20241024-009",
    time: "01:20 24/10/2024",
    type: "Đứt rơle cáp",
    category: "tech",
    categoryLabel: "Sự cố Kỹ thuật",
    param: "Lỗi tiếp điểm Cáp",
    location: "Tủ B2 - Tuyến 03",
    district: "Quận Hoàn Kiếm",
    severity: "Thấp",
    status: "Đã xử lý",
    headline: "Hở tiếp điểm rơle điều khiển lộ 02",
    description: "Tiếp điểm contactor nhánh 02 tiếp xúc kém. Đã vệ sinh bề mặt tiếp điểm và siết ốc cố định cáp an toàn."
  },
  {
    stt: 10,
    id: "ALR-20241024-010",
    time: "00:50 24/10/2024",
    type: "Quá dòng",
    category: "tech",
    categoryLabel: "Sự cố Kỹ thuật",
    param: "Dòng điện (26 A)",
    location: "Tủ D4 - Tuyến 04",
    district: "Quận Cầu Giấy",
    severity: "Trung bình",
    status: "Đang xử lý",
    headline: "Dòng điện tiệm cận ngưỡng ngắt bảo vệ",
    description: "Dòng điện pha C tiệm cận ngưỡng ngắt bảo vệ. KTV đang đo dòng tại các cột đèn dọc tuyến để cô lập điểm rò rỉ."
  },
  {
    stt: 11,
    id: "ALR-20241024-011",
    time: "00:40 24/10/2024",
    type: "Nhiệt độ cao",
    category: "tech",
    categoryLabel: "Sự cố Kỹ thuật",
    param: "Nhiệt độ (58 °C)",
    location: "Tủ A1 - Tuyến 01",
    district: "Quận Ba Đình",
    severity: "Trung bình",
    status: "Đang xử lý",
    headline: "Nhiệt độ tủ tăng sau giờ cao điểm",
    description: "Nhiệt độ trong tủ tăng cao sau giờ cao điểm. Nhân viên kỹ thuật đang kiểm tra thông gió và tải thiết bị."
  },
  {
    stt: 12,
    id: "ALR-20241024-012",
    time: "00:35 24/10/2024",
    type: "Mất kết nối tủ",
    category: "ops",
    categoryLabel: "Sự cố Vận hành",
    param: "Offline",
    location: "Tủ C3 - Tuyến 02",
    district: "Quận Đống Đa",
    severity: "Thấp",
    status: "Đã xử lý",
    headline: "Tín hiệu kết nối tủ C3 gián đoạn",
    description: "Tín hiệu kết nối gián đoạn trong thời gian ngắn và đã tự khôi phục. Đang theo dõi trạng thái đường truyền."
  },
  {
    stt: 13,
    id: "ALR-20241024-013",
    time: "00:30 24/10/2024",
    type: "Mất pha",
    category: "tech",
    categoryLabel: "Sự cố Kỹ thuật",
    param: "Pha C thấp",
    location: "Tủ D4 - Tuyến 04",
    district: "Quận Cầu Giấy",
    severity: "Trung bình",
    status: "Chưa xử lý",
    headline: "Điện áp pha C thấp hơn ngưỡng",
    description: "Điện áp pha C thấp hơn ngưỡng vận hành. Cần kiểm tra đầu nối và nguồn cấp tại tủ."
  },
  {
    stt: 14,
    id: "ALR-20241024-014",
    time: "00:25 24/10/2024",
    type: "Mở cửa tủ",
    category: "ops",
    categoryLabel: "Sự cố Vận hành",
    param: "Trạng thái (Mở)",
    location: "Tủ B2 - Tuyến 03",
    district: "Quận Hoàn Kiếm",
    severity: "Thấp",
    status: "Đã xử lý",
    headline: "Cửa tủ B2 mở ngoài lịch bảo trì",
    description: "Cảm biến cửa ghi nhận trạng thái mở ngoài lịch. Đội vận hành đã xác minh và đóng cửa tủ."
  },
  {
    stt: 15,
    id: "ALR-20241024-015",
    time: "00:20 24/10/2024",
    type: "Quá áp",
    category: "tech",
    categoryLabel: "Sự cố Kỹ thuật",
    param: "Điện áp (253 V)",
    location: "Tủ A1 - Tuyến 01",
    district: "Quận Ba Đình",
    severity: "Trung bình",
    status: "Đang xử lý",
    headline: "Điện áp đầu ra vượt mức vận hành",
    description: "Điện áp đầu ra tăng vượt mức khuyến nghị trong thời gian ngắn. Kỹ thuật viên đang kiểm tra bộ ổn áp."
  },
  {
    stt: 16,
    id: "ALR-20241024-016",
    time: "00:15 24/10/2024",
    type: "Ắc quy điện áp thấp",
    category: "ops",
    categoryLabel: "Sự cố Vận hành",
    param: "Điện áp (11.2 V)",
    location: "Tủ C3 - Tuyến 02",
    district: "Quận Đống Đa",
    severity: "Thấp",
    status: "Đã xử lý",
    headline: "Điện áp bộ lưu điện dự phòng thấp",
    description: "Bộ lưu điện dự phòng có mức điện áp thấp. Đội vận hành đã kiểm tra nguồn sạc và tiếp tục theo dõi."
  },
  {
    stt: 17,
    id: "ALR-20241024-017",
    time: "00:10 24/10/2024",
    type: "Đứt rơle cáp",
    category: "tech",
    categoryLabel: "Sự cố Kỹ thuật",
    param: "Lỗi tiếp điểm",
    location: "Tủ D4 - Tuyến 04",
    district: "Quận Cầu Giấy",
    severity: "Trung bình",
    status: "Chưa xử lý",
    headline: "Tiếp điểm rơle có dấu hiệu không ổn định",
    description: "Trạng thái tiếp điểm rơle không ổn định. Cần kiểm tra, vệ sinh tiếp điểm và siết lại đầu cáp."
  },
  {
    stt: 18,
    id: "ALR-20241024-018",
    time: "00:05 24/10/2024",
    type: "Mất điện lưới",
    category: "ops",
    categoryLabel: "Sự cố Vận hành",
    param: "Điện áp (0 V)",
    location: "Tủ B2 - Tuyến 03",
    district: "Quận Hoàn Kiếm",
    severity: "Thấp",
    status: "Đang xử lý",
    headline: "Mất nguồn cấp trong thời gian ngắn",
    description: "Nguồn cấp tại tủ mất trong thời gian ngắn và đã được khôi phục. Đang tiếp tục giám sát nguồn lưới."
  }
];

let currentSelectedId = "ALR-20241024-001";
const pageSize = 10;
let currentPage = 1;

try {
  const statusOverrides = JSON.parse(sessionStorage.getItem('smartlight_alert_status_overrides') || '{}');
  const validStatuses = new Set(['Chưa xử lý', 'Đang xử lý', 'Đã xử lý']);
  alertItems.forEach(item => {
    if (validStatuses.has(statusOverrides[item.id])) item.status = statusOverrides[item.id];
  });
} catch (error) {
  console.error('Không thể đọc trạng thái cảnh báo đã cập nhật.', error);
}

// Toast Generator
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

// Render Table Rows
function renderTable() {
  const tbody = document.getElementById('alertTableBody');
  if (!tbody) return;
  const filterGroup = document.getElementById('filterGroup');
  const filterType = document.getElementById('filterType');
  const filterSeverity = document.getElementById('filterSeverity');
  const filterStatus = document.getElementById('filterStatus');
  const searchInput = document.getElementById('searchInput');

  const filterGroupVal = filterGroup ? filterGroup.value : 'all';
  const filterTypeVal = filterType ? filterType.value : 'all';
  const filterSeverityVal = filterSeverity ? filterSeverity.value : 'all';
  const filterStatusVal = filterStatus ? filterStatus.value : 'all';
  const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const filtered = alertItems.filter(item => {
    if (filterGroupVal !== 'all' && item.category !== filterGroupVal) return false;
    if (filterTypeVal !== 'all' && item.type !== filterTypeVal) return false;
    if (filterSeverityVal !== 'all' && item.severity !== filterSeverityVal) return false;
    if (filterStatusVal !== 'all' && item.status !== filterStatusVal) return false;
    if (searchVal) {
      const match = item.id.toLowerCase().includes(searchVal) ||
                    item.location.toLowerCase().includes(searchVal) ||
                    item.type.toLowerCase().includes(searchVal) ||
                    item.param.toLowerCase().includes(searchVal);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(firstIndex, firstIndex + pageSize);
  const countEl = document.getElementById('tableRecordCount');
  const showingEl = document.getElementById('paginationShowing');
  const totalEl = document.getElementById('paginationTotal');
  if (countEl) countEl.textContent = `${filtered.length} bản ghi`;
  if (showingEl) showingEl.textContent = filtered.length ? `${firstIndex + 1} - ${firstIndex + pageItems.length}` : '0';
  if (totalEl) totalEl.textContent = String(filtered.length);

  const countBySeverity = (severity) => alertItems.filter(item => item.severity === severity).length;
  const statTotal = document.getElementById('statTotalCount');
  const statHigh = document.getElementById('statHighCount');
  const statMedium = document.getElementById('statMediumCount');
  const statLow = document.getElementById('statLowCount');
  if (statTotal) statTotal.textContent = String(alertItems.length);
  if (statHigh) statHigh.textContent = String(countBySeverity('Cao'));
  if (statMedium) statMedium.textContent = String(countBySeverity('Trung bình'));
  if (statLow) statLow.textContent = String(countBySeverity('Thấp'));
  const openCount = document.getElementById('alertOpenCount');
  if (openCount) openCount.textContent = `${alertItems.length} đang ghi nhận`;
  const urgentCount = document.getElementById('alertUrgentCount');
  if (urgentCount) urgentCount.textContent = `${countBySeverity('Cao')} Khẩn`;
  const mediumCount = document.getElementById('alertMediumCount');
  if (mediumCount) mediumCount.textContent = `${countBySeverity('Trung bình')} Vừa`;
  const lowCount = document.getElementById('alertLowCount');
  if (lowCount) lowCount.textContent = `${countBySeverity('Thấp')} Thấp`;
  const sidebarAlertCount = document.getElementById('sidebarAlertCount');
  if (sidebarAlertCount) sidebarAlertCount.textContent = String(alertItems.filter(item => item.status !== 'Đã xử lý').length);

  renderPagination(totalPages);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="py-12 text-center text-slate-400">
          <span class="material-symbols-outlined text-[36px] text-slate-300 mb-1">search_off</span>
          <p class="text-xs font-semibold">Không tìm thấy cảnh báo nào phù hợp với bộ lọc</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = pageItems.map(item => {
    // Severity Badge Styling
    let sevBadge = '';
    if (item.severity === 'Cao') {
      sevBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] bg-error-container text-error">Cao</span>`;
    } else if (item.severity === 'Trung bình') {
      sevBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-secondary-container text-on-secondary-container">Trung bình</span>`;
    } else {
      sevBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-sky-100 text-sky-800">Thấp</span>`;
    }

    // Status Badge Styling
    let statusBadge = '';
    if (item.status === 'Chưa xử lý') {
      statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-rose-50 text-rose-700 border border-rose-200">Chưa xử lý</span>`;
    } else if (item.status === 'Đang xử lý') {
      statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-sky-50 text-primary border border-sky-200">Đang xử lý</span>`;
    } else {
      statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">Đã xử lý</span>`;
    }

    // Category Tag
    const catBadge = item.category === 'tech'
      ? `<span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-sky-50 text-primary text-[11px] font-semibold"><span class="material-symbols-outlined text-[12px]">build</span>Kỹ thuật</span>`
      : `<span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[11px] font-semibold"><span class="material-symbols-outlined text-[12px]">settings</span>Vận hành</span>`;

    return `
      <tr class="cursor-pointer hover:bg-slate-50/80 transition-colors" onclick="openAlertDetail('${item.id}')">
        <td class="py-3.5 px-4 text-center font-bold text-slate-400 font-mono text-[11px]">${item.stt}</td>
        <td class="py-3.5 px-4 font-medium whitespace-nowrap text-slate-800">
          <div class="flex items-center gap-1.5 font-mono">
            ${item.severity === 'Cao' ? '<span class="w-2 h-2 rounded-full bg-error shrink-0"></span>' : '<span class="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>'}
            ${item.time}
          </div>
        </td>
        <td class="py-3.5 px-4 font-bold text-primary whitespace-nowrap">${item.type}</td>
        <td class="py-3.5 px-4 whitespace-nowrap">${catBadge}</td>
        <td class="py-3.5 px-4">
          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium text-[11px] whitespace-nowrap">${item.param}</span>
        </td>
        <td class="py-3.5 px-4 whitespace-nowrap">
          <div class="flex items-center gap-1.5 font-semibold text-slate-800">
            <span class="material-symbols-outlined text-[16px] text-slate-400">electric_meter</span>
            ${item.location}
          </div>
        </td>
        <td class="py-3.5 px-4 text-center">${sevBadge}</td>
        <td class="py-3.5 px-4 text-center">${statusBadge}</td>
        <td class="py-3.5 px-4 text-center" onclick="event.stopPropagation()">
          <div class="flex items-center justify-center gap-1.5">
            <a href="alert-detail.html?id=${item.id}" onclick="event.preventDefault(); openAlertDetail('${item.id}')" class="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white shadow-sm hover:bg-primary-container transition" title="Xem chi tiết sự cố">
              <span class="material-symbols-outlined text-[16px]">visibility</span>
            </a>
            <button onclick="quickActionMore('${item.id}')" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition" title="Thao tác nhanh">
              <span class="material-symbols-outlined text-[16px]">more_vert</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAlertDetail(id) {
  const selectedAlert = alertItems.find(item => item.id === id);
  if (!selectedAlert) {
    showToast('Không tìm thấy cảnh báo cần mở.', 'error');
    return;
  }
  try {
    sessionStorage.setItem('smartlight_selected_alert', JSON.stringify(selectedAlert));
  } catch (error) {
    console.error('Không thể lưu cảnh báo đang xem.', error);
  }
  window.location.href = `alert-detail.html?id=${encodeURIComponent(id)}`;
}

// Quick action trigger
function quickActionMore(id) {
  showToast(`Đang mở menu thao tác nhanh cho ${id}`);
}

// Filter Listeners
['filterGroup', 'filterType', 'filterSeverity', 'filterStatus'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', () => {
    currentPage = 1;
    renderTable();
  });
});

document.getElementById('searchInput')?.addEventListener('input', () => {
  currentPage = 1;
  renderTable();
});

// Refresh Action
document.getElementById('btnRefreshAlerts')?.addEventListener('click', () => {
  const spinner = document.getElementById('refreshIcon');
  if (spinner) spinner.classList.add('animate-spin');
  setTimeout(() => {
    if (spinner) spinner.classList.remove('animate-spin');
    showToast('Đã làm mới dữ liệu cảnh báo sự cố từ Central Gateway!');
  }, 600);
});

document.getElementById('syncSpinner')?.addEventListener('click', () => {
  document.getElementById('btnRefreshAlerts')?.click();
});

// Create Rule Modal
const modalRule = document.getElementById('modalCreateRule');
document.getElementById('btnCreateRule')?.addEventListener('click', () => {
  if (modalRule) {
    modalRule.classList.remove('hidden');
    modalRule.classList.add('flex');
  }
});

['btnCloseRuleModal', 'btnCancelRuleModal'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () => {
    if (modalRule) {
      modalRule.classList.add('hidden');
      modalRule.classList.remove('flex');
    }
  });
});

document.getElementById('formCreateRule')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (modalRule) {
    modalRule.classList.add('hidden');
    modalRule.classList.remove('flex');
  }
  showToast('Đã tạo quy tắc cảnh báo thành công và đồng bộ tới IoT Gateway!');
});

// Export Modal
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
  if (modalExport) {
    modalExport.classList.add('hidden');
    modalExport.classList.remove('flex');
  }
  showToast('Đang kết xuất và tải tệp Excel danh sách sự cố...');
});

document.getElementById('btnQuickNote')?.addEventListener('click', () => {
  showToast('Đã mở sổ ghi chú sự cố cho ' + currentSelectedId);
});

// Live Clock
function updateClock() {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} GMT+7`;
  const el = document.getElementById('liveTime');
  if (el) el.textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

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

// Initialize Table
renderTable();
