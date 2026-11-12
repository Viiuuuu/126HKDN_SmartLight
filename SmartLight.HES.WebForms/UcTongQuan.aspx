<%@ Page Title="Tổng quan hệ thống" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="UcTongQuan.aspx.cs" Inherits="SmartLight.HES.WebForms.UcTongQuan" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <!-- ==========================================================================
         A. THANH TIÊU ĐỀ DASHBOARD
         ========================================================================== -->
    <div class="hes-dash-header">
        <div class="hes-dash-title-group">
            <div class="hes-dash-icon-box">
                <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>
            </div>
            <h1 class="hes-dash-title" style="font-size: 17px; text-transform: uppercase;">TỔNG QUAN HỆ THỐNG</h1>
            <span class="hes-sync-badge">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span id="hesSyncBadgeText">Đồng bộ: 14:32:45 Hôm nay</span>
            </span>
        </div>

        <div>
            <button type="button" class="hes-btn-refresh" id="hesBtnRefresh">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span>Làm mới</span>
            </button>
        </div>
    </div>

    <!-- ==========================================================================
         B. BỐN CARD THỐNG KÊ
         ========================================================================== -->
    <div class="hes-stats-grid">
        <!-- Card 1: Tổng số tủ chiếu sáng -->
        <div class="hes-stat-card">
            <div class="hes-stat-label">TỔNG SỐ TỦ CHIẾU SÁNG</div>
            <div class="hes-stat-value-row">
                <span class="hes-stat-number">04</span>
                <span class="hes-stat-subtext">Tủ điều khiển</span>
            </div>
            <div class="hes-stat-footer">
                <span class="hes-status-dot" style="background-color: #0284C7; box-shadow: none;"></span>
                <span>Phạm vi: Quận Hải Châu & Sơn Trà</span>
            </div>
        </div>

        <!-- Card 2: Tủ đang kết nối -->
        <div class="hes-stat-card">
            <div class="hes-stat-label">TỦ ĐANG KẾT NỐI</div>
            <div class="hes-stat-value-row">
                <span class="hes-stat-number">03</span>
                <span class="hes-stat-subtext">/ 04 Đang trực tuyến</span>
            </div>
            <div class="hes-stat-badges">
                <span class="hes-badge-pill hes-badge-online">
                    <span class="hes-status-dot" style="width: 6px; height: 6px;"></span> 75% Online
                </span>
                <span class="hes-badge-pill hes-badge-offline">
                    <span class="hes-status-dot" style="width: 6px; height: 6px; background-color: #EF4444;"></span> 1 Tủ lỗi
                </span>
            </div>
        </div>

        <!-- Card 3: Tổng số tuyến chiếu sáng -->
        <div class="hes-stat-card">
            <div class="hes-stat-label">TỔNG SỐ TUYẾN CHIẾU SÁNG</div>
            <div class="hes-stat-value-row">
                <span class="hes-stat-number">05</span>
                <span class="hes-stat-subtext">Tuyến lộ trình</span>
            </div>
            <div class="hes-stat-footer" style="color: #047857;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0BB78A" stroke-width="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span style="color: #334155; font-weight: 500;">100% Tuyến cài đặt hẹn giờ SCADA</span>
            </div>
        </div>

        <!-- Card 4: Tổng số điểm đèn -->
        <div class="hes-stat-card">
            <div class="hes-stat-label">TỔNG SỐ ĐIỂM ĐÈN</div>
            <div class="hes-stat-value-row">
                <span class="hes-stat-number">08</span>
                <span class="hes-stat-subtext">Bộ đèn LED Dim</span>
            </div>
            <div class="hes-stat-footer">
                <span>Công suất ước tính:</span>
                <strong style="color: var(--hes-text-main);">1.24 kW/h</strong>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         C. HAI CARD LỚN (DỊCH VỤ SCADA & BIỂU ĐỒ TRẠNG THÁI)
         ========================================================================== -->
    <div class="hes-overview-grid">
        <!-- Card Bên Trái: Trạng thái dịch vụ máy chủ SCADA -->
        <div class="hes-card">
            <div class="hes-card-header">
                <div class="hes-card-header-left">
                    <span class="hes-card-header-icon">
                        <svg viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                            <line x1="6" y1="6" x2="6.01" y2="6"></line>
                            <line x1="6" y1="18" x2="6.01" y2="18"></line>
                        </svg>
                    </span>
                    <h3 class="hes-card-title">Trạng thái dịch vụ máy chủ SCADA</h3>
                </div>
                <span class="hes-badge-stable">HỆ THỐNG ỔN ĐỊNH</span>
            </div>

            <div class="hes-services-list">
                <!-- 1. Dịch vụ HES Service -->
                <div class="hes-service-item">
                    <div class="hes-service-left">
                        <div class="hes-service-icon-wrap">
                            <svg viewBox="0 0 24 24">
                                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                                <rect x="9" y="9" width="6" height="6"></rect>
                                <line x1="9" y1="1" x2="9" y2="4"></line>
                                <line x1="15" y1="1" x2="15" y2="4"></line>
                                <line x1="9" y1="20" x2="9" y2="23"></line>
                                <line x1="15" y1="20" x2="15" y2="23"></line>
                                <line x1="20" y1="9" x2="23" y2="9"></line>
                                <line x1="20" y1="14" x2="23" y2="14"></line>
                                <line x1="1" y1="9" x2="4" y2="9"></line>
                                <line x1="1" y1="14" x2="4" y2="14"></line>
                            </svg>
                        </div>
                        <div class="hes-service-meta">
                            <div class="hes-service-name-row">
                                <span class="hes-service-name">Dịch vụ HES Service</span>
                                <span class="hes-service-pid">(PID: 4892)</span>
                            </div>
                            <span class="hes-service-desc">SmartLight.WindowsService.exe</span>
                        </div>
                    </div>
                    <div class="hes-service-right">
                        <span class="hes-pill-status hes-pill-running">
                            <span class="hes-status-dot" style="width: 6px; height: 6px;"></span> RUNNING
                        </span>
                        <span class="hes-service-subtext">Uptime: 14 ngày 06h</span>
                    </div>
                </div>

                <!-- 2. SQL Server -->
                <div class="hes-service-item">
                    <div class="hes-service-left">
                        <div class="hes-service-icon-wrap" style="background-color: #E6F4EA;">
                            <svg viewBox="0 0 24 24" style="stroke: #0BB78A;">
                                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                            </svg>
                        </div>
                        <div class="hes-service-meta">
                            <div class="hes-service-name-row">
                                <span class="hes-service-name">SQL Server (dbSmartLight)</span>
                                <span class="hes-badge-latency">12ms latency</span>
                            </div>
                            <span class="hes-service-desc">Host: localhost\SQLEXPRESS:1433</span>
                        </div>
                    </div>
                    <div class="hes-service-right">
                        <span class="hes-pill-status hes-pill-running">
                            <span class="hes-status-dot" style="width: 6px; height: 6px;"></span> CONNECTED
                        </span>
                        <span class="hes-service-subtext">Pool: 8/50 Active</span>
                    </div>
                </div>

                <!-- 3. TCP Server Core -->
                <div class="hes-service-item">
                    <div class="hes-service-left">
                        <div class="hes-service-icon-wrap" style="background-color: #E0F2FE;">
                            <svg viewBox="0 0 24 24" style="stroke: #0284C7;">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                        </div>
                        <div class="hes-service-meta">
                            <div class="hes-service-name-row">
                                <span class="hes-service-name">TCP Server Core</span>
                                <span class="hes-service-pid">Protocol: Modbus/RTU over TCP</span>
                            </div>
                            <span class="hes-service-desc">Active Sockets: 3/4 Client RTU &nbsp;&bull;&nbsp; Packet Loss: 0.0%</span>
                        </div>
                    </div>
                    <div class="hes-service-right">
                        <span class="hes-pill-status hes-pill-listening">
                            <span class="hes-status-dot" style="width: 6px; height: 6px; background-color: #0284C7;"></span> LISTENING
                        </span>
                    </div>
                </div>

                <!-- 4. Cổng TCP đang lắng nghe -->
                <div class="hes-service-item">
                    <div class="hes-service-left">
                        <div class="hes-service-icon-wrap" style="background-color: #F1F5F9;">
                            <svg viewBox="0 0 24 24" style="stroke: #475569;">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M3 12h3M18 12h3M12 3v3M12 18v3"></path>
                            </svg>
                        </div>
                        <div class="hes-service-meta">
                            <div class="hes-service-name-row">
                                <span class="hes-service-name">Cổng TCP đang lắng nghe PORT 8088</span>
                            </div>
                            <span class="hes-service-desc">Chế độ giao tiếp: [TCP/IP RAW &amp; SCADA APDU]</span>
                        </div>
                    </div>
                    <div class="hes-service-right">
                        <span class="hes-pill-ip">0.0.0.0:8088</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Card Bên Phải: Thống kê trạng thái Online / Offline -->
        <div class="hes-card">
            <div class="hes-card-header">
                <div class="hes-card-header-left">
                    <span class="hes-card-header-icon">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 14 14"></polyline>
                        </svg>
                    </span>
                    <h3 class="hes-card-title">Thống kê trạng thái Online / Offline</h3>
                </div>
                <span class="hes-header-meta">Chu kỳ quét: 30s</span>
            </div>

            <div class="hes-chart-body">
                <!-- Donut Chart SVG -->
                <div class="hes-donut-wrap">
                    <svg class="hes-donut-svg" viewBox="0 0 100 100">
                        <!-- Background Circle -->
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" stroke-width="12"></circle>
                        <!-- Green Segment (75% = 3/4) -->
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#0BB78A" stroke-width="12"
                                stroke-dasharray="179.07 238.76" stroke-dashoffset="0"></circle>
                        <!-- Red Segment (25% = 1/4) -->
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#EF4444" stroke-width="12"
                                stroke-dasharray="59.69 238.76" stroke-dashoffset="-179.07"></circle>
                    </svg>
                    <div class="hes-donut-center">
                        <span class="hes-donut-number">4</span>
                        <span class="hes-donut-sub">TỔNG TRẠM RTU</span>
                    </div>
                </div>

                <!-- Legend details -->
                <div class="hes-chart-legend">
                    <!-- Item 1: Online -->
                    <div class="hes-legend-item">
                        <div class="hes-legend-info">
                            <span class="hes-legend-dot online"></span>
                            <div>
                                <div class="hes-legend-title">Đang kết nối (Online)</div>
                                <div class="hes-legend-desc">Tủ phản hồi ping &lt; 50ms</div>
                            </div>
                        </div>
                        <div class="hes-legend-value">
                            <div class="hes-legend-count online">3 tủ</div>
                            <div class="hes-legend-percent">75.0%</div>
                        </div>
                    </div>

                    <!-- Item 2: Offline -->
                    <div class="hes-legend-item">
                        <div class="hes-legend-info">
                            <span class="hes-legend-dot offline"></span>
                            <div>
                                <div class="hes-legend-title">Mất kết nối (Offline)</div>
                                <div class="hes-legend-desc">Không có gói tin quá 60s</div>
                            </div>
                        </div>
                        <div class="hes-legend-value">
                            <div class="hes-legend-count offline">1 tủ</div>
                            <div class="hes-legend-percent">25.0%</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tỷ lệ khả dụng RTU Footer -->
            <div class="hes-chart-footer">
                <span>Tỷ lệ khả dụng mạng RTU:</span>
                <span class="hes-chart-footer-bold">99.14% trong 24h qua</span>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         D. BẢNG DANH SÁCH TỦ CHIẾU SÁNG (DỮ LIỆU TƯƠNG ỨNG DATABASE SMARTLIGHT)
         ========================================================================== -->
    <div class="hes-table-card">
        <div class="hes-table-toolbar">
            <div class="hes-table-title-group">
                <span class="hes-card-header-icon">
                    <svg viewBox="0 0 24 24">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </span>
                <h3 class="hes-card-title">Danh sách tủ chiếu sáng</h3>
                <span class="hes-badge-count" id="hesCabinetCountBadge">4 THIẾT BỊ</span>
            </div>

            <div class="hes-table-actions">
                <div class="hes-search-box">
                    <span class="hes-search-icon">
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </span>
                    <input type="text" class="hes-search-input" id="hesCabinetSearch" placeholder="Tìm theo mã hoặc tên tủ..." />
                </div>
                <button type="button" class="hes-btn-filter" id="hesBtnFilter">
                    <svg viewBox="0 0 24 24">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span>Bộ lọc</span>
                </button>
            </div>
        </div>

        <div class="hes-table-responsive" style="overflow-x: hidden;">
            <table class="hes-data-table hes-table-fit" id="hesCabinetTable">
                <thead>
                    <tr>
                        <th style="width: 85px;">MÃ TỦ</th>
                        <th style="min-width: 170px;">TÊN TỦ ĐIỀU KHIỂN</th>
                        <th style="min-width: 180px;">KHU VỰC QUẢN LÝ</th>
                        <th style="width: 130px;">TRẠNG THÁI KẾT NỐI</th>
                        <th style="width: 150px;">TRẠNG THÁI NGUỒN</th>
                        <th style="width: 165px;">LẦN KẾT NỐI CUỐI</th>
                        <th style="width: 60px; text-align: center;">TÁC VỤ</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Row 1: TC00001 – Tủ Bạch Đằng 01 -->
                    <tr>
                        <td class="hes-col-code">TC00001</td>
                        <td>
                            <div class="hes-cabinet-name">
                                <span>Tủ Bạch Đằng 01</span>
                            </div>
                        </td>
                        <td>
                            <div class="hes-col-area">
                                <svg viewBox="0 0 24 24">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>Quận Hải Châu - Bạch Đằng</span>
                            </div>
                        </td>
                        <td>
                            <span class="hes-badge-pill hes-badge-online">
                                <span class="hes-status-dot" style="width: 6px; height: 6px;"></span> Online
                            </span>
                        </td>
                        <td>
                            <span class="hes-power-pill hes-power-normal">
                                <svg viewBox="0 0 24 24">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <span>Bình thường (224V)</span>
                            </span>
                        </td>
                        <td>
                            <div class="hes-last-seen">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>Vừa xong (14:32:41)</span>
                            </div>
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-action-btn" title="Điều khiển nguồn" data-cabinet="Tủ Bạch Đằng 01" data-action="Bật/Tắt nguồn">
                                <svg viewBox="0 0 24 24">
                                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                    <line x1="12" y1="2" x2="12" y2="12"></line>
                                </svg>
                            </button>
                        </td>
                    </tr>

                    <!-- Row 2: TC00002 – Tủ 2 Tháng 9 01 -->
                    <tr>
                        <td class="hes-col-code">TC00002</td>
                        <td>
                            <div class="hes-cabinet-name">
                                <span>Tủ 2 Tháng 9 01</span>
                            </div>
                        </td>
                        <td>
                            <div class="hes-col-area">
                                <svg viewBox="0 0 24 24">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>Quận Hải Châu - Đường 2/9</span>
                            </div>
                        </td>
                        <td>
                            <span class="hes-badge-pill hes-badge-online">
                                <span class="hes-status-dot" style="width: 6px; height: 6px;"></span> Online
                            </span>
                        </td>
                        <td>
                            <span class="hes-power-pill hes-power-normal">
                                <svg viewBox="0 0 24 24">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <span>Bình thường (219V)</span>
                            </span>
                        </td>
                        <td>
                            <div class="hes-last-seen">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>5 phút trước (14:27:12)</span>
                            </div>
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-action-btn" title="Điều khiển nguồn" data-cabinet="Tủ 2 Tháng 9 01" data-action="Bật/Tắt nguồn">
                                <svg viewBox="0 0 24 24">
                                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                    <line x1="12" y1="2" x2="12" y2="12"></line>
                                </svg>
                            </button>
                        </td>
                    </tr>

                    <!-- Row 3: TC00003 – Tủ Điện Biên Phủ 01 (Mất kết nối) -->
                    <tr>
                        <td class="hes-col-code alert-code">TC00003</td>
                        <td>
                            <div class="hes-cabinet-name">
                                <span>Tủ Điện Biên Phủ 01</span>
                                <span class="hes-cabinet-warn">Cảnh báo: Mất tín hiệu truyền thông</span>
                            </div>
                        </td>
                        <td>
                            <div class="hes-col-area">
                                <svg viewBox="0 0 24 24">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>Quận Thanh Khê - Điện Biên Phủ</span>
                            </div>
                        </td>
                        <td>
                            <span class="hes-badge-pill hes-badge-offline">
                                <span class="hes-status-dot" style="width: 6px; height: 6px; background-color: #EF4444;"></span> Mất kết nối
                            </span>
                        </td>
                        <td>
                            <span class="hes-power-pill hes-power-fault">
                                <svg viewBox="0 0 24 24">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <span>Mất nguồn AC (0V)</span>
                            </span>
                        </td>
                        <td>
                            <div class="hes-last-seen alert-seen">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>1 giờ 20 phút trước (13:12:00)</span>
                            </div>
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-action-btn retry-btn" title="Thử kết nối lại RTU" data-cabinet="Tủ Điện Biên Phủ 01" data-action="Thử kết nối lại">
                                <svg viewBox="0 0 24 24">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <polyline points="1 20 1 14 7 14"></polyline>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                </svg>
                            </button>
                        </td>
                    </tr>

                    <!-- Row 4: TC00004 – Tủ Võ Nguyên Giáp 01 -->
                    <tr>
                        <td class="hes-col-code">TC00004</td>
                        <td>
                            <div class="hes-cabinet-name">
                                <span>Tủ Võ Nguyên Giáp 01</span>
                            </div>
                        </td>
                        <td>
                            <div class="hes-col-area">
                                <svg viewBox="0 0 24 24">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>Quận Sơn Trà - Võ Nguyên Giáp</span>
                            </div>
                        </td>
                        <td>
                            <span class="hes-badge-pill hes-badge-online">
                                <span class="hes-status-dot" style="width: 6px; height: 6px;"></span> Online
                            </span>
                        </td>
                        <td>
                            <span class="hes-power-pill hes-power-normal">
                                <svg viewBox="0 0 24 24">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <span>Bình thường (221V)</span>
                            </span>
                        </td>
                        <td>
                            <div class="hes-last-seen">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>12 phút trước (14:20:05)</span>
                            </div>
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-action-btn" title="Điều khiển nguồn" data-cabinet="Tủ Võ Nguyên Giáp 01" data-action="Bật/Tắt nguồn">
                                <svg viewBox="0 0 24 24">
                                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                    <line x1="12" y1="2" x2="12" y2="12"></line>
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- ==========================================================================
         E. CẢNH BÁO MỚI NHẤT (THỜI GIAN THỰC)
         ========================================================================== -->
    <div class="hes-alerts-card">
        <div class="hes-card-header">
            <div class="hes-card-header-left">
                <span class="hes-card-header-icon">
                    <svg viewBox="0 0 24 24" style="stroke: #EF4444;">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </span>
                <h3 class="hes-card-title">Cảnh báo mới nhất (Thời gian thực)</h3>
            </div>
            <span class="hes-header-meta">Băng tin: CanhBao (2 sự kiện)</span>
        </div>

        <div class="hes-alerts-list">
            <!-- Cảnh báo 1: Nghiêm trọng (Đỏ) -->
            <div class="hes-alert-item hes-alert-danger">
                <div class="hes-alert-content-group">
                    <span class="hes-alert-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </span>
                    <span class="hes-alert-time">[14:28:15]</span>
                    <span class="hes-alert-text">
                        <strong>Tủ TC00003 (Điện Biên Phủ 01)</strong> mất kết nối TCP/IP quá 5 phút. Vui lòng kiểm tra đường truyền SIM 4G/Router.
                    </span>
                </div>
                <div class="hes-alert-actions">
                    <span class="hes-badge-danger">NGHIÊM TRỌNG</span>
                    <button type="button" class="hes-alert-btn-link" onclick="alert('Đang mở quy trình kiểm tra đường truyền Tủ Điện Biên Phủ 01 (TC00003)...')">Xử lý ngay</button>
                </div>
            </div>

            <!-- Cảnh báo 2: Cảnh giác / Trung bình (Vàng) -->
            <div class="hes-alert-item hes-alert-warning">
                <div class="hes-alert-content-group">
                    <span class="hes-alert-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
                        </svg>
                    </span>
                    <span class="hes-alert-time">[13:10:02]</span>
                    <span class="hes-alert-text">
                        <strong>Điểm đèn DD_03 (Tủ 2 Tháng 9 01)</strong> nhiệt độ LED vượt ngưỡng cảnh báo (78°C / Max: 75°C). Có thể gây giảm tuổi thọ LED.
                    </span>
                </div>
                <div class="hes-alert-actions">
                    <span class="hes-badge-warning">CẢNH GIÁC</span>
                    <button type="button" class="hes-alert-btn-link" onclick="alert('Đang truy xuất thông số cảm biến nhiệt độ Điểm đèn DD_03...')">Xem cảm biến</button>
                </div>
            </div>
        </div>
    </div>
</asp:Content>

