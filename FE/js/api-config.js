/**
 * ==============================================================================
 * SMARTLIGHT IOT SYSTEM - API BASE CONFIGURATION & RBAC ACCESS CONTROL
 * ==============================================================================
 * Tệp nền tảng dùng chung cho tất cả các trang Frontend SmartLight:
 * 1. Kết nối REST API tự động phát hiện cổng (HTTPS 7274 / HTTP 5203).
 * 2. Gắn kèm Token phiên đăng nhập (Authorization Bearer) & X-User-Id.
 * 3. Hệ thống Phân quyền theo vai trò (RBAC) cho 3 nhóm người dùng:
 *    - Quản trị viên (Admin - maVaiTro = 1)
 *    - Nhân viên vận hành (Operator - maVaiTro = 2)
 *    - Nhân viên kỹ thuật (Technician - maVaiTro = 3)
 * ==============================================================================
 */

const KNOWN_API_URLS = [
  'https://localhost:7274/api',
  'http://localhost:5203/api'
];

const DEFAULT_API_URL = (function () {
  const customUrl = localStorage.getItem('SMARTLIGHT_API_BASE_URL');
  if (customUrl && customUrl.trim() !== '') {
    return customUrl.trim().replace(/\/+$/, '');
  }
  return 'https://localhost:7274/api';
})();

