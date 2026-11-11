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
                <span>TCP Server Ready (3 Tủ Online)</span>
            </div>

            <div class="hes-ctrl-badge-token">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2.2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Admin Token: <strong>#ADM-4092-SECURE</strong></span>
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
                    <span class="hes-badge-primary-top">4 Tủ / 12 Tuyến</span>
                </div>

                <!-- Ô tìm kiếm trong cây -->
                <div class="hes-tree-search-box">
                    <span class="hes-tree-search-icon">
                        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input type="text" id="treeSearchInput" placeholder="Tìm kiếm thiết bị..." value="DD_01" onkeyup="filterDeviceTree()" />
                </div>

                <!-- Cây phân cấp thiết bị -->
                <div class="hes-tree-scroll-area" id="deviceTreeRoot">
                    <!-- TỦ 1: TU_01 (Đang mở rộng) -->
                    <div class="hes-tree-node">
                        <div class="hes-tree-row" onclick="toggleTreeNode(this)">
                            <div class="hes-tree-row-left">
                                <span class="hes-tree-arrow expanded">▶</span>
                                <svg class="hes-tree-icon" viewBox="0 0 24 24">
                                    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                                    <line x1="8" y1="6" x2="16" y2="6"></line>
                                    <line x1="16" y1="14" x2="16.01" y2="14"></line>
                                </svg>
                                <span>Tủ TU_01: Nguyễn Huệ</span>
                            </div>
                            <span class="hes-tree-badge badge-on">ON</span>
                        </div>

                        <!-- Cấp Tuyến chiếu sáng của Tủ 1 -->
                        <div class="hes-tree-sub">
                            <!-- Tuyến 1 (Đang mở rộng) -->
                            <div class="hes-tree-node">
                                <div class="hes-tree-row" onclick="toggleTreeNode(this)">
                                    <div class="hes-tree-row-left">
                                        <span class="hes-tree-arrow expanded">▶</span>
                                        <svg class="hes-tree-icon" viewBox="0 0 24 24" style="stroke: #0284C7;">
                                            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path>
                                        </svg>
                                        <span>Tuyến T01_1: Chiếu sáng chính</span>
                                    </div>
                                    <span style="font-size: 11px; color: #64748B;">(3)</span>
                                </div>

                                <!-- Cấp Điểm đèn của Tuyến 1 -->
                                <div class="hes-tree-sub-sub">
                                    <!-- Đèn DD_01: Đang chọn (Active) -->
                                    <div class="hes-tree-row active" id="node_DD_01" onclick="selectLamp('DD_01', 'Điểm đèn LED số 01 - Trụ thép bát giác', 'Tuyến T01_1, Tủ TU_01', '80', '152.4 W', '54.5 °C', this)">
                                        <div class="hes-tree-row-left">
                                            <span style="font-size: 11px;">●</span>
                                            <svg class="hes-tree-icon" viewBox="0 0 24 24" style="stroke: #FFFFFF;">
                                                <circle cx="12" cy="12" r="5"></circle>
                                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                            </svg>
                                            <span>DD_01: Trụ đèn số 80%</span>
                                        </div>
                                        <span style="font-size: 10px;">●</span>
                                    </div>

                                    <!-- Đèn DD_02 -->
                                    <div class="hes-tree-row" id="node_DD_02" onclick="selectLamp('DD_02', 'Điểm đèn LED số 02 - Trụ chiếu sáng', 'Tuyến T01_1, Tủ TU_01', '80', '151.8 W', '53.8 °C', this)">
                                        <div class="hes-tree-row-left">
                                            <span style="font-size: 11px; color: #94A3B8;">○</span>
                                            <svg class="hes-tree-icon" viewBox="0 0 24 24" style="stroke: #64748B;">
                                                <circle cx="12" cy="12" r="5"></circle>
                                            </svg>
                                            <span>DD_02: Trụ đèn số 02 80%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tuyến 2 (Đóng) -->
                            <div class="hes-tree-node">
                                <div class="hes-tree-row" onclick="toggleTreeNode(this)">
                                    <div class="hes-tree-row-left">
                                        <span class="hes-tree-arrow">▶</span>
                                        <svg class="hes-tree-icon" viewBox="0 0 24 24" style="stroke: #0284C7;">
                                            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path>
                                        </svg>
                                        <span>Tuyến T01_2: Chiếu sáng ...</span>
                                    </div>
                                    <span style="font-size: 11px; color: #64748B;">2 Đèn</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TỦ 2: TU_02 (Đóng) -->
                    <div class="hes-tree-node">
                        <div class="hes-tree-row" onclick="toggleTreeNode(this)">
                            <div class="hes-tree-row-left">
                                <span class="hes-tree-arrow">▶</span>
                                <svg class="hes-tree-icon" viewBox="0 0 24 24">
                                    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                                    <line x1="8" y1="6" x2="16" y2="6"></line>
                                </svg>
                                <span>Tủ TU_02: Lê Lợi</span>
                            </div>
                            <span class="hes-tree-badge badge-off">OFF</span>
                        </div>
                    </div>

                    <!-- TỦ 3: TU_03 (Mất kết nối) -->
                    <div class="hes-tree-node">
                        <div class="hes-tree-row" onclick="toggleTreeNode(this)">
                            <div class="hes-tree-row-left">
                                <span class="hes-tree-arrow">▶</span>
                                <svg class="hes-tree-icon" viewBox="0 0 24 24" style="stroke: #DC2626;">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                </svg>
                                <span>Tủ TU_03: ...</span>
                            </div>
                            <span class="hes-tree-badge badge-warn">DISCONNECTED</span>
                        </div>
                    </div>

                    <!-- TỦ 4: TU_04 (Online) -->
                    <div class="hes-tree-node">
                        <div class="hes-tree-row" onclick="toggleTreeNode(this)">
                            <div class="hes-tree-row-left">
                                <span class="hes-tree-arrow">▶</span>
                                <svg class="hes-tree-icon" viewBox="0 0 24 24">
                                    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                                    <line x1="8" y1="6" x2="16" y2="6"></line>
                                </svg>
                                <span>Tủ TU_04: Võ Văn Kiệt</span>
                            </div>
                            <span class="hes-tree-badge badge-on">ON</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="hes-tree-footer-info">
                <span>Chọn 1 đối tượng duy nhất</span>
                <strong style="color: #2563EB;">1 Selected</strong>
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
                    <span class="hes-badge-primary-top" id="detailTargetBadge">ID: DD_01</span>
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
                            <div class="hes-hero-label">TRẠNG THÁI PHÁT QUANG</div>
                            <div class="hes-hero-status-val" id="detailLampStatus">
                                <span class="hes-status-dot-inline" style="background-color: #16A34A;"></span>
                                <span>ĐANG SÁNG (BẬT)</span>
                            </div>
                        </div>
                    </div>

                    <div class="hes-hero-right">
                        <div class="hes-hero-label">MỨC DIMMING</div>
                        <div class="hes-hero-dim-val" id="detailDimVal">80 %</div>
                    </div>
                </div>

                <!-- Bảng thuộc tính đối tượng -->
                <div class="hes-attr-table">
                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                            Mã thiết bị:
                        </span>
                        <span class="hes-attr-val" id="attrCode" style="color: #2563EB; font-weight: 700;">DD_01</span>
                    </div>

                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                            Tên thiết bị:
                        </span>
                        <span class="hes-attr-val" id="attrName">Điểm đèn LED số 01 - Trụ thép bát giác</span>
                    </div>

                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            Loại đối tượng:
                        </span>
                        <span class="hes-attr-val" id="attrType">Điểm đèn (Tuyến T01_1, Tủ TU_01)</span>
                    </div>

                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                            Kết nối từ TU_01:
                        </span>
                        <span class="hes-attr-val">
                            <span class="hes-badge-tcp-stable">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                TCP Socket Ổn định
                            </span>
                        </span>
                    </div>

                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            Công suất đo cuối:
                        </span>
                        <span class="hes-attr-val" id="attrPower">152.4 W</span>
                    </div>

                    <div class="hes-attr-row">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>
                            Nhiệt độ Driver LED:
                        </span>
                        <span class="hes-attr-val" id="attrTemp">54.5 °C (Bình thường)</span>
                    </div>

                    <div class="hes-attr-row" style="border-bottom: none;">
                        <span class="hes-attr-label">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            Cập nhật gần nhất:
                        </span>
                        <span class="hes-attr-val" id="attrLastSeen" style="color: #64748B;">14:31:55 24/10/2024</span>
                    </div>
                </div>

                <!-- Thước đo công suất định mức -->
                <div class="hes-load-gauge-wrap">
                    <div class="hes-gauge-label-row">
                        <span>Tải công suất định mức (Max 200W)</span>
                        <strong style="color: #2563EB;" id="gaugePercentText">76.2%</strong>
                    </div>
                    <div class="hes-gauge-track-lg">
                        <div class="hes-gauge-fill-lg" id="gaugeFillBar" style="width: 76.2%;"></div>
                    </div>
                </div>
            </div>

            <div class="hes-tree-footer-info">
                <span>Gateway MAC: <strong>00:1E:C0:8A:F4:01</strong></span>
                <span>Lat: <strong>18ms</strong></span>
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
                    <div class="hes-safety-desc">
                        Lưu ý: Lệnh sẽ được chuyển tiếp qua TCP Server đến tủ điều khiển <strong>TU_01</strong>. Mọi tác vụ đều yêu cầu hộp thoại xác nhận trước khi phát xung truyền tín hiệu.
                    </div>
                </div>

                <!-- 1. ĐIỀU KHIỂN ĐÓNG CẮT NGUỒN ĐIỆN -->
                <div class="hes-section-label">ĐIỀU KHIỂN ĐÓNG CẮT NGUỒN ĐIỆN:</div>
                <div class="hes-switch-btn-grid">
                    <!-- Nút BẬT ĐÈN -->
                    <button type="button" class="hes-btn-power hes-btn-turn-on" onclick="openSafetyModal('BAT', '100%')">
                        <div class="hes-btn-power-title">
                            <svg viewBox="0 0 24 24">
                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                <line x1="12" y1="2" x2="12" y2="12"></line>
                            </svg>
                            <span>BẬT ĐÈN</span>
                        </div>
                    </button>

                    <!-- Nút TẮT ĐÈN -->
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
                            <span>TẮT ĐÈN</span>
                        </div>
                        <div class="hes-btn-power-sub">LỆNH: CMD_LIGHT_OFF</div>
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
                        <input type="range" class="hes-range-slider" id="dimRangeSlider" min="0" max="100" value="70" oninput="onDimSliderInput(this.value)" />
                        <div class="hes-slider-ticks">
                            <span>0% (Tối)</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100% (Cực đại)</span>
                        </div>
                    </div>

                    <!-- Nút gửi lệnh DIM -->
                    <button type="button" class="hes-btn-send-dim" id="btnSendDim" onclick="openSafetyModal('DIM', currentDimLevel + '%')">
                        <svg viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span id="btnSendDimLabel">GỬI LỆNH DIM (70%)</span>
                    </button>
                </div>
            </div>

            <div class="hes-tree-footer-info">
                <span>Timeout: <strong>5000 ms</strong></span>
                <span>Protocol: <strong>DALI 2.0 / Modbus-TCP</strong></span>
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
                <h3 class="hes-card-title">NHẬT KÝ LỆNH ĐIỀU KHIỂN GẦN ĐÂY</h3>
                <span class="hes-badge-primary-top">Thời gian thực</span>
            </div>
            <div class="hes-table-actions">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 12px; color: #64748B; font-weight: 600;">Lọc đối tượng:</span>
                    <select class="hes-elec-select" id="filterTargetLog" style="padding: 5px 28px 5px 10px; font-size: 12px;" onchange="filterLogByDevice(this.value)">
                        <option value="ALL">Tất cả thiết bị</option>
                        <option value="DD_01" selected="selected">Chỉ điểm đèn DD_01</option>
                        <option value="DD_02">Chỉ điểm đèn DD_02</option>
                        <option value="TU_01">Chỉ tủ TU_01</option>
                        <option value="TU_03">Chỉ tủ TU_03</option>
                    </select>
                </div>
                <button type="button" class="hes-btn-filter" onclick="alert('Đang trích xuất lịch sử lệnh điều khiển ra Excel...')">
                    <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Xuất Excel</span>
                </button>
            </div>
        </div>

        <div class="hes-table-responsive" style="overflow-x: hidden;">
            <table class="hes-data-table hes-table-fit" id="cmdLogTable">
                <thead>
                    <tr>
                        <th style="width: 135px;">MÃ LỆNH</th>
                        <th style="width: 145px;">THIẾT BỊ</th>
                        <th style="width: 65px; text-align: center;">HÀNH ĐỘNG</th>
                        <th style="width: 65px; text-align: center;">MỨC SÁNG</th>
                        <th style="width: 135px; text-align: center;">THỜI GIAN GỬI</th>
                        <th style="width: 145px; text-align: center;">TRẠNG THÁI LỆNH</th>
                        <th style="width: 130px;">THỜI GIAN PHẢN HỒI</th>
                        <th style="min-width: 100px;">NGƯỜI THỰC HIỆN</th>
                    </tr>
                </thead>
                <tbody id="cmdLogTableBody">
                    <tr>
                        <td class="hes-col-code">CMD_20241024_0891</td>
                        <td style="font-weight: 600;">DD_01 (Trụ 01)</td>
                        <td><span class="badge-act-dim">DIM</span></td>
                        <td><strong>70 %</strong></td>
                        <td>14:32:04 24/10/2024</td>
                        <td>
                            <span class="badge-status-pending">
                                <span class="hes-status-dot-inline" style="background-color: #2563EB;"></span>
                                Đã gửi / Chờ phản hồi
                            </span>
                        </td>
                        <td style="color: #94A3B8; font-style: italic;">Đang chờ ACK...</td>
                        <td>Admin</td>
                    </tr>
                    <tr>
                        <td class="hes-col-code">CMD_20241024_0884</td>
                        <td style="font-weight: 600;">DD_01 (Trụ 01)</td>
                        <td><span class="badge-act-bat">BAT</span></td>
                        <td><strong>80 %</strong></td>
                        <td>14:28:10 24/10/2024</td>
                        <td>
                            <span class="badge-status-ack">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Thành công (ACK)
                            </span>
                        </td>
                        <td>14:28:11 (820ms)</td>
                        <td>Admin</td>
                    </tr>
                    <tr>
                        <td class="hes-col-code">CMD_20241024_0879</td>
                        <td style="font-weight: 600;">TU_01 (Tủ Nguyễn Huệ)</td>
                        <td><span class="badge-act-bat">BAT</span></td>
                        <td>--</td>
                        <td>14:25:00 24/10/2024</td>
                        <td>
                            <span class="badge-status-queue">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                Chờ gửi (Queue)
                            </span>
                        </td>
                        <td>--</td>
                        <td>Hệ thống (Auto)</td>
                    </tr>
                    <tr>
                        <td class="hes-col-code">CMD_20241024_0862</td>
                        <td style="font-weight: 600;">TU_03 (Trần Hưng Đạo)</td>
                        <td><span class="badge-act-tat">TAT</span></td>
                        <td>0 %</td>
                        <td>14:10:45 24/10/2024</td>
                        <td>
                            <span class="badge-status-failed">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                Thất bại (Socket closed)
                            </span>
                        </td>
                        <td>14:10:50 (Timeout)</td>
                        <td>Admin</td>
                    </tr>
                    <tr>
                        <td class="hes-col-code">CMD_20241024_0850</td>
                        <td style="font-weight: 600;">DD_02 (Trụ 02)</td>
                        <td><span class="badge-act-dim">DIM</span></td>
                        <td><strong>60 %</strong></td>
                        <td>13:50:22 24/10/2024</td>
                        <td>
                            <span class="badge-status-expired">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line></svg>
                                Quá hạn (Expired)
                            </span>
                        </td>
                        <td style="color: #94A3B8;">Không có phản hồi</td>
                        <td>Lịch biểu</td>
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
            <span class="hes-gateway-text">HES Gateway Service v3.4.1 x64</span>
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
                <div>Bạn đang yêu cầu phát xung tín hiệu điều khiển tức thời qua hạ tầng mạng TCP/IP tới thiết bị hiện trường.</div>
                
                <div class="hes-modal-cmd-preview">
                    <div class="hes-modal-cmd-row">
                        <span style="color: #64748B;">Thiết bị nhận:</span>
                        <strong id="modalTargetCode">DD_01 (Tủ TU_01)</strong>
                    </div>
                    <div class="hes-modal-cmd-row">
                        <span style="color: #64748B;">Lệnh thực thi:</span>
                        <strong id="modalCmdType" style="color: #2563EB;">DIMMING (70%)</strong>
                    </div>
                    <div class="hes-modal-cmd-row">
                        <span style="color: #64748B;">Phương thức truyền:</span>
                        <span>TCP Raw Modbus / APDU Frame</span>
                    </div>
                    <div class="hes-modal-cmd-row">
                        <span style="color: #64748B;">Mã an toàn xác thực:</span>
                        <span style="font-family: monospace; font-weight: 700;">#ADM-4092-SECURE</span>
                    </div>
                </div>

                <div style="font-size: 11.5px; color: #DC2626;">
                    * Lưu ý: Thiết bị tại hiện trường sẽ phản hồi và thay đổi trạng thái chiếu sáng ngay lập tức.
                </div>
            </div>
            <div class="hes-modal-footer">
                <button type="button" class="hes-btn-modal-cancel" onclick="closeSafetyModal()">Hủy bỏ</button>
                <button type="button" class="hes-btn-modal-confirm" id="btnModalConfirm" onclick="executeConfirmedCommand()">Xác nhận phát lệnh</button>
            </div>
        </div>
    </div>

    <!-- Script tương tác Điều khiển Thiết bị -->
    <script type="text/javascript">
        var currentSelectedLamp = 'DD_01';
        var currentDimLevel = 70;
        var pendingAction = '';
        var pendingVal = '';

        function toggleTreeNode(element) {
            var parent = element.parentElement;
            var sub = parent.querySelector('.hes-tree-sub, .hes-tree-sub-sub');
            var arrow = element.querySelector('.hes-tree-arrow');
            if (sub) {
                if (sub.style.display === 'none') {
                    sub.style.display = 'block';
                    if (arrow) arrow.classList.add('expanded');
                } else {
                    sub.style.display = 'none';
                    if (arrow) arrow.classList.remove('expanded');
                }
            }
        }

        function selectLamp(code, name, type, dim, power, temp, rowEl) {
            currentSelectedLamp = code;
            
            // Xóa active cũ
            var allRows = document.querySelectorAll('.hes-tree-row');
            allRows.forEach(function (r) { r.classList.remove('active'); });
            
            // Thêm active mới
            if (rowEl) rowEl.classList.add('active');

            // Cập nhật thẻ chi tiết
            document.getElementById('detailTargetBadge').innerText = 'ID: ' + code;
            document.getElementById('attrCode').innerText = code;
            document.getElementById('attrName').innerText = name;
            document.getElementById('attrType').innerText = type;
            document.getElementById('attrPower').innerText = power;
            document.getElementById('attrTemp').innerText = temp;
            document.getElementById('detailDimVal').innerText = dim + ' %';

            // Cập nhật slider
            onDimSliderInput(parseInt(dim));
        }

        function onDimSliderInput(val) {
            currentDimLevel = val;
            document.getElementById('dimNumberInput').value = val;
            document.getElementById('btnSendDimLabel').innerText = 'GỬI LỆNH DIM (' + val + '%)';
        }

        function onDimNumberChange(val) {
            var num = parseInt(val);
            if (isNaN(num)) num = 0;
            if (num < 0) num = 0;
            if (num > 100) num = 100;
            currentDimLevel = num;
            document.getElementById('dimRangeSlider').value = num;
            document.getElementById('dimNumberInput').value = num;
            document.getElementById('btnSendDimLabel').innerText = 'GỬI LỆNH DIM (' + num + '%)';
        }

        function openSafetyModal(action, value) {
            pendingAction = action;
            pendingVal = value;

            var modal = document.getElementById('safetyModalBackdrop');
            var targetCodeEl = document.getElementById('modalTargetCode');
            var cmdTypeEl = document.getElementById('modalCmdType');
            var confirmBtn = document.getElementById('btnModalConfirm');

            targetCodeEl.innerText = currentSelectedLamp + ' (Tủ TU_01)';
            
            if (action === 'BAT') {
                cmdTypeEl.innerText = 'BẬT NGUỒN ĐÈN (100%)';
                cmdTypeEl.style.color = '#059669';
                confirmBtn.className = 'hes-btn-modal-confirm success';
                confirmBtn.innerText = 'Xác nhận BẬT ĐÈN';
            } else if (action === 'TAT') {
                cmdTypeEl.innerText = 'CẮT NGUỒN ĐÈN (TẮT TẢI)';
                cmdTypeEl.style.color = '#DC2626';
                confirmBtn.className = 'hes-btn-modal-confirm danger';
                confirmBtn.innerText = 'Xác nhận TẮT ĐÈN';
            } else {
                cmdTypeEl.innerText = 'ĐIỀU CHỈNH TIẾT GIẢM (DIM: ' + value + ')';
                cmdTypeEl.style.color = '#2563EB';
                confirmBtn.className = 'hes-btn-modal-confirm';
                confirmBtn.innerText = 'Xác nhận GỬI LỆNH DIM';
            }

            modal.classList.add('open');
        }

        function closeSafetyModal() {
            var modal = document.getElementById('safetyModalBackdrop');
            modal.classList.remove('open');
        }

        function executeConfirmedCommand() {
            closeSafetyModal();

            // Cập nhật giao diện chi tiết
            var now = new Date();
            var timeStr = now.toTimeString().split(' ')[0] + ' ' + now.toLocaleDateString('vi-VN');
            var lampStatusEl = document.getElementById('detailLampStatus');
            var dimValEl = document.getElementById('detailDimVal');

            if (pendingAction === 'BAT') {
                lampStatusEl.innerHTML = '<span class="hes-status-dot-inline" style="background-color: #16A34A;"></span><span>ĐANG SÁNG (BẬT)</span>';
                lampStatusEl.style.color = '#15803D';
                dimValEl.innerText = '100 %';
                document.getElementById('attrPower').innerText = '190.5 W';
            } else if (pendingAction === 'TAT') {
                lampStatusEl.innerHTML = '<span class="hes-status-dot-inline" style="background-color: #EF4444;"></span><span>ĐÃ TẮT NGUỒN</span>';
                lampStatusEl.style.color = '#DC2626';
                dimValEl.innerText = '0 %';
                document.getElementById('attrPower').innerText = '0.0 W';
            } else if (pendingAction === 'DIM') {
                lampStatusEl.innerHTML = '<span class="hes-status-dot-inline" style="background-color: #16A34A;"></span><span>ĐANG SÁNG (DIM)</span>';
                lampStatusEl.style.color = '#15803D';
                dimValEl.innerText = pendingVal;
            }

            // Thêm bản ghi mới vào đầu bảng
            var cmdCode = 'CMD_' + now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0') + '_' + Math.floor(1000 + Math.random() * 9000);
            var tbody = document.getElementById('cmdLogTableBody');
            var newRow = tbody.insertRow(0);

            var actionBadge = pendingAction === 'BAT' ? '<span class="badge-act-bat">BAT</span>' :
                              pendingAction === 'TAT' ? '<span class="badge-act-tat">TAT</span>' : '<span class="badge-act-dim">DIM</span>';

            newRow.innerHTML =
                '<td class="hes-col-code">' + cmdCode + '</td>' +
                '<td style="font-weight: 600;">' + currentSelectedLamp + ' (Trụ 01)</td>' +
                '<td>' + actionBadge + '</td>' +
                '<td><strong>' + pendingVal + '</strong></td>' +
                '<td>' + timeStr + '</td>' +
                '<td><span class="badge-status-ack"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Thành công (ACK)</span></td>' +
                '<td>' + now.toTimeString().split(' ')[0] + ' (540ms)</td>' +
                '<td>Admin</td>';

            alert('Lệnh SCADA [' + cmdCode + '] đã được phát qua TCP Socket thành công tới ' + currentSelectedLamp + '!');
        }

        function filterDeviceTree() {
            var filter = document.getElementById('treeSearchInput').value.toUpperCase();
            var nodes = document.querySelectorAll('.hes-tree-row');
            nodes.forEach(function (n) {
                var text = n.textContent || n.innerText;
                if (text.toUpperCase().indexOf(filter) > -1 || filter === '') {
                    n.style.display = 'flex';
                } else {
                    n.style.display = 'none';
                }
            });
        }

        function filterLogByDevice(dev) {
            var table = document.getElementById('cmdLogTable');
            var trs = table.getElementsByTagName('tr');
            for (var i = 1; i < trs.length; i++) {
                var text = trs[i].textContent || trs[i].innerText;
                if (dev === 'ALL' || text.indexOf(dev) > -1) {
                    trs[i].style.display = '';
                } else {
                    trs[i].style.display = 'none';
                }
            }
        }

        function refreshTree() {
            var btn = document.querySelector('.hes-btn-tree-refresh');
            if (btn) {
                btn.style.opacity = '0.6';
                setTimeout(function () {
                    btn.style.opacity = '1';
                    alert('Đã cập nhật trạng thái mới nhất từ 4 Tủ / 12 Tuyến SCADA!');
                }, 400);
            }
        }
    </script>
</asp:Content>

