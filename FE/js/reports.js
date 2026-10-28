document.addEventListener('DOMContentLoaded', () => {
  const chart = document.getElementById('energyChart');
  const rowsElement = document.getElementById('reportRows');
  const paginationElement = document.getElementById('reportPagination');
  const pageSize = 4;
  let currentPage = 1;
  let period = '7';
  let searchQuery = '';

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
      (!area || report.area === area) &&
      (!start || report.date >= start) &&
      (!end || report.date <= end) &&
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
    const labels = period === '7'
      ? ['12/12', '13/12', '14/12', '15/12', '16/12', '17/12', '18/12']
      : period === '30'
        ? ['19/11', '24/11', '29/11', '04/12', '09/12', '14/12', '18/12']
        : period === 'quarter'
          ? ['T.10', '15/10', 'T.11', '15/11', 'T.12', '15/12', '18/12']
          : ['T.1', 'T.3', 'T.5', 'T.7', 'T.9', 'T.11', 'T.12'];
    const actual = [154, 162, 168, 165, 151, 173, 158];
    const planned = [112, 119, 121, 124, 116, 135, 112];
    const x = index => 58 + index * 77;
    const y = value => 190 - value * 0.72;
    const toPoints = values => values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
    const areaPoints = `58,190 ${toPoints(actual)} ${x(actual.length - 1)},190`;
    chart.innerHTML = `
      <defs><linearGradient id="energyFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#6e8dcb" stop-opacity=".30"/><stop offset="100%" stop-color="#6e8dcb" stop-opacity=".02"/></linearGradient></defs>
      ${[34, 84, 134, 184].map((lineY, index) => `<line class="chart-grid-line" x1="48" y1="${lineY}" x2="540" y2="${lineY}"/><text class="chart-axis-label" x="7" y="${lineY + 3}">${['40k', '30k', '20k', '10k'][index]}</text>`).join('')}
      <polygon class="chart-fill" points="${areaPoints}"/>
      <polyline class="chart-plan-line" points="${toPoints(planned)}"/>
      <polyline class="chart-actual-line" points="${toPoints(actual)}"/>
      ${actual.map((value, index) => `<circle class="chart-actual-point" cx="${x(index)}" cy="${y(value)}" r="3"/>`).join('')}
      ${labels.map((label, index) => `<text class="chart-axis-label" text-anchor="middle" x="${x(index)}" y="211">${label}</text>`).join('')}
    `;
    chart.setAttribute('aria-label', `Biểu đồ sản lượng điện theo khoảng ${period === '7' ? '7 ngày' : period === '30' ? '30 ngày' : period === 'quarter' ? 'quý này' : 'năm nay'}`);
  }

  function downloadReport(report) {
    if (report.status !== 'Sẵn sàng') {
      showToast('Báo cáo đang được tạo, vui lòng thử lại sau.');
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
  document.getElementById('createReportForm').addEventListener('submit', event => {
    event.preventDefault();
    const now = new Date();
    const created = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(now);
    const report = {
      id: `new-${Date.now()}`,
      name: document.getElementById('newReportName').value.trim(),
      type: document.getElementById('newReportType').value,
      period: 'Tùy chỉnh',
      date: new Date().toISOString().slice(0, 10),
      created,
      creator: document.getElementById('userName').childNodes[0].textContent.trim(),
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
    document.getElementById('globalSearch').value = '';
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
      const end = new Date(Date.UTC(2024, 11, 18));
      const start = new Date(end);
      if (period === '7' || period === '30') start.setUTCDate(end.getUTCDate() - (Number(period) - 1));
      else if (period === 'quarter') start.setUTCMonth(9, 1);
      else start.setUTCMonth(0, 1);
      document.getElementById('dateFrom').value = start.toISOString().slice(0, 10);
      document.getElementById('dateTo').value = end.toISOString().slice(0, 10);
      currentPage = 1;
      renderChart();
      renderReports();
    });
  });
  document.getElementById('btnViewAllReports').addEventListener('click', () => {
    document.getElementById('reportType').value = '';
    document.getElementById('reportArea').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('globalSearch').value = '';
    searchQuery = '';
    currentPage = 1;
    renderReports();
  });
  document.getElementById('globalSearch').addEventListener('input', event => {
    searchQuery = event.target.value.trim();
    currentPage = 1;
    renderReports();
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      document.getElementById('globalSearch').focus();
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

  renderChart();
  renderReports();
});
