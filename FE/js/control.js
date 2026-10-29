document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector) => document.querySelector(selector);
  const toastContainer = $('#toastContainer');
  const targetTypeSelect = $('#controlTargetType');
  const targetSelect = $('#controlTarget');
  const lightsBody = $('#controlLightsBody');
  const targetCount = $('#controlTargetCount');
  const lampSummary = $('#controlLampSummary');
  const description = $('#controlTargetDescription');
  const actionButtons = [...document.querySelectorAll('.control-redesign [data-action]')];
  const dimRange = $('#controlDim');
  const dimValue = $('#controlDimValue');
  const confirmSummary = $('#controlConfirmSummary');
  const sendButton = $('#controlSendCommand');
  const recentList = $('#controlRecentList');
  const historySummary = $('#controlHistorySummary');
  const targetLabel = $('#controlTargetLabel');
  const confirmTarget = $('#controlConfirmTarget');
  const catalogs = { cabinets: [], routes: [], lights: [] };
  const catalogErrors = { cabinets: false, routes: false, lights: false };
  let selectedAction = 'BAT';
  let selectedLights = [];
  let requestSequence = 0;

  const value = (item, name) => item?.[name] ?? item?.[name[0].toLowerCase() + name.slice(1)] ?? '';
  const idOf = (item, name) => String(value(item, name) ?? '').trim();
  const labelOf = (item, name, id) => `${value(item, name) || idOf(item, id)} (${idOf(item, id)})`;

  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const text = document.createElement('span');
    text.textContent = message;
    toast.append(text);
    toastContainer.append(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function setEmptyTable(message) {
    if (!lightsBody) return;
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.className = 'empty-state';
    cell.textContent = message;
    row.append(cell);
    lightsBody.replaceChildren(row);
  }

  function activeItems(items) {
    return items.filter((item) => value(item, 'DaXoa') !== true);
  }

  function getCurrentTarget() {
    const type = targetTypeSelect?.value;
    const id = targetSelect?.value;
    if (!id) return null;
    const list = type === 'cabinet' ? catalogs.cabinets : type === 'route' ? catalogs.routes : catalogs.lights;
    const item = list.find((candidate) => idOf(candidate, type === 'cabinet' ? 'MaTu' : type === 'route' ? 'MaTuyen' : 'MaDen') === id);
    return item ? { type, id, item } : null;
  }

  function renderTargetDescription() {
    if (!description) return;
    description.textContent = 'Mỗi lệnh chỉ áp dụng cho một tủ, một tuyến hoặc một điểm đèn.';
  }

  function fillTargets() {
    if (!targetTypeSelect || !targetSelect) return;
    const type = targetTypeSelect.value;
    const catalogKey = type === 'cabinet' ? 'cabinets' : type === 'route' ? 'routes' : 'lights';
    const items = catalogs[catalogKey];
    const idKey = type === 'cabinet' ? 'MaTu' : type === 'route' ? 'MaTuyen' : 'MaDen';
    const nameKey = type === 'cabinet' ? 'TenTu' : type === 'route' ? 'TenTuyen' : 'TenDen';
    const typeName = type === 'cabinet' ? 'tủ chiếu sáng' : type === 'route' ? 'tuyến chiếu sáng' : 'điểm đèn';
    if (targetLabel) targetLabel.textContent = type === 'cabinet' ? 'Tủ chiếu sáng' : type === 'route' ? 'Tuyến chiếu sáng' : 'Điểm đèn';

    const loadFailed = catalogErrors[catalogKey];
    targetSelect.replaceChildren(new Option(items.length ? `Chọn ${typeName}` : loadFailed ? `Không tải được danh sách ${typeName}` : `Không có ${typeName}`, ''));
    items.forEach((item) => {
      const id = idOf(item, idKey);
      if (id) targetSelect.add(new Option(labelOf(item, nameKey, idKey), id));
    });
    targetSelect.disabled = items.length === 0;
    if (items.length) targetSelect.selectedIndex = 1;
    renderTargetDescription();
    updateCommandSummary();
    if (items.length) void loadTargetLights();
    else {
      selectedLights = [];
      setEmptyTable(loadFailed ? `Không tải được danh sách ${typeName} từ máy chủ.` : `Không có ${typeName} để hiển thị.`);
      updateTargetCount();
    }
  }

  function updateTargetCount() {
    if (targetCount) targetCount.textContent = `${selectedLights.length} điểm đèn`;
    const target = getCurrentTarget();
    const selectedLabel = targetSelect?.selectedOptions[0]?.textContent || '';
    if (lampSummary) lampSummary.textContent = target
      ? `${selectedLights.length ? 'Hiển thị' : 'Chưa có'} điểm đèn thuộc ${selectedLabel}. Trạng thái/mức sáng lấy từ dữ liệu gần nhất; API chưa cung cấp trạng thái kết nối trực tiếp.`
      : 'Chọn một đối tượng để xem các điểm đèn trực thuộc.';
  }

  function renderLights(items) {
    if (!lightsBody) return;
    if (!items.length) {
      setEmptyTable('Đối tượng này chưa có điểm đèn.');
      updateTargetCount();
      return;
    }

    const rows = items.map((light) => {
      const row = document.createElement('tr');
      const code = document.createElement('td');
      code.className = 'lamp-code';
      code.textContent = idOf(light, 'MaDen');

      const status = Number(value(light, 'TrangThaiHoatDong'));
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `lamp-state${status === 1 ? ' is-on' : status === 2 ? ' is-off' : ''}`;
      statusBadge.textContent = ({ 0: 'Chưa xác định', 1: 'Bật', 2: 'Tắt', 3: 'Sự cố' })[status] || 'Chưa xác định';
      if (status === 0) statusBadge.classList.add('is-unknown');
      statusCell.append(statusBadge);

      const brightnessCell = document.createElement('td');
      const brightnessWrap = document.createElement('div');
      brightnessWrap.className = 'brightness-cell';
      const brightness = value(light, 'DoSang');
      const brightnessTrack = document.createElement('span');
      brightnessTrack.className = 'brightness-track';
      const brightnessFill = document.createElement('span');
      brightnessFill.className = 'brightness-fill';
      brightnessFill.style.width = brightness === '' || brightness === null ? '0%' : `${Math.min(100, Math.max(0, Number(brightness)))}%`;
      brightnessTrack.append(brightnessFill);
      const brightnessText = document.createElement('span');
      brightnessText.textContent = brightness === '' || brightness === null ? 'Chưa có dữ liệu' : `${brightness}%`;
      brightnessWrap.append(brightnessTrack, brightnessText);
      brightnessCell.append(brightnessWrap);
      brightnessCell.title = value(light, 'ThoiGianDo') ? `Dữ liệu lúc ${formatDate(value(light, 'ThoiGianDo'))}` : '';

      const dataCell = document.createElement('td');
      dataCell.textContent = 'Chưa có dữ liệu';
      dataCell.title = value(light, 'ViTri') || '';
      const locationCell = document.createElement('td');
      locationCell.textContent = value(light, 'ViTri') || 'Chưa có dữ liệu';
      row.append(code, locationCell, statusCell, brightnessCell, dataCell);
      return row;
    });
    lightsBody.replaceChildren(...rows);
    updateTargetCount();
  }

  async function loadTargetLights() {
    const target = getCurrentTarget();
    const sequence = ++requestSequence;
    if (!target) {
      selectedLights = [];
      setEmptyTable('Chọn đối tượng để xem các điểm đèn.');
      updateTargetCount();
      updateCommandSummary();
      return;
    }

    setEmptyTable('Đang tải dữ liệu điểm đèn...');
    const params = target.type === 'cabinet' ? { maTu: target.id }
      : target.type === 'route' ? { maTuyen: target.id }
        : { maDen: target.id };
    try {
      const result = await api.get('/DiemDen/dieu-khien', params);
      if (!Array.isArray(result)) throw new Error('Backend trả về danh sách điểm đèn không hợp lệ.');
      if (sequence !== requestSequence) return;
      selectedLights = result;
      renderLights(selectedLights);
      renderTargetDescription();
      updateCommandSummary();
    } catch (error) {
      if (sequence !== requestSequence) return;
      selectedLights = [];
      setEmptyTable(`Không tải được dữ liệu điểm đèn: ${error.message}`);
      updateTargetCount();
    }
  }

  function updateCommandSummary() {
    const target = getCurrentTarget();
    const dim = Number(dimRange?.value || 0);
    const label = target ? targetSelect?.selectedOptions[0]?.textContent || '' : 'Chọn đối tượng';
    const actionLabel = selectedAction === 'BAT' ? 'BẬT' : selectedAction === 'TAT' ? 'TẮT' : `DIM ${dim}%`;
    if (confirmSummary) {
      confirmSummary.replaceChildren(document.createTextNode(`Gửi lệnh tức thời: `));
      const action = document.createElement('strong');
      action.textContent = `${actionLabel}${label ? ` ${label}` : ''}`;
      confirmSummary.append(action);
    }
    if (confirmTarget) confirmTarget.textContent = label || 'Chọn đối tượng';
    if (sendButton) sendButton.disabled = !target;
  }

  function getCommandTarget(target) {
    if (target.type === 'cabinet') return { maTu: target.id };
    if (target.type === 'route') return { maTuyen: target.id };
    return { maDen: target.id };
  }

  function formatDate(date) {
    if (!date) return 'Thời gian không rõ';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? 'Thời gian không rõ' : parsed.toLocaleString('vi-VN');
  }

  function statusInfo(status) {
    return ({
      0: { label: 'Đang chờ', className: 'status-pending' },
      1: { label: 'Đã gửi', className: 'status-pending' },
      2: { label: 'Thành công', className: 'status-success' },
      3: { label: 'Thất bại', className: 'status-failed' },
      4: { label: 'Quá hạn', className: 'status-failed' }
    })[status] || { label: `Trạng thái ${status}`, className: '' };
  }

  async function renderHistory() {
    if (!recentList) return;
    recentList.replaceChildren();
    const loading = document.createElement('p');
    loading.className = 'empty-state';
    loading.textContent = 'Đang tải lịch sử lệnh...';
    recentList.append(loading);

    try {
      const result = await api.get('/LenhDieuKhien', { limit: 10 });
      if (!Array.isArray(result)) throw new Error('Backend trả về lịch sử lệnh không hợp lệ.');
      recentList.replaceChildren();
      if (!result.length) {
        const empty = document.createElement('p');
        empty.className = 'recent-empty';
        empty.textContent = 'Chưa có lệnh điều khiển nào.';
        recentList.append(empty);
      }

      result.forEach((command) => {
        const item = document.createElement('article');
        item.className = 'recent-item';
        const meta = document.createElement('div');
        meta.className = 'recent-meta';
        const createdAt = document.createElement('span');
        createdAt.textContent = formatDate(value(command, 'ThoiGianTao'));
        const state = document.createElement('span');
        const info = statusInfo(Number(value(command, 'TrangThaiLenh')));
        state.className = `event-status-tag ${info.className}`;
        state.textContent = info.label;
        meta.append(createdAt, state);

        const target = idOf(command, 'MaDen') || idOf(command, 'MaTuyen') || idOf(command, 'MaTu') || 'Không rõ đối tượng';
        const action = value(command, 'HanhDong');
        const brightness = value(command, 'MucSang');
        const title = document.createElement('div');
        title.className = 'recent-title';
        title.textContent = `${action === 'BAT' ? 'Bật' : action === 'TAT' ? 'Tắt' : action === 'DIM' ? 'Điều chỉnh độ sáng' : action} • ${target}${brightness === '' || brightness === null ? '' : ` • ${brightness}%`}`;
        item.append(meta, title);

        const response = value(command, 'NoiDungPhanHoi');
        if (response) {
          const responseText = document.createElement('div');
          responseText.className = 'recent-response';
          responseText.textContent = response;
          item.append(responseText);
        }
        recentList.append(item);
      });
      if (historySummary) historySummary.textContent = 'Chưa có dữ liệu xác nhận từ Gateway.';
    } catch (error) {
      recentList.replaceChildren();
      const failure = document.createElement('p');
      failure.className = 'recent-empty';
      failure.textContent = `Không tải được lịch sử lệnh: ${error.message}`;
      recentList.append(failure);
      if (historySummary) historySummary.textContent = 'Chưa có dữ liệu xác nhận từ Gateway.';
    }
  }

  async function sendCommand() {
    const target = getCurrentTarget();
    if (!target) {
      showToast('Vui lòng chọn một đối tượng điều khiển.', 'error');
      return;
    }

    let user;
    try {
      user = JSON.parse(sessionStorage.getItem('smartlight_user_session') || '{}');
    } catch (error) {
      showToast(`Không đọc được phiên đăng nhập: ${error.message}`, 'error');
      return;
    }
    if (!user.maNguoiDung && !user.username) {
      showToast('Phiên đăng nhập thiếu thông tin người dùng; vui lòng đăng nhập lại.', 'error');
      return;
    }

    const body = {
      ...getCommandTarget(target),
      hanhDong: selectedAction,
      mucSang: selectedAction === 'DIM' ? Number(dimRange.value) : null,
      nguonLenh: 1,
      maNguoiDung: user.maNguoiDung || null
    };
    sendButton.disabled = true;
    const previousLabel = sendButton.textContent;
    sendButton.textContent = 'Đang gửi...';
    try {
      await api.post('/LenhDieuKhien', body);
      showToast('Lệnh đã được lưu vào hàng đợi. Trạng thái thiết bị chờ phản hồi thực tế.', 'success');
      await renderHistory();
    } catch (error) {
      showToast(`Không gửi được lệnh: ${error.message}`, 'error');
    } finally {
      sendButton.textContent = previousLabel;
      updateCommandSummary();
    }
  }

  function updateClock() {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const clock = $('#topbarLiveClock');
    if (clock) clock.textContent = `${days[now.getDay()]}, ${now.toLocaleDateString('vi-VN')}`;
  }

  targetTypeSelect?.addEventListener('change', fillTargets);
  targetSelect?.addEventListener('change', () => {
    renderTargetDescription();
    updateTargetCount();
    updateCommandSummary();
    void loadTargetLights();
  });
  actionButtons.forEach((button) => button.addEventListener('click', () => {
    selectedAction = button.dataset.action;
    actionButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle('is-selected', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
    updateCommandSummary();
  }));
  dimRange?.addEventListener('input', () => {
    if (dimValue) dimValue.textContent = dimRange.value;
    selectedAction = 'DIM';
    document.querySelectorAll('.dim-preset').forEach((button) => {
      button.classList.toggle('is-current', button.dataset.dim === dimRange.value);
    });
    actionButtons.forEach((button) => {
      button.classList.remove('is-selected');
      button.setAttribute('aria-pressed', 'false');
    });
    updateCommandSummary();
  });
  document.querySelectorAll('.dim-preset').forEach((button) => button.addEventListener('click', () => {
    if (!dimRange) return;
    dimRange.value = button.dataset.dim;
    dimRange.dispatchEvent(new Event('input', { bubbles: true }));
  }));
  $('#controlCancelCommand')?.addEventListener('click', () => {
    selectedAction = 'BAT';
    actionButtons.forEach((button) => {
      const selected = button.dataset.action === 'BAT';
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    updateCommandSummary();
  });
  sendButton?.addEventListener('click', () => void sendCommand());

  const sidebar = $('#sidebar');
  const backdrop = $('#sidebarBackdrop');
  const closeSidebar = () => {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('active');
  };
  $('#btnToggleMobileSidebar')?.addEventListener('click', () => {
    sidebar?.classList.add('open');
    backdrop?.classList.add('active');
  });
  $('#btnCloseSidebar')?.addEventListener('click', closeSidebar);
  backdrop?.addEventListener('click', closeSidebar);

  updateClock();
  setInterval(updateClock, 1000);
  void renderHistory();

  (async () => {
    const results = await Promise.allSettled([
      api.get('/TuChieuSang'),
      api.get('/TuyenChieuSang'),
      api.get('/DiemDen')
    ]);
    const [cabinetResult, routeResult, lightResult] = results;
    if (cabinetResult.status === 'fulfilled' && Array.isArray(cabinetResult.value)) {
      catalogs.cabinets = activeItems(cabinetResult.value);
    } else {
      catalogErrors.cabinets = true;
    }
    if (routeResult.status === 'fulfilled' && Array.isArray(routeResult.value)) {
      catalogs.routes = activeItems(routeResult.value);
    } else {
      catalogErrors.routes = true;
    }
    if (lightResult.status === 'fulfilled' && Array.isArray(lightResult.value)) {
      catalogs.lights = activeItems(lightResult.value);
    } else {
      catalogErrors.lights = true;
    }

    fillTargets();
  })();
});
