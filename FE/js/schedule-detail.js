document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const value = (item, pascal, camel) => item?.[pascal] ?? item?.[camel] ?? '';
  const escapeHtml = (text) => String(text ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const toast = (message, type = 'success') => {
    const container = $('#toastContainer');
    if (!container) return;
    const item = document.createElement('div');
    item.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-rose-900 text-white border-rose-800'}`;
    item.textContent = message;
    container.append(item);
    setTimeout(() => item.remove(), 4000);
  };
  const modalEdit = $('#modalEditSchedule');
  const modalCabinets = $('#modalAllCabinets');
  const logContainer = $('#btnRefreshLogs')?.parentElement?.nextElementSibling;
  if (logContainer) logContainer.id = 'executionLogs';
  if ($('#timelineStagesGrid')) $('#timelineStagesGrid').innerHTML = '<p class="col-span-full text-sm text-slate-500">Đang tải mốc vận hành...</p>';
  if ($('#scheduleStagesTableBody')) $('#scheduleStagesTableBody').innerHTML = '<tr><td class="py-4 px-4 text-slate-500" colspan="7">Đang tải mốc...</td></tr>';
  if ($('#executionLogs')) $('#executionLogs').textContent = 'Đang tải nhật ký...';
  const scheduleId = Number(new URLSearchParams(location.search).get('id'));
  let schedule = null;
  let events = [];
  let schedules = [];
  let cabinets = [];
  let targetName = '';
  const dateValue = (date) => String(date || '').slice(0, 10);
  const targetId = (item) => value(item, 'MaTu', 'maTu') || value(item, 'MaTuyen', 'maTuyen') || value(item, 'MaDen', 'maDen');
  const targetLabel = (item) => value(item, 'MaTu', 'maTu') ? 'Tủ chiếu sáng'
    : value(item, 'MaTuyen', 'maTuyen') ? 'Tuyến chiếu sáng' : value(item, 'MaDen', 'maDen') ? 'Điểm đèn' : 'Chưa gán';
  const eventTime = (item) => String(value(item, 'GioThucHien', 'gioThucHien') || '').slice(0, 5);
  const eventAction = (item) => value(item, 'HanhDong', 'hanhDong');
  const eventBrightness = (item) => value(item, 'MucSang', 'mucSang');
  const dayLabels = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOptions = [1, 2, 3, 4, 5, 6, 7].map((day) => `<option value="${day}">${day === 7 ? 'CN' : `T${day + 1}`}</option>`).join('');
  const actionText = (action, dim) => action === 'DIM' ? `Dim ${dim ?? 0}%` : action === 'BAT' ? 'Bật' : action === 'TAT' ? 'Tắt' : action;

  const setModal = (modal, visible) => {
    if (!modal) return;
    modal.classList.toggle('hidden', !visible);
    modal.classList.toggle('flex', visible);
  };
  const renderStages = () => {
    const grid = $('#timelineStagesGrid');
    const table = $('#scheduleStagesTableBody');
    if (!grid || !table) return;
    const ordered = [...events].sort((a, b) => eventTime(a).localeCompare(eventTime(b)) ||
      Number(value(a, 'ThuTrongTuan', 'thuTrongTuan')) - Number(value(b, 'ThuTrongTuan', 'thuTrongTuan')));
    const count = $('#scheduleStageCount');
    if (count) count.textContent = String(ordered.length);
    grid.replaceChildren();
    table.replaceChildren();
    if (!ordered.length) {
      grid.innerHTML = '<p class="col-span-full text-sm text-slate-500">Lịch chưa có mốc tự động.</p>';
      table.innerHTML = '<tr><td class="py-4 px-4 text-slate-500" colspan="7">Chưa cấu hình mốc.</td></tr>';
      return;
    }
    ordered.forEach((stage, index) => {
      const time = eventTime(stage);
      const action = eventAction(stage);
      const dim = eventBrightness(stage);
      const day = Number(value(stage, 'ThuTrongTuan', 'thuTrongTuan'));
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'rounded-xl p-3.5 text-center flex flex-col justify-between border cursor-pointer transition hover:shadow-md stage-card';
      card.dataset.time = time;
      card.dataset.dim = String(dim ?? (action === 'BAT' ? 100 : 0));
      card.innerHTML = `<span class="text-xs font-mono font-bold text-slate-700">${escapeHtml(time)}</span><strong class="my-2 text-2xl font-black text-slate-900">${escapeHtml(action === 'DIM' ? `${dim}%` : actionText(action))}</strong><span class="text-[11px] font-semibold text-slate-600">${escapeHtml(dayLabels[day % 7] || 'Không rõ ngày')}</span>`;
      grid.append(card);
      const row = document.createElement('tr');
      row.innerHTML = `<td class="py-3 px-4 font-bold text-brand-600">Mốc ${index + 1}</td><td class="py-3 px-4 font-mono font-bold">${escapeHtml(time)}</td><td class="py-3 px-4">${escapeHtml(action === 'DIM' ? `${dim}%` : '—')}</td><td class="py-3 px-4">${escapeHtml(dayLabels[day % 7] || 'Không rõ ngày')}</td><td class="py-3 px-4">${escapeHtml(actionText(action, dim))}</td><td class="py-3 px-4" colspan="2">Lịch vận hành</td>`;
      table.append(row);
    });
    grid.querySelectorAll('.stage-card').forEach((card) => card.addEventListener('click', () => {
      const label = $('#simBrightnessLabel');
      if (label) label.textContent = `Đang xem: ${card.dataset.time} (${card.dataset.dim}% sáng)`;
      $$('.street-preview-cone').forEach((cone) => { cone.style.opacity = String(Number(card.dataset.dim) / 100); });
    }));
  };
  const renderEditStages = () => {
    const container = $('#editScheduleStages');
    if (!container) return;
    container.innerHTML = events.map((stage, index) => `
      <div class="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center" data-event-id="${escapeHtml(value(stage, 'MaChiTiet', 'maChiTiet') || '')}">
        <label class="sr-only" for="editStageDay${index}">Ngày trong tuần</label>
        <select id="editStageDay${index}" class="edit-stage-day text-xs border-slate-200 rounded-lg px-2 py-2">${dayOptions}</select>
        <label class="sr-only" for="editStageTime${index}">Thời gian</label>
        <input id="editStageTime${index}" type="time" required value="${escapeHtml(eventTime(stage))}" class="edit-stage-time text-xs border-slate-200 rounded-lg px-2 py-2">
        <label class="sr-only" for="editStageAction${index}">Hành động</label>
        <select id="editStageAction${index}" class="edit-stage-action text-xs border-slate-200 rounded-lg px-2 py-2">
          <option value="BAT" ${eventAction(stage) === 'BAT' ? 'selected' : ''}>Bật</option>
          <option value="DIM" ${eventAction(stage) === 'DIM' ? 'selected' : ''}>Dimming</option>
          <option value="TAT" ${eventAction(stage) === 'TAT' ? 'selected' : ''}>Tắt</option>
        </select>
        <label class="sr-only" for="editStageBrightness${index}">Mức sáng</label>
        <input id="editStageBrightness${index}" type="number" min="0" max="100" value="${escapeHtml(eventBrightness(stage) ?? 100)}" class="edit-stage-brightness text-xs border-slate-200 rounded-lg px-2 py-2" ${eventAction(stage) === 'DIM' ? '' : 'disabled'}>
        <button type="button" class="remove-stage text-xs text-rose-600 hover:underline">Xóa</button>
      </div>`).join('');
    container.querySelectorAll('.edit-stage-day').forEach((select, index) => {
      select.value = String(value(events[index], 'ThuTrongTuan', 'thuTrongTuan') || 1);
    });
    container.querySelectorAll('.edit-stage-action').forEach((select) => select.addEventListener('change', () => {
      const input = select.parentElement.querySelector('.edit-stage-brightness');
      input.disabled = select.value !== 'DIM';
    }));
    container.querySelectorAll('.remove-stage').forEach((button) => button.addEventListener('click', () => {
      button.closest('[data-event-id]').remove();
    }));
  };
  const renderHeader = () => {
    const id = value(schedule, 'MaLich', 'maLich');
    const title = value(schedule, 'TenLich', 'tenLich');
    const heading = `Lịch #${id}: ${title}`;
    document.title = `${heading} - SmartLight`;
    if ($('#scheduleBreadcrumb')) $('#scheduleBreadcrumb').textContent = heading;
    if ($('#scheduleHeading')) $('#scheduleHeading').textContent = heading;
    if ($('#editScheduleHeading')) $('#editScheduleHeading').textContent = `Chỉnh sửa ${heading}`;
    if ($('#scheduleLoadStatus')) $('#scheduleLoadStatus').lastChild.textContent = 'Dữ liệu lịch đã tải';
    if ($('#scheduleTarget')) $('#scheduleTarget').textContent = `${targetName} • ${targetLabel(schedule)}`;
    const status = Boolean(value(schedule, 'DangApDung', 'dangApDung'));
    const badge = $('#scheduleActiveBadge');
    if (badge) {
      badge.lastChild.textContent = status ? 'Đang hoạt động' : 'Tạm dừng';
      badge.classList.toggle('bg-emerald-50', status);
      badge.classList.toggle('text-emerald-700', status);
      badge.classList.toggle('bg-amber-50', !status);
      badge.classList.toggle('text-amber-700', !status);
    }
    const pauseText = $('#pauseBtnText');
    if (pauseText) pauseText.textContent = status ? 'Tạm dừng' : 'Kích hoạt';
    const start = value(schedule, 'NgayBatDau', 'ngayBatDau');
    const end = value(schedule, 'NgayKetThuc', 'ngayKetThuc');
    const timeRange = events.length
      ? `${eventTime(events[0]) || '--:--'} – ${eventTime(events[events.length - 1]) || '--:--'}`
      : 'Chưa cấu hình mốc';
    if ($('#scheduleTimeRange')) $('#scheduleTimeRange').textContent = timeRange;
    if ($('#scheduleDimmingRange')) {
      $('#scheduleDimmingRange').textContent = events.filter((item) => eventAction(item) === 'DIM')
        .map((item) => `${eventBrightness(item)}%`).join(' → ') || 'Không có mốc dimming';
    }
    const period = $('.space-y-2.pt-3.border-t .flex.justify-between .font-semibold');
    if (period) period.textContent = `${start ? new Date(`${dateValue(start)}T00:00:00`).toLocaleDateString('vi-VN') : '—'} – ${end ? new Date(`${dateValue(end)}T00:00:00`).toLocaleDateString('vi-VN') : 'Không giới hạn'}`;
    if ($('#editScheduleName')) $('#editScheduleName').value = title || '';
    if ($('#editScheduleStartDate')) $('#editScheduleStartDate').value = dateValue(start);
    if ($('#editScheduleEndDate')) $('#editScheduleEndDate').value = dateValue(end);
    if ($('#editScheduleActive')) $('#editScheduleActive').checked = status;
    renderStages();
  };
  const fullPayload = (item, active = value(item, 'DangApDung', 'dangApDung')) => ({
    tenLich: value(item, 'TenLich', 'tenLich'),
    ngayBatDau: dateValue(value(item, 'NgayBatDau', 'ngayBatDau')),
    ngayKetThuc: value(item, 'NgayKetThuc', 'ngayKetThuc') || null,
    dangApDung: Boolean(active),
    maTu: value(item, 'MaTu', 'maTu') || null,
    maTuyen: value(item, 'MaTuyen', 'maTuyen') || null,
    maDen: value(item, 'MaDen', 'maDen') || null,
    maNguoiTao: value(item, 'MaNguoiTao', 'maNguoiTao') || null
  });
  const loadLogs = async () => {
    const container = $('#executionLogs');
    if (!container) return;
    try {
      const result = await api.get('/LenhDieuKhien', { limit: 50 });
      if (!Array.isArray(result)) throw new Error('Dữ liệu lệnh không hợp lệ.');
      const matching = result.filter((item) => Number(value(item, 'MaLich', 'maLich')) === scheduleId);
      container.replaceChildren();
      if (!matching.length) {
        container.textContent = 'Chưa có lệnh thực thi cho lịch này.';
        return;
      }
      matching.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100';
        const time = document.createElement('span');
        time.className = 'text-brand-600 font-bold';
        time.textContent = value(item, 'ThoiGianTao', 'thoiGianTao')
          ? new Date(value(item, 'ThoiGianTao', 'thoiGianTao')).toLocaleString('vi-VN') : '—';
        const text = document.createElement('span');
        text.className = 'text-slate-700';
        text.textContent = `${eventAction(item)}${eventBrightness(item) == null ? '' : ` ${eventBrightness(item)}%`} • trạng thái ${value(item, 'TrangThaiLenh', 'trangThaiLenh')}`;
        row.append(time, text);
        container.append(row);
      });
    } catch (error) {
      container.textContent = `Không tải được nhật ký: ${error.message}`;
      toast(`Không tải được nhật ký: ${error.message}`, 'error');
    }
  };
  const loadSchedule = async () => {
    if (!Number.isInteger(scheduleId) || scheduleId < 1) {
      throw new Error('Thiếu mã lịch hợp lệ. Hãy mở trang từ danh sách lịch vận hành.');
    }
    const [item, detailRows, list] = await Promise.all([
      api.get(`/LichVanHanh/${scheduleId}`),
      api.get('/ChiTietLichVanHanh', { maLich: scheduleId }),
      api.get('/LichVanHanh')
    ]);
    if (!item || !Array.isArray(detailRows) || !Array.isArray(list)) throw new Error('Dữ liệu lịch từ máy chủ không hợp lệ.');
    schedule = item;
    events = detailRows;
    schedules = list;
    const key = value(schedule, 'MaTu', 'maTu') ? 'TuChieuSang'
      : value(schedule, 'MaTuyen', 'maTuyen') ? 'TuyenChieuSang' : 'DiemDen';
    const id = targetId(schedule);
    const target = id ? await api.get(`/${key}/${encodeURIComponent(id)}`) : null;
    targetName = target
      ? value(target, 'TenTu', 'tenTu') || value(target, 'TenTuyen', 'tenTuyen') || value(target, 'TenDen', 'tenDen') || id
      : 'Chưa gán thiết bị';
    renderHeader();
    const quick = $('#quickScheduleSelect');
    if (quick) {
      quick.replaceChildren();
      schedules.forEach((entry) => {
        const entryId = value(entry, 'MaLich', 'maLich');
        quick.add(new Option(`#${entryId}: ${value(entry, 'TenLich', 'tenLich')}`, entryId));
      });
      quick.value = String(scheduleId);
    }
    const cabinetList = $('#allCabinetsList');
    if (cabinetList) {
      cabinetList.replaceChildren();
      try {
        const cabinetResult = await api.get('/TuChieuSang');
        if (!Array.isArray(cabinetResult)) throw new Error('Danh sách tủ từ máy chủ không hợp lệ.');
        cabinets = cabinetResult;
        cabinets.forEach((cabinet) => {
          const card = document.createElement('div');
          card.className = 'p-3 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50/60';
          const info = document.createElement('span');
          info.className = 'text-xs font-bold text-slate-800';
          info.textContent = `${value(cabinet, 'TenTu', 'tenTu')} (${value(cabinet, 'MaTu', 'maTu')}) • ${value(cabinet, 'DiaChi', 'diaChi')}`;
          const state = document.createElement('span');
          state.className = 'text-[10px] font-bold';
          state.textContent = value(cabinet, 'TrangThaiKetNoi', 'trangThaiKetNoi') ? 'Online' : 'Offline';
          card.append(info, state);
          cabinetList.append(card);
        });
      } catch (error) {
        cabinetList.textContent = `Không tải được danh sách tủ: ${error.message}`;
        toast(`Không tải được danh sách tủ: ${error.message}`, 'error');
      }
    }
    await loadLogs();
  };

  const addEditorRow = (day = 1, time = '18:00', action = 'BAT', brightness = 100, id = '') => {
    const container = $('#editScheduleStages');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'grid grid-cols-1 sm:grid-cols-5 gap-2 items-center';
    row.dataset.eventId = id;
    row.innerHTML = `<select class="edit-stage-day text-xs border-slate-200 rounded-lg px-2 py-2">${dayOptions}</select><input type="time" required value="${escapeHtml(time)}" class="edit-stage-time text-xs border-slate-200 rounded-lg px-2 py-2"><select class="edit-stage-action text-xs border-slate-200 rounded-lg px-2 py-2"><option value="BAT">Bật</option><option value="DIM">Dimming</option><option value="TAT">Tắt</option></select><input type="number" min="0" max="100" value="${brightness}" class="edit-stage-brightness text-xs border-slate-200 rounded-lg px-2 py-2"><button type="button" class="remove-stage text-xs text-rose-600 hover:underline">Xóa</button>`;
    row.querySelector('.edit-stage-day').value = String(day);
    row.querySelector('.edit-stage-action').value = action;
    row.querySelector('.edit-stage-brightness').disabled = action !== 'DIM';
    row.querySelector('.edit-stage-action').addEventListener('change', (event) => {
      row.querySelector('.edit-stage-brightness').disabled = event.target.value !== 'DIM';
    });
    row.querySelector('.remove-stage').addEventListener('click', () => row.remove());
    container.append(row);
  };

  $('#quickScheduleSelect')?.addEventListener('change', (event) => {
    if (event.target.value) location.href = `schedule-detail.html?id=${encodeURIComponent(event.target.value)}`;
  });
  $('#btnEditSchedule')?.addEventListener('click', () => {
    renderEditStages();
    setModal(modalEdit, true);
  });
  $('#btnAddDimmingStage')?.addEventListener('click', () => {
    renderEditStages();
    setModal(modalEdit, true);
  });
  $('#btnAddScheduleStage')?.addEventListener('click', () => addEditorRow());
  [$('#btnCloseEditModal'), $('#btnCancelEditModal')].forEach((button) => button?.addEventListener('click', () => setModal(modalEdit, false)));
  $('#formEditSchedule')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!schedule) return;
    const startDate = $('#editScheduleStartDate').value;
    const endDate = $('#editScheduleEndDate').value || null;
    if (endDate && endDate < startDate) {
      toast('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.', 'error');
      return;
    }
    const rows = $$('#editScheduleStages > div');
    if (!rows.length) {
      toast('Lịch phải có ít nhất một mốc vận hành.', 'error');
      return;
    }
    const newEvents = rows.map((row) => {
      const action = row.querySelector('.edit-stage-action').value;
      const brightness = row.querySelector('.edit-stage-brightness').value;
      if (action === 'DIM' && (brightness === '' || Number(brightness) < 0 || Number(brightness) > 100)) {
        throw new Error('Mức dimming phải từ 0 đến 100%.');
      }
      return {
        id: row.dataset.eventId ? Number(row.dataset.eventId) : null,
        maLich: scheduleId,
        thuTrongTuan: Number(row.querySelector('.edit-stage-day').value),
        gioThucHien: `${row.querySelector('.edit-stage-time').value}:00`,
        hanhDong: action,
        mucSang: action === 'DIM' ? Number(brightness) : null
      };
    });
    const submit = event.currentTarget.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      await api.put(`/LichVanHanh/${scheduleId}`, {
        ...fullPayload(schedule, $('#editScheduleActive').checked),
        tenLich: $('#editScheduleName').value.trim(),
        ngayBatDau: startDate,
        ngayKetThuc: endDate
      });
      const existing = new Map(events.map((item) => [Number(value(item, 'MaChiTiet', 'maChiTiet')), item]));
      const retained = new Set(newEvents.filter((item) => item.id).map((item) => item.id));
      const operations = [
        ...newEvents.map((item) => item.id
            ? api.put(`/ChiTietLichVanHanh/${item.id}`, {
              maChiTiet: item.id,
              maLich: item.maLich,
              thuTrongTuan: item.thuTrongTuan,
              gioThucHien: item.gioThucHien,
              hanhDong: item.hanhDong,
              mucSang: item.mucSang
            })
            : api.post('/ChiTietLichVanHanh', {
              maLich: item.maLich,
              thuTrongTuan: item.thuTrongTuan,
              gioThucHien: item.gioThucHien,
              hanhDong: item.hanhDong,
              mucSang: item.mucSang
            })),
        ...[...existing.keys()].filter((id) => !retained.has(id))
          .map((id) => api.delete(`/ChiTietLichVanHanh/${id}`))
      ];
      const results = await Promise.allSettled(operations);
      const failed = results.filter((result) => result.status === 'rejected');
      if (failed.length) {
        toast(`Đã cập nhật thông tin lịch, nhưng ${failed.length} thao tác mốc lỗi: ${failed[0].reason.message}`, 'error');
      } else {
        toast('Đã lưu lịch và các mốc vận hành.');
      }
      setModal(modalEdit, false);
      await loadSchedule();
    } catch (error) {
      toast(`Không thể lưu thay đổi: ${error.message}`, 'error');
    } finally {
      submit.disabled = false;
    }
  });
  $('#btnPauseSchedule')?.addEventListener('click', async () => {
    if (!schedule) return;
    try {
      await api.put(`/LichVanHanh/${scheduleId}`, fullPayload(schedule, !Boolean(value(schedule, 'DangApDung', 'dangApDung'))));
      toast('Đã cập nhật trạng thái áp dụng lịch.');
      await loadSchedule();
    } catch (error) {
      toast(`Không thể đổi trạng thái lịch: ${error.message}`, 'error');
    }
  });
  $('#btnDuplicateSchedule')?.addEventListener('click', async () => {
    if (!schedule) return;
    try {
      const copy = await api.post('/LichVanHanh', { ...fullPayload(schedule, false), tenLich: `${value(schedule, 'TenLich', 'tenLich')} (bản sao)` });
      const newId = value(copy, 'MaLich', 'maLich');
      if (!newId) throw new Error('Máy chủ chưa trả về mã lịch mới.');
      const results = await Promise.allSettled(events.map((item) => api.post('/ChiTietLichVanHanh', {
        maLich: newId,
        thuTrongTuan: value(item, 'ThuTrongTuan', 'thuTrongTuan'),
        gioThucHien: value(item, 'GioThucHien', 'gioThucHien'),
        hanhDong: eventAction(item),
        mucSang: eventBrightness(item)
      })));
      const failed = results.find((result) => result.status === 'rejected');
      if (failed) throw new Error(`Đã tạo lịch #${newId}, nhưng không sao chép đủ mốc: ${failed.reason.message}`);
      toast(`Đã tạo bản sao lịch #${newId}.`);
      location.href = `schedule-detail.html?id=${encodeURIComponent(newId)}`;
    } catch (error) {
      toast(`Không thể nhân bản lịch: ${error.message}`, 'error');
    }
  });
  $('#btnSyncGatewayNow')?.addEventListener('click', () => toast('Backend hiện chưa cung cấp API đồng bộ Gateway.', 'error'));
  $('#btnRefreshLogs')?.addEventListener('click', loadLogs);
  $('#btnViewAllCabinets')?.addEventListener('click', () => setModal(modalCabinets, true));
  [$('#btnCloseCabinetsModal'), $('#btnDismissCabinetsModal')].forEach((button) => button?.addEventListener('click', () => setModal(modalCabinets, false)));
  const closeSidebar = () => $('#sidebar')?.classList.remove('open');
  $('#btnToggleMobileSidebar')?.addEventListener('click', () => $('#sidebar')?.classList.add('open'));
  $('#btnCloseSidebar')?.addEventListener('click', closeSidebar);
  $('#sidebarBackdrop')?.addEventListener('click', closeSidebar);
  const updateClock = () => {
    const now = new Date();
    const clock = $('#liveClockDisplay') || $('#liveTimeDetail');
    if (clock) clock.textContent = `${dayLabels[now.getDay()]}, ${now.toLocaleDateString('vi-VN')}`;
  };
  updateClock();
  setInterval(updateClock, 1000);

  loadSchedule().catch((error) => {
    document.title = 'Không tải được lịch vận hành - SmartLight';
    if ($('#scheduleLoadStatus')) $('#scheduleLoadStatus').lastChild.textContent = 'Không tải được dữ liệu';
    if ($('#scheduleHeading')) $('#scheduleHeading').textContent = `Không tải được lịch: ${error.message}`;
    if ($('#scheduleActiveBadge')) $('#scheduleActiveBadge').lastChild.textContent = 'Không xác định';
    if ($('#scheduleTimeRange')) $('#scheduleTimeRange').textContent = '—';
    if ($('#scheduleDimmingRange')) $('#scheduleDimmingRange').textContent = '—';
    if ($('#scheduleTarget')) $('#scheduleTarget').textContent = '—';
    if ($('#scheduleStageCount')) $('#scheduleStageCount').textContent = '0';
    if ($('#timelineStagesGrid')) $('#timelineStagesGrid').innerHTML = `<p class="col-span-full text-sm text-rose-600">Không tải được mốc: ${escapeHtml(error.message)}</p>`;
    if ($('#scheduleStagesTableBody')) $('#scheduleStagesTableBody').innerHTML = `<tr><td class="py-4 px-4 text-rose-600" colspan="7">Không tải được mốc: ${escapeHtml(error.message)}</td></tr>`;
    if ($('#executionLogs')) $('#executionLogs').textContent = 'Nhật ký không khả dụng khi chưa tải được lịch.';
    const detailCard = $('#scheduleHeading')?.closest('section');
    if (detailCard) [...detailCard.children].slice(1).forEach((child) => child.classList.add('hidden'));
    const quickSwitch = $('#quickScheduleSelect');
    if (quickSwitch) quickSwitch.innerHTML = '<option value="">Không tải được danh sách lịch</option>';
    toast(`Không tải được lịch vận hành: ${error.message}`, 'error');
  });
});
