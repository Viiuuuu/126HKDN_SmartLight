/**
 * SmartLight Municipal IoT - Application JavaScript
 * Handles real-time clock, search filter, tab filtering, refresh simulation,
 * notifications, user profile, and device detail modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Elements Cache
  // -------------------------------------------------------------------------
  const topbarLiveClock = document.getElementById('topbarLiveClock');
  const pageDateTimeText = document.getElementById('pageDateTimeText');
  const btnRefreshSystem = document.getElementById('btnRefreshSystem');
  const refreshSpinIcon = document.getElementById('refreshSpinIcon');
  const topSearchInput = document.getElementById('topSearchInput');
  const btnResetSearch = document.getElementById('btnResetSearch');
  const emptyAlertState = document.getElementById('emptyAlertState');
  const tableFilterTabs = document.querySelectorAll('.filter-tab');
  const alertsTableBody = document.getElementById('alertsTableBody');
  const alertRows = document.querySelectorAll('.alert-row');

  // Dropdowns & Profile
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

  // Modal Elements
  const incidentModal = document.getElementById('incidentModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const modalDeviceName = document.getElementById('modalDeviceName');
  const modalStatusBadge = document.getElementById('modalStatusBadge');
  const modalDeviceId = document.getElementById('modalDeviceId');
  const modalTime = document.getElementById('modalTime');
  const modalArea = document.getElementById('modalArea');
  const modalGps = document.getElementById('modalGps');
  const modalDescription = document.getElementById('modalDescription');
  const techVoltage = document.getElementById('techVoltage');
  const techCurrent = document.getElementById('techCurrent');
  const techPower = document.getElementById('techPower');
  const techCos = document.getElementById('techCos');
  const btnDispatchTech = document.getElementById('btnDispatchTech');
  const btnAcknowledgeAlert = document.getElementById('btnAcknowledgeAlert');
  const toastContainer = document.getElementById('toastContainer');
  const btnViewAllAlerts = document.getElementById('btnViewAllAlerts');

  // Active filter state
  let currentFilter = 'all';
  let searchQuery = '';
  let activeAlertRow = null;

  // -------------------------------------------------------------------------
  // 2. Real-time Clock Sync (Vietnamese Format)
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

    // Topbar header format: chỉ giữ thứ ngày tháng năm
    if (topbarLiveClock) {
      topbarLiveClock.textContent = `${dayName}, ${date}/${month}/${year}`;
    }

    // Page header pill format: "Thứ ..., DD tháng MM, YYYY • HH:mm:ss"
    if (pageDateTimeText) {
      pageDateTimeText.textContent = `${dayName}, ${date} tháng ${month}, ${year} • ${hours}:${minutes}:${seconds}`;
    }
  }

  updateClocks();
  setInterval(updateClocks, 1000);

  // -------------------------------------------------------------------------
  // 3. User Session Integration (Cập nhật tên & vai trò đăng nhập ở Header)
  // -------------------------------------------------------------------------
  if (typeof window.syncHeaderUserInfo === 'function') {
    window.syncHeaderUserInfo();
  } else {
    try {
      const sessionData = sessionStorage.getItem('smartlight_user_session');
      if (sessionData) {
        const user = JSON.parse(sessionData);
        const userNameEl = document.querySelector('.user-name');
        const userRoleEl = document.querySelector('.user-role');
        const dropdownNameEl = document.querySelector('.user-dropdown-info strong');
        const dropdownEmailEl = document.querySelector('.user-dropdown-info small');

        const displayName = user.fullName || user.hoTen || (user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Quản trị viên');
        const rawRole = user.role || user.vaiTro || 'Quản trị viên';
        const displayRole = typeof window.formatRoleName === 'function' ? window.formatRoleName(rawRole) : rawRole;
        const displayEmail = user.email || 'quantri@smartlight.evncpc.vn';

        if (userNameEl && displayName) userNameEl.textContent = displayName;
        if (userRoleEl && displayRole) userRoleEl.textContent = displayRole;
        if (dropdownNameEl && displayName) dropdownNameEl.textContent = displayName;
        if (dropdownEmailEl && displayEmail) dropdownEmailEl.textContent = displayEmail;
      }
    } catch (err) {
      console.warn('Session parsing error:', err);
    }
  }

  // -------------------------------------------------------------------------
  // 4. Keyboard Shortcut Ctrl + K for Search
  // -------------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (topSearchInput) {
        topSearchInput.focus();
        topSearchInput.select();
      }
    } else if (e.key === 'Escape') {
      closeAllPopovers();
      closeModal();
    }
  });

  // -------------------------------------------------------------------------
  // 5. Search & Filter Alerts Table Logic
  // -------------------------------------------------------------------------
  function filterTable() {
    let visibleCount = 0;
    const query = searchQuery.trim().toLowerCase();

    alertRows.forEach(row => {
      const rowType = row.getAttribute('data-type');
      const textContent = row.textContent.toLowerCase();

      const matchesType = (currentFilter === 'all') || (rowType === currentFilter);
      const matchesSearch = query === '' || textContent.includes(query);

      if (matchesType && matchesSearch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (emptyAlertState) {
      emptyAlertState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (topSearchInput) {
    topSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterTable();
    });
  }

  if (btnResetSearch) {
    btnResetSearch.addEventListener('click', () => {
      if (topSearchInput) topSearchInput.value = '';
      searchQuery = '';
      currentFilter = 'all';
      tableFilterTabs.forEach(tab => tab.classList.remove('active'));
      const allTab = document.querySelector('.filter-tab[data-filter="all"]');
      if (allTab) allTab.classList.add('active');
      filterTable();
    });
  }

  // Quick filter tab buttons
  tableFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tableFilterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter') || 'all';
      filterTable();
    });
  });

  if (btnViewAllAlerts) {
    btnViewAllAlerts.addEventListener('click', () => {
      tableFilterTabs.forEach(t => t.classList.remove('active'));
      const allTab = document.querySelector('.filter-tab[data-filter="all"]');
      if (allTab) allTab.classList.add('active');
      currentFilter = 'all';
      if (topSearchInput) topSearchInput.value = '';
      searchQuery = '';
      filterTable();
      showToast('Đang hiển thị toàn bộ cảnh báo và sự cố hệ thống', 'success');
    });
  }

  // -------------------------------------------------------------------------
  // 6. Device Data Store & Alert Row Click (Modal Interaction)
  // -------------------------------------------------------------------------
  const deviceDetailStore = {
    'AL-001': {
      name: 'Tủ CS - 03 (KV01)',
      id: 'CS-03-KV01',
      status: 'Mất kết nối',
      statusClass: 'badge-lost',
      time: '18/12/2024 14:20',
      area: 'Khu vực 01 - Đường Bạch Đằng, Quận Hải Châu',
      gps: '16.0678° N, 108.2208° E',
      desc: 'Mất kết nối vi sai tín hiệu 4G/NB-IoT với bộ Gateway tập trung. Hệ thống đã tự động chuyển sang chế độ tự hành cục bộ (lịch bật tắt offline an toàn).',
      voltage: '220 V',
      current: '0.0 A',
      power: '0.0 kW',
      cos: '0.98'
    },
    'AL-002': {
      name: 'Tuyến TL - 05',
      id: 'TL-05-CS03',
      status: 'Cảnh báo',
      statusClass: 'badge-warning',
      time: '18/12/2024 12:30',
      area: 'Tuyến đường Nguyễn Văn Linh - Cầu Rồng',
      gps: '16.0612° N, 108.2155° E',
      desc: 'Điện áp pha sụt giảm xuống dưới ngưỡng an toàn (185V < tiêu chuẩn 220V ±10%). Nguy cơ suy giảm quang thông và quá nhiệt chấn lưu điện tử.',
      voltage: '185 V',
      current: '18.4 A',
      power: '3.4 kW',
      cos: '0.92'
    },
    'AL-003': {
      name: 'Điểm đèn ĐĐ - 1023',
      id: 'DD-1023-TL05',
      status: 'Sự cố',
      statusClass: 'badge-incident',
      time: '18/12/2024 10:45',
      area: 'Cột số 42 - Vỉa hè đối diện Bảo tàng Điêu khắc Chăm',
      gps: '16.0594° N, 108.2230° E',
      desc: 'Bộ cảm biến phát hiện dòng điện tiêu thụ tăng vọt bất thường (> 2.5A so với mức danh định 0.75A). Khả năng rò điện hoặc chập cáp ngầm.',
      voltage: '215 V',
      current: '2.85 A',
      power: '612 W',
      cos: '0.91'
    },
    'AL-004': {
      name: 'Tủ CS - 07 (KV03)',
      id: 'CS-07-KV03',
      status: 'Cảnh báo',
      statusClass: 'badge-warning',
      time: '18/12/2024 10:12',
      area: 'Khu vực 03 - Vòng xoay Cầu Sông Hàn',
      gps: '16.0718° N, 108.2241° E',
      desc: 'Công tắc hành trình báo cửa tủ điện đang mở trái phép ngoài giờ tác nghiệp của công nhân. Hệ thống cảnh báo nguy cơ xâm nhập hoặc mất cắp cáp điện.',
      voltage: '222 V',
      current: '12.5 A',
      power: '2.7 kW',
      cos: '0.97'
    },
    'AL-005': {
      name: 'Điểm đèn ĐĐ - 0876',
      id: 'DD-0876-TL02',
      status: 'Sự cố',
      statusClass: 'badge-incident',
      time: '18/12/2024 08:55',
      area: 'Cột số 18 - Đường 2 Tháng 9, Hòa Cường Nam',
      gps: '16.0489° N, 108.2227° E',
      desc: 'Lệnh điều khiển bật/tắt từ trung tâm gửi qua giao thức LoRa không nhận được phản hồi ACK sau 3 lần thử lại. Cần kiểm tra node thu phát LoRa tại bóng đèn.',
      voltage: '219 V',
      current: '0.0 A',
      power: '0 W',
      cos: '0.00'
    }
  };

  alertRows.forEach(row => {
    row.addEventListener('click', () => {
      const alertId = row.getAttribute('data-id');
      const data = deviceDetailStore[alertId];
      if (data) {
        activeAlertRow = row;
        modalDeviceName.textContent = data.name;
        modalStatusBadge.textContent = data.status;
        modalStatusBadge.className = `modal-badge-status ${data.statusClass}`;
        modalDeviceId.textContent = data.id;
        modalTime.textContent = data.time;
        modalArea.textContent = data.area;
        modalGps.textContent = data.gps;
        modalDescription.textContent = data.desc;
        techVoltage.textContent = data.voltage;
        techCurrent.textContent = data.current;
        techPower.textContent = data.power;
        techCos.textContent = data.cos;

        openModal();
      }
    });
  });

  function openModal() {
    if (incidentModal) incidentModal.classList.add('active');
  }

  function closeModal() {
    if (incidentModal) incidentModal.classList.remove('active');
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeModal);
  }

  if (incidentModal) {
    incidentModal.addEventListener('click', (e) => {
      if (e.target === incidentModal) closeModal();
    });
  }

  // Modal actions
  if (btnDispatchTech) {
    btnDispatchTech.addEventListener('click', () => {
      const dev = modalDeviceName.textContent;
      showToast(`Đã tạo phiếu điều phối kỹ thuật hiện trường cho: ${dev}`, 'success');
      closeModal();
    });
  }

  if (btnAcknowledgeAlert) {
    btnAcknowledgeAlert.addEventListener('click', () => {
      const dev = modalDeviceName.textContent;
      if (activeAlertRow) {
        const badge = activeAlertRow.querySelector('.badge-status');
        if (badge) {
          badge.textContent = 'Đã xử lý';
          badge.className = 'badge-status badge-lost';
        }
      }
      showToast(`Đã cập nhật trạng thái đã xử lý cho: ${dev}`, 'success');
      closeModal();
    });
  }

  // -------------------------------------------------------------------------
  // 7. Refresh Button Animation & System Sync
  // -------------------------------------------------------------------------
  let isRefreshing = false;
  if (btnRefreshSystem) {
    btnRefreshSystem.addEventListener('click', () => {
      if (isRefreshing) return;
      isRefreshing = true;

      if (refreshSpinIcon) {
        refreshSpinIcon.classList.add('spinning');
      }

      btnRefreshSystem.style.opacity = '0.8';

      setTimeout(() => {
        if (refreshSpinIcon) {
          refreshSpinIcon.classList.remove('spinning');
        }
        btnRefreshSystem.style.opacity = '1';
        isRefreshing = false;

        // Slight live jitter simulation for demo realism
        const gatewayPing = document.getElementById('gatewayPingValue');
        if (gatewayPing) {
          const rand = (99.7 + Math.random() * 0.2).toFixed(1);
          gatewayPing.textContent = `${rand}%`;
        }

        updateClocks();
        showToast('Đồng bộ dữ liệu IoT SmartLight hoàn tất lúc ' + new Date().toLocaleTimeString('vi-VN'), 'success');
      }, 750);
    });
  }

  // -------------------------------------------------------------------------
  // 8. Topbar Dropdowns (Notifications & User Profile)
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

  // Logout action (ATTT Cấp độ 3: gọi API hủy phiên và cập nhật thoiGianDangXuat)
  if (linkLogout) {
    linkLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      if (typeof window.handleLogout === 'function') {
        await window.handleLogout(e);
      } else {
        sessionStorage.removeItem('smartlight_user_session');
        window.location.href = 'login.html';
      }
    });
  }

  // -------------------------------------------------------------------------
  // 9. Mobile Sidebar Navigation
  // -------------------------------------------------------------------------
  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }

  if (btnToggleMobileSidebar) {
    btnToggleMobileSidebar.addEventListener('click', openMobileSidebar);
  }

  if (btnCloseSidebar) {
    btnCloseSidebar.addEventListener('click', closeMobileSidebar);
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeMobileSidebar);
  }

  // Sidebar navigation switching
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // If link points to an actual page (not a hash placeholder), allow standard page navigation!
      if (href && !href.startsWith('#') && href !== '') {
        return;
      }
      
      // If it's a hash placeholder, show feedback
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const title = link.querySelector('.nav-label')?.textContent;
      if (title) {
        showToast(`Chức năng ${title} đang phát triển`, 'warning');
      }
      if (window.innerWidth <= 900) {
        closeMobileSidebar();
      }
    });
  });

  // -------------------------------------------------------------------------
  // 10. Toast Notification System
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

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Remove after 3.2s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3200);
  }
});
