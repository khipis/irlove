/**
 * IRLove – Leaflet map: OSM tiles, user marker, other users within 2 km.
 */
(function () {
  'use strict';
  var App = window.IRLove;
  var state = App.state;
  var config = App.config;

  function t(key) {
    return window.t ? window.t(key) : key;
  }

  function loadLeaflet() {
    return new Promise(function (resolve, reject) {
      if (window.L) {
        resolve();
        return;
      }
      var deadline = Date.now() + 12000;
      var check = setInterval(function () {
        if (window.L) {
          clearInterval(check);
          resolve();
          return;
        }
        if (Date.now() > deadline) {
          clearInterval(check);
          reject(new Error('MAP_LOAD_TIMEOUT'));
        }
      }, 80);
    });
  }

  function initMap() {
    var center = state.userPosition;
    if (!center) return;
    var L = window.L;
    if (state.map) {
      try {
        state.map.remove();
      } catch (e) {}
      state.map = null;
      state.userMarker = null;
      Object.keys(state.otherUserMarkers || {}).forEach(function (pub) {
        var m = state.otherUserMarkers[pub];
        if (m && state.map && state.map.hasLayer(m)) state.map.removeLayer(m);
      });
      state.otherUserMarkers = {};
    }
    state.map = L.map('map-container').setView([center.lat, center.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(state.map);
    var profile = state.profile || {};
    var avatar = (profile.avatar && profile.avatar.trim()) ? profile.avatar.trim() : '👤';
    if (avatar.length > 2) avatar = '👤';
    var userIcon = L.divIcon({
      className: 'user-marker irlove-user',
      html: '<span class="user-marker-avatar" title="' + (t('map_you') || 'You').replace(/"/g, '&quot;') + '">' + avatar + '</span>',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    state.userMarker = L.marker([center.lat, center.lng], { icon: userIcon }).addTo(state.map);
    state.userMarker.bindTooltip(t('tooltip_you'), { permanent: false });
  }

  function updateUserPosition(lat, lng) {
    if (!state.userMarker) return;
    state.userMarker.setLatLng([lat, lng]);
    if (state.map) state.map.panTo([lat, lng], { animate: true, duration: 0.5 });
  }

  function availabilityIcon(tags) {
    if (!tags || !tags.length) return '👤';
    if (tags.indexOf('beer') >= 0) return '🍺';
    if (tags.indexOf('date') >= 0) return '❤️';
    if (tags.indexOf('chat') >= 0) return '💬';
    return '👤';
  }

  function updateOtherUser(pub, data) {
    var lat = data.lat;
    var lng = data.lng;
    if (lat == null || lng == null) return;
    var L = window.L;
    if (!state.map) return;
    var existing = state.otherUserMarkers[pub];
    if (existing && state.map.hasLayer(existing)) {
      state.map.removeLayer(existing);
    }
    var tags = (data.tags && Array.isArray(data.tags)) ? data.tags : [];
    var avatar = (data.avatar && String(data.avatar).trim()) ? String(data.avatar).trim() : availabilityIcon(tags);
    if (avatar.length > 2) avatar = availabilityIcon(tags);
    var name = (data.displayName && String(data.displayName).trim()) ? String(data.displayName).trim() : '?';
    var icon = L.divIcon({
      className: 'other-user-marker irlove-other',
      html: '<span class="other-marker-avatar" title="' + name.replace(/"/g, '&quot;') + '">' + avatar + '</span>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    var marker = L.marker([lat, lng], { icon: icon }).addTo(state.map);
    marker.bindTooltip(name, { permanent: false });
    marker._pub = pub;
    marker.on('click', function () {
      if (typeof App.openChat === 'function') App.openChat(pub, data);
    });
    state.otherUserMarkers[pub] = marker;
  }

  function removeOtherUser(pub) {
    var m = state.otherUserMarkers[pub];
    if (m && state.map && state.map.hasLayer(m)) {
      state.map.removeLayer(m);
    }
    delete state.otherUserMarkers[pub];
  }

  function setUserAvatar(avatar) {
    var el = document.querySelector('.user-marker-avatar');
    if (el) el.textContent = (avatar && avatar.trim()) ? avatar.trim().substring(0, 2) : '👤';
  }

  App.loadLeaflet = loadLeaflet;
  App.initMap = initMap;
  App.updateUserPosition = updateUserPosition;
  App.updateOtherUser = updateOtherUser;
  App.removeOtherUser = removeOtherUser;
  App.setUserAvatar = setUserAvatar;
})();
