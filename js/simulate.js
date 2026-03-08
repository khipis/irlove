/**
 * Symulacja dojścia do celu (animacja ruchu) i przycisk "Symuluj dojście".
 */
(function () {
  'use strict';
  var Sp = window.Spacerek;
  var state = Sp.state;
  var config = Sp.config;
  var haversine = Sp.haversine;
  var removeTargetMarkerAt = Sp.removeTargetMarkerAt;
  var addVisitedMarker = Sp.addVisitedMarker;
  var revealPlace = Sp.revealPlace;
  var setStatus = Sp.setStatus;

  function t(key, replacements) {
    return window.t ? window.t(key, replacements) : key;
  }

  function animateWalkToTarget(doneCallback) {
    if (!state.map || !state.userMarker || !state.targetPlace) {
      if (doneCallback) doneCallback();
      return;
    }
    var startLat = state.userPosition.lat;
    var startLng = state.userPosition.lng;
    var endLat = state.targetPlace.lat;
    var endLng = state.targetPlace.lng;
    var startTime = performance.now();

    function tick(now) {
      var progress = (now - startTime) / config.SIMULATE_WALK_MS;
      if (progress >= 1) {
        state.userPosition = { lat: endLat, lng: endLng };
        state.userMarker.setLatLng([endLat, endLng]);
        state.map.panTo([endLat, endLng]);
        if (doneCallback) doneCallback();
        return;
      }
      var ease = progress * progress * (3 - 2 * progress);
      var lat = startLat + (endLat - startLat) * ease;
      var lng = startLng + (endLng - startLng) * ease;
      state.userPosition = { lat: lat, lng: lng };
      state.userMarker.setLatLng([lat, lng]);
      var dist = haversine(lat, lng, endLat, endLng);
      var hint = document.getElementById('hint-distance');
      if (hint) hint.textContent = t('simulate_distance', { m: Math.round(dist) });
      state.map.panTo([lat, lng]);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function simulateArrival() {
    var indices = [];
    for (var i = 0; i < state.targetPlaces.length; i++) {
      if (!state.collectedIndices[i]) indices.push(i);
    }
    if (indices.length === 0) {
      setStatus(t('status_all_collected'), '');
      return;
    }
    var idx = indices[Math.floor(Math.random() * indices.length)];
    state.targetPlace = state.targetPlaces[idx];
    state.targetPlaceIndex = idx;
    if (state.watchId != null) {
      navigator.geolocation.clearWatch(state.watchId);
      state.watchId = null;
    }
    function onReached() {
      state.collectedIndices[idx] = true;
      removeTargetMarkerAt(idx);
      addVisitedMarker(state.targetPlace);
      revealPlace();
    }
    animateWalkToTarget(onReached);
  }

  Sp.animateWalkToTarget = animateWalkToTarget;
  Sp.simulateArrival = simulateArrival;
})();
