/**
 * ============================================================================
 * SmartLight Municipal IoT - Role-Based Access Control (RBAC) Logic
 * File: js/roles.js
 * Synchronized with shared Sidebar/Topbar (style.css / app.js) & API Config
 * ============================================================================
 */

// Default RBAC Data Model
const TOTAL_PERMISSION_SLOTS = 24;

const DEFAULT_ROLES_STATE = {
  operator: {
    id: "operator",
    maVaiTro: 2,
    name: "Nhân viên vận hành",
    levelLabel: "Cấp tác nghiệp",
    inactiveTag: "Vận hành",
    shortDesc: "Giám sát telemetry, điều khiển lộ đèn, lập lịch và cảnh báo",
    description:
      "Nhân viên vận hành chịu trách nhiệm giám sát telemetry thời gian thực, điều khiển các lộ đèn theo kịch bản, kích hoạt chế độ khẩn cấp và theo dõi chỉ số năng lượng tiêu thụ.",
    accountCount: 16,
    permissions: {
      "leaf-1-1": { view: true, update: true, highlight: false },
      "leaf-1-2": { view: true, update: true, highlight: false },
      "leaf-1-3": { view: true, update: true, highlight: false },
      "leaf-1-4": { view: true, update: true, highlight: false },
      "leaf-1-5": { view: true, update: true, highlight: false },
      "leaf-1-6": { view: true, update: true, highlight: true },
      "leaf-1-7": { view: false, update: false, highlight: false },
      "leaf-1-8": { view: false, update: false, highlight: false },
      "leaf-1-9": { view: false, update: false, highlight: false },
      "leaf-1-10": { view: false, update: false, highlight: false },
      "leaf-2-1": { view: true, update: true, highlight: false },
      "leaf-2-2": { view: false, update: false, highlight: false },
      "leaf-2-3": { view: true, update: true, highlight: false },
      "leaf-2-4": { view: true, update: true, highlight: false },
      "leaf-2-5": { view: true, update: true, highlight: false },
      "leaf-3-1-1": { view: true, update: true, highlight: false },
      "leaf-3-1-2": { view: true, update: true, highlight: false },
      "leaf-3-1-3": { view: true, update: true, highlight: false },
      "leaf-3-1-4": { view: true, update: true, highlight: true },
      "leaf-3-2-1": { view: true, update: true, highlight: true },
      "leaf-3-2-2": { view: true, update: true, highlight: true },
      "leaf-3-2-3": { view: false, update: false, highlight: false }
    },
    personnel: [
      {
        id: "user-op-1",
        initials: "TM",
        name: "Trần Tuấn Minh",
        email: "minh.tt@smartlight.vn",
        status: "Đang trực",
        online: true,
        avatarClass: "bg-primary-container text-white"
      },
      {
        id: "user-op-2",
        initials: "LH",
        name: "Lê Hoàng Hải",
        email: "hai.lh@smartlight.vn",
        status: "Đang trực",
        online: true,
        avatarClass: "bg-primary-fixed text-primary"
      },
      {
        id: "user-op-3",
        initials: "VD",
        name: "Vũ Mạnh Dũng",
        email: "dung.vm@smartlight.vn",
        status: "Sẵn sàng",
        online: false,
        avatarClass: "bg-surface-container text-on-surface-variant"
      },
      {
        id: "user-op-4",
        initials: "TH",
        name: "Đỗ Thu Hương",
        email: "huong.dt@smartlight.vn",
        status: "Đang trực",
        online: true,
        avatarClass: "bg-secondary-container text-on-secondary-container"
      }
    ]
  },
  technician: {
    id: "technician",
    maVaiTro: 3,
    name: "Nhân viên kỹ thuật",
    levelLabel: "Hiện trường & Bảo trì",
    inactiveTag: "Hiện trường",
    shortDesc: "Bảo dưỡng phần cứng, đồng bộ thời gian, cấu hình tủ điện",
    description:
      "Nhân viên kỹ thuật phụ trách kiểm tra, bảo trì tủ chiếu sáng tại hiện trường, đồng bộ thời gian thực RTC, cấu hình thông số tủ điện, đóng/ngắt rơ-le kiểm thử và xử lý sự cố phần cứng.",
    accountCount: 28,
    permissions: {
      "leaf-1-1": { view: true, update: false, highlight: false },
      "leaf-1-2": { view: true, update: false, highlight: false },
      "leaf-1-3": { view: false, update: false, highlight: false },
      "leaf-1-4": { view: false, update: false, highlight: false },
      "leaf-1-5": { view: false, update: false, highlight: false },
      "leaf-1-6": { view: true, update: true, highlight: true },
      "leaf-1-7": { view: true, update: true, highlight: false },
      "leaf-1-8": { view: true, update: true, highlight: false },
      "leaf-1-9": { view: true, update: true, highlight: false },
      "leaf-1-10": { view: true, update: true, highlight: false },
      "leaf-2-1": { view: false, update: false, highlight: false },
      "leaf-2-2": { view: false, update: false, highlight: false },
      "leaf-2-3": { view: true, update: false, highlight: false },
      "leaf-2-4": { view: true, update: false, highlight: false },
      "leaf-2-5": { view: true, update: false, highlight: false },
      "leaf-3-1-1": { view: false, update: false, highlight: false },
      "leaf-3-1-2": { view: false, update: false, highlight: false },
      "leaf-3-1-3": { view: false, update: false, highlight: false },
      "leaf-3-1-4": { view: false, update: false, highlight: false },
      "leaf-3-2-1": { view: false, update: false, highlight: false },
      "leaf-3-2-2": { view: false, update: false, highlight: false },
      "leaf-3-2-3": { view: false, update: false, highlight: false }
    },
    personnel: [
      {
        id: "user-tech-1",
        initials: "PQ",
        name: "Phạm Quốc Khánh",
        email: "khanh.pq@smartlight.vn",
        status: "Đang trực",
        online: true,
        avatarClass: "bg-primary-container text-white"
      },
      {
        id: "user-tech-2",
        initials: "NT",
        name: "Nguyễn Thành Nam",
        email: "nam.nt@smartlight.vn",
        status: "Hiện trường",
        online: true,
        avatarClass: "bg-primary-fixed text-primary"
      },
      {
        id: "user-tech-3",
        initials: "HV",
        name: "Hoàng Văn Tuyến",
        email: "tuyen.hv@smartlight.vn",
        status: "Sẵn sàng",
        online: false,
        avatarClass: "bg-surface-container text-on-surface-variant"
      },
      {
        id: "user-tech-4",
        initials: "BL",
        name: "Bùi Đức Long",
        email: "long.bd@smartlight.vn",
        status: "Đang trực",
        online: true,
        avatarClass: "bg-secondary-container text-on-secondary-container"
      }
    ]
  }
};

