/**
 * SmartLight Municipal IoT - Activity Log Module (Nhật ký hệ thống & Nhật ký hoạt động cá nhân)
 * ==============================================================================
 * Tuân thủ Use-case:
 * - 2.3.4.9:  Theo dõi nhật ký hoạt động hệ thống (Quản trị viên - Xem toàn bộ hệ thống)
 * - 2.3.4.16: Xem lịch sử hoạt động cá nhân (Nhân viên vận hành - Chỉ xem nhật ký của chính mình)
 * - Nhân viên kỹ thuật: Bị chặn hoàn toàn, ẩn trên menu.
 * Tích hợp REST API CSDL dbSmartLight: GET /api/NhatKyHeThong
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Kiểm tra Phiên đăng nhập & Phân quyền 2 Actor
  // -------------------------------------------------------------------------
  const sessionRaw = sessionStorage.getItem('smartlight_user_session');
  let session = null;
  try {
    session = sessionRaw ? JSON.parse(sessionRaw) : null;
  } catch (err) {
    console.error('[ActivityLog] Không thể đọc phiên làm việc:', err);
  }

  // Hỗ trợ đồng bộ với RBAC session từ api-config nếu có
  if (!session && typeof window.getCurrentRbacSession === 'function') {
    const rbac = window.getCurrentRbacSession();
    if (rbac && rbac.session) {
      session = rbac.session;
    }
  }

  if (!session) {
    window.location.replace('login.html');
    return;
  }

  const rawRole = (session.role || session.vaiTro || '').toString().toLowerCase().trim();
  const maVaiTro = Number(session.maVaiTro);

  const isAdmin = maVaiTro === 1 || rawRole.includes('quản trị') || rawRole.includes('admin') || rawRole.includes('quantri');
  const isOperator = maVaiTro === 2 || rawRole.includes('vận hành') || rawRole.includes('operator') || rawRole.includes('vanhanh');
  const isTechnician = maVaiTro === 3 || rawRole.includes('kỹ thuật') || rawRole.includes('technician') || rawRole.includes('kythuat');

  // Chặn nhân viên kỹ thuật hoặc các vai trò không được phép
  if (isTechnician) {
    alert('Nhân viên kỹ thuật không có quyền truy cập chức năng Nhật ký hệ thống.');
    window.location.replace('index.html');
    return;
  }

  if (!isAdmin && !isOperator) {
    alert('Tài khoản của bạn không có quyền truy cập trang này.');
    window.location.replace('index.html');
    return;
  }

  // Cho phép hiển thị giao diện sau khi xác thực quyền
  document.body.classList.add('authorized');

  // -------------------------------------------------------------------------
  // 2. Elements Cache
  // -------------------------------------------------------------------------
  const pageHtmlTitle = document.getElementById('pageHtmlTitle');
  const breadcrumbTitle = document.getElementById('breadcrumbTitle');
  const headingTitle = document.getElementById('headingTitle');
  const headingDesc = document.getElementById('headingDesc');
  const scopeBadge = document.getElementById('scopeBadge');
  const scopeIcon = document.getElementById('scopeIcon');
  const scopeText = document.getElementById('scopeText');
  const sidebarLogLabel = document.getElementById('sidebarLogLabel');
  const tableHeadingTitle = document.getElementById('tableHeadingTitle');
  const userFilterWrapper = document.getElementById('userFilterWrapper');
  const userFilter = document.getElementById('userFilter');
  const thUser = document.getElementById('thUser');

  // Bộ lọc
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const actionFilter = document.getElementById('actionFilter');
  const statusFilter = document.getElementById('statusFilter');
  const targetFilter = document.getElementById('targetFilter');
  const tableSearch = document.getElementById('tableSearch');
  const btnSearch = document.getElementById('btnSearch');
  const btnReset = document.getElementById('btnReset');
  const btnRefresh = document.getElementById('btnRefresh');
  const btnExport = document.getElementById('btnExport');

  // Chỉ số tóm tắt (Summary Cards)
  const totalCountEl = document.getElementById('totalCount');
  const successCountEl = document.getElementById('successCount');
  const failureCountEl = document.getElementById('failureCount');
  const targetCountEl = document.getElementById('targetCount');
  const successRateEl = document.getElementById('successRate');
  const failureNoteEl = document.getElementById('failureNote');

  // Bảng & Phân trang
  const tableBody = document.getElementById('activityRows');
  const emptyState = document.getElementById('emptyState');
  const resultSummary = document.getElementById('resultSummary');
  const pagination = document.getElementById('pagination');
  const pageSizeSelect = document.getElementById('pageSize');

  // Hộp thoại chi tiết (Dialog)
  const detailDialog = document.getElementById('detailDialog');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogDetails = document.getElementById('dialogDetails');
  const btnCloseDialog = document.getElementById('btnCloseDialog');
  const toastContainer = document.getElementById('toastContainer');

  // Đồng hồ & Tìm kiếm Topbar
  const liveClockDisplay = document.getElementById('liveClockDisplay');
  const globalSearch = document.getElementById('globalSearch');
  const btnToggleMobileSidebar = document.getElementById('btnToggleMobileSidebar');
  const btnCloseSidebar = document.getElementById('btnCloseSidebar');
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  // -------------------------------------------------------------------------
  // 3. Khởi tạo Giao diện theo từng Actor
  // -------------------------------------------------------------------------
  const currentUserCode = session.maNguoiDung || session.username || 'user';
  const currentDisplayName = session.fullName || session.hoTen || session.username || 'Người dùng';

  if (isAdmin) {
    // Actor: Quản trị viên -> Theo dõi nhật ký hoạt động hệ thống (Use-case 2.3.4.9)
    if (pageHtmlTitle) pageHtmlTitle.textContent = 'Nhật ký hệ thống | SmartLight';
    if (breadcrumbTitle) breadcrumbTitle.textContent = 'Nhật ký hệ thống';
    if (headingTitle) headingTitle.textContent = 'Nhật ký hệ thống';
    if (headingDesc) headingDesc.textContent = 'Quản trị viên theo dõi lịch sử thao tác của người dùng trên toàn hệ thống.';
    if (sidebarLogLabel) sidebarLogLabel.textContent = 'Nhật ký hệ thống';
    if (tableHeadingTitle) tableHeadingTitle.textContent = 'Danh sách nhật ký hệ thống';

    if (scopeIcon) scopeIcon.textContent = 'admin_panel_settings';
    if (scopeText) scopeText.textContent = 'Toàn hệ thống (Quản trị viên)';
    if (scopeBadge) {
      scopeBadge.style.backgroundColor = '#f1f5f9';
      scopeBadge.style.borderColor = '#cbd5e1';
      scopeBadge.style.color = '#334155';
    }

    if (userFilterWrapper) userFilterWrapper.style.display = 'block';
    if (thUser) thUser.style.display = '';
  } else {
    // Actor: Nhân viên vận hành -> Xem lịch sử hoạt động cá nhân (Use-case 2.3.4.16)
    if (pageHtmlTitle) pageHtmlTitle.textContent = 'Nhật ký hoạt động cá nhân | SmartLight';
    if (breadcrumbTitle) breadcrumbTitle.textContent = 'Nhật ký hoạt động cá nhân';
    if (headingTitle) headingTitle.textContent = 'Nhật ký hoạt động cá nhân';
    if (headingDesc) headingDesc.textContent = 'Xem và tra cứu lịch sử các thao tác do chính tài khoản của bạn thực hiện trên hệ thống.';
    if (sidebarLogLabel) sidebarLogLabel.textContent = 'Nhật ký hoạt động';
    if (tableHeadingTitle) tableHeadingTitle.textContent = 'Danh sách nhật ký hoạt động cá nhân';

    if (scopeIcon) scopeIcon.textContent = 'person_check';
    if (scopeText) scopeText.textContent = `Chỉ tài khoản của bạn (${currentUserCode})`;
    if (scopeBadge) {
      scopeBadge.style.backgroundColor = '#eff6ff';
      scopeBadge.style.borderColor = '#dbeafe';
      scopeBadge.style.color = '#1d4ed8';
    }

    // Ẩn trường lọc tài khoản vì nhân viên vận hành chỉ được xem của chính mình
    if (userFilterWrapper) userFilterWrapper.style.display = 'none';
    if (thUser) thUser.style.display = 'none';
  }

  // Đồng bộ thông tin người dùng trên Header
  if (typeof window.syncHeaderUserInfo === 'function') {
    window.syncHeaderUserInfo();
  }

  // -------------------------------------------------------------------------
  // 4. State Management
  // -------------------------------------------------------------------------
  let allLogs = [];
  let filteredLogs = [];
  let currentPage = 1;
  let pageSize = Number(pageSizeSelect?.value || 10);
  let isFetching = false;

  // -------------------------------------------------------------------------
  // 5. Đồng hồ thời gian thực
  // -------------------------------------------------------------------------
  const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  function updateClock() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (liveClockDisplay) {
      liveClockDisplay.textContent = `${weekdays[now.getDay()]}, ${day}/${month}/${year} • ${hours}:${minutes}:${seconds}`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // -------------------------------------------------------------------------
  // 6. Helpers Format & Styles
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

  function formatDateTimeParts(dateStr) {
    if (!dateStr) return { date: '--', time: '--' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: String(dateStr), time: '' };
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}:${seconds}`
      };
    } catch (_) {
      return { date: String(dateStr), time: '' };
    }
  }

  function getActionBadge(action) {
    const act = (action || '').toString().trim();
    const lower = act.toLowerCase();

    if (lower.includes('đăng nhập')) {
      return { badgeClass: 'action-auth', icon: 'login', label: act };
    }
    if (lower.includes('đăng xuất')) {
      return { badgeClass: 'action-auth', icon: 'logout', label: act };
    }
    if (lower.includes('điều khiển') || lower.includes('bật') || lower.includes('tắt') || lower.includes('sáng')) {
      return { badgeClass: 'action-control', icon: 'tune', label: act };
    }
    if (lower.includes('xem') || lower.includes('tra cứu')) {
      return { badgeClass: 'action-view', icon: 'visibility', label: act };
    }
    if (lower.includes('quản lý') || lower.includes('cập nhật') || lower.includes('thêm') || lower.includes('sửa') || lower.includes('xóa')) {
      return { badgeClass: 'action-manage', icon: 'settings', label: act };
    }
    if (lower.includes('cảnh báo') || lower.includes('sự cố')) {
      return { badgeClass: 'action-alert', icon: 'warning', label: act };
    }
    return { badgeClass: 'action-view', icon: 'info', label: act || 'Hoạt động' };
  }

  function getResultBadge(result) {
    const isSuccess = Number(result) === 1;
    if (isSuccess) {
      return `<span class="result-badge result-success"><span class="material-symbols-outlined">check_circle</span> Thành công</span>`;
    }
    return `<span class="result-badge result-failed"><span class="material-symbols-outlined">cancel</span> Thất bại</span>`;
  }

  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    if (type === 'error') {
      toast.style.background = '#e11d48';
    } else if (type === 'success') {
      toast.style.background = '#059669';
    } else {
      toast.style.background = '#1e3a8a';
    }
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // -------------------------------------------------------------------------
  // 7. Tải Dữ liệu từ API Backend (GET /api/NhatKyHeThong)
  // -------------------------------------------------------------------------
  async function loadLogsFromApi(showFeedback = false) {
    if (isFetching) return;
    isFetching = true;

    if (btnRefresh) {
      btnRefresh.disabled = true;
      btnRefresh.style.opacity = '0.6';
    }

    try {
      // Thiết lập tham số gọi API:
      // - Quản trị viên: Tải toàn bộ nhật ký hệ thống
      // - Nhân viên vận hành: BẮT BUỘC lọc theo mã tài khoản hiện tại
      const queryParams = { limit: 1000 };
      if (!isAdmin) {
        queryParams.maNguoiDung = currentUserCode;
      }

      const data = await window.api.get('/NhatKyHeThong', queryParams);

      if (Array.isArray(data)) {
        allLogs = data;
      } else {
        allLogs = [];
      }

      // Áp dụng bộ lọc hiện tại
      applyFilters();

      if (showFeedback) {
        showToast('Đã đồng bộ dữ liệu nhật ký mới nhất từ máy chủ.', 'success');
      }
    } catch (err) {
      console.error('[ActivityLog] Lỗi tải dữ liệu nhật ký:', err);
      showToast('Không thể tải thông tin hoạt động từ máy chủ: ' + (err.message || 'Lỗi kết nối'), 'error');
      allLogs = [];
      applyFilters();
    } finally {
      isFetching = false;
      if (btnRefresh) {
        btnRefresh.disabled = false;
        btnRefresh.style.opacity = '1';
      }
    }
  }

  // -------------------------------------------------------------------------
  // 8. Lọc Dữ liệu (Filtering & Search)
  // -------------------------------------------------------------------------
  function applyFilters() {
    // 1. Kiểm tra tính hợp lệ của khoảng thời gian (Exception Flow 5b)
    const startVal = startDate?.value ? new Date(startDate.value) : null;
    const endVal = endDate?.value ? new Date(endDate.value) : null;

    if (startVal && endVal && startVal > endVal) {
      showToast('Khoảng thời gian tìm kiếm không hợp lệ (Từ ngày không được lớn hơn Đến ngày).', 'error');
      return;
    }

    const actionVal = (actionFilter?.value || '').trim().toLowerCase();
    const statusVal = statusFilter?.value !== '' ? Number(statusFilter?.value) : null;
    const targetVal = (targetFilter?.value || '').trim().toLowerCase();
    const userVal = isAdmin ? (userFilter?.value || '').trim().toLowerCase() : '';
    const query = ((tableSearch?.value || globalSearch?.value || '')).trim().toLowerCase();

    filteredLogs = allLogs.filter(item => {
      // Lọc theo người dùng (Dành cho Quản trị viên)
      if (isAdmin && userVal) {
        const itemUser = (item.maNguoiDung || '').toLowerCase();
        if (!itemUser.includes(userVal)) return false;
      }

      // Lọc theo thời gian
      if (item.thoiGian) {
        const logDate = new Date(item.thoiGian);
        if (startVal && logDate < startVal) return false;
        if (endVal && logDate > endVal) return false;
      }

      // Lọc theo loại thao tác
      if (actionVal) {
        const itemAction = (item.hanhDong || '').toLowerCase();
        if (!itemAction.includes(actionVal)) return false;
      }

      // Lọc theo trạng thái kết quả
      if (statusVal !== null && !isNaN(statusVal)) {
        if (Number(item.ketQua) !== statusVal) return false;
      }

      // Lọc theo đối tượng tác động
      if (targetVal) {
        const itemTarget = (item.doiTuong || '').toLowerCase();
        if (!itemTarget.includes(targetVal)) return false;
      }

      // Tìm kiếm từ khóa tự do
      if (query) {
        const matchString = `${item.maNhatKy} ${item.maNguoiDung} ${item.hanhDong} ${item.doiTuong} ${item.chiTiet} ${item.diaChiIP}`.toLowerCase();
        if (!matchString.includes(query)) return false;
      }

      return true;
    });

    currentPage = 1;
    updateSummaryCards();
    renderTable();
  }

  // -------------------------------------------------------------------------
  // 9. Cập nhật Thẻ Chỉ số Tóm tắt (Summary Cards)
  // -------------------------------------------------------------------------
  function updateSummaryCards() {
    const total = filteredLogs.length;
    const successCount = filteredLogs.filter(x => Number(x.ketQua) === 1).length;
    const failureCount = filteredLogs.filter(x => Number(x.ketQua) === 0).length;

    // Đếm số đối tượng tác động duy nhất
    const uniqueTargets = new Set();
    filteredLogs.forEach(x => {
      if (x.doiTuong && x.doiTuong.trim()) {
        uniqueTargets.add(x.doiTuong.trim());
      }
    });

    if (totalCountEl) totalCountEl.textContent = total.toLocaleString('vi-VN');
    if (successCountEl) successCountEl.textContent = successCount.toLocaleString('vi-VN');
    if (failureCountEl) failureCountEl.textContent = failureCount.toLocaleString('vi-VN');
    if (targetCountEl) targetCountEl.textContent = uniqueTargets.size.toLocaleString('vi-VN');

    // Tỷ lệ thành công
    const rate = total > 0 ? ((successCount / total) * 100).toFixed(1) : 100;
    if (successRateEl) successRateEl.textContent = `${rate}% thành công`;
    if (failureNoteEl) failureNoteEl.textContent = `${failureCount} sự cố / thất bại`;
  }

  // -------------------------------------------------------------------------
  // 10. Render Bảng Nhật ký & Phân trang
  // -------------------------------------------------------------------------
  function renderTable() {
    if (!tableBody) return;

    if (filteredLogs.length === 0) {
      tableBody.innerHTML = '';
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.textContent = 'Không tìm thấy nhật ký hoạt động phù hợp với điều kiện tìm kiếm.';
      }
      if (resultSummary) resultSummary.textContent = 'Không có bản ghi nào';
      if (pagination) pagination.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.hidden = true;

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredLogs.length);
    const pageItems = filteredLogs.slice(startIndex, endIndex);

    tableBody.innerHTML = pageItems.map((item, idx) => {
      const stt = startIndex + idx + 1;
      const timeParts = formatDateTimeParts(item.thoiGian);
      const actionBadge = getActionBadge(item.hanhDong);
      const resultBadge = getResultBadge(item.ketQua);
      const userCol = isAdmin 
        ? `<td style="font-weight: 700; color: #1e3a8a;">${escapeHtml(item.maNguoiDung || '--')}</td>`
        : '';

      return `
        <tr data-id="${item.maNhatKy}" style="cursor: pointer;">
          <td style="color: #64748b; font-weight: 600;">${stt}</td>
          <td>
            <span class="table-time">${timeParts.date}</span>
            <span class="table-time-sub">${timeParts.time}</span>
          </td>
          ${userCol}
          <td>
            <span class="action-badge ${actionBadge.badgeClass}">
              <span class="material-symbols-outlined">${actionBadge.icon}</span>
              ${escapeHtml(actionBadge.label)}
            </span>
          </td>
          <td style="font-weight: 600; color: #0f172a;">${escapeHtml(item.doiTuong || 'Hệ thống')}</td>
          <td class="notes-cell" title="${escapeHtml(item.chiTiet || '')}">${escapeHtml(item.chiTiet || '--')}</td>
          <td style="font-family: monospace; color: #475569; font-size: 10px;">${escapeHtml(item.diaChiIP || '--')}</td>
          <td>${resultBadge}</td>
          <td style="text-align: center;">
            <button class="view-detail btn-view-log" data-id="${item.maNhatKy}" type="button" title="Xem chi tiết bản ghi">
              <span class="material-symbols-outlined">visibility</span>
              <span>Chi tiết</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Cập nhật thông tin phân trang dưới chân bảng
    if (resultSummary) {
      resultSummary.textContent = `Hiển thị ${startIndex + 1} - ${endIndex} trên tổng số ${filteredLogs.length} bản ghi`;
    }

    renderPagination(totalPages);

    // Gắn sự kiện click xem chi tiết
    tableBody.querySelectorAll('.btn-view-log').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.getAttribute('data-id'));
        openDetailDialog(id);
      });
    });

    tableBody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', () => {
        const id = Number(row.getAttribute('data-id'));
        openDetailDialog(id);
      });
    });
  }

  function renderPagination(totalPages) {
    if (!pagination) return;
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Nút Trang trước
    const btnPrev = document.createElement('button');
    btnPrev.type = 'button';
    btnPrev.innerHTML = '‹';
    btnPrev.title = 'Trang trước';
    btnPrev.disabled = currentPage === 1;
    btnPrev.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
    pagination.appendChild(btnPrev);

    // Danh sách số trang
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      const pageBtn = document.createElement('button');
      pageBtn.type = 'button';
      pageBtn.textContent = p;
      if (p === currentPage) {
        pageBtn.style.background = '#2563eb';
        pageBtn.style.color = '#fff';
        pageBtn.style.borderColor = '#2563eb';
        pageBtn.style.fontWeight = '700';
      }
      pageBtn.addEventListener('click', () => {
        currentPage = p;
        renderTable();
      });
      pagination.appendChild(pageBtn);
    }

    // Nút Trang sau
    const btnNext = document.createElement('button');
    btnNext.type = 'button';
    btnNext.innerHTML = '›';
    btnNext.title = 'Trang sau';
    btnNext.disabled = currentPage === totalPages;
    btnNext.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
    pagination.appendChild(btnNext);
  }

  // -------------------------------------------------------------------------
  // 11. Hộp thoại Xem Chi tiết (Dialog Detail)
  // -------------------------------------------------------------------------
  function openDetailDialog(logId) {
    const item = allLogs.find(x => x.maNhatKy === logId);
    if (!item) {
      showToast('Không thể tải thông tin chi tiết của hoạt động này.', 'error');
      return;
    }

    const timeParts = formatDateTimeParts(item.thoiGian);
    const isSuccess = Number(item.ketQua) === 1;

    if (dialogTitle) {
      dialogTitle.textContent = `${item.hanhDong} - #${item.maNhatKy}`;
    }

    if (dialogDetails) {
      dialogDetails.innerHTML = `
        <div>
          <dt>Mã sự kiện</dt>
          <dd style="font-family: monospace;">#${item.maNhatKy}</dd>
        </div>
        <div>
          <dt>Thời gian</dt>
          <dd>${timeParts.date} lúc ${timeParts.time}</dd>
        </div>
        <div>
          <dt>Tài khoản thực hiện</dt>
          <dd><strong style="color: #1e3a8a;">${escapeHtml(item.maNguoiDung || 'Hệ thống')}</strong></dd>
        </div>
        <div>
          <dt>Loại thao tác</dt>
          <dd><span class="action-badge ${getActionBadge(item.hanhDong).badgeClass}">${escapeHtml(item.hanhDong || '--')}</span></dd>
        </div>
        <div>
          <dt>Đối tượng tác động</dt>
          <dd>${escapeHtml(item.doiTuong || 'Hệ thống SmartLight')}</dd>
        </div>
        <div>
          <dt>Nội dung chi tiết</dt>
          <dd style="white-space: pre-wrap; line-height: 1.5;">${escapeHtml(item.chiTiet || 'Không có mô tả chi tiết')}</dd>
        </div>
        <div>
          <dt>Địa chỉ IP máy trạm</dt>
          <dd style="font-family: monospace;">${escapeHtml(item.diaChiIP || 'Không xác định')}</dd>
        </div>
        <div>
          <dt>Trạng thái kết quả</dt>
          <dd>${getResultBadge(item.ketQua)}</dd>
        </div>
      `;
    }

    if (detailDialog) {
      detailDialog.showModal();
    }
  }

  if (btnCloseDialog) {
    btnCloseDialog.addEventListener('click', () => {
      if (detailDialog) detailDialog.close();
    });
  }

  if (detailDialog) {
    detailDialog.addEventListener('click', (e) => {
      if (e.target === detailDialog) {
        detailDialog.close();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 12. Xuất Báo cáo Danh sách Nhật ký (Export CSV UTF-8)
  // -------------------------------------------------------------------------
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (filteredLogs.length === 0) {
        showToast('Không có dữ liệu nhật ký nào để xuất báo cáo.', 'error');
        return;
      }

      try {
        const headers = ['STT', 'Mã nhật ký', 'Thời gian', 'Tài khoản', 'Loại thao tác', 'Đối tượng', 'Mô tả chi tiết', 'Địa chỉ IP', 'Kết quả'];
        const csvRows = [];
        // Ký tự BOM (\uFEFF) giúp Microsoft Excel hiển thị đúng font tiếng Việt UTF-8
        csvRows.push('\uFEFF' + headers.join(','));

        filteredLogs.forEach((item, index) => {
          const timeParts = formatDateTimeParts(item.thoiGian);
          const fullTime = `${timeParts.date} ${timeParts.time}`;
          const resultStr = Number(item.ketQua) === 1 ? 'Thành công' : 'Thất bại';

          const row = [
            index + 1,
            item.maNhatKy,
            `"${fullTime}"`,
            `"${(item.maNguoiDung || '').replace(/"/g, '""')}"`,
            `"${(item.hanhDong || '').replace(/"/g, '""')}"`,
            `"${(item.doiTuong || '').replace(/"/g, '""')}"`,
            `"${(item.chiTiet || '').replace(/"/g, '""')}"`,
            `"${item.diaChiIP || ''}"`,
            `"${resultStr}"`
          ];
          csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const nowStr = new Date().toISOString().slice(0, 10);
        const fileName = `Nhat_ky_${isAdmin ? 'he_thong' : 'hoat_dong_ca_nhan'}_${nowStr}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast(`Đã xuất ${filteredLogs.length} bản ghi nhật ký ra file: ${fileName}`, 'success');
      } catch (err) {
        console.error('[ActivityLog] Lỗi xuất file CSV:', err);
        showToast('Không thể xuất báo cáo nhật ký: ' + err.message, 'error');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 13. Sự kiện Bộ lọc & Hành động
  // -------------------------------------------------------------------------
  if (btnSearch) {
    btnSearch.addEventListener('click', applyFilters);
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (startDate) startDate.value = '';
      if (endDate) endDate.value = '';
      if (actionFilter) actionFilter.value = '';
      if (statusFilter) statusFilter.value = '';
      if (targetFilter) targetFilter.value = '';
      if (userFilter) userFilter.value = '';
      if (tableSearch) tableSearch.value = '';
      if (globalSearch) globalSearch.value = '';
      applyFilters();
      showToast('Đã đặt lại bộ lọc về giá trị mặc định.', 'info');
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      loadLogsFromApi(true);
    });
  }

  // Tìm kiếm tức thời khi gõ phím
  if (tableSearch) {
    tableSearch.addEventListener('input', () => {
      applyFilters();
    });
  }

  if (globalSearch) {
    globalSearch.addEventListener('input', () => {
      if (tableSearch) tableSearch.value = globalSearch.value;
      applyFilters();
    });
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', () => {
      pageSize = Number(pageSizeSelect.value);
      currentPage = 1;
      renderTable();
    });
  }

  // Phím tắt Ctrl + K để focus ô tìm kiếm
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (tableSearch) {
        tableSearch.focus();
        tableSearch.select();
      }
    } else if (e.key === 'Escape') {
      if (detailDialog && detailDialog.open) {
        detailDialog.close();
      }
    }
  });

  // -------------------------------------------------------------------------
  // 14. Mobile Sidebar Navigation
  // -------------------------------------------------------------------------
  if (btnToggleMobileSidebar && sidebar && sidebarBackdrop) {
    btnToggleMobileSidebar.addEventListener('click', () => {
      sidebar.classList.add('open');
      sidebarBackdrop.classList.add('visible');
    });
  }

  if (btnCloseSidebar && sidebar && sidebarBackdrop) {
    btnCloseSidebar.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarBackdrop.classList.remove('visible');
    });
  }

  if (sidebarBackdrop && sidebar) {
    sidebarBackdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarBackdrop.classList.remove('visible');
    });
  }

  // -------------------------------------------------------------------------
  // 15. Nạp Dữ liệu Ban đầu
  // -------------------------------------------------------------------------
  loadLogsFromApi();
});