const API_CONFIG = {
  BASE_URL: DEFAULT_API_URL,
  TIMEOUT_MS: 15000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// ==============================================================================
// 1. ĐỊNH NGHĨA MA TRẬN PHÂN QUYỀN RBAC CHO 3 VAI TRÒ
// ==============================================================================
const RBAC_ROLES = {
  ADMIN: {
    key: 'admin',
    maVaiTro: 1,
    label: 'Quản trị viên',
    badgeColor: '#074476',
    allowedPages: ['*'],
    hiddenNavHrefs: [],
    canWriteDevices: true,
    canWriteAreas: true,
    canControlLights: true,
    canManageSchedules: true,
    canConfigAlerts: true,
    canUpdateAlertStatus: true,
    canViewReports: true,
    canManageUsers: true,
    canManageRoles: true,
    canViewSystemLogs: true,
    canViewPersonalLogs: true
  },
  OPERATOR: {
    key: 'operator',
    maVaiTro: 2,
    label: 'Nhân viên vận hành',
    badgeColor: '#0284c7',
    allowedPages: [
      'index.html',
      'map.html',
      'control.html',
      'schedules.html',
      'schedule-detail.html',
      'schedule.html',
      'alerts.html',
      'alert-detail.html',
      'cabinets.html',
      'cabinets-detail.html',
      'cabinet-detail.html',
      'device-detail.html',
      'routes.html',
      'route-detail.html',
      'lights.html',
      'light-detail.html',
      'reports.html',
      'activity-log.html',
      'login.html'
    ],
    hiddenNavHrefs: [
      'users.html',
      'roles.html',
      'areas.html',
      'area-detail.html'
    ],
    canWriteDevices: true,
    canWriteAreas: false,
    canControlLights: true,
    canManageSchedules: true,
    canConfigAlerts: true,
    canUpdateAlertStatus: true,
    canViewReports: true,
    canManageUsers: false,
    canManageRoles: false,
    canViewSystemLogs: false,
    canViewPersonalLogs: true
  },
  TECHNICIAN: {
    key: 'technician',
    maVaiTro: 3,
    label: 'Nhân viên kỹ thuật',
    badgeColor: '#d97706',
    allowedPages: [
      'index.html',
      'map.html',
      'alerts.html',
      'alert-detail.html',
      'cabinets.html',
      'cabinets-detail.html',
      'cabinet-detail.html',
      'device-detail.html',
      'routes.html',
      'route-detail.html',
      'lights.html',
      'light-detail.html',
      'login.html'
    ],
    hiddenNavHrefs: [
      'control.html',
      'schedules.html',
      'schedule-detail.html',
      'schedule.html',
      'areas.html',
      'area-detail.html',
      'users.html',
      'roles.html',
      'reports.html',
      'activity-log.html',
      '#logs'
    ],
    canWriteDevices: false,
    canWriteAreas: false,
    canControlLights: false,
    canManageSchedules: false,
    canConfigAlerts: false,
    canUpdateAlertStatus: false,
    canViewReports: false,
    canManageUsers: false,
    canManageRoles: false,
    canViewSystemLogs: false,
    canViewPersonalLogs: false
  }
};

/**
 * Chuẩn hóa tên vai trò hiển thị trên giao diện theo danh mục SmartLight
 * @param {string|number} role
 * @returns {string} Tên vai trò tiếng Việt chuẩn
 */
function formatRoleName(role) {
  if (role === 2 || role === '2') return 'Nhân viên vận hành';
  if (role === 3 || role === '3') return 'Nhân viên kỹ thuật';
  if (role === 1 || role === '1') return 'Quản trị viên';
  if (!role || typeof role !== 'string') return 'Quản trị viên';
  const r = role.trim().toLowerCase();

  if (r.includes('vận hành') || r.includes('van hanh') || r.includes('vanhanh') || r === 'operator') {
    return 'Nhân viên vận hành';
  }
  if (r.includes('kỹ thuật') || r.includes('ky thuat') || r.includes('kythuat') || r.includes('tech') || r === 'technician') {
    return 'Nhân viên kỹ thuật';
  }
  if (r.includes('quản trị') || r.includes('quan tri') || r.includes('admin')) {
    return 'Quản trị viên';
  }
  return role;
}

/**
 * Lấy thông tin phiên đăng nhập và cấu hình quyền RBAC hiện tại
 */
function getCurrentRbacSession() {
  try {
    const raw = sessionStorage.getItem('smartlight_user_session');
    if (raw) {
      const session = JSON.parse(raw);
      if (session && typeof session === 'object') {
        const roleLabel = formatRoleName(session.maVaiTro || session.role || session.vaiTro);
        let policy = RBAC_ROLES.ADMIN;
        if (roleLabel === 'Nhân viên vận hành') policy = RBAC_ROLES.OPERATOR;
        else if (roleLabel === 'Nhân viên kỹ thuật') policy = RBAC_ROLES.TECHNICIAN;

        return {
          isAuthenticated: true,
          session,
          roleKey: policy.key,
          maVaiTro: policy.maVaiTro,
          roleLabel: policy.label,
          policy
        };
      }
    }
  } catch (err) {
    console.warn('[RBAC] Không thể đọc session:', err);
  }

  // Fallback mặc định khi mở trực tiếp file dev chưa qua trang login
  return {
    isAuthenticated: false,
    session: {
      maNguoiDung: 'ND0001',
      username: 'admin_demo',
      fullName: 'Nguyễn Văn Minh',
      email: 'minh.nguyen@smartlight.vn',
      role: 'Quản trị viên',
      maVaiTro: 1
    },
    roleKey: RBAC_ROLES.ADMIN.key,
    maVaiTro: RBAC_ROLES.ADMIN.maVaiTro,
    roleLabel: RBAC_ROLES.ADMIN.label,
    policy: RBAC_ROLES.ADMIN
  };
}

/**
 * Kiểm tra quyền thực hiện một hành động cụ thể trên Frontend
 * @param {string} permissionCode - Ví dụ: 'users.manage', 'devices.write', 'schedules.manage', 'alerts.config', 'control.execute'
 * @returns {boolean}
 */
function hasPermission(permissionCode) {
  const { policy } = getCurrentRbacSession();
  if (policy.key === 'admin') return true;

  switch (permissionCode) {
    case 'users.view':
    case 'users.manage':
    case 'roles.view':
    case 'roles.manage':
    case 'areas.view':
    case 'areas.manage':
    case 'logs.system':
      return false;
    case 'devices.write':
    case 'cabinets.manage':
    case 'routes.manage':
    case 'lights.manage':
      return policy.canWriteDevices;
    case 'control.execute':
      return policy.canControlLights;
    case 'schedules.view':
    case 'schedules.manage':
      return policy.canManageSchedules;
    case 'alerts.config':
      return policy.canConfigAlerts;
    case 'alerts.update':
      return policy.canUpdateAlertStatus;
    case 'reports.view':
    case 'reports.manage':
      return policy.canViewReports;
    case 'logs.personal':
      return policy.canViewPersonalLogs;
    default:
      return true;
  }
}

/**
 * Kiểm tra quyền và hiển thị cảnh báo nếu không được phép thực hiện thao tác
 */
function checkActionPermission(permissionCode, actionLabel = 'thực hiện thao tác này') {
  if (hasPermission(permissionCode)) return true;
  const { roleLabel } = getCurrentRbacSession();
  alert(`Phân quyền hệ thống (RBAC):\nVai trò [${roleLabel}] chỉ có quyền xem, không được phép ${actionLabel}.`);
  return false;
}

// ==============================================================================
// 2. BẢO VỆ TRUY CẬP TRANG TRỰC TIẾP QUA URL & LỌC MENU / NÚT THAO TÁC
// ==============================================================================
function getCurrentPageFilename() {
  const path = window.location.pathname || '';
  const segments = path.split('/').filter(Boolean);
  const last = (segments[segments.length - 1] || 'index.html').toLowerCase();
  return last.endsWith('.html') ? last : `${last}.html`;
}

/**
 * Ngăn chặn người dùng gõ trực tiếp URL của trang không thuộc quyền hạn
 */
function enforcePageUrlAccessGuard() {
  const currentPage = getCurrentPageFilename();
  if (currentPage === 'login.html') return true;

  const { policy, roleLabel } = getCurrentRbacSession();
  if (policy.allowedPages.includes('*')) return true;

  const isAllowed = policy.allowedPages.some(p => p.toLowerCase() === currentPage);
  if (!isAllowed) {
    console.warn(`[RBAC Guard] Chặn vai trò ${roleLabel} truy cập trang ${currentPage}`);
    sessionStorage.setItem(
      'smartlight_rbac_notice',
      `Vai trò [${roleLabel}] không có quyền truy cập trang "${currentPage}". Hệ thống đã chuyển về trang Tổng quan.`
    );
    window.location.replace('index.html');
    return false;
  }
  return true;
}

// Chạy kiểm tra URL và gắn thuộc tính data-rbac-role ngay lập tức trước khi trang render
(function applyImmediateRbacRootState() {
  const { policy } = getCurrentRbacSession();
  document.documentElement.setAttribute('data-rbac-role', policy.key);
  if (policy.key === 'technician') {
    document.documentElement.classList.add('rbac-readonly-technician');
  }

  if (!document.getElementById('smartlight-rbac-instant-style') && document.head) {
    const styleEl = document.createElement('style');
    styleEl.id = 'smartlight-rbac-instant-style';
    styleEl.textContent = `
      html { scrollbar-gutter: stable; }
      html[data-rbac-role="operator"] .sidebar-nav li:has(a[data-nav="users"]),
      html[data-rbac-role="operator"] .sidebar-nav li:has(a[data-nav="roles"]),
      html[data-rbac-role="operator"] .sidebar-nav li:has(a[data-nav="areas"]),
      html[data-rbac-role="operator"] .sidebar-nav li:has(a[href*="users.html"]),
      html[data-rbac-role="operator"] .sidebar-nav li:has(a[href*="roles.html"]),
      html[data-rbac-role="operator"] .sidebar-nav li:has(a[href*="areas.html"]) {
        display: none !important;
      }
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[data-nav="control"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[data-nav="schedule"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[data-nav="schedules"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[data-nav="areas"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[data-nav="users"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[data-nav="roles"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[data-nav="reports"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[data-nav="logs"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[href*="control.html"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[href*="schedules.html"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[href*="areas.html"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[href*="users.html"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[href*="roles.html"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[href*="reports.html"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[href*="activity-log.html"]),
      html[data-rbac-role="technician"] .sidebar-nav li:has(a[href="#logs"]),
      html[data-rbac-role="technician"] .sidebar-nav .nav-group:nth-of-type(3) {
        display: none !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
})();

enforcePageUrlAccessGuard();

/**
 * Chuẩn hóa đồng bộ thanh Sidebar và Topbar dùng chung trên mọi trang để không bị nhảy layout
 */
function normalizeSharedNavbar() {
  const currentPage = getCurrentPageFilename();

  // 1. Đồng bộ các đường dẫn và nhãn trên Sidebar
  document.querySelectorAll('.sidebar-nav a.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').trim();
    const navAttr = (link.getAttribute('data-nav') || '').trim();
    const labelEl = link.querySelector('.nav-label');

    // Chuyển mọi link #lights sang trang Điểm đèn đã phát triển (light-detail.html)
    if (navAttr === 'lights' || href === '#lights') {
      link.setAttribute('href', 'light-detail.html');
      if (currentPage === 'light-detail.html' || currentPage === 'lights.html') {
        link.classList.add('active');
      }
    }

    // Đồng bộ tên mục Bản đồ giám sát (tránh nhảy chữ "Bản đồ giám sát GIS" ở trang tủ)
    if (navAttr === 'map' && labelEl && labelEl.textContent.trim() !== 'Bản đồ giám sát') {
      labelEl.textContent = 'Bản đồ giám sát';
    }
  });

  // Đồng bộ số lượng badge Cảnh báo sự cố trên Sidebar để không nhảy số 12 <-> 18 khi chuyển trang
  const badgeEl = document.getElementById('sidebarAlertCount');
  if (badgeEl && !badgeEl.dataset.syncedDynamic) {
    badgeEl.textContent = '12';
  }

  // Ẩn khối .sidebar-footer hoặc cổng IoT rời rạc ở chân sidebar (nếu trang có trang không) để chiều cao menu cố định
  document.querySelectorAll('.sidebar > .sidebar-footer, .sidebar > .p-4.border-t').forEach(footer => {
    footer.style.display = 'none';
  });

  // 2. Đồng bộ thanh Header Topbar chuẩn index.html (nếu trang đang dùng topbar kiểu cũ thiếu dropdown)
  const topbar = document.querySelector('header.topbar, header[data-purpose="topbar"]');
  if (topbar && !topbar.querySelector('#userDropdown')) {
    topbar.className = 'topbar';
    topbar.innerHTML = `
      <div class="topbar-left">
        <button class="mobile-menu-btn" id="btnToggleMobileSidebar" aria-label="Mở menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div class="search-box">
          <span class="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input type="text" class="search-input" id="topSearchInput" placeholder="Tìm nhanh tủ điện, điểm đèn, sự cố..." autocomplete="off">
        </div>
      </div>

      <div class="topbar-right">
        <div class="system-time-display">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span id="topbarLiveClock">Thứ Năm, 22/10/2026</span>
        </div>

        <div class="notification-wrapper">
          <button class="btn-icon-topbar" id="btnNotifications" aria-label="Thông báo hệ thống" title="Thông báo hệ thống">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="notification-badge-dot"></span>
          </button>

          <div class="notification-dropdown" id="notificationDropdown">
            <div class="dropdown-header">
              <strong>Thông báo mới (3)</strong>
              <button class="btn-text-subtle" id="btnMarkAllRead">Đọc tất cả</button>
            </div>
            <ul class="dropdown-list">
              <li class="notification-item unread">
                <span class="noti-indicator danger"></span>
                <div>
                  <p class="noti-title">Sự cố điện áp Tuyến TL - 05</p>
                  <small class="noti-time">12 phút trước</small>
                </div>
              </li>
              <li class="notification-item unread">
                <span class="noti-indicator warning"></span>
                <div>
                  <p class="noti-title">Tủ CS - 07 cảnh báo mở cửa</p>
                  <small class="noti-time">45 phút trước</small>
                </div>
              </li>
              <li class="notification-item">
                <span class="noti-indicator info"></span>
                <div>
                  <p class="noti-title">Đồng bộ dữ liệu IoT Gateway thành công</p>
                  <small class="noti-time">2 giờ trước</small>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="user-profile-wrapper">
          <button class="user-profile-btn" id="btnUserProfile" aria-label="Hồ sơ người dùng">
            <div class="user-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="user-meta">
              <span class="user-name">Nguyễn Văn Minh</span>
              <span class="user-role">Quản trị viên</span>
            </div>
            <span class="user-action-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
          </button>

          <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown-info">
              <strong>Nguyễn Văn Minh</strong>
              <small>quantri@smartlight.evncpc.vn</small>
            </div>
            <hr class="dropdown-divider">
            <a href="#profile" class="user-menu-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Hồ sơ cá nhân</span>
            </a>
            <hr class="dropdown-divider">
            <a href="login.html" class="user-menu-item logout-link" id="linkLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Đăng xuất</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Đảm bảo đồng hồ và dropdown trên Topbar hoạt động trên mọi trang
  const clockEl = document.getElementById('topbarLiveClock');
  if (clockEl) {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    clockEl.textContent = `${days[now.getDay()]}, ${d}/${m}/${y}`;
  }

  const btnNotifications = document.getElementById('btnNotifications');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const btnUserProfile = document.getElementById('btnUserProfile');
  const userDropdown = document.getElementById('userDropdown');

  if (btnNotifications && notificationDropdown && !btnNotifications.dataset.boundTopbar) {
    btnNotifications.dataset.boundTopbar = 'true';
    btnNotifications.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = notificationDropdown.classList.contains('active');
      notificationDropdown.classList.remove('active');
      if (userDropdown) userDropdown.classList.remove('active');
      if (!isOpen) notificationDropdown.classList.add('active');
    });
  }

  if (btnUserProfile && userDropdown && !btnUserProfile.dataset.boundTopbar) {
    btnUserProfile.dataset.boundTopbar = 'true';
    btnUserProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = userDropdown.classList.contains('active');
      if (notificationDropdown) notificationDropdown.classList.remove('active');
      userDropdown.classList.remove('active');
      if (!isOpen) userDropdown.classList.add('active');
    });
  }

  if (!document.documentElement.dataset.boundTopbarOutsideClick) {
    document.documentElement.dataset.boundTopbarOutsideClick = 'true';
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.notification-wrapper') && !e.target.closest('.user-profile-wrapper')) {
        document.getElementById('notificationDropdown')?.classList.remove('active');
        document.getElementById('userDropdown')?.classList.remove('active');
      }
    });
  }
}

