(() => {
  let session = null;
  try {
    const sessionData = sessionStorage.getItem('smartlight_user_session');
    session = sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Không thể đọc phiên đăng nhập.', error);
  }

  const role = typeof session?.role === 'string' ? session.role.trim().toLocaleLowerCase('vi-VN') : '';
  const roleLabels = new Map([
    ['operator', 'Nhân viên vận hành'],
    ['nhân viên vận hành', 'Nhân viên vận hành'],
    ['nhan vien van hanh', 'Nhân viên vận hành'],
    ['technician', 'Nhân viên kỹ thuật'],
    ['technical', 'Nhân viên kỹ thuật'],
    ['nhân viên kỹ thuật', 'Nhân viên kỹ thuật'],
    ['nhan vien ky thuat', 'Nhân viên kỹ thuật']
  ]);
  const roleLabel = roleLabels.get(role);

  if (!roleLabel || !session || typeof session !== 'object') {
    document.documentElement.classList.add('alert-unauthorized');
    window.location.replace('login.html');
    return;
  }

  document.documentElement.classList.add('alert-authorized');
  document.documentElement.dataset.alertRole = roleLabel;

  document.addEventListener('DOMContentLoaded', () => {
    const username = typeof session.username === 'string' && session.username.trim()
      ? session.username.trim()
      : roleLabel;
    const nameElement = document.getElementById('alertUserName');
    const roleElement = document.getElementById('alertUserRole');

    if (nameElement) nameElement.textContent = username;
    if (roleElement) roleElement.textContent = roleLabel;
  });
})();
