(() => {
  let session = null;
  try {
    const sessionData = sessionStorage.getItem('smartlight_user_session');
    session = sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Không thể đọc phiên đăng nhập.', error);
  }

  // Graceful fallback to default system user if no session exists (matching index, control, map, schedules)
  if (!session || typeof session !== 'object') {
    session = {
      username: 'Nguyễn Văn Minh',
      role: 'Administrator'
    };
  }

  const role = typeof session?.role === 'string' ? session.role.trim().toLocaleLowerCase('vi-VN') : '';
  const roleLabels = new Map([
    ['admin', 'Quản trị hệ thống'],
    ['administrator', 'Quản trị hệ thống'],
    ['quản trị hệ thống', 'Quản trị hệ thống'],
    ['quan tri he thong', 'Quản trị hệ thống'],
    ['quản trị viên', 'Quản trị hệ thống'],
    ['quan tri vien', 'Quản trị hệ thống'],
    ['operator', 'Nhân viên vận hành'],
    ['nhân viên vận hành', 'Nhân viên vận hành'],
    ['nhan vien van hanh', 'Nhân viên vận hành'],
    ['technician', 'Nhân viên kỹ thuật'],
    ['technical', 'Nhân viên kỹ thuật'],
    ['nhân viên kỹ thuật', 'Nhân viên kỹ thuật'],
    ['nhan vien ky thuat', 'Nhân viên kỹ thuật']
  ]);
  const roleLabel = roleLabels.get(role) || 'Quản trị hệ thống';

  document.documentElement.classList.add('alert-authorized');
  document.documentElement.dataset.alertRole = roleLabel;

  document.addEventListener('DOMContentLoaded', () => {
    const username = typeof session.username === 'string' && session.username.trim()
      ? session.username.trim()
      : 'Nguyễn Văn Minh';
    const nameElement = document.getElementById('alertUserName');
    const roleElement = document.getElementById('alertUserRole');

    if (nameElement) nameElement.textContent = username;
    if (roleElement) roleElement.textContent = roleLabel;
  });
})();
