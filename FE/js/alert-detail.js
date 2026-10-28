// ==================== JAVASCRIPT LOGIC FOR ALERT DETAIL ====================

// Live Clock
const daysOfWeekAlertDetail = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function updateClock() {
  const now = new Date();
  const dayName = daysOfWeekAlertDetail[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  const el = document.getElementById('liveClockDisplay');
  if (el) el.textContent = `${dayName}, ${dateStr}`;
}
setInterval(updateClock, 1000);
updateClock();

const DEFAULT_ALERT = {
  id: 'ALR-20241024-001',
  time: '09:15 24/10/2024',
  type: 'Quá dòng',
  category: 'tech',
  categoryLabel: 'Sự cố Kỹ thuật',
  param: 'Dòng điện (32 A)',
  location: 'Tủ A1 - Tuyến 01',
  district: 'Quận Ba Đình',
  severity: 'Cao',
  status: 'Chưa xử lý',
  headline: 'Quá dòng trên Tuyến 01',
  description: 'Dòng điện đo được qua rơle tủ A1 vượt quá ngưỡng an toàn định mức cho phép (32 A > 25 A). Cần kiểm tra rò rỉ hoặc ngắn mạch các pha chiếu sáng trên tuyến.'
};
const requestedAlertId = new URLSearchParams(window.location.search).get('id') || DEFAULT_ALERT.id;
let currentAlert = null;

try {
  const cachedAlert = JSON.parse(sessionStorage.getItem('smartlight_selected_alert') || 'null');
  currentAlert = cachedAlert?.id === requestedAlertId ? cachedAlert : null;
  if (!currentAlert && requestedAlertId === DEFAULT_ALERT.id) currentAlert = DEFAULT_ALERT;
  const statusOverrides = JSON.parse(sessionStorage.getItem('smartlight_alert_status_overrides') || '{}');
  const validStatuses = new Set(['Chưa xử lý', 'Đang xử lý', 'Đã xử lý']);
  if (currentAlert && validStatuses.has(statusOverrides[currentAlert.id])) {
    currentAlert.status = statusOverrides[currentAlert.id];
  }
} catch (error) {
  console.error('Không thể đọc dữ liệu cảnh báo.', error);
  if (requestedAlertId === DEFAULT_ALERT.id) currentAlert = DEFAULT_ALERT;
}

if (!currentAlert) {
  window.location.replace('alerts.html');
} else {
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  const statusBadge = document.getElementById('detailCurrentStatusBadge');
  const statusClasses = {
    'Chưa xử lý': 'bg-rose-50 text-rose-700 border-rose-200',
    'Đang xử lý': 'bg-sky-50 text-primary border-sky-200',
    'Đã xử lý': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  window.updateAlertStatus = (status) => {
    currentAlert.status = status;
    if (statusBadge) {
      statusBadge.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusClasses[status]}`;
      statusBadge.textContent = status === 'Chưa xử lý' ? 'Chưa tiếp nhận' : status;
    };
    setText('timelineCurrentStatusText', status === 'Đang xử lý'
      ? 'Nhân viên kỹ thuật đã tiếp nhận xử lý'
      : status === 'Đã xử lý' ? 'Sự cố đã được xử lý' : 'Chờ nhân viên tiếp nhận');
    setText('btnAcceptText', status === 'Chưa xử lý' ? 'Tiếp nhận xử lý' : status === 'Đang xử lý' ? 'Đang xử lý' : 'Đã xử lý');

    const acceptButton = document.getElementById('btnAcceptDispatch');
    if (acceptButton) acceptButton.disabled = status !== 'Chưa xử lý';

    try {
      const statusOverrides = JSON.parse(sessionStorage.getItem('smartlight_alert_status_overrides') || '{}');
      statusOverrides[currentAlert.id] = status;
      sessionStorage.setItem('smartlight_alert_status_overrides', JSON.stringify(statusOverrides));
      sessionStorage.setItem('smartlight_selected_alert', JSON.stringify(currentAlert));
    } catch (error) {
      console.error('Không thể lưu trạng thái cảnh báo.', error);
    }
  }

  function renderAlertDetails() {
    const categoryIcon = document.querySelector('#alertDetailCategory .material-symbols-outlined');
    setText('alertBreadcrumbId', currentAlert.id);
    setText('closeIncidentAlertId', currentAlert.id);
    setText('alertDetailTitle', `${currentAlert.id}: ${currentAlert.headline}`);
    setText('alertDetailLocation', `${currentAlert.location} (${currentAlert.district})`);
    setText('alertDetailTime', `${currentAlert.time} (IoT Sensor)`);
    setText('alertDetailSeverity', `Mức độ ${currentAlert.severity}`);
    setText('alertDetailGroup', `Nhóm nghiệp vụ: ${currentAlert.categoryLabel}`);
    setText('alertIssueTitle', currentAlert.id === DEFAULT_ALERT.id ? 'Dòng điện vượt ngưỡng an toàn' : currentAlert.type);
    setText('alertIssueDescription', currentAlert.description);
    setText('alertCabinetArea', currentAlert.district);
    setText('alertRouteName', currentAlert.location.split(' - ').slice(1).join(' - ') || currentAlert.location);
    if (categoryIcon) categoryIcon.textContent = currentAlert.category === 'tech' ? 'engineering' : 'settings';

    const categoryBadge = document.getElementById('alertDetailCategory');
    if (categoryBadge) {
      categoryBadge.lastChild.textContent = currentAlert.categoryLabel;
      categoryBadge.className = currentAlert.category === 'tech'
        ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-primary'
        : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800';
    }
    const severityBadge = document.getElementById('alertDetailSeverity');
    if (severityBadge) {
      severityBadge.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
        currentAlert.severity === 'Cao' ? 'bg-error-container text-error' :
          currentAlert.severity === 'Trung bình' ? 'bg-secondary-container text-on-secondary-container' : 'bg-sky-100 text-sky-800'
      }`;
    }
    if (currentAlert.id !== DEFAULT_ALERT.id) {
      document.getElementById('alertTelemetryCard')?.classList.add('hidden');
      setText('alertRecommendation', 'Kiểm tra thiết bị và thông số tại hiện trường, sau đó cập nhật kết quả xử lý trên hệ thống.');
      const cabinetName = document.getElementById('alertCabinetName');
      if (cabinetName) cabinetName.textContent = currentAlert.location.split(' - ')[0].replace(/^Tủ\s+/, 'Tủ điều khiển ');
      const cabinetStatus = document.getElementById('alertCabinetStatus');
      if (cabinetStatus && currentAlert.param === 'Offline') {
        cabinetStatus.textContent = 'Offline';
        cabinetStatus.className = 'px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold shrink-0';
      }
    }
    document.title = `Chi tiết cảnh báo ${currentAlert.id} - SmartLight IoT Municipal System`;
    window.updateAlertStatus(currentAlert.status);
  }

  renderAlertDetails();
}

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

// Print Button
document.getElementById('btnPrintAlert')?.addEventListener('click', () => {
  window.print();
});

// Share Button
document.getElementById('btnShareAlert')?.addEventListener('click', () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    showToast('Đã sao chép liên kết phiếu sự cố vào bộ nhớ tạm!');
  } else {
    showToast('Đã tạo liên kết chia sẻ phiếu sự cố ALR-20241024-001!');
  }
});

