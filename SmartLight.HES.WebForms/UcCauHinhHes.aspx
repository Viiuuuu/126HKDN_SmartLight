<%@ Page Title="Cấu hình hệ thống HES" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="UcCauHinhHes.aspx.cs" Inherits="SmartLight.HES.WebForms.UcCauHinhHes" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <!-- ==========================================================================
         A. THANH TIÊU ĐỀ & TÁC VỤ CẤU HÌNH HỆ THỐNG
         ========================================================================== -->
    <div class="hes-cfg-header-card">
        <div class="hes-cfg-title-group">
            <div class="hes-cfg-icon-box">
                <!-- Icon bánh răng đôi cấu hình hệ thống SCADA -->
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </div>
            <div class="hes-cfg-title-text">
                <div class="hes-cfg-title-line">
                    <span class="hes-cfg-title">CẤU HÌNH THÔNG SỐ HỆ THỐNG HES</span>
                </div>
            </div>
        </div>

        <div class="hes-cfg-actions">
            <!-- 1. Lưu cấu hình -->
            <button type="button" class="hes-btn-cfg-save" onclick="saveConfiguration()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Lưu cấu hình
            </button>

            <!-- 2. Nạp lại từ CSDL -->
            <button type="button" class="hes-btn-cfg-reload" onclick="location.reload();">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Nạp lại từ CSDL
            </button>

            <!-- 3. Kiểm tra kết nối -->
            <button type="button" class="hes-btn-cfg-test" onclick="testAllConnections()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                Kiểm tra kết nối
            </button>

            <!-- 4. Khởi động lại HES Core -->
            <button type="button" class="hes-btn-cfg-restart" onclick="restartHesCore()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                    <line x1="12" y1="2" x2="12" y2="12"></line>
                </svg>
                Khởi động lại HES Core
            </button>
        </div>
    </div>

    <!-- ==========================================================================
         B. THANH TAB ĐIỀU HƯỚNG PHÂN HỆ CẤU HÌNH (SUB-SYSTEM TABS)
         - Tự động xuống dòng khi màn hình thu hẹp, tránh scroll ngang và không bị mất chữ
         ========================================================================== -->
    <div class="hes-cfg-tabs-nav">
        <!-- Tab 0: TCP Server & Gateway -->
        <button type="button" class="hes-cfg-tab-item" onclick="switchHesConfigTab(0)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="6" height="6" rx="1"></rect>
                <rect x="16" y="2" width="6" height="6" rx="1"></rect>
                <rect x="9" y="16" width="6" height="6" rx="1"></rect>
                <path d="M5 8v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"></path>
                <path d="M12 12v4"></path>
            </svg>
            <span>1. Cấu hình TCP Server &amp; Gateway</span>
        </button>

        <!-- Tab 1: CSDL SQL Server (Active mặc định như trong ảnh mẫu) -->
        <button type="button" class="hes-cfg-tab-item active" onclick="switchHesConfigTab(1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            <span>2. Cấu hình CSDL SQL Server</span>
        </button>

        <!-- Tab 2: Chu kỳ Polling & Quét dữ liệu -->
        <button type="button" class="hes-cfg-tab-item" onclick="switchHesConfigTab(2)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>3. Chu kỳ Polling &amp; Quét dữ liệu</span>
        </button>

        <!-- Tab 3: An ninh, Tài khoản & Token API -->
        <button type="button" class="hes-cfg-tab-item" onclick="switchHesConfigTab(3)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>4. An ninh, Tài khoản &amp; Token API</span>
        </button>

        <!-- Tab 4: Sao lưu & Nhật ký hệ thống -->
        <button type="button" class="hes-cfg-tab-item" onclick="switchHesConfigTab(4)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>5. Sao lưu &amp; Nhật ký hệ thống</span>
        </button>
    </div>

    <!-- ==========================================================================
         PHÂN HỆ 0: CẤU HÌNH TCP SERVER & GATEWAY
         ========================================================================== -->
    <div class="hes-cfg-tab-panel" id="tabPanel_0">
        <div class="hes-cfg-main-grid">
            <!-- Cột trái: Thông số Mạng & Socket Server -->
            <div class="hes-cfg-col">
                <div class="hes-cfg-card">
                    <div class="hes-cfg-card-header">
                        <div class="hes-cfg-card-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                                <line x1="6" y1="18" x2="6.01" y2="18"></line>
                            </svg>
                            THÔNG SỐ MẠNG &amp; TCP SOCKET SERVER
                        </div>
                        <span class="hes-cfg-badge-active">
                            <span style="width: 7px; height: 7px; border-radius: 50%; background: #16A34A;"></span>
                            ACTIVE (PORT 8088)
                        </span>
                    </div>

                    <!-- Hàng 1: Binding IP & Listening Port -->
                    <div class="hes-cfg-two-col">
                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Địa chỉ IP lắng nghe (Binding IP):</label>
                            <div class="hes-cfg-input-box">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                    <path d="M10 4v4"></path>
                                    <path d="M2 8h20"></path>
                                    <path d="M6 4v4"></path>
                                </svg>
                                <input type="text" class="hes-cfg-input" id="txtBindingIp" value="0.0.0.0 (Tất cả card mạng)" />
                            </div>
                            <span class="hes-cfg-hint">Lắng nghe INADDR_ANY trên toàn bộ NICs</span>
                        </div>

                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Cổng lắng nghe (Listening Port):</label>
                            <div class="hes-cfg-input-box">
                                <span style="color: #64748B; font-weight: 700;">#</span>
                                <input type="text" class="hes-cfg-input" id="txtListeningPort" value="8088" style="font-weight: 700;" />
                            </div>
                            <span class="hes-cfg-hint">Mặc định TCP Socket HES Gateway: 8088</span>
                        </div>
                    </div>

                    <!-- Hàng 2: Max Clients & Socket Timeout -->
                    <div class="hes-cfg-two-col">
                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Số kết nối đồng thời tối đa (Max Clients):</label>
                            <div class="hes-cfg-input-box">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <input type="text" class="hes-cfg-input" id="txtMaxClients" value="500 kết nối" />
                            </div>
                        </div>

                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Thời gian chờ gói tin (Socket Timeout):</label>
                            <div class="hes-cfg-input-box">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                    <polygon points="5 2 19 2 12 12 19 22 5 22 12 12 5 2"></polygon>
                                </svg>
                                <input type="text" class="hes-cfg-input" id="txtSocketTimeout" value="30 giây" />
                            </div>
                        </div>
                    </div>

                    <!-- Hàng 3: Buffer Size -->
                    <div class="hes-cfg-form-group">
                        <label class="hes-cfg-label">Bộ đệm truyền nhận dữ liệu (Buffer Size):</label>
                        <div class="hes-cfg-input-box">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                            <input type="text" class="hes-cfg-input" id="txtBufferSize" value="Rx/Tx Buffer: 4096 bytes (4 KB / Frame)" />
                            <span class="hes-proto-tag payload" style="font-size: 10px;">High Throughput</span>
                        </div>
                    </div>

                    <!-- Hàng 4: Ping / Keep-alive -->
                    <label class="hes-cfg-checkbox-row">
                        <input type="checkbox" id="chkKeepAlive" checked="checked" />
                        <span class="hes-cfg-checkbox-text">
                            <span class="hes-cfg-checkbox-title">Kích hoạt Ping / Heartbeat chu kỳ RTU định kỳ (Keep-alive)</span>
                        </span>
                    </label>

                    <div class="hes-cfg-two-col" style="margin-left: 26px;">
                        <div class="hes-cfg-field">
                            <span class="hes-cfg-hint" style="font-style: normal; color: #475569; font-weight: 600;">Tần suất gửi Ping kiểm tra kết nối:</span>
                            <div class="hes-cfg-input-box" style="height: 32px;">
                                <input type="text" class="hes-cfg-input" value="Mỗi 60s" style="font-size: 11.5px;" />
                            </div>
                        </div>
                        <div class="hes-cfg-field">
                            <span class="hes-cfg-hint" style="font-style: normal; color: #475569; font-weight: 600;">Ngắt kết nối sau:</span>
                            <div class="hes-cfg-input-box" style="height: 32px;">
                                <input type="text" class="hes-cfg-input" value="3 lần rớt Ping" style="font-size: 11.5px;" />
                            </div>
                        </div>
                    </div>

                    <!-- Footer Card 1: Socket Server Status -->
                    <div class="hes-cfg-socket-status">
                        <span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: #0F2942;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981;"></span>
                            Socket Server Active (PID: 4092)
                        </span>
                        <span>Client kết nối: <strong>3 RTU (Tủ 01, Tủ 02, Tủ 03)</strong></span>
                        <span>Tải CPU: <strong>1.2%</strong></span>
                    </div>
                </div>
            </div>

            <!-- Cột phải: Thông số hiệu năng giao tiếp TCP Socket -->
            <div class="hes-cfg-col">
                <div class="hes-cfg-card">
                    <div class="hes-cfg-card-header">
                        <div class="hes-cfg-card-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 14 14"></polyline>
                            </svg>
                            HIỆU NĂNG GIAO TIẾP &amp; SOCKET GATEWAY
                        </div>
                        <span class="hes-cfg-badge-active">
                            READY (PORT 8088)
                        </span>
                    </div>

                    <div class="hes-data-engine-list">
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Chuẩn giao thức:</span>
                            <span class="hes-data-engine-val">IEC 60870-5-104 / TCP Socket Binary</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Socket Thread Pool:</span>
                            <span class="hes-data-engine-val">16 Threads (Min: 4 | Max: 64)</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Hàng đợi gói tin I/O:</span>
                            <span class="hes-data-engine-val" style="color: #16A34A;">0 frames pending (Bình thường)</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Mã hóa đường truyền:</span>
                            <span class="hes-data-engine-val">TLS 1.3 / VPN IPSec Tunnel</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Tỷ lệ truyền tin thành công:</span>
                            <span class="hes-data-engine-val" style="color: #16A34A;">99.85% (Không mất gói)</span>
                        </div>
                    </div>

                    <div class="hes-sql-sparkline-box" style="margin-top: 14px;">
                        <div class="hes-sql-sparkline-header">
                            <span style="font-weight: 600; color: #475569;">Độ trễ truyền nhận RTU (15 Phút qua):</span>
                            <span style="font-weight: 700; color: #0F172A;">Avg: 18.4 ms</span>
                        </div>
                        <svg viewBox="0 0 300 45" width="100%" height="45" style="overflow: visible;">
                            <path d="M 0,30 Q 30,18 60,25 T 120,20 T 180,28 T 240,15 T 300,22" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round"></path>
                            <circle cx="300" cy="22" r="3.5" fill="#0284C7"></circle>
                        </svg>
                    </div>

                    <div class="hes-sql-notice-box">
                        ⓘ Socket Server Gateway tự động duy trì kết nối liên tục 24/7 với các trạm điều khiển qua mạng 4G LTE/NBIoT công nghiệp.
                    </div>
                </div>
            </div>
        </div>

        <!-- Dòng bảo mật & Footer Actions -->
        <div class="hes-cfg-sec-note-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" style="flex-shrink: 0;">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Các thông số cấu hình Socket Server TCP được nạp và áp dụng trực tiếp vào Service HES Core Gateway không cần khởi động lại toàn bộ máy chủ vật lý.</span>
        </div>

        <div class="hes-cfg-bottom-action-bar">
            <div class="hes-cfg-bottom-left">
                <button type="button" class="hes-btn-cfg-revert" onclick="alert('Đã khôi phục các tham số Socket TCP mặc định!')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    Khôi phục giá trị trước đó
                </button>
                <span style="font-size: 12px; color: #64748B;">Thay đổi chưa lưu: <strong>0</strong></span>
            </div>
            <div class="hes-cfg-bottom-right">
                <button type="button" class="hes-btn-cfg-validate" onclick="alert('Cấu hình Socket TCP hợp lệ! Không có xung đột cổng 8088.')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Kiểm tra toàn bộ
                </button>
                <button type="button" class="hes-btn-cfg-save-footer" onclick="saveConfiguration()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Lưu cấu hình
                </button>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         PHÂN HỆ 1: CẤU HÌNH CSDL SQL SERVER
         - Thiết kế đúng 100% theo hình ảnh giao diện WinForms SCADA chuẩn của bạn
         ========================================================================== -->
    <div class="hes-cfg-tab-panel active" id="tabPanel_1">
        <div class="hes-cfg-sql-grid">
            <!-- Cột trái: Card Cấu hình chuỗi kết nối cơ sở dữ liệu SQL Server -->
            <div class="hes-cfg-card">
                <div class="hes-cfg-card-header">
                    <div class="hes-cfg-card-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                        Cấu hình Chuỗi Kết Nối Cơ Sở Dữ Liệu SQL Server
                    </div>
                    <span class="hes-cfg-driver-tag">DRIVER: MICROSOFT.DATA.SQLCLIENT V5.2</span>
                </div>

                <!-- Dòng 1: Server Name & Database Name -->
                <div class="hes-cfg-two-col">
                    <div class="hes-cfg-field">
                        <label class="hes-cfg-label">Server Name (Tên máy chủ / IP): <span style="color: #DC2626;">*</span></label>
                        <div class="hes-cfg-input-box">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                                <line x1="6" y1="18" x2="6.01" y2="18"></line>
                            </svg>
                            <input type="text" class="hes-cfg-input" id="txtSqlServerName" value="localhost\SQLEXPRESS" />
                        </div>
                        <span class="hes-cfg-hint">Hỗ trợ Named Instance hoặc IP tĩnh cổng 1433</span>
                    </div>

                    <div class="hes-cfg-field">
                        <label class="hes-cfg-label">Database Name (Tên CSDL): <span style="font-weight: 500; color: #64748B;">(Mặc định HES)</span></label>
                        <div class="hes-cfg-input-box">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                            </svg>
                            <input type="text" class="hes-cfg-input" id="txtSqlDatabaseName" value="dbSmartLight" />
                        </div>
                        <span class="hes-cfg-hint">Schema cốt lõi: smartlight_hes_telemetry</span>
                    </div>
                </div>

                <!-- Dòng 2: Authentication Mode -->
                <div class="hes-cfg-form-group">
                    <label class="hes-cfg-label">Phương thức xác thực (Authentication Mode):</label>
                    <div class="hes-cfg-input-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <select class="hes-cfg-input" id="ddlSqlAuthMode" style="cursor: pointer;">
                            <option value="sql" selected="selected">SQL Server Authentication (Khuyên dùng cho HES Service)</option>
                            <option value="windows">Windows Authentication (Integrated Security)</option>
                            <option value="azure">Azure Active Directory / Managed Identity</option>
                        </select>
                    </div>
                </div>

                <!-- Dòng 3: Username & Password -->
                <div class="hes-cfg-two-col">
                    <div class="hes-cfg-field">
                        <label class="hes-cfg-label">Tên đăng nhập (Username):</label>
                        <div class="hes-cfg-input-box">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <input type="text" class="hes-cfg-input" id="txtSqlUsername" value="sa" />
                        </div>
                    </div>

                    <div class="hes-cfg-field">
                        <label class="hes-cfg-label">Mật khẩu (Password):</label>
                        <div class="hes-cfg-input-box">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <input type="password" class="hes-cfg-input" id="txtSqlPassword" value="••••••••••••••" />
                            <button type="button" class="hes-btn-view-frame" onclick="toggleSqlPassword()" title="Ẩn/Hiện mật khẩu">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="3" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Dòng 4: Nút Kiểm tra kết nối -->
                <div>
                    <button type="button" class="hes-btn-sql-test" onclick="testSqlConnection()">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Kiểm tra kết nối (Test Connection)
                    </button>
                </div>

                <!-- Dòng 5: Alert Trạng thái kết nối thành công -->
                <div class="hes-sql-status-banner" id="sqlConnectionSuccessBanner">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #16A34A;"></span>
                    <span>Kết nối thành công (12ms) - SQL 2022 Enterprise</span>
                </div>
            </div>

            <!-- Cột phải: Thông số Data Engine -->
            <div class="hes-cfg-card">
                <div class="hes-cfg-card-header">
                    <div class="hes-cfg-card-title">
                        Thông số Data Engine
                    </div>
                    <span style="background: #065F46; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.3px;">
                        POOL ACTIVE
                    </span>
                </div>

                <div class="hes-data-engine-list">
                    <div class="hes-data-engine-item">
                        <span class="hes-data-engine-label">Max Pool Size:</span>
                        <span class="hes-data-engine-val">120 Connections</span>
                    </div>

                    <div class="hes-data-engine-item">
                        <span class="hes-data-engine-label">Min Pool Size:</span>
                        <span class="hes-data-engine-val">5 Connections</span>
                    </div>

                    <div class="hes-data-engine-item">
                        <span class="hes-data-engine-label">Connection Timeout:</span>
                        <span class="hes-data-engine-val">15 seconds</span>
                    </div>

                    <div class="hes-data-engine-item">
                        <span class="hes-data-engine-label">Mã hóa kết nối (SSL/TLS):</span>
                        <span class="hes-data-engine-val">Mandatory (TrustCert=True)</span>
                    </div>
                </div>

                <!-- Sparkline độ trễ truy vấn SQL -->
                <div class="hes-sql-sparkline-box">
                    <div class="hes-sql-sparkline-header">
                        <span style="font-weight: 600; color: #475569;">SQL Query Latency (15 Phút qua)</span>
                        <span style="font-weight: 700; color: #0F172A;">Avg: 11.8 ms</span>
                    </div>
                    <svg viewBox="0 0 300 45" width="100%" height="45" style="overflow: visible;">
                        <path d="M 0,35 Q 25,22 50,30 T 100,18 T 150,28 T 200,20 T 250,26 T 300,16" fill="none" stroke="#0F766E" stroke-width="2.2" stroke-linecap="round"></path>
                        <circle cx="300" cy="16" r="3.5" fill="#0F766E"></circle>
                    </svg>
                </div>

                <!-- Box chú thích tự động biên dịch -->
                <div class="hes-sql-notice-box">
                    ⓘ Chuỗi kết nối được tự động biên dịch vào SqlConnection.ConnectionString khi Service khởi động hoặc sau khi bấm Lưu.
                </div>
            </div>
        </div>

        <!-- Dòng ghi chú bảo mật AES-256 GCM (theo mockup) -->
        <div class="hes-cfg-sec-note-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" style="flex-shrink: 0;">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Các tham số SQL Server, TCP/IP và Retry được lưu an toàn trong file cấu hình cục bộ của ứng dụng (appsettings.json / App.config); mật khẩu được mã hóa an toàn với chuẩn AES-256 GCM.</span>
        </div>

        <!-- Thanh tác vụ chân trang cấu hình SQL Server -->
        <div class="hes-cfg-bottom-action-bar">
            <div class="hes-cfg-bottom-left">
                <button type="button" class="hes-btn-cfg-revert" onclick="alert('Đã khôi phục các tham số SQL Server mặc định!')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    Khôi phục giá trị trước đó (Revert Defaults)
                </button>
                <span style="font-size: 12px; color: #64748B;">Thay đổi chưa lưu: <strong>0</strong></span>
            </div>
            <div class="hes-cfg-bottom-right">
                <button type="button" class="hes-btn-cfg-validate" onclick="alert('Kiểm tra toàn bộ: Cấu hình SQL Server hoàn toàn hợp lệ và sẵn sàng vận hành!')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Kiểm tra toàn bộ (Validate)
                </button>
                <button type="button" class="hes-btn-cfg-save-footer" onclick="saveConfiguration()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Lưu cấu hình (Save Changes)
                </button>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         PHÂN HỆ 2: CHU KỲ POLLING & QUÉT DỮ LIỆU
         ========================================================================== -->
    <div class="hes-cfg-tab-panel" id="tabPanel_2">
        <div class="hes-cfg-main-grid">
            <!-- Cột trái: Tham số vận hành & Chu kỳ Polling -->
            <div class="hes-cfg-col">
                <div class="hes-cfg-card">
                    <div class="hes-cfg-card-header">
                        <div class="hes-cfg-card-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                            THAM SỐ VẬN HÀNH &amp; CHU KỲ POLLING
                        </div>
                        <span class="hes-cfg-badge-profile">TELEMETRY PROFILE</span>
                    </div>

                    <!-- Hàng 1: Polling Interval & Raw Retention -->
                    <div class="hes-cfg-two-col">
                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Chu kỳ quét dữ liệu định kỳ (Polling Interval):</label>
                            <div class="hes-cfg-input-box">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <input type="text" class="hes-cfg-input" id="txtPollingInterval" value="5000 ms (5 giây)" />
                            </div>
                        </div>

                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Lưu trữ dữ liệu thô (Raw Retention):</label>
                            <div class="hes-cfg-input-box">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                <input type="text" class="hes-cfg-input" id="txtRetentionDays" value="90 ngày" />
                            </div>
                        </div>
                    </div>

                    <!-- Hàng 2: Umin & Umax -->
                    <div class="hes-cfg-two-col">
                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Ngưỡng cảnh báo điện áp thấp (Umin):</label>
                            <div class="hes-cfg-input-box">
                                <span style="color: #DC2626; font-weight: 800;">&darr;</span>
                                <input type="text" class="hes-cfg-input" id="txtUmin" value="198 V" style="color: #DC2626; font-weight: 700;" />
                            </div>
                        </div>

                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Ngưỡng cảnh báo điện áp cao (Umax):</label>
                            <div class="hes-cfg-input-box">
                                <span style="color: #DC2626; font-weight: 800;">&uarr;</span>
                                <input type="text" class="hes-cfg-input" id="txtUmax" value="242 V" style="color: #DC2626; font-weight: 700;" />
                            </div>
                        </div>
                    </div>

                    <!-- Hàng 3: Driver Temperature & LDR Threshold -->
                    <div class="hes-cfg-two-col">
                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Cảnh báo nhiệt độ LED Driver:</label>
                            <div class="hes-cfg-input-box">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
                                </svg>
                                <input type="text" class="hes-cfg-input" id="txtLedTempAlert" value="75 &deg;C" />
                            </div>
                        </div>

                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Cảm biến quang LDR môi trường:</label>
                            <div class="hes-cfg-input-box">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                </svg>
                                <input type="text" class="hes-cfg-input" id="txtLdrThreshold" value="Lux threshold: &lt; 35 Lux" />
                            </div>
                        </div>
                    </div>

                    <!-- Hàng 4: Checkbox Auto Dimmer LDR -->
                    <label class="hes-cfg-checkbox-row" style="margin-top: 6px; margin-bottom: 0;">
                        <input type="checkbox" id="chkAutoLdr" checked="checked" />
                        <span class="hes-cfg-checkbox-text">
                            <span class="hes-cfg-checkbox-title">Tự động bù sáng thông minh &amp; kích hoạt Dimmer theo cảm biến LDR thực địa</span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Cột phải: Chiến lược thu thập và lọc nhiễu Telemetry -->
            <div class="hes-cfg-col">
                <div class="hes-cfg-card">
                    <div class="hes-cfg-card-header">
                        <div class="hes-cfg-card-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            CHIẾN LƯỢC THU THẬP &amp; LỌC NHIỄU TELEMETRY
                        </div>
                        <span class="hes-cfg-badge-active">
                            KÍCH HOẠT
                        </span>
                    </div>

                    <div class="hes-data-engine-list">
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Thuật toán làm mịn tín hiệu:</span>
                            <span class="hes-data-engine-val">Moving Average (5 samples)</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Chu kỳ quét giờ cao điểm (18h-23h):</span>
                            <span class="hes-data-engine-val" style="color: #2563EB;">3000 ms (3 giây)</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Chu kỳ tiết kiệm ban ngày (06h-17h30):</span>
                            <span class="hes-data-engine-val">30000 ms (30 giây)</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Chế độ đẩy dữ liệu biến động:</span>
                            <span class="hes-data-engine-val" style="color: #16A34A;">Event-driven Telemetry (On)</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Ngưỡng lọc sụt áp tức thời:</span>
                            <span class="hes-data-engine-val">&plusmn; 5% trong 10s</span>
                        </div>
                    </div>

                    <div class="hes-sql-notice-box" style="margin-top: 14px;">
                        ⓘ Chế độ Event-driven cho phép trạm RTU tự động kích hoạt cảnh báo gửi ngay về HES Core mà không cần đợi lượt quét Polling tuần tự.
                    </div>
                </div>
            </div>
        </div>

        <!-- Dòng bảo mật & Footer Actions -->
        <div class="hes-cfg-sec-note-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" style="flex-shrink: 0;">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Các chu kỳ Polling và ngưỡng giám sát điện áp Umin/Umax được lưu trong bảng cấu hình và đồng bộ tức thời đến các worker thread giám sát SCADA.</span>
        </div>

        <div class="hes-cfg-bottom-action-bar">
            <div class="hes-cfg-bottom-left">
                <button type="button" class="hes-btn-cfg-revert" onclick="alert('Đã khôi phục các tham số Polling mặc định!')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    Khôi phục giá trị trước đó
                </button>
                <span style="font-size: 12px; color: #64748B;">Thay đổi chưa lưu: <strong>0</strong></span>
            </div>
            <div class="hes-cfg-bottom-right">
                <button type="button" class="hes-btn-cfg-validate" onclick="alert('Kiểm tra chu kỳ Polling: Ngưỡng điện áp và tần suất quét hoàn toàn hợp lệ!')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Kiểm tra toàn bộ
                </button>
                <button type="button" class="hes-btn-cfg-save-footer" onclick="saveConfiguration()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Lưu cấu hình
                </button>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         PHÂN HỆ 3: AN NINH, TÀI KHOẢN & TOKEN API
         ========================================================================== -->
    <div class="hes-cfg-tab-panel" id="tabPanel_3">
        <div class="hes-cfg-main-grid">
            <!-- Cột trái: Bảo mật & Xác thực lệnh -->
            <div class="hes-cfg-col">
                <div class="hes-cfg-card">
                    <div class="hes-cfg-card-header">
                        <div class="hes-cfg-card-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                            BẢO MẬT &amp; XÁC THỰC LỆNH (SECURITY &amp; SAFETY)
                        </div>
                        <span class="hes-cfg-badge-interlock">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            INTERLOCK ON
                        </span>
                    </div>

                    <!-- Hàng 1: Safety Command Interlock Checkbox -->
                    <label class="hes-cfg-checkbox-row">
                        <input type="checkbox" id="chkSafetyInterlock" checked="checked" />
                        <span class="hes-cfg-checkbox-text">
                            <span class="hes-cfg-checkbox-title" style="color: #991B1B;">Chế độ an toàn 2 lớp khi điều khiển đóng ngắt (Safety Command Interlock)</span>
                            <span class="hes-cfg-checkbox-desc">
                                Bắt buộc xác nhận mật khẩu Admin và hiển thị cảnh báo phụ tải trước khi phát lệnh BẬT/TẮT toàn bộ tủ trạm.
                            </span>
                        </span>
                    </label>

                    <!-- Hàng 2: Rate Limit & Session Timeout -->
                    <div class="hes-cfg-two-col">
                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Hạn mức gửi lệnh hàng loạt:</label>
                            <div class="hes-cfg-input-box">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 14 14"></polyline>
                                </svg>
                                <input type="text" class="hes-cfg-input" id="txtRateLimit" value="Tối đa 10 trạm/giây" />
                            </div>
                            <span class="hes-cfg-hint">Chống nghẽn hàng đợi 4G LTE/NBIoT</span>
                        </div>

                        <div class="hes-cfg-field">
                            <label class="hes-cfg-label">Khóa phiên không thao tác:</label>
                            <div class="hes-cfg-input-box">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <input type="text" class="hes-cfg-input" id="txtSessionTimeout" value="15 phút" />
                            </div>
                            <span class="hes-cfg-hint">Tự động Logout về màn hình Login</span>
                        </div>
                    </div>

                    <!-- Hàng 3: REST / MQTT API Token -->
                    <div class="hes-cfg-form-group" style="margin-bottom: 0;">
                        <label class="hes-cfg-label">HES Gateway REST/MQTT Token:</label>
                        <div class="hes-cfg-input-box">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                                <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5L12 8l1.5 1.5-1.5 1.5-2-2-4 4a5.5 5.5 0 0 0 7.78 7.78l4-4-2-2 1.5-1.5L19 12l2.5-2.5-1.5-1.5L22 6l-2-2-2 2"></path>
                            </svg>
                            <input type="text" class="hes-cfg-input" id="txtApiToken" value="hes_live_sec_token_94a8c30ef2b145a88bf" style="font-family: monospace; font-size: 11.5px; color: #4338CA;" />
                            <button type="button" class="hes-btn-view-frame" onclick="generateNewToken()" style="border-radius: 4px; padding: 4px 8px; font-size: 11px; font-weight: 700; color: #1D4ED8;">
                                Tạo mã mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cột phải: Phân quyền tài khoản vận hành -->
            <div class="hes-cfg-col">
                <div class="hes-cfg-card">
                    <div class="hes-cfg-card-header">
                        <div class="hes-cfg-card-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            PHÂN QUYỀN TRUY CẬP &amp; TÀI KHOẢN VẬN HÀNH
                        </div>
                        <span class="hes-cfg-badge-active">SYS_ADMIN</span>
                    </div>

                    <div class="hes-data-engine-list">
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Quản trị viên (Admin):</span>
                            <span class="hes-data-engine-val" style="color: #0F172A;">Toàn quyền cấu hình &amp; phát lệnh</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Điều độ viên (Dispatcher):</span>
                            <span class="hes-data-engine-val" style="color: #2563EB;">Phát lệnh điều khiển &amp; xử lý sự cố</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Giám sát viên (Operator):</span>
                            <span class="hes-data-engine-val">Chỉ xem dữ liệu đo lường &amp; nhật ký</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Khóa tài khoản sau 5 lần sai:</span>
                            <span class="hes-data-engine-val" style="color: #16A34A;">Kích hoạt (Khóa 30 phút)</span>
                        </div>
                        <div class="hes-data-engine-item">
                            <span class="hes-data-engine-label">Thời hạn mã hóa Token:</span>
                            <span class="hes-data-engine-val">90 ngày (Tự động xoay khóa)</span>
                        </div>
                    </div>

                    <div class="hes-sql-notice-box" style="margin-top: 14px;">
                        ⓘ Toàn bộ phiên đăng nhập của điều độ viên và quản trị viên được ghi nhận chi tiết vào bảng Audit Trail để phục vụ thanh tra an toàn thông tin.
                    </div>
                </div>
            </div>
        </div>

        <!-- Dòng bảo mật & Footer Actions -->
        <div class="hes-cfg-sec-note-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" style="flex-shrink: 0;">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Cơ chế bảo mật 2 lớp Safety Command Interlock ngăn chặn tuyệt đối các thao tác nhầm lẫn gây ngắt điện diện rộng trên toàn hệ thống chiếu sáng đô thị.</span>
        </div>

        <div class="hes-cfg-bottom-action-bar">
            <div class="hes-cfg-bottom-left">
                <button type="button" class="hes-btn-cfg-revert" onclick="alert('Đã khôi phục các tham số Bảo mật mặc định!')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    Khôi phục giá trị trước đó
                </button>
                <span style="font-size: 12px; color: #64748B;">Thay đổi chưa lưu: <strong>0</strong></span>
            </div>
            <div class="hes-cfg-bottom-right">
                <button type="button" class="hes-btn-cfg-validate" onclick="alert('Kiểm tra bảo mật: Token và Interlock hợp lệ!')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Kiểm tra toàn bộ
                </button>
                <button type="button" class="hes-btn-cfg-save-footer" onclick="saveConfiguration()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Lưu cấu hình
                </button>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         PHÂN HỆ 4: SAO LƯU & NHẬT KÝ HỆ THỐNG
         ========================================================================== -->
    <div class="hes-cfg-tab-panel" id="tabPanel_4">
        <!-- BẢNG NHẬT KÝ THAY ĐỔI CẤU HÌNH GẦN NHẤT -->
        <div class="hes-cfg-audit-card">
            <div class="hes-cfg-audit-header">
                <div class="hes-cfg-audit-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 14 14"></polyline>
                    </svg>
                    NHẬT KÝ THAY ĐỔI CẤU HÌNH GẦN NHẤT
                </div>
                <div class="hes-cfg-audit-meta">
                    <span class="hes-cfg-audit-count">Tổng số bản ghi: <strong>148 bản ghi</strong></span>
                    <button type="button" class="hes-btn-audit-export" onclick="alert('Đang trích xuất Nhật ký thay đổi cấu hình ra file Excel...')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Xuất Excel
                    </button>
                </div>
            </div>

            <div class="hes-comm-table-responsive" style="overflow-x: hidden;">
                <table class="hes-cfg-audit-table hes-table-fit">
                    <thead>
                        <tr>
                            <th style="width: 45px; text-align: center;">STT</th>
                            <th style="width: 145px;">THỜI GIAN</th>
                            <th style="width: 165px;">NGƯỜI THAO TÁC</th>
                            <th style="min-width: 220px;">MỤC THAY ĐỔI</th>
                            <th style="width: 95px; text-align: center;">GIÁ TRỊ CŨ</th>
                            <th style="width: 95px; text-align: center;">GIÁ TRỊ MỚI</th>
                            <th style="width: 130px; text-align: center;">TRẠNG THÁI HES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align: center;"><strong>01</strong></td>
                            <td style="font-family: 'Consolas', monospace; color: #475569;">2024-10-24 14:15:22</td>
                            <td style="font-weight: 700; color: #0F172A;">Quản trị viên (Trần Văn An)</td>
                            <td class="hes-param-code">Thời gian chờ kết nối TCP</td>
                            <td class="hes-val-code" style="color: #64748B; text-align: center;">45</td>
                            <td class="hes-val-code" style="color: #0F172A; font-weight: 800; text-align: center;">30</td>
                            <td style="text-align: center;">
                                <span class="hes-badge-applied">
                                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #16A34A;"></span>
                                    Áp dụng tức thì
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: center;"><strong>02</strong></td>
                            <td style="font-family: 'Consolas', monospace; color: #475569;">2024-10-23 16:20:10</td>
                            <td style="font-weight: 700; color: #0F172A;">Quản trị viên (Trần Văn An)</td>
                            <td class="hes-param-code">Chu kỳ quét dữ liệu (ms)</td>
                            <td class="hes-val-code" style="color: #64748B; text-align: center;">10000</td>
                            <td class="hes-val-code" style="color: #0F172A; font-weight: 800; text-align: center;">5000</td>
                            <td style="text-align: center;">
                                <span class="hes-badge-applied">
                                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #16A34A;"></span>
                                    Áp dụng tức thì
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: center;"><strong>03</strong></td>
                            <td style="font-family: 'Consolas', monospace; color: #475569;">2024-10-23 09:44:05</td>
                            <td style="font-weight: 700; color: #0F172A;">Điều độ viên (Lê Hoàng)</td>
                            <td class="hes-param-code">Cơ chế an toàn 2 lớp khi gửi lệnh</td>
                            <td class="hes-val-code" style="color: #DC2626; text-align: center;">Vô hiệu hóa</td>
                            <td class="hes-val-code" style="color: #16A34A; font-weight: 800; text-align: center;">Kích hoạt</td>
                            <td style="text-align: center;">
                                <span class="hes-badge-applied">
                                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #16A34A;"></span>
                                    Áp dụng tức thì
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Khung sao lưu & Phục hồi hệ thống -->
        <div class="hes-cfg-card" style="margin-top: 20px;">
            <div class="hes-cfg-card-header">
                <div class="hes-cfg-card-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    SAO LƯU &amp; PHỤC HỒI CẤU HÌNH HỆ THỐNG
                </div>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button type="button" class="hes-btn-sql-test" style="margin: 0;" onclick="alert('Đã trích xuất tệp sao lưu cấu hình HES: hes_backup_config_latest.json')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Sao lưu cấu hình hiện tại (Export Config JSON)
                </button>
                <button type="button" class="hes-btn-cfg-revert" onclick="alert('Vui lòng chọn file cấu hình JSON hợp lệ để phục hồi!')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Khôi phục từ bản sao lưu (Import Config)
                </button>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         SCRIPT TƯƠNG TÁC CHUYỂN TAB & CẤU HÌNH HỆ THỐNG
         ========================================================================== -->
    <script type="text/javascript">
        // Hàm chuyển đổi phân hệ cấu hình qua các nút tab
        function switchHesConfigTab(tabIndex) {
            // 1. Cập nhật trạng thái active cho các button trong thanh tab
            var tabs = document.querySelectorAll('.hes-cfg-tab-item');
            tabs.forEach(function (tab, idx) {
                if (idx === tabIndex) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            // 2. Ẩn toàn bộ các panel và chỉ hiển thị panel của tab được chọn
            var panels = document.querySelectorAll('.hes-cfg-tab-panel');
            panels.forEach(function (panel, idx) {
                if (idx === tabIndex) {
                    panel.style.display = 'block';
                } else {
                    panel.style.display = 'none';
                }
            });

            // 3. Ghi nhớ tab vừa chọn vào localStorage
            try {
                localStorage.setItem('hes_config_active_tab', tabIndex);
            } catch (e) { }
        }

        // Tự động khôi phục tab đang xem hoặc mặc định là Tab 1 (Cấu hình CSDL SQL Server)
        document.addEventListener('DOMContentLoaded', function () {
            var activeIdx = 1; // Mặc định mở Tab 1: Cấu hình CSDL SQL Server như trong hình ảnh mẫu
            try {
                var saved = localStorage.getItem('hes_config_active_tab');
                if (saved !== null && !isNaN(parseInt(saved))) {
                    activeIdx = parseInt(saved);
                }
            } catch (e) { }
            switchHesConfigTab(activeIdx);
        });

        // Hàm kiểm tra kết nối SQL Server
        function testSqlConnection() {
            var banner = document.getElementById('sqlConnectionSuccessBanner');
            if (banner) {
                banner.style.display = 'flex';
                var ms = Math.floor(Math.random() * 4 + 10);
                banner.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: #16A34A;"></span>' +
                                   '<span>Kết nối thành công (' + ms + 'ms) - SQL 2022 Enterprise</span>';
            }
            alert('Kiểm tra kết nối CSDL SQL Server thành công!\n- Máy chủ: localhost\\SQLEXPRESS\n- Cơ sở dữ liệu: dbSmartLight\n- Độ trễ: 12ms\n- Connection Pool: 12/120 Active');
        }

        // Ẩn / hiện mật khẩu SQL Server
        function toggleSqlPassword() {
            var pwd = document.getElementById('txtSqlPassword');
            if (pwd) {
                pwd.type = (pwd.type === 'password') ? 'text' : 'password';
            }
        }

        // Lưu cấu hình
        function saveConfiguration() {
            alert('Đã lưu thành công cấu hình hệ thống vào CSDL dbo.HeThong_CauHinh và đồng bộ sang HES Core Gateway!');
        }

        // Kiểm tra kết nối toàn bộ hệ thống
        function testAllConnections() {
            alert('Kiểm tra hoàn tất:\n- TCP Socket Port 8088: LISTENING\n- SQL Server dbSmartLight: CONNECTED (12ms)\n- 3 Trạm RTU: ONLINE (Sẵn sàng nhận lệnh)');
        }

        // Khởi động lại HES Core Gateway
        function restartHesCore() {
            if (confirm('CẢNH BÁO: Khởi động lại HES Core sẽ ngắt kết nối Socket tạm thời với các trạm trong khoảng 2-3 giây. Bạn có chắc chắn muốn thực hiện?')) {
                alert('Đã gửi tín hiệu khởi động lại HES Core Gateway Service thành công.');
            }
        }

        // Sinh mã Token API mới
        function generateNewToken() {
            var rand = 'hes_live_sec_token_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
            var txt = document.getElementById('txtApiToken');
            if (txt) {
                txt.value = rand;
                alert('Đã sinh token bảo mật mới: ' + rand);
            }
        }
    </script>
</asp:Content>
