/**
 * ==============================================================================
 * SMARTLIGHT IOT SYSTEM - API BASE CONFIGURATION & CLIENT UTILITIES
 * ==============================================================================
 * Tệp nền tảng dùng chung cho tất cả thành viên trong nhóm tích hợp REST API.
 * 
 * HƯỚNG DẪN DÀNH CHO TẤT CẢ THÀNH VIÊN:
 * 1. Trong file HTML của mình, chèn thẻ script này TRƯỚC script logic của trang:
 *    <script src="js/api-config.js"></script>
 *    <script src="js/ten-file-cua-ban.js"></script>
 * 
 * 2. Cách gọi API trong Javascript:
 *    - GET có tham số:
 *        const data = await api.get('/TuChieuSang', { maKhuVuc: 'KV01' });
 *    - GET chi tiết:
 *        const detail = await api.get('/TuChieuSang/TC00001');
 *    - POST tạo mới / gửi lệnh:
 *        const res = await api.post('/LenhDieuKhien', { maTu: 'TC00001', loaiLenh: 1 });
 *    - PUT cập nhật:
 *        const res = await api.put('/LichVanHanh/1', { tenLich: 'Mới' });
 *    - DELETE xóa:
 *        await api.delete('/LichVanHanh/1');
 * 
 * 3. Nếu chạy BE ở port khác, bạn có thể gõ vào Console trình duyệt để đổi port:
 *    localStorage.setItem('SMARTLIGHT_API_BASE_URL', 'http://localhost:5203/api');
 * ==============================================================================
 */

// Cấu hình danh sách URL Backend (launchSettings.json)
// - Visual Studio mặc định chạy HTTPS: https://localhost:7274/api
// - dotnet run mặc định chạy HTTP: http://localhost:5203/api
const KNOWN_API_URLS = [
  'https://localhost:7274/api',
  'http://localhost:5203/api'
];

