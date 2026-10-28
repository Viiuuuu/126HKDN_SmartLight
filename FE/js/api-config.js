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

// Cấu hình URL mặc định theo profile ASP.NET Core (launchSettings.json)
const DEFAULT_API_URL = 'http://localhost:5203/api';

const API_CONFIG = {
  // Ưu tiên đọc từ localStorage nếu dev muốn override port local
  BASE_URL: (function () {
    const customUrl = localStorage.getItem('SMARTLIGHT_API_BASE_URL');
    if (customUrl && customUrl.trim() !== '') {
      return customUrl.trim().replace(/\/+$/, '');
    }
    return DEFAULT_API_URL;
  })(),

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
 */
function buildApiUrl(endpoint, params = null) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${API_CONFIG.BASE_URL}${cleanEndpoint}`);

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
 * Hàm gọi API nền tảng với Timeout & xử lý lỗi tập trung
 */
async function apiFetch(endpoint, options = {}) {
  const { params, timeout = API_CONFIG.TIMEOUT_MS, ...fetchOptions } = options;
  const fullUrl = buildApiUrl(endpoint, params);

  // Gắn header mặc định & auth
  fetchOptions.headers = {
    ...getAuthHeaders(),
    ...(fetchOptions.headers || {})
  };

  // Thiết lập cơ chế tự hủy (AbortSignal) khi quá hạn timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  fetchOptions.signal = controller.signal;

  try {
    const response = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeoutId);

    // Kiểm tra status HTTP
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

    // Nếu mã phản hồi là 204 No Content
    if (response.status === 204) {
      return null;
    }

    // Parse JSON
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`[API Timeout] Endpoint: ${fullUrl} vượt quá thời gian ${timeout}ms`);
      throw new Error(`Kết nối máy chủ quá thời gian quy định (${timeout / 1000}s). Vui lòng kiểm tra Backend.`);
    }
    console.error(`[API Error] ${fullUrl}:`, error.message);
    throw error;
  }
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

// Đưa ra phạm vi toàn cục window
window.api = api;
window.API_CONFIG = API_CONFIG;
