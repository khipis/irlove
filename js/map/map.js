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
      if (state.simulatedMarkers) {
        state.simulatedMarkers.forEach(function (m) {
          if (state.map && state.map.hasLayer(m)) state.map.removeLayer(m);
        });
        state.simulatedMarkers = [];
      }
      if (state.radiusCircle && state.map && state.map.hasLayer(state.radiusCircle)) {
        state.map.removeLayer(state.radiusCircle);
      }
      state.radiusCircle = null;
    }
    state.map = L.map('map-container').setView([center.lat, center.lng], 15);
    var mapEl = document.getElementById('map-container');
    if (mapEl) mapEl.classList.add('map-soft-cute');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(state.map);
    var profile = state.profile || {};
    var avatar = (profile.avatar && profile.avatar.trim()) ? profile.avatar.trim() : '👤';
    if (avatar.length > 2) avatar = '👤';
    var tagIcons = tagsToIconsString(profile.tags || []);
    var statusMax = (config.STATUS_MAX_LENGTH != null) ? config.STATUS_MAX_LENGTH : 80;
    var statusText = (profile.status && String(profile.status).trim()) ? escapeHtml(String(profile.status).trim().substring(0, statusMax)) : '';
    var bubbleHtml = '<div class="user-marker-bubble"><span class="user-marker-status-text">' + statusText + '</span><span class="user-marker-tag-icon">' + tagIcons + '</span></div>';
    var userIcon = L.divIcon({
      className: 'user-marker irlove-user',
      html: '<div class="user-marker-wrap">' + bubbleHtml + '<span class="user-marker-avatar" title="' + escapeHtml(profile.displayName || t('map_you')) + '">' + avatar + '</span></div>',
      iconSize: [48, 72],
      iconAnchor: [24, 68]
    });
    state.userMarker = L.marker([center.lat, center.lng], { icon: userIcon }).addTo(state.map);
    var tip = formatUserTooltip(profile.displayName || t('map_you'), profile.age, profile.height, profile.tags, profile.bio, profile.interests, profile.status, profile.mood, profile.gender);
    state.userMarker.bindTooltip(tip, { permanent: false, direction: 'right', className: 'marker-tooltip', offset: [12, 0] });
    state.radiusCircle = L.circle([center.lat, center.lng], {
      radius: 2000,
      color: 'rgba(224, 122, 95, 0.85)',
      fillColor: 'transparent',
      fillOpacity: 0,
      weight: 1.5,
      opacity: 0.9
    }).addTo(state.map);
  }

  function formatUserTooltip(name, age, height, tags, bio, interests, status, mood, gender) {
    var lines = [];
    var line1 = '<strong class="marker-tooltip-name">' + escapeHtml(name) + '</strong>';
    if (mood && String(mood).trim()) line1 += ' <span class="marker-tooltip-mood">' + escapeHtml(String(mood).trim()) + '</span>';
    var meta = [];
    if (gender === 'f') meta.push(t('profile_gender_f'));
    else if (gender === 'm') meta.push(t('profile_gender_m'));
    else if (gender === 'other') meta.push(t('profile_gender_other'));
    if (age) meta.push(age + ' lat');
    if (height) meta.push(height + ' cm');
    if (meta.length) line1 += ' <span class="marker-tooltip-meta">' + meta.join(' · ') + '</span>';
    lines.push('<div class="marker-tooltip-line">' + line1 + '</div>');
    if (status && String(status).trim()) lines.push('<div class="marker-tooltip-line marker-tooltip-status">' + escapeHtml(String(status).trim()) + '</div>');
    if (tags && tags.length) {
      var tagLabels = tags.map(function (tag) { return t('profile_tag_' + tag); });
      lines.push('<div class="marker-tooltip-line marker-tooltip-tags">' + tagLabels.map(function (l) { return escapeHtml(l); }).join(' · ') + '</div>');
    }
    if (bio && String(bio).trim()) lines.push('<div class="marker-tooltip-bio">' + escapeHtml(String(bio).trim()) + '</div>');
    if (interests && interests.length) lines.push('<div class="marker-tooltip-interests">' + interests.map(function (e) { return escapeHtml(e); }).join(' ') + '</div>');
    return '<div class="marker-tooltip-inner">' + lines.join('') + '</div>';
  }

  function escapeHtml(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function addSimulatedUsers(center, count, radiusKm) {
    if (!state.map || !center || !count) return;
    var L = window.L;
    radiusKm = radiusKm || config.RADIUS_KM || 2;
    var maxDistDeg = (radiusKm * 1000) / 111320;
    var names = ['Ola', 'Kasia', 'Michał', 'Zuza', 'Tomek', 'Nina', 'Bartek', 'Ania'];
    var avatars = config.AVATAR_EMOJIS || ['👤', '😊', '🙂', '👩🏻', '👨🏽'];
    var tagOpts = [['chat'], ['date'], ['beer'], ['chat', 'date'], ['beer', 'chat']];
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * 2 * Math.PI;
      var dist = maxDistDeg * (0.15 + Math.random() * 0.85);
      var lat = center.lat + dist * Math.cos(angle);
      var lng = center.lng + dist * Math.sin(angle);
      var name = names[Math.floor(Math.random() * names.length)] + (20 + Math.floor(Math.random() * 25));
      var age = 22 + Math.floor(Math.random() * 18);
      var height = 165 + Math.floor(Math.random() * 25);
      var tags = tagOpts[Math.floor(Math.random() * tagOpts.length)];
      var avatar = avatars[Math.floor(Math.random() * avatars.length)];
      var tagIcon = tagToSmallIcon(tags);
      var icon = L.divIcon({
        className: 'other-user-marker irlove-other irlove-simulated',
        html: '<div class="other-marker-wrap"><span class="user-marker-tag-icon">' + tagIcon + '</span><span class="other-marker-avatar">' + avatar + '</span></div>',
        iconSize: [40, 50],
        iconAnchor: [20, 48]
      });
      var marker = L.marker([lat, lng], { icon: icon }).addTo(state.map);
      var bio = ['Lubię spotkania i nowe miejsca.', 'Cenię rozmowę przy kawie.', 'Szukam fajnych ludzi w okolicy.', 'Spontan i dobra zabawa.'][Math.floor(Math.random() * 4)];
      var maxInt = (config.INTERESTS_MAX != null) ? config.INTERESTS_MAX : 10;
      var numInt = Math.min(2 + Math.floor(Math.random() * 4), maxInt);
      var intList = (config.INTEREST_EMOJIS || []).slice();
      var interests = [];
      for (var j = 0; j < numInt && intList.length; j++) {
        var idx = Math.floor(Math.random() * intList.length);
        interests.push(intList[idx]);
        intList.splice(idx, 1);
      }
      var tip = formatUserTooltip(name, String(age), String(height), tags, bio, interests, '', '', '');
      marker.bindTooltip(tip, { permanent: false, direction: 'right', className: 'marker-tooltip', offset: [12, 0] });
      if (!state.simulatedMarkers) state.simulatedMarkers = [];
      state.simulatedMarkers.push(marker);
    }
  }

  function tagToSmallIcon(tags) {
    if (!tags || !tags.length) return '';
    if (tags.indexOf('beer') >= 0) return '🍺';
    if (tags.indexOf('date') >= 0) return '❤️';
    if (tags.indexOf('chat') >= 0) return '💬';
    return '';
  }

  function tagsToIconsString(tags) {
    if (!tags || !tags.length) return '';
    var out = [];
    if (tags.indexOf('chat') >= 0) out.push('💬');
    if (tags.indexOf('date') >= 0) out.push('❤️');
    if (tags.indexOf('beer') >= 0) out.push('🍺');
    return out.join('');
  }

  function updateUserPosition(lat, lng) {
    if (!state.userMarker) return;
    state.userMarker.setLatLng([lat, lng]);
    if (state.radiusCircle) state.radiusCircle.setLatLng([lat, lng]);
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
      html: '<div class="other-marker-wrap"><span class="user-marker-tag-icon">' + (tagToSmallIcon(tags) || '') + '</span><span class="other-marker-avatar" title="' + escapeHtml(name) + '">' + avatar + '</span></div>',
      iconSize: [40, 50],
      iconAnchor: [20, 48]
    });
    var marker = L.marker([lat, lng], { icon: icon }).addTo(state.map);
    var prof = data.profile || data;
    var tip = formatUserTooltip(name, prof.age, prof.height, tags, prof.bio, prof.interests, prof.status, prof.mood, prof.gender);
    marker.bindTooltip(tip, { permanent: false, direction: 'right', className: 'marker-tooltip', offset: [12, 0] });
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

  function setUserAvatar(avatar, tags, status) {
    var wrap = document.querySelector('.user-marker-wrap');
    if (!wrap) return;
    var avatarEl = wrap.querySelector('.user-marker-avatar');
    if (avatarEl) avatarEl.textContent = (avatar && avatar.trim()) ? avatar.trim().substring(0, 2) : '👤';
    var bubble = wrap.querySelector('.user-marker-bubble');
    if (bubble) {
      var statusEl = bubble.querySelector('.user-marker-status-text');
      var tagEl = bubble.querySelector('.user-marker-tag-icon');
      var statusMax = (config.STATUS_MAX_LENGTH != null) ? config.STATUS_MAX_LENGTH : 80;
      if (statusEl) statusEl.textContent = (status && String(status).trim()) ? String(status).trim().substring(0, statusMax) : '';
      if (tagEl) tagEl.textContent = tagsToIconsString(tags || (state.profile && state.profile.tags) || []);
    }
  }

  App.loadLeaflet = loadLeaflet;
  App.initMap = initMap;
  App.updateUserPosition = updateUserPosition;
  App.updateOtherUser = updateOtherUser;
  App.removeOtherUser = removeOtherUser;
  App.setUserAvatar = setUserAvatar;
  App.addSimulatedUsers = addSimulatedUsers;
})();
