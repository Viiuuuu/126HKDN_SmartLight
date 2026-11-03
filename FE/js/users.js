/**
 * ============================================================================
 * SmartLight Municipal IoT - User Management (Quản lý người dùng) Logic
 * File: js/users.js
 * Synchronized with shared Sidebar/Topbar (style.css / app.js) & API Config
 * ============================================================================
 */

const DEFAULT_USERS_LIST = [
  {
    id: "ND0001",
    uid: "UID-2024-00109",
    username: "admin",
    fullName: "Nguyễn Văn Minh",
    initials: "VM",
    isAdminAvatar: true,
    avatarBg: "bg-primary-container text-white",
    role: "Quản trị viên",
    phone: "0901 234 567",
    email: "minh.nguyen@smartlight.vn",
    status: "Hoạt động",
    createdDate: "10/01/2024",
    createdDateTime: "10/01/2024 08:15",
    lastLoginDate: "18/12/2024",
    lastLoginTime: "14:20",
    duty: "Quản trị hệ thống SmartLight toàn thành phố, phụ trách quản lý người dùng, phân quyền các trạm chiếu sáng và cấu hình hạ tầng mạng IoT.",
    scopeZones: 14,
    totalZones: 14,
    scopeLabel: "Toàn quyền vận hành (Root)",
    selected: true
  },
  {
    id: "ND0002",
    uid: "UID-2024-00110",
    username: "thao.nguyen",
    fullName: "Nguyễn Thị Thảo",
    initials: "NT",
    isAdminAvatar: false,
    avatarBg: "bg-emerald-100 text-emerald-700",
    role: "Nhân viên vận hành",
    phone: "0902 345 678",
    email: "thao.nguyen@smartlight.vn",
    status: "Hoạt động",
    createdDate: "15/01/2024",
    createdDateTime: "15/01/2024 09:00",
    lastLoginDate: "24/10/2024",
    lastLoginTime: "18:30",
    duty: "Giám sát thông số telemetry thời gian thực, điều khiển đóng/cắt và dimming các tuyến đèn khu vực Quận Hải Châu và Quận Sơn Trà.",
    scopeZones: 10,
    totalZones: 14,
    scopeLabel: "Điều hành cụm Hải Châu & Sơn Trà",
    selected: false
  },
  {
    id: "ND0003",
    uid: "UID-2024-00111",
    username: "tuan.tran",
    fullName: "Trần Anh Tuấn",
    initials: "TA",
    isAdminAvatar: false,
    avatarBg: "bg-blue-100 text-blue-700",
    role: "Nhân viên kỹ thuật",
    phone: "0903 456 789",
    email: "tuan.tran@smartlight.vn",
    status: "Hoạt động",
    createdDate: "20/01/2024",
    createdDateTime: "20/01/2024 10:20",
    lastLoginDate: "24/10/2024",
    lastLoginTime: "17:15",
    duty: "Kiểm tra định kỳ tủ điều khiển chiếu sáng, đồng bộ thời gian thực RTC, bảo trì contactor và xử lý sự cố mất pha tại hiện trường.",
    scopeZones: 8,
    totalZones: 14,
    scopeLabel: "Bảo trì tủ điện & tuyến cáp ngầm",
    selected: false
  },
  {
    id: "ND0004",
    uid: "UID-2024-00112",
    username: "mai.le",
    fullName: "Lê Thị Mai",
    initials: "LM",
    isAdminAvatar: false,
    avatarBg: "bg-rose-100 text-rose-700",
    role: "Nhân viên vận hành",
    phone: "0904 567 890",
    email: "mai.le@smartlight.vn",
    status: "Tạm khóa",
    createdDate: "28/01/2024",
    createdDateTime: "28/01/2024 14:10",
    lastLoginDate: "12/10/2024",
    lastLoginTime: "09:45",
    duty: "Phụ trách lập lịch vận hành tự động theo mùa, theo dõi cảnh báo điện áp và tổng hợp báo cáo tiêu thụ điện năng Quận Thanh Khê.",
    scopeZones: 6,
    totalZones: 14,
    scopeLabel: "Vận hành chiếu sáng Thanh Khê",
    selected: false
  },
  {
    id: "ND0005",
    uid: "UID-2024-00113",
    username: "son.pham",
    fullName: "Phạm Văn Sơn",
    initials: "PS",
    isAdminAvatar: false,
    avatarBg: "bg-teal-100 text-teal-700",
    role: "Nhân viên kỹ thuật",
    phone: "0905 678 901",
    email: "son.pham@smartlight.vn",
    status: "Hoạt động",
    createdDate: "05/02/2024",
    createdDateTime: "05/02/2024 08:40",
    lastLoginDate: "24/10/2024",
    lastLoginTime: "16:05",
    duty: "Bảo trì hệ thống tủ chiếu sáng thông minh, kiểm tra kết nối cảm biến cửa tủ và node thu phát điểm đèn khu vực Ngũ Hành Sơn.",
    scopeZones: 9,
    totalZones: 14,
    scopeLabel: "Kỹ thuật hiện trường Ngũ Hành Sơn",
    selected: false
  },
  {
    id: "ND0006",
    uid: "UID-2024-00114",
    username: "huong.do",
    fullName: "Đỗ Thu Hương",
    initials: "DH",
    isAdminAvatar: false,
    avatarBg: "bg-indigo-100 text-indigo-700",
    role: "Nhân viên vận hành",
    phone: "0906 789 012",
    email: "huong.do@smartlight.vn",
    status: "Hoạt động",
    createdDate: "12/02/2024",
    createdDateTime: "12/02/2024 11:00",
    lastLoginDate: "24/10/2024",
    lastLoginTime: "19:10",
    duty: "Trực ca điều hành trung tâm, tiếp nhận và phân loại cảnh báo sự cố lưới điện chiếu sáng, điều phối lịch bật/tắt khẩn cấp.",
    scopeZones: 11,
    totalZones: 14,
    scopeLabel: "Giám sát cảnh báo & tiết kiệm điện",
    selected: false
  },
  {
    id: "ND0007",
    uid: "UID-2024-00115",
    username: "anh.nguyen",
    fullName: "Nguyễn Thành Anh",
    initials: "NA",
    isAdminAvatar: false,
    avatarBg: "bg-sky-100 text-sky-700",
    role: "Nhân viên kỹ thuật",
    phone: "0907 890 123",
    email: "anh.nguyen@smartlight.vn",
    status: "Tạm khóa",
    createdDate: "18/02/2024",
    createdDateTime: "18/02/2024 15:30",
    lastLoginDate: "05/10/2024",
    lastLoginTime: "11:20",
    duty: "Kiểm tra, thay thế bộ nguồn драйвер LED, đo kiểm dòng rò và bảo dưỡng định kỳ các tuyến đèn khu vực Cẩm Lệ - Liên Chiểu.",
    scopeZones: 5,
    totalZones: 14,
    scopeLabel: "Bảo dưỡng điểm đèn Cẩm Lệ & Liên Chiểu",
    selected: false
  }
];