/**
 * Lọc động các mục trên thanh điều hướng Sidebar theo vai trò đăng nhập
 */
function applySidebarMenuRbac() {
  const { policy } = getCurrentRbacSession();
  document.documentElement.setAttribute('data-rbac-role', policy.key);

  // 1. Cập nhật link Điểm đèn & Nhật ký hoạt động trên tất cả các trang
  document.querySelectorAll('.sidebar-nav a.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').trim();
    const navAttr = (link.getAttribute('data-nav') || '').trim();
    const labelEl = link.querySelector('.nav-label');

    if (navAttr === 'lights' || href === '#lights') {
      link.setAttribute('href', 'light-detail.html');
    }

    if (navAttr === 'logs' || href === '#logs' || href === 'activity-log.html') {
      if (policy.key === 'admin') {
        link.setAttribute('href', 'activity-log.html');
        if (labelEl) labelEl.textContent = 'Nhật ký hệ thống';
      } else if (policy.key === 'operator') {
        link.setAttribute('href', 'activity-log.html');
        if (labelEl) labelEl.textContent = 'Lịch sử hoạt động cá nhân';
      }
    }
  });

  if (policy.key === 'admin') return;

  // 2. Ẩn các menu không thuộc quyền hạn của vai trò hiện tại
  document.querySelectorAll('.sidebar-nav a.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('?')[0].trim().toLowerCase();
    const dataNav = (link.getAttribute('data-nav') || '').trim().toLowerCase();

    const shouldHide =
      policy.hiddenNavHrefs.some(h => h.toLowerCase() === href) ||
      (policy.key === 'operator' && (dataNav === 'users' || dataNav === 'roles' || dataNav === 'areas')) ||
      (policy.key === 'technician' && ['control', 'schedule', 'schedules', 'areas', 'users', 'roles', 'reports', 'logs'].includes(dataNav));

    if (shouldHide) {
      const li = link.closest('li');
      if (li) {
        li.style.display = 'none';
      } else {
        link.style.display = 'none';
      }
    }
  });

  // 3. Ẩn tiêu đề nhóm menu (nav-group) nếu toàn bộ mục con bên trong đều bị ẩn
  document.querySelectorAll('.sidebar-nav .nav-group').forEach(group => {
    const visibleItems = Array.from(group.querySelectorAll('li')).filter(
      li => li.style.display !== 'none' && getComputedStyle(li).display !== 'none'
    );
    if (visibleItems.length === 0) {
      group.style.display = 'none';
    }
  });
}