// Accept Dispatch Button
let isAccepted = currentAlert?.status !== 'Chưa xử lý';
document.getElementById('btnAcceptDispatch')?.addEventListener('click', () => {
  if (!isAccepted) {
    isAccepted = true;
    window.updateAlertStatus('Đang xử lý');
    const badge = document.getElementById('detailCurrentStatusBadge');
    if (badge) {
      badge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-primary border border-sky-200';
      badge.textContent = 'Đang xử lý';
    }

    const btnAcceptText = document.getElementById('btnAcceptText');
    const timelineCurrentStatus = document.getElementById('timelineCurrentStatusText');
    if (btnAcceptText) btnAcceptText.textContent = 'Đang trong quá trình xử lý';
    if (timelineCurrentStatus) timelineCurrentStatus.textContent = 'KTV. Trần Văn Bình đã tiếp nhận (Hiện trường)';
    
    // Add new node in timeline
    const timeline = document.getElementById('timelineContainer');
    if (timeline) {
      const newNode = document.createElement('div');
      newNode.className = 'relative';
      const now = new Date();
      const timeNow = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} • Hôm nay`;
      newNode.innerHTML = `
        <div class="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></div>
        <div class="flex flex-col">
          <span class="text-[11px] text-emerald-600 font-bold font-mono">${timeNow}</span>
          <span class="text-xs font-bold text-slate-800">Đã tiếp nhận xử lý sự cố</span>
          <span class="text-[11px] text-slate-500">Kỹ thuật viên đã nhận lệnh điều phối qua App hiện trường</span>
        </div>
      `;
      const currentNode = document.getElementById('timelineCurrentNode');
      if (currentNode) {
        timeline.insertBefore(newNode, currentNode);
      } else {
        timeline.appendChild(newNode);
      }
    }
    const countLabel = document.getElementById('timelineCountLabel');
    if (countLabel) countLabel.textContent = '4 sự kiện';

    showToast('Đã tiếp nhận xử lý sự cố thành công! Thông báo đã gửi tới KTV.');
  } else {
    showToast('Sự cố này đã được tiếp nhận và đang trong tiến trình xử lý!');
  }
});

// Forward Dispatch
document.getElementById('btnForwardDispatch')?.addEventListener('click', () => {
  const select = document.getElementById('selectTechnician');
  if (select) {
    const ktv = select.options[select.selectedIndex].text;
    showToast(`Đã chuyển giao sự cố cho ${ktv}!`);
  }
});

// Close Incident Modal
const modalClose = document.getElementById('modalCloseIncident');
document.getElementById('btnCloseIncident')?.addEventListener('click', () => {
  if (modalClose) {
    modalClose.classList.remove('hidden');
    modalClose.classList.add('flex');
  }
});

document.getElementById('btnCancelCloseModal')?.addEventListener('click', () => {
  if (modalClose) {
    modalClose.classList.add('hidden');
    modalClose.classList.remove('flex');
  }
});

document.getElementById('btnConfirmCloseModal')?.addEventListener('click', () => {
  if (modalClose) {
    modalClose.classList.add('hidden');
    modalClose.classList.remove('flex');
  }

  const badge = document.getElementById('detailCurrentStatusBadge');
  if (badge) {
    badge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
    badge.textContent = 'Đã xử lý';
  }
  window.updateAlertStatus('Đã xử lý');

  showToast('Đã xác nhận khắc phục thành công và đóng sự cố!');
});

// Cabinet Map Modal
const modalMap = document.getElementById('modalCabinetMap');
document.getElementById('btnOpenCabinetMap')?.addEventListener('click', () => {
  if (modalMap) {
    modalMap.classList.remove('hidden');
    modalMap.classList.add('flex');
  }
});

document.getElementById('btnCloseMapModal')?.addEventListener('click', () => {
  if (modalMap) {
    modalMap.classList.add('hidden');
    modalMap.classList.remove('flex');
  }
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
