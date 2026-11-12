<%@ Page Title="Theo dõi tiến trình lệnh điều khiển" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="UcTheoDoiLenh.aspx.cs" Inherits="SmartLight.HES.WebForms.UcTheoDoiLenh" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <!-- ==========================================================================
         A. THANH TIÊU ĐỀ TRANG THEO DÕI LỆNH
         ========================================================================== -->
    <div class="hes-dash-header" style="margin-bottom: 18px;">
        <div class="hes-dash-title-group">
            <div class="hes-dash-icon-box" style="width: 36px; height: 36px;">
                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            </div>
            <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <h1 class="hes-dash-title" style="font-size: 17px; text-transform: uppercase;">THEO DÕI TIẾN TRÌNH LỆNH ĐIỀU KHIỂN</h1>
                </div>
            </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div class="hes-sync-badge" style="background-color: #ECFDF5; color: #059669; border: 1px solid #A7F3D0;">
                <span class="hes-status-dot-inline" style="background-color: #10B981;"></span>
                <span>Polling: 1000ms</span>
            </div>

            <button type="button" class="hes-btn-filter" onclick="alert('Đang xuất nhật ký lệnh điều khiển ra Excel...')">
                <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Xuất Excel</span>
            </button>
        </div>
    </div>

    <!-- ==========================================================================
         B. HÀNG 1: BỐN CARD THỐNG KÊ LỆNH (KPI CARDS)
         ========================================================================== -->
    <div class="hes-tracking-kpi-grid">
        <!-- Card 1: LỆNH CHỜ GỬI -->
        <div class="hes-tracking-kpi-card kpi-accent-amber">
            <div>
                <div class="hes-kpi-title">LỆNH CHỜ GỬI</div>
                <div class="hes-kpi-val-row">
                    <div class="hes-kpi-number-wrap">
                        <span class="hes-kpi-big-num">1</span>
                        <span class="hes-kpi-badge badge-kpi-gray">Hàng đợi TCP</span>
                    </div>
                </div>
            </div>
            <div class="hes-kpi-footer">Sẵn sàng xuất socket</div>
        </div>

        <!-- Card 2: LỆNH ĐÃ GỬI (CHỜ ACK) -->
        <div class="hes-tracking-kpi-card kpi-accent-blue">
            <div>
                <div class="hes-kpi-title">LỆNH ĐÃ GỬI (CHỜ ACK)</div>
                <div class="hes-kpi-val-row">
                    <div class="hes-kpi-number-wrap">
                        <span class="hes-kpi-big-num">2</span>
                        <span class="hes-kpi-badge badge-kpi-blue">Socket In-flight</span>
                    </div>
                </div>
            </div>
            <div class="hes-kpi-footer">Chờ khung phản hồi</div>
        </div>

        <!-- Card 3: LỆNH THÀNH CÔNG -->
        <div class="hes-tracking-kpi-card kpi-accent-green">
            <div>
                <div class="hes-kpi-title">LỆNH THÀNH CÔNG</div>
                <div class="hes-kpi-val-row">
                    <div class="hes-kpi-number-wrap">
                        <span class="hes-kpi-big-num">48</span>
                        <span class="hes-kpi-badge badge-kpi-green">94.1% Tỉ lệ</span>
                    </div>
                </div>
            </div>
            <div class="hes-kpi-footer">Khung ACK hợp lệ</div>
        </div>

        <!-- Card 4: THẤT BẠI / QUÁ HẠN -->
        <div class="hes-tracking-kpi-card kpi-accent-red">
            <div>
                <div class="hes-kpi-title">THẤT BẠI / QUÁ HẠN</div>
                <div class="hes-kpi-val-row">
                    <div class="hes-kpi-number-wrap">
                        <span class="hes-kpi-big-num">3</span>
                        <span class="hes-kpi-badge badge-kpi-red">Timeout &amp; NACK</span>
                    </div>
                </div>
            </div>
            <div class="hes-kpi-footer">Mất kết nối tủ hoặc lỗi</div>
        </div>
    </div>

    <!-- ==========================================================================
         C. HÀNG 2: BỘ LỌC TÌM KIẾM DỮ LIỆU LỆNH (SQL QUERY BUILDER)
         ========================================================================== -->
    <div class="hes-filter-builder-card">
        <div class="hes-filter-builder-header">
            <div class="hes-filter-builder-title">
                <svg viewBox="0 0 24 24">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span>BỘ LỌC TÌM KIẾM DỮ LIỆU LỆNH (SQL QUERY BUILDER)</span>
            </div>
            <span style="font-size: 11px; color: #94A3B8; font-family: monospace;">HES_SESSION: 24-10-2024</span>
        </div>

        <div class="hes-filter-grid">
            <!-- 1. Mã thiết bị -->
            <div class="hes-filter-field">
                <label class="hes-filter-lbl">Mã thiết bị (TU_*, DD_*)</label>
                <input type="text" class="hes-filter-input" id="filterDeviceCode" placeholder="VD: TU_01, DD_01..." />
            </div>

            <!-- 2. Hành động -->
            <div class="hes-filter-field">
                <label class="hes-filter-lbl">Hành động</label>
                <select class="hes-filter-select" id="filterAction">
                    <option value="">Tất cả hành động</option>
                    <option value="BAT">BẬT ĐÈN (BAT)</option>
                    <option value="TAT">TẮT ĐÈN (TAT)</option>
                    <option value="DIM">DIMMING (DIM)</option>
                </select>
            </div>

            <!-- 3. Trạng thái lệnh -->
            <div class="hes-filter-field">
                <label class="hes-filter-lbl">Trạng thái lệnh</label>
                <select class="hes-filter-select" id="filterStatus">
                    <option value="">Tất cả trạng thái</option>
                    <option value="Thành công">Thành công (ACK)</option>
                    <option value="Đã gửi">Đã gửi / Chờ phản hồi</option>
                    <option value="Chờ gửi">Chờ gửi (Queue)</option>
                    <option value="Quá hạn">Quá hạn (Expired)</option>
                    <option value="Thất bại">Thất bại (Socket closed)</option>
                </select>
            </div>

            <!-- 4. Từ ngày -->
            <div class="hes-filter-field">
                <label class="hes-filter-lbl">Từ ngày</label>
                <input type="text" class="hes-filter-input" value="24/10/2024" />
            </div>

            <!-- 5. Đến ngày -->
            <div class="hes-filter-field">
                <label class="hes-filter-lbl">Đến ngày</label>
                <input type="text" class="hes-filter-input" value="24/10/2024" />
            </div>

            <!-- Nút Tìm kiếm -->
            <button type="button" class="hes-btn-filter-search" onclick="applySearchFilter()">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Tìm kiếm</span>
            </button>

            <!-- Nút Làm mới -->
            <button type="button" class="hes-btn-filter-reset" onclick="resetSearchFilter()">
                <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                <span>Làm mới</span>
            </button>
        </div>
    </div>

    <!-- ==========================================================================
         D. HÀNG 3: DANH SÁCH LỆNH ĐIỀU KHIỂN TCP
         ========================================================================== -->
    <div class="hes-table-card">
        <div class="hes-table-toolbar">
            <div class="hes-table-title-group">
                <h3 class="hes-card-title" style="font-size: 14px;">DANH SÁCH LỆNH ĐIỀU KHIỂN TCP</h3>
                <span class="hes-badge-count" style="background-color: #F1F5F9; color: #475569; border: 1px solid #CBD5E1;">5 mục hiển thị / 54 tổng</span>
            </div>
            <div style="font-size: 12px; color: #2563EB; font-weight: 700;">
                <span class="hes-status-dot-inline" style="background-color: #2563EB;"></span>
                <span id="selectedRowIndicator">Đang chọn hàng: CMD_1024</span>
            </div>
        </div>

        <div class="hes-table-responsive" style="overflow-x: hidden;">
            <table class="hes-data-table hes-table-fit" id="trackingCmdTable">
                <thead>
                    <tr>
                        <th style="width: 35px; text-align: center;">STT</th>
                        <th style="width: 85px;">MÃ LỆNH</th>
                        <th style="width: 130px;">ĐỐI TƯỢNG</th>
                        <th style="width: 65px; text-align: center;">HÀNH ĐỘNG</th>
                        <th style="width: 65px; text-align: center;">MỨC SÁNG</th>
                        <th style="min-width: 145px;">NGUỒN PHÁT LỆNH</th>
                        <th style="width: 95px; text-align: center;">TRẠNG THÁI</th>
                        <th style="width: 75px; text-align: center;">THỜI GIAN TẠO</th>
                        <th style="width: 75px; text-align: center;">THỜI GIAN GỬI</th>
                        <th style="width: 110px;">THỜI GIAN PHẢN HỒI</th>
                        <th style="width: 50px; text-align: center;">CHI TIẾT</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Hàng 1 (Đang chọn) -->
                    <tr class="selected-row" id="row_CMD_1024" onclick="selectCommandRow('CMD_1024', 'Điểm đèn DD_01', 'TU_01', 'Thành công (ACK Hoàn tất)', 'DIM = 70%', '0x2A 0x01 0xDD 0x46 0x03 0x23 [DIM_ACK_OK]', '14:30:10', '14:30:11', '14:30:13', '2.01s', this)">
                        <td style="text-align: center; font-weight: 600;">1</td>
                        <td class="hes-col-code" style="color: #2563EB;">CMD_1024</td>
                        <td style="font-weight: 600;">
                            <span style="color: #0284C7;">DD_01</span>
                            <span style="font-size: 11px; color: #64748B; font-weight: 400;">(Thuộc TU_01)</span>
                        </td>
                        <td style="text-align: center;"><span class="badge-act-dim">DIM</span></td>
                        <td style="text-align: center;"><strong>70 %</strong></td>
                        <td>
                            <span>Thủ công Admin HES <strong>(Admin)</strong></span>
                        </td>
                        <td style="text-align: center;">
                            <span class="badge-status-success">Thành công</span>
                        </td>
                        <td style="text-align: center;">14:30:10</td>
                        <td style="text-align: center;">14:30:11</td>
                        <td style="font-weight: 600;">14:30:13 <span style="font-size: 11px; color: #64748B;">[2s]</span></td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-btn-view-text" title="Xem chi tiết">Xem</button>
                        </td>
                    </tr>

                    <!-- Hàng 2 -->
                    <tr id="row_CMD_1023" onclick="selectCommandRow('CMD_1023', 'Tủ điều khiển TU_01', 'TU_01', 'Đã gửi (Chờ ACK)', 'BAT = 100%', '0x2A 0x01 0x01 0x11 0x01 0x64 [CMD_SEND_IN_FLIGHT]', '14:25:00', '14:25:01', 'Chưa phản hồi', '--', this)">
                        <td style="text-align: center; font-weight: 600;">2</td>
                        <td class="hes-col-code">CMD_1023</td>
                        <td style="font-weight: 600;">
                            <span>TU_01</span>
                            <span style="font-size: 11px; color: #64748B; font-weight: 400;">(Tủ phân phối)</span>
                        </td>
                        <td style="text-align: center;"><span class="badge-act-bat">BAT</span></td>
                        <td style="text-align: center;"><strong>100 %</strong></td>
                        <td>
                            <span>Lịch vận hành <em>(LichVanHanh)</em></span>
                        </td>
                        <td style="text-align: center;">
                            <span class="badge-status-sent">Đã gửi</span>
                        </td>
                        <td style="text-align: center;">14:25:00</td>
                        <td style="text-align: center;">14:25:01</td>
                        <td style="color: #94A3B8; font-style: italic;">Chưa phản hồi...</td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-btn-view-text" title="Xem chi tiết">Xem</button>
                        </td>
                    </tr>

                    <!-- Hàng 3 -->
                    <tr id="row_CMD_1022" onclick="selectCommandRow('CMD_1022', 'Tủ điều khiển TU_02', 'TU_02', 'Chờ gửi (Queue)', 'TAT = 0%', '[WAITING_IN_TCP_QUEUE]', '14:10:12', '--', '--', '--', this)">
                        <td style="text-align: center; font-weight: 600;">3</td>
                        <td class="hes-col-code">CMD_1022</td>
                        <td style="font-weight: 600;">
                            <span>TU_02</span>
                            <span style="font-size: 11px; color: #64748B; font-weight: 400;">(Tủ phân phối)</span>
                        </td>
                        <td style="text-align: center;"><span class="badge-act-tat">TAT</span></td>
                        <td style="text-align: center;"><strong>0 %</strong></td>
                        <td>
                            <span>Thủ công Admin HES <strong>(Admin)</strong></span>
                        </td>
                        <td style="text-align: center;">
                            <span class="badge-status-waiting">Chờ gửi</span>
                        </td>
                        <td style="text-align: center;">14:10:12</td>
                        <td style="text-align: center;">--</td>
                        <td>--</td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-btn-view-text" title="Xem chi tiết">Xem</button>
                        </td>
                    </tr>

                    <!-- Hàng 4 -->
                    <tr id="row_CMD_1021" onclick="selectCommandRow('CMD_1021', 'Điểm đèn DD_04', 'TU_03', 'Quá hạn (Expired)', 'DIM = 50%', '0x2A 0x01 0xDD 0x49 [TIMEOUT_NO_RESPONSE]', '13:50:00', '13:50:02', '13:50:07', '5.00s Timeout', this)">
                        <td style="text-align: center; font-weight: 600;">4</td>
                        <td class="hes-col-code">CMD_1021</td>
                        <td style="font-weight: 600;">
                            <span style="color: #0284C7;">DD_04</span>
                            <span style="font-size: 11px; color: #64748B; font-weight: 400;">(Thuộc TU_03)</span>
                        </td>
                        <td style="text-align: center;"><span class="badge-act-dim">DIM</span></td>
                        <td style="text-align: center;"><strong>50 %</strong></td>
                        <td>
                            <span>Lịch vận hành <em>(LichVanHanh)</em></span>
                        </td>
                        <td style="text-align: center;">
                            <span class="badge-status-timeout">Quá hạn</span>
                        </td>
                        <td style="text-align: center;">13:50:00</td>
                        <td style="text-align: center;">13:50:02</td>
                        <td style="color: #DC2626; font-weight: 600;">Hết thời gian chờ (Timeout)</td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-btn-view-text" title="Xem chi tiết">Xem</button>
                        </td>
                    </tr>

                    <!-- Hàng 5 -->
                    <tr id="row_CMD_1020" onclick="selectCommandRow('CMD_1020', 'Tủ điều khiển TU_04', 'TU_04', 'Thất bại (Socket closed)', 'BAT = 100%', '0x2A 0x01 0x04 0xFF [ERR_SOCKET_CLOSED_RST]', '13:40:00', '13:40:01', '13:40:03', '2.10s Error', this)">
                        <td style="text-align: center; font-weight: 600;">5</td>
                        <td class="hes-col-code">CMD_1020</td>
                        <td style="font-weight: 600;">
                            <span>TU_04</span>
                            <span style="font-size: 11px; color: #64748B; font-weight: 400;">(Tủ phân phối)</span>
                        </td>
                        <td style="text-align: center;"><span class="badge-act-bat">BAT</span></td>
                        <td style="text-align: center;"><strong>100 %</strong></td>
                        <td>
                            <span>Thủ công Admin HES <strong>(Admin)</strong></span>
                        </td>
                        <td style="text-align: center;">
                            <span class="badge-status-fail">Thất bại</span>
                        </td>
                        <td style="text-align: center;">13:40:00</td>
                        <td style="text-align: center;">13:40:01</td>
                        <td style="color: #DC2626; font-weight: 600;">13:40:03 <span style="font-size: 11px;">[Lỗi tủ]</span></td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-btn-view-text" title="Xem chi tiết">Xem</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="hes-table-footer-row">
            <div class="hes-footer-info">
                Đang hiển thị 1-5 trên 54 bản ghi bảng <code>dbo.LenhDieuKhien</code>
            </div>
            <div class="hes-pagination">
                <button type="button" class="hes-page-nav">&vert;&lt;</button>
                <button type="button" class="hes-page-nav">&lt;</button>
                <button type="button" class="hes-page-num active">1</button>
                <button type="button" class="hes-page-nav">&gt;</button>
                <button type="button" class="hes-page-nav">&gt;&vert;</button>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         E. HÀNG 4: CHI TIẾT LỆNH ĐANG CHỌN (COMMAND LIFECYCLE & RAW FRAME)
         ========================================================================== -->
    <div class="hes-cmd-detail-card">
        <div class="hes-cmd-detail-header">
            <div class="hes-cmd-detail-title-group">
                <svg viewBox="0 0 24 24">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <h3 class="hes-cmd-detail-title" id="detailBoxTitle">
                    CHI TIẾT LỆNH: CMD_1024 - Điểm đèn DD_01 <span style="font-weight: 500; color: #64748B;">[TỦ ĐIỀU KHIỂN: TU_01 | GIAO THỨC TCP PORT: 8088]</span>
                </h3>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 12px; color: #64748B; font-weight: 600;">Trạng thái xử lý:</span>
                <span class="badge-status-success" id="detailProcessStatus" style="font-size: 12px; padding: 3px 10px;">
                    Thành công (ACK Hoàn tất)
                </span>
            </div>
        </div>

        <div class="hes-cmd-detail-grid">
            <!-- Cột trái: Tiến trình chu trình lệnh (Command Lifecycle) -->
            <div class="hes-lifecycle-box">
                <div class="hes-lifecycle-title">
                    <svg viewBox="0 0 24 24">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <span>TIẾN TRÌNH THỰC THI CHU TRÌNH LỆNH (COMMAND LIFECYCLE)</span>
                </div>

                <div class="hes-timeline-list">
                    <!-- Bước 1: Tạo lệnh -->
                    <div class="hes-timeline-step">
                        <div class="hes-step-icon step-create">
                            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                        <div class="hes-step-head">
                            <span class="hes-step-time" id="step1Time">[14:30:10] Tạo lệnh từ Web / HES</span>
                        </div>
                        <div class="hes-step-desc" id="step1Desc">
                            Khởi tạo bởi người dùng: <strong>Admin</strong> (NguoiDung: Admin, vai trò Quản trị hệ thống). Tham số: <span style="color: #2563EB; font-weight: 700;">DIM = 70%</span>.
                        </div>
                    </div>

                    <!-- Bước 2: Server gửi -->
                    <div class="hes-timeline-step">
                        <div class="hes-step-icon step-send">
                            <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                        <div class="hes-step-head">
                            <span class="hes-step-time" id="step2Time">[14:30:11] HES TCP Server đóng gói và gửi</span>
                        </div>
                        <div class="hes-step-desc" id="step2Desc">
                            Server đóng gói frame nhị phân chuẩn HES và truyền xuống socket mở của trạm <strong id="step2Station">TU_01</strong> qua Port 8088.
                        </div>
                    </div>

                    <!-- Bước 3: Phản hồi -->
                    <div class="hes-timeline-step">
                        <div class="hes-step-icon step-ack" id="step3Icon">
                            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div class="hes-step-head">
                            <span class="hes-step-time" id="step3Time" style="color: #059669;">[14:30:13] Nhận phản hồi thành công (ACK)</span>
                        </div>
                        <div class="hes-step-desc" id="step3Desc">
                            Trạm <strong id="step3Station">TU_01</strong> xác nhận đã thực thi thành công thay đổi mức sáng module đèn <strong id="step3Lamp">DD_01</strong>. Thời gian trễ đáp ứng: <strong id="step3Latency">2.01s</strong>.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cột phải: Dữ liệu Frame phản hồi thô & Ghi chú -->
            <div class="hes-raw-frame-box">
                <div>
                    <div class="hes-raw-title">
                        <svg viewBox="0 0 24 24">
                            <polyline points="4 17 10 11 4 5"></polyline>
                            <line x1="12" y1="19" x2="20" y2="19"></line>
                        </svg>
                        <span>DỮ LIỆU FRAME PHẢN HỒI THÔ &amp; GHI CHÚ HES</span>
                    </div>

                    <div style="font-size: 11px; font-weight: 700; color: #64748B; margin-bottom: 6px;">
                        FRAME DỮ LIỆU SOCKET PHẢN HỒI:
                    </div>
                    <div class="hes-terminal-box" id="rawFrameText">
                        0x2A 0x01 0xDD 0x46 0x03 0x23 <span class="hes-terminal-tag">[DIM_ACK_OK]</span>
                    </div>

                    <div style="font-size: 11px; font-weight: 700; color: #64748B; margin-bottom: 6px;">
                        GHI CHÚ TỪ HES SERVICE RUNTIME:
                    </div>
                    <div class="hes-runtime-note" id="runtimeNoteText">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <span>Lệnh hoàn tất trong ngưỡng cho phép (&lt; 5s). CSDL dbSmartLight cập nhật trạng thái thiết bị tự động.</span>
                    </div>
                </div>

                <div style="border-top: 1px solid #E2E8F0; padding-top: 10px; margin-top: 14px; font-size: 11px; color: #94A3B8; display: flex; justify-content: space-between;">
                    <span>TCP Socket: <strong>Established</strong></span>
                    <span>Checksum: <strong>CRC16-IBM Valid</strong></span>
                </div>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         F. DẢI TRẠNG THÁI SCADA CHUẨN
         ========================================================================== -->
    <div class="hes-bottom-status-strip">
        <div class="hes-bottom-status-left">
            <span class="hes-status-dot-green"></span>
            <span class="hes-engine-badge">Engine .NET 8.0</span>
            <span class="hes-badge-arch" style="background-color: #ECFDF5; color: #059669;">RUNNING</span>
            <span class="hes-gateway-text">HES Gateway Server v3.4.1 x64</span>
        </div>
        <div class="hes-bottom-status-middle">
            <span>HES Service: Hoạt động liên tục (PID: 4092)</span>
            <span class="hes-status-sep">&bull;</span>
            <span>SQL Server: Đã kết nối (dbSmartLight)</span>
            <span class="hes-status-sep">&bull;</span>
            <span>TCP Server: Đang lắng nghe Port 8088 (3 Tủ Online)</span>
            <span class="hes-status-sep">&bull;</span>
            <span>Đồng bộ lần cuối: 14:32:05 24/10/2024</span>
        </div>
        <div class="hes-bottom-status-right">
            <span class="hes-badge-ready">READY</span>
        </div>
    </div>

    <!-- Script tương tác Theo dõi lệnh -->
    <script type="text/javascript">
        function selectCommandRow(cmdCode, targetName, cabinetCode, statusText, actionParam, rawFrame, tCreate, tSend, tAck, latency, rowEl) {
            // Cập nhật highlight hàng
            var allRows = document.querySelectorAll('#trackingCmdTable tbody tr');
            allRows.forEach(function (r) { r.classList.remove('selected-row'); });
            if (rowEl) rowEl.classList.add('selected-row');

            // Cập nhật chỉ báo trên header bảng
            document.getElementById('selectedRowIndicator').innerText = 'Đang chọn hàng: ' + cmdCode;

            // Cập nhật tiêu đề hộp chi tiết
            document.getElementById('detailBoxTitle').innerHTML =
                'CHI TIẾT LỆNH: ' + cmdCode + ' - ' + targetName + ' <span style="font-weight: 500; color: #64748B;">[TỦ ĐIỀU KHIỂN: ' + cabinetCode + ' | GIAO THỨC TCP PORT: 8088]</span>';

            // Cập nhật trạng thái
            var statusEl = document.getElementById('detailProcessStatus');
            statusEl.innerText = statusText;
            if (statusText.indexOf('Thành công') > -1) {
                statusEl.className = 'badge-status-success';
            } else if (statusText.indexOf('Đã gửi') > -1) {
                statusEl.className = 'badge-status-sent';
            } else if (statusText.indexOf('Chờ gửi') > -1) {
                statusEl.className = 'badge-status-waiting';
            } else if (statusText.indexOf('Quá hạn') > -1) {
                statusEl.className = 'badge-status-timeout';
            } else {
                statusEl.className = 'badge-status-fail';
            }

            // Cập nhật timeline
            document.getElementById('step1Time').innerText = '[' + tCreate + '] Tạo lệnh từ Web / HES';
            document.getElementById('step1Desc').innerHTML = 'Khởi tạo bởi người dùng: <strong>Admin</strong>. Tham số: <span style="color: #2563EB; font-weight: 700;">' + actionParam + '</span>.';
            
            document.getElementById('step2Time').innerText = '[' + tSend + '] HES TCP Server đóng gói và gửi';
            document.getElementById('step2Station').innerText = cabinetCode;

            document.getElementById('step3Time').innerText = '[' + tAck + '] Trạng thái phản hồi từ hiện trường';
            document.getElementById('step3Station').innerText = cabinetCode;
            document.getElementById('step3Lamp').innerText = targetName;
            document.getElementById('step3Latency').innerText = latency;

            // Cập nhật raw frame
            document.getElementById('rawFrameText').innerHTML = rawFrame;
        }

        function applySearchFilter() {
            var dev = document.getElementById('filterDeviceCode').value.toUpperCase();
            var act = document.getElementById('filterAction').value.toUpperCase();
            var stat = document.getElementById('filterStatus').value.toUpperCase();
            var table = document.getElementById('trackingCmdTable');
            var trs = table.querySelectorAll('tbody tr');

            trs.forEach(function (tr) {
                var text = tr.textContent.toUpperCase();
                var matchDev = (dev === '' || text.indexOf(dev) > -1);
                var matchAct = (act === '' || text.indexOf(act) > -1);
                var matchStat = (stat === '' || text.indexOf(stat) > -1);

                if (matchDev && matchAct && matchStat) {
                    tr.style.display = '';
                } else {
                    tr.style.display = 'none';
                }
            });
        }

        function resetSearchFilter() {
            document.getElementById('filterDeviceCode').value = '';
            document.getElementById('filterAction').value = '';
            document.getElementById('filterStatus').value = '';
            applySearchFilter();
        }
    </script>
</asp:Content>