/**
 * Ẩn/vô hiệu hóa các nút Thêm, Sửa, Xóa, Cấu hình, Điều khiển nếu vai trò không được phép
 */
function applyActionButtonsRbac() {
  const { policy, roleLabel } = getCurrentRbacSession();

  // Hiển thị thông báo nếu vừa bị chặn chuyển hướng từ URL trái phép
  const pendingNotice = sessionStorage.getItem('smartlight_rbac_notice');
  if (pendingNotice) {
    sessionStorage.removeItem('smartlight_rbac_notice');
    setTimeout(() => {
      showRbacBannerNotice(pendingNotice);
    }, 250);
  }

  if (policy.key === 'admin') return;

  // Якщо là Nhân viên kỹ thuật (Chỉ được phép xem thông tin)
  if (policy.key === 'technician') {
    document.documentElement.classList.add('rbac-readonly-technician');

    // Danh sách bộ chọn các nút Thêm, Sửa, Xóa, Cấu hình, Điều khiển trên các trang
    const writeSelectors = [
      // Tủ chiếu sáng & Chi tiết tủ
      '#btnOpenAddCabinetModal',
      '#btnAddCabinet',
      '#btnEditCabinet',
      '#btnDeleteCabinet',
      '#btnSaveCabinet',
      '#modalAddCabinet button[type="submit"]',
      '[data-action="add-cabinet"]',
      '[data-action="edit-cabinet"]',
      '[data-action="delete-cabinet"]',
      '[onclick*="editCabinet"]',
      '[onclick*="deleteCabinet"]',
      '[onclick*="openAddCabinet"]',
      // Tuyến chiếu sáng & Chi tiết tuyến
      '#btnOpenAddRouteModal',
      '#btnAddRoute',
      '#btnOpenEditModal',
      '#btnOpenCalibrateModal',
      '#btnDeleteRoute',
      '#btnSaveRoute',
      '#editRouteModal button[type="submit"]',
      '#calibrateModal button[type="submit"]',
      'button[data-action="edit"]',
      'button[data-action="delete"]',
      '[onclick*="editRoute"]',
      '[onclick*="deleteRoute"]',
      // Điểm đèn & Chi tiết điểm đèn
      '#btnOpenAddLightModal',
      '#btnAddLight',
      '#btnEditLight',
      '#btnDeleteLight',
      '#dimming-range',
      'button[onclick*="setQuickDim"]',
      'button[onclick*="sendLightCommand"]',
      '#btnApplyDimming',
      '#btnToggleLightPower',
      // Cảnh báo & Cấu hình cảnh báo
      '#btnOpenConfigModal',
      '#btnConfigAlerts',
      '#btnSaveAlertConfig',
      '#btnUpdateAlertStatus',
      '#btnSaveStatus',
      '#btnSaveResolution',
      '#btnAcceptDispatch',
      '#btnCloseIncident',
      '#btnConfirmCloseModal',
      '#btnConfirmResolve',
      '#btnAssignTech',
      '#statusSelect',
      '#resolutionNote',
      'button[onclick*="openStatusModal"]',
      'button[onclick*="openConfigModal"]',
      'button[onclick*="updateAlertStatus"]',
      // Khu vực & Người dùng & Phân quyền
      '#btnOpenAddAreaModal',
      '#btnOpenAddUserModal',
      '#btnBulkLockUsers',
      '#btnSaveChanges'
    ];

    writeSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
          el.disabled = true;
          el.title = `Chế độ Chỉ xem (${roleLabel})`;
        } else {
          el.style.display = 'none';
        }
      });
    });

    // Ẩn các nút có nội dung văn bản mang tính Thêm / Sửa / Xóa / Cấu hình / Điều khiển
    const forbiddenKeywords = [
      'thêm tủ', 'thêm tuyến', 'thêm điểm đèn', 'thêm khu vực', 'thêm mới', 'tạo mới',
      'chỉnh sửa', 'sửa thông tin', 'cập nhật trạng thái', 'xóa tủ', 'xóa tuyến', 'xóa đèn',
      'cấu hình cảnh báo', 'cài đặt ngưỡng', 'lưu thay đổi', 'gửi lệnh', 'đóng cắt', 'bật toàn bộ', 'tắt toàn bộ'
    ];

    document.querySelectorAll('button, a.btn').forEach(btn => {
      if (btn.id === 'linkLogout' || btn.classList.contains('logout-link')) return;
      const text = (btn.textContent || '').trim().toLowerCase();
      if (forbiddenKeywords.some(kw => text.includes(kw))) {
        btn.style.display = 'none';
      }
    });
  }
}

