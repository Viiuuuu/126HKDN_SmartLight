/**
 * SmartLight Municipal IoT - Area Detail Logic (area-detail.html)
 */

// Live Clock
const daysOfWeekAreaDetail = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function updateClock() {
  const now = new Date();
  const dayName = daysOfWeekAreaDetail[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  const el = document.getElementById('liveClockDisplay');
  if (el) el.textContent = `${dayName}, ${dateStr}`;
}

// Show Toast Alert
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

document.addEventListener('DOMContentLoaded', () => {
  // Modal Add Cabinet
  const modalCabinet = document.getElementById('modalAddCabinetToArea');
  document.getElementById('btnAddCabinet')?.addEventListener('click', () => {
    modalCabinet?.classList.remove('hidden');
    modalCabinet?.classList.add('flex');
  });

  ['btnCloseCabinetModal', 'btnCancelCabinetModal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      modalCabinet?.classList.add('hidden');
      modalCabinet?.classList.remove('flex');
    });
  });

  document.getElementById('formAddCabinet')?.addEventListener('submit', (e) => {
    e.preventDefault();
    modalCabinet?.classList.add('hidden');
    modalCabinet?.classList.remove('flex');
    showToast('Đã thêm tủ điều khiển mới TCS-19 vào KV-01!');
  });

  // Action button triggers
  document.getElementById('btnFieldMap')?.addEventListener('click', () => {
    showToast('Đang tải bản đồ thực địa GIS phân giải cao...');
  });

  document.getElementById('btnExportReport')?.addEventListener('click', () => {
    showToast('Đang kết xuất và tải tệp báo cáo tổng hợp khu vực KV-01...');
  });

  document.getElementById('btnEditArea')?.addEventListener('click', () => {
    showToast('Mở biểu mẫu chỉnh sửa thông số khu vực KV-01');
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
});
