<%@ Page Title="Điều khiển thiết bị" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="UcDieuKhienThietBi.aspx.cs" Inherits="SmartLight.HES.WebForms.UcDieuKhienThietBi" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <!-- ==========================================================================
         A. THANH TRẠNG THÁI & ĐIỀU HÀNH TRÊN CÙNG
         ========================================================================== -->
    <div class="hes-ctrl-toolbar">
        <div class="hes-ctrl-toolbar-left">
            <div class="hes-dash-icon-box" style="width: 34px; height: 34px;">
                <svg viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
            </div>
            <h1 class="hes-dash-title" style="font-size: 17px; text-transform: uppercase;">ĐIỀU KHIỂN TỨC THỜI HỆ THỐNG</h1>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div class="hes-ctrl-badge-op">
                CHẾ ĐỘ VẬN HÀNH: <strong>THỦ CÔNG (ADMIN)</strong>
            </div>

            <div class="hes-ctrl-badge-tcp">
                <span class="hes-status-dot-inline" style="background-color: #10B981;"></span>
                <span>TCP Server Ready (Đang đồng bộ)</span>
            </div>

            <div class="hes-ctrl-badge-token">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2.2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Admin Token: <strong>#ADM-SCADA-SECURE</strong></span>
            </div>

            <button type="button" class="hes-btn-tree-refresh" onclick="refreshTree()">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span>Làm mới cây</span>
            </button>
        </div>
    </div>

    <!-- ==========================================================================
         B. BỐ CỤC CHÍNH 3 CỘT (CÂY THIẾT BỊ | THÔNG TIN CHI TIẾT | GỬI LỆNH)
         ========================================================================== -->
    <div class="hes-ctrl-grid">
        <!-- ================= CỘT 1: CÂY THIẾT BỊ HỆ THỐNG ================= -->
        <div class="hes-ctrl-card">
            <div>
                <div class="hes-ctrl-card-header">
                    <div class="hes-ctrl-card-title-group">
                        <svg viewBox="0 0 24 24">
                            <rect x="2" y="3" width="6" height="6" rx="1"></rect>
                            <rect x="16" y="3" width="6" height="6" rx="1"></rect>
                            <rect x="9" y="15" width="6" height="6" rx="1"></rect>
                            <path d="M5 9v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"></path>
                            <line x1="12" y1="14" x2="12" y2="15"></line>
                        </svg>
                        <h3 class="hes-ctrl-card-title">CÂY THIẾT BỊ HỆ THỐNG</h3>
                    </div>
                    <span class="hes-badge-primary-top">Đang tải...</span>
                </div>

                <!-- Ô tìm kiếm trong cây -->
                <div class="hes-tree-search-box">
                    <span class="hes-tree-search-icon">
                        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input type="text" id="treeSearchInput" placeholder="Tìm kiếm theo mã tủ, tuyến, đèn..." onkeyup="filterDeviceTree()" />
                </div>

                <!-- Cây phân cấp thiết bị động từ SQL -->
                <div class="hes-tree-scroll-area" id="deviceTreeRoot">
                    <div style="padding: 30px 16px; text-align: center; color: #94A3B8; font-size: 13px;">
                        <span class="hes-status-dot-inline" style="background-color: #2563EB; width: 8px; height: 8px;"></span>
                        <span>Đang đồng bộ cây phân cấp từ cơ sở dữ liệu...</span>
                    </div>
                </div>
            </div>

            <div class="hes-tree-footer-info">
                <span>Chọn 1 đối tượng: <strong>Tủ / Tuyến / Đèn</strong></span>
                <strong style="color: #2563EB;" id="treeSelectedCountText">1 Đối tượng</strong>
            </div>
        </div>

        <!-- ================= CỘT 2: THÔNG TIN CHI TIẾT ĐỐI TƯỢNG ================= -->
        <div class="hes-ctrl-card">
            <div>
                <div class="hes-ctrl-card-header">
                    <div class="hes-ctrl-card-title-group">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <h3 class="hes-ctrl-card-title">THÔNG TIN CHI TIẾT ĐỐI TƯỢNG</h3>
                    </div>
                    <span class="hes-badge-primary-top" id="detailTargetBadge">ID: --</span>
                </div>

                <!-- Hộp trạng thái lớn nổi bật (Hero status) -->
                <div class="hes-hero-lamp-box">
                    <div class="hes-hero-left">
                        <div class="hes-lamp-avatar">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path>
                                <line x1="9" y1="21" x2="15" y2="21"></line>
                            </svg>
                        </div>
                        <div>
                            <div class="hes-hero-label" id="detailHeroStatusLabel">TRẠNG THÁI HOẠT ĐỘNG</div>
                            <div class="hes-hero-status-val" id="detailLampStatus">
                                <span class="hes-status-dot-inline" style="background-color: #94A3B8;"></span>
                                <span>ĐANG CẬP NHẬT</span>
                            </div>
                        </div>
                    </div>

                    <div class="hes-hero-right">
                        <div class="hes-hero-label">MỨC ĐIỀU TIẾT (DIM)</div>
                        <div class="hes-hero-dim-val" id="detailDimVal">-- %</div>
                    </div>
                </div>

                <!-- Bảng thuộc tính đối tượng -->
                <div class="hes-attr-table">
                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                            Mã thiết bị:
                        </span>
                        <span class="hes-attr-val" id="attrCode" style="color: #2563EB; font-weight: 700;">--</span>
                    </div>

                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                            Tên thiết bị:
                        </span>
                        <span class="hes-attr-val" id="attrName">--</span>
                    </div>

                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            Phân cấp &amp; Thuộc tính:
                        </span>
                        <span class="hes-attr-val" id="attrType">--</span>
                    </div>

                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            Công suất tiêu thụ:
                        </span>
                        <span class="hes-attr-val" id="attrPower">--</span>
                    </div>

                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>
                            Thông số đo kèm theo:
                        </span>
                        <span class="hes-attr-val" id="attrTemp">--</span>
                    </div>

                    <div class="hes-attr-row" style="border-bottom: none;">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            Dữ liệu đo gần nhất:
                        </span>
                        <span class="hes-attr-val" id="attrLastSeen" style="color: #64748B;">--</span>
                    </div>
                </div>

                <!-- Thước đo mức sáng / tải -->
                <div class="hes-load-gauge-wrap">
                    <div class="hes-gauge-label-row">
                        <span>Mức điều tiết công suất (Tải định mức)</span>
                        <strong style="color: #2563EB;" id="gaugePercentText">0%</strong>
                    </div>
                    <div class="hes-gauge-track-lg">
                        <div class="hes-gauge-fill-lg" id="gaugeFillBar" style="width: 0%;"></div>
                    </div>
                </div>
            </div>

            <div class="hes-tree-footer-info">
                <span>Giao thức: <strong>Modbus-RTU / APDU TCP</strong></span>
                <span>Hệ thống: <strong>SCADA Live</strong></span>
            </div>
        </div>

        <!-- ================= CỘT 3: BẢNG ĐIỀU KHIỂN LỆNH ================= -->
        <div class="hes-ctrl-card">
            <div>
                <div class="hes-ctrl-card-header">
                    <div class="hes-ctrl-card-title-group">
                        <svg viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <h3 class="hes-ctrl-card-title">BẢNG ĐIỀU KHIỂN LỆNH</h3>
                    </div>
                    <span class="hes-badge-admin-only">Admin Only</span>
                </div>

                <!-- Hộp cảnh báo cơ chế an toàn 2 lớp (Safety Interlock) -->
                <div class="hes-safety-box">
                    <div class="hes-safety-title">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <span>Cơ chế an toàn 2 lớp (Safety Interlock)</span>
                    </div>
                    <div class="hes-safety-desc" id="ctrlTargetNotice">
                        Chọn một Tủ, Tuyến hoặc Điểm đèn trong cây bên trái để phát lệnh điều khiển qua mạng SCADA.
                    </div>
                </div>

                <!-- Cảnh báo nếu Tủ đang Offline -->
                <div id="ctrlOfflineWarning" style="display: none; background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; padding: 10px 14px; border-radius: 6px; font-size: 12px; margin-bottom: 12px; line-height: 1.5;">
                    ⚠️ <strong>Cảnh báo:</strong> Thiết bị thuộc Tủ đang mất kết nối TCP (Offline). Lệnh sẽ được lưu vào hàng đợi SQL và tự động phát khi tủ kết nối lại.
                </div>

                <!-- Tóm tắt đối tượng đang chọn -->
                <div id="ctrlTargetSummary" style="margin-bottom: 12px; padding: 9px 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                    <span style="color: #64748B; font-weight: 600; flex-shrink: 0;">MỤC TIÊU LỆNH:</span>
                    <strong id="ctrlTargetLabel" style="color: #073B63; font-size: 12.5px; word-break: break-word; text-align: right; flex: 1 1 auto; min-width: 0;">Chưa chọn đối tượng</strong>
                </div>

                <!-- 1. ĐIỀU KHIỂN ĐÓNG CẮT NGUỒN ĐIỆN -->
                <div class="hes-section-label">ĐIỀU KHIỂN ĐÓNG CẮT NGUỒN ĐIỆN:</div>
                <div class="hes-switch-btn-grid">
                    <!-- Nút BẬT -->
                    <button type="button" class="hes-btn-power hes-btn-turn-on" onclick="openSafetyModal('BAT', '100%')">
                        <div class="hes-btn-power-title">
                            <svg viewBox="0 0 24 24">
                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                <line x1="12" y1="2" x2="12" y2="12"></line>
                            </svg>
                            <span id="btnPowerOnText">BẬT THIẾT BỊ</span>
                        </div>
                    </button>

                    <!-- Nút TẮT -->
                    <button type="button" class="hes-btn-power hes-btn-turn-off" onclick="openSafetyModal('TAT', '0%')">
                        <div class="hes-btn-power-title">
                            <svg viewBox="0 0 24 24">
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                                <path d="M10.71 5.05A16 16 0 0 1 22.56 9"></path>
                                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                                <line x1="12" y1="20" x2="12.01" y2="20"></line>
                            </svg>
                            <span id="btnPowerOffText">TẮT THIẾT BỊ</span>
                        </div>
                        <div class="hes-btn-power-sub" id="btnPowerOffSub">LỆNH: CẮT TẢI</div>
                    </button>
                </div>

                <!-- 2. CÀI ĐẶT MỨC SÁNG (DIM) -->
                <div class="hes-dim-setting-box">
                    <div class="hes-dim-header-row">
                        <span class="hes-dim-title">
                            <svg viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            <span>Cài đặt mức sáng (DIM):</span>
                        </span>
                        <div class="hes-dim-stepper">
                            <input type="number" id="dimNumberInput" min="0" max="100" value="70" onchange="onDimNumberChange(this.value)" />
                            <span>%</span>
                        </div>
                    </div>

                    <!-- Thanh trượt slider -->
                    <div class="hes-slider-container">
                        <div class="hes-slider-wrap">
                            <input type="range" class="hes-range-slider" id="dimRangeSlider" min="0" max="100" value="70" style="--dim-level: 70%;" oninput="onDimSliderInput(this.value)" />
                        </div>
                        <div class="hes-slider-ticks">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <!-- Nút gửi lệnh DIM -->
                    <button type="button" class="hes-btn-send-dim" id="btnSendDim" onclick="openSafetyModal('DIM', (window.currentDimLevel !== undefined ? window.currentDimLevel : 70) + '%')">
                        <svg viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span id="btnSendDimLabel">GỬI LỆNH DIM (70%)</span>
                    </button>
                </div>
            </div>

            <div class="hes-tree-footer-info">
                <span>Timeout chờ ACK: <strong>5000 ms</strong></span>
                <span>Kênh: <strong>SmartLight TCP Core</strong></span>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         C. HÀNG 2: BẢNG NHẬT KÝ LỆNH ĐIỀU KHIỂN GẦN ĐÂY (LENHDIEUKHIEN)
         ========================================================================== -->
    <div class="hes-table-card">
        <div class="hes-table-toolbar">
            <div class="hes-table-title-group">
                <span class="hes-card-header-icon">
                    <svg viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                </span>
                <h3 class="hes-card-title">NHẬT KÝ LỆNH ĐIỀU KHIỂN THỜI GIAN THỰC</h3>
                <span class="hes-badge-primary-top">Polling tự động</span>
            </div>
            <div class="hes-table-actions">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 12px; color: #64748B; font-weight: 600;">Lọc đối tượng:</span>
                    <select class="hes-elec-select" id="filterTargetLog" style="padding: 5px 28px 5px 10px; font-size: 12px;" onchange="filterLogByDevice(this.value)">
                        <option value="ALL">Tất cả thiết bị</option>
                    </select>
                </div>
                <a href="HesApi.ashx?action=exportcommands" class="hes-btn-filter" style="text-decoration:none; display:inline-flex; align-items:center;">
                    <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Xuất CSV</span>
                </a>
            </div>
        </div>

        <div class="hes-table-responsive" style="overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch;">
            <table class="hes-data-table hes-table-fit" id="cmdLogTable">
                <thead>
                    <tr>
                        <th style="width: 135px;">MÃ LỆNH</th>
                        <th style="width: 170px;">THIẾT BỊ ĐÍCH</th>
                        <th style="width: 75px; text-align: center;">HÀNH ĐỘNG</th>
                        <th style="width: 75px; text-align: center;">MỨC SÁNG</th>
                        <th style="width: 140px; text-align: center;">THỜI GIAN GỬI</th>
                        <th style="width: 145px; text-align: center;">TRẠNG THÁI LỆNH</th>
                        <th style="min-width: 150px;">KẾT QUẢ / PHẢN HỒI</th>
                        <th style="width: 110px;">NGƯỜI GỬI</th>
                    </tr>
                </thead>
                <tbody id="cmdLogTableBody">
                    <tr>
                        <td colspan="8" style="text-align: center; color: #94A3B8; padding: 24px;">
                            Đang tải lịch sử lệnh điều khiển từ Database...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- ==========================================================================
         D. CHÂN TRANG TRẠNG THÁI SCADA CHUẨN
         ========================================================================== -->
    <div class="hes-bottom-status-strip">
        <div class="hes-bottom-status-left">
            <span class="hes-status-dot-green"></span>
            <span class="hes-engine-badge">Core Engine .NET 8</span>
            <span class="hes-badge-arch" style="background-color: #ECFDF5; color: #059669;">RUNNING</span>
            <span class="hes-gateway-text">SmartLight HES Gateway Service</span>
        </div>
        <div class="hes-bottom-status-middle">
            <span>HES Service: Hoạt động liên tục</span>
            <span class="hes-status-sep">&bull;</span>
            <span>SQL Server: dbSmartLight</span>
            <span class="hes-status-sep">&bull;</span>
            <span id="hesBottomTcpInfo">TCP Server: Port 8088</span>
            <span class="hes-status-sep">&bull;</span>
            <span id="hesBottomSyncTime">Đồng bộ: Đang kết nối...</span>
        </div>
        <div class="hes-bottom-status-right">
            <span class="hes-badge-ready">READY</span>
        </div>
    </div>

    <!-- ==========================================================================
         E. MODAL HỘP THOẠI XÁC NHẬN AN TOÀN 2 LỚP (SAFETY INTERLOCK DIALOG)
         ========================================================================== -->
    <div class="hes-modal-backdrop" id="safetyModalBackdrop">
        <div class="hes-modal-dialog">
            <div class="hes-modal-header">
                <svg viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <h4 class="hes-modal-title">XÁC NHẬN PHÁT LỆNH ĐIỀU KHIỂN SCADA</h4>
            </div>
            <div class="hes-modal-body">
                <div>Bạn đang yêu cầu phát tín hiệu điều khiển tức thời qua hạ tầng mạng TCP/IP tới thiết bị hiện trường:</div>
                
                <div class="hes-modal-cmd-preview">
                    <div class="hes-modal-cmd-row">
                        <span style="color: #64748B;">Thiết bị nhận:</span>
                        <div id="modalTargetCode" style="text-align: right;"><strong>--</strong></div>
                    </div>
                    <div class="hes-modal-cmd-row">
                        <span style="color: #64748B;">Lệnh thực thi:</span>
                        <strong id="modalCmdType" style="color: #2563EB;">--</strong>
                    </div>
                    <div class="hes-modal-cmd-row">
                        <span style="color: #64748B;">Phương thức truyền:</span>
                        <span>TCP Raw Modbus / APDU Frame</span>
                    </div>
                    <div class="hes-modal-cmd-row">
                        <span style="color: #64748B;">Mã xác thực:</span>
                        <span style="font-family: monospace; font-weight: 700;">#ADM-SCADA-SECURE</span>
                    </div>
                </div>

                <div id="modalOfflineWarning" style="display:none; color: #DC2626; font-size: 12px; margin-top: 8px; font-weight: 600;">
                    ⚠️ Chú ý: Tủ điều khiển hiện đang Mất kết nối TCP. Lệnh sẽ chuyển sang trạng thái "Chờ gửi" và tự động phát khi tủ kết nối lại.
                </div>
            </div>
            <div class="hes-modal-footer">
                <button type="button" class="hes-btn-modal-cancel" onclick="closeSafetyModal()">Hủy bỏ</button>
                <button type="button" class="hes-btn-modal-confirm" id="btnModalConfirm" onclick="executeConfirmedCommand()">Xác nhận phát lệnh</button>
            </div>
        </div>
    </div>
</asp:Content>
