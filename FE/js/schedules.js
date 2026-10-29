document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const value = (item, pascal, camel) => item?.[pascal] ?? item?.[camel] ?? '';
  const escapeHtml = (text) => String(text ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const showToast = (message, type = 'success') => {
    const container = $('#toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold bg-slate-900 text-white ${type === 'success' ? 'border-slate-800' : 'border-rose-800'}`;
    toast.textContent = message;
    container.append(toast);
    setTimeout(() => toast.remove(), 4000);
  };
  const modalCreate = $('#modalCreateSchedule');
  const tbody = $('#scheduleTableBody');
  if (tbody) tbody.innerHTML = '<tr><td class="py-6 px-4 text-center text-slate-500" colspan="9">Đang tải lịch vận hành...</td></tr>';
  $('#inlineDetailSection')?.classList.add('hidden');
  ['#metricTotal', '#metricActive', '#metricPaused', '#metricExpiring', '#tableTotalCount', '#tableShowingCount']
    .forEach((selector) => { if ($(selector)) $(selector).textContent = '—'; });
  let schedules = [];
  let scheduleDetails = [];
  let cabinets = [];
  let routes = [];
  let lights = [];

  const detailsFor = (id) => scheduleDetails.filter((detail) => Number(value(detail, 'MaLich', 'maLich')) === Number(id));
  const targetFor = (schedule) => {
    const target = value(schedule, 'MaTu', 'maTu') || value(schedule, 'MaTuyen', 'maTuyen') || value(schedule, 'MaDen', 'maDen');
    const collection = value(schedule, 'MaTu', 'maTu') ? cabinets
      : value(schedule, 'MaTuyen', 'maTuyen') ? routes : lights;
    const idKey = value(schedule, 'MaTu', 'maTu') ? 'MaTu'
      : value(schedule, 'MaTuyen', 'maTuyen') ? 'MaTuyen' : 'MaDen';
    const nameKey = value(schedule, 'MaTu', 'maTu') ? 'TenTu'
      : value(schedule, 'MaTuyen', 'maTuyen') ? 'TenTuyen' : 'TenDen';
    const found = collection.find((item) => String(value(item, idKey, idKey[0].toLowerCase() + idKey.slice(1))) === String(target));
    return found
      ? `${value(found, nameKey, nameKey[0].toLowerCase() + nameKey.slice(1))} (${target})`
      : target || 'Chưa gán thiết bị';
  };
  const typeFor = (schedule) => value(schedule, 'MaTu', 'maTu') ? 'Tủ chiếu sáng'
    : value(schedule, 'MaTuyen', 'maTuyen') ? 'Tuyến' : value(schedule, 'MaDen', 'maDen') ? 'Điểm đèn' : 'Chưa gán';
  const statusFor = (schedule) => {
    if (!Boolean(value(schedule, 'DangApDung', 'dangApDung'))) return 'Tạm dừng';
    const endDate = value(schedule, 'NgayKetThuc', 'ngayKetThuc');
    if (endDate) {
      const remainingDays = (new Date(`${String(endDate).slice(0, 10)}T00:00:00`) - new Date(new Date().toDateString())) / 86400000;
      if (remainingDays < 0) return 'Đã hết hiệu lực';
      if (remainingDays <= 7) return 'Sắp hết hiệu lực';
    }
    return 'Đang hoạt động';
  };
  const dateForDisplay = (date) => date ? new Date(`${String(date).slice(0, 10)}T00:00:00`).toLocaleDateString('vi-VN') : 'Không giới hạn';
  const eventSummary = (id) => {
    const events = detailsFor(id);
    if (!events.length) return 'Chưa cấu hình mốc';
    const times = events.map((event) => String(value(event, 'GioThucHien', 'gioThucHien')).slice(0, 5)).filter(Boolean);
    return times.length > 1 ? `${times[0]} - ${times[times.length - 1]}` : times[0] || 'Chưa cấu hình mốc';
  };
  const weekdaysSummary = (id) => {
    const names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const days = [...new Set(detailsFor(id).map((event) => Number(value(event, 'ThuTrongTuan', 'thuTrongTuan'))))]
      .filter((day) => day >= 1 && day <= 7).sort((a, b) => a - b);
    return days.length ? days.map((day) => names[day - 1]).join(', ') : 'Chưa cấu hình ngày';
  };
  const updateCount = () => {
    const visible = $$('#scheduleTableBody tr[data-id]').filter((row) => row.style.display !== 'none').length;
    const count = $('#tableTotalCount');
    const showing = $('#tableShowingCount');
    const activeCount = schedules.filter((item) => statusFor(item) === 'Đang hoạt động').length;
    const expiringCount = schedules.filter((item) => statusFor(item) === 'Sắp hết hiệu lực').length;
    if (count) count.textContent = String(schedules.length);
    if (showing) showing.textContent = schedules.length ? `1 - ${visible}` : '0';
    if ($('#metricTotal')) $('#metricTotal').textContent = String(schedules.length);
    if ($('#metricActive')) $('#metricActive').textContent = String(activeCount);
    if ($('#metricPaused')) $('#metricPaused').textContent = String(schedules.length - activeCount);
    if ($('#metricExpiring')) $('#metricExpiring').textContent = String(expiringCount);
  };
  const applyFilters = () => {
    const query = ($('#searchInput')?.value || '').trim().toLocaleLowerCase('vi');
    const area = $('#filterArea')?.value || 'all';
    const type = $('#filterType')?.value || 'all';
    const status = $('#filterStatus')?.value || 'all';
    $$('#scheduleTableBody tr[data-id]').forEach((row) => {
      const text = row.textContent.toLocaleLowerCase('vi');
      row.style.display = (!query || text.includes(query)) &&
        (area === 'all' || text.includes(area.toLocaleLowerCase('vi'))) &&
        (type === 'all' || row.dataset.type === type) &&
        (status === 'all' || row.dataset.status === status) ? '' : 'none';
    });
    updateCount();
  };
  const renderSchedules = () => {
    if (!tbody) return;
    $('#inlineDetailSection')?.classList.add('hidden');
    tbody.replaceChildren();
    if (!schedules.length) {
      const row = document.createElement('tr');
      row.innerHTML = '<td class="py-6 px-4 text-center text-slate-500" colspan="9">Chưa có lịch vận hành.</td>';
      tbody.append(row);
      updateCount();
      return;
    }
    schedules.forEach((schedule) => {
      const id = value(schedule, 'MaLich', 'maLich');
      const statusText = statusFor(schedule);
      const enabled = statusText === 'Đang hoạt động';
      const statusClass = enabled ? 'bg-emerald-50 text-emerald-700'
        : statusText === 'Tạm dừng' ? 'bg-amber-50 text-amber-700'
          : statusText === 'Sắp hết hiệu lực' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600';
      const row = document.createElement('tr');
      row.className = 'transition-colors cursor-pointer row-schedule';
      row.dataset.id = id;
      row.dataset.status = statusText;
      row.dataset.type = typeFor(schedule);
      row.innerHTML = `
        <td class="py-3.5 px-4 text-center"><input class="rounded border-slate-300 text-brand-600 w-4 h-4 cursor-pointer row-checkbox" type="checkbox" value="${escapeHtml(id)}" aria-label="Chọn lịch ${escapeHtml(id)}"></td>
        <td class="py-3.5 px-3 font-mono font-bold text-brand-600">#${escapeHtml(id)}</td>
        <td class="py-3.5 px-4 font-bold text-slate-900">${escapeHtml(value(schedule, 'TenLich', 'tenLich'))}</td>
        <td class="py-3.5 px-4 text-slate-700">${escapeHtml(targetFor(schedule))}</td>
        <td class="py-3.5 px-3">${escapeHtml(typeFor(schedule))}</td>
        <td class="py-3.5 px-3 text-center font-mono text-slate-600">${escapeHtml(eventSummary(id))}</td>
        <td class="py-3.5 px-3 text-slate-600">${escapeHtml(weekdaysSummary(id))}</td>
        <td class="py-3.5 px-4 text-center"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusClass}">${statusText}</span></td>
        <td class="py-3.5 px-4 text-center"><button type="button" class="p-1 text-brand-600 hover:text-brand-800 btn-view-detail" data-id="${escapeHtml(id)}" aria-label="Xem chi tiết lịch ${escapeHtml(id)}">Chi tiết</button></td>`;
      tbody.append(row);
    });
    applyFilters();
    updateBatchBar();
  };
  const updateBatchBar = () => {
    const checked = $$('#scheduleTableBody .row-checkbox:checked');
    const bar = $('#batchActionBar');
    const count = $('#selectedCount');
    if (bar) bar.classList.toggle('hidden', checked.length === 0);
    if (count) count.textContent = String(checked.length);
  };
  const setModal = (modal, visible) => {
    if (!modal) return;
    modal.classList.toggle('hidden', !visible);
    modal.classList.toggle('flex', visible);
  };
  const targetType = $('#newScheduleType');
  const targetSelect = $('#newScheduleTarget');
  const fillTargets = () => {
    if (!targetSelect) return;
    const items = targetType?.value === 'route' ? routes : targetType?.value === 'light' ? lights : cabinets;
    const idKey = targetType?.value === 'route' ? 'MaTuyen' : targetType?.value === 'light' ? 'MaDen' : 'MaTu';
    const nameKey = targetType?.value === 'route' ? 'TenTuyen' : targetType?.value === 'light' ? 'TenDen' : 'TenTu';
    targetSelect.replaceChildren(new Option('Chọn đối tượng áp dụng', ''));
    items.forEach((item) => {
      const id = value(item, idKey, idKey[0].toLowerCase() + idKey.slice(1));
      const name = value(item, nameKey, nameKey[0].toLowerCase() + nameKey.slice(1));
      targetSelect.add(new Option(`${name} (${id})`, id));
    });
  };
  const schedulePayload = (schedule, active = value(schedule, 'DangApDung', 'dangApDung')) => ({
    tenLich: value(schedule, 'TenLich', 'tenLich'),
    ngayBatDau: String(value(schedule, 'NgayBatDau', 'ngayBatDau')).slice(0, 10),
    ngayKetThuc: value(schedule, 'NgayKetThuc', 'ngayKetThuc') || null,
    dangApDung: Boolean(active),
    maTu: value(schedule, 'MaTu', 'maTu') || null,
    maTuyen: value(schedule, 'MaTuyen', 'maTuyen') || null,
    maDen: value(schedule, 'MaDen', 'maDen') || null,
    maNguoiTao: value(schedule, 'MaNguoiTao', 'maNguoiTao') || null
  });
  const updateOne = async (schedule, active) => {
    await api.put(`/LichVanHanh/${value(schedule, 'MaLich', 'maLich')}`, schedulePayload(schedule, active));
  };

  $('#btnCreateSchedule')?.addEventListener('click', () => {
    const startDate = $('#newScheduleStartDate');
    if (startDate && !startDate.value) {
      const now = new Date();
      startDate.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }
    setModal(modalCreate, true);
  });
  targetType?.addEventListener('change', fillTargets);
  [$('#btnCloseCreateModal'), $('#btnCancelCreateModal')].forEach((button) => button?.addEventListener('click', () => setModal(modalCreate, false)));
  $('#formCreateSchedule')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const selectedTarget = targetSelect?.value;
    const selectedDays = $$('.schedule-weekday:checked').map((checkbox) => Number(checkbox.value));
    if (!selectedTarget || selectedDays.length === 0) {
      showToast('Chọn thiết bị áp dụng và ít nhất một ngày trong tuần.', 'error');
      return;
    }
    const startDate = $('#newScheduleStartDate')?.value;
    const endDate = $('#newScheduleEndDate')?.value || null;
    if (endDate && endDate < startDate) {
      showToast('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.', 'error');
      return;
    }
    const newSchedule = {
      tenLich: $('#newScheduleName').value.trim(),
      ngayBatDau: startDate,
      ngayKetThuc: endDate,
      dangApDung: $('#newScheduleActive')?.checked ?? true,
      maTu: targetType.value === 'cabinet' ? selectedTarget : null,
      maTuyen: targetType.value === 'route' ? selectedTarget : null,
      maDen: targetType.value === 'light' ? selectedTarget : null
    };
    const saveButton = form.querySelector('[type="submit"]');
    saveButton.disabled = true;
    try {
      const created = await api.post('/LichVanHanh', newSchedule);
      const scheduleId = value(created, 'MaLich', 'maLich');
      if (!scheduleId) throw new Error('Lịch đã gửi nhưng máy chủ không trả về mã lịch; chưa thể lưu các mốc bật/tắt.');
      const startTime = $('#newScheduleStart').value;
      const endTime = $('#newScheduleEnd').value;
      const events = selectedDays.flatMap((day) => [
        { maLich: scheduleId, thuTrongTuan: day, gioThucHien: `${startTime}:00`, hanhDong: 'BAT', mucSang: null },
        { maLich: scheduleId, thuTrongTuan: day, gioThucHien: `${endTime}:00`, hanhDong: 'TAT', mucSang: null }
      ]);
      const results = await Promise.allSettled(events.map((detail) => api.post('/ChiTietLichVanHanh', detail)));
      const failed = results.filter((result) => result.status === 'rejected');
      if (failed.length) {
        showToast(`Đã tạo lịch #${scheduleId}, nhưng ${failed.length}/${events.length} mốc chưa lưu: ${failed[0].reason.message}`, 'error');
      } else {
        showToast(`Đã tạo lịch #${scheduleId} và lưu ${events.length} mốc bật/tắt.`);
      }
      setModal(modalCreate, false);
      form.reset();
      await loadData();
    } catch (error) {
      showToast(`Không thể tạo lịch: ${error.message}`, 'error');
    } finally {
      saveButton.disabled = false;
    }
  });

  const search = $('#searchInput');
  [search, $('#filterArea'), $('#filterType'), $('#filterStatus')].forEach((element) => {
    element?.addEventListener(element === search ? 'input' : 'change', applyFilters);
  });
  tbody?.addEventListener('click', (event) => {
    const row = event.target.closest('tr[data-id]');
    if (!row || event.target.closest('input[type="checkbox"]')) return;
    location.href = `schedule-detail.html?id=${encodeURIComponent(row.dataset.id)}`;
  });
  tbody?.addEventListener('change', (event) => {
    if (event.target.matches('.row-checkbox')) updateBatchBar();
  });
  $('#selectAllCheckbox')?.addEventListener('change', (event) => {
    $$('#scheduleTableBody .row-checkbox').forEach((checkbox) => { checkbox.checked = event.target.checked; });
    updateBatchBar();
  });
  $('#btnBatchDeselect')?.addEventListener('click', () => {
    $$('#scheduleTableBody .row-checkbox').forEach((checkbox) => { checkbox.checked = false; });
    if ($('#selectAllCheckbox')) $('#selectAllCheckbox').checked = false;
    updateBatchBar();
  });
  $('#btnBatchActivate')?.addEventListener('click', async () => {
    await updateSelected(true);
  });
  $('#btnBatchPause')?.addEventListener('click', async () => {
    await updateSelected(false);
  });
  const updateSelected = async (active) => {
    const selectedIds = new Set($$('#scheduleTableBody .row-checkbox:checked').map((checkbox) => Number(checkbox.value)));
    const selected = schedules.filter((item) => selectedIds.has(Number(value(item, 'MaLich', 'maLich'))));
    if (!selected.length) return;
    const results = await Promise.allSettled(selected.map((item) => updateOne(item, active)));
    const failed = results.filter((result) => result.status === 'rejected');
    if (failed.length) showToast(`${selected.length - failed.length}/${selected.length} lịch đã cập nhật; lỗi: ${failed[0].reason.message}`, 'error');
    else showToast(`Đã ${active ? 'kích hoạt' : 'tạm dừng'} ${selected.length} lịch.`);
    await loadData();
  };
  $('#btnBatchDelete')?.addEventListener('click', async () => {
    const ids = $$('#scheduleTableBody .row-checkbox:checked').map((checkbox) => checkbox.value);
    if (!ids.length || !confirm(`Bạn có chắc muốn xóa ${ids.length} lịch đã chọn?`)) return;
    const results = await Promise.allSettled(ids.map((id) => api.delete(`/LichVanHanh/${encodeURIComponent(id)}`)));
    const failed = results.filter((result) => result.status === 'rejected');
    if (failed.length) showToast(`Xóa thành công ${ids.length - failed.length}/${ids.length}; lỗi: ${failed[0].reason.message}`, 'error');
    else showToast(`Đã xóa ${ids.length} lịch.`);
    await loadData();
  });

  $('#btnImportSchedule')?.addEventListener('click', () => showToast('Chức năng nhập tệp chưa được hỗ trợ.', 'error'));
  $('#btnCloseImportModal')?.addEventListener('click', () => setModal($('#modalImportSchedule'), false));
  $('#btnCancelImportModal')?.addEventListener('click', () => setModal($('#modalImportSchedule'), false));
  $('#btnConfirmImport')?.addEventListener('click', () => showToast('Chức năng nhập tệp chưa được hỗ trợ.', 'error'));

  async function loadData() {
    try {
      const data = await Promise.all([
        api.get('/LichVanHanh'),
        api.get('/ChiTietLichVanHanh'),
        api.get('/TuChieuSang'),
        api.get('/TuyenChieuSang'),
        api.get('/DiemDen')
      ]);
      if (!data.every(Array.isArray)) throw new Error('Backend trả về dữ liệu không đúng định dạng.');
      [schedules, scheduleDetails, cabinets, routes, lights] = data;
      renderSchedules();
      fillTargets();
    } catch (error) {
      ['#metricTotal', '#metricActive', '#metricPaused', '#metricExpiring', '#tableTotalCount', '#tableShowingCount']
        .forEach((selector) => { if ($(selector)) $(selector).textContent = '—'; });
      if (tbody) tbody.innerHTML = `<tr><td class="py-6 px-4 text-center text-rose-600" colspan="9">Không tải được lịch vận hành: ${escapeHtml(error.message)}</td></tr>`;
      showToast(`Không tải được dữ liệu lịch: ${error.message}`, 'error');
    }
  }

  const sidebar = $('#sidebar');
  $('#btnToggleMobileSidebar')?.addEventListener('click', () => sidebar?.classList.add('open'));
  $('#btnCloseSidebar')?.addEventListener('click', () => sidebar?.classList.remove('open'));
  $('#sidebarBackdrop')?.addEventListener('click', () => sidebar?.classList.remove('open'));
  loadData();
});
