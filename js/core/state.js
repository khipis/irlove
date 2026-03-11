/**
 * IRLove – app state and DOM/geo helpers.
 */
(function () {
  'use strict';
  window.IRLove = window.IRLove || {};
  window.IRLove.state = {
    userPosition: null,
    map: null,
    userMarker: null,
    otherUserMarkers: {},
    watchId: null,
    gun: null,
    user: null,
    sea: null,
    profile: null,
    chatWith: null,
    nearbyUsers: {}
  };

  function $(id) {
    return document.getElementById(id);
  }

  function show(el, visible) {
    if (!el) return;
    if (visible) {
      el.classList.remove('hidden');
      var d = el.getAttribute('data-display');
      el.style.display = d ? d : (el.tagName === 'SECTION' ? 'flex' : '');
    } else {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
  }

  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function (el) {
      el.classList.remove('active');
    });
    var el = $(screenId);
    if (el) el.classList.add('active');
  }

  function haversine(lat1, lon1, lat2, lon2) {
    var R = 6371000;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function showToast(message, type) {
    var container = document.getElementById('toast-container');
    if (!container || !message) return;
    var el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' toast-error' : '');
    el.setAttribute('role', 'status');
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () {
      el.classList.add('toast-out');
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }

  window.IRLove.$ = $;
  window.IRLove.show = show;
  window.IRLove.showScreen = showScreen;
  window.IRLove.haversine = haversine;
  window.IRLove.showToast = showToast;
})();
