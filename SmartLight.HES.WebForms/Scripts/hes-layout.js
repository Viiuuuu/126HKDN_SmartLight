/**
 * SmartLight HES SCADA Edition - Layout & Dashboard Interactions
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initSidebarToggle();
        initLiveClock();
        initRefreshButton();
        initCabinetTableSearch();
        initActionButtons();
    });

    /**
     * Sidebar collapse/expand toggle
     */
    function initSidebarToggle() {
        var sidebar = document.getElementById('hesSidebar');
        var toggleBtn = document.getElementById('hesSidebarToggle');

        if (!sidebar || !toggleBtn) return;

        // Restore saved preference
        var isCollapsed = localStorage.getItem('hes_sidebar_collapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }

        toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('hes_sidebar_collapsed', sidebar.classList.contains('collapsed'));
        });
    }

    /**
     * Realtime Digital Clock for Topbar (UTC+7 Vietnam)
     */
    function initLiveClock() {
        var clockEl = document.getElementById('hesClockDisplay');

        function updateClock() {
            if (!clockEl) return;
            var now = new Date();
            // Format HH:mm:ss
            var hours = String(now.getHours()).padStart(2, '0');
            var minutes = String(now.getMinutes()).padStart(2, '0');
            var seconds = String(now.getSeconds()).padStart(2, '0');

            clockEl.textContent = 'UTC+7 ' + hours + ':' + minutes + ':' + seconds;
        }

        updateClock();
        setInterval(updateClock, 1000);
    }

    /**
     * Dashboard Refresh Button
     */
    function initRefreshButton() {
        var btnRefresh = document.getElementById('hesBtnRefresh');
        var syncBadgeText = document.getElementById('hesSyncBadgeText');

        if (!btnRefresh) return;

        btnRefresh.addEventListener('click', function (e) {
            e.preventDefault();

            // Rotate icon animation
            var icon = btnRefresh.querySelector('svg');
            if (icon) {
                icon.style.transition = 'transform 0.6s ease';
                icon.style.transform = 'rotate(360deg)';
                setTimeout(function () {
                    icon.style.transform = 'none';
                }, 600);
            }

            // Update timestamp
            if (syncBadgeText) {
                var now = new Date();
                var hours = String(now.getHours()).padStart(2, '0');
                var minutes = String(now.getMinutes()).padStart(2, '0');
                var seconds = String(now.getSeconds()).padStart(2, '0');
                syncBadgeText.textContent = 'Đồng bộ: ' + hours + ':' + minutes + ':' + seconds + ' Hôm nay';
            }
        });
    }

    /**
     * Live search in Cabinet List table
     */
    function initCabinetTableSearch() {
        var searchInput = document.getElementById('hesCabinetSearch');
        var table = document.getElementById('hesCabinetTable');
        var countBadge = document.getElementById('hesCabinetCountBadge');

        if (!searchInput || !table) return;

        searchInput.addEventListener('input', function () {
            var filter = searchInput.value.toLowerCase().trim();
            var rows = table.querySelectorAll('tbody tr');
            var visibleCount = 0;

            rows.forEach(function (row) {
                var text = row.textContent.toLowerCase();
                if (text.indexOf(filter) > -1) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            if (countBadge) {
                countBadge.textContent = visibleCount + ' THIẾT BỊ';
            }
        });
    }

    /**
     * Action Buttons (Power toggle & retry)
     */
    function initActionButtons() {
        document.querySelectorAll('.hes-action-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var cabinetName = this.getAttribute('data-cabinet') || 'Tủ điều khiển';
                var actionType = this.getAttribute('data-action') || 'lệnh';

                // Subtle animation
                this.style.transform = 'scale(0.88)';
                var self = this;
                setTimeout(function () {
                    self.style.transform = 'none';
                }, 150);

                console.log('[HES SCADA GUI] Tác vụ ' + actionType + ' cho: ' + cabinetName);
            });
        });
    }
})();