const DEFAULT_API_URL = (function() {
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

/**
 * Trích xuất token hoặc mã người dùng hiện tại từ sessionStorage
 */
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

/**
 * Chuẩn hóa endpoint và gắn query parameters nếu có
 * @param {string} endpoint - Ví dụ: '/TuChieuSang' hoặc 'TuChieuSang'
 * @param {object} params - Ví dụ: { maKhuVuc: 'KV01', limit: 10 }
 * @param {string} baseUrl - Base URL tùy chọn
 */
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
 * Hàm gọi API nền tảng với Timeout & tự động phát hiện cổng (HTTPS 7274 / HTTP 5203)
 */
async function apiFetch(endpoint, options = {}) {
  const { params, timeout = API_CONFIG.TIMEOUT_MS, ...fetchOptions } = options;

  // Gắn header mặc định & auth
  fetchOptions.headers = {
    ...getAuthHeaders(),
    ...(fetchOptions.headers || {})
  };

  // Tạo danh sách URL để thử (ưu tiên BASE_URL hiện tại, kế tiếp là các cổng còn lại)
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

      // Nếu gọi thành công qua cổng này, cập nhật lại BASE_URL đang hoạt động
      if (currentBase !== API_CONFIG.BASE_URL) {
        API_CONFIG.BASE_URL = currentBase;
      }

      // Kiểm tra status HTTP từ server trả về
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

      // Nếu lỗi là do Server trả về mã lỗi HTTP hợp lệ (ví dụ: 400, 401, 403, 429), không thử lại cổng khác
      if (error.status) {
        throw error;
      }

      // Nếu là lỗi Timeout hoặc không kết nối được (NetworkError), thử cổng tiếp theo
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

/**
 * Đối tượng `api` công khai hỗ trợ các phương thức GET, POST, PUT, DELETE ngắn gọn
 */
const api = {
  /**
   * Lấy danh sách hoặc chi tiết bản ghi
   * @param {string} endpoint 
   * @param {object} params (tùy chọn) query string
   */
  get(endpoint, params = null) {
    return apiFetch(endpoint, {
      method: 'GET',
      params
    });
  },

  /**
   * Tạo mới dữ liệu hoặc gửi lệnh
   * @param {string} endpoint 
   * @param {object} body 
   */
  post(endpoint, body = {}) {
    return apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  /**
   * Cập nhật dữ liệu
   * @param {string} endpoint 
   * @param {object} body 
   */
  put(endpoint, body = {}) {
    return apiFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  /**
   * Xóa bản ghi
   * @param {string} endpoint 
   */
  delete(endpoint) {
    return apiFetch(endpoint, {
      method: 'DELETE'
    });
  },

  /**
   * Lấy thông tin cấu hình hiện tại
   */
  getConfig() {
    return { ...API_CONFIG };
  },

  /**
   * Đổi URL backend nhanh trong lúc test
   * @param {string} newBaseUrl - Ví dụ 'http://localhost:5203/api'
   */
  setBaseUrl(newBaseUrl) {
    if (newBaseUrl) {
      API_CONFIG.BASE_URL = newBaseUrl.replace(/\/+$/, '');
      localStorage.setItem('SMARTLIGHT_API_BASE_URL', API_CONFIG.BASE_URL);
      console.log('[api-config] Đã cập nhật BASE_URL thành:', API_CONFIG.BASE_URL);
    }
  }
};

/**
 * Chuẩn hóa tên vai trò hiển thị trên giao diện theo danh mục SmartLight EVNCPC
 * @param {string} role 
 * @returns {string} Tên vai trò tiếng Việt chuẩn
 */
function formatRoleName(role) {
  if (!role || typeof role !== 'string') return 'Quản trị viên';
  const r = role.trim().toLowerCase();

  // Nhóm Nhân viên vận hành
  if (r.includes('vận hành') || r.includes('van hanh') || r.includes('vanhanh') || r === 'operator') {
    return 'Nhân viên vận hành';
  }

  // Nhóm Nhân viên kỹ thuật
  if (r.includes('kỹ thuật') || r.includes('ky thuat') || r.includes('kythuat') || r.includes('tech') || r === 'technician') {
    return 'Nhân viên kỹ thuật';
  }

  // Nhóm Quản trị viên
  if (r.includes('quản trị') || r.includes('quan tri') || r.includes('admin')) {
    return 'Quản trị viên';
  }

  return role;
}

/**
 * Tự động đồng bộ thông tin tài khoản và vai trò người dùng lên thanh Header
 * Hỗ trợ tất cả các trang: index.html, alerts.html, control.html, map.html, schedules.html, reports.html,...
 */
function syncHeaderUserInfo() {
  try {
    const sessionRaw = sessionStorage.getItem('smartlight_user_session');
    if (!sessionRaw) return;

    const user = JSON.parse(sessionRaw);
    if (!user || typeof user !== 'object') return;

    const rawRole = user.role || user.vaiTro || '';
    const displayRole = formatRoleName(rawRole);
    const displayName = user.fullName || user.hoTen || (user.username ? (user.username.charAt(0).toUpperCase() + user.username.slice(1)) : 'Người dùng');
    const displayEmail = user.email || (user.username ? `${user.username}@smartlight.evncpc.vn` : 'quantri@smartlight.evncpc.vn');

    // 1. Cập nhật tên người dùng trên Topbar/Header
    document.querySelectorAll('.user-name, #topbarUserName, #alertUserName, #userName').forEach(el => {
      // Nếu có thẻ con (ví dụ icon), chỉ thay thế text node đầu tiên hoặc cập nhật textContent
      if (el.children.length === 0) {
        el.textContent = displayName;
      } else if (el.childNodes && el.childNodes[0] && el.childNodes[0].nodeType === Node.TEXT_NODE) {
        el.childNodes[0].textContent = displayName;
      }
    });

    // 2. Cập nhật VAI TRÒ người dùng trên Topbar/Header
    document.querySelectorAll('.user-role, #topbarUserRole, #alertUserRole, #userRole').forEach(el => {
      el.textContent = displayRole;
      el.setAttribute('data-role', displayRole);
      // Gắn nhãn màu sắc trực quan theo từng vai trò
      if (displayRole === 'Nhân viên vận hành') {
        el.style.color = '#0284c7'; // Xanh dương vận hành
      } else if (displayRole === 'Nhân viên kỹ thuật') {
        el.style.color = '#f59e0b'; // Vàng cam kỹ thuật
      } else {
        el.style.color = '#64748b'; // Quản trị mặc định
      }
    });

    // 3. Cập nhật trong Popover Dropdown cá nhân
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
 * Thực hiện đăng xuất hệ thống an toàn (ATTT Cấp độ 3)
 * Gửi yêu cầu lên Backend để ghi nhận thời gian đăng xuất (thoiGianDangXuat) và thu hồi phiên làm việc
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

      // Gọi API đăng xuất để cập nhật thoiGianDangXuat và daThuHoi trong cơ sở dữ liệu
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
    window.location.href = 'login.html';
  }
}

/**
 * Tự động gắn sự kiện Đăng xuất cho tất cả các nút/liên kết đăng xuất trên giao diện
 */
function attachLogoutListeners() {
  document.querySelectorAll('#linkLogout, .logout-link, [data-action="logout"]').forEach(el => {
    el.removeEventListener('click', handleLogout);
    el.addEventListener('click', handleLogout);
  });
}

// Khởi chạy khi DOM tải xong
function initUserHeaderAndAuth() {
  syncHeaderUserInfo();
  attachLogoutListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUserHeaderAndAuth);
} else {
  initUserHeaderAndAuth();
}

// Đưa ra phạm vi toàn cục window
window.api = api;
window.API_CONFIG = API_CONFIG;
window.syncHeaderUserInfo = syncHeaderUserInfo;
window.formatRoleName = formatRoleName;
window.handleLogout = handleLogout;
window.attachLogoutListeners = attachLogoutListeners;
