/**
 * SmartLight Municipal IoT - Map Monitoring Script (map.js)
 * Nguồn dữ liệu: API /KhuVuc, /TuChieuSang, /TuyenChieuSang, /DiemDen,
 *                  /DuLieuGiamSatTu, /DuLieuGiamSatDen
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Elements Cache
  // -------------------------------------------------------------------------
  const topbarLiveClock = document.getElementById('topbarLiveClock');
  const topSearchInput = document.getElementById('topSearchInput');
  const btnNotifications = document.getElementById('btnNotifications');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');
  const btnUserProfile = document.getElementById('btnUserProfile');
  const userDropdown = document.getElementById('userDropdown');
  const linkLogout = document.getElementById('linkLogout');

  // Mobile Sidebar
  const sidebar = document.getElementById('sidebar');
  const btnToggleMobileSidebar = document.getElementById('btnToggleMobileSidebar');
  const btnCloseSidebar = document.getElementById('btnCloseSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  // Filter Panel
  const filterPanel = document.getElementById('filterPanel');
  const btnToggleFilter = document.getElementById('btnToggleFilter');
  const collapseText = document.getElementById('collapseText');
  const btnApplyFilter = document.getElementById('btnApplyFilter');
  const btnResetFilter = document.getElementById('btnResetFilter');
  const btnSelectAllStatus = document.getElementById('btnSelectAllStatus');
  const filterSearchInput = document.getElementById('filterSearchInput');

  // Detail Card
  const deviceDetailCard = document.getElementById('deviceDetailCard');
  const btnCloseDetailCard = document.getElementById('btnCloseDetailCard');
  const detailId = document.getElementById('detailId');
  const detailType = document.getElementById('detailType');
  const detailStatusBadge = document.getElementById('detailStatusBadge');
  const detailStatusText = document.getElementById('detailStatusText');
  const detailPower = document.getElementById('detailPower');
  const detailDimming = document.getElementById('detailDimming');
  const metaCode = document.getElementById('metaCode');
  const metaDistrict = document.getElementById('metaDistrict');
  const metaRoute = document.getElementById('metaRoute');
  const metaLocation = document.getElementById('metaLocation');
  const metaUpdatedAt = document.getElementById('metaUpdatedAt');
  const metaVoltage = document.getElementById('metaVoltage');
  const detailAvatarIcon = document.getElementById('detailAvatarIcon');
  const btnInspectDetail = document.getElementById('btnInspectDetail');
  const btnQuickControl = document.getElementById('btnQuickControl');
  const btnDispatchPatrol = document.getElementById('btnDispatchPatrol');

  // Map Controls
  const mapBgLayer = document.getElementById('mapBgLayer');
  const deviceLayer = document.getElementById('mapDeviceLayer');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnRecenterGps = document.getElementById('btnRecenterGps');
  const btnToggleLayers = document.getElementById('btnToggleLayers');
  const btnSwitchSatellite = document.getElementById('btnSwitchSatellite');
  const toastContainer = document.getElementById('toastContainer');

  // Telemetry chips
  const valLightsActive = document.getElementById('valLightsActive');
  const valLightsWarning = document.getElementById('valLightsWarning');
  const valLightsLost = document.getElementById('valLightsLost');
  const countCabinet = document.getElementById('countCabinet');
  const countLamp = document.getElementById('countLamp');
  const countStatusNormal = document.getElementById('countStatusNormal');
  const countStatusWarning = document.getElementById('countStatusWarning');
  const countStatusLost = document.getElementById('countStatusLost');

  let leafletMap = null;
  let leafletMarkerLayer = null;
  let leafletRouteLayer = null;
  let roadTileLayer = null;
  let satelliteTileLayer = null;
  let leafletCanvasRenderer = null;
  let isSatellite = false;
  let roadTileSourceIndex = 0;
  let roadTileErrorCount = 0;
  let roadTileLoadCount = 0;
  let roadTileFallbackTimer = null;

  const roadTileSources = [
    {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri'
    },
    {
      url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
      subdomains: 'abc',
      attribution: '&copy; OpenStreetMap contributors, tiles &copy; <a href="https://www.openstreetmap.fr">OpenStreetMap France</a>'
    }
  ];

  function activateRoadTileSource(index) {
    if (!leafletMap) return;
    if (index >= roadTileSources.length) {
      showToast('Không kết nối được máy chủ nền bản đồ. Hãy kiểm tra mạng Internet.', 'warning');
      return;
    }
    if (index <= roadTileSourceIndex && roadTileLayer) return;

    if (roadTileFallbackTimer) {
      window.clearTimeout(roadTileFallbackTimer);
      roadTileFallbackTimer = null;
    }
    if (roadTileLayer) roadTileLayer.remove();

    roadTileSourceIndex = index;
    roadTileErrorCount = 0;
    roadTileLoadCount = 0;
    const source = roadTileSources[index];
    roadTileLayer = window.L.tileLayer(source.url, {
      maxZoom: 19,
      updateWhenIdle: true,
      keepBuffer: 2,
      subdomains: source.subdomains || 'abc',
      attribution: source.attribution
    });

    roadTileLayer.on('tileload', () => {
      roadTileLoadCount += 1;
      if (roadTileFallbackTimer) {
        window.clearTimeout(roadTileFallbackTimer);
        roadTileFallbackTimer = null;
      }
    });
    roadTileLayer.on('tileerror', () => {
      roadTileErrorCount += 1;
      if (roadTileErrorCount >= 4) activateRoadTileSource(index + 1);
    });
    roadTileLayer.addTo(leafletMap);

    // Some network failures never produce a tileerror event. Move to the next
    // source when the initial viewport has not received even one tile in time.
    roadTileFallbackTimer = window.setTimeout(() => {
      if (roadTileLoadCount === 0) activateRoadTileSource(index + 1);
    }, 8000);
  }

  function synchronizeMapViewport(force = false) {
    if (!leafletMap || !mapBgLayer) return;

    const host = mapBgLayer.parentElement;
    const hostWidth = host?.clientWidth || 0;
    const hostHeight = host?.clientHeight || 0;
    if (hostWidth > 1 && hostHeight > 1) {
      // Percentage dimensions on an absolutely positioned child can briefly
      // resolve to a stale width during browser fullscreen transitions.
      // Use the measured stage dimensions so Leaflet and its tile grid always
      // have the same viewport as the visible map frame.
      mapBgLayer.style.width = `${hostWidth}px`;
      mapBgLayer.style.height = `${hostHeight}px`;
    }

    const { width, height } = mapBgLayer.getBoundingClientRect();
    if (width < 2 || height < 2) return;

    const mapSize = leafletMap.getSize();
    const sizeChanged = Math.abs(mapSize.x - Math.round(width)) > 1
      || Math.abs(mapSize.y - Math.round(height)) > 1;

    if (!force && !sizeChanged) return;

    const center = leafletMap.getCenter();
    const zoom = leafletMap.getZoom();
    leafletMap.invalidateSize({ animate: false, pan: false, debounceMoveend: true });

    // A hard view reset makes Leaflet rebuild its tile grid. This is needed
    // when the page enters or exits browser fullscreen while the map is open:
    // a plain invalidateSize can retain a grid laid out for the old width.
    leafletMap.setView(center, zoom, { animate: false, reset: true });
  }

  function initializeLeafletMap() {
    if (!window.L || !mapBgLayer) return;

    leafletMap = window.L.map(mapBgLayer, {
      center: [16.0544, 108.2022],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
      updateWhenIdle: true,
      keepBuffer: 2
    });

    activateRoadTileSource(0);

    satelliteTileLayer = window.L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
      }
    );

    leafletMarkerLayer = window.L.layerGroup().addTo(leafletMap);
    leafletRouteLayer = window.L.layerGroup().addTo(leafletMap);
    leafletCanvasRenderer = window.L.canvas({ padding: 0.5 });

    [0, 120, 500, 1200].forEach(delay => {
      window.setTimeout(() => synchronizeMapViewport(true), delay);
    });

    // The map sits in a responsive dashboard whose width can change after
    // Leaflet's first layout (sidebar/content sizing and filter panel changes).
    // If Leaflet keeps that initial, narrower size, tiles stop at a vertical
    // edge while markers and routes continue across the full map container.
    if ('ResizeObserver' in window) {
      let resizeFrame = 0;
      const mapResizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          synchronizeMapViewport();
        });
      });
      mapResizeObserver.observe(mapBgLayer);
    }

    leafletMap.on('contextmenu', async event => {
      const coordinates = `${event.latlng.lat.toFixed(7)}, ${event.latlng.lng.toFixed(7)}`;
      try {
        await navigator.clipboard.writeText(coordinates);
        showToast(`Đã sao chép tọa độ GPS: ${coordinates}`, 'success');
      } catch (_) {
        showToast(`Tọa độ GPS: ${coordinates}`, 'info');
      }
    });

    window.addEventListener('resize', () => {
      synchronizeMapViewport(true);
    });

    document.addEventListener('fullscreenchange', () => {
      window.setTimeout(() => synchronizeMapViewport(true), 0);
    });
  }

  initializeLeafletMap();

  // -------------------------------------------------------------------------
  // 2. Real-time Clock Sync
  // -------------------------------------------------------------------------
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  function updateClocks() {
    const now = new Date();
    const dayName = daysOfWeek[now.getDay()];
    const date = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    if (topbarLiveClock) {
      topbarLiveClock.textContent = `${dayName}, ${date}/${month}/${year}`;
    }
  }

  updateClocks();
  setInterval(updateClocks, 1000);

  // User session restore
  try {
    const sessionData = sessionStorage.getItem('smartlight_user_session');
    if (sessionData) {
      const user = JSON.parse(sessionData);
      const userNameEl = document.querySelector('.user-name');
      if (userNameEl && user.username) {
        userNameEl.textContent = user.username.charAt(0).toUpperCase() + user.username.slice(1);
      }
    }
  } catch (e) {
    console.warn(e);
  }

  // -------------------------------------------------------------------------
  // 3. Device Database & Map Rendering
  // -------------------------------------------------------------------------
  const deviceDatabase = {};
  let mapNodes = [];
  let selectedDevice = null;

  // Bounding box Đà Nẵng dùng để chiếu toạ độ GPS lên nền bản đồ
  const DN_BOUNDS = {
    minLat: 16.0000,
    maxLat: 16.1400,
    minLng: 108.1800,
    maxLng: 108.3200
  };

  function apiField(record, camelName, pascalName) {
    return record?.[camelName] ?? record?.[pascalName];
  }

  function readCoordinate(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  /**
   * Chiếu toạ độ GPS lên vị trí phần trăm trong khung bản đồ.
   * Trả về null nếu toạ độ không hợp lệ hoặc nằm ngoài Đà Nẵng.
   */
  function projectToMap(lat, lng) {
    if (lat === null || lng === null) return null;
    if (lat < DN_BOUNDS.minLat || lat > DN_BOUNDS.maxLat) return null;
    if (lng < DN_BOUNDS.minLng || lng > DN_BOUNDS.maxLng) return null;

    const x = ((lng - DN_BOUNDS.minLng) / (DN_BOUNDS.maxLng - DN_BOUNDS.minLng)) * 100;
    const y = (1 - (lat - DN_BOUNDS.minLat) / (DN_BOUNDS.maxLat - DN_BOUNDS.minLat)) * 100;

    return {
      left: Math.min(92, Math.max(8, x)),
      top: Math.min(88, Math.max(10, y))
    };
  }

  function buildCabinetNode(device, position) {
    const node = document.createElement('div');
    node.className = 'map-node';
    node.dataset.id = device.id;
    node.title = `Tủ chiếu sáng ${device.id}`;
    if (position) {
      node.classList.add('has-gps');
      node.style.left = `${position.left}%`;
      node.style.top = `${position.top}%`;
    }

    const warning = device.statusClass === 'status-warning';
    const lost = device.statusClass === 'status-lost';
    const pinClass = warning || lost ? 'warning' : 'active';

    node.innerHTML = `
      ${!warning && !lost ? '<div class="node-ripple"></div>' : ''}
      <div class="cabinet-pin ${pinClass}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 7v5l3 3"></path>
          <path d="M9 12h6"></path>
        </svg>
      </div>
      <span class="node-hover-label">${device.id} · ${device.district}</span>
    `;
    return node;
  }

  function buildLampNode(device, position) {
    const node = document.createElement('div');
    node.className = 'map-node';
    node.dataset.id = device.id;
    node.title = `Điểm đèn ${device.id}`;
    if (position) {
      node.classList.add('has-gps');
      node.style.left = `${position.left}%`;
      node.style.top = `${position.top}%`;
    }

    const pinClass = device.statusClass === 'status-active'
      ? 'state-on'
      : device.statusClass === 'status-warning'
        ? 'state-warning'
        : 'state-lost';

    node.innerHTML = `
      <div class="lamp-pin ${pinClass}"></div>
      <span class="node-hover-label">${device.id} · ${device.dim}</span>
    `;
    return node;
  }

  function renderMapNodes(devices) {
    if (!deviceLayer) return;

    deviceLayer.replaceChildren();
    mapNodes = [];

    if (leafletMap && leafletMarkerLayer) {
      leafletMarkerLayer.clearLayers();

      const coordinateMarkers = [];
      devices.forEach((device) => {
        let lat = device.lat;
        let lng = device.lng;

        if (lat === null || lng === null) {
          return;
        }

        const isCabinet = device.iconType === 'cabinet';
        const statusClass = device.statusClass === 'status-warning'
          ? 'warning'
          : device.statusClass === 'status-lost'
            ? 'lost'
            : 'active';
        const markerIcon = window.L.divIcon({
          className: 'smartlight-leaflet-icon',
          html: isCabinet
            ? `<span class="device-map-icon cabinet-map-icon status-${statusClass}" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="3.5" width="14" height="17" rx="2"></rect><path d="M8 7h8M8 10h8M8 13h5M12 16.5h.01"></path></svg></span>`
            : `<span class="device-map-icon lamp-map-icon status-${statusClass}" aria-hidden="true"><svg viewBox="0 0 24 28"><path d="M12 1.5a9 9 0 0 0-5.8 15.9c1.1.9 1.8 2 2.1 3.1h7.4c.3-1.1 1-2.2 2.1-3.1A9 9 0 0 0 12 1.5Z"></path><path d="M9 23h6M10 26h4M9.5 13.5l2.5-4 2.5 4M12 10v6"></path></svg></span>`,
          iconSize: isCabinet ? [28, 28] : [26, 32],
          iconAnchor: isCabinet ? [14, 14] : [13, 30],
          tooltipAnchor: [0, isCabinet ? -12 : -26]
        });
        const marker = window.L.marker([lat, lng], {
          icon: markerIcon,
          title: `${isCabinet ? 'Tủ chiếu sáng' : 'Điểm đèn'} ${device.id}`,
          keyboard: true
        });

        marker.bindTooltip(`<strong>${device.id}</strong><br>${device.location}`, { direction: 'top' });
        marker.deviceId = device.id;

        marker.on('click', () => {
          selectedDevice = device;
          displayDeviceDetail(device.id);
          showToast(`Đã chọn thiết bị: ${device.id}`, 'success');
        });

        leafletMarkerLayer.addLayer(marker);
        mapNodes.push(marker);
        coordinateMarkers.push([lat, lng]);
      });

      if (coordinateMarkers.length) {
        if (coordinateMarkers.length === 1) {
          leafletMap.setView(coordinateMarkers[0], 16);
        } else {
          leafletMap.fitBounds(window.L.latLngBounds(coordinateMarkers), {
            padding: [70, 70],
            maxZoom: 16
          });
        }
        requestAnimationFrame(() => {
          leafletMap.invalidateSize({ pan: false });
        });
      }
      return;
    }

    if (!devices.length) {
      const empty = document.createElement('div');
      empty.className = 'map-node-empty';
      empty.textContent = 'Chưa có thiết bị nào trong Backend để hiển thị trên bản đồ.';
      deviceLayer.appendChild(empty);
      return;
    }

    // Vị trí dự phòng khi thiết bị không có toạ độ GPS
    const fallbackPositions = [
      { left: 36, top: 24 }, { left: 54, top: 32 }, { left: 48, top: 46 },
      { left: 60, top: 52 }, { left: 42, top: 62 }, { left: 66, top: 66 },
      { left: 30, top: 42 }, { left: 58, top: 72 }, { left: 70, top: 44 },
      { left: 24, top: 70 }, { left: 46, top: 18 }, { left: 64, top: 22 }
    ];

    devices.forEach((device, index) => {
      const position = projectToMap(device.lat, device.lng) || fallbackPositions[index % fallbackPositions.length];
      const node = device.iconType === 'cabinet'
        ? buildCabinetNode(device, position)
        : buildLampNode(device, position);
      deviceLayer.appendChild(node);
      mapNodes.push(node);
    });
  }

  function routeGeoJsonLatLngs(route) {
    const rawGeometry = apiField(route, 'hinhDangGeoJson', 'HinhDangGeoJson');
    if (!rawGeometry) return [];

    try {
      const geometry = typeof rawGeometry === 'string' ? JSON.parse(rawGeometry) : rawGeometry;
      if (geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates)) return [];

      const points = geometry.coordinates.map(coordinate => {
        if (!Array.isArray(coordinate) || coordinate.length < 2) return null;
        const lng = readCoordinate(coordinate[0]);
        const lat = readCoordinate(coordinate[1]);
        if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
        return [lat, lng];
      });

      return points.length >= 2 && points.every(Boolean) ? points : [];
    } catch (error) {
      console.warn('GeoJSON không hợp lệ cho tuyến chiếu sáng.', error);
      return [];
    }
  }

  function renderMapRoutes(routes) {
    if (!leafletMap || !leafletRouteLayer) return 0;

    leafletRouteLayer.clearLayers();
    let renderedRoutes = 0;

    routes.forEach(route => {
      const routeId = String(apiField(route, 'maTuyen', 'MaTuyen') || '').trim();
      const points = routeGeoJsonLatLngs(route);
      if (!points.length) return;

      const routeStatus = Number(apiField(route, 'trangThaiHoatDong', 'TrangThaiHoatDong'));
      const routeColor = routeStatus === 3 ? '#dc2626'
        : routeStatus === 1 ? '#2563eb'
          : '#64748b';

      window.L.polyline(points, {
        renderer: leafletCanvasRenderer,
        color: routeColor,
        weight: 4,
        opacity: 0.85,
        dashArray: routeStatus === 1 ? null : '8, 8'
      }).bindTooltip(String(apiField(route, 'tenTuyen', 'TenTuyen') || routeId), {
        sticky: true
      }).addTo(leafletRouteLayer);
      renderedRoutes++;
    });

    return renderedRoutes;
  }

  function bindNodeEvents() {
    mapNodes.forEach(node => {
      if (leafletMap && typeof node.on === 'function') return;
      node.addEventListener('click', event => {
        event.stopPropagation();
        const nodeId = node.getAttribute('data-id');

        mapNodes.forEach(item => item.classList.remove('selected'));
        node.classList.add('selected');

        displayDeviceDetail(nodeId);
        showToast(`Đã chọn thiết bị: ${nodeId}`, 'success');
      });
    });
  }

  function displayDeviceDetail(id) {
    const data = deviceDatabase[id];
    if (!data) return;
    selectedDevice = data;

    deviceDetailCard?.classList.remove('hidden');

    if (detailId) detailId.textContent = data.id;
    if (metaCode) metaCode.textContent = data.code;
    if (detailType) detailType.textContent = data.type;
    if (metaDistrict) metaDistrict.textContent = data.district;
    if (metaRoute) metaRoute.textContent = data.route;
    if (metaLocation) metaLocation.textContent = data.location;
    if (detailPower) detailPower.textContent = data.power;
    if (detailDimming) detailDimming.textContent = data.dim;
    if (metaUpdatedAt) metaUpdatedAt.textContent = data.updated || '—';
    if (metaVoltage) metaVoltage.textContent = data.voltage ? `${data.voltage} VAC` : '—';

    if (detailStatusText) detailStatusText.textContent = data.status;
    if (detailStatusBadge) {
      detailStatusBadge.className = `badge-device-status ${data.statusClass}`;
    }

    if (detailAvatarIcon) {
      if (data.iconType === 'cabinet') {
        detailAvatarIcon.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 7v5l3 3"></path>
            <path d="M9 12h6"></path>
          </svg>
        `;
      } else {
        detailAvatarIcon.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7zM9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1H9v1z"/>
          </svg>
        `;
      }
    }
  }

  if (btnCloseDetailCard) {
    btnCloseDetailCard.addEventListener('click', () => {
      deviceDetailCard?.classList.add('hidden');
    });
  }

  // -------------------------------------------------------------------------
  // 4. Floating Filter Panel Controls
  // -------------------------------------------------------------------------
  if (btnToggleFilter) {
    btnToggleFilter.addEventListener('click', () => {
      if (!filterPanel) return;
      const isCollapsed = filterPanel.classList.toggle('collapsed');
      if (collapseText) {
        collapseText.textContent = isCollapsed ? 'Mở' : 'Thu gọn';
      }
      btnToggleFilter.setAttribute('aria-expanded', String(!isCollapsed));
      btnToggleFilter.setAttribute('aria-label', isCollapsed ? 'Mở bộ lọc' : 'Thu gọn bộ lọc');
      btnToggleFilter.title = isCollapsed ? 'Mở bộ lọc' : 'Thu gọn bộ lọc';
    });
  }

  if (btnApplyFilter) {
    btnApplyFilter.addEventListener('click', () => {
      applyMapFilters();
    });
  }

  function applyMapFilters(notify = true) {
    const district = document.getElementById('selectDistrict')?.value || 'all';
    const selectedDistrict = district === 'all' ? '' : district;
    const showCabinets = document.getElementById('chkCabinet')?.checked !== false;
    const showLamps = document.getElementById('chkLamp')?.checked !== false;
    const showNormal = document.getElementById('chkStatusNormal')?.checked !== false;
    const showWarning = document.getElementById('chkStatusWarning')?.checked !== false;
    const showLost = document.getElementById('chkStatusLost')?.checked !== false;
    const keyword = filterSearchInput?.value.trim().toLocaleLowerCase('vi') || '';
    let visibleCount = 0;

    mapNodes.forEach(node => {
      const nodeId = node.deviceId || node.dataset?.id;
      const data = deviceDatabase[nodeId];
      if (!data) {
        if (leafletMarkerLayer && leafletMap && typeof node.remove === 'function') {
          leafletMarkerLayer.removeLayer(node);
        }
        else node.style.display = 'none';
        return;
      }

      const matchesDistrict = !selectedDistrict
        || data.areaId === selectedDistrict
        || data.district.toLocaleLowerCase('vi').includes(selectedDistrict.toLocaleLowerCase('vi'));
      const matchesType = data.iconType === 'cabinet' ? showCabinets : showLamps;
      const matchesStatus = data.statusClass === 'status-active'
        ? showNormal
        : data.statusClass === 'status-warning'
          ? showWarning
          : showLost;
      const searchableText = `${data.id} ${data.code} ${data.type} ${data.district} ${data.route} ${data.location}`.toLocaleLowerCase('vi');
      const matchesSearch = !keyword || searchableText.includes(keyword);
      const visible = matchesDistrict && matchesType && matchesStatus && matchesSearch;

      if (leafletMarkerLayer && leafletMap && typeof node.remove === 'function') {
        if (visible) {
          if (!leafletMarkerLayer.hasLayer(node)) leafletMarkerLayer.addLayer(node);
        } else {
          leafletMarkerLayer.removeLayer(node);
        }
      } else {
        node.style.display = visible ? '' : 'none';
      }
      if (visible) visibleCount++;
      if (!visible && (node.classList?.contains('selected') || selectedDevice?.id === nodeId)) {
        node.classList?.remove('selected');
        selectedDevice = null;
        deviceDetailCard?.classList.add('hidden');
      }
    });

    if (notify) showToast(`Đang hiển thị ${visibleCount} thiết bị theo bộ lọc.`, 'success');
  }

  if (btnResetFilter) {
    btnResetFilter.addEventListener('click', () => {
      if (filterSearchInput) filterSearchInput.value = '';
      filterPanel?.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
      });
      const districtSelect = document.getElementById('selectDistrict');
      if (districtSelect) districtSelect.value = 'all';
      applyMapFilters(false);
      showToast('Đã đặt lại bộ lọc bản đồ.', 'success');
    });
  }

  if (btnSelectAllStatus) {
    btnSelectAllStatus.addEventListener('click', () => {
      const statusBoxes = [
        document.getElementById('chkStatusNormal'),
        document.getElementById('chkStatusWarning'),
        document.getElementById('chkStatusLost')
      ];
      statusBoxes.forEach(b => { if (b) b.checked = true; });
      applyMapFilters(false);
      showToast('Đã chọn tất cả trạng thái.', 'success');
    });
  }

  filterSearchInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') applyMapFilters();
  });
  applyMapFilters(false);

  function formatMetric(value, unit = '', digits = 1) {
    if (value === null || value === undefined || value === '') return '—';
    const number = Number(value);
    if (!Number.isFinite(number)) return '—';
    return `${number.toFixed(digits)}${unit}`;
  }

  function averagePhase(values) {
    const numbers = values.map(Number).filter(Number.isFinite);
    if (!numbers.length) return null;
    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  }

  async function enrichCabinetMetrics(device) {
    try {
      const readings = await window.api.get('/DuLieuGiamSatTu', { maTu: device.id, limit: 1 });
      const latest = Array.isArray(readings) ? readings[0] : null;
      if (!latest) return;

      const voltage = averagePhase([
        apiField(latest, 'dienApPha1', 'DienApPha1'),
        apiField(latest, 'dienApPha2', 'DienApPha2'),
        apiField(latest, 'dienApPha3', 'DienApPha3')
      ]);
      const current = averagePhase([
        apiField(latest, 'dongDienPha1', 'DongDienPha1'),
        apiField(latest, 'dongDienPha2', 'DongDienPha2'),
        apiField(latest, 'dongDienPha3', 'DongDienPha3')
      ]);
      const power = apiField(latest, 'congSuat', 'CongSuat');
      const energy = apiField(latest, 'dienNang', 'DienNang');

      device.voltage = voltage;
      device.current = current;
      device.powerKw = power;
      device.energyKwh = energy;
      device.power = power !== null && power !== undefined
        ? `${formatMetric(power, ' kW', 2)} · U ${formatMetric(voltage, ' V', 0)} · I ${formatMetric(current, ' A', 1)}`
        : `U ${formatMetric(voltage, ' V', 0)} · I ${formatMetric(current, ' A', 1)}`;
      device.dim = energy !== null && energy !== undefined
        ? `Điện năng ${formatMetric(energy, ' kWh', 1)}`
        : device.dim;
      if (Number(power) > 0 && device.statusClass !== 'status-lost') {
        device.status = 'Hoạt động';
        device.statusClass = 'status-active';
      } else if (Number(power) === 0 && device.statusClass === 'status-active') {
        device.status = 'Đang tắt';
        device.dim = 'Tắt tải (P = 0)';
      }
    } catch (error) {
      console.warn(`Không tải được giám sát tủ ${device.id}.`, error);
    }
  }

  async function enrichLampMetrics(device) {
    try {
      const readings = await window.api.get('/DuLieuGiamSatDen', { maDen: device.id, limit: 1 });
      const latest = Array.isArray(readings) ? readings[0] : null;
      if (!latest) return;

      const voltage = apiField(latest, 'dienAp', 'DienAp');
      const current = apiField(latest, 'dongDien', 'DongDien');
      const power = apiField(latest, 'congSuatThucTe', 'CongSuatThucTe');
      const dim = apiField(latest, 'doSang', 'DoSang');

      device.voltage = voltage;
      device.current = current;
      device.power = power !== null && power !== undefined
        ? `${formatMetric(power, ' W', 1)} · U ${formatMetric(voltage, ' V', 0)} · I ${formatMetric(current, ' A', 2)}`
        : `U ${formatMetric(voltage, ' V', 0)} · I ${formatMetric(current, ' A', 2)}`;
      if (dim !== null && dim !== undefined) {
        device.dim = `${dim}%`;
      }
    } catch (error) {
      console.warn(`Không tải được giám sát đèn ${device.id}.`, error);
    }
  }

  function populateDistrictFilter(areas) {
    const select = document.getElementById('selectDistrict');
    if (!select) return;

    const requestedArea = new URLSearchParams(window.location.search).get('area');
    const requestedDistrict = new URLSearchParams(window.location.search).get('district');

    const options = areas.map(area => ({
      id: String(apiField(area, 'maKhuVuc', 'MaKhuVuc') || '').trim(),
      name: String(apiField(area, 'tenPhuongXa', 'TenPhuongXa') || '').trim()
    })).filter(option => option.id && option.name);

    select.replaceChildren();
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Tất cả khu vực (Đà Nẵng)';
    select.appendChild(allOption);

    options.forEach(option => {
      const element = document.createElement('option');
      element.value = option.id;
      element.textContent = option.name;
      select.appendChild(element);
    });

    if (requestedArea && options.some(option => option.id === requestedArea)) {
      select.value = requestedArea;
    } else if (requestedDistrict && options.some(option => option.id === requestedDistrict)) {
      select.value = requestedDistrict;
    } else {
      select.value = 'all';
    }
  }

  function updateTelemetryCounts(devices) {
    const cabinets = devices.filter(device => device.iconType === 'cabinet');
    const lamps = devices.filter(device => device.iconType === 'lamp');
    const active = devices.filter(device => device.statusClass === 'status-active').length;
    const warning = devices.filter(device => device.statusClass === 'status-warning').length;
    const lost = devices.filter(device => device.statusClass === 'status-lost').length;

    if (valLightsActive) valLightsActive.textContent = active.toLocaleString('vi-VN');
    if (valLightsWarning) valLightsWarning.textContent = warning.toLocaleString('vi-VN');
    if (valLightsLost) valLightsLost.textContent = lost.toLocaleString('vi-VN');
    if (countCabinet) countCabinet.textContent = cabinets.length.toLocaleString('vi-VN');
    if (countLamp) countLamp.textContent = lamps.length.toLocaleString('vi-VN');
    if (countStatusNormal) countStatusNormal.textContent = active.toLocaleString('vi-VN');
    if (countStatusWarning) countStatusWarning.textContent = warning.toLocaleString('vi-VN');
    if (countStatusLost) countStatusLost.textContent = lost.toLocaleString('vi-VN');
  }

  async function loadMapInfrastructure() {
    if (!window.api) {
      showToast('Chưa nạp API client; bản đồ đang ở chế độ mô phỏng.', 'warning');
      return;
    }

    try {
      const [areas, cabinets, routes, lamps] = await Promise.all([
        window.api.get('/KhuVuc'),
        window.api.get('/TuChieuSang'),
        window.api.get('/TuyenChieuSang'),
        window.api.get('/DiemDen')
      ]);
      if (![areas, cabinets, routes, lamps].every(Array.isArray)) {
        throw new TypeError('API hạ tầng phải trả về danh sách thiết bị.');
      }
      if (!cabinets.length && !lamps.length) {
        showToast('Backend chưa có tủ/điểm đèn; bản đồ đang trống.', 'warning');
        renderMapNodes([]);
        updateTelemetryCounts([]);
        return;
      }

      populateDistrictFilter(areas);

      const areaNames = new Map(areas.map(item => [
        String(apiField(item, 'maKhuVuc', 'MaKhuVuc') || '').trim(),
        String(apiField(item, 'tenPhuongXa', 'TenPhuongXa') || '').trim()
      ]));
      const routeById = new Map(routes.map(item => [
        String(apiField(item, 'maTuyen', 'MaTuyen') || '').trim(),
        item
      ]));

      const devices = [];

      cabinets.forEach(item => {
        const id = String(apiField(item, 'maTu', 'MaTu') || '').trim();
        const connected = Boolean(apiField(item, 'trangThaiKetNoi', 'TrangThaiKetNoi'));
        const areaId = String(apiField(item, 'maKhuVuc', 'MaKhuVuc') || '').trim();
        const lastSeen = apiField(item, 'lanKetNoiCuoi', 'LanKetNoiCuoi');

        devices.push({
          id,
          code: id,
          type: 'Tủ điều khiển trung tâm',
          district: areaNames.get(areaId) || 'Chưa xác định',
          areaId,
          route: String(apiField(item, 'tenTu', 'TenTu') || ''),
          location: String(apiField(item, 'diaChi', 'DiaChi') || 'Chưa có vị trí'),
          status: connected ? 'Hoạt động' : 'Mất kết nối',
          statusClass: connected ? 'status-active' : 'status-lost',
          power: 'Chưa có dữ liệu giám sát',
          dim: connected ? 'Đã kết nối' : 'Mất kết nối',
          iconType: 'cabinet',
          updated: lastSeen ? new Date(lastSeen).toLocaleString('vi-VN') : '—',
          lat: readCoordinate(apiField(item, 'viDo', 'ViDo')),
          lng: readCoordinate(apiField(item, 'kinhDo', 'KinhDo'))
        });
      });

      const cabinetById = new Map(cabinets.map(item => [
        String(apiField(item, 'maTu', 'MaTu') || '').trim(),
        item
      ]));

      lamps.forEach(item => {
        const id = String(apiField(item, 'maDen', 'MaDen') || '').trim();
        const routeId = String(apiField(item, 'maTuyen', 'MaTuyen') || '').trim();
        const route = routeById.get(routeId);
        const cabinet = cabinetById.get(String(apiField(route, 'maTu', 'MaTu') || '').trim());
        const areaId = String(apiField(cabinet, 'maKhuVuc', 'MaKhuVuc') || '').trim();
        const lampSt = Number(apiField(item, 'trangThaiHoatDong', 'TrangThaiHoatDong'));
        const isActive = lampSt === 1;
        const dim = apiField(item, 'doSang', 'DoSang');
        const power = apiField(item, 'congSuat', 'CongSuat');
        const lastSeen = apiField(item, 'lanDoCuoi', 'LanDoCuoi');

        devices.push({
          id,
          code: id,
          type: String(apiField(item, 'loaiBongDen', 'LoaiBongDen') || 'Điểm đèn LED'),
          district: areaNames.get(areaId) || 'Chưa xác định',
          areaId,
          route: String(apiField(route, 'tenTuyen', 'TenTuyen') || routeId),
          location: String(apiField(item, 'viTri', 'ViTri') || 'Chưa có vị trí'),
          status: lampSt === 1 ? 'Hoạt động' : lampSt === 2 ? 'Đang tắt' : lampSt === 3 ? 'Sự cố' : 'Chưa xác định',
          statusClass: lampSt === 1 ? 'status-active' : lampSt === 3 ? 'status-warning' : 'status-lost',
          power: power !== null && power !== undefined ? `${power} W` : 'Chưa có dữ liệu',
          dim: dim !== null && dim !== undefined ? `${dim}%` : 'Chưa có dữ liệu',
          iconType: 'lamp',
          updated: lastSeen ? new Date(lastSeen).toLocaleString('vi-VN') : '—',
          lat: readCoordinate(apiField(item, 'viDo', 'ViDo')),
          lng: readCoordinate(apiField(item, 'kinhDo', 'KinhDo'))
        });
      });

      Object.keys(deviceDatabase).forEach(key => delete deviceDatabase[key]);
      devices.forEach(device => { deviceDatabase[device.id] = device; });

      renderMapNodes(devices);
      const renderedRoutes = renderMapRoutes(routes);
      bindNodeEvents();
      updateTelemetryCounts(devices);

      await Promise.all(devices.map(device =>
        device.iconType === 'cabinet' ? enrichCabinetMetrics(device) : enrichLampMetrics(device)
      ));

      updateTelemetryCounts(devices);
      applyMapFilters(false);

      const selectedNode = document.querySelector('.map-node.selected');
      if (selectedNode?.dataset.id && deviceDatabase[selectedNode.dataset.id]) {
        displayDeviceDetail(selectedNode.dataset.id);
      }
      console.info(`Đã tải ${devices.length} thiết bị hạ tầng từ Backend lên bản đồ.`);
      if (routes.length > renderedRoutes) {
        console.info(`${routes.length - renderedRoutes} tuyến chưa có GeoJSON; cần số hóa tuyến theo tim đường để hiển thị.`);
      }
    } catch (error) {
      console.warn('Không tải được dữ liệu bản đồ từ API.', error);
      showToast(`Không tải được dữ liệu bản đồ từ Backend: ${error.message || 'Không xác định lỗi.'}`, 'warning');
    }
  }

  loadMapInfrastructure();

  // -------------------------------------------------------------------------
  // 5. Map Canvas Zoom & Satellite Layer Controls
  // -------------------------------------------------------------------------
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      leafletMap?.zoomIn();
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      leafletMap?.zoomOut();
    });
  }

  if (btnRecenterGps) {
    btnRecenterGps.addEventListener('click', () => {
      leafletMap?.setView([16.0544, 108.2022], 13);
      showToast('Đã định vị về trung tâm Đà Nẵng', 'success');
    });
  }

  function toggleSatellite() {
    if (!leafletMap || !roadTileLayer || !satelliteTileLayer) return;
    isSatellite = !isSatellite;
    if (isSatellite) {
      roadTileLayer.remove();
      satelliteTileLayer.addTo(leafletMap);
    } else {
      satelliteTileLayer.remove();
      roadTileLayer.addTo(leafletMap);
    }
    showToast(isSatellite ? 'Đã kích hoạt lớp bản đồ vệ tinh' : 'Đã kích hoạt lớp bản đồ đường', 'success');
  }

  if (btnToggleLayers) {
    btnToggleLayers.addEventListener('click', toggleSatellite);
  }

  if (btnSwitchSatellite) {
    btnSwitchSatellite.addEventListener('click', toggleSatellite);
  }

  // -------------------------------------------------------------------------
  // 6. Action Button Links
  // -------------------------------------------------------------------------
  if (btnInspectDetail) {
    btnInspectDetail.addEventListener('click', () => {
      if (!selectedDevice) {
        showToast('Vui lòng chọn thiết bị trên bản đồ trước.', 'warning');
        return;
      }

      const isCab = (selectedDevice.type && selectedDevice.type.includes('Tủ')) || /^TC/i.test(selectedDevice.id);
      if (isCab) {
        window.location.href = `cabinets-detail.html?id=${encodeURIComponent(selectedDevice.id)}`;
      } else {
        window.location.href = `light-detail.html?id=${encodeURIComponent(selectedDevice.id)}`;
      }
    });
  }

  if (btnQuickControl) {
    btnQuickControl.addEventListener('click', () => {
      if (!selectedDevice) {
        showToast('Hãy chọn một thiết bị trước khi mở điều khiển.', 'warning');
        return;
      }

      const isCab = (selectedDevice.type && selectedDevice.type.includes('Tủ')) || /^TC/i.test(selectedDevice.id);
      if (isCab) {
        window.location.href = `cabinets-detail.html?id=${encodeURIComponent(selectedDevice.id)}`;
      } else {
        window.location.href = `light-detail.html?id=${encodeURIComponent(selectedDevice.id)}`;
      }
    });
  }

  if (btnDispatchPatrol) {
    btnDispatchPatrol.addEventListener('click', () => {
      showToast('Chức năng điều phối đội hiện chưa được kết nối API.', 'warning');
    });
  }

  // -------------------------------------------------------------------------
  // 7. Topbar Popovers (Notifications & User Profile)
  // -------------------------------------------------------------------------
  function closeAllPopovers() {
    notificationDropdown?.classList.remove('active');
    userDropdown?.classList.remove('active');
  }

  if (btnNotifications) {
    btnNotifications.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = notificationDropdown.classList.contains('active');
      closeAllPopovers();
      if (!isOpen) notificationDropdown.classList.add('active');
    });
  }

  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', (e) => {
      e.stopPropagation();
      const dot = document.querySelector('.notification-badge-dot');
      if (dot) dot.style.display = 'none';
      const unreads = document.querySelectorAll('.notification-item.unread');
      unreads.forEach(i => i.classList.remove('unread'));
      const headerTitle = document.querySelector('.dropdown-header strong');
      if (headerTitle) headerTitle.textContent = 'Thông báo mới (0)';
      showToast('Đã đánh dấu đọc tất cả thông báo', 'success');
    });
  }

  if (btnUserProfile) {
    btnUserProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = userDropdown.classList.contains('active');
      closeAllPopovers();
      if (!isOpen) userDropdown.classList.add('active');
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.notification-wrapper') && !e.target.closest('.user-profile-wrapper')) {
      closeAllPopovers();
    }
  });

  if (linkLogout) {
    linkLogout.addEventListener('click', () => {
      sessionStorage.removeItem('smartlight_user_session');
    });
  }

  // -------------------------------------------------------------------------
  // 8. Mobile Sidebar
  // -------------------------------------------------------------------------
  function openMobileSidebar() {
    sidebar?.classList.add('open');
    sidebarBackdrop?.classList.add('active');
  }

  function closeMobileSidebar() {
    sidebar?.classList.remove('open');
    sidebarBackdrop?.classList.remove('active');
  }

  if (btnToggleMobileSidebar) btnToggleMobileSidebar.addEventListener('click', openMobileSidebar);
  if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // -------------------------------------------------------------------------
  // 9. Toast Helper
  // -------------------------------------------------------------------------
  function showToast(message, type = 'success') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconSvg = type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    const iconTemplate = document.createElement('template');
    iconTemplate.innerHTML = iconSvg;
    const text = document.createElement('span');
    text.textContent = message;
    toast.append(iconTemplate.content, text);

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3200);
  }
});