function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

document.addEventListener("DOMContentLoaded", () => {
  // Load saved state or clone defaults
  let rolesState = loadSavedRolesState();
  let activeRoleKey = "operator";

  // RBAC DOM Elements
  const tabOperator = document.getElementById("roleTabOperator");
  const tabTechnician = document.getElementById("roleTabTechnician");
  const treeRoleBadge = document.getElementById("treeRoleBadge");
  const detailRoleBadge = document.getElementById("detailRoleBadge");
  const detailRoleLevel = document.getElementById("detailRoleLevel");
  const detailRoleDesc = document.getElementById("detailRoleDesc");
  const statGranted = document.getElementById("statGranted");
  const statRevoked = document.getElementById("statRevoked");
  const statTotal = document.getElementById("statTotal");
  const personnelCountBadge = document.getElementById("personnelCountBadge");
  const personnelListEl = document.getElementById("personnelList");

  // Action Buttons
  const btnSelectAll = document.getElementById("btnSelectAll");
  const btnViewOnly = document.getElementById("btnViewOnly");
  const btnRestoreDefault = document.getElementById("btnRestoreDefault");
  const btnResetChanges = document.getElementById("btnResetChanges");
  const btnSaveChanges = document.getElementById("btnSaveChanges");
  const btnAddPersonnel = document.getElementById("btnAddPersonnel");

  // Modal Elements
  const addPersonnelModal = document.getElementById("addPersonnelModal");
  const btnClosePersonnelModal = document.getElementById("btnClosePersonnelModal");
  const btnCancelPersonnelModal = document.getElementById("btnCancelPersonnelModal");
  const formAddPersonnel = document.getElementById("formAddPersonnel");
  const inputStaffName = document.getElementById("inputStaffName");
  const inputStaffEmail = document.getElementById("inputStaffEmail");
  const inputStaffStatus = document.getElementById("inputStaffStatus");
  const modalRoleNameLabel = document.getElementById("modalRoleNameLabel");

  // Shared Topbar & Sidebar Elements (matching index.html & app.js)
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
  // 1. State Persistence & Optional Backend Sync
  // ---------------------------------------------------------------------------
  function loadSavedRolesState() {
    try {
      const raw = localStorage.getItem("smartlight_rbac_roles_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.operator && parsed.technician) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("[RBAC] Không thể đọc trạng thái lưu trữ:", err);
    }
    return cloneDeep(DEFAULT_ROLES_STATE);
  }

  function saveRolesState() {
    try {
      localStorage.setItem("smartlight_rbac_roles_v1", JSON.stringify(rolesState));
    } catch (err) {
      console.warn("[RBAC] Không thể lưu trạng thái:", err);
    }
  }

  async function trySyncRolesFromApi() {
    if (!window.api || typeof window.api.get !== "function") return;
    try {
      const [vaiTroList, nguoiDungList] = await Promise.all([
        window.api.get("/VaiTro").catch(() => null),
        window.api.get("/NguoiDung").catch(() => null)
      ]);

      if (Array.isArray(vaiTroList)) {
        vaiTroList.forEach((vt) => {
          const ten = (vt.tenVaiTro || "").toLowerCase();
          if (ten.includes("vận hành") || ten.includes("van hanh")) {
            rolesState.operator.maVaiTro = vt.maVaiTro || rolesState.operator.maVaiTro;
            if (vt.moTa) rolesState.operator.description = vt.moTa;
          } else if (ten.includes("kỹ thuật") || ten.includes("ky thuat")) {
            rolesState.technician.maVaiTro = vt.maVaiTro || rolesState.technician.maVaiTro;
            if (vt.moTa) rolesState.technician.description = vt.moTa;
          }
        });
      }

      if (Array.isArray(nguoiDungList) && nguoiDungList.length > 0) {
        // Optional enrichment if BE has users assigned to roles
        refreshAllUI();
      }
    } catch (_) {
      // Keep local/default state when Backend is offline
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Calculations & Tree Sync
  // ---------------------------------------------------------------------------
  function calculateRoleStats(roleKey) {
    const perms = rolesState[roleKey].permissions;
    const leafKeys = Object.keys(perms);
    let uncheckedCount = 0;

    leafKeys.forEach((key) => {
      const item = perms[key];
      if (!item.view && !item.update) {
        uncheckedCount++;
      }
    });

    const allUnchecked = uncheckedCount === leafKeys.length;
    const granted = allUnchecked ? 0 : Math.max(0, TOTAL_PERMISSION_SLOTS - uncheckedCount);
    const revoked = TOTAL_PERMISSION_SLOTS - granted;

    return {
      granted,
      revoked,
      total: TOTAL_PERMISSION_SLOTS
    };
  }

  function renderRoleTabs() {
    const opStats = calculateRoleStats("operator");
    const techStats = calculateRoleStats("technician");

    const opPermCountEl = document.getElementById("opPermCountText");
    const opUserCountEl = document.getElementById("opUserCountText");
    const techPermCountEl = document.getElementById("techPermCountText");
    const techUserCountEl = document.getElementById("techUserCountText");

    if (opPermCountEl) opPermCountEl.textContent = `${opStats.granted}/${opStats.total} Quyền kích hoạt`;
    if (opUserCountEl) opUserCountEl.textContent = `${rolesState.operator.accountCount} Tài khoản`;
    if (techPermCountEl) techPermCountEl.textContent = `${techStats.granted}/${techStats.total} Quyền kích hoạt`;
    if (techUserCountEl) techUserCountEl.textContent = `${rolesState.technician.accountCount} Tài khoản`;

    updateTabCardVisual(tabOperator, activeRoleKey === "operator", rolesState.operator);
    updateTabCardVisual(tabTechnician, activeRoleKey === "technician", rolesState.technician);
  }

  function updateTabCardVisual(cardEl, isActive, roleData) {
    if (!cardEl) return;
    const iconBox = cardEl.querySelector("[data-role-icon]");
    const badgeEl = cardEl.querySelector("[data-role-badge]");
    const permTextEl = cardEl.querySelector("[data-role-perm-wrapper]");
    const checkCircle = cardEl.querySelector("[data-role-check]");

    if (isActive) {
      cardEl.className =
        "role-tab-card cursor-pointer relative overflow-hidden bg-primary-fixed/40 border-2 border-primary-container rounded-2xl p-5 shadow-sm transition-all flex items-start justify-between";
      if (iconBox) {
        iconBox.className =
          "w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-md shadow-primary-container/25 shrink-0";
      }
      if (badgeEl) {
        badgeEl.className =
          "px-2.5 py-0.5 rounded-full bg-primary-container text-white text-[11px] font-bold tracking-wide";
        badgeEl.textContent = "Đang cấu hình";
      }
      if (permTextEl) {
        permTextEl.className = "text-primary flex items-center gap-1.5";
      }
      if (checkCircle) {
        checkCircle.className =
          "w-6 h-6 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0";
      }
    } else {
      cardEl.className =
        "role-tab-card cursor-pointer relative overflow-hidden bg-surface-container-lowest border border-surface-container-high hover:border-primary/40 hover:bg-surface-container-low rounded-2xl p-5 shadow-xs transition-all flex items-start justify-between";
      if (iconBox) {
        iconBox.className =
          "w-12 h-12 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0";
      }
      if (badgeEl) {
        badgeEl.className =
          "px-2.5 py-0.5 rounded-full bg-surface-container text-outline text-[11px] font-semibold";
        badgeEl.textContent = roleData.inactiveTag;
      }
      if (permTextEl) {
        permTextEl.className = "text-outline flex items-center gap-1.5";
      }
      if (checkCircle) {
        checkCircle.className =
          "w-6 h-6 rounded-full bg-surface-container text-transparent flex items-center justify-center shrink-0";
      }
    }
  }

  function renderPermissionTree() {
    const currentRole = rolesState[activeRoleKey];
    const perms = currentRole.permissions;

    if (treeRoleBadge) treeRoleBadge.textContent = currentRole.name;

    const leafRows = document.querySelectorAll("tr[data-leaf-id]");
    leafRows.forEach((row) => {
      const leafId = row.getAttribute("data-leaf-id");
      const permState = perms[leafId] || { view: false, update: false };
      const viewCb = row.querySelector('input[data-col="view"]');
      const updateCb = row.querySelector('input[data-col="update"]');
      const iconEl = row.querySelector(".leaf-icon");
      const labelEl = row.querySelector(".leaf-label");

      if (viewCb) viewCb.checked = !!permState.view;
      if (updateCb) updateCb.checked = !!permState.update;

      const isEnabled = permState.view || permState.update;
      const isHighlight = row.getAttribute("data-highlight") === "true";
      const isPrimaryIcon = row.getAttribute("data-primary-icon") === "true";

      if (isEnabled) {
        if (isHighlight) {
          if (iconEl) iconEl.className = "leaf-icon material-symbols-outlined text-[16px] text-primary";
          if (labelEl) labelEl.className = "leaf-label text-primary font-bold text-xs";
        } else {
          if (iconEl) {
            iconEl.className = isPrimaryIcon
              ? "leaf-icon material-symbols-outlined text-[16px] text-primary"
              : "leaf-icon material-symbols-outlined text-[16px] text-outline";
          }
          if (labelEl) labelEl.className = "leaf-label text-on-surface text-xs font-medium";
        }
      } else {
        if (iconEl) iconEl.className = "leaf-icon material-symbols-outlined text-[16px] text-outline";
        if (labelEl) labelEl.className = "leaf-label text-outline text-xs";
      }
    });

    syncParentCheckboxes();
  }

  function syncParentCheckboxes() {
    ["view", "update"].forEach((col) => {
      // 1. Subgroups
      document.querySelectorAll("tr[data-subgroup-id]").forEach((subRow) => {
        const subgroupId = subRow.getAttribute("data-subgroup-id");
        const childCheckboxes = Array.from(
          document.querySelectorAll(`tr[data-parent-subgroup="${subgroupId}"] input[data-col="${col}"]`)
        );
        const subCb = subRow.querySelector(`input[data-col="${col}"]`);
        if (subCb && childCheckboxes.length > 0) {
          const checkedCount = childCheckboxes.filter((cb) => cb.checked).length;
          subCb.checked = checkedCount > 0;
          subCb.indeterminate = checkedCount > 0 && checkedCount < childCheckboxes.length;
        }
      });

      // 2. Top-level Groups
      document.querySelectorAll("tr[data-group-id]").forEach((groupRow) => {
        const groupId = groupRow.getAttribute("data-group-id");
        const childCheckboxes = Array.from(
          document.querySelectorAll(`tr[data-parent-group="${groupId}"][data-leaf-id] input[data-col="${col}"]`)
        );
        const groupCb = groupRow.querySelector(`input[data-col="${col}"]`);
        if (groupCb && childCheckboxes.length > 0) {
          const checkedCount = childCheckboxes.filter((cb) => cb.checked).length;
          groupCb.checked = checkedCount > 0;
          groupCb.indeterminate = checkedCount > 0 && checkedCount < childCheckboxes.length;
        }
      });
    });
  }

  function renderRightPanel() {
    const currentRole = rolesState[activeRoleKey];
    const stats = calculateRoleStats(activeRoleKey);

    if (detailRoleBadge) detailRoleBadge.textContent = currentRole.name;
    if (detailRoleLevel) detailRoleLevel.textContent = currentRole.levelLabel;
    if (detailRoleDesc) detailRoleDesc.textContent = currentRole.description;

    if (statGranted) statGranted.textContent = stats.granted;
    if (statRevoked) statRevoked.textContent = stats.revoked;
    if (statTotal) statTotal.textContent = stats.total;
    if (personnelCountBadge) personnelCountBadge.textContent = currentRole.accountCount;

    renderPersonnelList(currentRole.personnel);
  }

  function renderPersonnelList(personnel) {
    if (!personnelListEl) return;

    if (!personnel || personnel.length === 0) {
      personnelListEl.innerHTML = `
        <div class="p-4 rounded-xl bg-surface-container-low text-center text-xs text-outline">
          Chưa có nhân sự nào được gán trong danh sách hiển thị nhanh.
        </div>
      `;
      return;
    }

    personnelListEl.innerHTML = personnel
      .map((user) => {
        const dotClass = user.online ? "bg-emerald-500" : "bg-outline-variant";
        const statusBadgeClass = user.online
          ? "bg-emerald-50 text-emerald-600 font-bold"
          : "bg-surface-container text-outline font-semibold";

        return `
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group" data-user-id="${escapeHtml(user.id)}">
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative shrink-0">
                <div class="w-9 h-9 rounded-full ${escapeHtml(user.avatarClass)} flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs">
                  ${escapeHtml(user.initials)}
                </div>
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${dotClass} ring-2 ring-white"></span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-on-surface truncate leading-tight">${escapeHtml(user.name)}</span>
                  <span class="px-1.5 py-0.2 rounded ${statusBadgeClass} text-[10px] leading-tight">${escapeHtml(user.status)}</span>
                </div>
                <span class="text-[11px] text-outline truncate block mt-0.5">${escapeHtml(user.email)}</span>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0 ml-2">
              <button class="btn-swap-role w-7 h-7 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-all opacity-80 hover:opacity-100" title="Đổi vai trò" type="button" data-user-id="${escapeHtml(user.id)}">
                <span class="material-symbols-outlined text-[16px]">swap_horiz</span>
              </button>
              <button class="btn-remove-user w-7 h-7 rounded-lg text-outline hover:text-rose-500 hover:bg-surface-container-high flex items-center justify-center transition-all opacity-80 hover:opacity-100" title="Gỡ khỏi vai trò" type="button" data-user-id="${escapeHtml(user.id)}">
                <span class="material-symbols-outlined text-[16px]">remove_circle_outline</span>
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function refreshAllUI() {
    renderRoleTabs();
    renderPermissionTree();
    renderRightPanel();
  }

  // ---------------------------------------------------------------------------
  // 3. Event Listeners - Role Tabs & Permission Tree
  // ---------------------------------------------------------------------------
  if (tabOperator) {
    tabOperator.addEventListener("click", () => {
      if (activeRoleKey !== "operator") {
        activeRoleKey = "operator";
        refreshAllUI();
      }
    });
  }

  if (tabTechnician) {
    tabTechnician.addEventListener("click", () => {
      if (activeRoleKey !== "technician") {
        activeRoleKey = "technician";
        refreshAllUI();
      }
    });
  }

  const permTableBody = document.getElementById("permissionTableBody");
  if (permTableBody) {
    permTableBody.addEventListener("change", (event) => {
      const target = event.target;
      if (!target || target.tagName !== "INPUT" || target.type !== "checkbox") return;

      const col = target.getAttribute("data-col");
      const row = target.closest("tr");
      if (!row || !col) return;

      const currentPerms = rolesState[activeRoleKey].permissions;

      // Case 1: Group header checkbox
      if (row.hasAttribute("data-group-id")) {
        const groupId = row.getAttribute("data-group-id");
        const isChecked = target.checked;
        document.querySelectorAll(`tr[data-parent-group="${groupId}"][data-leaf-id]`).forEach((leafRow) => {
          const leafId = leafRow.getAttribute("data-leaf-id");
          if (currentPerms[leafId]) {
            currentPerms[leafId][col] = isChecked;
            if (col === "update" && isChecked) currentPerms[leafId].view = true;
            if (col === "view" && !isChecked) currentPerms[leafId].update = false;
          }
        });
      }
      // Case 2: Subgroup header checkbox
      else if (row.hasAttribute("data-subgroup-id")) {
        const subgroupId = row.getAttribute("data-subgroup-id");
        const isChecked = target.checked;
        document.querySelectorAll(`tr[data-parent-subgroup="${subgroupId}"][data-leaf-id]`).forEach((leafRow) => {
          const leafId = leafRow.getAttribute("data-leaf-id");
          if (currentPerms[leafId]) {
            currentPerms[leafId][col] = isChecked;
            if (col === "update" && isChecked) currentPerms[leafId].view = true;
            if (col === "view" && !isChecked) currentPerms[leafId].update = false;
          }
        });
      }
      // Case 3: Individual leaf row checkbox
      else if (row.hasAttribute("data-leaf-id")) {
        const leafId = row.getAttribute("data-leaf-id");
        const isChecked = target.checked;
        if (currentPerms[leafId]) {
          currentPerms[leafId][col] = isChecked;
          if (col === "update" && isChecked) {
            currentPerms[leafId].view = true;
          } else if (col === "view" && !isChecked) {
            currentPerms[leafId].update = false;
          }
        }
      }

      refreshAllUI();
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Quick Action Buttons (Select All, View Only, Restore, Save)
  // ---------------------------------------------------------------------------
  if (btnSelectAll) {
    btnSelectAll.addEventListener("click", () => {
      const perms = rolesState[activeRoleKey].permissions;
      Object.keys(perms).forEach((key) => {
        perms[key].view = true;
        perms[key].update = true;
      });
      refreshAllUI();
      showToast(`Đã chọn tất cả 24 quyền cho vai trò ${rolesState[activeRoleKey].name}.`, "success");
    });
  }

  if (btnViewOnly) {
    btnViewOnly.addEventListener("click", () => {
      const perms = rolesState[activeRoleKey].permissions;
      Object.keys(perms).forEach((key) => {
        perms[key].view = true;
        perms[key].update = false;
      });
      refreshAllUI();
      showToast(`Đã thiết lập chế độ "Chỉ quyền xem" cho ${rolesState[activeRoleKey].name}.`, "success");
    });
  }

  function restoreDefaultForActiveRole() {
    rolesState[activeRoleKey] = cloneDeep(DEFAULT_ROLES_STATE[activeRoleKey]);
    saveRolesState();
    refreshAllUI();
    showToast(`Đã khôi phục cấu hình mặc định cho ${rolesState[activeRoleKey].name}.`, "success");
  }

  if (btnRestoreDefault) {
    btnRestoreDefault.addEventListener("click", restoreDefaultForActiveRole);
  }

  if (btnResetChanges) {
    btnResetChanges.addEventListener("click", restoreDefaultForActiveRole);
  }

  if (btnSaveChanges) {
    btnSaveChanges.addEventListener("click", async () => {
      saveRolesState();
      const currentRole = rolesState[activeRoleKey];
      const stats = calculateRoleStats(activeRoleKey);

      if (window.api && typeof window.api.put === "function") {
        try {
          const p = currentRole.permissions;
          const danhSachQuyen = [
            { maQuyenHan: 2, duocXem: !!(p["leaf-1-1"]?.view || p["leaf-2-1"]?.view), duocCapNhat: !!(p["leaf-1-6"]?.update || p["leaf-2-1"]?.update) },
            { maQuyenHan: 3, duocXem: !!(p["leaf-3-2-1"]?.view || p["leaf-2-3"]?.view), duocCapNhat: !!(p["leaf-3-2-1"]?.update) },
            { maQuyenHan: 4, duocXem: !!(p["leaf-3-2-2"]?.view || p["leaf-2-4"]?.view), duocCapNhat: !!(p["leaf-3-2-2"]?.update) },
            { maQuyenHan: 6, duocXem: !!(p["leaf-1-1"]?.view || p["leaf-3-1-3"]?.view), duocCapNhat: !!(p["leaf-1-6"]?.update || p["leaf-3-1-4"]?.update) },
            { maQuyenHan: 7, duocXem: !!(p["leaf-1-8"]?.view || p["leaf-3-2-3"]?.view || activeRoleKey === "operator"), duocCapNhat: !!(p["leaf-1-8"]?.update || p["leaf-3-2-3"]?.update || activeRoleKey === "operator") },
            { maQuyenHan: 8, duocXem: !!(p["leaf-1-2"]?.view || p["leaf-3-1-1"]?.view), duocCapNhat: !!(p["leaf-1-2"]?.update || p["leaf-3-1-1"]?.update) }
          ].filter(item => item.duocXem || item.duocCapNhat);

          await window.api.put(`/VaiTroQuyenHan/vai-tro/${currentRole.maVaiTro}`, {
            danhSachQuyen
          });
        } catch (_) {
          // Giữ lưu trữ localStorage khi Backend offline
        }
      }

      showToast(
        `Đã lưu phân quyền cho "${currentRole.name}" (${stats.granted}/${stats.total} quyền kích hoạt).`,
        "success"
      );
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Personnel List Actions (Add, Swap Role, Remove)
  // ---------------------------------------------------------------------------
  if (personnelListEl) {
    personnelListEl.addEventListener("click", (event) => {
      const swapBtn = event.target.closest(".btn-swap-role");
      const removeBtn = event.target.closest(".btn-remove-user");

      if (swapBtn) {
        const userId = swapBtn.getAttribute("data-user-id");
        const targetRoleKey = activeRoleKey === "operator" ? "technician" : "operator";
        const currentRole = rolesState[activeRoleKey];
        const targetRole = rolesState[targetRoleKey];

        const idx = currentRole.personnel.findIndex((u) => u.id === userId);
        if (idx !== -1) {
          const [movedUser] = currentRole.personnel.splice(idx, 1);
          currentRole.accountCount = Math.max(0, currentRole.accountCount - 1);
          targetRole.personnel.unshift(movedUser);
          targetRole.accountCount += 1;

          saveRolesState();
          refreshAllUI();
          showToast(`Đã chuyển "${movedUser.name}" sang vai trò ${targetRole.name}.`, "success");
        }
      } else if (removeBtn) {
        const userId = removeBtn.getAttribute("data-user-id");
        const currentRole = rolesState[activeRoleKey];
        const idx = currentRole.personnel.findIndex((u) => u.id === userId);
        if (idx !== -1) {
          const [removedUser] = currentRole.personnel.splice(idx, 1);
          currentRole.accountCount = Math.max(0, currentRole.accountCount - 1);

          saveRolesState();
          refreshAllUI();
          showToast(`Đã gỡ "${removedUser.name}" khỏi vai trò ${currentRole.name}.`, "warning");
        }
      }
    });
  }

  function openAddPersonnelModal() {
    if (!addPersonnelModal) return;
    if (modalRoleNameLabel) {
      modalRoleNameLabel.textContent = rolesState[activeRoleKey].name;
    }
    if (formAddPersonnel) formAddPersonnel.reset();
    addPersonnelModal.classList.remove("hidden");
    addPersonnelModal.classList.add("flex");
    if (inputStaffName) inputStaffName.focus();
  }

  function closeAddPersonnelModal() {
    if (!addPersonnelModal) return;
    addPersonnelModal.classList.add("hidden");
    addPersonnelModal.classList.remove("flex");
  }

  if (btnAddPersonnel) btnAddPersonnel.addEventListener("click", openAddPersonnelModal);
  if (btnClosePersonnelModal) btnClosePersonnelModal.addEventListener("click", closeAddPersonnelModal);
  if (btnCancelPersonnelModal) btnCancelPersonnelModal.addEventListener("click", closeAddPersonnelModal);

  if (addPersonnelModal) {
    addPersonnelModal.addEventListener("click", (event) => {
      if (event.target === addPersonnelModal) closeAddPersonnelModal();
    });
  }

  if (formAddPersonnel) {
    formAddPersonnel.addEventListener("submit", (event) => {
      event.preventDefault();
      const nameVal = (inputStaffName?.value || "").trim();
      const emailVal = (inputStaffEmail?.value || "").trim();
      const statusVal = inputStaffStatus?.value || "Đang trực";

      if (!nameVal || !emailVal) return;

      const words = nameVal.split(/\s+/).filter(Boolean);
      const initials =
        words.length >= 2
          ? (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase()
          : nameVal.slice(0, 2).toUpperCase();

      const avatarPalette = [
        "bg-primary-container text-white",
        "bg-primary-fixed text-primary",
        "bg-secondary-container text-on-secondary-container",
        "bg-surface-container text-on-surface-variant"
      ];
      const currentRole = rolesState[activeRoleKey];
      const avatarClass = avatarPalette[currentRole.personnel.length % avatarPalette.length];

      currentRole.personnel.unshift({
        id: `user-${Date.now()}`,
        initials,
        name: nameVal,
        email: emailVal,
        status: statusVal,
        online: statusVal === "Đang trực" || statusVal === "Hiện trường",
        avatarClass
      });
      currentRole.accountCount += 1;

      saveRolesState();
      refreshAllUI();
      closeAddPersonnelModal();
      showToast(`Đã gán nhân sự "${nameVal}" vào vai trò ${currentRole.name}.`, "success");
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Shared Topbar & Sidebar Interactions (Search, Clock, Notifications, Mobile)
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
      closeAddPersonnelModal();
    }
  });

  if (topSearchInput) {
    topSearchInput.addEventListener("input", () => {
      const query = topSearchInput.value.trim().toLowerCase();
      const leafRows = document.querySelectorAll("tr[data-leaf-id]");

      leafRows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        if (!query || text.includes(query)) {
          row.classList.remove("hidden");
        } else {
          row.classList.add("hidden");
        }
      });
    });
  }

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

  // Handle placeholder nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && !href.startsWith("#") && href !== "") return;
      e.preventDefault();
      const title = link.querySelector(".nav-label")?.textContent;
      if (title) {
        showToast(`Chức năng ${title} đang phát triển`, "warning");
      }
      if (window.innerWidth <= 900) closeMobileSidebar();
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Live Clock & Shared Toast Notification System
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
  refreshAllUI();
  startLiveClock();
  trySyncRolesFromApi();
});
