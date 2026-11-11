<%@ Page Title="Giám sát thông số điện" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="UcGiamSatDien.aspx.cs" Inherits="SmartLight.HES.WebForms.UcGiamSatDien" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <!-- ==========================================================================
         A. THANH TIÊU ĐỀ GIÁM SÁT THÔNG SỐ ĐIỆN
         ========================================================================== -->
    <div class="hes-dash-header">
        <div class="hes-dash-title-group">
            <div class="hes-dash-icon-box">
                <svg viewBox="0 0 24 24">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
            </div>
            <div>
                <h1 class="hes-dash-title">Giám sát thông số điện</h1>
            </div>
            <span class="hes-sync-badge">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span id="hesSyncBadgeText">Dữ liệu SCADA trực tuyến</span>
            </span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <!-- Bộ chọn tủ điều khiển -->
            <select class="hes-select-cabinet" id="hesSelectCabinet" title="Chọn tủ điều khiển">
                <option value="TC00001" selected="selected">TC00001 – Tủ Bạch Đằng 01 (Online - 224V)</option>
                <option value="TC00002">TC00002 – Tủ 2 Tháng 9 01 (Online - 219V)</option>
                <option value="TC00003">TC00003 – Tủ Điện Biên Phủ 01 (Mất kết nối - 0V)</option>
                <option value="TC00004">TC00004 – Tủ Võ Nguyên Giáp 01 (Online - 221V)</option>
            </select>

            <button type="button" class="hes-btn-refresh" id="hesBtnRefresh">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span>Đọc tức thời</span>
            </button>
        </div>
    </div>

    <!-- ==========================================================================
         B. BỐN CARD THỐNG KÊ TỔNG THỂ TỦ ĐANG CHỌN
         ========================================================================== -->
    <div class="hes-stats-grid">
        <!-- Card 1: Điện áp trung bình -->
        <div class="hes-stat-card">
            <div class="hes-stat-label">ĐIỆN ÁP TRUNG BÌNH (Uavg)</div>
            <div class="hes-stat-value-row">
                <span class="hes-stat-number">224.2</span>
                <span class="hes-stat-subtext">Volts (AC)</span>
            </div>
            <div class="hes-stat-footer">
                <span class="hes-status-dot"></span>
                <span>Chuẩn lưới: 220V ± 5% (Ổn định)</span>
            </div>
        </div>

        <!-- Card 2: Tổng dòng điện 3 pha -->
        <div class="hes-stat-card">
            <div class="hes-stat-label">TỔNG DÒNG ĐIỆN 3 PHA (Itotal)</div>
            <div class="hes-stat-value-row">
                <span class="hes-stat-number">18.6</span>
                <span class="hes-stat-subtext">Amperes</span>
            </div>
            <div class="hes-stat-footer">
                <span class="hes-status-dot" style="background-color: #0284C7; box-shadow: none;"></span>
                <span>Định mức tủ: 60A (Tải 31%)</span>
            </div>
        </div>

        <!-- Card 3: Tổng công suất tác dụng -->
        <div class="hes-stat-card">
            <div class="hes-stat-label">TỔNG CÔNG SUẤT TIÊU THỤ (P)</div>
            <div class="hes-stat-value-row">
                <span class="hes-stat-number">4.12</span>
                <span class="hes-stat-subtext">kW</span>
            </div>
            <div class="hes-stat-footer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0BB78A" stroke-width="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span style="color: #334155; font-weight: 500;">Hệ số Cos &phi;: <strong>0.98</strong></span>
            </div>
        </div>

        <!-- Card 4: Điện năng tích lũy -->
        <div class="hes-stat-card">
            <div class="hes-stat-label">ĐIỆN NĂNG TÍCH LŨY (E)</div>
            <div class="hes-stat-value-row">
                <span class="hes-stat-number">1,482.6</span>
                <span class="hes-stat-subtext">kWh</span>
            </div>
            <div class="hes-stat-footer">
                <span>Chỉ số công tơ điện tử tử vi mô</span>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         C. CHI TIẾT THÔNG SỐ 3 PHA (PHA A, PHA B, PHA C)
         ========================================================================== -->
    <div class="hes-phase-grid">
        <!-- Pha A (L1) -->
        <div class="hes-phase-card phase-a">
            <div class="hes-phase-header">
                <span class="hes-phase-tag tag-phase-a">Pha A (L1)</span>
                <span class="hes-phase-status">
                    <span class="hes-status-dot" style="width: 6px; height: 6px;"></span> Bình thường
                </span>
            </div>
            <div class="hes-phase-metrics-list">
                <div>
                    <div class="hes-metric-row">
                        <span class="hes-metric-title">Điện áp (U_A)</span>
                        <div><span class="hes-metric-val">224.5</span><span class="hes-metric-unit">V</span></div>
                    </div>
                    <div class="hes-gauge-track"><div class="hes-gauge-bar bar-phase-a" style="width: 88%;"></div></div>
                </div>
                <div>
                    <div class="hes-metric-row">
                        <span class="hes-metric-title">Dòng điện (I_A)</span>
                        <div><span class="hes-metric-val">6.2</span><span class="hes-metric-unit">A</span></div>
                    </div>
                    <div class="hes-gauge-track"><div class="hes-gauge-bar bar-phase-a" style="width: 31%;"></div></div>
                </div>
                <div class="hes-metric-row" style="padding-top: 4px; border-top: 1px dashed #E2E8F0;">
                    <span class="hes-metric-title">Công suất (P_A)</span>
                    <div><span class="hes-metric-val" style="font-size: 15px;">1.39</span><span class="hes-metric-unit">kW</span></div>
                </div>
                <div class="hes-metric-row">
                    <span class="hes-metric-title">Tần số / Cos &phi;</span>
                    <span style="font-size: 12px; font-weight: 700; color: #475569;">50.0 Hz &bull; 0.98</span>
                </div>
            </div>
        </div>

        <!-- Pha B (L2) -->
        <div class="hes-phase-card phase-b">
            <div class="hes-phase-header">
                <span class="hes-phase-tag tag-phase-b">Pha B (L2)</span>
                <span class="hes-phase-status">
                    <span class="hes-status-dot" style="width: 6px; height: 6px;"></span> Bình thường
                </span>
            </div>
            <div class="hes-phase-metrics-list">
                <div>
                    <div class="hes-metric-row">
                        <span class="hes-metric-title">Điện áp (U_B)</span>
                        <div><span class="hes-metric-val">223.8</span><span class="hes-metric-unit">V</span></div>
                    </div>
                    <div class="hes-gauge-track"><div class="hes-gauge-bar bar-phase-b" style="width: 87%;"></div></div>
                </div>
                <div>
                    <div class="hes-metric-row">
                        <span class="hes-metric-title">Dòng điện (I_B)</span>
                        <div><span class="hes-metric-val">6.1</span><span class="hes-metric-unit">A</span></div>
                    </div>
                    <div class="hes-gauge-track"><div class="hes-gauge-bar bar-phase-b" style="width: 30%;"></div></div>
                </div>
                <div class="hes-metric-row" style="padding-top: 4px; border-top: 1px dashed #E2E8F0;">
                    <span class="hes-metric-title">Công suất (P_B)</span>
                    <div><span class="hes-metric-val" style="font-size: 15px;">1.36</span><span class="hes-metric-unit">kW</span></div>
                </div>
                <div class="hes-metric-row">
                    <span class="hes-metric-title">Tần số / Cos &phi;</span>
                    <span style="font-size: 12px; font-weight: 700; color: #475569;">50.0 Hz &bull; 0.98</span>
                </div>
            </div>
        </div>

        <!-- Pha C (L3) -->
        <div class="hes-phase-card phase-c">
            <div class="hes-phase-header">
                <span class="hes-phase-tag tag-phase-c">Pha C (L3)</span>
                <span class="hes-phase-status">
                    <span class="hes-status-dot" style="width: 6px; height: 6px;"></span> Bình thường
                </span>
            </div>
            <div class="hes-phase-metrics-list">
                <div>
                    <div class="hes-metric-row">
                        <span class="hes-metric-title">Điện áp (U_C)</span>
                        <div><span class="hes-metric-val">224.3</span><span class="hes-metric-unit">V</span></div>
                    </div>
                    <div class="hes-gauge-track"><div class="hes-gauge-bar bar-phase-c" style="width: 88%;"></div></div>
                </div>
                <div>
                    <div class="hes-metric-row">
                        <span class="hes-metric-title">Dòng điện (I_C)</span>
                        <div><span class="hes-metric-val">6.3</span><span class="hes-metric-unit">A</span></div>
                    </div>
                    <div class="hes-gauge-track"><div class="hes-gauge-bar bar-phase-c" style="width: 31%;"></div></div>
                </div>
                <div class="hes-metric-row" style="padding-top: 4px; border-top: 1px dashed #E2E8F0;">
                    <span class="hes-metric-title">Công suất (P_C)</span>
                    <div><span class="hes-metric-val" style="font-size: 15px;">1.37</span><span class="hes-metric-unit">kW</span></div>
                </div>
                <div class="hes-metric-row">
                    <span class="hes-metric-title">Tần số / Cos &phi;</span>
                    <span style="font-size: 12px; font-weight: 700; color: #475569;">50.0 Hz &bull; 0.97</span>
                </div>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         D. BIỂU ĐỒ PHỤ TẢI CÔNG SUẤT 24H (LOAD CURVE)
         ========================================================================== -->
    <div class="hes-chart-card">
        <div class="hes-card-header">
            <div class="hes-card-header-left">
                <span class="hes-card-header-icon">
                    <svg viewBox="0 0 24 24">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                </span>
                <h3 class="hes-card-title">Biểu đồ phụ tải công suất 24 Giờ qua (kW)</h3>
            </div>
            <div style="font-size: 12px; color: var(--hes-text-muted);">
                <span style="display: inline-block; width: 10px; height: 10px; background: #073B63; border-radius: 2px; margin-right: 4px;"></span> Công suất P (kW)
                &nbsp;&bull;&nbsp;
                <span style="display: inline-block; width: 10px; height: 10px; background: #0BB78A; border-radius: 2px; margin-right: 4px; margin-left: 8px;"></span> Dimming 50%
            </div>
        </div>

        <div class="hes-chart-svg-wrap">
            <svg viewBox="0 0 900 220" style="width: 100%; height: auto; display: block;">
                <defs>
                    <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#073B63" stop-opacity="0.25"/>
                        <stop offset="100%" stop-color="#073B63" stop-opacity="0.0"/>
                    </linearGradient>
                </defs>

                <!-- Grid lines -->
                <line x1="50" y1="30" x2="880" y2="30" stroke="#F1F5F9" stroke-width="1"/>
                <line x1="50" y1="75" x2="880" y2="75" stroke="#F1F5F9" stroke-width="1"/>
                <line x1="50" y1="120" x2="880" y2="120" stroke="#F1F5F9" stroke-width="1"/>
                <line x1="50" y1="165" x2="880" y2="165" stroke="#F1F5F9" stroke-width="1"/>
                <line x1="50" y1="190" x2="880" y2="190" stroke="#CBD5E1" stroke-width="1.2"/>

                <!-- Y-axis labels -->
                <text x="40" y="35" font-size="11" fill="#94A3B8" text-anchor="end">5 kW</text>
                <text x="40" y="80" font-size="11" fill="#94A3B8" text-anchor="end">4 kW</text>
                <text x="40" y="125" font-size="11" fill="#94A3B8" text-anchor="end">2.5 kW</text>
                <text x="40" y="170" font-size="11" fill="#94A3B8" text-anchor="end">1 kW</text>
                <text x="40" y="195" font-size="11" fill="#94A3B8" text-anchor="end">0</text>

                <!-- Load profile area & line (Night lighting on from 18h to 06h) -->
                <!-- Coordinates: 0h-5h: 2.1kW (y=130); 6h-17h: 0kW (y=190); 18h-23h: 4.12kW (y=72); 24h: 2.1kW (y=130) -->
                <polygon points="50,190 50,130 180,130 220,190 600,190 640,72 780,72 820,130 880,130 880,190" fill="url(#loadGrad)" />
                <polyline points="50,130 180,130 220,190 600,190 640,72 780,72 820,130 880,130"
                          fill="none" stroke="#073B63" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>

                <!-- Highlight dots -->
                <circle cx="180" cy="130" r="4" fill="#0BB78A" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="640" cy="72" r="4" fill="#073B63" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="780" cy="72" r="4" fill="#073B63" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="820" cy="130" r="4" fill="#0BB78A" stroke="#FFFFFF" stroke-width="2"/>

                <!-- X-axis hour labels -->
                <text x="50" y="210" font-size="11" fill="#64748B" text-anchor="middle">00:00</text>
                <text x="180" y="210" font-size="11" fill="#64748B" text-anchor="middle">04:00 (Dim 50%)</text>
                <text x="320" y="210" font-size="11" fill="#64748B" text-anchor="middle">08:00 (Tắt tải)</text>
                <text x="460" y="210" font-size="11" fill="#64748B" text-anchor="middle">12:00</text>
                <text x="600" y="210" font-size="11" fill="#64748B" text-anchor="middle">16:00</text>
                <text x="640" y="210" font-size="11" fill="#64748B" text-anchor="middle">18:00 (Bật 100%)</text>
                <text x="780" y="210" font-size="11" fill="#64748B" text-anchor="middle">22:00</text>
                <text x="880" y="210" font-size="11" fill="#64748B" text-anchor="middle">24:00</text>
            </svg>
        </div>
    </div>

    <!-- ==========================================================================
         E. BẢNG LỊCH SỬ ĐO ĐIỆN ÁP & DÒNG ĐIỆN (DuLieuGiamSatTu)
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
                <h3 class="hes-card-title">Bản ghi thông số điện mới nhất (Bảng DuLieuGiamSatTu)</h3>
                <span class="hes-badge-count">GẦN NHẤT</span>
            </div>
            <div>
                <button type="button" class="hes-btn-filter" onclick="alert('Đang trích xuất dữ liệu đo ra file Excel...')">
                    <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Xuất Excel</span>
                </button>
            </div>
        </div>

        <div class="hes-table-responsive">
            <table class="hes-data-table">
                <thead>
                    <tr>
                        <th>THỜI GIAN ĐO</th>
                        <th>MÃ TỦ</th>
                        <th>PHA A (V / A)</th>
                        <th>PHA B (V / A)</th>
                        <th>PHA C (V / A)</th>
                        <th>CÔNG SUẤT (kW)</th>
                        <th>ĐIỆN NĂNG (kWh)</th>
                        <th>COS &phi;</th>
                        <th style="text-align: center;">TRẠNG THÁI</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight: 600;">14:32:41 Hôm nay</td>
                        <td class="hes-col-code">TC00001</td>
                        <td>224.5 V &bull; 6.2 A</td>
                        <td>223.8 V &bull; 6.1 A</td>
                        <td>224.3 V &bull; 6.3 A</td>
                        <td><strong style="color: var(--hes-primary);">4.12 kW</strong></td>
                        <td>1,482.60</td>
                        <td>0.98</td>
                        <td style="text-align: center;">
                            <span class="hes-badge-pill hes-badge-online">Chuẩn</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600;">14:30:00 Hôm nay</td>
                        <td class="hes-col-code">TC00001</td>
                        <td>224.2 V &bull; 6.2 A</td>
                        <td>223.9 V &bull; 6.1 A</td>
                        <td>224.1 V &bull; 6.2 A</td>
                        <td><strong style="color: var(--hes-primary);">4.10 kW</strong></td>
                        <td>1,482.45</td>
                        <td>0.98</td>
                        <td style="text-align: center;">
                            <span class="hes-badge-pill hes-badge-online">Chuẩn</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600;">14:27:12 Hôm nay</td>
                        <td class="hes-col-code">TC00002</td>
                        <td>219.4 V &bull; 5.8 A</td>
                        <td>219.1 V &bull; 5.9 A</td>
                        <td>219.6 V &bull; 5.8 A</td>
                        <td><strong style="color: var(--hes-primary);">3.84 kW</strong></td>
                        <td>1,215.10</td>
                        <td>0.97</td>
                        <td style="text-align: center;">
                            <span class="hes-badge-pill hes-badge-online">Chuẩn</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600;">14:20:05 Hôm nay</td>
                        <td class="hes-col-code">TC00004</td>
                        <td>221.0 V &bull; 6.0 A</td>
                        <td>220.8 V &bull; 6.1 A</td>
                        <td>221.2 V &bull; 6.0 A</td>
                        <td><strong style="color: var(--hes-primary);">3.98 kW</strong></td>
                        <td>986.30</td>
                        <td>0.98</td>
                        <td style="text-align: center;">
                            <span class="hes-badge-pill hes-badge-online">Chuẩn</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</asp:Content>

