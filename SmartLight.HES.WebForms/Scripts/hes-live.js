(function () {
    'use strict';

    var scriptEl = document.currentScript || document.querySelector('script[src*="hes-live.js"]');
    var apiBase = scriptEl ? scriptEl.src.replace(/Scripts\/hes-live\.js.*$/i, 'HesApi.ashx') : '/HesApi.ashx';

    function esc(val) {
        if (val === null || val === undefined) return '';
        return String(val)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function num(val, digits) {
        if (val === null || val === undefined || isNaN(Number(val))) return '--';
        return Number(val).toFixed(digits === undefined ? 1 : digits);
    }

    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function parseDt(v) {
        if (!v) return null;
        var d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }

    function fmtTime(v) {
        var d = parseDt(v);
        if (!d) return '--';
        return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
    }

    function fmtDateTime(v) {
        var d = parseDt(v);
        if (!d) return '--';
        return fmtTime(d) + ' ' + pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
    }

    function buildUrl(action, params) {
        var q = ['action=' + encodeURIComponent(action)];
        if (params) {
            Object.keys(params).forEach(function (k) {
                if (params[k] !== null && params[k] !== undefined && params[k] !== '') {
                    q.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
                }
            });
        }
        q.push('_t=' + Date.now());
        return apiBase + '?' + q.join('&');
    }

    function apiGet(action, params) {
        return fetch(buildUrl(action, params), { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            });
    }

    function apiPost(action, body) {
        return fetch(buildUrl(action), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(body || {})
        }).then(function (r) {
            return r.json().then(function (data) {
                if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status));
                return data;
            });
        });
    }

    function renderSystemChrome(sys) {
        if (!sys) return;

        var topCards = document.querySelectorAll('.hes-topbar .hes-topbar-card');
        if (topCards.length >= 3) {
            var sqlVal = topCards[0].querySelector('.hes-topbar-val-online, .hes-topbar-val-offline');
            if (sqlVal) {
                sqlVal.textContent = sys.sqlConnected ? 'ONLINE' : 'OFFLINE';
                sqlVal.style.color = sys.sqlConnected ? '' : '#DC2626';
            }
            var sqlDet = topCards[0].querySelector('.hes-topbar-detail');
            if (sqlDet) {
                sqlDet.textContent = sys.sqlConnected
                    ? '(' + (sys.databaseName || 'dbSmartLight') + ' | ' + sys.sqlLatencyMs + 'ms)'
                    : '(Mất kết nối)';
            }

            var tcpLabels = topCards[1].querySelectorAll('span');
            if (tcpLabels.length >= 4) {
                tcpLabels[2].textContent = ':' + (sys.tcpPort || 8088);
                tcpLabels[3].textContent = sys.tcpListening ? 'LISTENING' : 'STOPPED';
                tcpLabels[3].style.color = sys.tcpListening ? '' : '#DC2626';
            }

            var coreVal = topCards[2].querySelector('.hes-topbar-val-running');
            if (coreVal) {
                coreVal.textContent = sys.hesRunning ? 'RUNNING' : 'OFFLINE';
                coreVal.style.color = sys.hesRunning ? '' : '#DC2626';
            }
        }

        var sideTelemetry = document.querySelector('.hes-telemetry-box');
        if (sideTelemetry) {
            var rowSpan = sideTelemetry.querySelector('.hes-telemetry-row span:last-child');
            if (rowSpan) {
                rowSpan.textContent = sys.hesRunning ? 'Core Telemetry: Active' : 'Core Telemetry: Stopped';
            }
            var meta = sideTelemetry.querySelector('.hes-telemetry-meta');
            if (meta) {
                meta.innerHTML = '<span>RTU TCP: ' + (sys.activeSessionCount || 0) + ' online</span> &nbsp;&bull;&nbsp; <span>Port ' + (sys.tcpPort || 8088) + '</span>';
            }
        }

        var strips = document.querySelectorAll('.hes-bottom-status-strip');
        strips.forEach(function (strip) {
            var arch = strip.querySelector('.hes-badge-arch');
            if (arch && (arch.textContent.trim() === 'RUNNING' || arch.textContent.trim() === 'STOPPED')) {
                arch.textContent = sys.hesRunning ? 'RUNNING' : 'STOPPED';
                arch.style.color = sys.hesRunning ? '#059669' : '#DC2626';
                arch.style.backgroundColor = sys.hesRunning ? '#ECFDF5' : '#FEF2F2';
            }
            var midSpans = strip.querySelectorAll('.hes-bottom-status-middle span:not(.hes-status-sep)');
            if (midSpans.length >= 4) {
                midSpans[0].textContent = 'HES Service: ' + (sys.hesRunning ? 'Hoạt động liên tục' : 'Chưa chạy (khởi động SmartLight.HesService)');
                midSpans[1].textContent = 'SQL Server: ' + (sys.sqlConnected ? 'Đã kết nối (' + (sys.databaseName || 'dbSmartLight') + ')' : 'Lỗi kết nối');
                midSpans[2].textContent = 'TCP Server: ' + (sys.tcpListening ? 'Đang lắng nghe Port ' + sys.tcpPort : 'Offline') + ' (' + (sys.activeSessionCount || 0) + ' Tủ Online)';
                midSpans[3].textContent = 'Đồng bộ lần cuối: ' + (sys.serverTimeText || '');
            }
            var ready = strip.querySelector('.hes-badge-ready');
            if (ready) {
                ready.textContent = sys.hesRunning ? 'READY' : 'WAITING';
            }
        });
    }

    function sendScadaCommand(targetType, targetCode, action, mucSang) {
        return apiPost('sendCommand', {
            targetType: targetType,
            targetCode: targetCode,
            hanhDong: action,
            mucSang: mucSang
        });
    }

    function statusBadgeHtml(trangThai) {
        if (trangThai === 2) {
            return '<span class="badge-status-success"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Thành công</span>';
        }
        if (trangThai === 1) {
            return '<span class="badge-status-sent">Đã gửi</span>';
        }
        if (trangThai === 0) {
            return '<span class="badge-status-waiting">Chờ gửi</span>';
        }
        if (trangThai === 4) {
            return '<span class="badge-status-timeout">Quá hạn</span>';
        }
        return '<span class="badge-status-fail">Thất bại</span>';
    }

    function actionBadgeHtml(act) {
        var a = (act || '').toUpperCase();
        if (a === 'BAT') return '<span class="badge-act-bat">BAT</span>';
        if (a === 'TAT') return '<span class="badge-act-tat">TAT</span>';
        return '<span class="badge-act-dim">DIM</span>';
    }

    // =========================================================================
    // 1. TỔNG QUAN HỆ THỐNG (UcTongQuan.aspx)
    // =========================================================================
    function initOverviewPage() {
        var searchInput = document.getElementById('hesCabinetSearch');
        var filterBtn = document.getElementById('hesBtnFilter');
        var loading = false;

        function refresh() {
            if (loading) return;
            loading = true;
            var kw = searchInput ? searchInput.value.trim() : '';
            apiGet('overview', { keyword: kw }).then(function (data) {
                renderSystemChrome(data.systemStatus);
                var kpi = data.kpi || {};
                var total = kpi.totalCabinets || 0;
                var online = kpi.onlineCabinets || 0;
                var offline = kpi.offlineCabinets || 0;
                var totalRoutes = kpi.totalRoutes !== undefined ? kpi.totalRoutes : 0;
                var activeRoutes = kpi.activeRoutes !== undefined ? kpi.activeRoutes : 0;
                var totalLamps = kpi.totalLamps !== undefined ? kpi.totalLamps : 0;
                var activeLamps = kpi.activeLamps !== undefined ? kpi.activeLamps : 0;
                var onlinePct = total > 0 ? Math.round((online * 100) / total) : 0;
                var offlinePct = total > 0 ? (100 - onlinePct) : 0;
                var powerKw = kpi.totalPowerKw || 0;

                // Cập nhật thanh thống kê 1 hàng
                var elTotalTu = document.getElementById('hesStatTotalTu');
                var elPowerKw = document.getElementById('hesStatPowerKw');
                var elOnlineTu = document.getElementById('hesStatOnlineTu');
                var elOnlineSub = document.getElementById('hesStatOnlineSub');
                var elOfflineBadge = document.getElementById('hesStatOfflineBadge');
                var elTotalTuyen = document.getElementById('hesStatTotalTuyen');
                var elActiveTuyen = document.getElementById('hesStatActiveTuyen');
                var elTotalDen = document.getElementById('hesStatTotalDen');
                var elActiveDen = document.getElementById('hesStatActiveDen');

                if (elTotalTu) elTotalTu.textContent = String(total);
                if (elPowerKw) elPowerKw.innerHTML = '(Tải ON: <strong>' + num(powerKw, 2) + ' kW</strong>)';
                if (elOnlineTu) elOnlineTu.textContent = String(online);
                if (elOnlineSub) elOnlineSub.textContent = '/ ' + total + ' tủ';
                if (elOfflineBadge) {
                    if (offline > 0) {
                        elOfflineBadge.style.display = 'inline-flex';
                        elOfflineBadge.textContent = offline + ' Tủ Offline';
                    } else {
                        elOfflineBadge.style.display = 'none';
                    }
                }
                if (elTotalTuyen) elTotalTuyen.textContent = String(totalRoutes);
                if (elActiveTuyen) elActiveTuyen.textContent = '(' + activeRoutes + ' đang bật)';
                if (elTotalDen) elTotalDen.textContent = String(totalLamps);
                if (elActiveDen) elActiveDen.textContent = '(' + activeLamps + ' đang bật)';

                // Fallback nếu còn dùng .hes-stats-grid cũ
                var statCards = document.querySelectorAll('.hes-stats-grid .hes-stat-card');
                if (statCards.length >= 4) {
                    var setStat = function (card, val, sub, foot) {
                        var n = card.querySelector('.hes-stat-number');
                        var s = card.querySelector('.hes-stat-subtext');
                        var f = card.querySelector('.hes-stat-footer');
                        if (n) n.textContent = String(val);
                        if (s && sub !== undefined) s.textContent = sub;
                        if (f && foot !== undefined) f.innerHTML = foot;
                    };
                    setStat(statCards[0], total, 'tủ điều khiển', 'Tổng công suất tải ON: <strong>' + num(powerKw, 2) + ' kW</strong>');
                    setStat(statCards[1], online, '/ ' + total + ' tủ (' + onlinePct + '% Online)', 'Socket TCP Port ' + ((data.systemStatus && data.systemStatus.tcpPort) || 8088));
                    setStat(statCards[2], totalRoutes, 'tuyến (' + activeRoutes + ' đang bật)', 'Toàn bộ tuyến thuộc ' + total + ' tủ');
                    setStat(statCards[3], totalLamps, 'điểm đèn (' + activeLamps + ' đang bật)', 'Tổng số bóng đèn trên các tuyến');
                }

                var circ = 238.76;
                var greenLen = total > 0 ? (circ * online / total) : 0;
                var redLen = circ - greenLen;
                var donutCircles = document.querySelectorAll('.hes-donut-svg circle');
                if (donutCircles.length >= 3) {
                    donutCircles[1].setAttribute('stroke-dasharray', greenLen.toFixed(2) + ' ' + circ);
                    donutCircles[2].setAttribute('stroke-dasharray', redLen.toFixed(2) + ' ' + circ);
                    donutCircles[2].setAttribute('stroke-dashoffset', (-greenLen).toFixed(2));
                }
                var donutNum = document.querySelector('.hes-donut-number');
                if (donutNum) donutNum.textContent = String(total);
                var onCntEl = document.querySelector('.hes-legend-count.online');
                var offCntEl = document.querySelector('.hes-legend-count.offline');
                var pctEls = document.querySelectorAll('.hes-legend-percent');
                if (onCntEl) onCntEl.textContent = online + ' tủ';
                if (offCntEl) offCntEl.textContent = offline + ' tủ';
                if (pctEls.length >= 2) {
                    pctEls[0].textContent = (total > 0 ? ((online * 100 / total).toFixed(1)) : '0.0') + '%';
                    pctEls[1].textContent = (total > 0 ? ((offline * 100 / total).toFixed(1)) : '0.0') + '%';
                }

                var countBadge = document.getElementById('hesCabinetCountBadge');
                var cabs = data.cabinets || [];
                if (countBadge) countBadge.textContent = cabs.length + ' THIẾT BỊ';

                var tbody = document.querySelector('#hesCabinetTable tbody');
                if (tbody) {
                    if (cabs.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94A3B8;padding:24px;">Không tìm thấy tủ chiếu sáng nào phù hợp.</td></tr>';
                    } else {
                        tbody.innerHTML = cabs.map(function (c) {
                            var isOn = Number(c.trangThaiKetNoi) === 1;
                            var powerOn = String(c.trangThaiNguon || '').toUpperCase() === 'ON';
                            var u1 = c.dienApPha1 !== null && c.dienApPha1 !== undefined ? num(c.dienApPha1, 1) + 'V' : '--';
                            var pwrText = powerOn ? ('Đang BẬT (' + u1 + ')') : ('Đang TẮT (' + u1 + ')');
                            var nextAction = powerOn ? 'TAT' : 'BAT';
                            return '<tr>' +
                                '<td class="hes-col-code">' + esc(c.maTu) + '</td>' +
                                '<td><div class="hes-cabinet-name"><span>' + esc(c.tenTu) + '</span></div></td>' +
                                '<td><div class="hes-col-area"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span>' + esc(c.tenKhuVuc || c.diaChi) + '</span></div></td>' +
                                '<td><span class="hes-badge-pill ' + (isOn ? 'hes-badge-online' : 'hes-badge-offline') + '"><span class="hes-status-dot" style="width:6px;height:6px;"></span> ' + (isOn ? 'Online' : 'Offline') + '</span></td>' +
                                '<td><span class="hes-power-pill ' + (powerOn ? 'hes-power-normal' : 'hes-power-lost') + '"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg><span>' + esc(pwrText) + '</span></span></td>' +
                                '<td><div class="hes-last-seen"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>' + esc(fmtDateTime(c.lanKetNoiCuoi)) + '</span></div></td>' +
                                '<td style="text-align:center;"><button type="button" class="hes-action-btn js-ov-toggle" data-tu="' + esc(c.maTu) + '" data-ten="' + esc(c.tenTu) + '" data-next="' + nextAction + '" title="' + (powerOn ? 'Tắt tủ' : 'Bật tủ') + '"><svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg></button></td>' +
                                '</tr>';
                        }).join('');
                    }
                }

                var alertList = document.querySelector('.hes-alerts-list');
                var alertMeta = document.querySelector('.hes-alerts-card .hes-header-meta');
                var alerts = data.recentAlerts || [];
                if (alertMeta) alertMeta.textContent = 'Bảng tin: CanhBao (' + alerts.length + ' sự kiện gần nhất)';
                if (alertList) {
                    if (alerts.length === 0) {
                        alertList.innerHTML = '<div style="padding:18px;text-align:center;color:#94A3B8;">Chưa có cảnh báo phát sinh trong hệ thống.</div>';
                    } else {
                        alertList.innerHTML = alerts.map(function (a) {
                            var isCrit = Number(a.mucDo) >= 3;
                            var target = a.maTu || a.maTuyen || a.maDen || 'Hệ thống';
                            return '<div class="hes-alert-item ' + (isCrit ? 'hes-alert-danger' : 'hes-alert-warning') + '">' +
                                '<div class="hes-alert-content-group">' +
                                '<span class="hes-alert-icon"><svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>' +
                                '<span class="hes-alert-time">[' + esc(fmtTime(a.thoiGianPhatSinh)) + ']</span>' +
                                '<span class="hes-alert-text"><strong>' + esc(target) + ':</strong> ' + esc(a.noiDung) + '</span>' +
                                '</div>' +
                                '<div class="hes-alert-actions">' +
                                '<span class="' + (isCrit ? 'hes-badge-danger' : 'hes-badge-warning') + '">' + (isCrit ? 'NGHIÊM TRỌNG' : 'CẢNH GIÁC') + '</span>' +
                                '<a class="hes-alert-btn-link" href="UcCanhBao&amp;NhatKy.aspx">Chi tiết</a>' +
                                '</div></div>';
                        }).join('');
                    }
                }
            }).catch(function (err) {
                console.error('Overview load error:', err);
            }).finally(function () {
                loading = false;
            });
        }

        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.js-ov-toggle');
            if (!btn) return;
            var maTu = btn.getAttribute('data-tu');
            var tenTu = btn.getAttribute('data-ten');
            var next = btn.getAttribute('data-next');
            if (!confirm('Xác nhận gửi lệnh ' + next + ' xuống ' + tenTu + ' (' + maTu + ')?')) return;
            sendScadaCommand('TU', maTu, next, null).then(function (res) {
                alert('Đã đưa lệnh #' + res.maLenh + ' (' + next + ' -> ' + maTu + ') vào hàng đợi HES!');
                setTimeout(refresh, 700);
            }).catch(function (err) {
                alert('Lỗi gửi lệnh: ' + err.message);
            });
        });

        var debounceTimer = null;
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(refresh, 250);
            });
        }
        if (filterBtn) filterBtn.addEventListener('click', refresh);

        refresh();
        setInterval(refresh, 3000);
    }

    // =========================================================================
    // 2. GIÁM SÁT THÔNG SỐ ĐIỆN (UcGiamSatThongSoDien.aspx)
    // =========================================================================
    function initTelemetryPage() {
        var mode = 'cabinet';
        var selectedCode = '';
        var currentPage = null;
        var isFollowingLatest = true;
        var totalPages = 1;
        var totalRecords = 0;
        var pageSize = 10;
        var intervalMs = 5000;
        var timerId = null;

        function restartTimer() {
            if (timerId) clearInterval(timerId);
            timerId = setInterval(refresh, intervalMs);
        }

        function renderChartSvg(series) {
            var wrap = document.querySelector('.hes-dual-chart-svg-wrap');
            if (!wrap) return;
            var svg = wrap.querySelector('svg');
            if (!svg) return;
            if (!series || series.length === 0) return;

            var ns = 'http://www.w3.org/2000/svg';
            svg.innerHTML = '';
            var padX = 30, padY = 20, w = 940, h = 195;

            for (var g = 0; g <= 4; g++) {
                var y = padY + (h * g / 4);
                var grid = document.createElementNS(ns, 'line');
                grid.setAttribute('x1', String(padX));
                grid.setAttribute('x2', String(padX + w));
                grid.setAttribute('y1', y.toFixed(1));
                grid.setAttribute('y2', y.toFixed(1));
                grid.setAttribute('stroke', '#E2E8F0');
                grid.setAttribute('stroke-dasharray', '4 4');
                svg.appendChild(grid);
            }

            var buildPts = function (vals, minV, maxV) {
                var span = Math.max(1, maxV - minV);
                return vals.map(function (val, idx) {
                    var x = series.length === 1 ? padX + w / 2 : padX + (w * idx / (series.length - 1));
                    var norm = Math.max(0, Math.min(1, (val - minV) / span));
                    var y = padY + h - (norm * h);
                    return x.toFixed(1) + ',' + y.toFixed(1);
                }).join(' ');
            };

            var drawLine = function (vals, minV, maxV, color, dashed) {
                var pl = document.createElementNS(ns, 'polyline');
                pl.setAttribute('fill', 'none');
                pl.setAttribute('stroke', color);
                pl.setAttribute('stroke-width', '2.5');
                if (dashed) pl.setAttribute('stroke-dasharray', '6 4');
                pl.setAttribute('points', buildPts(vals, minV, maxV));
                svg.appendChild(pl);
            };

            if (mode === 'cabinet') {
                var ua = series.map(function (s) { return Number(s.dienApPha1 || 0); });
                var ub = series.map(function (s) { return Number(s.dienApPha2 || 0); });
                var uc = series.map(function (s) { return Number(s.dienApPha3 || 0); });
                var pw = series.map(function (s) { return Number(s.congSuat || 0); });
                var maxP = Math.max(1, Math.max.apply(null, pw) * 1.25);
                drawLine(ua, 180, 260, '#EAB308', false);
                drawLine(ub, 180, 260, '#10B981', false);
                drawLine(uc, 180, 260, '#F97316', false);
                drawLine(pw, 0, maxP, '#2563EB', true);
            } else {
                var du = series.map(function (s) { return Number(s.dienAp || 0); });
                var dt = series.map(function (s) { return Number(s.nhietDoLed || 0); });
                drawLine(du, 180, 260, '#EAB308', false);
                drawLine(dt, 20, 100, '#EF4444', true);
            }
        }

        function renderLampCardsHtml(lampsInRoute) {
            if (!lampsInRoute || lampsInRoute.length === 0) {
                return '<div style="padding:12px;text-align:center;color:#94A3B8;font-size:12px;">Chưa có điểm đèn nào thuộc tuyến này.</div>';
            }
            var cardsHtml = '<div class="hes-lamps-subgrid">';
            lampsInRoute.forEach(function (lamp) {
                var lampCode = lamp.code || lamp.maDen;
                var lampName = lamp.name || lamp.tenDen || lampCode;
                var stVal = Number(lamp.trangThaiHoatDong);
                var isLampOn = stVal === 1;
                var isLampFault = stVal === 3;
                var statusChipClass = isLampOn ? 'hes-lamp-status-on' : (isLampFault ? 'hes-lamp-status-fault' : 'hes-lamp-status-off');
                var statusChipText = isLampOn ? 'BẬT' : (isLampFault ? 'SỰ CỐ' : 'TẮT');
                var bri = (lamp.doSang !== null && lamp.doSang !== undefined) ? lamp.doSang : (isLampOn ? 100 : 0);
                var uVal = num(lamp.dienAp, 1);
                var iVal = num(lamp.dongDien, 3);
                var pVal = num(lamp.congSuatThucTe, 1);
                var tVal = num(lamp.nhietDoLed, 1);
                var lastSeen = lamp.lanDoCuoi ? fmtTime(lamp.lanDoCuoi) : '--';

                cardsHtml += '<div class="hes-lamp-item-card">' +
                    '<div class="hes-lamp-card-top">' +
                        '<span class="hes-lamp-code-badge">' + esc(lampCode) + '</span>' +
                        '<span class="hes-lamp-status-chip ' + statusChipClass + '">' +
                            '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:currentColor;"></span>' +
                            statusChipText +
                        '</span>' +
                    '</div>' +
                    '<div style="font-size:12px;font-weight:600;color:#1E293B;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + esc(lampName) + '">' +
                        esc(lampName) +
                    '</div>' +
                    '<div style="margin-bottom:6px;">' +
                        '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:#64748B;margin-bottom:2px;">' +
                            '<span>Độ sáng</span><strong>' + bri + '%</strong>' +
                        '</div>' +
                        '<div style="height:4px;background:#E2E8F0;border-radius:2px;overflow:hidden;">' +
                            '<div style="height:100%;width:' + bri + '%;background:' + (isLampOn ? '#10B981' : '#94A3B8') + ';border-radius:2px;"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="hes-lamp-metrics-row">' +
                        '<div class="hes-lamp-metric-col"><strong>' + uVal + '</strong><span>Điện áp (V)</span></div>' +
                        '<div class="hes-lamp-metric-col"><strong>' + iVal + '</strong><span>Dòng (A)</span></div>' +
                        '<div class="hes-lamp-metric-col"><strong>' + pVal + '</strong><span>Công suất (W)</span></div>' +
                        '<div class="hes-lamp-metric-col"><strong>' + tVal + '&deg;</strong><span>Nhiệt LED</span></div>' +
                    '</div>' +
                    '<div class="hes-lamp-footer-row">' +
                        '<span>Vị trí: ' + esc(lamp.viTri || 'Đoạn đường') + '</span>' +
                        '<span>' + esc(lastSeen) + '</span>' +
                    '</div>' +
                '</div>';
            });
            cardsHtml += '</div>';
            return cardsHtml;
        }

        function renderCabinetDevices(data) {
            var container = document.getElementById('hesCabinetDevicesContainer');
            if (!container) return;

            if (mode === 'cabinet') {
                var rList = data.routes || [];
                var lList = data.lamps || [];
                if (rList.length === 0 && lList.length === 0) {
                    container.innerHTML = '<div class="hes-cabinet-routes-wrap"><div style="padding:24px;text-align:center;color:#94A3B8;">Tủ ' + esc(selectedCode) + ' hiện chưa có tuyến hoặc điểm đèn nào trong hệ thống.</div></div>';
                    return;
                }

                var html = '<div class="hes-cabinet-routes-wrap">' +
                    '<div class="hes-routes-main-header">' +
                        '<h3 class="hes-routes-main-title">' +
                            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>' +
                            '<span>GIÁM SÁT TOÀN BỘ TUYẾN &amp; ĐIỂM ĐÈN THUỘC TỦ: ' + esc(selectedCode) + '</span>' +
                        '</h3>' +
                        '<span class="hes-routes-main-badge">' + rList.length + ' TUYẾN &bull; ' + lList.length + ' ĐIỂM ĐÈN</span>' +
                    '</div>';

                if (rList.length === 0) {
                    var onCount = lList.filter(function (l) { return Number(l.trangThaiHoatDong) === 1; }).length;
                    html += '<div class="hes-route-group-block">' +
                        '<div class="hes-route-block-header">' +
                            '<div class="hes-route-title">' +
                                '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0284C7" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>' +
                                '<span>Tuyến Trực Tiếp</span>' +
                            '</div>' +
                            '<div class="hes-route-meta">' +
                                '<span class="hes-badge-tag tag-normal">' + onCount + '/' + lList.length + ' Đèn Đang Bật</span>' +
                            '</div>' +
                        '</div>' +
                        renderLampCardsHtml(lList) +
                    '</div>';
                } else {
                    rList.forEach(function (route) {
                        var routeCode = route.code || route.maTuyen;
                        var routeName = route.name || route.tenTuyen || routeCode;
                        var routeViTri = route.viTri || '';
                        var routeMucSang = (route.mucSangHienTai !== null && route.mucSangHienTai !== undefined) ? route.mucSangHienTai : 100;
                        var lampsInRoute = lList.filter(function (l) {
                            return String(l.maTuyen || '').trim().toUpperCase() === String(routeCode).trim().toUpperCase();
                        });
                        var onCount = lampsInRoute.filter(function (l) { return Number(l.trangThaiHoatDong) === 1; }).length;

                        html += '<div class="hes-route-group-block">' +
                            '<div class="hes-route-block-header">' +
                                '<div class="hes-route-title">' +
                                    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0284C7" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>' +
                                    '<span>' + esc(routeName) + ' (' + esc(routeCode) + ')' + (routeViTri ? ' - <span style="font-weight:normal;color:#64748B;">' + esc(routeViTri) + '</span>' : '') + '</span>' +
                                '</div>' +
                                '<div class="hes-route-meta">' +
                                    '<span style="color:#0369A1;font-weight:600;">Độ sáng tuyến: ' + routeMucSang + '%</span>' +
                                    '<span class="hes-badge-tag tag-normal" style="margin-left:8px;">' + onCount + '/' + lampsInRoute.length + ' Đèn Đang Bật</span>' +
                                '</div>' +
                            '</div>' +
                            renderLampCardsHtml(lampsInRoute) +
                        '</div>';
                    });
                }
                html += '</div>';
                container.innerHTML = html;
            } else {
                var lamp = data.sampleLamp;
                if (lamp) {
                    var lampStatusVal = Number(lamp.trangThaiHoatDong);
                    var lampStatusTxt = lampStatusVal === 1 ? 'BẬT' : (lampStatusVal === 2 ? 'TẮT' : (lampStatusVal === 3 ? 'SỰ CỐ' : 'CHƯA RÕ'));
                    var bri = (lamp.doSang !== null && lamp.doSang !== undefined) ? lamp.doSang : 0;
                    var isLampOn = lampStatusVal === 1;

                    container.innerHTML = '<div class="hes-cabinet-routes-wrap">' +
                        '<div class="hes-routes-main-header">' +
                            '<h3 class="hes-routes-main-title">' +
                                '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line></svg>' +
                                '<span>CHI TIẾT ĐIỂM ĐÈN GIÁM SÁT: ' + esc(lamp.code || lamp.maDen) + ' (' + esc(lamp.name || lamp.tenDen) + ')</span>' +
                            '</h3>' +
                            '<span class="hes-routes-main-badge">Tủ: ' + esc(lamp.maTu || '--') + ' &bull; Tuyến: ' + esc(lamp.maTuyen || '--') + '</span>' +
                        '</div>' +
                        '<div class="hes-measure-card" style="margin-top:10px;">' +
                            '<div class="hes-measure-card-header">' +
                                '<span class="hes-card-header-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line></svg></span>' +
                                '<h3 class="hes-measure-title">Thông Số Kỹ Thuật Tức Thời</h3>' +
                                '<span style="margin-left:auto;font-size:11.5px;color:#64748B;">Đo gần nhất: ' + esc(fmtDateTime(lamp.lanDoCuoi)) + '</span>' +
                            '</div>' +
                            '<div class="hes-lamp-tiles-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;margin-top:12px;">' +
                                '<div class="hes-lamp-tile"><div class="hes-tile-label">ĐIỆN ÁP (U)</div><div class="hes-tile-val">' + num(lamp.dienAp, 1) + ' <span class="hes-tile-unit">V</span></div></div>' +
                                '<div class="hes-lamp-tile"><div class="hes-tile-label">DÒNG ĐIỆN (I)</div><div class="hes-tile-val">' + num(lamp.dongDien, 3) + ' <span class="hes-tile-unit">A</span></div></div>' +
                                '<div class="hes-lamp-tile"><div class="hes-tile-label">CÔNG SUẤT (P)</div><div class="hes-tile-val">' + num(lamp.congSuatThucTe, 1) + ' <span class="hes-tile-unit">W</span></div></div>' +
                                '<div class="hes-lamp-tile"><div class="hes-tile-label">NHIỆT ĐỘ LED</div><div class="hes-tile-val">' + num(lamp.nhietDoLed, 1) + ' <span class="hes-tile-unit">&deg;C</span></div></div>' +
                                '<div class="hes-lamp-tile"><div class="hes-tile-label">ĐỘ SÁNG DIMMING</div><div class="hes-tile-val">' + bri + ' <span class="hes-tile-unit">%</span></div><div class="hes-tile-bar-wrap" style="height:4px;background:#E2E8F0;border-radius:2px;margin-top:4px;"><div style="height:100%;width:' + bri + '%;background:' + (isLampOn ? '#10B981' : '#94A3B8') + ';border-radius:2px;"></div></div></div>' +
                                '<div class="hes-lamp-tile"><div class="hes-tile-label">TRẠNG THÁI LED</div><div class="hes-tile-val">' + lampStatusTxt + ' <span class="hes-tile-unit">LED</span></div></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                } else {
                    container.innerHTML = '<div class="hes-cabinet-routes-wrap"><div style="padding:24px;text-align:center;color:#94A3B8;">Chưa có thông số điểm đèn ' + esc(selectedCode) + '.</div></div>';
                }
            }
        }

        function renderTelemetryPagination(curPage, totalP, totalR, pSize) {
            var pagContainer = document.getElementById('telemetryPagination');
            var fInfo = document.getElementById('telemetryFooterInfo');

            var startIdx = totalR > 0 ? ((curPage - 1) * pSize + 1) : 0;
            var endIdx = Math.min(totalR, curPage * pSize);

            if (fInfo) {
                var badge = isFollowingLatest
                    ? ' <span style="display:inline-flex;align-items:center;gap:4px;margin-left:8px;padding:2px 8px;border-radius:10px;background:#DCFCE7;color:#15803D;font-weight:600;font-size:10.5px;"><span style="width:5px;height:5px;border-radius:50%;background:#15803D;"></span>Trang mới nhất</span>'
                    : ' <span style="display:inline-flex;align-items:center;gap:4px;margin-left:8px;padding:2px 8px;border-radius:10px;background:#FEF3C7;color:#B45309;font-weight:600;font-size:10.5px;">Xem lịch sử cũ</span>';
                fInfo.innerHTML = 'Trang ' + curPage + ' / ' + totalP + ' (Bản ghi ' + startIdx + ' - ' + endIdx + ' / ' + totalR + ' bản ghi thật trong dbSmartLight)' + badge;
            }

            if (!pagContainer) return;

            var btnFirstDisabled = curPage <= 1 ? 'disabled style="opacity:0.35;cursor:not-allowed;"' : '';
            var btnPrevDisabled = curPage <= 1 ? 'disabled style="opacity:0.35;cursor:not-allowed;"' : '';
            var btnNextDisabled = curPage >= totalP ? 'disabled style="opacity:0.35;cursor:not-allowed;"' : '';
            var btnLastDisabled = curPage >= totalP ? 'disabled style="opacity:0.35;cursor:not-allowed;"' : '';

            var html = '<button type="button" class="hes-page-nav" data-page="1" ' + btnFirstDisabled + ' title="Trang 1 (Cũ nhất)">|&lt;</button>' +
                '<button type="button" class="hes-page-nav" data-page="' + (curPage - 1) + '" ' + btnPrevDisabled + ' title="Trang trước">&lt;</button>';

            var pages = [];
            if (totalP <= 7) {
                for (var i = 1; i <= totalP; i++) pages.push(i);
            } else {
                if (curPage <= 4) {
                    pages = [1, 2, 3, 4, 5, '...', totalP];
                } else if (curPage >= totalP - 3) {
                    pages = [1, '...', totalP - 4, totalP - 3, totalP - 2, totalP - 1, totalP];
                } else {
                    pages = [1, '...', curPage - 1, curPage, curPage + 1, '...', totalP];
                }
            }

            pages.forEach(function (p) {
                if (p === '...') {
                    html += '<span class="hes-page-dots" style="padding:0 5px;color:#94A3B8;user-select:none;">...</span>';
                } else {
                    var activeClass = p === curPage ? ' active' : '';
                    html += '<button type="button" class="hes-page-num' + activeClass + '" data-page="' + p + '">' + p + '</button>';
                }
            });

            html += '<button type="button" class="hes-page-nav" data-page="' + (curPage + 1) + '" ' + btnNextDisabled + ' title="Trang sau">&gt;</button>' +
                '<button type="button" class="hes-page-nav" data-page="' + totalP + '" ' + btnLastDisabled + ' title="Trang cuối (' + totalP + ' - Mới nhất)">&gt;|</button>';

            pagContainer.innerHTML = html;
        }

        function refresh() {
            var params = {
                mode: mode,
                code: selectedCode,
                pageSize: pageSize
            };
            if (!isFollowingLatest && currentPage !== null) {
                params.page = currentPage;
            }

            apiGet('telemetry', params).then(function (data) {
                if (data.selectedCode) selectedCode = data.selectedCode;
                currentPage = data.page || 1;
                totalPages = data.totalPages || 1;
                totalRecords = data.totalRecords || 0;
                pageSize = data.pageSize || 10;

                if (currentPage >= totalPages) {
                    isFollowingLatest = true;
                }

                var select = document.getElementById('hesSelectDevice');
                var items = mode === 'cabinet' ? (data.cabinets || []) : (data.lamps || []);
                if (select && items.length > 0) {
                    var currentOptSignature = items.map(function (x) { return x.code + ':' + (x.online || ''); }).join('|');
                    if (select.getAttribute('data-sig') !== currentOptSignature) {
                        select.setAttribute('data-sig', currentOptSignature);
                        select.innerHTML = items.map(function (x) {
                            var label = mode === 'cabinet'
                                ? (x.code + ' - ' + x.name + (x.area ? ' (' + x.area + ')' : '') + ' [' + (Number(x.online) === 1 ? 'Online' : 'Offline') + ']')
                                : (x.code + ' - ' + x.name + ' (' + x.maTu + ')');
                            return '<option value="' + esc(x.code) + '">' + esc(label) + '</option>';
                        }).join('');
                    }
                    select.value = selectedCode;
                }

                var latest = data.latest;
                if (mode === 'cabinet' && latest) {
                    var ua = Number(latest.dienApPha1 || 0);
                    var ub = Number(latest.dienApPha2 || 0);
                    var uc = Number(latest.dienApPha3 || 0);

                    document.getElementById('valUa').textContent = num(latest.dienApPha1, 1);
                    document.getElementById('valUb').textContent = num(latest.dienApPha2, 1);
                    document.getElementById('valUc').textContent = num(latest.dienApPha3, 1);
                    document.getElementById('valIa').textContent = num(latest.dongDienPha1, 2);
                    document.getElementById('valIb').textContent = num(latest.dongDienPha2, 2);
                    document.getElementById('valIc').textContent = num(latest.dongDienPha3, 2);
                    document.getElementById('valTotalP').textContent = num(latest.congSuat, 3);
                    document.getElementById('valTotalEnergy').textContent = Number(latest.dienNang || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    var dt = parseDt(latest.thoiGianDo);
                    if (dt) {
                        document.getElementById('hesLiveTime').textContent = fmtTime(dt);
                        document.getElementById('hesLiveDate').textContent = pad2(dt.getDate()) + '/' + pad2(dt.getMonth() + 1) + '/' + dt.getFullYear();
                    }

                    // Tính độ lệch pha thực tế và cập nhật nhãn trạng thái điện áp
                    var uavg = (ua + ub + uc) / 3;
                    var maxDev = Math.max(Math.abs(ua - uavg), Math.abs(ub - uavg), Math.abs(uc - uavg));
                    var unbalancePct = uavg > 0 ? ((maxDev / uavg) * 100) : 0;

                    var elUnbalance = document.getElementById('valPhaseUnbalance');
                    var elUnbalanceTag = document.getElementById('valPhaseUnbalanceTag');
                    if (elUnbalance) elUnbalance.textContent = unbalancePct.toFixed(2) + '%';
                    if (elUnbalanceTag) {
                        if (unbalancePct <= 2.0) {
                            elUnbalanceTag.textContent = '(Tối ưu)';
                            elUnbalanceTag.style.color = '#10B981';
                        } else if (unbalancePct <= 5.0) {
                            elUnbalanceTag.textContent = '(Chấp nhận)';
                            elUnbalanceTag.style.color = '#F59E0B';
                        } else {
                            elUnbalanceTag.textContent = '(LỆCH PHA)';
                            elUnbalanceTag.style.color = '#EF4444';
                        }
                    }

                    function updatePhaseBadge(badgeId, val) {
                        var el = document.getElementById(badgeId);
                        if (!el) return;
                        if (val <= 0) {
                            el.textContent = 'Mất áp';
                            el.style.backgroundColor = '#FEE2E2';
                            el.style.color = '#DC2626';
                        } else if (val < 200) {
                            el.textContent = 'Sụt áp';
                            el.style.backgroundColor = '#FEF3C7';
                            el.style.color = '#D97706';
                        } else if (val > 245) {
                            el.textContent = 'Quá áp';
                            el.style.backgroundColor = '#FEE2E2';
                            el.style.color = '#DC2626';
                        } else {
                            el.textContent = 'Chuẩn';
                            el.style.backgroundColor = '#DCFCE7';
                            el.style.color = '#15803D';
                        }
                    }
                    updatePhaseBadge('badgeUa', ua);
                    updatePhaseBadge('badgeUb', ub);
                    updatePhaseBadge('badgeUc', uc);
                } else if (mode === 'cabinet') {
                    ['valUa', 'valUb', 'valUc', 'valIa', 'valIb', 'valIc', 'valTotalP', 'valTotalEnergy'].forEach(function (id) {
                        var el = document.getElementById(id);
                        if (el) el.textContent = '--';
                    });
                    var elUnbal = document.getElementById('valPhaseUnbalance');
                    if (elUnbal) elUnbal.textContent = '0.00%';
                }

                // Render toàn bộ Tuyến & Điểm đèn của Tủ
                renderCabinetDevices(data);

                // Render Biểu đồ SVG
                renderChartSvg(data.chartSeries || []);

                // Render Bảng nhật ký dữ liệu
                var tbody = document.querySelector('#hesLogTable tbody');
                var thead = document.querySelector('#hesLogTable thead tr');
                var rows = data.history || [];
                if (thead && tbody) {
                    if (mode === 'cabinet') {
                        thead.innerHTML = '<th>MÃ BẢN GHI</th><th>THỜI GIAN ĐO</th><th>UA (V)</th><th>UB (V)</th><th>UC (V)</th><th>IA (A)</th><th>IB (A)</th><th>IC (A)</th><th>P_TỔNG (kW)</th><th>ĐIỆN NĂNG (kWh)</th><th>TÌNH TRẠNG</th>';
                        tbody.innerHTML = rows.length === 0
                            ? '<tr><td colspan="11" style="text-align:center;color:#94A3B8;padding:20px;">Chưa có dữ liệu đo lường tủ ' + esc(selectedCode) + '.</td></tr>'
                            : rows.map(function (r) {
                                var lowV = Number(r.dienApPha1) < 195 || Number(r.dienApPha2) < 195 || Number(r.dienApPha3) < 195;
                                return '<tr>' +
                                    '<td class="hes-col-code">DLT_' + esc(r.maDuLieu) + '</td>' +
                                    '<td>' + esc(fmtDateTime(r.thoiGianDo)) + '</td>' +
                                    '<td style="text-align:center;">' + num(r.dienApPha1, 1) + '</td>' +
                                    '<td style="text-align:center;">' + num(r.dienApPha2, 1) + '</td>' +
                                    '<td style="text-align:center;">' + num(r.dienApPha3, 1) + '</td>' +
                                    '<td style="text-align:center;">' + num(r.dongDienPha1, 2) + '</td>' +
                                    '<td style="text-align:center;">' + num(r.dongDienPha2, 2) + '</td>' +
                                    '<td style="text-align:center;">' + num(r.dongDienPha3, 2) + '</td>' +
                                    '<td style="text-align:right;"><strong style="color:var(--hes-primary);">' + num(r.congSuat, 3) + '</strong></td>' +
                                    '<td style="text-align:right;">' + num(r.dienNang, 3) + '</td>' +
                                    '<td style="text-align:center;"><span class="hes-badge-tag ' + (lowV ? 'tag-peak' : 'tag-normal') + '">&bull; ' + (lowV ? 'Sụt áp' : 'Chuẩn tải') + '</span></td>' +
                                    '</tr>';
                            }).join('');
                    } else {
                        thead.innerHTML = '<th>MÃ BẢN GHI</th><th>ĐIỂM ĐÈN</th><th>THỜI GIAN ĐO</th><th>ĐIỆN ÁP (V)</th><th>DÒNG (A)</th><th>CÔNG SUẤT (W)</th><th>NHIỆT ĐỘ LED</th><th>ĐỘ SÁNG</th><th>TÌNH TRẠNG</th>';
                        tbody.innerHTML = rows.length === 0
                            ? '<tr><td colspan="9" style="text-align:center;color:#94A3B8;padding:20px;">Chưa có dữ liệu đo lường điểm đèn ' + esc(selectedCode) + '.</td></tr>'
                            : rows.map(function (r) {
                                var hot = Number(r.nhietDoLed) >= 75;
                                return '<tr>' +
                                    '<td class="hes-col-code">DLD_' + esc(r.maDuLieu) + '</td>' +
                                    '<td><strong>' + esc(r.maDen) + '</strong></td>' +
                                    '<td>' + esc(fmtDateTime(r.thoiGianDo)) + '</td>' +
                                    '<td style="text-align:center;">' + num(r.dienAp, 1) + '</td>' +
                                    '<td style="text-align:center;">' + num(r.dongDien, 3) + '</td>' +
                                    '<td style="text-align:right;"><strong>' + num(r.congSuatThucTe, 2) + '</strong></td>' +
                                    '<td style="text-align:center;">' + num(r.nhietDoLed, 1) + ' &deg;C</td>' +
                                    '<td style="text-align:center;">' + esc(r.doSang) + '%</td>' +
                                    '<td style="text-align:center;"><span class="hes-badge-tag ' + (hot ? 'tag-peak' : 'tag-normal') + '">&bull; ' + (hot ? 'Quá nhiệt' : 'Bình thường') + '</span></td>' +
                                    '</tr>';
                            }).join('');
                    }
                }

                // Render Phân trang động & Footer Info
                renderTelemetryPagination(currentPage, totalPages, totalRecords, pageSize);

            }).catch(function (err) {
                console.error('Telemetry load error:', err);
            });
        }

        // Gán sự kiện click cho phân trang
        var pagContainer = document.getElementById('telemetryPagination');
        if (pagContainer) {
            pagContainer.addEventListener('click', function (e) {
                var btn = e.target.closest('button[data-page]');
                if (!btn || btn.hasAttribute('disabled')) return;
                var p = parseInt(btn.getAttribute('data-page'), 10);
                if (isNaN(p) || p < 1 || p > totalPages) return;
                currentPage = p;
                if (currentPage >= totalPages) {
                    isFollowingLatest = true;
                } else {
                    isFollowingLatest = false;
                }
                refresh();
            });
        }

        window.toggleMonitorMode = function (newMode) {
            mode = newMode === 'lamp' ? 'lamp' : 'cabinet';
            selectedCode = '';
            currentPage = null;
            isFollowingLatest = true;
            var lblCabinet = document.getElementById('lblModeCabinet');
            var lblLamp = document.getElementById('lblModeLamp');
            if (lblCabinet && lblLamp) {
                lblCabinet.classList.toggle('active', mode === 'cabinet');
                lblLamp.classList.toggle('active', mode === 'lamp');
            }
            refresh();
        };

        window.onDeviceChanged = function (val) {
            selectedCode = val;
            currentPage = null;
            isFollowingLatest = true;
            refresh();
        };

        window.triggerInstantRead = function () {
            var icon = document.getElementById('iconLightning');
            var btnText = document.getElementById('btnInstantText');
            if (icon && btnText) {
                btnText.innerText = 'Đang đọc...';
                icon.style.transform = 'scale(1.2) rotate(15deg)';
                setTimeout(function () {
                    btnText.innerText = 'Lấy dữ liệu tức thời';
                    icon.style.transform = 'none';
                }, 500);
            }
            refresh();
        };

        window.exportDataExcel = function () {
            window.open(buildUrl('exportTelemetry', { mode: mode, code: selectedCode }), '_blank');
        };

        window.toggleAutoInterval = function () {
            var steps = [
                { label: 'Tự động: 5s', ms: 5000 },
                { label: 'Tự động: 10s', ms: 10000 },
                { label: 'Tự động: 30s', ms: 30000 },
                { label: 'Tự động: 60s', ms: 60000 }
            ];
            var curIdx = steps.findIndex(function (s) { return s.ms === intervalMs; });
            var next = steps[(curIdx + 1) % steps.length];
            intervalMs = next.ms;
            var txt = document.getElementById('autoIntervalText');
            if (txt) txt.textContent = next.label;
            restartTimer();
        };

        apiGet('status').then(renderSystemChrome);
        refresh();
        restartTimer();
    }

    // =========================================================================
    // 3. ĐIỀU KHIỂN THIẾT BỊ (UcDieuKhienThietBi.aspx)
    // =========================================================================
    function initControlPage() {
        var selected = { type: 'DEN', code: '', name: '', sub: '', ownerMaTu: '', power: '--', temp: '--', dim: 0, active: false, lastSeen: '--' };
        var treeData = null;
        var expanded = {};
        var fastPollUntil = 0;

        window.currentDimLevel = 70;

        function syncDimSliderVisual(n) {
            var slider = document.getElementById('dimRangeSlider');
            if (slider) slider.style.setProperty('--dim-level', n + '%');
        }

        function setDimControlValue(val) {
            var n = parseInt(val);
            if (isNaN(n)) n = 0;
            if (n < 0) n = 0;
            if (n > 100) n = 100;
            window.currentDimLevel = n;
            var slider = document.getElementById('dimRangeSlider');
            if (slider) {
                slider.value = n;
                syncDimSliderVisual(n);
            }
            var numInput = document.getElementById('dimNumberInput');
            if (numInput) numInput.value = n;
            var label = document.getElementById('btnSendDimLabel');
            if (label) {
                var prefix = selected.type === 'TU' ? 'DIM TOÀN BỘ TỦ' : (selected.type === 'TUYEN' ? 'DIM TOÀN TUYẾN' : 'DIM ĐÈN');
                label.textContent = prefix + ' (' + n + '%)';
            }
        }

        window.onDimSliderInput = function (val) {
            window.currentDimLevel = parseInt(val) || 0;
            var numInput = document.getElementById('dimNumberInput');
            if (numInput) numInput.value = window.currentDimLevel;
            syncDimSliderVisual(window.currentDimLevel);
            var label = document.getElementById('btnSendDimLabel');
            if (label) {
                var prefix = selected.type === 'TU' ? 'DIM TOÀN BỘ TỦ' : (selected.type === 'TUYEN' ? 'DIM TOÀN TUYẾN' : 'DIM ĐÈN');
                label.textContent = prefix + ' (' + window.currentDimLevel + '%)';
            }
        };

        window.onDimNumberChange = function (val) {
            var n = parseInt(val);
            if (isNaN(n)) n = 0;
            if (n < 0) n = 0;
            if (n > 100) n = 100;
            window.currentDimLevel = n;
            var slider = document.getElementById('dimRangeSlider');
            if (slider) slider.value = n;
            var numInput = document.getElementById('dimNumberInput');
            if (numInput) numInput.value = n;
            syncDimSliderVisual(n);
            var label = document.getElementById('btnSendDimLabel');
            if (label) {
                var prefix = selected.type === 'TU' ? 'DIM TOÀN BỘ TỦ' : (selected.type === 'TUYEN' ? 'DIM TOÀN TUYẾN' : 'DIM ĐÈN');
                label.textContent = prefix + ' (' + n + '%)';
            }
        };

        // Khởi tạo visual slider chuẩn ngay khi tải trang
        syncDimSliderVisual(window.currentDimLevel);

        window.closeSafetyModal = function () {
            var modal = document.getElementById('safetyModalBackdrop');
            if (modal) modal.classList.remove('open');
        };

        var searchInput = document.getElementById('treeSearchInput');
        if (searchInput && searchInput.value === 'DD_01') searchInput.value = '';

        function updateDetailCard() {
            var badge = document.getElementById('detailTargetBadge');
            var statusEl = document.getElementById('detailLampStatus');
            var heroLabel = document.getElementById('detailHeroStatusLabel');
            var dimEl = document.getElementById('detailDimVal');
            var attrCode = document.getElementById('attrCode');
            var attrName = document.getElementById('attrName');
            var attrType = document.getElementById('attrType');
            var attrPower = document.getElementById('attrPower');
            var attrTemp = document.getElementById('attrTemp');
            var attrLastSeen = document.getElementById('attrLastSeen');
            var gaugeText = document.getElementById('gaugePercentText');
            var gaugeBar = document.getElementById('gaugeFillBar');

            if (badge) badge.textContent = (selected.type === 'TU' ? 'TỦ: ' : (selected.type === 'TUYEN' ? 'TUYẾN: ' : 'ĐÈN: ')) + selected.code;
            if (attrCode) attrCode.textContent = selected.code;
            if (attrName) attrName.textContent = selected.name;
            if (attrType) attrType.textContent = selected.sub;
            if (attrPower) attrPower.textContent = selected.power;
            if (attrTemp) attrTemp.textContent = selected.temp;
            if (attrLastSeen) attrLastSeen.textContent = selected.lastSeen;
            if (dimEl) dimEl.textContent = selected.dim + ' %';

            var pctVal = selected.active ? (selected.dim > 0 ? selected.dim : 100) : 0;
            if (gaugeText) gaugeText.textContent = pctVal + '%';
            if (gaugeBar) gaugeBar.style.width = pctVal + '%';

            if (heroLabel) {
                heroLabel.textContent = selected.type === 'TU' ? 'TRẠNG THÁI NGUỒN TỦ' : (selected.type === 'TUYEN' ? 'TRẠNG THÁI HOẠT ĐỘNG TUYẾN' : 'TRẠNG THÁI PHÁT QUANG');
            }

            if (statusEl) {
                var typeTxt = selected.type === 'TU' ? 'TỦ' : (selected.type === 'TUYEN' ? 'TUYẾN' : 'ĐÈN');
                statusEl.innerHTML = selected.active
                    ? '<span class="hes-status-dot-inline" style="background-color:#16A34A;"></span><span>ĐANG BẬT (' + typeTxt + ')</span>'
                    : '<span class="hes-status-dot-inline" style="background-color:#EF4444;"></span><span>ĐANG TẮT (' + typeTxt + ')</span>';
                statusEl.style.color = selected.active ? '#15803D' : '#DC2626';
            }

            // Cập nhật nhãn và ngữ cảnh điều khiển theo đối tượng chọn (Tủ / Tuyến / Đèn)
            var btnOn = document.getElementById('btnPowerOnText');
            var btnOff = document.getElementById('btnPowerOffText');
            var btnDim = document.getElementById('btnSendDimLabel');
            var ctrlNotice = document.getElementById('ctrlTargetNotice');
            var targetSummary = document.getElementById('ctrlTargetLabel');
            var dimLvl = (typeof window.currentDimLevel === 'number') ? window.currentDimLevel : 70;

            if (targetSummary) {
                var typeHeader = selected.type === 'TU' ? 'TỦ CHIẾU SÁNG' : (selected.type === 'TUYEN' ? 'TUYẾN CHIẾU SÁNG' : 'ĐIỂM ĐÈN');
                targetSummary.textContent = '[' + typeHeader + '] ' + selected.code + ' – ' + selected.name;
            }

            if (selected.type === 'TU') {
                if (btnOn) btnOn.textContent = 'BẬT TỦ (BẬT TẤT CẢ TUYẾN)';
                if (btnOff) btnOff.textContent = 'TẮT TỦ (CẮT TOÀN BỘ TẢI)';
                if (btnDim) btnDim.textContent = 'DIM TOÀN BỘ TỦ (' + dimLvl + '%)';
                if (ctrlNotice) ctrlNotice.innerHTML = 'Lệnh sẽ phát sóng điều khiển <strong>toàn bộ tuyến và đèn thuộc Tủ ' + esc(selected.code) + '</strong> qua SCADA TCP.';
            } else if (selected.type === 'TUYEN') {
                if (btnOn) btnOn.textContent = 'BẬT TUYẾN ' + esc(selected.code);
                if (btnOff) btnOff.textContent = 'TẮT TUYẾN ' + esc(selected.code);
                if (btnDim) btnDim.textContent = 'DIM TOÀN TUYẾN (' + dimLvl + '%)';
                if (ctrlNotice) ctrlNotice.innerHTML = 'Lệnh sẽ điều khiển <strong>tất cả đèn thuộc Tuyến ' + esc(selected.code) + ' (Tủ ' + esc(selected.ownerMaTu) + ')</strong>.';
            } else {
                if (btnOn) btnOn.textContent = 'BẬT ĐÈN ' + esc(selected.code);
                if (btnOff) btnOff.textContent = 'TẮT ĐÈN ' + esc(selected.code);
                if (btnDim) btnDim.textContent = 'DIM ĐÈN (' + dimLvl + '%)';
                if (ctrlNotice) ctrlNotice.innerHTML = 'Lệnh sẽ điều khiển <strong>điểm đèn đơn lẻ ' + esc(selected.code) + '</strong>.';
            }

            // Kiểm tra trạng thái Online của Tủ quản lý
            var ownerCab = (treeData && treeData.cabinets || []).find(function (c) { return c.maTu === selected.ownerMaTu; });
            var isOwnerOnline = ownerCab && Number(ownerCab.trangThaiKetNoi) === 1;
            var warnBox = document.getElementById('ctrlOfflineWarning');
            if (warnBox) {
                if (ownerCab && !isOwnerOnline) {
                    warnBox.style.display = 'block';
                    warnBox.innerHTML = '⚠️ <strong>Cảnh báo:</strong> Tủ điều khiển <strong>' + esc(selected.ownerMaTu) + '</strong> hiện đang <strong>Mất kết nối TCP (Offline)</strong>. Lệnh SCADA sẽ được lưu vào hàng đợi SQL và tự động phát khi tủ kết nối lại.';
                } else {
                    warnBox.style.display = 'none';
                }
            }

            // Cập nhật chân trang đồng bộ
            var syncEl = document.getElementById('hesBottomSyncTime');
            if (syncEl) syncEl.textContent = 'Đồng bộ: ' + fmtTime(new Date()) + ' Hôm nay';
            var tcpEl = document.getElementById('hesBottomTcpInfo');
            if (tcpEl && treeData && treeData.systemStatus) {
                tcpEl.textContent = 'TCP Server: Port ' + (treeData.systemStatus.tcpPort || 8088) + ' (' + (treeData.systemStatus.activeSessionCount || 0) + ' Tủ Online)';
            }

            window.currentSelectedLamp = selected.code;
        }

        function buildTargetNode(type, code, data) {
            if (type === 'TU') {
                var tu = (data.cabinets || []).find(function (c) { return c.maTu === code; });
                if (!tu) return null;
                var isOn = String(tu.trangThaiNguon || '').toUpperCase() === 'ON';
                var tuLamps = (data.lamps || []).filter(function (l) { return l.maTu === tu.maTu; });
                var tuRoutes = (data.routes || []).filter(function (r) { return r.maTu === tu.maTu; });
                var dimVal = 0;
                var validLamps = tuLamps.filter(function (l) { return l.doSang !== null && l.doSang !== undefined; });
                if (validLamps.length > 0) {
                    dimVal = Math.round(validLamps.reduce(function (sum, l) { return sum + Number(l.doSang); }, 0) / validLamps.length);
                } else if (tuRoutes.length > 0) {
                    var validRoutes = tuRoutes.filter(function (r) { return r.mucSangHienTai !== null && r.mucSangHienTai !== undefined; });
                    if (validRoutes.length > 0) {
                        dimVal = Math.round(validRoutes.reduce(function (sum, r) { return sum + Number(r.mucSangHienTai); }, 0) / validRoutes.length);
                    } else {
                        dimVal = isOn ? 100 : 0;
                    }
                } else {
                    dimVal = isOn ? 100 : 0;
                }
                if (dimVal === 0 && isOn) dimVal = 100;
                return {
                    type: 'TU',
                    code: tu.maTu,
                    name: tu.tenTu,
                    ownerMaTu: tu.maTu,
                    sub: 'Tủ điều khiển (' + (Number(tu.trangThaiKetNoi) === 1 ? 'Online TCP' : 'Offline') + ' | ' + (tu.maThietBi || '') + ')',
                    power: tu.congSuat !== null && tu.congSuat !== undefined ? num(tu.congSuat, 3) + ' kW' : '--',
                    temp: tu.dienApPha1 !== null && tu.dienApPha1 !== undefined ? 'Ua=' + num(tu.dienApPha1, 1) + ' V' : '--',
                    dim: dimVal,
                    active: isOn,
                    lastSeen: fmtDateTime(tu.lanKetNoiCuoi)
                };
            }
            if (type === 'TUYEN') {
                var ty = (data.routes || []).find(function (r) { return r.maTuyen === code; });
                if (!ty) return null;
                var rawTyStatus = Number(ty.trangThaiHoatDong);
                var activeTy = rawTyStatus === 1;
                var tyStatusTxt = rawTyStatus === 1 ? 'HOẠT ĐỘNG' : rawTyStatus === 2 ? 'DỪNG' : rawTyStatus === 3 ? 'SỰ CỐ' : 'CHƯA XÁC ĐỊNH';
                var rLamps = (data.lamps || []).filter(function (l) { return l.maTuyen === ty.maTuyen; });
                var tyDim = 0;
                if (ty.mucSangHienTai !== null && ty.mucSangHienTai !== undefined && Number(ty.mucSangHienTai) > 0) {
                    tyDim = Number(ty.mucSangHienTai);
                } else if (rLamps.length > 0) {
                    var validRLamps = rLamps.filter(function (l) { return l.doSang !== null && l.doSang !== undefined; });
                    if (validRLamps.length > 0) {
                        tyDim = Math.round(validRLamps.reduce(function (sum, l) { return sum + Number(l.doSang); }, 0) / validRLamps.length);
                    } else {
                        tyDim = activeTy ? 100 : 0;
                    }
                } else {
                    tyDim = activeTy ? 100 : 0;
                }
                if (tyDim === 0 && activeTy) tyDim = 100;
                return {
                    type: 'TUYEN',
                    code: ty.maTuyen,
                    name: ty.tenTuyen,
                    ownerMaTu: ty.maTu,
                    sub: 'Tuyến chiếu sáng (Thuộc Tủ ' + ty.maTu + ') - ' + tyStatusTxt,
                    power: '--',
                    temp: ty.viTri || '--',
                    dim: tyDim,
                    active: activeTy,
                    lastSeen: '--'
                };
            }
            var l = (data.lamps || []).find(function (d) { return d.maDen === code; });
            if (!l) return null;
            var rawDenStatus = Number(l.trangThaiHoatDong);
            var activeDen = rawDenStatus === 1;
            var denStatusTxt = rawDenStatus === 1 ? 'BẬT' : rawDenStatus === 2 ? 'TẮT' : rawDenStatus === 3 ? 'SỰ CỐ' : 'CHƯA XÁC ĐỊNH';
            var parentTu = l.maTu || '';
            if (!parentTu) {
                var rOwner = (data.routes || []).find(function (r) { return r.maTuyen === l.maTuyen; });
                if (rOwner) parentTu = rOwner.maTu;
            }
            var dDim = (l.doSang !== null && l.doSang !== undefined) ? Number(l.doSang) : (activeDen ? 100 : 0);
            if (dDim === 0 && activeDen) dDim = 100;
            return {
                type: 'DEN',
                code: l.maDen,
                name: l.tenDen,
                ownerMaTu: parentTu,
                sub: 'Điểm đèn (Tuyến ' + l.maTuyen + (parentTu ? ', Tủ ' + parentTu : '') + ') - ' + denStatusTxt,
                power: l.congSuatThucTe !== null && l.congSuatThucTe !== undefined ? num(l.congSuatThucTe, 1) + ' W' : '--',
                temp: l.nhietDoLed !== null && l.nhietDoLed !== undefined ? num(l.nhietDoLed, 1) + ' °C' : '--',
                dim: dDim,
                active: activeDen,
                lastSeen: fmtDateTime(l.lanDoCuoi)
            };
        }

        function renderTree(data) {
            var root = document.getElementById('deviceTreeRoot');
            if (!root) return;
            var filter = searchInput ? searchInput.value.trim().toUpperCase() : '';
            var cabs = data.cabinets || [];
            var routes = data.routes || [];
            var lamps = data.lamps || [];

            var summaryBadge = document.querySelector('.hes-ctrl-card .hes-badge-primary-top');
            if (summaryBadge) summaryBadge.textContent = cabs.length + ' Tủ / ' + routes.length + ' Tuyến / ' + lamps.length + ' Đèn';

            var html = cabs.map(function (c, idx) {
                var cRoutes = routes.filter(function (r) { return r.maTu === c.maTu; });
                var isExp = expanded[c.maTu] !== undefined ? expanded[c.maTu] : idx === 0;
                var isOnline = Number(c.trangThaiKetNoi) === 1;
                var badgeCls = !isOnline ? 'badge-warn' : (String(c.trangThaiNguon || '').toUpperCase() === 'ON' ? 'badge-on' : 'badge-off');
                var badgeTxt = !isOnline ? 'OFFLINE' : (String(c.trangThaiNguon || '').toUpperCase() === 'ON' ? 'ON' : 'OFF');
                var isSelTu = selected.type === 'TU' && selected.code === c.maTu;

                var routeHtml = cRoutes.map(function (r, rIdx) {
                    var rLamps = lamps.filter(function (l) { return l.maTuyen === r.maTuyen; });
                    var isRExp = expanded[r.maTuyen] !== undefined ? expanded[r.maTuyen] : (idx === 0 && rIdx === 0);
                    var isSelTy = selected.type === 'TUYEN' && selected.code === r.maTuyen;

                    var lampHtml = rLamps.filter(function (l) {
                        if (!filter) return true;
                        return (l.maDen + ' ' + l.tenDen + ' ' + c.maTu + ' ' + r.maTuyen).toUpperCase().indexOf(filter) >= 0;
                    }).map(function (l) {
                        var isSelDen = selected.type === 'DEN' && selected.code === l.maDen;
                        var bri = l.doSang !== null && l.doSang !== undefined ? l.doSang : 0;
                        var dSt = Number(l.trangThaiHoatDong);
                        var dIcon = dSt === 1
                            ? '<span style="color:#10B981;font-weight:bold;">&#9679;</span>'
                            : dSt === 2
                                ? '<span style="color:#94A3B8;">&#9675;</span>'
                                : dSt === 3
                                    ? '<span style="color:#EF4444;font-weight:bold;">&#9650;</span>'
                                    : '<span style="color:#CBD5E1;">&#9676;</span>';
                        return '<div class="hes-tree-row ' + (isSelDen ? 'active' : '') + ' js-tree-select" data-type="DEN" data-code="' + esc(l.maDen) + '">' +
                            '<div class="hes-tree-row-left">' + dIcon + '<span>' + esc(l.maDen + ': ' + l.tenDen + ' (' + bri + '%)') + '</span></div>' +
                            '</div>';
                    }).join('');

                    if (filter && !lampHtml && (r.maTuyen + ' ' + r.tenTuyen).toUpperCase().indexOf(filter) < 0) return '';

                    return '<div class="hes-tree-node">' +
                        '<div class="hes-tree-row ' + (isSelTy ? 'active' : '') + ' js-tree-select" data-type="TUYEN" data-code="' + esc(r.maTuyen) + '">' +
                        '<div class="hes-tree-row-left"><span class="hes-tree-arrow js-tree-toggle ' + (isRExp ? 'expanded' : '') + '" data-expand="' + esc(r.maTuyen) + '">&#9654;</span>' +
                        '<span>Tuyến ' + esc(r.maTuyen + ': ' + r.tenTuyen) + '</span></div>' +
                        '<span style="font-size:11px;color:#64748B;">(' + rLamps.length + ')</span></div>' +
                        '<div class="hes-tree-sub-sub" style="display:' + ((isRExp || filter) ? 'block' : 'none') + ';">' + lampHtml + '</div>' +
                        '</div>';
                }).join('');

                if (filter && !routeHtml && (c.maTu + ' ' + c.tenTu).toUpperCase().indexOf(filter) < 0) return '';

                return '<div class="hes-tree-node">' +
                    '<div class="hes-tree-row ' + (isSelTu ? 'active' : '') + ' js-tree-select" data-type="TU" data-code="' + esc(c.maTu) + '">' +
                    '<div class="hes-tree-row-left"><span class="hes-tree-arrow js-tree-toggle ' + (isExp ? 'expanded' : '') + '" data-expand="' + esc(c.maTu) + '">&#9654;</span>' +
                    '<span>Tủ ' + esc(c.maTu + ': ' + c.tenTu) + '</span></div>' +
                    '<span class="hes-tree-badge ' + badgeCls + '">' + badgeTxt + '</span></div>' +
                    '<div class="hes-tree-sub" style="display:' + ((isExp || filter) ? 'block' : 'none') + ';">' + routeHtml + '</div>' +
                    '</div>';
            }).join('');

            root.innerHTML = html || '<div style="padding:16px;color:#94A3B8;text-align:center;">Không có thiết bị phù hợp.</div>';
        }

        function renderCommandLog(commands) {
            var tbody = document.getElementById('cmdLogTableBody');
            if (!tbody) return;
            var filterSelect = document.getElementById('filterTargetLog');
            var devFilter = filterSelect ? filterSelect.value : 'ALL';
            var rows = (commands || []).filter(function (c) {
                if (!devFilter || devFilter === 'ALL') return true;
                return c.maTu === devFilter || c.maTuyen === devFilter || c.maDen === devFilter || c.ownerMaTu === devFilter;
            });

            if (rows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#94A3B8;padding:20px;">Chưa có lệnh điều khiển nào.</td></tr>';
                return;
            }

            tbody.innerHTML = rows.map(function (c) {
                var target = c.maDen || c.maTuyen || c.maTu;
                var sub = c.ownerMaTu && c.ownerMaTu !== target ? ' (' + c.ownerMaTu + ')' : '';
                var dim = c.mucSang !== null && c.mucSang !== undefined ? c.mucSang + ' %' : (c.hanhDong === 'BAT' ? '100 %' : '0 %');
                return '<tr>' +
                    '<td class="hes-col-code">#' + esc(c.maLenh) + '</td>' +
                    '<td style="font-weight:600;">' + esc(target + sub) + '</td>' +
                    '<td style="text-align:center;">' + actionBadgeHtml(c.hanhDong) + '</td>' +
                    '<td style="text-align:center;"><strong>' + esc(dim) + '</strong></td>' +
                    '<td style="text-align:center;">' + esc(fmtDateTime(c.thoiGianGui || c.thoiGianTao)) + '</td>' +
                    '<td style="text-align:center;">' + statusBadgeHtml(Number(c.trangThaiLenh)) + '</td>' +
                    '<td>' + esc(c.thoiGianPhanHoi ? fmtTime(c.thoiGianPhanHoi) : (c.noiDungPhanHoi || 'Đang xử lý...')) + '</td>' +
                    '<td>' + esc(c.nguoiThucHien || 'Admin') + '</td>' +
                    '</tr>';
            }).join('');
        }

        function refresh() {
            apiGet('devicetree').then(function (data) {
                treeData = data;
                renderSystemChrome(data.systemStatus);

                if (!selected.code) {
                    var defaultCode = (data.lamps && data.lamps[0] && data.lamps[0].maDen) || (data.cabinets && data.cabinets[0] && data.cabinets[0].maTu) || '';
                    var defaultType = (data.lamps && data.lamps[0]) ? 'DEN' : 'TU';
                    var built = buildTargetNode(defaultType, defaultCode, data);
                    if (built) {
                        selected = built;
                        var initDim = (selected.dim !== undefined && selected.dim !== null) ? Number(selected.dim) : (selected.active ? 100 : 0);
                        setDimControlValue(initDim);
                    }
                } else {
                    var refreshedNode = buildTargetNode(selected.type, selected.code, data);
                    if (refreshedNode) selected = refreshedNode;
                }

                var tcpBadge = document.querySelector('.hes-ctrl-badge-tcp span:last-child');
                if (tcpBadge && data.systemStatus) {
                    tcpBadge.textContent = (data.systemStatus.tcpListening ? 'TCP Server Ready' : 'HES Service Offline') + ' (' + (data.systemStatus.activeSessionCount || 0) + ' Tủ Online)';
                }

                var filterSel = document.getElementById('filterTargetLog');
                if (filterSel && !filterSel.getAttribute('data-loaded')) {
                    filterSel.setAttribute('data-loaded', '1');
                    var opts = ['<option value="ALL">Tất cả thiết bị</option>'];
                    (data.cabinets || []).forEach(function (c) { opts.push('<option value="' + esc(c.maTu) + '">Tủ ' + esc(c.maTu) + '</option>'); });
                    (data.routes || []).forEach(function (r) { opts.push('<option value="' + esc(r.maTuyen) + '">Tuyến ' + esc(r.maTuyen) + '</option>'); });
                    (data.lamps || []).forEach(function (l) { opts.push('<option value="' + esc(l.maDen) + '">Đèn ' + esc(l.maDen) + '</option>'); });
                    filterSel.innerHTML = opts.join('');
                }

                renderTree(data);
                updateDetailCard();
                renderCommandLog(data.recentCommands || []);

                var hasPending = (data.recentCommands || []).some(function (c) { return Number(c.trangThaiLenh) === 0 || Number(c.trangThaiLenh) === 1; });
                if (hasPending || Date.now() < fastPollUntil) {
                    setTimeout(refresh, 700);
                }
            }).catch(function (err) {
                console.error('Control load error:', err);
            });
        }

        document.addEventListener('click', function (e) {
            var toggle = e.target.closest('.js-tree-toggle');
            if (toggle) {
                e.stopPropagation();
                var key = toggle.getAttribute('data-expand');
                expanded[key] = !toggle.classList.contains('expanded');
                if (treeData) renderTree(treeData);
                return;
            }
            var row = e.target.closest('.js-tree-select');
            if (row && treeData) {
                var built = buildTargetNode(row.getAttribute('data-type'), row.getAttribute('data-code'), treeData);
                if (built) {
                    selected = built;
                    var targetDim = (selected.dim !== undefined && selected.dim !== null) ? Number(selected.dim) : (selected.active ? 100 : 0);
                    setDimControlValue(targetDim);
                    updateDetailCard();
                    renderTree(treeData);
                }
            }
        });

        window.openSafetyModal = function (action, value) {
            if (!selected.code) {
                alert('Vui lòng chọn một Tủ, Tuyến hoặc Điểm đèn trong cây thiết bị!');
                return;
            }
            window.pendingAction = action;
            if (action === 'DIM') {
                var dimVal = (typeof window.currentDimLevel === 'number') ? window.currentDimLevel : 70;
                window.pendingVal = dimVal + '%';
            } else {
                window.pendingVal = value;
            }
            var modal = document.getElementById('safetyModalBackdrop');
            var targetCodeEl = document.getElementById('modalTargetCode');
            var cmdTypeEl = document.getElementById('modalCmdType');
            var confirmBtn = document.getElementById('btnModalConfirm');
            var modalWarn = document.getElementById('modalOfflineWarning');

            var typeTxt = selected.type === 'TU' ? 'TỦ CHIẾU SÁNG' : (selected.type === 'TUYEN' ? 'TUYẾN CHIẾU SÁNG' : 'ĐIỂM ĐÈN');
            var impactTxt = selected.type === 'TU' ? ' (Tác động đồng loạt toàn bộ các tuyến và điểm đèn thuộc tủ)' :
                            selected.type === 'TUYEN' ? ' (Tác động toàn bộ điểm đèn thuộc tuyến này)' :
                            ' (Tác động điểm đèn đơn lẻ)';

            targetCodeEl.innerHTML = '<strong style="color:var(--hes-primary);">' + esc(selected.code) + '</strong> – ' + esc(selected.name) + '<br><small style="color:#64748B;">' + typeTxt + impactTxt + '</small>';

            var ownerCab = (treeData && treeData.cabinets || []).find(function (c) { return c.maTu === selected.ownerMaTu; });
            var isOwnerOnline = ownerCab && Number(ownerCab.trangThaiKetNoi) === 1;
            if (modalWarn) {
                modalWarn.style.display = (ownerCab && !isOwnerOnline) ? 'block' : 'none';
            }

            if (action === 'BAT') {
                var batLabel = selected.type === 'TU' ? 'BẬT TOÀN BỘ TỦ (100%)' : (selected.type === 'TUYEN' ? 'BẬT TOÀN TUYẾN (100%)' : 'BẬT NGUỒN ĐÈN (100%)');
                cmdTypeEl.textContent = batLabel;
                cmdTypeEl.style.color = '#059669';
                confirmBtn.className = 'hes-btn-modal-confirm success';
                confirmBtn.textContent = 'Xác nhận BẬT';
            } else if (action === 'TAT') {
                var tatLabel = selected.type === 'TU' ? 'TẮT TOÀN BỘ TỦ (CẮT TẢI)' : (selected.type === 'TUYEN' ? 'TẮT TOÀN TUYẾN' : 'CẮT NGUỒN (TẮT ĐÈN)');
                cmdTypeEl.textContent = tatLabel;
                cmdTypeEl.style.color = '#DC2626';
                confirmBtn.className = 'hes-btn-modal-confirm danger';
                confirmBtn.textContent = 'Xác nhận TẮT';
            } else {
                cmdTypeEl.textContent = 'ĐIỀU CHỈNH TIẾT GIẢM (DIM: ' + value + ')';
                cmdTypeEl.style.color = '#2563EB';
                confirmBtn.className = 'hes-btn-modal-confirm';
                confirmBtn.textContent = 'Xác nhận GỬI LỆNH DIM';
            }
            modal.classList.add('open');
        };

        window.executeConfirmedCommand = function () {
            window.closeSafetyModal();
            var dimVal = window.pendingAction === 'DIM' ? Number(window.currentDimLevel || 0) : null;
            sendScadaCommand(selected.type, selected.code, window.pendingAction, dimVal).then(function (res) {
                fastPollUntil = Date.now() + 8000;
                refresh();
                alert('Lệnh SCADA #' + res.maLenh + ' [' + window.pendingAction + ' ' + selected.type + ':' + selected.code + '] đã được ghi nhận vào hàng đợi HES Service và truyền qua socket TCP!');
            }).catch(function (err) {
                alert('Không gửi được lệnh: ' + err.message);
            });
        };

        window.filterDeviceTree = function () { if (treeData) renderTree(treeData); };
        window.filterLogByDevice = function () { if (treeData) renderCommandLog(treeData.recentCommands || []); };
        window.refreshTree = refresh;

        refresh();
        setInterval(refresh, 4000);
    }

    // =========================================================================
    // 4. THEO DÕI LỆNH ĐIỀU KHIỂN (UcTheoDoiLenh.aspx)
    // =========================================================================
    function initTrackingPage() {
        var dateInputs = document.querySelectorAll('.hes-filter-input');
        dateInputs.forEach(function (inp) {
            if (inp.value === '24/10/2024') inp.value = '';
        });

        var selectedCmdId = null;

        function bindDetail(c, rowEl) {
            if (!c) return;
            selectedCmdId = c.maLenh;
            document.querySelectorAll('#trackingCmdTable tbody tr').forEach(function (r) { r.classList.remove('selected-row'); });
            if (rowEl) rowEl.classList.add('selected-row');

            var target = c.maDen || c.maTuyen || c.maTu;
            var owner = c.ownerMaTu || target;
            var st = Number(c.trangThaiLenh);
            var stLabel = st === 2 ? 'Thành công (ACK Hoàn tất)' : (st === 1 ? 'Đã gửi (Chờ ACK)' : (st === 0 ? 'Chờ gửi (Queue)' : (st === 4 ? 'Quá hạn (Timeout)' : 'Thất bại')));
            var latency = '--';
            var ds = parseDt(c.thoiGianGui), dr = parseDt(c.thoiGianPhanHoi);
            if (ds && dr) latency = ((dr.getTime() - ds.getTime()) / 1000).toFixed(2) + 's';

            document.getElementById('selectedRowIndicator').textContent = 'Đang chọn hàng: #' + c.maLenh;
            document.getElementById('detailBoxTitle').innerHTML = 'CHI TIẾT LỆNH: #' + esc(c.maLenh) + ' - ' + esc(target) + ' <span style="font-weight:500;color:#64748B;">[TỦ: ' + esc(owner) + ' | TCP PORT: 8088]</span>';

            var statusEl = document.getElementById('detailProcessStatus');
            statusEl.textContent = stLabel;
            statusEl.className = st === 2 ? 'badge-status-success' : (st === 1 ? 'badge-status-sent' : (st === 0 ? 'badge-status-waiting' : (st === 4 ? 'badge-status-timeout' : 'badge-status-fail')));

            document.getElementById('step1Time').textContent = '[' + fmtDateTime(c.thoiGianTao) + '] Tạo lệnh từ Web / HES';
            document.getElementById('step1Desc').innerHTML = 'Người thực hiện: <strong>' + esc(c.nguoiThucHien) + '</strong>. Lệnh: <span style="color:#2563EB;font-weight:700;">' + esc(c.hanhDong) + (c.mucSang !== null && c.mucSang !== undefined ? ' = ' + c.mucSang + '%' : '') + '</span>.';
            document.getElementById('step2Time').textContent = '[' + (c.thoiGianGui ? fmtDateTime(c.thoiGianGui) : 'Chưa gửi') + '] HES Service đóng gói và phát TCP';
            document.getElementById('step2Station').textContent = owner;
            document.getElementById('step3Time').textContent = '[' + (c.thoiGianPhanHoi ? fmtDateTime(c.thoiGianPhanHoi) : 'Đang chờ') + '] Phản hồi từ tủ hiện trường';
            document.getElementById('step3Station').textContent = owner;
            document.getElementById('step3Lamp').textContent = target;
            document.getElementById('step3Latency').textContent = latency;
            document.getElementById('rawFrameText').textContent = JSON.stringify({ type: 'CMD', maLenh: c.maLenh, target: target, hanhDong: c.hanhDong, mucSang: c.mucSang });
            var noteEl = document.querySelector('#runtimeNoteText span');
            if (noteEl) noteEl.textContent = c.noiDungPhanHoi || 'Lệnh đang được xử lý bởi SmartLight.HesService.';
        }

        function refresh() {
            var dev = document.getElementById('filterDeviceCode') ? document.getElementById('filterDeviceCode').value.trim() : '';
            var act = document.getElementById('filterAction') ? document.getElementById('filterAction').value : '';
            var stRaw = document.getElementById('filterStatus') ? document.getElementById('filterStatus').value : '';
            var stMap = { 'Thành công': '2', 'Đã gửi': '1', 'Chờ gửi': '0', 'Quá hạn': '4', 'Thất bại': '3' };
            var st = stMap[stRaw] !== undefined ? stMap[stRaw] : stRaw;

            apiGet('commands', { device: dev, cmdAction: act, status: st }).then(function (data) {
                renderSystemChrome(data.systemStatus);
                var s = data.stats || {};
                var cards = document.querySelectorAll('.hes-tracking-kpi-card .hes-kpi-big-num');
                if (cards.length >= 4) {
                    var totalAll = Number(s.totalAll || 0);
                    var succRate = totalAll > 0 ? Math.round(Number(s.totalSuccess || 0) * 100 / totalAll) + '%' : '0%';
                    cards[0].textContent = String(s.totalToday || 0);
                    cards[1].textContent = String(s.inFlight || 0);
                    cards[2].textContent = succRate;
                    cards[3].textContent = String(s.totalFailOrTimeout || 0);
                }

                var cmds = data.commands || [];
                var tbody = document.querySelector('#trackingCmdTable tbody');
                var countBadge = document.querySelector('.hes-table-card .hes-badge-count');
                if (countBadge) countBadge.textContent = cmds.length + ' lệnh hiển thị / ' + (s.totalAll || cmds.length) + ' tổng';

                if (tbody) {
                    if (cmds.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:#94A3B8;padding:24px;">Không có lệnh điều khiển nào khớp bộ lọc.</td></tr>';
                    } else {
                        tbody.innerHTML = cmds.map(function (c, i) {
                            var target = c.maDen || c.maTuyen || c.maTu;
                            var dim = c.mucSang !== null && c.mucSang !== undefined ? c.mucSang + ' %' : (c.hanhDong === 'BAT' ? '100 %' : '0 %');
                            var isSel = selectedCmdId ? (c.maLenh === selectedCmdId) : (i === 0);
                            return '<tr class="' + (isSel ? 'selected-row' : '') + ' js-cmd-row" data-idx="' + i + '">' +
                                '<td style="text-align:center;font-weight:600;">' + (i + 1) + '</td>' +
                                '<td class="hes-col-code" style="color:#2563EB;">#' + esc(c.maLenh) + '</td>' +
                                '<td><strong>' + esc(target) + '</strong> <span style="font-size:11px;color:#64748B;">(' + esc(c.ownerMaTu) + ')</span></td>' +
                                '<td style="text-align:center;">' + actionBadgeHtml(c.hanhDong) + '</td>' +
                                '<td style="text-align:center;"><strong>' + esc(dim) + '</strong></td>' +
                                '<td>' + (Number(c.nguonLenh) === 2 ? 'Lịch vận hành' : 'Thủ công (' + esc(c.nguoiThucHien) + ')') + '</td>' +
                                '<td style="text-align:center;">' + statusBadgeHtml(Number(c.trangThaiLenh)) + '</td>' +
                                '<td style="text-align:center;">' + esc(fmtTime(c.thoiGianTao)) + '</td>' +
                                '<td style="text-align:center;">' + esc(c.thoiGianGui ? fmtTime(c.thoiGianGui) : '--') + '</td>' +
                                '<td>' + esc(c.thoiGianPhanHoi ? fmtTime(c.thoiGianPhanHoi) : (c.noiDungPhanHoi || '--')) + '</td>' +
                                '<td style="text-align:center;"><button type="button" class="hes-btn-view-text">Xem</button></td>' +
                                '</tr>';
                        }).join('');

                        tbody.querySelectorAll('.js-cmd-row').forEach(function (tr) {
                            var cmd = cmds[Number(tr.getAttribute('data-idx'))];
                            tr.addEventListener('click', function () { bindDetail(cmd, tr); });
                        });

                        var activeCmd = cmds.find(function (c) { return c.maLenh === selectedCmdId; }) || cmds[0];
                        var activeTr = tbody.querySelector('.selected-row') || tbody.querySelector('tr');
                        if (activeCmd) bindDetail(activeCmd, activeTr);
                    }
                }
            }).catch(function (err) {
                console.error('Tracking load error:', err);
            });
        }

        window.applySearchFilter = refresh;
        window.resetSearchFilter = function () {
            if (document.getElementById('filterDeviceCode')) document.getElementById('filterDeviceCode').value = '';
            if (document.getElementById('filterAction')) document.getElementById('filterAction').value = '';
            if (document.getElementById('filterStatus')) document.getElementById('filterStatus').value = '';
            refresh();
        };

        refresh();
        setInterval(refresh, 2500);
    }

    // =========================================================================
    // 5. GIÁM SÁT TRUYỀN NHẬN DỮ LIỆU (UcTruyenNhanDuLieu.aspx)
    // =========================================================================
    function initCommStreamPage() {
        var dirFilter = 'ALL';
        var selectedSeq = null;

        function inspectFrame(f, data) {
            if (!f) return;
            selectedSeq = f.seq;

            var hexBox = document.getElementById('hexByteContainer');
            if (hexBox) {
                var enc = new TextEncoder();
                var bytes = enc.encode(f.rawJson || '');
                var slice = Array.prototype.slice.call(bytes, 0, 64);
                hexBox.innerHTML = slice.map(function (b) {
                    var hx = b.toString(16).toUpperCase().padStart(2, '0');
                    return '<span class="hes-hex-byte">' + hx + '</span>';
                }).join(' ') + (bytes.length > 64 ? ' <span class="hes-hex-byte payload">...+' + (bytes.length - 64) + 'B</span>' : '');
            }

            var stationInfo = document.querySelector('.hes-parsed-station-name strong');
            if (stationInfo) stationInfo.textContent = (f.maTu || '?') + ' (' + (f.maThietBi || '') + ')';

            try {
                var parsed = JSON.parse(f.rawJson || '{}');
                var phaseVals = document.querySelectorAll('.hes-parsed-3phase-grid .hes-parsed-phase-values');
                var totalPower = document.querySelector('.hes-parsed-total-power strong');
                if (parsed.tu && phaseVals.length >= 3) {
                    phaseVals[0].innerHTML = '<span>U = <strong>' + num(parsed.tu.dienApPha1, 1) + ' V</strong></span><span>I = <strong>' + num(parsed.tu.dongDienPha1, 2) + ' A</strong></span>';
                    phaseVals[1].innerHTML = '<span>U = <strong>' + num(parsed.tu.dienApPha2, 1) + ' V</strong></span><span>I = <strong>' + num(parsed.tu.dongDienPha2, 2) + ' A</strong></span>';
                    phaseVals[2].innerHTML = '<span>U = <strong>' + num(parsed.tu.dienApPha3, 1) + ' V</strong></span><span>I = <strong>' + num(parsed.tu.dongDienPha3, 2) + ' A</strong></span>';
                    if (totalPower) totalPower.textContent = num(parsed.tu.congSuat, 3) + ' kW';
                }
            } catch (e) { }

            var contactorGrid = document.querySelector('.hes-contactor-grid');
            if (contactorGrid && data.contactors && data.contactors.length > 0) {
                contactorGrid.innerHTML = data.contactors.map(function (c, i) {
                    var st = Number(c.trangThaiHoatDong);
                    var on = st === 1;
                    var badgeCls = st === 1 ? 'on' : st === 3 ? 'badge-warn' : 'off';
                    var badgeTxt = st === 1 ? '&bull; ĐÓNG (BẬT)' : st === 2 ? 'MỞ (TẮT)' : st === 3 ? 'SỰ CỐ' : 'CHƯA RÕ';
                    return '<div class="hes-contactor-item">' +
                        '<div class="hes-contactor-info"><div class="hes-contactor-title">K' + (i + 1) + ': ' + esc(c.maTuyen) + '</div><div>' + esc(c.tenTuyen) + ' (' + (c.mucSangHienTai || 0) + '%)</div></div>' +
                        '<span class="hes-contactor-badge ' + badgeCls + '">' + badgeTxt + '</span>' +
                        '</div>';
                }).join('');
            }
        }

        function refresh() {
            if (window.isPaused) return;

            var selCab = document.querySelector('.hes-comm-select');
            var maTu = (selCab && selCab.value && selCab.value !== 'ALL' && selCab.value.indexOf('Tất cả') < 0) ? selCab.value : '';

            apiGet('frames', { limit: 60, direction: dirFilter, maTu: maTu }).then(function (data) {
                renderSystemChrome(data.systemStatus);
                var snap = data.snapshot || {};
                var frames = data.frames || [];

                var statVals = document.querySelectorAll('.hes-comm-buffer-stat-item strong');
                if (statVals.length >= 3) {
                    statVals[0].textContent = (snap.bufferedCount || 0) + ' / ' + (snap.capacity || 4096);
                    statVals[1].textContent = (snap.rxPerSec || 0) + ' pkt/s';
                    statVals[2].textContent = (snap.txPerSec || 0) + ' pkt/s';
                }

                var tbody = document.querySelector('#commStreamTable tbody');
                if (!tbody) return;

                if (!data.hesOnline) {
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#DC2626;padding:24px;">SmartLight.HesService (Port 5088/8088) chưa chạy. Hãy khởi chạy SmartLight.HesService để thu nhận gói tin TCP thật.</td></tr>';
                    return;
                }

                if (frames.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#94A3B8;padding:24px;">HES Service đang lắng nghe Port ' + ((data.systemStatus && data.systemStatus.tcpPort) || 8088) + ' — chưa có frame nào trong RAM Ring-Buffer.</td></tr>';
                    return;
                }

                tbody.innerHTML = frames.map(function (f, i) {
                    var isTx = f.direction === 'TX';
                    var isSel = selectedSeq ? (f.seq === selectedSeq) : (i === 0);
                    return '<tr class="' + (isSel ? 'hes-comm-row-selected' : '') + ' js-frame-row" data-idx="' + i + '">' +
                        '<td><strong>' + esc(f.seq) + '</strong></td>' +
                        '<td style="font-family:Consolas,monospace;color:#334155;">' + esc(f.timestampLocalText) + '</td>' +
                        '<td><span class="hes-station-badge">' + esc(f.maTu || f.maThietBi || '--') + '</span></td>' +
                        '<td><span class="hes-dir-badge ' + (isTx ? 'tx' : 'rx') + '">' + (isTx ? '&uarr; TX' : '&darr; RX') + '</span></td>' +
                        '<td style="font-weight:600;">' + esc(f.frameType) + '</td>' +
                        '<td><span class="hes-status-badge ' + (isTx ? 'sent' : 'valid') + '">' + (isTx ? 'Đã phát' : 'Hợp lệ JSON/UTF-8') + '</span></td>' +
                        '<td style="font-family:Consolas,monospace;font-size:11.5px;">' + esc(f.summary) + '</td>' +
                        '<td style="text-align:center;"><button type="button" class="hes-btn-view-frame ' + (isSel ? 'active' : '') + '">Xem</button></td>' +
                        '</tr>';
                }).join('');

                tbody.querySelectorAll('.js-frame-row').forEach(function (tr) {
                    var f = frames[Number(tr.getAttribute('data-idx'))];
                    tr.addEventListener('click', function () {
                        window.selectFrameRow(tr, f.seq);
                        inspectFrame(f, data);
                    });
                });

                var active = frames.find(function (f) { return f.seq === selectedSeq; }) || frames[0];
                if (active) inspectFrame(active, data);
            }).catch(function (err) {
                console.error('Frames load error:', err);
            });
        }

        document.querySelectorAll('.hes-comm-dir-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.hes-comm-dir-tab').forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                var txt = tab.textContent.toUpperCase();
                dirFilter = txt.indexOf('RX') >= 0 ? 'RX' : (txt.indexOf('TX') >= 0 ? 'TX' : 'ALL');
                refresh();
            });
        });

        document.querySelectorAll('.hes-comm-filter-pill').forEach(function (pill) {
            pill.addEventListener('click', function () {
                var t = pill.textContent.toUpperCase();
                dirFilter = t.indexOf('RX') >= 0 ? 'RX' : (t.indexOf('TX') >= 0 ? 'TX' : 'ALL');
                refresh();
            });
        });

        window.clearStreamLog = function () {
            apiPost('clearFrames', {}).then(refresh);
        };

        refresh();
        setInterval(refresh, 2000);
    }

    // =========================================================================
    // 6. CẢNH BÁO & NHẬT KÝ (UcCanhBao&NhatKy.aspx)
    // =========================================================================
    function initAlertsPage() {
        var selectedAlert = null;

        function bindAlertDetail(a, trEl) {
            if (!a) return;
            selectedAlert = a;
            document.querySelectorAll('#alarmTable tbody tr').forEach(function (r) { r.classList.remove('selected-row'); });
            if (trEl) trEl.classList.add('selected-row');

            var target = a.maDen || a.maTuyen || a.maTu || 'SYS';
            document.getElementById('detailAlarmCode').textContent = 'CB_' + a.maCanhBao;
            document.getElementById('detailNodeId').textContent = 'Node ID: ' + target;
            document.getElementById('valDetailUa').textContent = a.dienApPha1 !== null && a.dienApPha1 !== undefined ? num(a.dienApPha1, 1) + ' V' : '--';
            document.getElementById('valDetailUb').textContent = a.dienApPha2 !== null && a.dienApPha2 !== undefined ? num(a.dienApPha2, 1) + ' V' : '--';
            document.getElementById('valDetailUc').textContent = a.dienApPha3 !== null && a.dienApPha3 !== undefined ? num(a.dienApPha3, 1) + ' V' : '--';
            document.getElementById('valDetailIn').textContent = a.nhietDoLed !== null && a.nhietDoLed !== undefined ? ('LED ' + num(a.nhietDoLed, 1) + ' °C') : '--';
            document.getElementById('detailSubstationName').textContent = a.tenTu || a.targetDisplay || 'Hệ thống';
            document.getElementById('detailGps').textContent = (a.viDo && a.kinhDo) ? (a.viDo + ', ' + a.kinhDo) : (a.diaChiTu || '--');
            document.getElementById('detailSim').textContent = a.ghiChuXuLy || 'Chưa có ghi chú xử lý';
            document.getElementById('detailEta').textContent = a.thoiGianXuLy ? fmtDateTime(a.thoiGianXuLy) : 'Đang mở';
        }

        function refresh() {
            var lvlSel = document.getElementById('filterAlertLevel');
            var devInp = document.getElementById('filterAlertDevice');
            var stSel = document.getElementById('filterAlertStatus');
            var lvlRaw = lvlSel ? lvlSel.value : '';
            var stRaw = stSel ? stSel.value : '';
            var lvlMap = { 'NGHIÊM TRỌNG': '3', 'CẢNH BÁO': '2', 'THÔNG TIN': '1' };
            var stMap = { 'Chờ xác nhận': '0', 'Đang xử lý': '1', 'Đã xác nhận': '2', 'Hoàn tất': '2' };
            var mucDo = lvlMap[lvlRaw] !== undefined ? lvlMap[lvlRaw] : lvlRaw;
            var kw = devInp ? devInp.value.trim() : '';
            var st = stMap[stRaw] !== undefined ? stMap[stRaw] : stRaw;

            apiGet('alerts', { mucDo: mucDo, keyword: kw, trangThai: st }).then(function (data) {
                renderSystemChrome(data.systemStatus);
                var k = data.kpi || {};
                var cards = document.querySelectorAll('.hes-tracking-kpi-card .hes-kpi-big-num');
                if (cards.length >= 4) {
                    cards[0].textContent = pad2(k.criticalOpen || 0);
                    cards[1].textContent = pad2(k.warnInfoOpen || 0);
                    cards[2].textContent = String(k.resolvedToday || 0);
                    cards[3].textContent = String(k.totalAll || 0);
                }

                var alerts = data.alerts || [];
                var tbody = document.querySelector('#alarmTable tbody');
                if (tbody) {
                    if (alerts.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#94A3B8;padding:24px;">Không có cảnh báo nào phù hợp.</td></tr>';
                    } else {
                        tbody.innerHTML = alerts.map(function (a, i) {
                            var target = a.maDen || a.maTuyen || a.maTu || 'Hệ thống';
                            var sevHtml = Number(a.mucDo) === 3 ? '<span class="badge-sev-crit">NGHIÊM TRỌNG</span>'
                                : (Number(a.mucDo) === 2 ? '<span class="badge-sev-warn">&bull; CẢNH BÁO</span>' : '<span class="badge-sev-info">&bull; THÔNG TIN</span>');
                            var stNum = Number(a.trangThaiXuLy);
                            var stHtml = stNum === 2
                                ? '<span class="badge-status-ack" style="background-color:#ECFDF5;color:#059669;">Đã xử lý</span>'
                                : (stNum === 1 ? '<span class="badge-status-sent">Đang xử lý</span>' : '<span class="badge-status-waiting">Chờ xác nhận</span>');
                            var isSel = selectedAlert ? (a.maCanhBao === selectedAlert.maCanhBao) : (i === 0);
                            return '<tr class="' + (isSel ? 'selected-row' : '') + ' js-alert-row" data-idx="' + i + '">' +
                                '<td style="text-align:center;font-weight:600;">' + (i + 1) + '</td>' +
                                '<td><div style="font-weight:700;">' + esc(fmtTime(a.thoiGianPhatSinh)) + '</div><div style="font-size:11px;color:#64748B;">' + esc(fmtDateTime(a.thoiGianPhatSinh).split(' ')[1] || '') + '</div></td>' +
                                '<td class="hes-col-code" style="color:#2563EB;">CB_' + esc(a.maCanhBao) + '</td>' +
                                '<td style="text-align:center;">' + sevHtml + '</td>' +
                                '<td><div style="font-weight:700;">' + esc(target) + '</div><div style="font-size:11px;color:#64748B;">' + esc(a.targetDisplay) + '</div></td>' +
                                '<td><div style="font-weight:600;">' + esc(a.noiDung) + '</div><div style="font-size:11.5px;color:#64748B;">' + esc(a.ghiChuXuLy) + '</div></td>' +
                                '<td style="text-align:center;">' + stHtml + '</td>' +
                                '<td style="text-align:center;"><button type="button" class="hes-btn-action-fix js-ack-one" data-id="' + esc(a.maCanhBao) + '">Xác nhận</button></td>' +
                                '</tr>';
                        }).join('');

                        tbody.querySelectorAll('.js-alert-row').forEach(function (tr) {
                            var a = alerts[Number(tr.getAttribute('data-idx'))];
                            tr.addEventListener('click', function () { bindAlertDetail(a, tr); });
                        });

                        tbody.querySelectorAll('.js-ack-one').forEach(function (btn) {
                            btn.addEventListener('click', function (e) {
                                e.stopPropagation();
                                apiPost('ackalert', { maCanhBao: Number(btn.getAttribute('data-id')), trangThaiXuLy: 2, ghiChu: 'Đã xác nhận xử lý từ HES SCADA' })
                                    .then(refresh);
                            });
                        });

                        var active = alerts.find(function (a) { return selectedAlert && a.maCanhBao === selectedAlert.maCanhBao; }) || alerts[0];
                        var activeTr = tbody.querySelector('.selected-row') || tbody.querySelector('tr');
                        if (active) bindAlertDetail(active, activeTr);
                    }
                }
            }).catch(function (err) {
                console.error('Alerts load error:', err);
            });
        }

        window.applyAlertFilter = refresh;
        window.refreshAlerts = refresh;
        window.ackAllAlerts = function () {
            if (!confirm('Xác nhận tất cả cảnh báo đang mở?')) return;
            apiPost('ackallalerts', {}).then(function (r) {
                alert('Đã xác nhận ' + (r.updated || 0) + ' cảnh báo!');
                refresh();
            });
        };
        window.saveAuditLog = function () {
            if (!selectedAlert) {
                alert('Vui lòng chọn 1 cảnh báo trong bảng trước!');
                return;
            }
            var note = document.getElementById('auditNotes') ? document.getElementById('auditNotes').value.trim() : '';
            if (!note) {
                alert('Vui lòng nhập ghi chú xử lý!');
                return;
            }
            apiPost('ackalert', { maCanhBao: selectedAlert.maCanhBao, trangThaiXuLy: 2, ghiChu: note }).then(function () {
                document.getElementById('auditNotes').value = '';
                alert('Đã lưu biên bản xử lý vào dbo.CanhBao!');
                refresh();
            });
        };

        refresh();
        setInterval(refresh, 4000);
    }

    // =========================================================================
    // 7. CẤU HÌNH HỆ THỐNG HES (UcCauHinhHes.aspx)
    // =========================================================================
    function initConfigPage() {
        function findTcpFieldInput(keywords) {
            var fields = document.querySelectorAll('#tabPanel_0 .hes-cfg-field, #tabPanel_0 .hes-cfg-form-group');
            for (var i = 0; i < fields.length; i++) {
                var lbl = fields[i].querySelector('label');
                var inp = fields[i].querySelector('input');
                if (!lbl || !inp) continue;
                var txt = lbl.textContent.toLowerCase();
                if (keywords.some(function (k) { return txt.indexOf(k) >= 0; })) {
                    return inp;
                }
            }
            return null;
        }

        function refresh() {
            apiGet('config').then(function (data) {
                renderSystemChrome(data.systemStatus);
                var sql = data.sql || {};
                var srv = document.getElementById('txtSqlServerName');
                var db = document.getElementById('txtSqlDatabaseName');
                var mode = document.getElementById('ddlSqlAuthMode');
                if (srv && sql.server) srv.value = sql.server;
                if (db && sql.database) db.value = sql.database;
                if (mode) mode.value = sql.integratedSecurity ? 'windows' : 'sql';

                var cfg = data.hesConfig;
                var sys = data.systemStatus || {};
                if (cfg) {
                    var portInp = findTcpFieldInput(['port', 'cổng']);
                    var pollInp = findTcpFieldInput(['poll', 'quét']);
                    var timeoutInp = findTcpFieldInput(['timeout', 'chờ phản hồi']);
                    var hbInp = findTcpFieldInput(['heartbeat', 'keep']);
                    if (portInp) portInp.value = cfg.tcpPort;
                    if (pollInp) pollInp.value = cfg.commandPollIntervalMs;
                    if (timeoutInp) timeoutInp.value = cfg.commandTimeoutSeconds;
                    if (hbInp) hbInp.value = cfg.heartbeatTimeoutSeconds;
                }

                var badgeReady = document.querySelector('.hes-cfg-badge-active');
                if (badgeReady) {
                    badgeReady.textContent = sys.tcpListening
                        ? ('READY (PORT ' + sys.tcpPort + ' | ' + (sys.activeSessionCount || 0) + ' RTU)')
                        : 'HES SERVICE OFFLINE';
                }
            }).catch(function (err) {
                console.error('Config load error:', err);
            });
        }

        window.testSqlConnection = function () {
            apiGet('status').then(function (sys) {
                var banner = document.getElementById('sqlConnectionSuccessBanner');
                if (banner) {
                    banner.style.display = 'flex';
                    banner.innerHTML = sys.sqlConnected
                        ? '<span style="width:8px;height:8px;border-radius:50%;background:#16A34A;"></span><span>Kết nối SQL Server thành công (' + sys.sqlLatencyMs + 'ms) - ' + esc(sys.databaseName) + '</span>'
                        : '<span style="width:8px;height:8px;border-radius:50%;background:#DC2626;"></span><span>Lỗi SQL: ' + esc(sys.sqlError) + '</span>';
                }
            });
        };

        window.testAllConnections = function () {
            apiGet('status').then(function (sys) {
                alert(
                    'Trạng thái thật:\n' +
                    '- SQL Server (' + (sys.databaseName || 'dbSmartLight') + '): ' + (sys.sqlConnected ? 'CONNECTED (' + sys.sqlLatencyMs + 'ms)' : 'ERROR') + '\n' +
                    '- SmartLight.HesService HTTP: ' + (sys.hesRunning ? 'RUNNING' : 'OFFLINE') + '\n' +
                    '- TCP Listener Port ' + (sys.tcpPort || 8088) + ': ' + (sys.tcpListening ? 'LISTENING' : 'STOPPED') + '\n' +
                    '- Tủ đang kết nối TCP: ' + (sys.activeSessionCount || 0)
                );
            });
        };

        window.saveConfiguration = function () {
            var body = {};
            var portInp = findTcpFieldInput(['port', 'cổng']);
            var pollInp = findTcpFieldInput(['poll', 'quét']);
            var timeoutInp = findTcpFieldInput(['timeout', 'chờ phản hồi']);
            var hbInp = findTcpFieldInput(['heartbeat', 'keep']);
            if (portInp && parseInt(portInp.value, 10)) body.tcpPort = parseInt(portInp.value, 10);
            if (pollInp && parseInt(pollInp.value, 10)) body.commandPollIntervalMs = parseInt(pollInp.value, 10);
            if (timeoutInp && parseInt(timeoutInp.value, 10)) body.commandTimeoutSeconds = parseInt(timeoutInp.value, 10);
            if (hbInp && parseInt(hbInp.value, 10)) body.heartbeatTimeoutSeconds = parseInt(hbInp.value, 10);

            apiPost('saveconfig', body).then(function (res) {
                if (res.saved) {
                    alert('Đã cập nhật cấu hình trực tiếp xuống SmartLight.HesService!');
                } else {
                    alert('SmartLight.HesService chưa chạy nên chưa nhận cấu hình runtime.');
                }
                refresh();
            }).catch(function (err) {
                alert('Lỗi lưu cấu hình: ' + err.message);
            });
        };

        window.restartHesCore = function () {
            if (!confirm('Khởi động lại TCP Listener trên SmartLight.HesService?')) return;
            apiPost('saveconfig', { restartTcpListener: true }).then(function () {
                alert('Đã khởi động lại TCP Listener của SmartLight.HesService!');
                refresh();
            });
        };

        refresh();
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (document.getElementById('hesCabinetTable')) {
            initOverviewPage();
        } else if (document.getElementById('hesLogTable')) {
            initTelemetryPage();
        } else if (document.getElementById('deviceTreeRoot')) {
            initControlPage();
        } else if (document.getElementById('trackingCmdTable')) {
            initTrackingPage();
        } else if (document.getElementById('commStreamTable')) {
            initCommStreamPage();
        } else if (document.getElementById('alarmTable')) {
            initAlertsPage();
        } else if (document.getElementById('tabPanel_1')) {
            initConfigPage();
        } else {
            apiGet('status').then(renderSystemChrome);
        }
    });
})();
