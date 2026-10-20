/**
 * SmartLight EVNCPC - Login Script
 * Handles authentication interaction, validation, and password visibility
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');
  const btnTogglePassword = document.getElementById('btnTogglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const btnLogin = document.getElementById('btnLogin');
  const loginSpinner = document.getElementById('loginSpinner');
  const alertMessage = document.getElementById('alertMessage');
  const linkForgotPassword = document.getElementById('linkForgotPassword');
  const linkPolicy = document.getElementById('linkPolicy');

  // -------------------------------------------------------------------------
  // 1. Restore remembered username if available
  // -------------------------------------------------------------------------
  const savedUsername = localStorage.getItem('smartlight_remembered_user');
  if (savedUsername) {
    usernameInput.value = savedUsername;
    rememberMeCheckbox.checked = true;
    passwordInput.focus();
  } else {
    usernameInput.focus();
  }

  // -------------------------------------------------------------------------
  // 2. Toggle Password Visibility (Eye Icon)
  // -------------------------------------------------------------------------
  let isPasswordVisible = false;
  btnTogglePassword.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? 'text' : 'password';

    if (isPasswordVisible) {
      // Eye Slash Icon (hidden)
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      `;
    } else {
      // Normal Eye Icon (visible)
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `;
    }
  });

  // -------------------------------------------------------------------------
  // 3. Show Alert Message Helper
  // -------------------------------------------------------------------------
  function showAlert(message, type = 'error') {
    alertMessage.textContent = message;
    alertMessage.className = `alert-message ${type}`;
    alertMessage.style.display = 'block';
  }

  function hideAlert() {
    alertMessage.style.display = 'none';
    alertMessage.textContent = '';
  }

  // -------------------------------------------------------------------------
  // 4. Form Submit & Authentication Simulation
  // -------------------------------------------------------------------------
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username) {
      showAlert('Vui lòng nhập tên đăng nhập.', 'error');
      usernameInput.classList.add('is-invalid');
      usernameInput.focus();
      return;
    }

    if (!password) {
      showAlert('Vui lòng nhập mật khẩu.', 'error');
      passwordInput.classList.add('is-invalid');
      passwordInput.focus();
      return;
    }

    // Set UI to loading state
    btnLogin.disabled = true;
    loginSpinner.style.display = 'inline-block';
    const btnText = btnLogin.querySelector('.btn-text');
    btnText.textContent = 'Đang xử lý...';

    // Save or clear remembered username
    if (rememberMeCheckbox.checked) {
      localStorage.setItem('smartlight_remembered_user', username);
    } else {
      localStorage.removeItem('smartlight_remembered_user');
    }

    // Simulate login verification
    setTimeout(() => {
      // Store session data
      sessionStorage.setItem('smartlight_user_session', JSON.stringify({
        username: username,
        loginTime: new Date().toISOString(),
        role: 'Administrator'
      }));

      showAlert('Đăng nhập thành công! Đang chuyển hướng vào hệ thống...', 'success');
      btnText.textContent = 'Thành công';

      // Redirect to main dashboard
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    }, 900);
  });

  // Remove invalid state on typing
  usernameInput.addEventListener('input', () => {
    usernameInput.classList.remove('is-invalid');
    hideAlert();
  });

  passwordInput.addEventListener('input', () => {
    passwordInput.classList.remove('is-invalid');
    hideAlert();
  });

  // -------------------------------------------------------------------------
  // 5. Modals / Actions for Links
  // -------------------------------------------------------------------------
  linkForgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Khôi phục mật khẩu:\nVui lòng liên hệ Trung tâm Điều hành EVNCPC qua đầu số nội bộ hoặc gửi yêu cầu tới quantri@cpc.vn để được cấp lại mật khẩu.');
  });

  linkPolicy.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Chính sách & Bảo mật EVNCPC SmartLight:\n1. Tài khoản được phân quyền riêng biệt theo từng khu vực quản lý chiếu sáng.\n2. Mọi thao tác bật/tắt và điều chỉnh công suất đều được ghi log kiểm toán.\n3. Tuân thủ tiêu chuẩn an toàn thông tin ngành điện EVN.');
  });
});