/**
 * Hiển thị thanh thông báo phân quyền trực quan trên giao diện
 */
function showRbacBannerNotice(message) {
  const existing = document.getElementById('rbacToastNotice');
  if (existing) existing.remove();

  const notice = document.createElement('div');
  notice.id = 'rbacToastNotice';
  notice.style.cssText =
    'position:fixed;top:76px;right:24px;z-index:9999;max-width:420px;background:#1e293b;color:#fff;' +
    'padding:12px 16px;border-radius:12px;border-left:4px solid #f59e0b;box-shadow:0 10px 25px rgba(0,0,0,0.2);' +
    'font-family:"Plus Jakarta Sans",sans-serif;font-size:12.5px;font-weight:600;line-height:1.5;display:flex;align-items:center;gap:10px;';
  notice.innerHTML = `
    <span style="color:#fbbf24;font-size:18px;">⚠</span>
    <span style="flex:1;">${message}</span>
    <button type="button" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;font-weight:bold;" onclick="this.parentElement.remove()">×</button>
  `;
  document.body.appendChild(notice);
  setTimeout(() => {
    if (notice.parentElement) notice.remove();
  }, 5000);
}

// ==============================================================================
// 3. KẾT NỐI REST API CLIENT & KIỂM TRA QUYỀN TRƯỚC KHI GỬI REQUEST GHI
// ==============================================================================
function getAuthHeaders() {
  const headers = { ...API_CONFIG.DEFAULT_HEADERS };
  try {
    const sessionRaw = sessionStorage.getItem('smartlight_user_session');
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
      if (session.maNguoiDung || session.username) {
        headers['X-User-Id'] = session.maNguoiDung || session.username;
      }
    }
  } catch (err) {
    console.warn('[api-config] Không thể đọc session người dùng:', err);
  }
  return headers;
}

