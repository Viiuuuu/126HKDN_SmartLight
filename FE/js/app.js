/**
 * SmartLight Municipal IoT - Application JavaScript (Dashboard Tổng quan)
 * ==============================================================================
 * Tích hợp REST API CSDL dbSmartLight thông qua thư viện chuẩn FE/js/api-config.js.
 * - Quản lý số liệu KPI (tủ, tuyến, đèn, sự cố)
 * - Tải và hiển thị cảnh báo gần đây theo thời gian thực
 * - Hộp thoại xem nhanh chi tiết sự cố và điều phối / xác nhận xử lý
 * - Thanh thông báo hệ thống và tìm kiếm tức thời
 * ==============================================================================
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
  const alertsTableBody = document.getElementById('alertsTableBody');

  // KPI elements
  const valCabinets = document.getElementById('valCabinets');
  const valRoutes = document.getElementById('valRoutes');
  const valLights = document.getElementById('valLights');
  const valIncidents = document.getElementById('valIncidents');
  const sidebarAlertCount = document.getElementById('sidebarAlertCount');

  // Dropdowns & Profile
  const btnNotifications = document.getElementById('btnNotifications');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const notiDropdownHeader = document.getElementById('notiDropdownHeader');
  const notificationList = document.getElementById('notificationList');
  const notiBadgeDot = document.querySelector('.notification-badge-dot');
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

  // Technical Metrics Elements
  const techLabelVoltage = document.getElementById('techLabelVoltage');
  const techLabelCurrent = document.getElementById('techLabelCurrent');
  const techLabelPower = document.getElementById('techLabelPower');
  const techLabelExtra = document.getElementById('techLabelExtra');
  const techVoltage = document.getElementById('techVoltage');
  const techCurrent = document.getElementById('techCurrent');
  const techPower = document.getElementById('techPower');
  const techTemp = document.getElementById('techTemp');

  // Modal Action Buttons
  const modalLinkDetail = document.getElementById('modalLinkDetail');
  const modalLinkMap = document.getElementById('modalLinkMap');
  const btnDispatchTech = document.getElementById('btnDispatchTech');
  const btnAcknowledgeAlert = document.getElementById('btnAcknowledgeAlert');
  const toastContainer = document.getElementById('toastContainer');

  // -------------------------------------------------------------------------
  // 2. Global State & Fast Lookup Cache
  // -------------------------------------------------------------------------
  let state = {
    cabinets: [],
    routes: [],
    lights: [],
    alerts: [],
    areas: []
  };

  const cache = {
    cabinets: {},
    routes: {},
    lights: {},
    areas: {}
  };

  let currentModalAlert = null;
  let isFetching = false;

  // -------------------------------------------------------------------------
  // 3. Format & Helper Functions
  // -------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (_) {
      return String(dateStr);
    }
  }

  function formatTimeAgo(dateStr) {
    if (!dateStr) return 'Vừa xong';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) return 'Vừa xong';
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    } catch (_) {
      return 'Vừa xong';
    }
  }

  function formatNumber(num) {
    if (num == null || isNaN(num)) return '0';
    return Number(num).toLocaleString('vi-VN');
  }

  function resolveDevice(alert) {
    if (alert.maTu) {
      const code = String(alert.maTu).trim();
      const cab = cache.cabinets[code];
      return {
        type: 'cabinet',
        code: code,
        name: cab?.tenTu || code,
        label: `Tủ ${cab?.tenTu || code}`,
        areaCode: cab?.maKhuVuc || null,
        gps: (cab?.viDo && cab?.kinhDo) ? `${cab.viDo}° N, ${cab.kinhDo}° E` : null,
        raw: cab
      };
    }
    if (alert.maTuyen) {
      const code = String(alert.maTuyen).trim();
      const route = cache.routes[code];
      const cab = route?.maTu ? cache.cabinets[String(route.maTu).trim()] : null;
      return {
        type: 'route',
        code: code,
        name: route?.tenTuyen || code,
        label: `Tuyến ${route?.tenTuyen || code}`,
        areaCode: cab?.maKhuVuc || null,
        gps: null,
        raw: route
      };
    }
    if (alert.maDen) {
      const code = String(alert.maDen).trim();
      const light = cache.lights[code];
      const route = light?.maTuyen ? cache.routes[String(light.maTuyen).trim()] : null;
      const cab = route?.maTu ? cache.cabinets[String(route.maTu).trim()] : null;
      return {
        type: 'light',
        code: code,
        name: light?.tenDen || code,
        label: `Điểm đèn ${light?.tenDen || code}`,
        areaCode: cab?.maKhuVuc || null,
        gps: (light?.viDo && light?.kinhDo) ? `${light.viDo}° N, ${light.kinhDo}° E` : null,
        raw: light
      };
    }
    return {
      type: 'system',
      code: 'SYS',
      name: 'Toàn hệ thống',
      label: 'Hệ thống SmartLight',
      areaCode: null,
      gps: null,
      raw: null
    };
  }

  function resolveAreaName(areaCode) {
    if (!areaCode) return 'Chưa phân vùng';
    const code = String(areaCode).trim();
    const area = cache.areas[code];
    if (area && area.tenKhuVuc) {
      return `${area.tenKhuVuc} (${code})`;
    }
    return `Khu vực ${code}`;
  }

  function getAlertStatusBadge(trangThaiXuLy) {
    const s = Number(trangThaiXuLy);
    if (s === 0) {
      return {
        text: 'Chưa xử lý',
        badgeClass: 'badge-incident',
        badgeHtml: '<span class="badge-status badge-incident">Chưa xử lý</span>'
      };
    }
    if (s === 1) {
      return {
        text: 'Đang xử lý',
        badgeClass: 'badge-warning',
        badgeHtml: '<span class="badge-status badge-warning">Đang xử lý</span>'
      };
    }
    if (s === 2) {
      return {
        text: 'Đã xử lý',
        badgeClass: 'badge-lost',
        badgeHtml: '<span class="badge-status" style="background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">Đã xử lý</span>'
      };
    }
    return {
      text: 'Không rõ',
      badgeClass: 'badge-lost',
      badgeHtml: '<span class="badge-status">Không rõ</span>'
    };
  }

  // -------------------------------------------------------------------------
  // 4. Real-time Clock Sync (Vietnamese Format)
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
      topbarLiveClock.textContent = `${dayName}, ${date}/${month}/${year}`;
    }

    if (pageDateTimeText) {
      pageDateTimeText.textContent = `${dayName}, ${date} tháng ${month}, ${year} • ${hours}:${minutes}:${seconds}`;
    }
  }

  updateClocks();
  setInterval(updateClocks, 1000);

  // -------------------------------------------------------------------------
  // 5. User Session Integration
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
      console.warn('[Dashboard] Session parsing error:', err);
    }
  }

  // -------------------------------------------------------------------------
  // 6. API Data Fetching & Dashboard Data Binding
  // -------------------------------------------------------------------------
  async function loadDashboardData(isRefresh = false) {
    if (isFetching) return;
    isFetching = true;

    if (isRefresh && refreshSpinIcon) {
      refreshSpinIcon.classList.add('spinning');
    }

    try {
      const [cabinetsRes, routesRes, lightsRes, alertsRes, areasRes] = await Promise.allSettled([
        window.api.get('/TuChieuSang'),
        window.api.get('/TuyenChieuSang'),
        window.api.get('/DiemDen'),
        window.api.get('/CanhBao'),
        window.api.get('/KhuVuc')
      ]);

      // 1. Lưu state & build cache lookups
      state.cabinets = (cabinetsRes.status === 'fulfilled' && Array.isArray(cabinetsRes.value)) ? cabinetsRes.value : [];
      state.routes = (routesRes.status === 'fulfilled' && Array.isArray(routesRes.value)) ? routesRes.value : [];
      state.lights = (lightsRes.status === 'fulfilled' && Array.isArray(lightsRes.value)) ? lightsRes.value : [];
      state.alerts = (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) ? alertsRes.value : [];
      state.areas = (areasRes.status === 'fulfilled' && Array.isArray(areasRes.value)) ? areasRes.value : [];

      state.cabinets.forEach(c => { if (c.maTu) cache.cabinets[String(c.maTu).trim()] = c; });
      state.routes.forEach(r => { if (r.maTuyen) cache.routes[String(r.maTuyen).trim()] = r; });
      state.lights.forEach(l => { if (l.maDen) cache.lights[String(l.maDen).trim()] = l; });
      state.areas.forEach(a => { if (a.maKhuVuc) cache.areas[String(a.maKhuVuc).trim()] = a; });

      // 2. Cập nhật thẻ số liệu KPI
      updateKpis();

      // 3. Render bảng cảnh báo gần đây
      renderRecentAlertsTable();

      // 4. Render danh sách thông báo trên Topbar
      renderNotificationDropdown();

      if (isRefresh) {
        showToast('Đồng bộ dữ liệu IoT SmartLight hoàn tất lúc ' + new Date().toLocaleTimeString('vi-VN'), 'success');
      }
    } catch (err) {
      console.error('[Dashboard] Lỗi tải dữ liệu Dashboard:', err);
      showToast('Không thể kết nối đến máy chủ Backend: ' + (err.message || 'Lỗi mạng'), 'warning');
    } finally {
      isFetching = false;
      if (refreshSpinIcon) {
        refreshSpinIcon.classList.remove('spinning');
      }
    }
  }

  function updateKpis() {
    if (valCabinets) valCabinets.textContent = formatNumber(state.cabinets.length);
    if (valRoutes) valRoutes.textContent = formatNumber(state.routes.length);
    if (valLights) valLights.textContent = formatNumber(state.lights.length);

    // Sự cố chưa xử lý hoặc đang xử lý (trangThaiXuLy !== 2)
    const activeIncidents = state.alerts.filter(a => Number(a.trangThaiXuLy) !== 2);
    const incidentCount = activeIncidents.length;

    if (valIncidents) valIncidents.textContent = formatNumber(incidentCount);
    if (sidebarAlertCount) sidebarAlertCount.textContent = String(incidentCount);

    if (notiBadgeDot) {
      notiBadgeDot.style.display = incidentCount > 0 ? 'block' : 'none';
    }
    if (notiDropdownHeader) {
      notiDropdownHeader.textContent = `Thông báo mới (${incidentCount})`;
    }
  }

  // -------------------------------------------------------------------------
  // 7. Recent Alerts Table Rendering
  // -------------------------------------------------------------------------
  function renderRecentAlertsTable() {
    if (!alertsTableBody) return;

    // Lấy tối đa 10 cảnh báo mới nhất
    const displayAlerts = state.alerts.slice(0, 10);

    if (displayAlerts.length === 0) {
      alertsTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 32px; color: #64748b; font-size: 13px;">
            Hệ thống đang hoạt động an toàn, không có cảnh báo hoặc sự cố phát sinh.
          </td>
        </tr>
      `;
      return;
    }

    alertsTableBody.innerHTML = displayAlerts.map(alert => {
      const dev = resolveDevice(alert);
      const status = getAlertStatusBadge(alert.trangThaiXuLy);
      const timeStr = formatDateTime(alert.thoiGianPhatSinh);
      const content = escapeHtml(alert.noiDung || 'Không có mô tả chi tiết');

      return `
        <tr class="alert-row" data-id="${alert.maCanhBao}" style="cursor: pointer;">
          <td class="cell-time">${timeStr}</td>
          <td class="cell-device"><strong>${escapeHtml(dev.label)}</strong></td>
          <td class="cell-content">
            <div class="content-wrap">${content}</div>
          </td>
          <td class="cell-status">
            ${status.badgeHtml}
          </td>
        </tr>
      `;
    }).join('');

    // Gắn sự kiện click dòng mở modal
    const rows = alertsTableBody.querySelectorAll('.alert-row');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const id = Number(row.getAttribute('data-id'));
        const alertItem = state.alerts.find(a => a.maCanhBao === id);
        if (alertItem) {
          openIncidentModal(alertItem);
        }
      });
    });

    // Kích hoạt tìm kiếm nếu đang có query
    applySearchFilter();
  }

  // -------------------------------------------------------------------------
  // 8. Notification Popover Rendering
  // -------------------------------------------------------------------------
  function renderNotificationDropdown() {
    if (!notificationList) return;

    const activeAlerts = state.alerts.filter(a => Number(a.trangThaiXuLy) !== 2).slice(0, 5);

    if (activeAlerts.length === 0) {
      notificationList.innerHTML = `
        <li class="notification-item" style="padding: 18px 16px; text-align: center; color: #64748b; font-size: 12px;">
          Không có thông báo sự cố mới cần xử lý.
        </li>
      `;
      return;
    }

    notificationList.innerHTML = activeAlerts.map(a => {
      const dev = resolveDevice(a);
      const timeAgo = formatTimeAgo(a.thoiGianPhatSinh);
      const indicator = (Number(a.mucDo) === 3) ? 'danger' : ((Number(a.mucDo) === 2) ? 'warning' : 'info');
      const title = `${dev.label}: ${escapeHtml(a.noiDung || 'Cảnh báo hệ thống')}`;

      return `
        <li class="notification-item unread" data-id="${a.maCanhBao}" style="cursor: pointer;">
          <span class="noti-indicator ${indicator}"></span>
          <div>
            <p class="noti-title">${title}</p>
            <small class="noti-time">${timeAgo}</small>
          </div>
        </li>
      `;
    }).join('');

    // Click vào item thông báo -> mở modal chi tiết
    notificationList.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = Number(item.getAttribute('data-id'));
        const alertItem = state.alerts.find(a => a.maCanhBao === id);
        if (alertItem) {
          closeAllPopovers();
          openIncidentModal(alertItem);
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 9. Quick Incident Modal Logic & Real Telemetry Fetching
  // -------------------------------------------------------------------------
  async function openIncidentModal(alert) {
    currentModalAlert = alert;
    const dev = resolveDevice(alert);
    const status = getAlertStatusBadge(alert.trangThaiXuLy);

    // Gán dữ liệu cơ bản
    if (modalDeviceName) modalDeviceName.textContent = dev.label;
    if (modalDeviceId) modalDeviceId.textContent = dev.code;
    if (modalTime) modalTime.textContent = formatDateTime(alert.thoiGianPhatSinh);
    if (modalArea) modalArea.textContent = resolveAreaName(dev.areaCode);
    if (modalGps) modalGps.textContent = dev.gps || 'Chưa cập nhật tọa độ';
    if (modalDescription) modalDescription.textContent = alert.noiDung || 'Không có ghi chú mô tả chi tiết.';

    // Cập nhật trạng thái badge trên modal
    if (modalStatusBadge) {
      modalStatusBadge.textContent = status.text;
      modalStatusBadge.className = `modal-badge-status ${status.badgeClass}`;
    }

    // Cập nhật nút liên kết
    if (modalLinkDetail) {
      modalLinkDetail.href = `alert-detail.html?id=${alert.maCanhBao}`;
    }
    if (modalLinkMap) {
      modalLinkMap.href = 'map.html';
    }

    // Reset thông số kỹ thuật tạm thời trước khi nạp
    if (techVoltage) techVoltage.textContent = '-- V';
    if (techCurrent) techCurrent.textContent = '-- A';
    if (techPower) techPower.textContent = '-- W';
    if (techTemp) techTemp.textContent = '--';

    // Điều chỉnh nhãn & tải telemetry thực từ CSDL dbSmartLight
    if (dev.type === 'light') {
      if (techLabelVoltage) techLabelVoltage.textContent = 'Điện áp LED';
      if (techLabelCurrent) techLabelCurrent.textContent = 'Dòng tải LED';
      if (techLabelPower) techLabelPower.textContent = 'Công suất thực';
      if (techLabelExtra) techLabelExtra.textContent = 'Nhiệt độ LED';

      try {
        const readings = await window.api.get('/DuLieuGiamSatDen', { maDen: dev.code, limit: 1 });
        if (Array.isArray(readings) && readings.length > 0) {
          const r = readings[0];
          if (techVoltage && r.dienAp != null) techVoltage.textContent = `${r.dienAp} V`;
          if (techCurrent && r.dongDien != null) techCurrent.textContent = `${r.dongDien} A`;
          if (techPower && r.congSuatThucTe != null) techPower.textContent = `${r.congSuatThucTe} W`;
          if (techTemp && r.nhietDoLed != null) techTemp.textContent = `${r.nhietDoLed} °C`;
        }
      } catch (e) {
        console.warn('[Dashboard] Không thể tải giám sát đèn:', e);
      }
    } else if (dev.type === 'cabinet') {
      if (techLabelVoltage) techLabelVoltage.textContent = 'Điện áp Pha A';
      if (techLabelCurrent) techLabelCurrent.textContent = 'Dòng tải Pha A';
      if (techLabelPower) techLabelPower.textContent = 'Công suất tủ';
      if (techLabelExtra) techLabelExtra.textContent = 'Điện năng lũy kế';

      try {
        const readings = await window.api.get('/DuLieuGiamSatTu', { maTu: dev.code, limit: 1 });
        if (Array.isArray(readings) && readings.length > 0) {
          const r = readings[0];
          if (techVoltage && r.dienApPha1 != null) techVoltage.textContent = `${r.dienApPha1} V`;
          if (techCurrent && r.dongDienPha1 != null) techCurrent.textContent = `${r.dongDienPha1} A`;
          if (techPower && r.congSuat != null) techPower.textContent = `${r.congSuat} kW`;
          if (techTemp && r.dienNang != null) techTemp.textContent = `${r.dienNang} kWh`;
        }
      } catch (e) {
        console.warn('[Dashboard] Không thể tải giám sát tủ:', e);
      }
    } else {
      if (techLabelVoltage) techLabelVoltage.textContent = 'Điện áp';
      if (techLabelCurrent) techLabelCurrent.textContent = 'Dòng tải';
      if (techLabelPower) techLabelPower.textContent = 'Công suất';
      if (techLabelExtra) techLabelExtra.textContent = 'Chỉ số đo';
    }

    if (incidentModal) {
      incidentModal.classList.add('active');
    }
  }

  function closeModal() {
    if (incidentModal) {
      incidentModal.classList.remove('active');
    }
    currentModalAlert = null;
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeModal);
  }

  if (incidentModal) {
    incidentModal.addEventListener('click', (e) => {
      if (e.target === incidentModal) closeModal();
    });
  }

  // Nút Điều phối đội kỹ thuật
  if (btnDispatchTech) {
    btnDispatchTech.addEventListener('click', async () => {
      if (!currentModalAlert) return;
      btnDispatchTech.disabled = true;
      btnDispatchTech.style.opacity = '0.6';

      try {
        await window.api.put(`/CanhBao/${currentModalAlert.maCanhBao}`, {
          trangThaiXuLy: 1,
          ghiChuXuLy: 'Đã điều phối đội kỹ thuật xử lý từ Dashboard'
        });

        currentModalAlert.trangThaiXuLy = 1;
        showToast(`Đã điều phối kỹ thuật xử lý cảnh báo #${currentModalAlert.maCanhBao}`, 'success');
        updateKpis();
        renderRecentAlertsTable();
        renderNotificationDropdown();
        closeModal();
      } catch (err) {
        console.error('[Dashboard] Lỗi điều phối:', err);
        showToast('Lỗi cập nhật điều phối: ' + (err.message || 'Không thể gửi yêu cầu'), 'warning');
      } finally {
        btnDispatchTech.disabled = false;
        btnDispatchTech.style.opacity = '1';
      }
    });
  }

  // Nút Xác nhận đã xử lý
  if (btnAcknowledgeAlert) {
    btnAcknowledgeAlert.addEventListener('click', async () => {
      if (!currentModalAlert) return;
      btnAcknowledgeAlert.disabled = true;
      btnAcknowledgeAlert.style.opacity = '0.6';

      try {
        await window.api.put(`/CanhBao/${currentModalAlert.maCanhBao}`, {
          trangThaiXuLy: 2,
          ghiChuXuLy: 'Đã xác nhận xử lý xong từ Dashboard'
        });

        currentModalAlert.trangThaiXuLy = 2;
        showToast(`Đã cập nhật trạng thái đã xử lý cho cảnh báo #${currentModalAlert.maCanhBao}`, 'success');
        updateKpis();
        renderRecentAlertsTable();
        renderNotificationDropdown();
        closeModal();
      } catch (err) {
        console.error('[Dashboard] Lỗi xác nhận xử lý:', err);
        showToast('Lỗi cập nhật trạng thái: ' + (err.message || 'Không thể gửi yêu cầu'), 'warning');
      } finally {
        btnAcknowledgeAlert.disabled = false;
        btnAcknowledgeAlert.style.opacity = '1';
      }
    });
  }

  // -------------------------------------------------------------------------
  // 10. Instant Search Filtering
  // -------------------------------------------------------------------------
  function applySearchFilter() {
    if (!alertsTableBody) return;
    const query = (topSearchInput?.value || '').trim().toLowerCase();
    const rows = alertsTableBody.querySelectorAll('.alert-row');
    let visibleCount = 0;

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (query === '' || text.includes(query)) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (emptyAlertState) {
      emptyAlertState.style.display = (visibleCount === 0 && rows.length > 0) ? 'block' : 'none';
    }
  }

  if (topSearchInput) {
    topSearchInput.addEventListener('input', applySearchFilter);
  }

  if (btnResetSearch) {
    btnResetSearch.addEventListener('click', () => {
      if (topSearchInput) topSearchInput.value = '';
      applySearchFilter();
    });
  }

  // Keyboard shortcut Ctrl + K
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
  // 11. Refresh System Button
  // -------------------------------------------------------------------------
  if (btnRefreshSystem) {
    btnRefreshSystem.addEventListener('click', () => {
      loadDashboardData(true);
    });
  }

  // -------------------------------------------------------------------------
  // 12. Topbar Popovers (Notifications & Profile)
  // -------------------------------------------------------------------------
  function closeAllPopovers() {
    if (notificationDropdown) notificationDropdown.classList.remove('active');
    if (userDropdown) userDropdown.classList.remove('active');
  }

  if (btnNotifications) {
    btnNotifications.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = notificationDropdown?.classList.contains('active');
      closeAllPopovers();
      if (!isOpen && notificationDropdown) notificationDropdown.classList.add('active');
    });
  }

  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', (e) => {
      e.stopPropagation();
      if (notiBadgeDot) notiBadgeDot.style.display = 'none';
      const unreads = notificationList?.querySelectorAll('.notification-item.unread');
      unreads?.forEach(i => i.classList.remove('unread'));
      if (notiDropdownHeader) notiDropdownHeader.textContent = 'Thông báo mới (0)';
      showToast('Đã đánh dấu đọc tất cả thông báo', 'success');
    });
  }

  if (btnUserProfile) {
    btnUserProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = userDropdown?.classList.contains('active');
      closeAllPopovers();
      if (!isOpen && userDropdown) userDropdown.classList.add('active');
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.notification-wrapper') && !e.target.closest('.user-profile-wrapper')) {
      closeAllPopovers();
    }
  });

  // Logout action (ATTT Cấp độ 3)
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
  // 13. Mobile Sidebar
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
      if (href && !href.startsWith('#') && href !== '') {
        return;
      }
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const title = link.querySelector('.nav-label')?.textContent;
      if (title) {
        showToast(`Chức năng ${title} đang hoàn thiện`, 'warning');
      }
      if (window.innerWidth <= 900) {
        closeMobileSidebar();
      }
    });
  });

  // -------------------------------------------------------------------------
  // 14. Toast Notification System
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
      <span>${escapeHtml(message)}</span>
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

  // -------------------------------------------------------------------------
  // 15. Initial Data Loading
  // -------------------------------------------------------------------------
  loadDashboardData();
});
