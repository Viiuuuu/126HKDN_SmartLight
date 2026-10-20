/**
 * SmartLight Municipal IoT - Map Monitoring Script (map.js)
 * Handles interactive map nodes, detail card updates, filter drawer,
 * zooming, layer toggling, real-time clock, and toasts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Elements Cache
  // -------------------------------------------------------------------------
  const topbarLiveClock = document.getElementById('topbarLiveClock');
  const topSearchInput = document.getElementById('topSearchInput');
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

  // Filter Panel
  const filterPanel = document.getElementById('filterPanel');
  const btnToggleFilter = document.getElementById('btnToggleFilter');
  const collapseText = document.getElementById('collapseText');
  const btnApplyFilter = document.getElementById('btnApplyFilter');
  const btnResetFilter = document.getElementById('btnResetFilter');
  const btnSelectAllStatus = document.getElementById('btnSelectAllStatus');
  const filterSearchInput = document.getElementById('filterSearchInput');

  // Detail Card
  const deviceDetailCard = document.getElementById('deviceDetailCard');
  const btnCloseDetailCard = document.getElementById('btnCloseDetailCard');
  const detailId = document.getElementById('detailId');
  const detailType = document.getElementById('detailType');
  const detailStatusBadge = document.getElementById('detailStatusBadge');
  const detailStatusText = document.getElementById('detailStatusText');
  const detailPower = document.getElementById('detailPower');
  const detailDimming = document.getElementById('detailDimming');
  const metaCode = document.getElementById('metaCode');
  const metaDistrict = document.getElementById('metaDistrict');
  const metaRoute = document.getElementById('metaRoute');
  const metaLocation = document.getElementById('metaLocation');
  const detailAvatarIcon = document.getElementById('detailAvatarIcon');
  const btnInspectDetail = document.getElementById('btnInspectDetail');
  const btnQuickControl = document.getElementById('btnQuickControl');
  const btnDispatchPatrol = document.getElementById('btnDispatchPatrol');

  // Map Controls
  const mapBgLayer = document.getElementById('mapBgLayer');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnRecenterGps = document.getElementById('btnRecenterGps');
  const btnToggleLayers = document.getElementById('btnToggleLayers');
  const btnSwitchSatellite = document.getElementById('btnSwitchSatellite');
  const toastContainer = document.getElementById('toastContainer');
  const mapNodes = document.querySelectorAll('.map-node');

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

  // User session restore
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
  // 3. Map Nodes Database & Interaction
  // -------------------------------------------------------------------------
  const deviceDatabase = {
    'DD-185V-027': {
      id: 'ĐĐ-185V-027',
      code: 'ĐĐ-185V-027',
      type: 'Điểm đèn LED thông minh',
      district: 'Quận Hải Châu',
      route: 'Tuyến HL-01',
      location: 'Đường Bạch Đằng, P. Hải Châu 1, Q. Hải Châu, TP. Đà Nẵng',
      status: 'Hoạt động',
      statusClass: 'status-active',
      power: '120 W',
      dim: '100%',
      iconType: 'lamp'
    },
    'TCS-04-HC': {
      id: 'TCS-04-HC',
      code: 'TCS-04-HC',
      type: 'Tủ điều khiển trung tâm',
      district: 'Quận Hải Châu',
      route: 'Tuyến Nguyễn Văn Linh',
      location: 'Ngã tư Nguyễn Văn Linh - Hoàng Diệu, Q. Hải Châu',
      status: 'Hoạt động',
      statusClass: 'status-active',
      power: '42 Đèn (8.4 kW)',
      dim: '98.5% Tải',
      iconType: 'cabinet'
    },
    'TCS-09-ST': {
      id: 'TCS-09-ST',
      code: 'TCS-09-ST',
      type: 'Tủ điều khiển trung tâm',
      district: 'Quận Sơn Trà',
      route: 'Tuyến Võ Nguyên Giáp',
      location: 'Gần Công viên Biển Đông, P. Phước Mỹ, Q. Sơn Trà',
      status: 'Cảnh báo',
      statusClass: 'status-warning',
      power: '64 Đèn (12.8 kW)',
      dim: 'Sụt áp pha B (188V)',
      iconType: 'cabinet'
    },
    'DD-084-ND': {
      id: 'ĐĐ-084-ND',
      code: 'ĐĐ-084-ND',
      type: 'Điểm đèn LED thông minh',
      district: 'Quận Hải Châu',
      route: 'Tuyến Như Nguyệt',
      location: 'Vỉa hè bờ sông Hàn, Km 1+200',
      status: 'Hoạt động',
      statusClass: 'status-active',
      power: '150 W',
      dim: '80% Dimming',
      iconType: 'lamp'
    },
    'DD-091-ND': {
      id: 'ĐĐ-091-ND',
      code: 'ĐĐ-091-ND',
      type: 'Điểm đèn LED thông minh',
      district: 'Quận Hải Châu',
      route: 'Tuyến Bạch Đằng',
      location: 'Khu vực phía Tây Cầu Sông Hàn',
      status: 'Hoạt động',
      statusClass: 'status-active',
      power: '150 W',
      dim: '90% Dimming',
      iconType: 'lamp'
    },
    'DD-112-TR': {
      id: 'ĐĐ-112-TR',
      code: 'ĐĐ-112-TR',
      type: 'Điểm đèn LED thông minh',
      district: 'Quận Hải Châu',
      route: 'Tuyến Trần Phú',
      location: 'Gần Bảo tàng Điêu khắc Chăm, Cột 24',
      status: 'Cảnh báo',
      statusClass: 'status-warning',
      power: '100 W',
      dim: 'Lỗi driver LED',
      iconType: 'lamp'
    },
    'DD-201-CL': {
      id: 'ĐĐ-201-CL',
      code: 'ĐĐ-201-CL',
      type: 'Điểm đèn LED thông minh',
      district: 'Quận Cẩm Lệ',
      route: 'Tuyến Cách Mạng Tháng 8',
      location: 'Km 2+400, Hòa Thọ Đông, Q. Cẩm Lệ',
      status: 'Mất kết nối',
      statusClass: 'status-lost',
      power: '120 W',
      dim: 'Offline 3 giờ',
      iconType: 'lamp'
    },
    'DD-054-CR': {
      id: 'ĐĐ-054-CR',
      code: 'ĐĐ-054-CR',
      type: 'Điểm đèn LED thông minh',
      district: 'Quận Sơn Trà',
      route: 'Tuyến Võ Văn Kiệt',
      location: 'Đầu Cầu Rồng phía Đông, Q. Sơn Trà',
      status: 'Hoạt động',
      statusClass: 'status-active',
      power: '150 W',
      dim: '100%',
      iconType: 'lamp'
    },
    'DD-062-CR': {
      id: 'ĐĐ-062-CR',
      code: 'ĐĐ-062-CR',
      type: 'Điểm đèn LED thông minh',
      district: 'Quận Sơn Trà',
      route: 'Tuyến Trần Hưng Đạo',
      location: 'Khu vực Bến du thuyền DHC Marina',
      status: 'Hoạt động',
      statusClass: 'status-active',
      power: '120 W',
      dim: '100%',
      iconType: 'lamp'
    },
    'DD-140-TTL': {
      id: 'ĐĐ-140-TTL',
      code: 'ĐĐ-140-TTL',
      type: 'Điểm đèn LED thông minh',
      district: 'Quận Hải Châu',
      route: 'Tuyến 2 Tháng 9',
      location: 'Gần chân Cầu Trần Thị Lý, Q. Hải Châu',
      status: 'Hoạt động',
      statusClass: 'status-active',
      power: '150 W',
      dim: '90%',
      iconType: 'lamp'
    }
  };

  function displayDeviceDetail(id) {
    const data = deviceDatabase[id];
    if (!data) return;

    if (deviceDetailCard) {
      deviceDetailCard.classList.remove('hidden');
    }

    if (detailId) detailId.textContent = data.id;
    if (metaCode) metaCode.textContent = data.code;
    if (detailType) detailType.textContent = data.type;
    if (metaDistrict) metaDistrict.textContent = data.district;
    if (metaRoute) metaRoute.textContent = data.route;
    if (metaLocation) metaLocation.textContent = data.location;
    if (detailPower) detailPower.textContent = data.power;
    if (detailDimming) detailDimming.textContent = data.dim;

    if (detailStatusText) detailStatusText.textContent = data.status;
    if (detailStatusBadge) {
      detailStatusBadge.className = `badge-device-status ${data.statusClass}`;
    }

    if (detailAvatarIcon) {
      if (data.iconType === 'cabinet') {
        detailAvatarIcon.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 7v5l3 3"></path>
            <path d="M9 12h6"></path>
          </svg>
        `;
      } else {
        detailAvatarIcon.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7zM9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1H9v1z"/>
          </svg>
        `;
      }
    }
  }

  // Node Click Handlers
  mapNodes.forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const nodeId = node.getAttribute('data-id');

      mapNodes.forEach(n => n.classList.remove('selected'));
      node.classList.add('selected');

      displayDeviceDetail(nodeId);
      showToast(`Đã chọn thiết bị: ${nodeId}`, 'success');
    });
  });

  if (btnCloseDetailCard) {
    btnCloseDetailCard.addEventListener('click', () => {
      if (deviceDetailCard) {
        deviceDetailCard.classList.add('hidden');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 4. Floating Filter Panel Controls
  // -------------------------------------------------------------------------
  if (btnToggleFilter) {
    btnToggleFilter.addEventListener('click', () => {
      if (!filterPanel) return;
      const isCollapsed = filterPanel.classList.toggle('collapsed');
      if (collapseText) {
        collapseText.textContent = isCollapsed ? 'Mở' : 'Thu gọn';
      }
    });
  }

  if (btnApplyFilter) {
    btnApplyFilter.addEventListener('click', () => {
      showToast('Đã áp dụng bộ lọc dữ liệu bản đồ', 'success');
    });
  }

  if (btnResetFilter) {
    btnResetFilter.addEventListener('click', () => {
      if (filterSearchInput) filterSearchInput.value = '';
      const checkboxes = filterPanel.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(c => c.checked = true);
      const sel = document.getElementById('selectDistrict');
      if (sel) sel.selectedIndex = 1;
      showToast('Đã đặt lại bộ lọc bản đồ mặc định', 'success');
    });
  }

  if (btnSelectAllStatus) {
    btnSelectAllStatus.addEventListener('click', () => {
      const statusBoxes = [
        document.getElementById('chkStatusNormal'),
        document.getElementById('chkStatusWarning'),
        document.getElementById('chkStatusLost')
      ];
      statusBoxes.forEach(b => { if (b) b.checked = true; });
      showToast('Đã chọn tất cả trạng thái', 'success');
    });
  }

  // -------------------------------------------------------------------------
  // 5. Map Canvas Zoom & Satellite Layer Controls
  // -------------------------------------------------------------------------
  let currentZoom = 1;
  let isSatellite = false;

  const normalBg = "https://lh3.googleusercontent.com/aida-public/AB6AXuC1WqKvNqgJQ6bBKeXwhM-w58l7YthgMXJKJKtXgCImfyQHR7x73K22VGM6GBwCg_uQz4z6LvEQZRBV2iWccOF6PwLtsj13n5nMAOsioLEP7JlBEH1-IxT0F4SOZpvUTU_bT822jyxwqAx2sXUz5n3x9RzP9Caun-2AYMnMLY1f-000eXfK4X09LpxL8UbOe0TJIDgv8-kQ_lQOPrvZSvcUgKGP9quU1hwCt16_sZFM6eMowE7ZgYGi";
  const satBg = "https://lh3.googleusercontent.com/aida-public/AB6AXuDnC9sewjzWyxbaRoOCJIZiPWCjcmqTjiqiwsNCnSqQeHf3SCyHVrgRpD1fQKu4jyOwwXFzbnyPWPIKaID_zgz1-Er0VKYQck5MZc66D41XfhDa27-7O7KUciReBlHMS7qZ9y5bIo9xS9_3hkPDq9Wq4pflBRn3Mif33QNRduSXQRZjxTHPvyBtS0anoBwUaFBxPcbmSQlMOyKebmmhY4ejeY_XsbKvhZTscvv_XIZvNPQeN2m5DbHi";

  function applyZoom() {
    if (mapBgLayer) {
      mapBgLayer.style.transform = `scale(${currentZoom})`;
    }
  }

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      if (currentZoom < 1.6) {
        currentZoom += 0.15;
        applyZoom();
      }
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      if (currentZoom > 0.8) {
        currentZoom -= 0.15;
        applyZoom();
      }
    });
  }

  if (btnRecenterGps) {
    btnRecenterGps.addEventListener('click', () => {
      currentZoom = 1;
      applyZoom();
      showToast('Đã định vị về trung tâm Hải Châu - Sơn Trà, Đà Nẵng', 'success');
    });
  }

  function toggleSatellite() {
    isSatellite = !isSatellite;
    if (mapBgLayer) {
      mapBgLayer.style.backgroundImage = `url('${isSatellite ? satBg : normalBg}')`;
    }
    showToast(isSatellite ? 'Đã kích hoạt lớp bản đồ Vệ tinh' : 'Đã kích hoạt lớp bản đồ Giao thông', 'success');
  }

  if (btnToggleLayers) {
    btnToggleLayers.addEventListener('click', toggleSatellite);
  }

  if (btnSwitchSatellite) {
    btnSwitchSatellite.addEventListener('click', toggleSatellite);
  }

  // -------------------------------------------------------------------------
  // 6. Action Button Links
  // -------------------------------------------------------------------------
  if (btnInspectDetail) {
    btnInspectDetail.addEventListener('click', () => {
      showToast('Đang mở báo cáo thông số viễn trắc chi tiết...', 'success');
    });
  }

  if (btnQuickControl) {
    btnQuickControl.addEventListener('click', () => {
      showToast('Đã mở lệnh điều khiển Dimming / Bật Tắt cho node này', 'success');
    });
  }

  if (btnDispatchPatrol) {
    btnDispatchPatrol.addEventListener('click', () => {
      showToast('Đã gửi thông báo điều phối đội xe kỹ thuật Hải Châu - Sơn Trà', 'success');
    });
  }

  // -------------------------------------------------------------------------
  // 7. Topbar Popovers (Notifications & User Profile)
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

  // -------------------------------------------------------------------------
  // 8. Mobile Sidebar
  // -------------------------------------------------------------------------
  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }

  if (btnToggleMobileSidebar) btnToggleMobileSidebar.addEventListener('click', openMobileSidebar);
  if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

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