function cloneUsers(arr) {
  return JSON.parse(JSON.stringify(arr));
}

document.addEventListener("DOMContentLoaded", () => {
  let usersList = loadSavedUsers();
  let activeUserId = usersList[0]?.id || "ND0001";
  let currentPage = 1;
  const pageSize = 7;

  // Table & Filter DOM Elements
  const usersTableBody = document.getElementById("usersTableBody");
  const usersEmptyState = document.getElementById("usersEmptyState");
  const userTableSearchInput = document.getElementById("userTableSearchInput");
  const filterRoleSelect = document.getElementById("filterRoleSelect");
  const filterStatusSelect = document.getElementById("filterStatusSelect");
  const showingRangeText = document.getElementById("showingRangeText");
  const totalUsersCountText = document.getElementById("totalUsersCountText");
  const usersPagination = document.getElementById("usersPagination");

  // Header Action Buttons
  const btnExportUsers = document.getElementById("btnExportUsers");
  const btnOpenAddUserModal = document.getElementById("btnOpenAddUserModal");
  const btnBulkLockUsers = document.getElementById("btnBulkLockUsers");
  const bulkLockBtnText = document.getElementById("bulkLockBtnText");

  // Right Slide-Over Drawer Elements
  const userDetailDrawer = document.getElementById("userDetailDrawer");
  const userDetailBackdrop = document.getElementById("userDetailBackdrop");
  const btnCloseUserDrawer = document.getElementById("btnCloseUserDrawer");
  const drawerAvatarBox = document.getElementById("drawerAvatarBox");
  const drawerOnlineDot = document.getElementById("drawerOnlineDot");
  const drawerFullName = document.getElementById("drawerFullName");
  const drawerRoleBadgeWrap = document.getElementById("drawerRoleBadgeWrap");
  const drawerUidText = document.getElementById("drawerUidText");
  const drawerUsername = document.getElementById("drawerUsername");
  const drawerPhone = document.getElementById("drawerPhone");
  const drawerEmail = document.getElementById("drawerEmail");
  const drawerCreatedAt = document.getElementById("drawerCreatedAt");
  const drawerLastLoginDate = document.getElementById("drawerLastLoginDate");
  const drawerLastLoginTime = document.getElementById("drawerLastLoginTime");
  const drawerDutyDesc = document.getElementById("drawerDutyDesc");
  const drawerScopeCount = document.getElementById("drawerScopeCount");
  const drawerScopeSub = document.getElementById("drawerScopeSub");
  const drawerScopeCircle = document.getElementById("drawerScopeCircle");
  const drawerScopePercent = document.getElementById("drawerScopePercent");
  const btnDrawerEditUser = document.getElementById("btnDrawerEditUser");
  const btnDrawerToggleLock = document.getElementById("btnDrawerToggleLock");
  const drawerLockIcon = document.getElementById("drawerLockIcon");
  const drawerLockText = document.getElementById("drawerLockText");

  // Add/Edit Modal Elements
  const userFormModal = document.getElementById("userFormModal");
  const userModalTitle = document.getElementById("userModalTitle");
  const userModalIcon = document.getElementById("userModalIcon");
  const btnCloseUserModal = document.getElementById("btnCloseUserModal");
  const btnCancelUserModal = document.getElementById("btnCancelUserModal");
  const userAccountForm = document.getElementById("userAccountForm");
  const formUserId = document.getElementById("formUserId");
  const formUsername = document.getElementById("formUsername");
  const formFullName = document.getElementById("formFullName");
  const formPhone = document.getElementById("formPhone");
  const formEmail = document.getElementById("formEmail");
  const formRole = document.getElementById("formRole");
  const formStatus = document.getElementById("formStatus");
  const formDuty = document.getElementById("formDuty");

  // Shared Topbar & Sidebar Elements
  const topSearchInput = document.getElementById("topSearchInput");
  const topbarLiveClock = document.getElementById("topbarLiveClock");
  const btnNotifications = document.getElementById("btnNotifications");
  const notificationDropdown = document.getElementById("notificationDropdown");
  const btnMarkAllRead = document.getElementById("btnMarkAllRead");
  const btnUserProfile = document.getElementById("btnUserProfile");
  const userDropdown = document.getElementById("userDropdown");
  const linkLogout = document.getElementById("linkLogout");
  const sidebar = document.getElementById("sidebar");
  const btnToggleMobileSidebar = document.getElementById("btnToggleMobileSidebar");
  const btnCloseSidebar = document.getElementById("btnCloseSidebar");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const toastContainer = document.getElementById("toastContainer");

  // ---------------------------------------------------------------------------
  // 1. State Persistence & Optional Backend API Sync
  // ---------------------------------------------------------------------------
  function loadSavedUsers() {
    try {
      const raw = localStorage.getItem("smartlight_users_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("[Users] Không thể đọc dữ liệu lưu trữ:", err);
    }
    return cloneUsers(DEFAULT_USERS_LIST);
  }

  function saveUsers() {
    try {
      localStorage.setItem("smartlight_users_v1", JSON.stringify(usersList));
    } catch (err) {
      console.warn("[Users] Không thể lưu dữ liệu:", err);
    }
  }

  async function trySyncUsersFromApi() {
    if (!window.api || typeof window.api.get !== "function") return;
    try {
      const data = await window.api.get("/NguoiDung");
      if (Array.isArray(data) && data.length > 0) {
        // Map Backend NguoiDung records if needed while preserving UI fields
        const mapped = data.map((item, idx) => {
          const fallback = DEFAULT_USERS_LIST[idx % DEFAULT_USERS_LIST.length];
          const roleMap = {
            1: "Quản trị viên",
            2: "Nhân viên vận hành",
            3: "Nhân viên kỹ thuật"
          };
          const roleName = roleMap[item.maVaiTro] || fallback.role;
          const fullName = item.hoTen || fallback.fullName;
          const words = fullName.trim().split(/\s+/);
          const initials =
            words.length >= 2
              ? (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase()
              : fullName.slice(0, 2).toUpperCase();

          const createdObj = item.ngayTao ? new Date(item.ngayTao) : null;
          const createdDate = createdObj && !isNaN(createdObj)
            ? createdObj.toLocaleDateString("vi-VN")
            : fallback.createdDate;
          const createdDateTime = createdObj && !isNaN(createdObj)
            ? `${createdObj.toLocaleDateString("vi-VN")} ${createdObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
            : fallback.createdDateTime;

          const loginObj = item.lanDangNhapCuoi ? new Date(item.lanDangNhapCuoi) : null;
          const lastLoginDate = loginObj && !isNaN(loginObj)
            ? loginObj.toLocaleDateString("vi-VN")
            : fallback.lastLoginDate;
          const lastLoginTime = loginObj && !isNaN(loginObj)
            ? loginObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
            : fallback.lastLoginTime;

          return {
            id: (item.maNguoiDung || fallback.id).trim(),
            uid: `UID-2024-${String(109 + idx).padStart(5, "0")}`,
            username: item.tenDangNhap || fallback.username,
            fullName,
            initials,
            isAdminAvatar: roleName === "Quản trị viên" && idx === 0,
            avatarBg: fallback.avatarBg,
            role: roleName,
            phone: formatPhoneDisplay(item.soDienThoai || fallback.phone),
            email: item.email || fallback.email,
            status: item.trangThaiTaiKhoan === 1 ? "Hoạt động" : "Tạm khóa",
            createdDate,
            createdDateTime,
            lastLoginDate,
            lastLoginTime,
            duty: fallback.duty,
            scopeZones: roleName === "Quản trị viên" ? 14 : fallback.scopeZones,
            totalZones: 14,
            scopeLabel: roleName === "Quản trị viên" ? "Toàn quyền vận hành (Root)" : fallback.scopeLabel,
            selected: idx === 0
          };
        });

        usersList = mapped;
        activeUserId = usersList[0]?.id || activeUserId;
        renderUsersTable();
      }
    } catch (_) {
      // Keep local mock data when Backend is offline
    }
  }

  function formatPhoneDisplay(phone) {
    const digits = String(phone).replace(/\D/g, "");
    if (digits.length === 10) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    return phone;
  }

  // ---------------------------------------------------------------------------
  // 2. Role & Status Badge Helpers (Matching Screenshots)
  // ---------------------------------------------------------------------------
  function renderRoleBadgeHtml(role) {
    if (role === "Quản trị viên") {
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200/70 text-[11px] font-bold">
          <span class="material-symbols-outlined text-[14px]">verified_user</span>
          <span>Quản trị viên</span>
        </span>
      `;
    }
    if (role === "Nhân viên vận hành") {
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold">
          <span class="material-symbols-outlined text-[14px]">settings</span>
          <span>Nhân viên vận hành</span>
        </span>
      `;
    }
    return `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed/70 text-primary border border-primary/20 text-[11px] font-bold">
        <span class="material-symbols-outlined text-[14px]">handyman</span>
        <span>Nhân viên kỹ thuật</span>
      </span>
    `;
  }

  function renderStatusBadgeHtml(status) {
    if (status === "Hoạt động") {
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/70 text-[11px] font-bold">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
          <span>Hoạt động</span>
        </span>
      `;
    }
    return `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[11px] font-bold">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Tạm khóa</span>
      </span>
    `;
  }

  // ---------------------------------------------------------------------------
  // 3. Filtering & Rendering Table
  // ---------------------------------------------------------------------------
  function getFilteredUsers() {
    const q1 = (userTableSearchInput?.value || "").trim().toLowerCase();
    const q2 = (topSearchInput?.value || "").trim().toLowerCase();
    const query = q1 || q2;
    const roleFilter = filterRoleSelect?.value || "all";
    const statusFilter = filterStatusSelect?.value || "all";

    return usersList.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      const hay = `${u.username} ${u.fullName} ${u.uid} ${u.phone} ${u.email} ${u.role}`.toLowerCase();
      const matchesQuery = !query || hay.includes(query);
      return matchesRole && matchesStatus && matchesQuery;
    });
  }

  function renderUsersTable() {
    if (!usersTableBody) return;
    const filtered = getFilteredUsers();

    if (filtered.length === 0) {
      usersTableBody.innerHTML = "";
      if (usersEmptyState) usersEmptyState.classList.remove("hidden");
      if (showingRangeText) showingRangeText.textContent = "0 - 0";
      if (totalUsersCountText) totalUsersCountText.textContent = "0";
      return;
    }

    if (usersEmptyState) usersEmptyState.classList.add("hidden");

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + pageSize);

    // Display total count (28 in default unfiltered view to match design spec, or actual filtered count)
    const isUnfiltered =
      !(userTableSearchInput?.value || "").trim() &&
      !(topSearchInput?.value || "").trim() &&
      (filterRoleSelect?.value || "all") === "all" &&
      (filterStatusSelect?.value || "all") === "all";

    if (showingRangeText) {
      showingRangeText.textContent = `${startIdx + 1} - ${startIdx + pageItems.length}`;
    }
    if (totalUsersCountText) {
      totalUsersCountText.textContent = isUnfiltered && usersList.length <= 7 ? "28" : String(filtered.length);
    }

    usersTableBody.innerHTML = pageItems
      .map((u, idx) => {
        const stt = startIdx + idx + 1;
        const isActiveRow = u.id === activeUserId;

        const avatarHtml = u.isAdminAvatar
          ? `<div class="w-9 h-9 rounded-full bg-primary-fixed/80 border border-primary/25 text-primary flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
               <span class="material-symbols-outlined text-[18px]">admin_panel_settings</span>
             </div>`
          : `<div class="w-9 h-9 rounded-full ${escapeHtml(u.avatarBg)} flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
               ${escapeHtml(u.initials)}
             </div>`;

        return `
          <tr class="user-table-row hover:bg-surface-container-low/80 ${isActiveRow ? "is-active" : ""}" data-user-id="${escapeHtml(u.id)}">
            <td class="py-3.5 px-4 text-center font-semibold text-outline">${stt}</td>
            <td class="py-3.5 px-4 font-mono font-bold text-on-surface">${escapeHtml(u.username)}</td>
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-3">
                ${avatarHtml}
                <div class="flex flex-col min-w-0">
                  <span class="font-bold text-on-surface leading-snug truncate">${escapeHtml(u.fullName)}</span>
                  <span class="font-mono text-[10.5px] text-outline mt-0.5">${escapeHtml(u.uid)}</span>
                </div>
              </div>
            </td>
            <td class="py-3.5 px-4">${renderRoleBadgeHtml(u.role)}</td>
            <td class="py-3.5 px-4 font-mono text-on-surface-variant font-medium">${escapeHtml(u.phone)}</td>
            <td class="py-3.5 px-4 text-on-surface-variant">${escapeHtml(u.email)}</td>
            <td class="py-3.5 px-4 text-center">${renderStatusBadgeHtml(u.status)}</td>
            <td class="py-3.5 px-4 text-center font-mono text-outline">${escapeHtml(u.createdDate)}</td>
            <td class="py-3.5 px-4 text-center" data-stop-drawer="true">
              <input
                type="checkbox"
                class="user-row-checkbox w-4 h-4 rounded border-outline-variant cursor-pointer"
                data-user-id="${escapeHtml(u.id)}"
                ${u.selected ? "checked" : ""}
                aria-label="Chọn ${escapeHtml(u.fullName)}"
              >
            </td>
            <td class="py-3.5 px-4 text-center">
              <button
                type="button"
                class="btn-view-user w-8 h-8 rounded-lg text-outline hover:text-primary hover:bg-primary-fixed/50 inline-flex items-center justify-center transition"
                data-user-id="${escapeHtml(u.id)}"
                title="Xem chi tiết người dùng"
              >
                <span class="material-symbols-outlined text-[18px]">visibility</span>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    updateBulkLockButtonLabel();
  }

  function updateBulkLockButtonLabel() {
    if (!bulkLockBtnText) return;
    const selectedUsers = usersList.filter((u) => u.selected);
    if (selectedUsers.length > 0) {
      bulkLockBtnText.textContent = `Khóa tài khoản (${selectedUsers.length})`;
    } else {
      bulkLockBtnText.textContent = "Khóa tài khoản";
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Right Slide-Over Drawer ("Chi tiết người dùng") Logic
  // ---------------------------------------------------------------------------
  function populateUserDrawer(user) {
    if (!user) return;

    if (drawerAvatarBox) {
      if (user.isAdminAvatar) {
        drawerAvatarBox.className =
          "w-20 h-20 rounded-full bg-white border-2 border-primary-fixed shadow-md flex flex-col items-center justify-center text-primary overflow-hidden";
        drawerAvatarBox.innerHTML = `
          <span class="material-symbols-outlined text-[34px]">manage_accounts</span>
        `;
      } else {
        drawerAvatarBox.className = `w-20 h-20 rounded-full ${user.avatarBg} border-2 border-white shadow-md flex items-center justify-center text-2xl font-extrabold overflow-hidden`;
        drawerAvatarBox.textContent = user.initials;
      }
    }

    if (drawerOnlineDot) {
      drawerOnlineDot.className =
        user.status === "Hoạt động"
          ? "absolute bottom-1 right-1 w-4 h-4 rounded-full bg-primary-container ring-2 ring-white"
          : "absolute bottom-1 right-1 w-4 h-4 rounded-full bg-amber-500 ring-2 ring-white";
    }

    if (drawerFullName) drawerFullName.textContent = user.fullName;
    if (drawerRoleBadgeWrap) drawerRoleBadgeWrap.innerHTML = renderRoleBadgeHtml(user.role);
    if (drawerUidText) drawerUidText.textContent = `ID: ${user.uid}`;
    if (drawerUsername) drawerUsername.textContent = user.username;
    if (drawerPhone) drawerPhone.textContent = user.phone;
    if (drawerEmail) drawerEmail.textContent = user.email;
    if (drawerCreatedAt) drawerCreatedAt.textContent = user.createdDateTime;
    if (drawerLastLoginDate) drawerLastLoginDate.textContent = user.lastLoginDate;
    if (drawerLastLoginTime) drawerLastLoginTime.textContent = user.lastLoginTime;
    if (drawerDutyDesc) drawerDutyDesc.textContent = user.duty;

    const zones = user.scopeZones || 14;
    const total = user.totalZones || 14;
    const pct = Math.round((zones / total) * 100);
    const circumference = 144.5;
    const offset = circumference - (pct / 100) * circumference;

    if (drawerScopeCount) drawerScopeCount.textContent = `${zones} / ${total} Phân khu`;
    if (drawerScopeSub) drawerScopeSub.textContent = user.scopeLabel || "Phân khu được giao";
    if (drawerScopePercent) drawerScopePercent.textContent = `${pct}%`;
    if (drawerScopeCircle) {
      drawerScopeCircle.style.strokeDashoffset = String(offset);
    }

    if (btnDrawerToggleLock && drawerLockIcon && drawerLockText) {
      if (user.status === "Hoạt động") {
        btnDrawerToggleLock.className =
          "w-full py-2.5 px-4 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-800 hover:bg-orange-100 text-xs font-bold flex items-center justify-center gap-2 transition-all";
        drawerLockIcon.textContent = "lock";
        drawerLockText.textContent = "Khóa tài khoản";
      } else {
        btnDrawerToggleLock.className =
          "w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-2 transition-all";
        drawerLockIcon.textContent = "lock_open";
        drawerLockText.textContent = "Mở khóa tài khoản";
      }
    }
  }

  function openUserDrawer(userId) {
    const user = usersList.find((u) => u.id === userId);
    if (!user) return;

    activeUserId = user.id;
    renderUsersTable();
    populateUserDrawer(user);

    if (userDetailBackdrop) {
      userDetailBackdrop.classList.remove("hidden");
    }
    if (userDetailDrawer) {
      userDetailDrawer.classList.add("is-open");
    }
  }

  function closeUserDrawer() {
    if (userDetailDrawer) {
      userDetailDrawer.classList.remove("is-open");
    }
    if (userDetailBackdrop) {
      userDetailBackdrop.classList.add("hidden");
    }
  }

  if (btnCloseUserDrawer) {
    btnCloseUserDrawer.addEventListener("click", closeUserDrawer);
  }

  if (userDetailBackdrop) {
    userDetailBackdrop.addEventListener("click", closeUserDrawer);
  }

  // Table Row Click -> Open Right Slide-Over Banner
  if (usersTableBody) {
    usersTableBody.addEventListener("click", (event) => {
      const checkboxCell = event.target.closest("[data-stop-drawer]");
      if (checkboxCell) return;

      const row = event.target.closest("tr[data-user-id]");
      if (!row) return;

      const userId = row.getAttribute("data-user-id");
      if (userId) {
        openUserDrawer(userId);
      }
    });

    usersTableBody.addEventListener("change", (event) => {
      const cb = event.target.closest("input.user-row-checkbox");
      if (!cb) return;
      const userId = cb.getAttribute("data-user-id");
      const user = usersList.find((u) => u.id === userId);
      if (user) {
        user.selected = cb.checked;
        saveUsers();
        updateBulkLockButtonLabel();
      }
    });
  }

  function isCurrentAdminSelf(user) {
    if (!user) return false;
    try {
      const raw = sessionStorage.getItem("smartlight_user_session");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.maNguoiDung && s.maNguoiDung.trim() === user.id) return true;
        if (s.username && s.username.toLowerCase() === user.username.toLowerCase()) return true;
      }
    } catch (_) {}
    return user.id === "ND0001" || user.username === "admin" || user.username === "admin_demo";
  }

  function mapRoleNameToId(roleName) {
    if (roleName === "Quản trị viên") return 1;
    if (roleName === "Nhân viên kỹ thuật") return 3;
    return 2;
  }

  // Drawer Action: Toggle Lock/Unlock Single User
  if (btnDrawerToggleLock) {
    btnDrawerToggleLock.addEventListener("click", async () => {
      const user = usersList.find((u) => u.id === activeUserId);
      if (!user) return;

      if (user.status === "Hoạt động" && isCurrentAdminSelf(user)) {
        showToast("Không được phép tự khóa tài khoản Quản trị viên đang đăng nhập!", "warning");
        return;
      }

      const nextStatus = user.status === "Hoạt động" ? "Tạm khóa" : "Hoạt động";
      const nextStatusCode = nextStatus === "Hoạt động" ? 1 : 2;

      if (window.api && typeof window.api.put === "function") {
        try {
          await window.api.put(`/NguoiDung/${encodeURIComponent(user.id)}/trang-thai`, {
            trangThaiTaiKhoan: nextStatusCode
          });
        } catch (err) {
          if (err && err.status === 400) {
            showToast(err.message || "Không thể thay đổi trạng thái tài khoản này.", "warning");
            return;
          }
        }
      }

      user.status = nextStatus;
      if (nextStatus === "Tạm khóa") {
        showToast(`Đã tạm khóa tài khoản "${user.username}" (${user.fullName}).`, "warning");
      } else {
        showToast(`Đã kích hoạt lại tài khoản "${user.username}" (${user.fullName}).`, "success");
      }

      saveUsers();
      renderUsersTable();
      populateUserDrawer(user);
    });
  }

  // Drawer Action: Edit User
  if (btnDrawerEditUser) {
    btnDrawerEditUser.addEventListener("click", () => {
      const user = usersList.find((u) => u.id === activeUserId);
      if (!user) return;
      openUserFormModal(user);
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Header Actions (Add User, Bulk Lock, Export CSV)
  // ---------------------------------------------------------------------------
  function openUserFormModal(editUser = null) {
    if (!userFormModal) return;

    if (editUser) {
      if (userModalTitle) userModalTitle.textContent = "Cập nhật thông tin người dùng";
      if (userModalIcon) userModalIcon.textContent = "edit_square";
      if (formUserId) formUserId.value = editUser.id;
      if (formUsername) formUsername.value = editUser.username;
      if (formFullName) formFullName.value = editUser.fullName;
      if (formPhone) formPhone.value = editUser.phone;
      if (formEmail) formEmail.value = editUser.email;
      if (formRole) formRole.value = editUser.role;
      if (formStatus) formStatus.value = editUser.status;
      if (formDuty) formDuty.value = editUser.duty;
    } else {
      if (userModalTitle) userModalTitle.textContent = "Thêm người dùng mới";
      if (userModalIcon) userModalIcon.textContent = "person_add";
      if (userAccountForm) userAccountForm.reset();
      if (formUserId) formUserId.value = "";
    }

    userFormModal.classList.remove("hidden");
    userFormModal.classList.add("flex");
    if (formUsername) formUsername.focus();
  }

  function closeUserFormModal() {
    if (!userFormModal) return;
    userFormModal.classList.add("hidden");
    userFormModal.classList.remove("flex");
  }

  if (btnOpenAddUserModal) {
    btnOpenAddUserModal.addEventListener("click", () => openUserFormModal(null));
  }
  if (btnCloseUserModal) btnCloseUserModal.addEventListener("click", closeUserFormModal);
  if (btnCancelUserModal) btnCancelUserModal.addEventListener("click", closeUserFormModal);

  if (userFormModal) {
    userFormModal.addEventListener("click", (event) => {
      if (event.target === userFormModal) closeUserFormModal();
    });
  }

  if (userAccountForm) {
    userAccountForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const idVal = (formUserId?.value || "").trim();
      const usernameVal = (formUsername?.value || "").trim();
      const fullNameVal = (formFullName?.value || "").trim();
      const phoneVal = formatPhoneDisplay((formPhone?.value || "").trim());
      const emailVal = (formEmail?.value || "").trim();
      const roleVal = formRole?.value || "Nhân viên vận hành";
      const statusVal = formStatus?.value || "Hoạt động";
      const dutyVal =
        (formDuty?.value || "").trim() ||
        "Thực hiện nhiệm vụ giám sát, vận hành và bảo trì hệ thống chiếu sáng công cộng theo phân công.";

      if (!usernameVal || !fullNameVal || !emailVal) return;

      const words = fullNameVal.split(/\s+/).filter(Boolean);
      const initials =
        words.length >= 2
          ? (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase()
          : fullNameVal.slice(0, 2).toUpperCase();

      const maVaiTro = mapRoleNameToId(roleVal);
      const trangThaiTaiKhoan = statusVal === "Hoạt động" ? 1 : 2;

      if (idVal) {
        const existing = usersList.find((u) => u.id === idVal);
        if (existing) {
          if (isCurrentAdminSelf(existing)) {
            if (roleVal !== "Quản trị viên") {
              showToast("Quản trị viên không được tự hạ vai trò của chính mình!", "warning");
              return;
            }
            if (statusVal !== "Hoạt động") {
              showToast("Quản trị viên không được tự khóa tài khoản của chính mình!", "warning");
              return;
            }
          }

          if (window.api && typeof window.api.put === "function") {
            try {
              await window.api.put(`/NguoiDung/${encodeURIComponent(idVal)}`, {
                tenDangNhap: usernameVal,
                hoTen: fullNameVal,
                soDienThoai: phoneVal.replace(/\D/g, ""),
                email: emailVal,
                maVaiTro,
                tenVaiTro: roleVal,
                trangThaiTaiKhoan
              });
            } catch (err) {
              if (err && (err.status === 400 || err.status === 409)) {
                showToast(err.message || "Dữ liệu cập nhật không hợp lệ.", "warning");
                return;
              }
            }
          }

          existing.username = usernameVal;
          existing.fullName = fullNameVal;
          existing.initials = initials;
          existing.phone = phoneVal;
          existing.email = emailVal;
          existing.role = roleVal;
          existing.status = statusVal;
          existing.duty = dutyVal;
          existing.scopeZones = roleVal === "Quản trị viên" ? 14 : existing.scopeZones;
          existing.scopeLabel =
            roleVal === "Quản trị viên" ? "Toàn quyền vận hành (Root)" : existing.scopeLabel;

          saveUsers();
          renderUsersTable();
          populateUserDrawer(existing);
          closeUserFormModal();
          showToast(`Đã cập nhật thông tin người dùng "${fullNameVal}".`, "success");
          return;
        }
      }

      let createdBackendId = null;
      if (window.api && typeof window.api.post === "function") {
        try {
          const createdRes = await window.api.post("/NguoiDung", {
            tenDangNhap: usernameVal,
            hoTen: fullNameVal,
            soDienThoai: phoneVal.replace(/\D/g, "") || "0901000999",
            email: emailVal,
            maVaiTro,
            tenVaiTro: roleVal,
            trangThaiTaiKhoan
          });
          if (createdRes && createdRes.maNguoiDung) {
            createdBackendId = createdRes.maNguoiDung.trim();
          }
        } catch (err) {
          if (err && (err.status === 400 || err.status === 409)) {
            showToast(err.message || "Không thể thêm người dùng mới.", "warning");
            return;
          }
        }
      }

      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();
      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");

      const avatarPalettes = [
        "bg-emerald-100 text-emerald-700",
        "bg-blue-100 text-blue-700",
        "bg-indigo-100 text-indigo-700",
        "bg-teal-100 text-teal-700"
      ];

      const newUser = {
        id: createdBackendId || `ND${String(usersList.length + 1).padStart(4, "0")}`,
        uid: `UID-2024-${String(109 + usersList.length).padStart(5, "0")}`,
        username: usernameVal,
        fullName: fullNameVal,
        initials,
        isAdminAvatar: false,
        avatarBg: avatarPalettes[usersList.length % avatarPalettes.length],
        role: roleVal,
        phone: phoneVal,
        email: emailVal,
        status: statusVal,
        createdDate: `${dd}/${mm}/${yyyy}`,
        createdDateTime: `${dd}/${mm}/${yyyy} ${hh}:${min}`,
        lastLoginDate: `${dd}/${mm}/${yyyy}`,
        lastLoginTime: `${hh}:${min}`,
        duty: dutyVal,
        scopeZones: roleVal === "Quản trị viên" ? 14 : 8,
        totalZones: 14,
        scopeLabel:
          roleVal === "Quản trị viên"
            ? "Toàn quyền vận hành (Root)"
            : "Phân khu chiếu sáng được giao",
        selected: false
      };

      usersList.unshift(newUser);
      activeUserId = newUser.id;
      saveUsers();
      renderUsersTable();
      closeUserFormModal();
      openUserDrawer(newUser.id);
      showToast(`Đã thêm người dùng "${fullNameVal}" (${usernameVal}).`, "success");
    });
  }

  if (btnBulkLockUsers) {
    btnBulkLockUsers.addEventListener("click", async () => {
      const selected = usersList.filter((u) => u.selected);
      if (selected.length === 0) {
        showToast("Vui lòng tích chọn ít nhất 1 tài khoản trong cột CHỌN để khóa.", "warning");
        return;
      }

      const lockable = selected.filter((u) => !isCurrentAdminSelf(u));
      if (lockable.length === 0) {
        showToast("Không được phép tự khóa tài khoản Quản trị viên đang đăng nhập!", "warning");
        return;
      }

      for (const u of lockable) {
        u.status = "Tạm khóa";
        u.selected = false;
        if (window.api && typeof window.api.put === "function") {
          await window.api.put(`/NguoiDung/${encodeURIComponent(u.id)}/trang-thai`, {
            trangThaiTaiKhoan: 2
          }).catch(() => null);
        }
      }

      selected.forEach((u) => {
        u.selected = false;
      });

      saveUsers();
      renderUsersTable();
      const currentActive = usersList.find((u) => u.id === activeUserId);
      if (currentActive) populateUserDrawer(currentActive);

      showToast(`Đã khóa ${lockable.length} tài khoản được chọn.`, "warning");
    });
  }

  if (btnExportUsers) {
    btnExportUsers.addEventListener("click", () => {
      const filtered = getFilteredUsers();
      const headers = ["STT", "Mã UID", "Tên đăng nhập", "Họ tên", "Vai trò", "Số điện thoại", "Email", "Trạng thái", "Ngày tạo"];
      const rows = filtered.map((u, i) => [
        i + 1,
        u.uid,
        u.username,
        `"${u.fullName}"`,
        `"${u.role}"`,
        `"${u.phone}"`,
        u.email,
        `"${u.status}"`,
        u.createdDate
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Danh_sach_nguoi_dung_SmartLight_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showToast(`Đã xuất danh sách ${filtered.length} tài khoản người dùng ra file CSV.`, "success");
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Search, Filter & Pagination Listeners
  // ---------------------------------------------------------------------------
  if (userTableSearchInput) {
    userTableSearchInput.addEventListener("input", () => {
      currentPage = 1;
      renderUsersTable();
    });
  }

  if (topSearchInput) {
    topSearchInput.addEventListener("input", () => {
      currentPage = 1;
      renderUsersTable();
    });
  }

  if (filterRoleSelect) {
    filterRoleSelect.addEventListener("change", () => {
      currentPage = 1;
      renderUsersTable();
    });
  }

  if (filterStatusSelect) {
    filterStatusSelect.addEventListener("change", () => {
      currentPage = 1;
      renderUsersTable();
    });
  }

  if (usersPagination) {
    usersPagination.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-page]");
      if (!btn) return;
      const val = btn.getAttribute("data-page");

      if (val === "prev") {
        currentPage = Math.max(1, currentPage - 1);
      } else if (val === "next") {
        currentPage = Math.min(3, currentPage + 1);
      } else {
        currentPage = parseInt(val, 10) || 1;
      }

      usersPagination.querySelectorAll(".page-btn").forEach((b) => {
        const isCurrent = b.getAttribute("data-page") === String(currentPage);
        b.className = isCurrent
          ? "page-btn w-8 h-8 rounded-lg bg-primary-container text-white font-bold text-xs shadow-xs flex items-center justify-center transition"
          : "page-btn w-8 h-8 rounded-lg border border-surface-container-high bg-white text-on-surface-variant hover:bg-surface-container-low font-semibold text-xs flex items-center justify-center transition";
      });

      if (showingRangeText) {
        const start = (currentPage - 1) * 7 + 1;
        const end = Math.min(28, currentPage * 7);
        showingRangeText.textContent = `${start} - ${end}`;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Shared Topbar & Sidebar Interactions
  // ---------------------------------------------------------------------------
  function closeAllPopovers() {
    if (notificationDropdown) notificationDropdown.classList.remove("active");
    if (userDropdown) userDropdown.classList.remove("active");
  }

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (topSearchInput) {
        topSearchInput.focus();
        topSearchInput.select();
      }
    } else if (event.key === "Escape") {
      closeAllPopovers();
      closeUserFormModal();
      closeUserDrawer();
    }
  });

  if (btnNotifications) {
    btnNotifications.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = notificationDropdown && notificationDropdown.classList.contains("active");
      closeAllPopovers();
      if (notificationDropdown && !isOpen) notificationDropdown.classList.add("active");
    });
  }

  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener("click", (e) => {
      e.stopPropagation();
      const dot = document.querySelector(".notification-badge-dot");
      if (dot) dot.style.display = "none";
      document.querySelectorAll(".notification-item.unread").forEach((i) => i.classList.remove("unread"));
      const headerTitle = document.querySelector(".dropdown-header strong");
      if (headerTitle) headerTitle.textContent = "Thông báo mới (0)";
      showToast("Đã đánh dấu đọc tất cả thông báo", "success");
    });
  }

  if (btnUserProfile) {
    btnUserProfile.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = userDropdown && userDropdown.classList.contains("active");
      closeAllPopovers();
      if (userDropdown && !isOpen) userDropdown.classList.add("active");
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".notification-wrapper") && !e.target.closest(".user-profile-wrapper")) {
      closeAllPopovers();
    }
  });

  if (linkLogout) {
    linkLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      if (typeof window.handleLogout === "function") {
        await window.handleLogout(e);
      } else {
        sessionStorage.removeItem("smartlight_user_session");
        window.location.href = "login.html";
      }
    });
  }

  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add("open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("active");
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove("open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
  }

  if (btnToggleMobileSidebar) btnToggleMobileSidebar.addEventListener("click", openMobileSidebar);
  if (btnCloseSidebar) btnCloseSidebar.addEventListener("click", closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  // ---------------------------------------------------------------------------
  // 8. Live Clock & Toast Notification Helper
  // ---------------------------------------------------------------------------
  function startLiveClock() {
    if (!topbarLiveClock) return;
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    function tick() {
      const now = new Date();
      const dayName = days[now.getDay()];
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();
      topbarLiveClock.textContent = `${dayName}, ${dd}/${mm}/${yyyy}`;
    }
    tick();
    setInterval(tick, 1000);
  }

  function showToast(message, type = "success") {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const iconSvg =
      type === "success"
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `
      ${iconSvg}
      <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3200);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[ch])
    );
  }

  // Initialize UI
  renderUsersTable();
  populateUserDrawer(usersList[0]);
  startLiveClock();
  trySyncUsersFromApi();
});

