// ==================== JAVASCRIPT LOGIC FOR ALERT DETAIL ====================

// Live Clock
function updateClock() {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} GMT+7`;
  const el = document.getElementById('liveTime');
  if (el) el.textContent = timeStr;
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
let isAccepted = false;
document.getElementById('btnAcceptDispatch')?.addEventListener('click', () => {
  if (!isAccepted) {
    isAccepted = true;
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
