/**
 * Wyszukiwanie miejsc (Overpass API) i wybór atrakcji.
 */
(function () {
  'use strict';
  var Sp = window.Spacerek;
  var state = Sp.state;
  var config = Sp.config;

  function fetchPlacesFromOverpass(lat, lng, radiusMeters) {
    var radius = Math.min(Math.round(radiusMeters), 10000);
    var q = [
      '[out:json][timeout:20];',
      '(',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[tourism=museum][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[tourism=gallery][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[tourism=attraction][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[tourism=viewpoint][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[tourism=theme_park][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[tourism=zoo][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[historic][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[amenity=museum][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[amenity=arts_centre][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[amenity=theatre][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[leisure=park][name];',
      '  node(around:' + radius + ',' + lat + ',' + lng + ')[leisure=nature_reserve][name];',
      ');',
      'out body;'
    ].join('');

    return fetch(config.OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(q)
    }).then(function (response) {
      if (!response.ok) throw new Error('Overpass: ' + response.status);
      return response.json();
    });
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  Sp.fetchPlacesFromOverpass = fetchPlacesFromOverpass;
  Sp.shuffleArray = shuffleArray;
})();
