(() => {
  let session = null;
  try {
    const sessionData = sessionStorage.getItem('smartlight_user_session');
    session = sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Không thể đọc phiên đăng nhập.', error);
  }

  // Fallback to default user if no session exists (matching index, control, map, schedules)
  if (!session || typeof session !== 'object') {
    session = {
      username: 'Nguyễn Văn Minh',
      role: 'Administrator'
    };
  }

  const role = typeof session?.role === 'string' ? session.role.trim().toLocaleLowerCase('vi-VN') : '';
  const allowedRoles = new Map([
    ['admin', 'Quản trị hệ thống'],
    ['administrator', 'Quản trị hệ thống'],
    ['quản trị hệ thống', 'Quản trị hệ thống'],
    ['quan tri he thong', 'Quản trị hệ thống'],
    ['quản trị viên', 'Quản trị hệ thống'],
    ['quan tri vien', 'Quản trị hệ thống'],
    ['operator', 'Nhân viên vận hành'],
    ['nhân viên vận hành', 'Nhân viên vận hành'],
    ['nhan vien van hanh', 'Nhân viên vận hành']
  ]);
  const roleLabel = allowedRoles.get(role) || 'Quản trị hệ thống';

  document.documentElement.classList.add('report-authorized');
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('authorized');
    const name = typeof session.username === 'string' && session.username.trim() ? session.username.trim() : 'Nguyễn Văn Minh';
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    if (userNameEl && userNameEl.childNodes[0]) userNameEl.childNodes[0].textContent = name;
    if (userRoleEl) userRoleEl.textContent = roleLabel;
  });
})();
