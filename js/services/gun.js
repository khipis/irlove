/**
 * IRLove – Gun.js P2P: relay connection, location/presence sync, SEA chat.
 */
(function () {
  'use strict';
  var App = window.IRLove;
  var state = App.state;
  var config = App.config;

  var RELAY = config.RELAY_URL || 'https://irlove-relay.fly.dev/gun';
  var RADIUS_M = config.RADIUS_M || 2000;
  var ACTIVE_MS = config.ACTIVE_THRESHOLD_MS || 15000;
  var UPDATE_MS = config.LOCATION_UPDATE_MS || 5000;
  var AUTH_STORAGE_KEY = 'irlove_gun_auth';

  var locationInterval = null;
  var lastNotifiedPubs = {};

  function getOrCreateAuth() {
    try {
      var raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && o.alias && o.pass) return o;
      }
      var alias = 'u' + Math.random().toString(36).slice(2, 14);
      var pass = Math.random().toString(36).slice(2, 18);
      var out = { alias: alias, pass: pass };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(out));
      return out;
    } catch (e) {
      return { alias: 'u' + Date.now(), pass: 'p' + Math.random().toString(36).slice(2, 10) };
    }
  }

  function connect() {
    if (state.gun) return state.gun;
    var Gun = window.Gun;
    if (!Gun) return null;
    state.sea = window.SEA || (Gun.SEA || null);
    var opts = { peers: [RELAY], localStorage: false };
    state.gun = Gun(opts);
    state.user = state.gun.user();
    return state.gun;
  }

  function getPub() {
    if (!state.user) return null;
    return state.user.is && state.user.is.pub;
  }

  function authOrCreate(alias, pass, cb) {
    var gun = connect();
    if (!gun || !state.user) return cb && cb(null);
    state.user.auth(alias, pass, function (ack) {
      if (ack && ack.err) {
        state.user.create(alias, pass, function (ack2) {
          if (ack2 && ack2.err) return cb && cb(null);
          cb && cb(state.user);
        });
      } else {
        cb && cb(state.user);
      }
    });
  }

  function publishLocation(lat, lng) {
    var pub = getPub();
    if (!pub || lat == null || lng == null) return;
    var profile = state.profile || {};
    state.gun.get('users').get(pub).get('location').put({
      lat: lat,
      lng: lng,
      at: Date.now()
    });
    state.gun.get('users').get(pub).get('lastSeen').put(Date.now());
    state.gun.get('users').get(pub).get('profile').put({
      displayName: profile.displayName || '',
      age: profile.age || '',
      height: profile.height || '',
      avatar: profile.avatar || '👤',
      tags: profile.tags || []
    });
  }

  function startLocationSync() {
    if (locationInterval) clearInterval(locationInterval);
    function tick() {
      if (!state.userPosition || !getPub()) return;
      publishLocation(state.userPosition.lat, state.userPosition.lng);
    }
    tick();
    locationInterval = setInterval(tick, UPDATE_MS);
  }

  function stopLocationSync() {
    if (locationInterval) {
      clearInterval(locationInterval);
      locationInterval = null;
    }
  }

  function subscribeToNearby(cb) {
    var gun = connect();
    if (!gun) return;
    gun.get('users').map().on(function (data, pub) {
      if (!data || !data.location || pub === getPub()) return;
      var lat = data.location.lat;
      var lng = data.location.lng;
      var at = data.location.at || 0;
      if (Date.now() - at > ACTIVE_MS) {
        if (App.removeOtherUser) App.removeOtherUser(pub);
        return;
      }
      var dist = App.haversine(state.userPosition.lat, state.userPosition.lng, lat, lng);
      if (dist > RADIUS_M) return;
      var profile = data.profile || {};
      var payload = {
        lat: lat,
        lng: lng,
        displayName: profile.displayName,
        avatar: profile.avatar,
        tags: profile.tags || []
      };
      if (App.updateOtherUser) App.updateOtherUser(pub, payload);
      state.nearbyUsers[pub] = { at: at, profile: profile, lat: lat, lng: lng };
      if (cb) cb(pub, payload);
      if (typeof App.notifyNewNearby === 'function' && !lastNotifiedPubs[pub]) {
        lastNotifiedPubs[pub] = true;
        App.notifyNewNearby(pub, payload);
      }
    });
    setInterval(function () {
      var now = Date.now();
      Object.keys(state.nearbyUsers || {}).forEach(function (pub) {
        var u = state.nearbyUsers[pub];
        if (u && now - (u.at || 0) > ACTIVE_MS) {
          if (App.removeOtherUser) App.removeOtherUser(pub);
          delete state.nearbyUsers[pub];
          delete lastNotifiedPubs[pub];
        }
      });
    }, 5000);
  }

  function sendMessage(toPub, text, cb) {
    var me = getPub();
    if (!me || !state.sea || !toPub || !text) return cb && cb(false);
    var pair = state.user._.sea;
    if (!pair) return cb && cb(false);
    try {
      var secret = state.sea.secret(toPub, pair);
      var enc = state.sea.encrypt(text, secret);
      if (enc) state.gun.get('users').get(toPub).get('inbox').get(me).put(enc);
      cb && cb(true);
    } catch (e) {
      cb && cb(false);
    }
  }

  function subscribeInbox(cb) {
    var pub = getPub();
    if (!pub || !state.gun || !state.sea) return;
    state.gun.get('users').get(pub).get('inbox').map().on(function (enc, fromPub) {
      if (!enc || !fromPub) return;
      var pair = state.user._.sea;
      if (!pair) return;
      try {
        var secret = state.sea.secret(fromPub, pair);
        state.sea.decrypt(enc, secret, function (plain) {
          if (plain != null && cb) cb(fromPub, plain);
        });
      } catch (e) {}
    });
  }

  App.getOrCreateAuth = getOrCreateAuth;
  App.gunConnect = connect;
  App.gunAuth = authOrCreate;
  App.gunPub = getPub;
  App.publishLocation = publishLocation;
  App.startLocationSync = startLocationSync;
  App.stopLocationSync = stopLocationSync;
  App.subscribeToNearby = subscribeToNearby;
  App.sendMessage = sendMessage;
  App.subscribeInbox = subscribeInbox;
})();
