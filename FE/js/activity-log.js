document.addEventListener('DOMContentLoaded', () => {
  const sessionRaw = sessionStorage.getItem('smartlight_user_session');
  let session;
  try {
    session = sessionRaw ? JSON.parse(sessionRaw) : null;
  } catch (error) {
    console.error('Không thể đọc phiên đăng nhập.', error);
  }

  const operatorRoles = ['operator', 'nhân viên vận hành', 'nhan vien van hanh'];
  const role = typeof session?.role === 'string' ? session.role.trim().toLocaleLowerCase('vi-VN') : '';
  if (!session || !operatorRoles.includes(role)) {
    window.location.replace('login.html');
    return;
  }
  document.body.classList.add('authorized');

  const username = typeof session.username === 'string' && session.username.trim()
    ? session.username.trim()
    : 'Nhân viên vận hành';
  document.getElementById('userName').childNodes[0].textContent = username;
  document.getElementById('userRole').textContent = 'Nhân viên vận hành';

  const initialActivities = [
    { date: '24/10/2024', time: '19:32:15', action: 'Điều khiển', description: 'Tắt tuyến chiếu sáng', target: 'Tuyến TL-001', result: 'Thành công', note: '-' },
    { date: '24/10/2024', time: '18:45:03', action: 'Điều khiển', description: 'Điều chỉnh độ sáng 70%', target: 'Tuyến TL-003', result: 'Thành công', note: '-' },
    { date: '24/10/2024', time: '17:20:11', action: 'Xem', description: 'Xem bản đồ tuyến', target: 'Bản đồ hệ thống', result: 'Thành công', note: '-' },
    { date: '24/10/2024', time: '16:50:37', action: 'Quản lý', description: 'Cập nhật lịch vận hành', target: 'Tuyến TL-002', result: 'Thành công', note: 'Sửa lịch 18:00 - 23:00' },
    { date: '24/10/2024', time: '15:12:05', action: 'Điều khiển', description: 'Bật tuyến chiếu sáng', target: 'Tuyến TL-010', result: 'Thành công', note: '-' },
    { date: '24/10/2024', time: '14:33:22', action: 'Cảnh báo', description: 'Xử lý cảnh báo sự cố', target: 'Tủ CS-03', result: 'Thành công', note: 'Sự cố đã được xử lý' },
    { date: '24/10/2024', time: '13:14:17', action: 'Quản lý', description: 'Thêm điểm đèn mới', target: 'Điểm đèn DL-025', result: 'Thành công', note: '-' },
    { date: '24/10/2024', time: '11:05:40', action: 'Xem', description: 'Xem lịch sử vận hành', target: 'Tuyến TL-006', result: 'Thành công', note: '-' },
    { date: '24/10/2024', time: '10:22:18', action: 'Đăng nhập', description: 'Đăng nhập hệ thống', target: 'Hệ thống', result: 'Thành công', note: '-' },
    { date: '24/10/2024', time: '09:17:56', action: 'Quản lý', description: 'Chỉnh sửa thông tin tủ', target: 'Tủ CS-01', result: 'Thất bại', note: 'Lỗi kết nối thiết bị' },
    { date: '24/10/2024', time: '08:50:33', action: 'Xem', description: 'Xem nhật ký hoạt động cá nhân', target: 'Hệ thống', result: 'Thành công', note: '-' }
  ];
  const actions = ['Điều khiển', 'Xem', 'Quản lý', 'Cảnh báo', 'Đăng nhập'];
  const generatedActivities = Array.from({ length: 37 }, (_, index) => {
    const template = initialActivities[index % initialActivities.length];
    const day = String(23 - Math.floor(index / initialActivities.length)).padStart(2, '0');
    const result = index === 15 ? 'Thất bại' : 'Thành công';
    return {
      ...template,
      date: `${day}/10/2024`,
      time: template.time,
      action: actions[index % actions.length],
      result,
      description: index % 4 === 0 ? 'Xem trạng thái thiết bị' : template.description
    };
  });
  const activities = [...initialActivities, ...generatedActivities].map((activity, index) => ({
    ...activity,
    id: index + 1,
    actor: username
  }));

  const actionStyles = {
    'Điều khiển': ['action-control', 'tune'],
    'Xem': ['action-view', 'visibility'],
    'Quản lý': ['action-manage', 'settings'],
    'Cảnh báo': ['action-alert', 'warning'],
    'Đăng nhập': ['action-auth', 'login']
  };
  const pageSizeSelect = document.getElementById('pageSize');
  const tableBody = document.getElementById('activityRows');
  const emptyState = document.getElementById('emptyState');
  const pagination = document.getElementById('pagination');
  const detailDialog = document.getElementById('detailDialog');
  const dateFormatter = new Intl.DateTimeFormat('vi-VN');
  let currentPage = 1;
  let filteredActivities = activities;

  const clock = document.getElementById('liveClockDisplay');
  const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const pad = (value) => String(value).padStart(2, '0');
  function updateClock() {
    const now = new Date();
    if (clock) clock.textContent = `${weekdays[now.getDay()]}, ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  }
  updateClock();
  window.setInterval(updateClock, 1000);

  function parseDateTime(activity) {
    const [day, month, year] = activity.date.split('/').map(Number);
    const [hour, minute, second] = activity.time.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second || 0);
  }

  function matchesFilters(activity) {
    const action = document.getElementById('actionFilter').value;
    const target = document.getElementById('targetFilter').value;
    const query = document.getElementById('tableSearch').value.trim().toLocaleLowerCase('vi-VN');
    const startValue = document.getElementById('startDate').value;
    const endValue = document.getElementById('endDate').value;
    const occurredAt = parseDateTime(activity);

    if (action && activity.action !== action) return false;
    if (target && !activity.target.toLocaleLowerCase('vi-VN').includes(target.toLocaleLowerCase('vi-VN'))) return false;
    if (query && ![activity.action, activity.description, activity.target, activity.result, activity.note].join(' ').toLocaleLowerCase('vi-VN').includes(query)) return false;
    if (startValue && occurredAt < new Date(startValue)) return false;
    if (endValue && occurredAt > new Date(endValue)) return false;
    return true;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function renderRows() {
    const size = Number(pageSizeSelect.value);
    const start = (currentPage - 1) * size;
    const pageRows = filteredActivities.slice(start, start + size);
    tableBody.innerHTML = pageRows.map((activity, index) => {
      const [actionClass, icon] = actionStyles[activity.action];
      const date = parseDateTime(activity);
      const dateText = Number.isNaN(date.getTime()) ? activity.date : dateFormatter.format(date);
      const resultClass = activity.result === 'Thành công' ? 'result-success' : 'result-failed';
      return `<tr>
        <td>${start + index + 1}</td>
        <td><span class="table-time">${escapeHtml(dateText)}</span><span class="table-time-sub">${escapeHtml(activity.time)}</span></td>
        <td><span class="action-badge ${actionClass}"><span class="material-symbols-outlined">${icon}</span>${escapeHtml(activity.action)}</span></td>
        <td>${escapeHtml(activity.description)}</td>
        <td>${escapeHtml(activity.target)}</td>
        <td><span class="result-badge ${resultClass}">${escapeHtml(activity.result)}</span></td>
        <td class="notes-cell">${escapeHtml(activity.note)}</td>
        <td><button class="view-detail" type="button" data-activity-id="${activity.id}"><span class="material-symbols-outlined">visibility</span> Xem chi tiết</button></td>
      </tr>`;
    }).join('');

    emptyState.hidden = filteredActivities.length > 0;
    document.querySelector('.table-scroll table').hidden = filteredActivities.length === 0;
    const from = filteredActivities.length ? start + 1 : 0;
    const to = Math.min(start + size, filteredActivities.length);
    document.getElementById('resultSummary').textContent = `Hiển thị ${from} - ${to} trong tổng số ${filteredActivities.length} bản ghi`;
    renderPagination();
    renderSummary();
  }

  function renderSummary() {
    document.getElementById('totalCount').textContent = filteredActivities.length;
    document.getElementById('successCount').textContent = filteredActivities.filter((item) => item.result === 'Thành công').length;
    document.getElementById('failureCount').textContent = filteredActivities.filter((item) => item.result === 'Thất bại').length;
    document.getElementById('targetCount').textContent = new Set(filteredActivities.map((item) => item.target)).size;
  }

  function renderPagination() {
    const size = Number(pageSizeSelect.value);
    const pageCount = Math.max(1, Math.ceil(filteredActivities.length / size));
    currentPage = Math.min(currentPage, pageCount);
    const button = (label, page, options = {}) => `<button type="button" data-page="${page}" class="${options.active ? 'active' : ''}" ${options.disabled ? 'disabled' : ''} aria-label="${options.label || `Trang ${page}`}">${label}</button>`;
    let markup = button('<span class="material-symbols-outlined">chevron_left</span>', currentPage - 1, { disabled: currentPage === 1, label: 'Trang trước' });
    for (let page = 1; page <= pageCount; page += 1) {
      markup += button(page, page, { active: page === currentPage });
    }
    markup += button('<span class="material-symbols-outlined">chevron_right</span>', currentPage + 1, { disabled: currentPage === pageCount, label: 'Trang sau' });
    pagination.innerHTML = markup;
  }

  function applyFilters() {
    const startValue = document.getElementById('startDate').value;
    const endValue = document.getElementById('endDate').value;
    if (startValue && endValue && new Date(startValue) > new Date(endValue)) {
      showToast('Ngày bắt đầu phải trước ngày kết thúc.');
      return;
    }
    filteredActivities = activities.filter(matchesFilters);
    currentPage = 1;
    renderRows();
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.getElementById('toastContainer').appendChild(toast);
    window.setTimeout(() => toast.remove(), 3000);
  }

  function showDetails(activityId) {
    const activity = activities.find((item) => item.id === Number(activityId));
    if (!activity) return;
    document.getElementById('dialogTitle').textContent = activity.description;
    const details = [
      ['Người thực hiện', username],
      ['Thời gian', `${activity.date} ${activity.time}`],
      ['Loại thao tác', activity.action],
      ['Đối tượng', activity.target],
      ['Kết quả', activity.result],
      ['Ghi chú', activity.note]
    ];
    const list = document.getElementById('dialogDetails');
    list.replaceChildren(...details.map(([label, value]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value;
      row.append(term, description);
      return row;
    }));
    detailDialog.showModal();
  }

  function exportCsv() {
    if (!filteredActivities.length) {
      showToast('Không có dữ liệu phù hợp để xuất báo cáo.');
      return;
    }
    const fields = ['STT', 'Thời gian', 'Người thực hiện', 'Loại thao tác', 'Mô tả chi tiết', 'Đối tượng', 'Kết quả', 'Ghi chú'];
    const values = filteredActivities.map((activity, index) => [
      index + 1,
      `${activity.date} ${activity.time}`,
      username,
      activity.action,
      activity.description,
      activity.target,
      activity.result,
      activity.note
    ]);
    const csvCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = `\uFEFF${[fields, ...values].map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nhat-ky-hoat-dong-ca-nhan.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  document.getElementById('btnSearch').addEventListener('click', applyFilters);
  document.getElementById('tableSearch').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applyFilters();
  });
  document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('actionFilter').value = '';
    document.getElementById('targetFilter').value = '';
    document.getElementById('tableSearch').value = '';
    document.getElementById('globalSearch').value = '';
    filteredActivities = activities;
    currentPage = 1;
    renderRows();
  });
  document.getElementById('pageSize').addEventListener('change', () => {
    currentPage = 1;
    renderRows();
  });
  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    currentPage = Number(button.dataset.page);
    renderRows();
  });
  tableBody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-activity-id]');
    if (button) showDetails(button.dataset.activityId);
  });
  document.getElementById('btnExport').addEventListener('click', exportCsv);
  document.getElementById('btnCloseDialog').addEventListener('click', () => detailDialog.close());
  detailDialog.addEventListener('click', (event) => {
    if (event.target === detailDialog) detailDialog.close();
  });

  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
  }
  document.getElementById('btnToggleMobileSidebar').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('visible', sidebar.classList.contains('open'));
  });
  document.getElementById('btnCloseSidebar').addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);
  document.getElementById('globalSearch').addEventListener('input', (event) => {
    document.getElementById('tableSearch').value = event.target.value;
    applyFilters();
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      document.getElementById('globalSearch').focus();
    }
  });

  renderRows();
});
