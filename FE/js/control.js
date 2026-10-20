/**
 * SmartLight Municipal IoT - Lighting Control Script (control.js)
 * Handles scope selector, brightness slider, quick commands (Bật/Tắt/Reset),
 * execution simulation, table selection, real-time clock, and toasts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Elements Cache
  // -------------------------------------------------------------------------
  const topbarLiveClock = document.getElementById('topbarLiveClock');
  const sessionTimeText = document.getElementById('sessionTimeText');
  const btnNotifications = document.getElementById('btnNotifications');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');
  const btnUserProfile = document.getElementById('btnUserProfile');
  const userDropdown = document.getElementById('userDropdown');
  const linkLogout = document.getElementById('linkLogout');

  // Mobile Sidebar
  const sidebar = document.getElementById('sidebar');
  const btnToggleMobileSidebar = document.getElementById('btnToggleMobileSidebar');
  const btnCloseSidebar = document.getElementById('btnCloseSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  // Scope Switcher
  const scopeTabs = document.querySelectorAll('#scopeSwitcher .scope-tab-btn');

  // Control Commands
  const btnTurnOn = document.getElementById('btnTurnOn');
  const btnTurnOff = document.getElementById('btnTurnOff');
  const btnResetGateway = document.getElementById('btnResetGateway');
  const brightnessRange = document.getElementById('brightnessRange');
  const sliderPercentVal = document.getElementById('sliderPercentVal');
  const confirmCmdLabel = document.getElementById('confirmCmdLabel');
  const confirmBadgeParam = document.getElementById('confirmBadgeParam');
  const btnSkipCommand = document.getElementById('btnSkipCommand');
  const btnExecuteCommand = document.getElementById('btnExecuteCommand');

  // Table
  const checkAllTable = document.getElementById('checkAllTable');
  const rowCheckboxes = document.querySelectorAll('.row-checkbox');
  const badgeSelectedCount = document.getElementById('badgeSelectedCount');
  const btnSelectAllFilters = document.getElementById('btnSelectAllFilters');
  const recentCommandsList = document.querySelector('.recent-commands-list');
  const toastContainer = document.getElementById('toastContainer');

  let currentCommand = 'BẬT';
  let currentBrightness = 80;

  // -------------------------------------------------------------------------
  // 2. Real-time Clock Sync
  // -------------------------------------------------------------------------
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  function updateClocks() {
    const now = new Date();
    const dayName = daysOfWeek[now.getDay()];
    const date = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    if (topbarLiveClock) {
      topbarLiveClock.textContent = `${dayName}, ${date}/${month}/${year} • ${hours}:${minutes}:${seconds} GMT+7`;
    }
  }

  updateClocks();
  setInterval(updateClocks, 1000);

  // User session
  try {
    const sessionData = sessionStorage.getItem('smartlight_user_session');
    if (sessionData) {
      const user = JSON.parse(sessionData);
      const userNameEl = document.querySelector('.user-name');
      if (userNameEl && user.username) {
        userNameEl.textContent = user.username.charAt(0).toUpperCase() + user.username.slice(1);
      }
    }
  } catch (e) {
    console.warn(e);
  }

  // -------------------------------------------------------------------------
  // 3. Scope Switcher
  // -------------------------------------------------------------------------
  scopeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      scopeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const scope = tab.getAttribute('data-scope');
      const label = tab.querySelector('span')?.textContent;
      showToast(`Đã chuyển phạm vi điều khiển: ${label}`, 'success');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Brightness Slider
  // -------------------------------------------------------------------------
  if (brightnessRange) {
    brightnessRange.addEventListener('input', (e) => {
      currentBrightness = e.target.value;
      if (sliderPercentVal) sliderPercentVal.textContent = currentBrightness;
      if (confirmBadgeParam) confirmBadgeParam.textContent = `TL-05 • ${currentBrightness}%`;

      // Update table brightness progress bars
      document.querySelectorAll('#tableSelectedLights .progress-dim-fill').forEach(fill => {
        fill.style.width = `${currentBrightness}%`;
      });
      document.querySelectorAll('#tableSelectedLights .dim-percent-num').forEach(num => {
        num.textContent = `${currentBrightness}%`;
      });
    });
  }

  // -------------------------------------------------------------------------
  // 5. Quick Command Buttons
  // -------------------------------------------------------------------------
  function setCommand(cmd, labelText, activeBtn) {
    currentCommand = cmd;
    [btnTurnOn, btnTurnOff, btnResetGateway].forEach(b => {
      if (b) b.classList.remove('active-cmd');
    });
    if (activeBtn) activeBtn.classList.add('active-cmd');
    if (confirmCmdLabel) {
      confirmCmdLabel.textContent = labelText;
    }
    showToast(`Đã chọn lệnh: ${labelText}`, 'success');
  }

  if (btnTurnOn) {
    btnTurnOn.addEventListener('click', () => {
      setCommand('BẬT', 'BẬT 12 điểm đèn', btnTurnOn);
      updateTableStatus(true);
    });
  }

  if (btnTurnOff) {
    btnTurnOff.addEventListener('click', () => {
      setCommand('TẮT', 'TẮT 12 điểm đèn', btnTurnOff);
      updateTableStatus(false);
    });
  }

  if (btnResetGateway) {
    btnResetGateway.addEventListener('click', () => {
      setCommand('RESET', 'KHỞI ĐỘNG LẠI Gateway TL-05', btnResetGateway);
    });
  }

  function updateTableStatus(isOn) {
    const badges = document.querySelectorAll('#tableSelectedLights .badge-light-status');
    badges.forEach(badge => {
      if (isOn) {
        badge.className = 'badge-light-status status-on';
        badge.innerHTML = `<span class="chip-dot dot-active" style="width: 6px; height: 6px;"></span><span>Bật</span>`;
      } else {
        badge.className = 'badge-light-status status-off';
        badge.innerHTML = `<span class="chip-dot dot-warning" style="width: 6px; height: 6px;"></span><span>Tắt</span>`;
      }
    });
  }

  // -------------------------------------------------------------------------
  // 6. Execute Command Action
  // -------------------------------------------------------------------------
  if (btnExecuteCommand) {
    btnExecuteCommand.addEventListener('click', () => {
      btnExecuteCommand.disabled = true;
      btnExecuteCommand.style.opacity = '0.7';
      const origText = btnExecuteCommand.innerHTML;
      btnExecuteCommand.innerHTML = `<span>Đang phát sóng...</span>`;

      setTimeout(() => {
        btnExecuteCommand.disabled = false;
        btnExecuteCommand.style.opacity = '1';
        btnExecuteCommand.innerHTML = origText;

        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        // Add new timeline event
        if (recentCommandsList) {
          const newEvent = document.createElement('div');
          newEvent.className = 'timeline-event-card';
          newEvent.innerHTML = `
            <div class="event-meta-top">
              <span class="event-time-code">${timeStr} • TL-05</span>
              <span class="event-status-tag status-success">Thành công</span>
            </div>
            <strong class="event-desc-title">${currentCommand} 12 điểm đèn (${currentBrightness}%)</strong>
          `;
          recentCommandsList.insertBefore(newEvent, recentCommandsList.firstChild);
        }

        showToast(`Phát lệnh thành công! 12 điểm đèn Tuyến TL-05 đã phản hồi ACK lúc ${timeStr}`, 'success');
      }, 700);
    });
  }

  if (btnSkipCommand) {
    btnSkipCommand.addEventListener('click', () => {
      showToast('Đã hủy lệnh điều khiển', 'warning');
    });
  }

  // -------------------------------------------------------------------------
  // 7. Checkboxes Selection
  // -------------------------------------------------------------------------
  function updateSelectedCount() {
    let count = 0;
    rowCheckboxes.forEach(cb => {
      if (cb.checked) count++;
    });
    if (badgeSelectedCount) {
      badgeSelectedCount.textContent = `${count} đang chọn`;
    }
  }

  if (checkAllTable) {
    checkAllTable.addEventListener('change', (e) => {
      rowCheckboxes.forEach(cb => {
        cb.checked = e.target.checked;
      });
      updateSelectedCount();
    });
  }

  rowCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateSelectedCount();
    });
  });

  if (btnSelectAllFilters) {
    btnSelectAllFilters.addEventListener('click', () => {
      if (checkAllTable) checkAllTable.checked = true;
      rowCheckboxes.forEach(cb => cb.checked = true);
      updateSelectedCount();
      showToast('Đã chọn toàn bộ điểm đèn', 'success');
    });
  }

  // -------------------------------------------------------------------------
  // 8. Topbar Popovers (Notifications & User Profile)
  // -------------------------------------------------------------------------
  function closeAllPopovers() {
    if (notificationDropdown) notificationDropdown.classList.remove('active');
    if (userDropdown) userDropdown.classList.remove('active');
  }

  if (btnNotifications) {
    btnNotifications.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = notificationDropdown.classList.contains('active');
      closeAllPopovers();
      if (!isOpen) notificationDropdown.classList.add('active');
    });
  }

  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', (e) => {
      e.stopPropagation();
      const dot = document.querySelector('.notification-badge-dot');
      if (dot) dot.style.display = 'none';
      const unreads = document.querySelectorAll('.notification-item.unread');
      unreads.forEach(i => i.classList.remove('unread'));
      const headerTitle = document.querySelector('.dropdown-header strong');
      if (headerTitle) headerTitle.textContent = 'Thông báo mới (0)';
      showToast('Đã đánh dấu đọc tất cả thông báo', 'success');
    });
  }

  if (btnUserProfile) {
    btnUserProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = userDropdown.classList.contains('active');
      closeAllPopovers();
      if (!isOpen) userDropdown.classList.add('active');
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.notification-wrapper') && !e.target.closest('.user-profile-wrapper')) {
      closeAllPopovers();
    }
  });

  if (linkLogout) {
    linkLogout.addEventListener('click', () => {
      sessionStorage.removeItem('smartlight_user_session');
    });
  }

  // Mobile sidebar
  if (btnToggleMobileSidebar) btnToggleMobileSidebar.addEventListener('click', () => {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  });

  if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', () => {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  });

  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', () => {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  });

  // -------------------------------------------------------------------------
  // 9. Toast Helper
  // -------------------------------------------------------------------------
  function showToast(message, type = 'success') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconSvg = type === 'success' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `
      ${iconSvg}
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3200);
  }
});
