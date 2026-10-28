// ==================== JAVASCRIPT LOGIC FOR SCHEDULE DETAIL ====================

// Live Clock Detail
const daysOfWeekScheduleDetail = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function updateClockDetail() {
  const now = new Date();
  const dayName = daysOfWeekScheduleDetail[now.getDay()];
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  const el = document.getElementById('liveClockDisplay') || document.getElementById('liveTimeDetail');
  if (el) el.textContent = `${dayName}, ${dateStr}`;
}
setInterval(updateClockDetail, 1000);
updateClockDetail();

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

// Quick Schedule Switcher
document.getElementById('quickScheduleSelect')?.addEventListener('change', (e) => {
  showToast(`Đang tải dữ liệu kịch bản ${e.target.value}...`);
});

// Action Buttons
let isPaused = false;
const btnPause = document.getElementById('btnPauseSchedule');
const pauseText = document.getElementById('pauseBtnText');

btnPause?.addEventListener('click', () => {
  isPaused = !isPaused;
  if (isPaused) {
    if (pauseText) pauseText.textContent = 'Kích hoạt lại';
    btnPause.style.backgroundColor = '#d2ede4';
    btnPause.style.borderColor = '#79baa2';
    btnPause.style.color = '#216b52';
    showToast('Đã tạm dừng kịch bản LH-001 trên toàn bộ các tủ!');
  } else {
    if (pauseText) pauseText.textContent = 'Tạm dừng';
    btnPause.style.backgroundColor = '#F7E9E4';
    btnPause.style.borderColor = '#FBB9A8';
    btnPause.style.color = '#8a4e3f';
    showToast('Đã kích hoạt lại kịch bản LH-001!');
  }
});

document.getElementById('btnSyncGatewayNow')?.addEventListener('click', () => {
  showToast('Đang gửi bản tin cấu hình tới 42 tủ qua Gateway trung tâm...');
  setTimeout(() => {
    showToast('Đồng bộ thành công! Toàn bộ 42 tủ đã cập nhật kịch bản.');
  }, 1000);
});

document.getElementById('btnDuplicateSchedule')?.addEventListener('click', () => {
  showToast('Đã sao chép cấu hình kịch bản sang mã mới LH-012!');
});

// Streetlight Interactive Simulation
const stageCards = document.querySelectorAll('.stage-card');
const simLabel = document.getElementById('simBrightnessLabel');
const cones = [document.getElementById('lampCone1'), document.getElementById('lampCone2'), document.getElementById('lampCone3')];

stageCards.forEach(card => {
  card.addEventListener('click', () => {
    stageCards.forEach(c => {
      c.classList.remove('stage-card-active', 'ring-2', 'ring-brand-500');
    });
    card.classList.add('stage-card-active', 'ring-2', 'ring-brand-500');

    const time = card.getAttribute('data-time');
    const dim = parseInt(card.getAttribute('data-dim')) || 0;
    const lux = Math.round((dim / 100) * 32);

    if (simLabel) {
      simLabel.textContent = `Đang xem: ${time} (${dim}% Sáng • ${lux} Lux)`;
    }

    // Adjust cone opacity based on brightness
    const opacity = dim / 100;
    cones.forEach(cone => {
      if (cone) cone.style.opacity = opacity;
    });

    showToast(`Đã chuyển mô phỏng sang mốc ${time} (${dim}%)`);
  });
});

// Modals Handling
const modalEdit = document.getElementById('modalEditSchedule');
const btnEdit = document.getElementById('btnEditSchedule');
const btnCloseEdit = document.getElementById('btnCloseEditModal');
const btnCancelEdit = document.getElementById('btnCancelEditModal');
const formEdit = document.getElementById('formEditSchedule');

btnEdit?.addEventListener('click', () => {
  if (modalEdit) {
    modalEdit.classList.remove('hidden');
    modalEdit.classList.add('flex');
  }
});

[btnCloseEdit, btnCancelEdit].forEach(b => {
  b?.addEventListener('click', () => {
    if (modalEdit) {
      modalEdit.classList.add('hidden');
      modalEdit.classList.remove('flex');
    }
  });
});

formEdit?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (modalEdit) {
    modalEdit.classList.add('hidden');
    modalEdit.classList.remove('flex');
  }
  showToast('Đã cập nhật các mốc thời gian và gửi đồng bộ tới tủ!');
});

// Populate and show 42 cabinets modal
const modalCabinets = document.getElementById('modalAllCabinets');
const btnViewAllCabinets = document.getElementById('btnViewAllCabinets');
const btnCloseCabinets = document.getElementById('btnCloseCabinetsModal');
const btnDismissCabinets = document.getElementById('btnDismissCabinetsModal');
const cabinetsListContainer = document.getElementById('allCabinetsList');

if (cabinetsListContainer) {
  let html = '';
  for (let i = 1; i <= 42; i++) {
    const numStr = String(i).padStart(2, '0');
    const lamps = 50 + (i * 7) % 140;
    const kw = (lamps * 0.13).toFixed(1);
    html += `
      <div class="p-3 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50/60">
        <div class="flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <div>
            <div class="text-xs font-bold text-slate-800 font-mono">TCS-BĐ-${numStr}</div>
            <div class="text-[10px] text-slate-500">${lamps} bóng LED • ${kw} kW • 220V</div>
          </div>
        </div>
        <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Online</span>
      </div>
    `;
  }
  cabinetsListContainer.innerHTML = html;
}

btnViewAllCabinets?.addEventListener('click', () => {
  if (modalCabinets) {
    modalCabinets.classList.remove('hidden');
    modalCabinets.classList.add('flex');
  }
});

[btnCloseCabinets, btnDismissCabinets].forEach(b => {
  b?.addEventListener('click', () => {
    if (modalCabinets) {
      modalCabinets.classList.add('hidden');
      modalCabinets.classList.remove('flex');
    }
  });
});

document.getElementById('btnRefreshLogs')?.addEventListener('click', () => {
  showToast('Đã đồng bộ lại nhật ký thời gian thực từ Central Gateway!');
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
