<%@ Page Title="Giám sát thông số điện" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="UcGiamSatThongSoDien.aspx.cs" Inherits="SmartLight.HES.WebForms.UcGiamSatThongSoDien" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <!-- ==========================================================================
         A. THANH ĐIỀU KHIỂN & LỌC TRÊN CÙNG (TOP CONTROL BAR)
         ========================================================================== -->
    <div class="hes-elec-toolbar">
        <div class="hes-elec-toolbar-left">
            <!-- Radio chọn chế độ giám sát -->
            <div class="hes-mode-radio-group">
                <label class="hes-radio-label active" id="lblModeCabinet">
                    <input type="radio" name="hesModeSelect" value="cabinet" checked="checked" onchange="toggleMonitorMode('cabinet')" />
                    <span class="hes-radio-circle"><span class="hes-radio-dot"></span></span>
                    <span>Tủ Chiếu Sáng</span>
                </label>
                <label class="hes-radio-label" id="lblModeLamp">
                    <input type="radio" name="hesModeSelect" value="lamp" onchange="toggleMonitorMode('lamp')" />
                    <span class="hes-radio-circle"><span class="hes-radio-dot"></span></span>
                    <span>Điểm Đèn Đơn Lẻ</span>
                </label>
            </div>

            <!-- Dropdown chọn thiết bị giám sát -->
            <div class="hes-select-wrapper">
                <span class="hes-select-label">Thiết bị giám sát:</span>
                <select class="hes-elec-select" id="hesSelectDevice" onchange="onDeviceChanged(this.value)">
                    <option value="TU_01" selected="selected">TU_01 - Tủ Chiếu Sáng Nguyễn Huệ (Quận 1) [Online]</option>
                    <option value="TC00001">TC00001 – Tủ Bạch Đằng 01 (Quận 1) [Online]</option>
                    <option value="TC00002">TC00002 – Tủ 2 Tháng 9 01 (Quận Hải Châu) [Online]</option>
                    <option value="TC00003">TC00003 – Tủ Điện Biên Phủ 01 (Quận Thanh Khê) [Mất kết nối]</option>
                    <option value="TC00004">TC00004 – Tủ Võ Nguyên Giáp 01 (Quận Sơn Trà) [Online]</option>
                </select>
            </div>

            <!-- Badge trạng thái RTU Modbus -->
            <div class="hes-rtu-badge" id="hesRtuBadge">
                <span class="hes-rtu-dot"></span>
                <span>RTU: MODBUS-RTU / TCP READY</span>
            </div>
        </div>

        <div class="hes-elec-toolbar-right">
            <!-- Nút lấy dữ liệu tức thời -->
            <button type="button" class="hes-btn-instant" id="btnInstantRead" onclick="triggerInstantRead()">
                <svg viewBox="0 0 24 24" class="hes-btn-icon" id="iconLightning">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span id="btnInstantText">Lấy dữ liệu tức thời</span>
            </button>

            <!-- Nút chu kỳ tự động -->
            <div class="hes-dropdown-btn" id="btnAutoInterval" onclick="toggleAutoInterval()">
                <svg viewBox="0 0 24 24" class="hes-btn-icon-sub">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span id="autoIntervalText">Tự động: 10s</span>
                <svg viewBox="0 0 24 24" class="hes-dropdown-arrow">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            <!-- Nút tải/xuất dữ liệu -->
            <button type="button" class="hes-btn-icon-only" title="Tải xuống dữ liệu đo lường" onclick="exportDataExcel()">
                <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>
    </div>

    <!-- ==========================================================================
         B. HÀNG 1: BA CARD ĐO LƯỜNG LỚN (ĐIỆN ÁP 3 PHA, DÒNG ĐIỆN, CÔNG SUẤT)
         ========================================================================== -->
    <div class="hes-measure-grid">
        <!-- Card 1: Điện Áp 3 Pha (U) -->
        <div class="hes-measure-card">
            <div class="hes-measure-header">
                <div class="hes-measure-title-wrap">
                    <span class="hes-bar-indicator"></span>
                    <h3 class="hes-measure-title">Điện Áp 3 Pha (U)</h3>
                </div>
                <span class="hes-badge-threshold">Ngưỡng: 200 - 240V</span>
            </div>

            <div class="hes-phase-metrics-row">
                <!-- Pha A -->
                <div class="hes-phase-col">
                    <div class="hes-phase-col-header">
                        <span class="hes-phase-name">PHA A</span>
                        <span class="hes-badge-ok">Chuẩn</span>
                    </div>
                    <div class="hes-phase-value-row">
                        <span class="hes-phase-val" id="valUa">225.4</span>
                        <span class="hes-phase-unit">V</span>
                    </div>
                    <div class="hes-phase-bar-line bar-color-yellow"></div>
                </div>

                <!-- Pha B -->
                <div class="hes-phase-col">
                    <div class="hes-phase-col-header">
                        <span class="hes-phase-name">PHA B</span>
                        <span class="hes-badge-ok">Chuẩn</span>
                    </div>
                    <div class="hes-phase-value-row">
                        <span class="hes-phase-val" id="valUb">223.8</span>
                        <span class="hes-phase-unit">V</span>
                    </div>
                    <div class="hes-phase-bar-line bar-color-green"></div>
                </div>

                <!-- Pha C -->
                <div class="hes-phase-col">
                    <div class="hes-phase-col-header">
                        <span class="hes-phase-name">PHA C</span>
                        <span class="hes-badge-ok">Chuẩn</span>
                    </div>
                    <div class="hes-phase-value-row">
                        <span class="hes-phase-val" id="valUc">224.1</span>
                        <span class="hes-phase-unit">V</span>
                    </div>
                    <div class="hes-phase-bar-line bar-color-coral"></div>
                </div>
            </div>

            <div class="hes-measure-footer">
                <div class="hes-footer-stat">Độ lệch pha: <strong>0.71%</strong> (Tối ưu)</div>
                <div class="hes-footer-stat">Tần số lưới: <strong>50.02 Hz</strong></div>
            </div>
        </div>

        <!-- Card 2: Dòng Điện Tải (I) -->
        <div class="hes-measure-card">
            <div class="hes-measure-header">
                <div class="hes-measure-title-wrap">
                    <span class="hes-bar-indicator"></span>
                    <h3 class="hes-measure-title">Dòng Điện Tải (I)</h3>
                </div>
                <span class="hes-badge-threshold">Định mức Aptomat: 63A</span>
            </div>

            <div class="hes-phase-metrics-row">
                <!-- Ia (Pha A) -->
                <div class="hes-phase-col">
                    <div class="hes-phase-col-header">
                        <span class="hes-phase-name">Ia (Pha A)</span>
                        <svg class="hes-icon-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div class="hes-phase-value-row">
                        <span class="hes-phase-val" id="valIa">18.5</span>
                        <span class="hes-phase-unit">A</span>
                    </div>
                    <div class="hes-phase-bar-line bar-color-blue"></div>
                </div>

                <!-- Ib (Pha B) -->
                <div class="hes-phase-col">
                    <div class="hes-phase-col-header">
                        <span class="hes-phase-name">Ib (Pha B)</span>
                        <svg class="hes-icon-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div class="hes-phase-value-row">
                        <span class="hes-phase-val" id="valIb">19.2</span>
                        <span class="hes-phase-unit">A</span>
                    </div>
                    <div class="hes-phase-bar-line bar-color-blue"></div>
                </div>

                <!-- Ic (Pha C) -->
                <div class="hes-phase-col">
                    <div class="hes-phase-col-header">
                        <span class="hes-phase-name">Ic (Pha C)</span>
                        <svg class="hes-icon-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div class="hes-phase-value-row">
                        <span class="hes-phase-val" id="valIc">18.0</span>
                        <span class="hes-phase-unit">A</span>
                    </div>
                    <div class="hes-phase-bar-line bar-color-blue"></div>
                </div>
            </div>

            <div class="hes-measure-footer">
                <div class="hes-footer-stat">Tải trung bình: <strong>29.4%</strong></div>
                <div class="hes-footer-stat">Dòng rò rỉ (In): <strong>12 mA</strong></div>
            </div>
        </div>

        <!-- Card 3: Công Suất & Năng Lượng -->
        <div class="hes-measure-card">
            <div class="hes-measure-header">
                <div class="hes-measure-title-wrap">
                    <span class="hes-bar-indicator"></span>
                    <h3 class="hes-measure-title">Công Suất & Năng Lượng</h3>
                </div>
                <div class="hes-timestamp-box">
                    <span id="hesLiveTime">14:32:00</span>
                    <span id="hesLiveDate">24/10/2024</span>
                </div>
            </div>

            <div class="hes-power-energy-row">
                <!-- Công suất tổng (P) -->
                <div class="hes-pe-col">
                    <div class="hes-pe-label">CÔNG SUẤT TỔNG (P)</div>
                    <div class="hes-pe-value-row">
                        <span class="hes-pe-val val-blue" id="valTotalP">12.6</span>
                        <span class="hes-pe-unit">kW</span>
                    </div>
                    <div class="hes-pe-subtext">Hệ số cos&phi;: <strong id="valCosPhi">0.96</strong></div>
                </div>

                <!-- Điện năng tích lũy -->
                <div class="hes-pe-col">
                    <div class="hes-pe-label">ĐIỆN NĂNG TÍCH LŨY</div>
                    <div class="hes-pe-value-row">
                        <span class="hes-pe-val" id="valTotalEnergy">1,482.5</span>
                        <span class="hes-pe-unit">kWh</span>
                    </div>
                    <div class="hes-pe-subtext color-green">
                        <svg class="hes-icon-trend" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                        <span>Hôm nay: <strong>+42.1 kWh</strong></span>
                    </div>
                </div>
            </div>

            <div class="hes-measure-footer">
                <div class="hes-footer-stat">Khí thải CO₂ quy đổi: <strong>1,023 kg</strong></div>
                <div class="hes-footer-stat"><span class="hes-status-dot-inline"></span> Đo lường thời gian thực</div>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         C. HÀNG 2: CARD ĐIỂM ĐÈN GIÁM SÁT ĐIỂN HÌNH
         ========================================================================== -->
    <div class="hes-featured-lamp-card">
        <div class="hes-lamp-card-header">
            <div class="hes-lamp-header-left">
                <div class="hes-lamp-icon-circle">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path>
                        <line x1="9" y1="21" x2="15" y2="21"></line>
                    </svg>
                </div>
                <div class="hes-lamp-title-wrap">
                    <div class="hes-lamp-title-row">
                        <h3 class="hes-lamp-title">Điểm Đèn Giám Sát Điển Hình: DD_01 (Tuyến 1 - Nguyễn Huệ)</h3>
                        <span class="hes-badge-single-phase">1 Pha (Chuẩn CSDL)</span>
                    </div>
                    <div class="hes-lamp-subinfo">Model LED Phillips 150W LoRaWAN Mesh &bull; Cột số C01-08 &bull; Tuyến pha A</div>
                </div>
            </div>
            <div class="hes-lamp-header-right">
                <span class="hes-lamp-last-time">Đo gần nhất: 14:31:55</span>
                <a href="javascript:void(0)" class="hes-lamp-detail-link" onclick="alert('Mở chi tiết điểm đèn DD_01')">Xem chi tiết đèn &rarr;</a>
            </div>
        </div>

        <div class="hes-lamp-tiles-grid">
            <!-- Ô 1: Điện áp tức thời -->
            <div class="hes-lamp-tile">
                <span class="hes-tile-lbl">Điện áp tức thời</span>
                <div class="hes-tile-val">224.2 <span class="hes-tile-unit">V</span></div>
                <span class="hes-tile-sub color-green">Bình thường (&plusmn;1.8%)</span>
            </div>

            <!-- Ô 2: Dòng điện (I) -->
            <div class="hes-lamp-tile">
                <span class="hes-tile-lbl">Dòng điện (I)</span>
                <div class="hes-tile-val">0.68 <span class="hes-tile-unit">A</span></div>
                <span class="hes-tile-sub">Tải định mức: 0.72A</span>
            </div>

            <!-- Ô 3: Công suất thực tế -->
            <div class="hes-lamp-tile">
                <span class="hes-tile-lbl">Công suất thực tế</span>
                <div class="hes-tile-val">152.4 <span class="hes-tile-unit">W</span></div>
                <span class="hes-tile-sub">Tiêu chuẩn: 150W</span>
            </div>

            <!-- Ô 4: Nhiệt độ chip LED -->
            <div class="hes-lamp-tile">
                <span class="hes-tile-lbl">Nhiệt độ chip LED</span>
                <div class="hes-tile-val">54.5 <span class="hes-tile-unit">&deg;C</span></div>
                <span class="hes-tile-sub color-green"><span class="hes-status-dot-inline"></span> An toàn (&lt; 75&deg;C)</span>
            </div>

            <!-- Ô 5: Độ sáng hiện tại -->
            <div class="hes-lamp-tile">
                <span class="hes-tile-lbl">Độ sáng hiện tại</span>
                <div class="hes-tile-val">80 <span class="hes-tile-unit">%</span></div>
                <div class="hes-tile-progress">
                    <div class="hes-tile-bar" style="width: 80%;"></div>
                </div>
            </div>

            <!-- Ô 6: Chất lượng RSSI -->
            <div class="hes-lamp-tile">
                <span class="hes-tile-lbl">Chất lượng RSSI</span>
                <div class="hes-tile-val">-68 <span class="hes-tile-unit">dBm</span></div>
                <span class="hes-tile-sub">Sóng cực tốt (Hop 1)</span>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         D. HÀNG 3: BIỂU ĐỒ LỊCH SỬ DAO ĐỘNG ĐIỆN ÁP 3 PHA & CÔNG SUẤT
         ========================================================================== -->
    <div class="hes-history-chart-card">
        <div class="hes-chart-card-header">
            <div class="hes-chart-title-wrap">
                <div class="hes-chart-main-title">
                    <svg class="hes-chart-icon-title" viewBox="0 0 24 24">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <h3 class="hes-measure-title">Lịch Sử Dao Động Điện Áp 3 Pha (V) &amp; Công Suất (kW)</h3>
                </div>
                <div class="hes-chart-sub-title">Quan trắc liên tục 24 giờ qua theo chuẩn truyền thông Modbus RTU/TCP</div>
            </div>
            <div class="hes-chart-legends-row">
                <div class="hes-legend-item"><span class="hes-legend-line color-yellow"></span> Pha A (V)</div>
                <div class="hes-legend-item"><span class="hes-legend-line color-green"></span> Pha B (V)</div>
                <div class="hes-legend-item"><span class="hes-legend-line color-coral"></span> Pha C (V)</div>
                <div class="hes-legend-item"><span class="hes-legend-line color-blue-dashed"></span> Công Suất P (kW)</div>
            </div>
        </div>

        <div class="hes-dual-chart-svg-wrap">
            <svg viewBox="0 0 1000 240" preserveAspectRatio="none" style="width: 100%; height: 230px; display: block;">
                <defs>
                    <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#2563EB" stop-opacity="0.16"/>
                        <stop offset="100%" stop-color="#2563EB" stop-opacity="0.0"/>
                    </linearGradient>
                </defs>

                <!-- Lưới trục Y ngang -->
                <line x1="55" y1="40" x2="945" y2="40" stroke="#F1F5F9" stroke-width="1"/>
                <line x1="55" y1="85" x2="945" y2="85" stroke="#F1F5F9" stroke-width="1"/>
                <line x1="55" y1="130" x2="945" y2="130" stroke="#F1F5F9" stroke-width="1"/>
                <line x1="55" y1="175" x2="945" y2="175" stroke="#F1F5F9" stroke-width="1"/>
                <line x1="55" y1="195" x2="945" y2="195" stroke="#E2E8F0" stroke-width="1.2"/>

                <!-- Nhãn trục Y bên trái (Điện áp V) -->
                <text x="45" y="44" font-size="11" fill="#94A3B8" font-weight="600" text-anchor="end">240V</text>
                <text x="45" y="89" font-size="11" fill="#94A3B8" font-weight="600" text-anchor="end">230V</text>
                <text x="45" y="134" font-size="11" fill="#94A3B8" font-weight="600" text-anchor="end">220V</text>
                <text x="45" y="179" font-size="11" fill="#94A3B8" font-weight="600" text-anchor="end">210V</text>

                <!-- Nhãn trục Y bên phải (Công suất kW) -->
                <text x="955" y="44" font-size="11" fill="#94A3B8" font-weight="600" text-anchor="start">16kW</text>
                <text x="955" y="89" font-size="11" fill="#94A3B8" font-weight="600" text-anchor="start">12kW</text>
                <text x="955" y="134" font-size="11" fill="#94A3B8" font-weight="600" text-anchor="start">8kW</text>
                <text x="955" y="179" font-size="11" fill="#94A3B8" font-weight="600" text-anchor="start">4kW</text>

                <!-- Vùng bóng mờ cho Công suất (P) -->
                <path d="M 80 180 C 180 180, 230 182, 280 182 C 380 182, 430 185, 480 185 C 580 185, 630 178, 680 175 C 740 170, 800 120, 880 78 L 880 195 L 80 195 Z"
                      fill="url(#powerGradient)" />

                <!-- Đường đứt nét Công Suất P (kW) -->
                <path d="M 80 180 C 180 180, 230 182, 280 182 C 380 182, 430 185, 480 185 C 580 185, 630 178, 680 175 C 740 170, 800 120, 880 78"
                      fill="none" stroke="#2563EB" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round" />

                <!-- Đường chỉ thị dọc tại điểm 14:30 hiện tại -->
                <line x1="880" y1="78" x2="880" y2="195" stroke="#2563EB" stroke-width="1.2" stroke-dasharray="3 3"/>

                <!-- Đường Pha A (V) - Vàng -->
                <path d="M 80 108 C 180 109, 230 110, 280 110 C 380 110, 430 112, 480 112 C 580 112, 630 107, 680 107 C 780 107, 830 104, 880 104"
                      fill="none" stroke="#F59E0B" stroke-width="2.4" stroke-linecap="round" />

                <!-- Đường Pha B (V) - Xanh lá -->
                <path d="M 80 116 C 180 116.5, 230 117, 280 117 C 380 117, 430 118, 480 118 C 580 118, 630 114, 680 114 C 780 114, 830 111, 880 111"
                      fill="none" stroke="#10B981" stroke-width="2.4" stroke-linecap="round" />

                <!-- Đường Pha C (V) - Đỏ San Hô -->
                <path d="M 80 114 C 180 114.5, 230 115, 280 115 C 380 115, 430 116, 480 116 C 580 116, 630 111, 680 111 C 780 111, 830 109, 880 109"
                      fill="none" stroke="#EF4444" stroke-width="2.4" stroke-linecap="round" />

                <!-- Điểm đánh dấu tròn tại 14:30 -->
                <circle cx="880" cy="104" r="3.5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.5" />
                <circle cx="880" cy="111" r="3.5" fill="#10B981" stroke="#FFFFFF" stroke-width="1.5" />
                <circle cx="880" cy="109" r="3.5" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.5" />
                <circle cx="880" cy="78" r="5" fill="#2563EB" stroke="#FFFFFF" stroke-width="2.5" />

                <!-- Nhãn trục X thời gian -->
                <text x="80" y="215" font-size="11.5" fill="#64748B" font-weight="600" text-anchor="middle">00:00</text>
                <text x="280" y="215" font-size="11.5" fill="#64748B" font-weight="600" text-anchor="middle">04:00</text>
                <text x="480" y="215" font-size="11.5" fill="#64748B" font-weight="600" text-anchor="middle">08:00</text>
                <text x="680" y="215" font-size="11.5" fill="#64748B" font-weight="600" text-anchor="middle">12:00</text>
                <text x="880" y="215" font-size="11.5" fill="#1E40AF" font-weight="700" text-anchor="middle">14:30 (Hiện tại)</text>
            </svg>
        </div>
    </div>

    <!-- ==========================================================================
         E. HÀNG 4: NHẬT KÝ DỮ LIỆU ĐO LƯỜNG TỨC THỜI
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
                <h3 class="hes-card-title">Nhật Ký Dữ Liệu Đo Lường Tức Thời</h3>
                <span class="hes-badge-primary-top">TOP 50 BẢN GHI</span>
            </div>
            <div class="hes-table-actions">
                <div class="hes-search-box">
                    <span class="hes-search-icon">
                        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input type="text" class="hes-search-input" id="hesTableSearch" placeholder="Tìm theo thời gian / mã..." onkeyup="filterLogTable()" />
                </div>
                <button type="button" class="hes-btn-filter" onclick="alert('Đang mở bộ lọc thời gian & thông số chi tiết...')">
                    <svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    <span>Bộ lọc</span>
                </button>
            </div>
        </div>

        <div class="hes-table-responsive" style="overflow-x: hidden;">
            <table class="hes-data-table hes-table-fit" id="hesLogTable">
                <thead>
                    <tr>
                        <th style="width: 140px;">MÃ BẢN GHI</th>
                        <th style="width: 135px;">THỜI GIAN ĐO</th>
                        <th style="width: 58px; text-align: center;">UA (V)</th>
                        <th style="width: 58px; text-align: center;">UB (V)</th>
                        <th style="width: 58px; text-align: center;">UC (V)</th>
                        <th style="width: 52px; text-align: center;">IA (A)</th>
                        <th style="width: 52px; text-align: center;">IB (A)</th>
                        <th style="width: 52px; text-align: center;">IC (A)</th>
                        <th style="width: 85px; text-align: right;">P_TỔNG (KW)</th>
                        <th style="width: 110px; text-align: right;">SẢN LƯỢNG (KWH)</th>
                        <th style="width: 95px; text-align: center;">TÌNH TRẠNG</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="hes-col-code-link" onclick="viewRecordDetail('REC_20241024_08942')">REC_20241024_08942</td>
                        <td>14:32:00 24/10/2024</td>
                        <td style="text-align: center;">225.4</td>
                        <td style="text-align: center;">223.8</td>
                        <td style="text-align: center;">224.1</td>
                        <td style="text-align: center;">18.5</td>
                        <td style="text-align: center;">19.2</td>
                        <td style="text-align: center;">18.0</td>
                        <td style="text-align: right;"><strong style="color: var(--hes-primary);">12.60</strong></td>
                        <td style="text-align: right;">1,482.50</td>
                        <td style="text-align: center;"><span class="hes-badge-tag tag-normal">● Chuẩn tải</span></td>
                    </tr>
                    <tr>
                        <td class="hes-col-code-link" onclick="viewRecordDetail('REC_20241024_08941')">REC_20241024_08941</td>
                        <td>14:31:50 24/10/2024</td>
                        <td style="text-align: center;">225.2</td>
                        <td style="text-align: center;">223.6</td>
                        <td style="text-align: center;">224.0</td>
                        <td style="text-align: center;">18.4</td>
                        <td style="text-align: center;">19.1</td>
                        <td style="text-align: center;">18.0</td>
                        <td style="text-align: right;"><strong style="color: var(--hes-primary);">12.55</strong></td>
                        <td style="text-align: right;">1,482.47</td>
                        <td style="text-align: center;"><span class="hes-badge-tag tag-normal">● Chuẩn tải</span></td>
                    </tr>
                    <tr>
                        <td class="hes-col-code-link" onclick="viewRecordDetail('REC_20241024_08940')">REC_20241024_08940</td>
                        <td>14:31:40 24/10/2024</td>
                        <td style="text-align: center;">225.5</td>
                        <td style="text-align: center;">223.9</td>
                        <td style="text-align: center;">224.2</td>
                        <td style="text-align: center;">18.5</td>
                        <td style="text-align: center;">19.3</td>
                        <td style="text-align: center;">18.1</td>
                        <td style="text-align: right;"><strong style="color: var(--hes-primary);">12.62</strong></td>
                        <td style="text-align: right;">1,482.43</td>
                        <td style="text-align: center;"><span class="hes-badge-tag tag-normal">● Chuẩn tải</span></td>
                    </tr>
                    <tr>
                        <td class="hes-col-code-link" onclick="viewRecordDetail('REC_20241024_08939')">REC_20241024_08939</td>
                        <td>14:31:30 24/10/2024</td>
                        <td style="text-align: center;">225.1</td>
                        <td style="text-align: center;">223.5</td>
                        <td style="text-align: center;">224.0</td>
                        <td style="text-align: center;">18.4</td>
                        <td style="text-align: center;">19.0</td>
                        <td style="text-align: center;">17.9</td>
                        <td style="text-align: right;"><strong style="color: var(--hes-primary);">12.52</strong></td>
                        <td style="text-align: right;">1,482.40</td>
                        <td style="text-align: center;"><span class="hes-badge-tag tag-normal">● Chuẩn tải</span></td>
                    </tr>
                    <tr>
                        <td class="hes-col-code-link" onclick="viewRecordDetail('REC_20241024_08938')">REC_20241024_08938</td>
                        <td>14:31:20 24/10/2024</td>
                        <td style="text-align: center;">226.0</td>
                        <td style="text-align: center;">224.2</td>
                        <td style="text-align: center;">224.8</td>
                        <td style="text-align: center;">19.8</td>
                        <td style="text-align: center;">20.1</td>
                        <td style="text-align: center;">19.2</td>
                        <td style="text-align: right;"><strong style="color: var(--hes-primary);">13.40</strong></td>
                        <td style="text-align: right;">1,482.36</td>
                        <td style="text-align: center;"><span class="hes-badge-tag tag-peak">● Tải đỉnh</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="hes-table-footer-row">
            <div class="hes-footer-info">
                Hiển thị 1 đến 5 của 1,420 bản ghi &nbsp;|&nbsp; Thời gian truy vấn SQL: <strong>14ms</strong>
            </div>
            <div class="hes-pagination">
                <button type="button" class="hes-page-nav" title="Về trang đầu">&vert;&lt;</button>
                <button type="button" class="hes-page-nav" title="Trang trước">&lt;</button>
                <button type="button" class="hes-page-num active">1</button>
                <button type="button" class="hes-page-num">2</button>
                <button type="button" class="hes-page-num">3</button>
                <span class="hes-page-ellipsis">...</span>
                <button type="button" class="hes-page-num">284</button>
                <button type="button" class="hes-page-nav" title="Trang sau">&gt;</button>
                <button type="button" class="hes-page-nav" title="Đến trang cuối">&gt;&vert;</button>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         F. FOOTER STATUS STRIP THEO CHUẨN SCADA
         ========================================================================== -->
    <div class="hes-bottom-status-strip">
        <div class="hes-bottom-status-left">
            <span class="hes-status-dot-green"></span>
            <span class="hes-engine-badge">Engine .NET 8.0</span>
            <span class="hes-badge-arch">x64</span>
            <span class="hes-gateway-text">HES Gateway Server v3.4.1</span>
        </div>
        <div class="hes-bottom-status-middle">
            <span>HES Service: Hoạt động liên tục (PID: 4092)</span>
            <span class="hes-status-sep">&bull;</span>
            <span>SQL Server: Đã kết nối (dbSmartLight)</span>
            <span class="hes-status-sep">&bull;</span>
            <span>TCP Server: Đang lắng nghe Port 8088 (3 Tủ Online)</span>
            <span class="hes-status-sep">&bull;</span>
            <span id="hesLastSyncTime">Đồng bộ lần cuối: 14:32:05 24/10/2024</span>
        </div>
        <div class="hes-bottom-status-right">
            <span class="hes-badge-ready">READY</span>
        </div>
    </div>

    <!-- Script tương tác tức thời cho trang giám sát thông số điện -->
    <script type="text/javascript">
        function toggleMonitorMode(mode) {
            var lblCabinet = document.getElementById('lblModeCabinet');
            var lblLamp = document.getElementById('lblModeLamp');
            if (mode === 'cabinet') {
                lblCabinet.classList.add('active');
                lblLamp.classList.remove('active');
            } else {
                lblLamp.classList.add('active');
                lblCabinet.classList.remove('active');
            }
        }

        function onDeviceChanged(deviceVal) {
            console.log('Chuyển thiết bị giám sát:', deviceVal);
            var btn = document.getElementById('btnInstantRead');
            if (btn) {
                btn.style.opacity = '0.7';
                setTimeout(function () {
                    btn.style.opacity = '1';
                }, 300);
            }
        }

        function triggerInstantRead() {
            var icon = document.getElementById('iconLightning');
            var btnText = document.getElementById('btnInstantText');
            if (icon && btnText) {
                btnText.innerText = 'Đang đọc...';
                icon.style.transform = 'scale(1.2) rotate(15deg)';
                setTimeout(function () {
                    btnText.innerText = 'Lấy dữ liệu tức thời';
                    icon.style.transform = 'none';

                    // Cập nhật ngẫu nhiên nhẹ để minh họa tương tác trực quan
                    var now = new Date();
                    var timeStr = now.toTimeString().split(' ')[0];
                    var liveTime = document.getElementById('hesLiveTime');
                    if (liveTime) liveTime.innerText = timeStr;
                    var lastSync = document.getElementById('hesLastSyncTime');
                    if (lastSync) lastSync.innerText = 'Đồng bộ lần cuối: ' + timeStr + ' ' + now.toLocaleDateString('vi-VN');
                }, 600);
            }
        }

        var autoIntervals = ['Tự động: 5s', 'Tự động: 10s', 'Tự động: 30s', 'Tự động: 60s'];
        var currentIntervalIdx = 1;
        function toggleAutoInterval() {
            currentIntervalIdx = (currentIntervalIdx + 1) % autoIntervals.length;
            var txt = document.getElementById('autoIntervalText');
            if (txt) {
                txt.innerText = autoIntervals[currentIntervalIdx];
            }
        }

        function exportDataExcel() {
            alert('Trích xuất dữ liệu thông số điện bảng DuLieuGiamSatTu ra file Excel thành công!');
        }

        function viewRecordDetail(recordId) {
            alert('Xem chi tiết bản ghi dữ liệu SCADA: ' + recordId);
        }

        function filterLogTable() {
            var input = document.getElementById('hesTableSearch');
            var filter = input.value.toUpperCase();
            var table = document.getElementById('hesLogTable');
            var trs = table.getElementsByTagName('tr');

            for (var i = 1; i < trs.length; i++) {
                var text = trs[i].textContent || trs[i].innerText;
                if (text.toUpperCase().indexOf(filter) > -1) {
                    trs[i].style.display = '';
                } else {
                    trs[i].style.display = 'none';
                }
            }
        }
    </script>
</asp:Content>