function buildApiUrl(endpoint, params = null, baseUrl = null) {
  const root = baseUrl || API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${root}${cleanEndpoint}`);

  if (params && typeof params === 'object') {
    Object.keys(params).forEach(key => {
      const val = params[key];
      if (val !== null && val !== undefined && val !== '') {
        url.searchParams.append(key, val);
      }
    });
  }
  return url.toString();
}

/**
 * Kiểm tra phân quyền RBAC ngay trước khi gửi request POST / PUT / PATCH / DELETE
 */
function verifyClientApiWritePermission(endpoint, method) {
  const upperMethod = (method || 'GET').toUpperCase();
  if (upperMethod === 'GET') return;

  const cleanEndpoint = (endpoint || '').toLowerCase();
  if (cleanEndpoint.includes('/phiendangnhap/dang-nhap') || cleanEndpoint.includes('/phiendangnhap/dang-xuat')) {
    return;
  }

  const { policy, roleLabel } = getCurrentRbacSession();

  // Nhân viên kỹ thuật không được phép gọi bất kỳ API thêm/sửa/xóa/điều khiển nào
  if (policy.key === 'technician') {
    const msg = `Vai trò [${roleLabel}] chỉ có quyền xem thông tin, không được phép thực hiện thao tác thay đổi dữ liệu (${upperMethod} ${endpoint}).`;
    showRbacBannerNotice(msg);
    const err = new Error(msg);
    err.status = 403;
    throw err;
  }

  // Nhân viên vận hành không được phép gọi API quản lý người dùng, phân quyền hoặc khu vực
  if (policy.key === 'operator') {
    if (
      cleanEndpoint.includes('/nguoidung') ||
      cleanEndpoint.includes('/vaitro') ||
      cleanEndpoint.includes('/quyenhan') ||
      cleanEndpoint.includes('/khuvuc')
    ) {
      const msg = `Vai trò [${roleLabel}] không có quyền quản trị tài khoản, phân quyền hoặc thay đổi khu vực hệ thống.`;
      showRbacBannerNotice(msg);
      const err = new Error(msg);
      err.status = 403;
      throw err;
    }
  }
}

async function apiFetch(endpoint, options = {}) {
  const { params, timeout = API_CONFIG.TIMEOUT_MS, ...fetchOptions } = options;

  // Chặn thao tác ghi trái phép theo vai trò trước khi gửi lên Server
  verifyClientApiWritePermission(endpoint, fetchOptions.method || 'GET');

  fetchOptions.headers = {
    ...getAuthHeaders(),
    ...(fetchOptions.headers || {})
  };

  const candidateBases = [
    API_CONFIG.BASE_URL,
    ...KNOWN_API_URLS.filter(u => u !== API_CONFIG.BASE_URL)
  ];

  let lastError = null;

  for (let i = 0; i < candidateBases.length; i++) {
    const currentBase = candidateBases[i];
    const fullUrl = buildApiUrl(endpoint, params, currentBase);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    fetchOptions.signal = controller.signal;

    try {
      const response = await fetch(fullUrl, fetchOptions);
      clearTimeout(timeoutId);

      if (currentBase !== API_CONFIG.BASE_URL) {
        API_CONFIG.BASE_URL = currentBase;
      }

      if (!response.ok) {
        let errorMessage = `Yêu cầu thất bại với mã trạng thái ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch (_) {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        const err = new Error(errorMessage);
        err.status = response.status;
        throw err;
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (error.status) {
        throw error;
      }

      if (i < candidateBases.length - 1) {
        console.warn(`[api-config] Không kết nối được ${fullUrl}, đang thử cổng tiếp theo...`);
      }
    }
  }

  if (lastError && lastError.name === 'AbortError') {
    throw new Error(`Kết nối máy chủ quá thời gian (${timeout / 1000}s). Vui lòng kiểm tra Backend.`);
  }

  throw lastError || new Error('Không thể kết nối đến máy chủ Backend.');
}

