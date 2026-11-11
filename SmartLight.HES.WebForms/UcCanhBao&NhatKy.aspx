<%@ Page Title="Cảnh báo & Nhật ký hệ thống" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="UcCanhBao&NhatKy.aspx.cs" Inherits="SmartLight.HES.WebForms.UcCanhBao_NhatKy" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <!-- ==========================================================================
         A. THANH TIÊU ĐỀ TRANG CẢNH BÁO & NHẬT KÝ
         ========================================================================== -->
    <div class="hes-dash-header" style="margin-bottom: 18px;">
        <div class="hes-dash-title-group">
            <div class="hes-alarm-icon-box">
                <svg viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </div>
            <div>
                <h1 class="hes-dash-title" style="font-size: 17px; text-transform: uppercase;">CẢNH BÁO &amp; NHẬT KÝ HỆ THỐNG</h1>
            </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <!-- Xuất Excel / PDF -->
            <button type="button" class="hes-btn-filter" onclick="alert('Đang trích xuất toàn bộ dữ liệu cảnh báo ra file Excel / PDF...')">
                <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Xuất Excel / PDF</span>
            </button>

            <!-- Xác nhận tất cả (Ack All) -->
            <button type="button" class="hes-btn-ack-all" onclick="ackAllAlerts()">
                <svg viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Xác nhận tất cả (Ack All)</span>
            </button>

            <!-- Làm mới (Refresh) -->
            <button type="button" class="hes-btn-refresh" onclick="refreshAlerts()">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span>Làm mới (Refresh)</span>
            </button>
        </div>
    </div>

    <!-- ==========================================================================
         B. HÀNG 1: BỐN CARD THỐNG KÊ CẢNH BÁO (KPI CARDS)
         ========================================================================== -->
    <div class="hes-tracking-kpi-grid">
        <!-- Card 1: CẢNH BÁO NGHIÊM TRỌNG -->
        <div class="hes-tracking-kpi-card kpi-accent-red">
            <div>
                <div class="hes-kpi-title">CẢNH BÁO NGHIÊM TRỌNG</div>
                <div class="hes-kpi-val-row">
                    <div class="hes-kpi-number-wrap">
                        <span class="hes-kpi-big-num">03</span>
                        <span class="hes-kpi-badge badge-kpi-red">Chưa xử lý</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748B;">
                <span>Mất nguồn AC, Đứt cáp, Ngắt CB</span>
                <strong style="color: #DC2626;">Priority 1</strong>
            </div>
        </div>

        <!-- Card 2: CẢNH BÁO VỪA & NHẸ -->
        <div class="hes-tracking-kpi-card kpi-accent-blue">
            <div>
                <div class="hes-kpi-title">CẢNH BÁO VỪA &amp; NHẸ</div>
                <div class="hes-kpi-val-row">
                    <div class="hes-kpi-number-wrap">
                        <span class="hes-kpi-big-num">07</span>
                        <span class="hes-kpi-badge badge-kpi-blue">Cần kiểm tra</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748B;">
                <span>Nhiệt độ Driver &gt; 75°C, Quá dòn...</span>
                <strong style="color: #0284C7;">Priority 2</strong>
            </div>
        </div>

        <!-- Card 3: ĐÃ KHẮC PHỤC / XÁC NHẬN -->
        <div class="hes-tracking-kpi-card kpi-accent-green">
            <div>
                <div class="hes-kpi-title">ĐÃ KHẮC PHỤC / XÁC NHẬN</div>
                <div class="hes-kpi-val-row">
                    <div class="hes-kpi-number-wrap">
                        <span class="hes-kpi-big-num">52</span>
                        <span class="hes-kpi-badge badge-kpi-green">Hôm nay</span>
                    </div>
                </div>
            </div>
            <div style="font-size: 11px; color: #64748B;">
                Khắc phục tự động &amp; Hiện trường: <strong>91.2% OK</strong>
            </div>
        </div>

        <!-- Card 4: TỔNG SỰ KIỆN GHI NHẬN -->
        <div class="hes-tracking-kpi-card" style="border-left: 4px solid #2563EB;">
            <div>
                <div class="hes-kpi-title">TỔNG SỰ KIỆN GHI NHẬN</div>
                <div class="hes-kpi-val-row">
                    <div class="hes-kpi-number-wrap">
                        <span class="hes-kpi-big-num">148</span>
                        <span class="hes-kpi-badge badge-kpi-blue">24h qua</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748B;">
                <span>Telemetry, Lệnh điều khiển, Hệ...</span>
                <strong style="color: #2563EB;">Audit Ready</strong>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         C. HÀNG 2: BỘ LỌC DỮ LIỆU & TRUY VẤN CẢNH BÁO
         ========================================================================== -->
    <div class="hes-filter-builder-card">
        <div class="hes-filter-builder-header">
            <div class="hes-filter-builder-title">
                <svg viewBox="0 0 24 24">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span>BỘ LỌC DỮ LIỆU &amp; TRUY VẤN CẢNH BÁO</span>
            </div>
        </div>

        <div class="hes-filter-grid" style="grid-template-columns: 1.2fr 1.2fr 1.2fr 1.1fr 1.1fr auto;">
            <!-- 1. Mức độ cảnh báo -->
            <div class="hes-filter-field">
                <label class="hes-filter-lbl">Mức độ cảnh báo</label>
                <select class="hes-filter-select" id="filterAlertLevel">
                    <option value="">Tất cả mức độ</option>
                    <option value="NGHIÊM TRỌNG">Nghiêm trọng (Critical)</option>
                    <option value="CẢNH BÁO">Cảnh báo (Warning)</option>
                    <option value="THÔNG TIN">Thông tin (Info)</option>
                </select>
            </div>

            <!-- 2. Nhóm thiết bị -->
            <div class="hes-filter-field">
                <label class="hes-filter-lbl">Nhóm thiết bị</label>
                <select class="hes-filter-select" id="filterAlertDevice">
                    <option value="">Tất cả thiết bị</option>
                    <option value="TCS">Tủ điều khiển (TCS-*)</option>
                    <option value="DD">Điểm đèn (DD-*)</option>
                    <option value="Gateway">HES Gateway / Server</option>
                </select>
            </div>

            <!-- 3. Trạng thái xử lý -->
            <div class="hes-filter-field">
                <label class="hes-filter-lbl">Trạng thái xử lý</label>
                <select class="hes-filter-select" id="filterAlertStatus">
                    <option value="">Tất cả trạng thái</option>
                    <option value="Chờ xác nhận">Chờ xác nhận</option>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Đã xác nhận">Đã xác nhận</option>
                    <option value="Hoàn tất">Hoàn tất</option>
                </select>
            </div>

            <!-- 4. Từ thời điểm -->
            <div class="hes-filter-field">
                <label class="hes-filter-lbl">Từ thời điểm</label>
                <input type="text" class="hes-filter-input" value="24/10/2024 00:00" />
            </div>

            <!-- 5. Đến thời điểm -->
            <div class="hes-filter-field">
                <label class="hes-filter-lbl">Đến thời điểm</label>
                <input type="text" class="hes-filter-input" value="24/10/2024 23:59" />
            </div>

            <!-- Nút Truy vấn -->
            <button type="button" class="hes-btn-filter-search" onclick="applyAlertFilter()">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Truy vấn</span>
            </button>
        </div>
    </div>

    <!-- ==========================================================================
         D. HÀNG 3: BẢNG DANH SÁCH CHI TIẾT CẢNH BÁO
         ========================================================================== -->
    <div class="hes-table-card">
        <div class="hes-table-toolbar">
            <div class="hes-table-title-group">
                <h3 class="hes-card-title" style="font-size: 14px;">DANH SÁCH CHI TIẾT CẢNH BÁO</h3>
                <span class="hes-badge-primary-top" style="background-color: #2563EB; color: #FFFFFF; border: none;">148 Records</span>
            </div>
            <div style="display: flex; align-items: center; gap: 14px; font-size: 12px; font-weight: 600;">
                <span style="display: inline-flex; align-items: center; gap: 4px; color: #DC2626;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background-color: #DC2626;"></span> Khẩn cấp (3)
                </span>
                <span style="display: inline-flex; align-items: center; gap: 4px; color: #2563EB;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background-color: #2563EB;"></span> Cảnh báo (7)
                </span>
                <span style="display: inline-flex; align-items: center; gap: 4px; color: #16A34A;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background-color: #16A34A;"></span> Thông thường (138)
                </span>
            </div>
        </div>

        <div class="hes-table-responsive" style="overflow-x: hidden;">
            <table class="hes-data-table hes-table-fit" id="alarmTable">
                <thead>
                    <tr>
                        <th style="width: 35px; text-align: center;">STT</th>
                        <th style="width: 95px;">THỜI GIAN</th>
                        <th style="width: 135px;">MÃ CẢNH BÁO</th>
                        <th style="width: 105px; text-align: center;">MỨC ĐỘ</th>
                        <th style="width: 150px;">THIẾT BỊ PHÁT SINH</th>
                        <th>THÔNG SỐ ĐO &amp; NGUYÊN NHÂN SỰ CỐ</th>
                        <th style="width: 105px; text-align: center;">TRẠNG THÁI</th>
                        <th style="width: 110px; text-align: center;">TÁC VỤ</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Hàng 1 (Đang chọn) -->
                    <tr class="selected-row" id="row_ALM_089" onclick="selectAlarmRow('ALM_20241024_089', 'TCS-03 (Trần Hưng Đạo)', 'TCS_03/D_02', '0.0 V (Mất pha)', '0.0 V (Mất pha)', '224.5 V (Bình thường)', '142 mA (> Ngưỡng 30mA)', 'Tủ TCS-03 - Nút giao Trần Hưng Đạo x Hàm Nghi', '10.7684° N, 106.6900° E', '84982001928', '16:30 24/10/2024', this)">
                        <td style="text-align: center; font-weight: 600;">01</td>
                        <td>
                            <div style="font-weight: 700;">14:31:18</div>
                            <div style="font-size: 11px; color: #64748B;">24/10/2024</div>
                        </td>
                        <td class="hes-col-code" style="color: #2563EB;">ALM_20241024_089</td>
                        <td style="text-align: center;"><span class="badge-sev-crit">NGHIÊM TRỌNG</span></td>
                        <td>
                            <div style="font-weight: 700; color: #0F172A;">TCS-03 (Trần Hưng Đạo)</div>
                            <div style="font-size: 11px; color: #64748B;">Substation-Kiosk 645</div>
                        </td>
                        <td>
                            <div style="color: #DC2626; font-weight: 700;">Mất nguồn AC 220V ngõ vào (Pha A &amp; Pha B = 0V)</div>
                            <div style="font-size: 11.5px; color: #475569; margin-top: 2px;">CB nhánh rò chống giật ELCB kích hoạt dây tải động lúc 14:31:12</div>
                        </td>
                        <td style="text-align: center;">
                            <span class="badge-status-sent" style="color: #2563EB;">
                                <span class="hes-status-dot-inline" style="background-color: #2563EB;"></span>
                                Chờ xác nhận
                            </span>
                        </td>
                        <td style="text-align: center;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <button type="button" class="hes-table-view-btn" title="Chi tiết"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></button>
                                <button type="button" class="hes-btn-action-fix" onclick="event.stopPropagation(); alert('Điều động khẩn cấp KTV tới tủ TCS-03!')">Xử lý ngay</button>
                            </div>
                        </td>
                    </tr>

                    <!-- Hàng 2 -->
                    <tr id="row_ALM_088" onclick="selectAlarmRow('ALM_20241024_088', 'DD_07 (Nhánh Lê Lợi)', 'DD_07/LED_01', '224.2 V', '223.8 V', '224.0 V', '12 mA (An toàn)', 'Điểm đèn DD_07 - Đường Lê Lợi, Quận 1', '10.7720° N, 106.6980° E', 'LoRa Mesh Hop 1', '15:00 24/10/2024', this)">
                        <td style="text-align: center; font-weight: 600;">02</td>
                        <td>
                            <div style="font-weight: 700;">14:28:05</div>
                            <div style="font-size: 11px; color: #64748B;">24/10/2024</div>
                        </td>
                        <td class="hes-col-code">ALM_20241024_088</td>
                        <td style="text-align: center;"><span class="badge-sev-warn">● CẢNH BÁO</span></td>
                        <td>
                            <div style="font-weight: 700; color: #0F172A;">DD_07 (Nhánh Lê Lợi)</div>
                            <div style="font-size: 11px; color: #64748B;">LED Luminaire 150W</div>
                        </td>
                        <td>
                            <div style="font-weight: 600; color: #0F172A;">Nhiệt độ chip LED 78°C (Vượt ngưỡng an toàn 75°C)</div>
                            <div style="font-size: 11.5px; color: #64748B; margin-top: 2px;">Tự động giảm dimmer xuống 60% để giải nhiệt</div>
                        </td>
                        <td style="text-align: center;">
                            <span class="badge-status-sent">
                                <span class="hes-status-dot-inline" style="background-color: #2563EB;"></span>
                                Đang xử lý
                            </span>
                        </td>
                        <td style="text-align: center;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <button type="button" class="hes-table-view-btn" title="Chi tiết"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></button>
                                <button type="button" class="hes-btn-action-outline" onclick="event.stopPropagation(); alert('Mở điều khiển đèn DD_07!')">Điều khiển</button>
                            </div>
                        </td>
                    </tr>

                    <!-- Hàng 3 -->
                    <tr id="row_ALM_087" onclick="selectAlarmRow('ALM_20241024_087', 'TCS-01 (Tủ Lê Lợi)', 'TCS_01/MAIN', '185.0 V (Sụt áp)', '224.0 V', '226.0 V', '18 mA (An toàn)', 'Tủ nguồn trung tâm 3P-100A Lê Lợi', '10.7735° N, 106.7001° E', '84982001920', '15:30 24/10/2024', this)">
                        <td style="text-align: center; font-weight: 600;">03</td>
                        <td>
                            <div style="font-weight: 700;">14:15:40</div>
                            <div style="font-size: 11px; color: #64748B;">24/10/2024</div>
                        </td>
                        <td class="hes-col-code">ALM_20241024_087</td>
                        <td style="text-align: center;"><span class="badge-sev-warn">● CẢNH BÁO</span></td>
                        <td>
                            <div style="font-weight: 700; color: #0F172A;">TCS-01 (Tủ Lê Lợi)</div>
                            <div style="font-size: 11px; color: #64748B;">Tủ nguồn trung tâm 3P-100A</div>
                        </td>
                        <td>
                            <div style="font-weight: 600; color: #0F172A;">Điện áp pha A sụt giảm còn 185V (Tiêu chuẩn &gt; 198V)</div>
                            <div style="font-size: 11.5px; color: #64748B; margin-top: 2px;">Lệch pha: Ua=185V, Ub=224V, Uc=226V, CosPhi = 0.88</div>
                        </td>
                        <td style="text-align: center;">
                            <span class="badge-status-ack">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Đã xác nhận
                            </span>
                        </td>
                        <td style="text-align: center;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <button type="button" class="hes-table-view-btn" title="Chi tiết"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></button>
                                <button type="button" class="hes-btn-action-outline" onclick="event.stopPropagation(); alert('Mở điều khiển tủ TCS-01!')">Điều khiển</button>
                            </div>
                        </td>
                    </tr>

                    <!-- Hàng 4 -->
                    <tr id="row_ALM_084" onclick="selectAlarmRow('ALM_20241024_084', 'Gateway-Port8088', 'GW_HES_01', 'Offline', 'Offline', 'Offline', '--', 'HES Gateway Server Hub - Port 8088', '10.7750° N, 106.7020° E', '4G LTE Cat 4', 'Đang kết nối lại', this)">
                        <td style="text-align: center; font-weight: 600;">04</td>
                        <td>
                            <div style="font-weight: 700;">13:58:22</div>
                            <div style="font-size: 11px; color: #64748B;">24/10/2024</div>
                        </td>
                        <td class="hes-col-code">ALM_20241024_084</td>
                        <td style="text-align: center;"><span class="badge-sev-crit">NGHIÊM TRỌNG</span></td>
                        <td>
                            <div style="font-weight: 700; color: #0F172A;">Gateway-Port8088</div>
                            <div style="font-size: 11px; color: #64748B;">Ethernet / 4G LTE Cat 4</div>
                        </td>
                        <td>
                            <div style="color: #DC2626; font-weight: 700;">Mất tín hiệu kết nối TCP/IP socket vượt quá 5 phút</div>
                            <div style="font-size: 11.5px; color: #475569; margin-top: 2px;">IP: 192.168.1.144 - HES Socket Timeout sau 3 lần retry SYN-ACK</div>
                        </td>
                        <td style="text-align: center;">
                            <span class="badge-status-sent">
                                <span class="hes-status-dot-inline" style="background-color: #2563EB;"></span>
                                Đang xử lý
                            </span>
                        </td>
                        <td style="text-align: center;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <button type="button" class="hes-table-view-btn" title="Chi tiết"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></button>
                                <button type="button" class="hes-btn-action-ping" onclick="event.stopPropagation(); alert('Đang ping gói tin ICMP tới Gateway Port 8088...')">Ping lại</button>
                            </div>
                        </td>
                    </tr>

                    <!-- Hàng 5 -->
                    <tr id="row_EVT_045" onclick="selectAlarmRow('EVT_20241024_045', 'AutoScheduler Engine', 'JOB_DAEMON_34', '225.0 V', '224.2 V', '224.8 V', '14 mA', 'Hệ thống tự động điều khiển phụ tải chiếu sáng', 'Server Localhost', 'Daemon Service', 'Hoàn tất', this)">
                        <td style="text-align: center; font-weight: 600;">05</td>
                        <td>
                            <div style="font-weight: 700;">13:30:00</div>
                            <div style="font-size: 11px; color: #64748B;">24/10/2024</div>
                        </td>
                        <td class="hes-col-code">EVT_20241024_045</td>
                        <td style="text-align: center;"><span class="badge-sev-info">● THÔNG TIN</span></td>
                        <td>
                            <div style="font-weight: 700; color: #0F172A;">AutoScheduler Engine</div>
                            <div style="font-size: 11px; color: #64748B;">Job Daemon v3.4</div>
                        </td>
                        <td>
                            <div style="font-weight: 600; color: #0F172A;">Thực thi lịch trình bật bóng tiết kiệm ban chiều theo độ rọi LDR (&lt; 25 Lux)</div>
                            <div style="font-size: 11.5px; color: #64748B; margin-top: 2px;">Kích hoạt 18 tủ trạm, tổng công suất điều khiển: 42.6 kW</div>
                        </td>
                        <td style="text-align: center;">
                            <span class="badge-status-ack" style="background-color: #ECFDF5; color: #059669;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Hoàn tất
                            </span>
                        </td>
                        <td style="text-align: center;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <button type="button" class="hes-table-view-btn" title="Chi tiết"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></button>
                                <button type="button" class="hes-btn-action-outline" onclick="event.stopPropagation(); alert('Mở chi tiết nhật ký Event Log!')">Xem Log</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="hes-table-footer-row">
            <div class="hes-footer-info">
                Hiển thị 1 - 5 trên 148 mục cảnh báo &nbsp;|&nbsp; Phân trang SQL: <code>OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY</code>
            </div>
            <div class="hes-pagination">
                <button type="button" class="hes-page-nav">&vert;&lt;</button>
                <button type="button" class="hes-page-nav">&lt;</button>
                <button type="button" class="hes-page-num active">1</button>
                <button type="button" class="hes-page-num">2</button>
                <button type="button" class="hes-page-num">3</button>
                <button type="button" class="hes-page-nav">&gt;</button>
                <button type="button" class="hes-page-nav">&gt;&vert;</button>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         E. HÀNG 4: CHI TIẾT CẢNH BÁO ĐANG CHỌN (ALARM DETAILS & AUDIT LOG)
         ========================================================================== -->
    <div class="hes-cmd-detail-card">
        <div class="hes-cmd-detail-header">
            <div class="hes-cmd-detail-title-group">
                <svg viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <h3 class="hes-cmd-detail-title">
                    CHI TIẾT CẢNH BÁO ĐANG CHỌN: <span class="badge-sev-crit" id="detailAlarmCode">ALM_20241024_089</span>
                    <span style="font-weight: 500; font-size: 12px; color: #64748B; margin-left: 6px;" id="detailNodeId">Node ID: TCS_03/D_02</span>
                </h3>
            </div>
            <div style="font-size: 12px; color: #64748B; font-weight: 600;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" style="vertical-align: middle; margin-right: 4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                NHẬT KÝ XỬ LÝ (AUDIT LOG) &nbsp;&bull;&nbsp; <strong style="color: #2563EB;">SQL Transaction Safe</strong>
            </div>
        </div>

        <div class="hes-alarm-detail-grid">
            <!-- Cột trái: Giá trị cảm biến & Sơ đồ vị trí -->
            <div>
                <!-- Subcard 1: Giá trị cảm biến tại thời điểm lỗi -->
                <div class="hes-alarm-sub-card">
                    <div class="hes-alarm-sub-title">GIÁ TRỊ CẢM BIẾN TẠI THỜI ĐIỂM LỖI</div>
                    <div class="hes-sensor-param-row">
                        <span class="hes-sensor-param-lbl">Điện áp Pha A (Ua):</span>
                        <span class="hes-sensor-param-val danger" id="valDetailUa">0.0 V (Mất pha)</span>
                    </div>
                    <div class="hes-sensor-param-row">
                        <span class="hes-sensor-param-lbl">Điện áp Pha B (Ub):</span>
                        <span class="hes-sensor-param-val danger" id="valDetailUb">0.0 V (Mất pha)</span>
                    </div>
                    <div class="hes-sensor-param-row">
                        <span class="hes-sensor-param-lbl">Điện áp Pha C (Uc):</span>
                        <span class="hes-sensor-param-val" id="valDetailUc">224.5 V (Bình thường)</span>
                    </div>
                    <div class="hes-sensor-param-row">
                        <span class="hes-sensor-param-lbl">Dòng rò tiếp địa (In):</span>
                        <span class="hes-sensor-param-val danger" id="valDetailIn">142 mA (&gt; Ngưỡng 30mA)</span>
                    </div>
                </div>

                <!-- Subcard 2: Vị trí & Cấu hình trạm -->
                <div class="hes-alarm-sub-card">
                    <div class="hes-alarm-sub-title">VỊ TRÍ &amp; CẤU HÌNH TRẠM</div>
                    <div style="font-weight: 700; color: #0F172A; font-size: 13px; margin-bottom: 4px;" id="detailSubstationName">
                        Tủ TCS-03 - Nút giao Trần Hưng Đạo x Hàm Nghi
                    </div>
                    <div style="font-size: 11.5px; color: #64748B; margin-bottom: 2px;">
                        Tọa độ GPS: <span id="detailGps">10.7684° N, 106.6900° E</span>
                    </div>
                    <div style="font-size: 11.5px; color: #64748B; margin-bottom: 6px;">
                        Sim 4G Viettel IoT: <span id="detailSim">84982001928</span>
                    </div>
                    <div style="font-size: 12px; color: #0F172A;">
                        Dự kiến phục hồi: <strong style="color: #2563EB;" id="detailEta">16:30 24/10/2024</strong>
                    </div>
                </div>

                <!-- Subcard 3: Sơ đồ vị trí sự cố trên tuyến & Điểm ngắt mạch -->
                <div class="hes-alarm-sub-card">
                    <div class="hes-alarm-sub-title">
                        <span>SƠ ĐỒ VỊ TRÍ SỰ CỐ TRÊN TUYẾN &amp; ĐIỂM NGẮT MẠCH</span>
                        <span style="font-size: 10px; font-weight: 500; text-transform: none; color: #64748B;">GIS Map: District 1 Grid #14</span>
                    </div>
                    <div class="hes-gis-map-box">
                        <div class="hes-gis-alert-banner">
                            <div>
                                <div style="color: #DC2626; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 4px;">
                                    <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #DC2626;"></span>
                                    SỰ CỐ ĐOẠN DÂY TỦ TCS-03
                                </div>
                                <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
                                    Khóa liên động tự trạm để đảm bảo an toàn điện
                                </div>
                            </div>
                            <button type="button" class="hes-btn-open-gis" onclick="alert('Đang mở bản đồ GIS không gian lưới chiếu sáng...')">Mở bản đồ GIS</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cột phải: Nhật ký xử lý (Audit Log) & Form ghi nhận -->
            <div>
                <!-- Timeline các sự kiện xử lý -->
                <div class="hes-alarm-sub-card">
                    <div class="hes-timeline-list" style="padding-left: 24px;">
                        <!-- Bước 1 -->
                        <div class="hes-timeline-step">
                            <div class="hes-step-icon step-create" style="width: 20px; height: 20px; left: -24px;">
                                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            </div>
                            <div class="hes-step-head">
                                <span class="hes-step-time" style="color: #DC2626;">[14:31:18] Tự động phát hiện</span>
                            </div>
                            <div class="hes-step-desc">
                                Core Telemetry Engine ghi nhận tín hiệu sụt áp rò rỉ rơ le tiếp địa vượt ngưỡng 30mA.
                            </div>
                        </div>

                        <!-- Bước 2 -->
                        <div class="hes-timeline-step">
                            <div class="hes-step-icon step-send" style="width: 20px; height: 20px; left: -24px;">
                                <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </div>
                            <div class="hes-step-head">
                                <span class="hes-step-time" style="color: #2563EB;">[14:32:00] Hệ thống gửi cảnh báo</span>
                            </div>
                            <div class="hes-step-desc">
                                Gửi tin nhắn SMS cảnh báo và thông báo SCADA Push tới Tổ kỹ thuật Đội Chiếu sáng Quận 1.
                            </div>
                        </div>

                        <!-- Bước 3 -->
                        <div class="hes-timeline-step">
                            <div class="hes-step-icon step-ack" style="width: 20px; height: 20px; left: -24px;">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div class="hes-step-head">
                                <span class="hes-step-time" style="color: #059669;">[14:35:10] Admin (KTV Nguyễn Văn Nam)</span>
                            </div>
                            <div class="hes-step-desc">
                                Đã xác nhận tiếp nhận thông tin cảnh báo. Đang xuất lệnh điều động xe gắn kiểm tra tủ trạm.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Ghi nhận xử lý & cập nhật nhật ký kỹ thuật -->
                <div class="hes-audit-form-box">
                    <div class="hes-audit-form-title">GHI NHẬN XỬ LÝ &amp; CẬP NHẬT NHẬT KÝ KỸ THUẬT</div>
                    
                    <div style="font-size: 11.5px; font-weight: 600; color: #475569; margin-bottom: 4px;">Hành động:</div>
                    <select class="hes-filter-select" id="auditActionSelect">
                        <option value="1">Điều động kỹ thuật hiện trường kiểm tra</option>
                        <option value="2">Khóa tạm thời lộ nhánh cấp nguồn</option>
                        <option value="3">Reset rơ le chống rò từ xa qua Modbus</option>
                        <option value="4">Đóng CB nguồn cưỡng bức</option>
                    </select>

                    <textarea class="hes-audit-textarea" id="auditNotes" placeholder="Nhập ghi chú kỹ thuật (VD: Cử KTV Trần Bảo kiểm tra tiếp điểm CB chống rò tủ TCS-03)..."></textarea>

                    <div class="hes-audit-footer-actions">
                        <label class="hes-audit-checkbox">
                            <input type="checkbox" id="chkAuditLogSql" checked="checked" />
                            <span>Lưu Audit Log vào CSDL SQL</span>
                        </label>

                        <button type="button" class="hes-btn-save-audit" onclick="saveAuditLog()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                            <span>Lưu biên bản xử lý</span>
                        </button>
                    </div>
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

    <!-- Script tương tác Cảnh báo & Nhật ký -->
    <script type="text/javascript">
        function selectAlarmRow(code, devName, nodeId, ua, ub, uc, leak, subName, gps, sim, eta, rowEl) {
            var trs = document.querySelectorAll('#alarmTable tbody tr');
            trs.forEach(function (r) { r.classList.remove('selected-row'); });
            if (rowEl) rowEl.classList.add('selected-row');

            document.getElementById('detailAlarmCode').innerText = code;
            document.getElementById('detailNodeId').innerText = 'Node ID: ' + nodeId;
            document.getElementById('valDetailUa').innerText = ua;
            document.getElementById('valDetailUb').innerText = ub;
            document.getElementById('valDetailUc').innerText = uc;
            document.getElementById('valDetailIn').innerText = leak;
            document.getElementById('detailSubstationName').innerText = subName;
            document.getElementById('detailGps').innerText = gps;
            document.getElementById('detailSim').innerText = sim;
            document.getElementById('detailEta').innerText = eta;
        }

        function applyAlertFilter() {
            var lvl = document.getElementById('filterAlertLevel').value.toUpperCase();
            var dev = document.getElementById('filterAlertDevice').value.toUpperCase();
            var stat = document.getElementById('filterAlertStatus').value.toUpperCase();
            var table = document.getElementById('alarmTable');
            var trs = table.querySelectorAll('tbody tr');

            trs.forEach(function (tr) {
                var text = tr.textContent.toUpperCase();
                var matchLvl = (lvl === '' || text.indexOf(lvl) > -1);
                var matchDev = (dev === '' || text.indexOf(dev) > -1);
                var matchStat = (stat === '' || text.indexOf(stat) > -1);

                if (matchLvl && matchDev && matchStat) {
                    tr.style.display = '';
                } else {
                    tr.style.display = 'none';
                }
            });
        }

        function ackAllAlerts() {
            if (confirm('Bạn có chắc chắn muốn xác nhận toàn bộ cảnh báo đang chờ xử lý?')) {
                alert('Đã ghi nhận xác nhận hàng loạt (Ack All) vào cơ sở dữ liệu!');
            }
        }

        function refreshAlerts() {
            var btn = document.querySelector('.hes-btn-refresh');
            if (btn) {
                btn.style.opacity = '0.6';
                setTimeout(function () {
                    btn.style.opacity = '1';
                    alert('Đã cập nhật danh sách cảnh báo mới nhất từ máy chủ SCADA!');
                }, 300);
            }
        }

        function saveAuditLog() {
            var note = document.getElementById('auditNotes').value;
            var act = document.getElementById('auditActionSelect').options[document.getElementById('auditActionSelect').selectedIndex].text;
            if (!note) {
                alert('Vui lòng nhập nội dung ghi chú xử lý kỹ thuật!');
                return;
            }
            alert('Đã lưu biên bản xử lý sự cố [' + act + '] thành công vào Audit Log SQL!');
            document.getElementById('auditNotes').value = '';
        }
    </script>
</asp:Content>

