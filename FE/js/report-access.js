(() => {
  let session = null;
  try {
    const sessionData = sessionStorage.getItem('smartlight_user_session');
    session = sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Không thể đọc phiên đăng nhập.', error);
  }

  const role = typeof session?.role === 'string' ? session.role.trim().toLocaleLowerCase('vi-VN') : '';
  const allowedRoles = new Map([
    ['admin', 'Quản trị hệ thống'],
    ['administrator', 'Quản trị hệ thống'],
    ['quản trị viên', 'Quản trị hệ thống'],
    ['quan tri vien', 'Quản trị hệ thống'],
    ['operator', 'Nhân viên vận hành'],
    ['nhân viên vận hành', 'Nhân viên vận hành'],
    ['nhan vien van hanh', 'Nhân viên vận hành']
  ]);
  const roleLabel = allowedRoles.get(role);

  if (!session || !roleLabel) {
    document.documentElement.classList.add('report-unauthorized');
    window.location.replace('login.html');
    return;
  }

  document.documentElement.classList.add('report-authorized');
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('authorized');
    const name = typeof session.username === 'string' && session.username.trim() ? session.username.trim() : roleLabel;
    document.getElementById('userName').childNodes[0].textContent = name;
    document.getElementById('userRole').textContent = roleLabel;
  });
})();