const api = {
  get(endpoint, params = null) {
    return apiFetch(endpoint, { method: 'GET', params });
  },
  post(endpoint, body = {}) {
    return apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },
  put(endpoint, body = {}) {
    return apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },
  patch(endpoint, body = {}) {
    return apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  },
  delete(endpoint) {
    return apiFetch(endpoint, { method: 'DELETE' });
  },
  getConfig() {
    return { ...API_CONFIG };
  },
  setBaseUrl(newBaseUrl) {
    if (newBaseUrl) {
      API_CONFIG.BASE_URL = newBaseUrl.replace(/\/+$/, '');
      localStorage.setItem('SMARTLIGHT_API_BASE_URL', API_CONFIG.BASE_URL);
      console.log('[api-config] Đã cập nhật BASE_URL thành:', API_CONFIG.BASE_URL);
    }
  }
};

/**
 * Tự động đồng bộ thông tin tài khoản và vai trò người dùng lên thanh Header
 */
function syncHeaderUserInfo() {
  try {
    const sessionRaw = sessionStorage.getItem('smartlight_user_session');
    if (!sessionRaw) return;

    const user = JSON.parse(sessionRaw);
    if (!user || typeof user !== 'object') return;

    const rawRole = user.maVaiTro || user.role || user.vaiTro || '';
    const displayRole = formatRoleName(rawRole);
    const displayName = user.fullName || user.hoTen || (user.username ? (user.username.charAt(0).toUpperCase() + user.username.slice(1)) : 'Người dùng');
    const displayEmail = user.email || (user.username ? `${user.username}@smartlight.evncpc.vn` : 'quantri@smartlight.evncpc.vn');

    document.querySelectorAll('.user-name, #topbarUserName, #alertUserName, #userName').forEach(el => {
      if (el.children.length === 0) {
        el.textContent = displayName;
      } else if (el.childNodes && el.childNodes[0] && el.childNodes[0].nodeType === Node.TEXT_NODE) {
        el.childNodes[0].textContent = displayName;
      }
    });

    document.querySelectorAll('.user-role, #topbarUserRole, #alertUserRole, #userRole').forEach(el => {
      el.textContent = displayRole;
      el.setAttribute('data-role', displayRole);
      if (displayRole === 'Nhân viên vận hành') {
        el.style.color = '#0284c7';
      } else if (displayRole === 'Nhân viên kỹ thuật') {
        el.style.color = '#f59e0b';
      } else {
        el.style.color = '#64748b';
      }
    });

    document.querySelectorAll('.user-dropdown-info strong, #dropdownUserName').forEach(el => {
      el.textContent = displayName;
    });

    document.querySelectorAll('.user-dropdown-info small, #dropdownUserEmail').forEach(el => {
      if (displayEmail) el.textContent = displayEmail;
    });
  } catch (err) {
    console.warn('[api-config] Lỗi đồng bộ thông tin Header người dùng:', err);
  }
}

