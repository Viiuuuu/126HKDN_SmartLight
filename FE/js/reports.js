document.addEventListener('DOMContentLoaded', () => {
  const chart = document.getElementById('energyChart');
  const rowsElement = document.getElementById('reportRows');
  const paginationElement = document.getElementById('reportPagination');
  const pageSize = 4;
  let currentPage = 1;
  let period = '7';
  let searchQuery = '';
  let useBackend = false;
  let areaOptions = [];
  let chartSeries = [
    { nhan: '12/12', thucTe: 154, keHoach: 112 }, { nhan: '13/12', thucTe: 162, keHoach: 119 },
    { nhan: '14/12', thucTe: 168, keHoach: 121 }, { nhan: '15/12', thucTe: 165, keHoach: 124 },
    { nhan: '16/12', thucTe: 151, keHoach: 116 }, { nhan: '17/12', thucTe: 173, keHoach: 135 },
    { nhan: '18/12', thucTe: 158, keHoach: 112 }
  ];
  const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const fmtNumber = (value, digits = 0) => Number(value || 0).toLocaleString('vi-VN', { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const baseReports = [
    { name: 'Báo cáo tổng hợp vận hành', type: 'Tổng hợp vận hành', period: 'Tháng 12/2024', date: '2024-12-18', created: '18/12/2024 14:20', creator: 'Nguyễn Văn Minh', format: 'PDF', status: 'Sẵn sàng', area: 'Ba Đình' },
    { name: 'Báo cáo tiêu thụ điện năng', type: 'Tiêu thụ điện năng', period: 'Tháng 12/2024', date: '2024-12-18', created: '18/12/2024 10:35', creator: 'Trần Thị Lan', format: 'XLSX', status: 'Sẵn sàng', area: 'Hoàn Kiếm' },
    { name: 'Báo cáo sự cố thiết bị', type: 'Sự cố thiết bị', period: 'Tuần 16/12 – 22/12', date: '2024-12-17', created: '17/12/2024 16:10', creator: 'Nguyễn Văn Minh', format: 'PDF', status: 'Sẵn sàng', area: 'Đống Đa' },
    { name: 'Báo cáo phân bổ sự cố theo khu vực', type: 'Phân bổ khu vực', period: 'Quý IV/2024', date: '2024-12-15', created: '15/12/2024 09:25', creator: 'Lê Văn Hùng', format: 'XLSX', status: 'Đang tạo', area: 'Cầu Giấy' }
  ];
  const reports = Array.from({ length: 128 }, (_, index) => {
    const template = baseReports[index % baseReports.length];
    const daysAgo = Math.floor(index / baseReports.length) % 7;
    const date = new Date(Date.UTC(2024, 11, 18 - daysAgo));
    const dateString = date.toISOString().slice(0, 10);
    return {
      ...template,
      id: index + 1,
      date: dateString,
      period: index % 4 === 3 ? 'Quý IV/2024' : index % 4 === 2 ? 'Tuần 16/12 – 22/12' : 'Tháng 12/2024',
      created: `${String(date.getUTCDate()).padStart(2, '0')}/12/2024 ${template.created.slice(-5)}`,
      status: index % 17 === 3 ? 'Đang tạo' : 'Sẵn sàng'
    };
  });
  const generatedReports = [];
  let activeReports = [...generatedReports, ...reports];

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'report-toast';
    toast.textContent = message;
    document.getElementById('toastContainer').appendChild(toast);
    window.setTimeout(() => toast.remove(), 2800);
  }

  function getFilteredReports() {
    const type = document.getElementById('reportType').value;
    const area = document.getElementById('reportArea').value;
    const start = document.getElementById('dateFrom').value;
    const end = document.getElementById('dateTo').value;
    const query = searchQuery.toLocaleLowerCase('vi-VN');
    return activeReports.filter(report =>
      (!type || report.type === type) &&
      (!area || (useBackend ? report.areaCode === area : report.area === area)) &&
      (useBackend || !start || report.date >= start) &&
      (useBackend || !end || report.date <= end) &&
      (!query || `${report.name} ${report.type} ${report.area} ${report.creator}`.toLocaleLowerCase('vi-VN').includes(query))
    );
  }

  function makePageButton(label, page, { active = false, disabled = false, ariaLabel = label } = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.disabled = disabled;
    button.setAttribute('aria-label', ariaLabel);
    if (active) {
      button.classList.add('active');
      button.setAttribute('aria-current', 'page');
    }
    button.addEventListener('click', () => {
      currentPage = page;
      renderReports();
    });
    paginationElement.appendChild(button);
  }

  function renderPagination(totalPages) {
    paginationElement.replaceChildren();
    makePageButton('‹', Math.max(1, currentPage - 1), { disabled: currentPage === 1, ariaLabel: 'Trang trước' });
    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    let previous = 0;
    [...pages].filter(page => page >= 1 && page <= totalPages).sort((a, b) => a - b).forEach(page => {
      if (previous && page - previous > 1) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '…';
        paginationElement.appendChild(ellipsis);
      }
      makePageButton(String(page), page, { active: page === currentPage, ariaLabel: `Trang ${page}` });
      previous = page;
    });
    makePageButton('›', Math.min(totalPages, currentPage + 1), { disabled: currentPage === totalPages, ariaLabel: 'Trang sau' });
  }

  function renderReports() {
    const filtered = getFilteredReports();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const pageReports = filtered.slice(startIndex, startIndex + pageSize);
    rowsElement.replaceChildren();

    if (!pageReports.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 7;
      cell.className = 'empty-reports';
      cell.textContent = 'Không tìm thấy báo cáo phù hợp với bộ lọc.';
      row.appendChild(cell);
      rowsElement.appendChild(row);
    } else {
      pageReports.forEach(report => {
        const row = document.createElement('tr');
        const values = [report.name, report.period, report.created, report.creator];
        values.forEach(value => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.appendChild(cell);
        });

        const formatCell = document.createElement('td');
        const format = document.createElement('span');
        format.className = `format-badge${report.format === 'XLSX' ? ' xlsx' : ''}`;
        format.textContent = report.format;
        formatCell.appendChild(format);
        row.appendChild(formatCell);

        const statusCell = document.createElement('td');
        const status = document.createElement('span');
        status.className = `report-status${report.status === 'Đang tạo' ? ' pending' : ''}`;
        status.textContent = report.status;
        statusCell.appendChild(status);
        row.appendChild(statusCell);

        const actionCell = document.createElement('td');
        const download = document.createElement('button');
        download.className = 'table-download';
        download.type = 'button';
        download.setAttribute('aria-label', `Tải ${report.name}`);
        download.innerHTML = `<span class="material-symbols-outlined">${report.status === 'Đang tạo' ? 'hourglass_empty' : 'download'}</span>`;
        download.disabled = report.status !== 'Sẵn sàng';
        download.addEventListener('click', () => downloadReport(report));
        actionCell.appendChild(download);
        row.appendChild(actionCell);
        rowsElement.appendChild(row);
      });
    }

    const first = filtered.length ? startIndex + 1 : 0;
    const last = Math.min(startIndex + pageSize, filtered.length);
    document.getElementById('reportRange').textContent = `${first} - ${last} trên ${filtered.length} báo cáo`;
    renderPagination(totalPages);
  }

  function renderChart() {
    const series = chartSeries.length ? chartSeries : [{ nhan: '--', thucTe: 0, keHoach: 0 }];
    const labels = series.map(item => item.nhan);
    const actual = series.map(item => Number(item.thucTe) || 0);
    const planned = series.map(item => Number(item.keHoach) || 0);
    const rawMax = Math.max(...actual, ...planned, 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
    const maxValue = Math.ceil(rawMax / magnitude * 1.1 / 0.5) * 0.5 * magnitude;
    const count = series.length;
    const x = index => count === 1 ? 300 : 58 + index * (482 / (count - 1));
    const y = value => 190 - (value / maxValue) * 156;
    const fmtAxis = value => value >= 1000 ? `${(value / 1000).toFixed(value % 1000 ? 1 : 0)}k` : String(Math.round(value));
    const toPoints = values => values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
    const areaPoints = `${x(0)},190 ${toPoints(actual)} ${x(count - 1)},190`;
    const labelStep = Math.max(1, Math.ceil(count / 8));
    chart.innerHTML = `
      <defs><linearGradient id="energyFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#6e8dcb" stop-opacity=".30"/><stop offset="100%" stop-color="#6e8dcb" stop-opacity=".02"/></linearGradient></defs>
      ${[0, 1, 2, 3].map(step => { const value = maxValue * step / 3; const lineY = y(value); return `<line class="chart-grid-line" x1="48" y1="${lineY}" x2="540" y2="${lineY}"/><text class="chart-axis-label" x="7" y="${lineY + 3}">${fmtAxis(value)}</text>`; }).join('')}
      <polygon class="chart-fill" points="${areaPoints}"/>
      <polyline class="chart-plan-line" points="${toPoints(planned)}"/>
      <polyline class="chart-actual-line" points="${toPoints(actual)}"/>
      ${actual.map((value, index) => `<circle class="chart-actual-point" cx="${x(index)}" cy="${y(value)}" r="3"/>`).join('')}
      ${labels.map((label, index) => index % labelStep === 0 ? `<text class="chart-axis-label" text-anchor="middle" x="${x(index)}" y="211">${label}</text>` : '').join('')}
    `;
    chart.setAttribute('aria-label', `Biểu đồ sản lượng điện theo khoảng ${period === '7' ? '7 ngày' : period === '30' ? '30 ngày' : period === 'quarter' ? 'quý này' : 'năm nay'}`);
  }

  async function downloadReport(report) {
    if (report.status !== 'Sẵn sàng') {
      showToast('Báo cáo đang được tạo, vui lòng thử lại sau.');
      return;
    }
    if (useBackend && typeof buildApiUrl === 'function') {
      try {
        const params = { loai: report.type, tuNgay: report.fromDate, denNgay: report.toDate, maKhuVuc: report.areaCode };
        const response = await fetch(buildApiUrl('/BaoCao/xuat', params), { headers: getAuthHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const url = URL.createObjectURL(await response.blob());
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.name.replace(/[\\/:*?"<>|]/g, '-')}.csv`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast(`Đã tải báo cáo "${report.name}".`);
      } catch (error) {
        showToast('Không tải được báo cáo từ máy chủ.');
      }
      return;
    }
    const content = [
      ['Tên báo cáo', 'Kỳ dữ liệu', 'Thời gian tạo', 'Người tạo', 'Định dạng', 'Khu vực'],
      [report.name, report.period, report.created, report.creator, report.format, report.area]
    ].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.replace(/[\\/:*?"<>|]/g, '-')}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Đã tải báo cáo "${report.name}".`);
  }

  function exportReports() {
    const filtered = getFilteredReports();
    if (!filtered.length) {
      showToast('Không có báo cáo phù hợp để xuất.');
      return;
    }
    const headers = ['Tên báo cáo', 'Kỳ dữ liệu', 'Thời gian tạo', 'Người tạo', 'Định dạng', 'Trạng thái', 'Khu vực'];
    const csv = [headers, ...filtered.map(({ name, period: reportPeriod, created, creator, format, status, area }) =>
      [name, reportPeriod, created, creator, format, status, area]
    )].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bao-cao-thong-ke-smartlight.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Đã xuất ${filtered.length} báo cáo ra tệp CSV.`);
  }

  const dialog = document.getElementById('createReportDialog');
  document.getElementById('btnCreateReport').addEventListener('click', () => dialog.showModal());
  document.getElementById('btnCloseCreateDialog').addEventListener('click', () => dialog.close());
  document.getElementById('btnCancelCreateDialog').addEventListener('click', () => dialog.close());
  document.getElementById('createReportForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (useBackend) {
      try {
        const areaSelect = document.getElementById('newReportArea');
        await window.api.post('/BaoCao/tao-bao-cao', {
          ten: document.getElementById('newReportName').value.trim(),
          loai: document.getElementById('newReportType').value,
          dinhDang: document.getElementById('newReportFormat').value,
          maKhuVuc: areaSelect.value === 'Toàn thành phố' ? null : areaSelect.value,
          tuNgay: document.getElementById('dateFrom').value || null,
          denNgay: document.getElementById('dateTo').value || null
        });
        event.target.reset();
        dialog.close();
        currentPage = 1;
        await loadReportList();
        await loadOverview();
        showToast('Đã tạo báo cáo mới.');
      } catch (error) {
        showToast(error?.message || 'Không thể tạo báo cáo.');
      }
      return;
    }
    const now = new Date();
    const created = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(now);
    const report = {
      id: `new-${Date.now()}`,
      name: document.getElementById('newReportName').value.trim(),
      type: document.getElementById('newReportType').value,
      period: 'Tùy chỉnh',
      date: new Date().toISOString().slice(0, 10),
      created,
      creator: (document.querySelector('.user-profile-btn .user-name')?.textContent || 'Người dùng').trim(),
      format: document.getElementById('newReportFormat').value,
      status: 'Sẵn sàng',
      area: document.getElementById('newReportArea').value
    };
    generatedReports.unshift(report);
    activeReports = [...generatedReports, ...reports];
    document.getElementById('reportType').value = '';
    document.getElementById('reportArea').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('topSearchInput').value = '';
    searchQuery = '';
    currentPage = 1;
    event.target.reset();
    dialog.close();
    renderReports();
    showToast('Đã tạo báo cáo mới.');
  });
  document.getElementById('btnExportReports').addEventListener('click', exportReports);
  document.getElementById('btnApplyFilters').addEventListener('click', () => {
    currentPage = 1;
    renderReports();
    if (useBackend) loadOverview();
  });
  ['reportType', 'reportArea', 'dateFrom', 'dateTo'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      currentPage = 1;
      renderReports();
    });
  });
  document.querySelectorAll('.period-buttons button').forEach(button => {
    button.addEventListener('click', () => {
      period = button.dataset.period;
      document.querySelectorAll('.period-buttons button').forEach(item => item.classList.toggle('selected', item === button));
      const end = new Date();
      const start = new Date(end);
      if (period === '7' || period === '30') start.setDate(end.getDate() - (Number(period) - 1));
      else if (period === 'quarter') start.setMonth(Math.floor(end.getMonth() / 3) * 3, 1);
      else start.setMonth(0, 1);
      document.getElementById('dateFrom').value = isoDate(start);
      document.getElementById('dateTo').value = isoDate(end);
      currentPage = 1;
      if (useBackend) { loadOverview(); loadReportList(); } else { renderChart(); renderReports(); }
    });
  });
  document.getElementById('btnViewAllReports').addEventListener('click', () => {
    document.getElementById('reportType').value = '';
    document.getElementById('reportArea').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('topSearchInput').value = '';
    searchQuery = '';
    currentPage = 1;
    renderReports();
  });
  document.getElementById('topSearchInput').addEventListener('input', event => {
    searchQuery = event.target.value.trim();
    currentPage = 1;
    renderReports();
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      document.getElementById('topSearchInput').focus();
    }
  });

  const clockElement = document.getElementById('liveClockDisplay');
  const daysOfWeekReports = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const updateClock = () => {
    const now = new Date();
    const dayName = daysOfWeekReports[now.getDay()];
    const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    if (clockElement) clockElement.textContent = `${dayName}, ${dateStr}`;
  };
  updateClock();
  window.setInterval(updateClock, 1000);

  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const toggleMenu = () => {
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('visible', sidebar.classList.contains('open'));
  };
  document.getElementById('btnToggleMobileSidebar').addEventListener('click', toggleMenu);
  document.getElementById('btnCloseSidebar').addEventListener('click', event => {
    event.preventDefault();
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
  });
  backdrop.addEventListener('click', () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
  });

  // ===================== Kết nối API BaoCao =====================
  const periodLabel = { '7': '7 ngày', '30': '30 ngày', quarter: 'quý này', year: 'năm nay' };
  const trendText = (item, invert = false) => {
    if (!item || item.phanTram === null || item.phanTram === undefined) return '— so với kỳ trước';
    const sign = item.phanTram > 0 ? '+' : '';
    return `${item.phanTram > 0 ? '↗' : item.phanTram < 0 ? '↘' : '→'} ${sign}${fmtNumber(item.phanTram, 1)}% kỳ trước`;
  };
  function setTrend(strongId, item, goodWhenUp = true) {
    const small = document.getElementById(strongId)?.closest('div')?.querySelector('.metric-trend');
    if (!small) return;
    small.textContent = trendText(item);
    const up = item && item.phanTram > 0;
    const good = item && item.phanTram !== null ? (goodWhenUp ? up || item.phanTram === 0 : !up) : true;
    small.classList.toggle('positive', good);
    small.classList.toggle('negative', !good);
  }

  function renderOverview(data) {
    const cs = data.chiSo;
    document.getElementById('metricReports').textContent = fmtNumber(cs.soBaoCao.giaTri);
    document.getElementById('metricEnergy').textContent = fmtNumber(cs.dienNangTieuThu.giaTri, 1);
    document.getElementById('metricOnline').textContent = `${fmtNumber(cs.tyLeHoatDong.giaTri, 1)}%`;
    document.getElementById('metricIncidents').textContent = fmtNumber(cs.suCo.giaTri);
    setTrend('metricReports', cs.soBaoCao);
    setTrend('metricEnergy', cs.dienNangTieuThu, false);
    setTrend('metricOnline', cs.tyLeHoatDong);
    setTrend('metricIncidents', cs.suCo, false);

    chartSeries = data.bieuDo || [];
    renderChart();

    const st = data.tinhTrangThietBi;
    document.getElementById('deviceTotal').textContent = fmtNumber(st.tong);
    const pct = value => (st.tong ? value * 100 / st.tong : 0);
    const a = pct(st.binhThuong), b = a + pct(st.suCo), c = b + pct(st.matTinHieu);
    const donut = document.getElementById('deviceDonut');
    if (st.tong) {
      donut.style.background = `conic-gradient(#223f8d 0 ${a}%,#e7bfae ${a}% ${b}%,#a3b9ec ${b}% ${c}%,#d8e3ff ${c}% 100%)`;
    } else {
      donut.style.background = '#edf0f7';
    }
    donut.querySelector('strong').textContent = `${fmtNumber(st.tyLeHoatDong, 1)}%`;
    donut.setAttribute('aria-label', `${fmtNumber(st.tyLeHoatDong, 1)}% thiết bị hoạt động bình thường`);
    const legend = document.querySelectorAll('.status-legend > div strong');
    [st.binhThuong, st.suCo, st.matTinHieu, st.baoTri].forEach((value, index) => { if (legend[index]) legend[index].textContent = fmtNumber(value); });

    const summary = document.querySelector('.district-summary');
    summary.querySelectorAll('.district-row').forEach(row => row.remove());
    const rows = data.suCoTheoKhuVuc || [];
    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'district-row';
      empty.innerHTML = '<span>Không có sự cố trong kỳ</span><strong>0 ca</strong>';
      summary.appendChild(empty);
    }
    rows.forEach(item => {
      const row = document.createElement('div');
      row.className = 'district-row';
      const name = document.createElement('span');
      name.textContent = item.tenKhuVuc;
      const count = document.createElement('strong');
      count.textContent = `${item.soCa} ca`;
      const bar = document.createElement('i');
      const fill = document.createElement('b');
      fill.style.width = `${Math.max(item.tyLe, 6)}%`;
      bar.appendChild(fill);
      row.append(name, count, bar);
      summary.appendChild(row);
    });
  }

  function currentApiRange() {
    return {
      tuNgay: document.getElementById('dateFrom').value || null,
      denNgay: document.getElementById('dateTo').value || null,
      maKhuVuc: document.getElementById('reportArea').value || null
    };
  }

  async function loadOverview() {
    const data = await window.api.get('/BaoCao/tong-quan', currentApiRange());
    renderOverview(data);
  }

  async function loadReportList() {
    const data = await window.api.get('/BaoCao/danh-sach', { pageSize: 100 });
    const fmt = value => {
      const d = new Date(value);
      const pad = n => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    activeReports = (data.danhSach || []).map(item => ({
      id: item.id,
      name: item.ten,
      type: item.loai,
      period: item.kyDuLieu,
      date: isoDate(new Date(item.thoiGianTao)),
      created: fmt(item.thoiGianTao),
      creator: item.nguoiTao,
      format: item.dinhDang,
      status: item.trangThai,
      area: item.khuVuc,
      areaCode: item.maKhuVuc,
      fromDate: item.tuNgay,
      toDate: item.denNgay
    }));
    renderReports();
  }

  async function loadAreaOptions() {
    const list = await window.api.get('/KhuVuc');
    areaOptions = Array.isArray(list) ? list : [];
    const fill = (select, allLabel) => {
      select.replaceChildren(new Option(allLabel, allLabel === 'Toàn thành phố' && select.id === 'newReportArea' ? 'Toàn thành phố' : ''));
      areaOptions.forEach(area => select.appendChild(new Option(area.tenPhuongXa, String(area.maKhuVuc).trim())));
    };
    fill(document.getElementById('reportArea'), 'Toàn thành phố');
    fill(document.getElementById('newReportArea'), 'Toàn thành phố');
  }

  async function initBackend() {
    if (!window.api || typeof window.api.get !== 'function') return;
    try {
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - 6);
      document.getElementById('dateFrom').value = isoDate(from);
      document.getElementById('dateTo').value = isoDate(today);
      await loadAreaOptions();
      await loadOverview();
      useBackend = true;
      document.getElementById('reportArea').addEventListener('change', () => loadOverview());
      ['dateFrom', 'dateTo'].forEach(id => document.getElementById(id).addEventListener('change', () => loadOverview()));
      document.querySelector('.report-demo-note')?.remove();
      await loadReportList();
    } catch (error) {
      useBackend = false;
      console.warn('[Báo cáo] Chưa kết nối được API BaoCao, hiển thị dữ liệu mẫu.', error);
    }
  }

  renderChart();
  renderReports();
  initBackend();
});
