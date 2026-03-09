/**
 * Fetching fun facts and images from Wikipedia.
 */
(function () {
  'use strict';
  var config = window.Spacerek.config;

  function fetchWikipediaCiekawostki(lat, lng, placeName, callback) {
    var params = function (obj) {
      return Object.keys(obj).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]); }).join('&');
    };
    var opts = { action: 'query', list: 'geosearch', gscoord: lat + '|' + lng, gsradius: config.WIKI_MAX_DIST_M, gslimit: 1, format: 'json', origin: '*' };
    fetch(config.WIKI_API + '?' + params(opts))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var list = data.query && data.query.geosearch;
        if (!list || list.length === 0) { callback(null, null); return null; }
        var hit = list[0];
        var distM = hit.dist != null ? hit.dist : 999;
        if (distM > config.WIKI_MAX_DIST_M) { callback(null, null); return null; }
        return { pageid: hit.pageid, title: hit.title };
      })
      .then(function (ref) {
        if (!ref) return;
        var q = { action: 'query', format: 'json', origin: '*', prop: 'extracts|pageimages', exintro: 1, explaintext: 1, exchars: 650, piprop: 'original', pageids: ref.pageid };
        fetch(config.WIKI_API + '?' + params(q))
          .then(function (r) { return r.json(); })
          .then(function (data) {
            var pages = data.query && data.query.pages;
            var page = pages && pages[Object.keys(pages)[0]];
            var extract = page && page.extract;
            var imgUrl = (page && page.original && page.original.source) || (page && page.thumbnail && page.thumbnail.source);
            callback(extract || null, imgUrl || null);
          })
          .catch(function () { callback(null, null); });
      })
      .catch(function () { callback(null, null); });
  }

  window.Spacerek.fetchWikipediaCiekawostki = fetchWikipediaCiekawostki;
})();