/**
 * Thực hiện đăng xuất hệ thống an toàn, xóa sạch session và quyền truy cập
 */
async function handleLogout(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  try {
    const sessionRaw = sessionStorage.getItem('smartlight_user_session');
    if (sessionRaw) {
      const user = JSON.parse(sessionRaw);
      const token = user.token || user.Token;
      const maNguoiDung = user.maNguoiDung || user.username;

      if (token || maNguoiDung) {
        await api.post('/PhienDangNhap/dang-xuat', {
          token: token || null,
          maNguoiDung: maNguoiDung || null
        }).catch(err => {
          console.warn('[Logout] Lỗi khi gọi API đăng xuất:', err);
        });
      }
    }
  } catch (err) {
    console.warn('[Logout] Lỗi xử lý đăng xuất:', err);
  } finally {
    sessionStorage.removeItem('smartlight_user_session');
    sessionStorage.removeItem('smartlight_rbac_notice');
    window.location.href = 'login.html';
  }
}

function attachLogoutListeners() {
  document.querySelectorAll('#linkLogout, .logout-link, [data-action="logout"]').forEach(el => {
    el.removeEventListener('click', handleLogout);
    el.addEventListener('click', handleLogout);
  });
}

function initUserHeaderAndAuth() {
  if (!enforcePageUrlAccessGuard()) return;
  normalizeSharedNavbar();
  syncHeaderUserInfo();
  applySidebarMenuRbac();
  applyActionButtonsRbac();
  attachLogoutListeners();
}

// Chạy đồng bộ ngay lập tức ngay khi script nạp (vì sidebar/topbar đã có trong DOM phía trên script)
initUserHeaderAndAuth();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initUserHeaderAndAuth();
    setTimeout(applyActionButtonsRbac, 400);
    setTimeout(applyActionButtonsRbac, 1200);
  });
} else {
  setTimeout(applyActionButtonsRbac, 400);
  setTimeout(applyActionButtonsRbac, 1200);
}

// Đưa ra phạm vi toàn cục window
window.api = api;
window.API_CONFIG = API_CONFIG;
window.RBAC_ROLES = RBAC_ROLES;
window.getCurrentRbacSession = getCurrentRbacSession;
window.hasPermission = hasPermission;
window.checkActionPermission = checkActionPermission;
window.normalizeSharedNavbar = normalizeSharedNavbar;
window.applySidebarMenuRbac = applySidebarMenuRbac;
window.applyActionButtonsRbac = applyActionButtonsRbac;
window.syncHeaderUserInfo = syncHeaderUserInfo;
window.formatRoleName = formatRoleName;
window.handleLogout = handleLogout;
window.attachLogoutListeners = attachLogoutListeners;
