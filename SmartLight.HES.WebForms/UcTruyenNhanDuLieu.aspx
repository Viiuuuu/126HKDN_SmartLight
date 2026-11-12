<%@ Page Title="Truyền nhận dữ liệu HES" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="UcTruyenNhanDuLieu.aspx.cs" Inherits="SmartLight.HES.WebForms.UcTruyenNhanDuLieu" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <!-- ==========================================================================
         A. THANH CÔNG CỤ ĐIỀU KHIỂN & LỌC TRUYỀN NHẬN DỮ LIỆU
         ========================================================================== -->
    <div class="hes-comm-card-toolbar">
        <!-- Hàng 1: Chọn tủ & Chiều truyền -->
        <div class="hes-comm-filter-row">
            <div class="hes-comm-select-wrapper">
                <span class="hes-comm-select-label">
                    <!-- Icon trạm / tủ điện SCADA -->
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                        <line x1="9" y1="6" x2="15" y2="6"></line>
                        <line x1="9" y1="10" x2="15" y2="10"></line>
                        <circle cx="12" cy="16" r="1.5"></circle>
                    </svg>
                    TỦ ĐIỀU KHIỂN:
                </span>
                <select class="hes-comm-select" id="selectTuDieuKhien">
                    <option value="TC00001" selected="selected">TCS-01 [Trần Hưng Đạo - Phố Đi Bộ]</option>
                    <option value="TC00002">TCS-02 [Nguyễn Huệ - Trung tâm]</option>
                    <option value="TC00003">TCS-03 [Cầu Ba Son - Thủ Thiêm]</option>
                    <option value="TC00004">TCS-04 [Võ Văn Kiệt - Cầu Ông Lãnh]</option>
                </select>
            </div>

            <div class="hes-comm-dir-tabs">
                <button type="button" class="hes-comm-dir-tab active">
                    Tất cả
                </button>
                <button type="button" class="hes-comm-dir-tab">
                    <span class="hes-comm-dir-dot rx"></span> RX (Nhận từ trạm)
                </button>
                <button type="button" class="hes-comm-dir-tab">
                    <span class="hes-comm-dir-dot tx"></span> TX (Gửi đến trạm)
                </button>
            </div>
        </div>

        <!-- Hàng 2: Lọc theo loại gói tin & Các nút hành động luồng dữ liệu nằm cùng hàng -->
        <div class="hes-comm-filter-row hes-comm-row-align">
            <div class="hes-comm-select-wrapper hes-comm-select-type-lg">
                <span class="hes-comm-select-label">
                    <!-- Icon phễu lọc -->
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#21517D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    LOẠI GÓI:
                </span>
                <select class="hes-comm-select" id="selectLoaiGoi">
                    <option value="ALL">Tất cả các loại gói tin</option>
                    <option value="TELEMETRY" selected="selected">Telemetry đo lường điện năng</option>
                    <option value="COMMAND">Lệnh điều khiển đóng cắt / Dimmer</option>
                    <option value="HEARTBEAT">Heartbeat / Ping chu kỳ</option>
                    <option value="ALARM">Báo động sự cố khẩn cấp</option>
                </select>
            </div>

            <div class="hes-comm-actions-row">
                <button type="button" class="hes-btn-comm-action" id="btnPauseScroll" onclick="toggleScroll(this)">
                    <!-- Icon Pause -->
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                    <span>Tạm dừng cuộn</span>
                </button>
                <button type="button" class="hes-btn-comm-action" id="btnClearStream" onclick="clearStreamLog()">
                    <!-- Icon Clear / Truncate -->
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                    <span>Xóa hiển thị</span>
                </button>
                <button type="button" class="hes-btn-comm-refresh" id="btnRefreshStream" onclick="location.reload();">
                    <!-- Icon Refresh -->
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    <span>Làm mới luồng</span>
                </button>
            </div>
        </div>

        <!-- Hàng 4: Thanh trạng thái Buffer Service Runtime -->
        <div class="hes-comm-buffer-banner">
            <div class="hes-comm-buffer-text">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Dữ liệu được lấy trực tiếp từ <strong>HES Service Runtime</strong> (RAM Ring-Buffer 4096 frames); dbSmartLight hiện chưa lưu bản tin RAW để tối ưu I/O.</span>
            </div>
            <div class="hes-comm-buffer-stats">
                <span class="hes-comm-buffer-stat-item">Tốc độ nhận: <strong>14 pkts/s</strong></span>
                <span class="hes-comm-buffer-stat-item">Bộ đệm RAM: <strong>256/4096</strong></span>
                <span class="hes-comm-buffer-stat-item">TCP Port: <strong>8088</strong></span>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         B. BẢNG THEO DÕI GÓI TIN GIAO TIẾP TCP/IP (REAL-TIME FRAME LOG)
         ========================================================================== -->
    <div class="hes-comm-log-card">
        <div class="hes-comm-table-header">
            <div class="hes-comm-table-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                BẢNG THEO DÕI GÓI TIN GIAO TIẾP TCP/IP (REAL-TIME FRAME LOG)
            </div>
            <div class="hes-comm-quick-filters">
                <button type="button" class="hes-comm-filter-pill recent">8 GÓI TIN MỚI NHẤT</button>
                <button type="button" class="hes-comm-filter-pill rx">RX (Trạm gửi lên)</button>
                <button type="button" class="hes-comm-filter-pill tx">TX (HES phát xuống)</button>
                <button type="button" class="hes-comm-filter-pill err">Lỗi truyền thông</button>
            </div>
        </div>

        <div class="hes-comm-table-responsive">
            <table class="hes-comm-table" id="commStreamTable">
                <thead>
                    <tr>
                        <th style="width: 50px;">STT</th>
                        <th style="width: 110px;">THỜI GIAN (MS)</th>
                        <th style="width: 90px;">MÃ THIẾT BỊ</th>
                        <th style="width: 80px;">CHIỀU TRUYỀN</th>
                        <th style="width: 140px;">LOẠI GÓI TIN</th>
                        <th style="width: 140px;">TRẠNG THÁI XỬ LÝ</th>
                        <th>NỘI DUNG TÓM TẮT KHUNG TIN</th>
                        <th style="width: 60px; text-align: center;">CHI TIẾT</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Dòng 1: Telemetry TCS-01 Đang chọn -->
                    <tr class="hes-comm-row-selected" onclick="selectFrameRow(this, '1042')">
                        <td><strong>1042</strong></td>
                        <td style="font-family: 'Consolas', monospace; color: #334155;">15:42:19.450</td>
                        <td><span class="hes-station-badge">TCS-01</span></td>
                        <td><span class="hes-dir-badge rx">&darr; RX</span></td>
                        <td style="font-weight: 600;">Telemetry đo lường</td>
                        <td>
                            <span class="hes-status-badge valid">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Hợp lệ CRC16
                            </span>
                        </td>
                        <td style="color: #334155; font-family: 'Consolas', monospace; font-size: 11.5px;">
                            U: 224.2V/223.8V/225.1V | I: 18.4A/19.1A/18.8A | P: 12.6kW | Cos&phi;: 0...
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-btn-view-frame active" title="Xem chi tiết frame">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </td>
                    </tr>

                    <!-- Dòng 2: Lệnh điều khiển TX TCS-01 -->
                    <tr onclick="selectFrameRow(this, '1041')">
                        <td><strong>1041</strong></td>
                        <td style="font-family: 'Consolas', monospace; color: #334155;">15:42:15.112</td>
                        <td><span class="hes-station-badge">TCS-01</span></td>
                        <td><span class="hes-dir-badge tx">&uarr; TX</span></td>
                        <td style="font-weight: 600;">Lệnh điều khiển</td>
                        <td>
                            <span class="hes-status-badge sent">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Gửi thành công
                            </span>
                        </td>
                        <td style="color: #334155; font-family: 'Consolas', monospace; font-size: 11.5px;">
                            CMD_RELAY_SET: Chuyển Contactor K2 &rarr; BẬT (100% độ sáng cụm đèn...
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-btn-view-frame" title="Xem chi tiết frame">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </td>
                    </tr>

                    <!-- Dòng 3: Heartbeat / Ping TCS-02 -->
                    <tr onclick="selectFrameRow(this, '1040')">
                        <td><strong>1040</strong></td>
                        <td style="font-family: 'Consolas', monospace; color: #334155;">15:42:10.025</td>
                        <td><span class="hes-station-badge">TCS-02</span></td>
                        <td><span class="hes-dir-badge rx">&darr; RX</span></td>
                        <td style="font-weight: 600;">Heartbeat / Ping</td>
                        <td>
                            <span class="hes-status-badge valid">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Hợp lệ CRC16
                            </span>
                        </td>
                        <td style="color: #334155; font-family: 'Consolas', monospace; font-size: 11.5px;">
                            HEARTBEAT_ACK | Tín hiệu GSM RSSI: -67 dBm (4G Tốt) | Nhiệt độ tủ: 3...
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-btn-view-frame" title="Xem chi tiết frame">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </td>
                    </tr>

                    <!-- Dòng 4: Lỗi CRC TCS-03 -->
                    <tr class="hes-comm-row-error" onclick="selectFrameRow(this, '1039')">
                        <td style="color: #DC2626;"><strong>1039</strong></td>
                        <td style="font-family: 'Consolas', monospace; color: #DC2626;">15:42:04.890</td>
                        <td><span class="hes-station-badge danger">TCS-03</span></td>
                        <td><span class="hes-dir-badge rx-err">&darr; RX</span></td>
                        <td style="font-weight: 600; color: #DC2626;">Telemetry đo lường</td>
                        <td>
                            <span class="hes-status-badge error">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                Lỗi CRC16 (Mismatch)
                            </span>
                        </td>
                        <td style="color: #DC2626; font-family: 'Consolas', monospace; font-size: 11.5px; font-weight: 700;">
                            CORRUPTED FRAME: Byte độ dài không khớp (Kỳ vọng: 28B, Nhận: 19B)...
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-btn-view-frame" title="Xem chi tiết frame">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </td>
                    </tr>

                    <!-- Dòng 5: Báo động sự cố khẩn TCS-04 -->
                    <tr onclick="selectFrameRow(this, '1038')">
                        <td><strong>1038</strong></td>
                        <td style="font-family: 'Consolas', monospace; color: #334155;">15:41:58.320</td>
                        <td><span class="hes-station-badge">TCS-04</span></td>
                        <td><span class="hes-dir-badge rx">&darr; RX</span></td>
                        <td style="font-weight: 600;">Báo động sự cố khẩn</td>
                        <td>
                            <span class="hes-status-badge valid">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Hợp lệ CRC16
                            </span>
                        </td>
                        <td style="color: #334155; font-family: 'Consolas', monospace; font-size: 11.5px;">
                            ALARM_OVERCURRENT: Dòng điện Pha 2 vượt ngưỡng cảnh báo I2=32....
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="hes-btn-view-frame" title="Xem chi tiết frame">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- ==========================================================================
         C. KHU VỰC PHÂN TÍCH: RAW DATA (HEX) & PARSED DATA (GIẢI MÃ)
         ========================================================================== -->
    <div class="hes-comm-detail-grid">
        <!-- 1. RAW DATA (BYTE HEX VIEWER) -->
        <div class="hes-comm-detail-card">
            <div class="hes-comm-detail-header">
                <div class="hes-comm-detail-title">
                    <!-- Icon vi mạch / byte -->
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
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
                    RAW DATA (BYTE HEX VIEWER)
                </div>
                <div class="hes-comm-detail-header-actions">
                    <span class="hes-proto-tag" style="background: #E2E8F0; color: #475569; font-weight: 800;">25 BYTES</span>
                    <button type="button" class="hes-btn-copy-hex" onclick="copyHexBytes()">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Sao chép HEX
                    </button>
                </div>
            </div>

            <!-- Protocol Tag Bar -->
            <div class="hes-protocol-tag-bar">
                <span class="hes-proto-tag header">Header (68)</span>
                <span class="hes-proto-tag length">Length (1A 00)</span>
                <span class="hes-proto-tag station">Station ID (00 00 64 02)</span>
                <span class="hes-proto-tag apdu">APDU (08 C2)</span>
                <span class="hes-proto-tag payload">Telemetry Payload (12B)</span>
                <span class="hes-proto-tag crc">CRC16 (45 12)</span>
                <span class="hes-proto-tag tail">Tail (16)</span>
            </div>

            <!-- Hex Dump Box -->
            <div class="hes-hex-dump-box">
                <div class="hes-hex-dump-caption">0000: -- Hex Frame Raw Dump (DL/T 645 - SCADA Extended) --</div>
                <div class="hes-hex-bytes-grid" id="hexByteContainer">
                    <span class="hes-hex-byte header" title="Header: 0x68">68</span>
                    <span class="hes-hex-byte length" title="Length: 0x1A 0x00">1A 00</span>
                    <span class="hes-hex-byte station" title="Station ID: 00 00 00 64 02">00 00 00 64 02</span>
                    <span class="hes-hex-byte apdu" title="APDU: 08 C2">08 C2</span>
                    <span class="hes-hex-byte" title="Payload 0: 00 B8">00 B8</span>
                    <span class="hes-hex-byte" title="Payload 1: 01 0A">01 0A</span>
                    <span class="hes-hex-byte" title="Payload 2: E0 08">E0 08</span>
                    <span class="hes-hex-byte" title="Payload 3: 01 40">01 40</span>
                    <span class="hes-hex-byte" title="Payload 4: 01 81">01 81</span>
                    <span class="hes-hex-byte" title="Payload 5: 01 F4 62">01 F4 62</span>
                    <span class="hes-hex-byte crc" title="CRC16 Checksum: 45 12">45 12</span>
                    <span class="hes-hex-byte tail" title="Tail: 0x16">16</span>
                </div>
            </div>

            <!-- Telemetry specs footer -->
            <div class="hes-comm-specs-footer">
                <div class="hes-comm-spec-item">
                    <span class="hes-comm-spec-label">GIAO THỨC TRUYỀN:</span>
                    <span class="hes-comm-spec-value">IEC 60870-5-104 / Custom HES</span>
                </div>
                <div class="hes-comm-spec-item">
                    <span class="hes-comm-spec-label">THUẬT TOÁN CRC:</span>
                    <span class="hes-comm-spec-value">CRC-16-IBM (Poly 0x8005)</span>
                </div>
                <div class="hes-comm-spec-item">
                    <span class="hes-comm-spec-label">ĐỊA CHỈ TRUYỀN:</span>
                    <span class="hes-comm-spec-value">192.168.1.101 : 45220</span>
                </div>
            </div>
        </div>

        <!-- 2. PARSED DATA (CÂY DỮ LIỆU ĐÃ GIẢI MÃ) -->
        <div class="hes-comm-detail-card">
            <div class="hes-comm-detail-header">
                <div class="hes-comm-detail-title">
                    <!-- Icon Cấu trúc dữ liệu đã giải mã -->
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#073B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="6" y1="3" x2="6" y2="15"></line>
                        <circle cx="18" cy="6" r="3"></circle>
                        <circle cx="6" cy="18" r="3"></circle>
                        <path d="M18 9a9 9 0 0 1-9 9"></path>
                    </svg>
                    PARSED DATA (CÂY DỮ LIỆU ĐÃ GIẢI MÃ)
                </div>
                <div class="hes-comm-detail-header-actions">
                    <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; color: #10B981;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981;"></span>
                        DECODE SUCCESS
                    </span>
                </div>
            </div>

            <!-- Trạm & Trạng thái giải mã -->
            <div class="hes-parsed-station-info">
                <div class="hes-parsed-station-name">
                    TỦ NGUỒN: <strong>TCS-01 (Trần Hưng Đạo)</strong>
                </div>
                <div class="hes-parsed-badges">
                    <span class="hes-parsed-badge-report">Telemetry Report</span>
                    <span class="hes-parsed-badge-crc">CRC: 0x4512 [HỢP LỆ]</span>
                </div>
            </div>

            <!-- Khối 1: Thông số điện 3 pha -->
            <div class="hes-parsed-block">
                <div class="hes-parsed-block-title-row">
                    <span class="hes-parsed-block-title">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        1. THÔNG SỐ ĐIỆN 3 PHA (3-PHASE ELECTRICAL LOAD)
                    </span>
                    <span class="hes-parsed-cosphi">Cos&phi; = 0.94</span>
                </div>

                <div class="hes-parsed-3phase-grid">
                    <div class="hes-parsed-phase-item">
                        <div class="hes-parsed-phase-name">PHA A (L1)</div>
                        <div class="hes-parsed-phase-values">
                            <span class="hes-parsed-volt">224.2 <span style="font-size: 11px; font-weight: 600;">V</span></span>
                            <span class="hes-parsed-amp">18.4 <span style="font-size: 10px;">A</span></span>
                        </div>
                    </div>
                    <div class="hes-parsed-phase-item">
                        <div class="hes-parsed-phase-name">PHA B (L2)</div>
                        <div class="hes-parsed-phase-values">
                            <span class="hes-parsed-volt">223.8 <span style="font-size: 11px; font-weight: 600;">V</span></span>
                            <span class="hes-parsed-amp">19.1 <span style="font-size: 10px;">A</span></span>
                        </div>
                    </div>
                    <div class="hes-parsed-phase-item">
                        <div class="hes-parsed-phase-name">PHA C (L3)</div>
                        <div class="hes-parsed-phase-values">
                            <span class="hes-parsed-volt">225.1 <span style="font-size: 11px; font-weight: 600;">V</span></span>
                            <span class="hes-parsed-amp">18.8 <span style="font-size: 10px;">A</span></span>
                        </div>
                    </div>
                </div>

                <div class="hes-parsed-total-power">
                    <span>Tổng công suất tác dụng (Total P):</span>
                    <strong>12.60 kW</strong>
                </div>
            </div>

            <!-- Khối 2: Trạng thái khởi động từ (Contactor) -->
            <div class="hes-parsed-block" style="margin-bottom: 0;">
                <div class="hes-parsed-block-title-row" style="margin-bottom: 10px;">
                    <span class="hes-parsed-block-title">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.2">
                            <circle cx="12" cy="12" r="9"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <circle cx="12" cy="16" r="0.5"></circle>
                        </svg>
                        2. TRẠNG THÁI KHỞI ĐỘNG TỪ (CONTACTOR OUTPUT STATUS)
                    </span>
                </div>

                <div class="hes-contactor-grid">
                    <div class="hes-contactor-item">
                        <div class="hes-contactor-info">
                            <div class="hes-contactor-title">K1: Tuyến chính</div>
                            <div>Đèn LED 120W</div>
                        </div>
                        <span class="hes-contactor-badge on">&bull; ĐÓNG</span>
                    </div>

                    <div class="hes-contactor-item">
                        <div class="hes-contactor-info">
                            <div class="hes-contactor-title">K2: Chiếu sáng hè</div>
                            <div>Đèn LED 70W</div>
                        </div>
                        <span class="hes-contactor-badge on">&bull; ĐÓNG</span>
                    </div>

                    <div class="hes-contactor-item">
                        <div class="hes-contactor-info">
                            <div class="hes-contactor-title">K3: Đèn trang trí</div>
                            <div>Cụm hoa văn LED</div>
                        </div>
                        <span class="hes-contactor-badge off">MỞ (TẮT)</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Script tương tác bổ sung trang Truyền nhận dữ liệu -->
    <script type="text/javascript">
        var isPaused = false;

        function toggleScroll(btn) {
            isPaused = !isPaused;
            if (isPaused) {
                btn.style.backgroundColor = '#FEF2F2';
                btn.style.color = '#DC2626';
                btn.style.borderColor = '#FCA5A5';
                btn.querySelector('span').innerText = 'Tiếp tục cuộn';
            } else {
                btn.style.backgroundColor = '';
                btn.style.color = '';
                btn.style.borderColor = '';
                btn.querySelector('span').innerText = 'Tạm dừng cuộn';
            }
        }

        function clearStreamLog() {
            var tbody = document.querySelector('#commStreamTable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #94A3B8; padding: 24px;">Đã xóa hiển thị log. Đang chờ gói tin socket tiếp theo...</td></tr>';
            }
        }

        function selectFrameRow(row, frameId) {
            var allRows = document.querySelectorAll('#commStreamTable tbody tr');
            allRows.forEach(function (r) {
                r.classList.remove('hes-comm-row-selected');
                var btn = r.querySelector('.hes-btn-view-frame');
                if (btn) btn.classList.remove('active');
            });

            row.classList.add('hes-comm-row-selected');
            var curBtn = row.querySelector('.hes-btn-view-frame');
            if (curBtn) curBtn.classList.add('active');
        }

        function copyHexBytes() {
            var container = document.getElementById('hexByteContainer');
            if (container) {
                var text = container.innerText.replace(/\s+/g, ' ').trim();
                navigator.clipboard.writeText(text).then(function () {
                    alert('Đã sao chép chuỗi HEX vào clipboard: ' + text);
                });
            }
        }
    </script>
</asp:Content>

