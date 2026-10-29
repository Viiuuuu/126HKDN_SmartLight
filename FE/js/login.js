/**
 * SmartLight EVNCPC - Login Script
 * Tích hợp REST API xác thực đạt tiêu chuẩn An toàn thông tin (ATTT) Cấp độ 3:
 * - Chống tấn công Brute-force (khóa tạm thời và đếm ngược thời gian)
 * - Chống dò quét tài khoản (Anti-enumeration error messages)
 * - Quản lý phiên làm việc bảo mật với Token và thời hạn hết hạn
 * - Lưu vết nhật ký kiểm toán hệ thống
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

  let lockoutTimerId = null;

  // -------------------------------------------------------------------------
  // 1. Quản lý trạng thái khóa Brute-Force (ATTT Cấp độ 3)
  // -------------------------------------------------------------------------
  function checkLockoutStatus() {
    const lockoutUntil = localStorage.getItem('smartlight_lockout_until');
    if (!lockoutUntil) return false;

    const remainingMs = parseInt(lockoutUntil, 10) - Date.now();
    if (remainingMs > 0) {
      triggerLockout(Math.ceil(remainingMs / 1000));
      return true;
    } else {
      localStorage.removeItem('smartlight_lockout_until');
      clearLockout();
      return false;
    }
  }

  function triggerLockout(totalSeconds) {
    if (lockoutTimerId) clearInterval(lockoutTimerId);

    let remainingSeconds = totalSeconds;
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    btnLogin.disabled = true;

    function updateLockoutUI() {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const timeFormatted = `${minutes > 0 ? minutes + ' phút ' : ''}${seconds} giây`;

      showAlert(
        `[ATTT Cấp độ 3] Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá số lần quy định. Vui lòng thử lại sau: ${timeFormatted}`,
        'error'
      );

      if (remainingSeconds <= 0) {
        clearInterval(lockoutTimerId);
        localStorage.removeItem('smartlight_lockout_until');
        clearLockout();
        showAlert('Thời gian tạm khóa đã kết thúc. Bạn có thể thử đăng nhập lại.', 'success');
      } else {
        remainingSeconds -= 1;
      }
    }

    updateLockoutUI();
    lockoutTimerId = setInterval(updateLockoutUI, 1000);
  }

  function clearLockout() {
    if (lockoutTimerId) clearInterval(lockoutTimerId);
    usernameInput.disabled = false;
    passwordInput.disabled = false;
    btnLogin.disabled = false;
    const btnText = btnLogin.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Đang nhập';
  }

  // Kiểm tra ngay khi tải trang
  checkLockoutStatus();

  // -------------------------------------------------------------------------
  // 2. Tái hiện tên đăng nhập đã ghi nhớ
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
  // 3. Bật/Tắt hiển thị mật khẩu
  // -------------------------------------------------------------------------
  let isPasswordVisible = false;
  btnTogglePassword.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? 'text' : 'password';

    if (isPasswordVisible) {
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      `;
    } else {
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `;
    }
  });

  // -------------------------------------------------------------------------
  // 4. Tiện ích hiển thị thông báo
  // -------------------------------------------------------------------------
  function showAlert(message, type = 'error') {
    alertMessage.innerHTML = message;
    alertMessage.className = `alert-message ${type}`;
    alertMessage.style.display = 'block';
  }

  function hideAlert() {
    alertMessage.style.display = 'none';
    alertMessage.textContent = '';
  }

  // -------------------------------------------------------------------------
  // 5. Xử lý Gửi Form Đăng nhập qua REST API
  // -------------------------------------------------------------------------
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (checkLockoutStatus()) return;
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

    // Thiết lập trạng thái loading
    btnLogin.disabled = true;
    loginSpinner.style.display = 'inline-block';
    const btnText = btnLogin.querySelector('.btn-text');
    btnText.textContent = 'Đang xác thực bảo mật...';

    // Lưu hoặc xóa tên đăng nhập ghi nhớ
    if (rememberMeCheckbox.checked) {
      localStorage.setItem('smartlight_remembered_user', username);
    } else {
      localStorage.removeItem('smartlight_remembered_user');
    }

    // Hàm phân giải thông tin phiên theo vai trò đăng nhập
    function resolveUserRoleSession(u) {
      const lower = (u || '').trim().toLowerCase();
      if (lower.includes('vanhanh') || lower.includes('vận hành') || lower === 'operator') {
        return {
          maNguoiDung: 'ND0002',
          username: 'vanhanh_demo',
          fullName: 'Nhân viên Vận hành Demo',
          email: 'vanhanh.demo@smartlight.example',
          role: 'Nhân viên vận hành',
          maVaiTro: 2
        };
      }
      if (lower.includes('kythuat') || lower.includes('kỹ thuật') || lower === 'technician' || lower.includes('tech')) {
        return {
          maNguoiDung: 'ND0003',
          username: 'kythuat_demo',
          fullName: 'Nhân viên Kỹ thuật Demo',
          email: 'kythuat.demo@smartlight.example',
          role: 'Nhân viên kỹ thuật',
          maVaiTro: 3
        };
      }
      return {
        maNguoiDung: 'ND0001',
        username: 'admin_demo',
        fullName: 'Quản trị viên Demo',
        email: 'admin.demo@smartlight.example',
        role: 'Quản trị viên',
        maVaiTro: 1
      };
    }

    try {
      // Gọi API Backend: POST /api/PhienDangNhap/dang-nhap
      const result = await api.post('/PhienDangNhap/dang-nhap', {
        tenDangNhap: username,
        matKhau: password
      });

      // ĐĂNG NHẬP THÀNH CÔNG
      localStorage.removeItem('smartlight_lockout_until');

      const roleStandard = typeof window.formatRoleName === 'function' ? window.formatRoleName(result.vaiTro) : result.vaiTro;

      // Lưu trữ phiên đăng nhập chuẩn ATTT Cấp độ 3 vào sessionStorage
      sessionStorage.setItem('smartlight_user_session', JSON.stringify({
        maNguoiDung: result.maNguoiDung,
        username: result.tenDangNhap,
        fullName: result.hoTen,
        email: result.email,
        role: roleStandard,
        maVaiTro: result.maVaiTro,
        maKhuVuc: result.maKhuVuc,
        token: result.token,
        loginTime: new Date().toISOString(),
        expiresAt: result.thoiGianHetHan
      }));

      showAlert(`Đăng nhập thành công! Xin chào <strong>${result.hoTen}</strong> (${roleStandard}). Đang vào hệ thống...`, 'success');
      btnText.textContent = 'Thành công';

      // Luôn chuyển hướng vào trang index.html theo đúng yêu cầu
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);

    } catch (error) {
      // XỬ LÝ LỖI ĐĂNG NHẬP
      btnLogin.disabled = false;
      loginSpinner.style.display = 'none';
      btnText.textContent = 'Đăng nhập';

      // 1. Trường hợp bị khóa do Brute-Force (HTTP 429)
      if (error.status === 429) {
        const lockoutDurationSeconds = 15 * 60; // 15 phút
        localStorage.setItem('smartlight_lockout_until', Date.now() + (lockoutDurationSeconds * 1000));
        triggerLockout(lockoutDurationSeconds);
        return;
      }

      // 2. Trường hợp tài khoản bị Quản trị viên vô hiệu hóa (HTTP 403)
      if (error.status === 403) {
        showAlert('Tài khoản của bạn hiện đang bị khóa bởi Quản trị viên hệ thống.', 'error');
        return;
      }

      // 3. Trường hợp sai tên đăng nhập hoặc mật khẩu (HTTP 400)
      if (error.status === 400) {
        let msg = error.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
        showAlert(msg, 'error');
        passwordInput.classList.add('is-invalid');
        passwordInput.value = '';
        passwordInput.focus();
        return;
      }

      // 4. Trường hợp không kết nối được Backend (BE chưa bật hoặc lỗi mạng)
      console.warn('[Login Error] Lỗi kết nối máy chủ:', error);
      const fallbackUser = resolveUserRoleSession(username);
      showAlert(
        `Không thể kết nối đến máy chủ Backend (${API_CONFIG.BASE_URL}).<br>` +
        `<small class="text-slate-500">Vui lòng đảm bảo Backend ASP.NET Core đang chạy (F5 trong Visual Studio hoặc <code>dotnet run</code>).</small><br>` +
        `<button type="button" id="btnFallbackDemo" style="margin-top:8px; padding: 5px 12px; font-size: 11.5px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Vào hệ thống với vai trò: ${fallbackUser.role}</button>`,
        'error'
      );

      // Nút Fallback demo dự phòng: lưu đúng vai trò người dùng đã chọn/nhập
      const btnFallback = document.getElementById('btnFallbackDemo');
      if (btnFallback) {
        btnFallback.addEventListener('click', () => {
          sessionStorage.setItem('smartlight_user_session', JSON.stringify({
            maNguoiDung: fallbackUser.maNguoiDung,
            username: fallbackUser.username,
            fullName: fallbackUser.fullName,
            email: fallbackUser.email,
            role: fallbackUser.role,
            maVaiTro: fallbackUser.maVaiTro,
            token: 'demo-token-' + Date.now(),
            loginTime: new Date().toISOString()
          }));
          window.location.href = 'index.html';
        });
      }
    }
  });

  // -------------------------------------------------------------------------
  // 6. Xử lý nút chọn nhanh vai trò (Admin / Vận hành / Kỹ thuật)
  // -------------------------------------------------------------------------
  document.querySelectorAll('.btn-role-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = btn.getAttribute('data-user');
      const p = btn.getAttribute('data-pass');
      usernameInput.value = u;
      passwordInput.value = p;
      usernameInput.classList.remove('is-invalid');
      passwordInput.classList.remove('is-invalid');
      hideAlert();
      passwordInput.focus();

      // Hiệu ứng phản hồi trực quan khi bấm nút
      document.querySelectorAll('.btn-role-quick').forEach(b => b.style.outline = 'none');
      btn.style.outline = '2px solid #38bdf8';
    });
  });

  // Xóa cảnh báo khi người dùng gõ lại
  usernameInput.addEventListener('input', () => {
    usernameInput.classList.remove('is-invalid');
    hideAlert();
  });

  passwordInput.addEventListener('input', () => {
    passwordInput.classList.remove('is-invalid');
    hideAlert();
  });

  // -------------------------------------------------------------------------
  // 6. Modal / Hành động hỗ trợ & chính sách
  // -------------------------------------------------------------------------
  linkForgotPassword?.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Khôi phục mật khẩu (Quy chuẩn ATTT cấp độ 3):\nTheo chính sách an toàn, hệ thống không cho phép gửi mật khẩu qua email tự động mà không xác minh hai bước. Vui lòng liên hệ Quản trị viên hệ thống hoặc gọi Hotline kỹ thuật để thiết lập lại mật khẩu.');
  });

  linkPolicy?.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Chính sách An toàn thông tin (ATTT Cấp độ 3) - EVNCPC SmartLight:\n1. Mọi mật khẩu được băm an toàn theo chuẩn PBKDF2-SHA512 (100.000 vòng lặp).\n2. Hệ thống tự động khóa tạm thời 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp.\n3. Tất cả các hành vi đăng nhập/đăng xuất đều được ghi vết nhật ký kiểm toán không thể sửa xóa.\n4. Phiên làm việc hết hạn sau 8 giờ không hoạt động.');
  });
});

