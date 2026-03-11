/**
 * IRLove – entry: profile, map, Gun auth, chat, notifications.
 */
(function () {
  'use strict';
  var App = window.IRLove;
  var state = App.state;
  var config = App.config;

  if (!App || !App.state || !App.$) {
    if (typeof document !== 'undefined' && document.body) {
      var div = document.createElement('div');
      div.style.cssText = 'position:fixed;inset:0;background:#1a1a2e;color:#e8e4de;padding:2rem;font-family:sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;z-index:99999;';
      div.textContent = 'IRLove: nie załadowano modułów. Otwórz przez serwer (HTTPS).';
      document.body.appendChild(div);
    }
    return;
  }

  var $ = App.$;
  var showScreen = App.showScreen;
  var applyLocale = App.applyLocale;
  var getProfile = App.getProfile;
  var setProfile = App.setProfile;
  var ensureProfile = App.ensureProfile;
  var loadLeaflet = App.loadLeaflet;
  var initMap = App.initMap;
  var updateUserPosition = App.updateUserPosition;
  var setUserAvatar = App.setUserAvatar;
  var gunConnect = App.gunConnect;
  var getOrCreateAuth = App.getOrCreateAuth;
  var gunAuth = App.gunAuth;
  var gunPub = App.gunPub;
  var startLocationSync = App.startLocationSync;
  var stopLocationSync = App.stopLocationSync;
  var subscribeToNearby = App.subscribeToNearby;
  var sendMessage = App.sendMessage;
  var subscribeInbox = App.subscribeInbox;

  function t(key, replacements) {
    return window.t ? window.t(key, replacements) : key;
  }

  function setStatus(text) {
    var el = document.getElementById('status-text');
    if (el) el.textContent = text;
  }

  function loadProfileIntoForm() {
    var p = ensureProfile();
    var nameEl = $('profile-display-name');
    var ageEl = $('profile-age');
    var heightEl = $('profile-height');
    var avatarEl = $('profile-avatar');
    var bioEl = $('profile-bio');
    if (nameEl) nameEl.value = p.displayName || '';
    if (ageEl) ageEl.value = p.age || '';
    if (heightEl) heightEl.value = p.height || '';
    if (avatarEl) avatarEl.value = p.avatar || '👤';
    if (bioEl) bioEl.value = p.bio || '';
    var tags = p.tags || [];
    if (typeof renderInterestsToolbox === 'function') renderInterestsToolbox();
    document.querySelectorAll('.btn-tag').forEach(function (btn) {
      var tag = btn.getAttribute('data-tag');
      btn.classList.toggle('selected', tags.indexOf(tag) >= 0);
    });
    var radiusKm = getStoredRadiusKm();
    var slider = $('radius-slider');
    var radiusValue = document.getElementById('radius-value');
    if (slider) {
      slider.value = radiusKm;
      slider.min = config.RADIUS_KM_MIN;
      slider.max = config.RADIUS_KM_MAX;
    }
    if (radiusValue) radiusValue.textContent = radiusKm;
    if (typeof renderAvatarToolbox === 'function') renderAvatarToolbox();
  }

  function saveProfileFromForm() {
    var nameEl = $('profile-display-name');
    var ageEl = $('profile-age');
    var heightEl = $('profile-height');
    var avatarEl = $('profile-avatar');
    var bioEl = $('profile-bio');
    var tags = [];
    document.querySelectorAll('.btn-tag.selected').forEach(function (btn) {
      var tag = btn.getAttribute('data-tag');
      if (tag) tags.push(tag);
    });
    var interests = [];
    document.querySelectorAll('.interest-btn.selected').forEach(function (btn) {
      var em = btn.getAttribute('data-emoji');
      if (em) interests.push(em);
    });
    var p = {
      displayName: (nameEl && nameEl.value) ? nameEl.value.trim() : '',
      age: (ageEl && ageEl.value) ? ageEl.value.trim() : '',
      height: (heightEl && heightEl.value) ? heightEl.value.trim() : '',
      avatar: (avatarEl && avatarEl.value) ? avatarEl.value.trim() : '👤',
      bio: (bioEl && bioEl.value) ? bioEl.value.trim() : '',
      tags: tags,
      interests: interests
    };
    setProfile(p);
    state.profile = p;
    return p;
  }

  function renderInterestsToolbox() {
    var box = document.getElementById('interests-toolbox');
    if (!box || !config.INTEREST_EMOJIS) return;
    box.innerHTML = '';
    var current = (getProfile() || {}).interests || [];
    config.INTEREST_EMOJIS.forEach(function (emoji) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'interest-btn' + (current.indexOf(emoji) >= 0 ? ' selected' : '');
      btn.setAttribute('data-emoji', emoji);
      btn.textContent = emoji;
      btn.setAttribute('aria-label', 'Zainteresowanie ' + emoji);
      btn.addEventListener('click', function () {
        btn.classList.toggle('selected');
      });
      box.appendChild(btn);
    });
  }

  function getStoredTheme() {
    try {
      var t = localStorage.getItem(config.STORAGE_KEY_THEME);
      return (t && t >= '1' && t <= '4') ? t : '1';
    } catch (e) { return '1'; }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(config.STORAGE_KEY_THEME, theme);
    } catch (e) {}
  }

  function getStoredRadiusKm() {
    try {
      var v = parseInt(localStorage.getItem(config.STORAGE_KEY_RADIUS_KM), 10);
      if (!isNaN(v) && v >= config.RADIUS_KM_MIN && v <= config.RADIUS_KM_MAX) return v;
    } catch (e) {}
    return config.RADIUS_KM_DEFAULT;
  }

  function setStoredRadiusKm(km) {
    var n = parseInt(km, 10);
    if (isNaN(n) || n < config.RADIUS_KM_MIN) n = config.RADIUS_KM_MIN;
    if (n > config.RADIUS_KM_MAX) n = config.RADIUS_KM_MAX;
    try {
      localStorage.setItem(config.STORAGE_KEY_RADIUS_KM, String(n));
    } catch (e) {}
    return n;
  }

  function applyTheme(theme) {
    theme = theme || getStoredTheme();
    document.body.setAttribute('data-theme', theme);
    document.querySelectorAll('.btn-theme').forEach(function (btn) {
      btn.classList.toggle('selected', btn.getAttribute('data-theme') === theme);
    });
  }

  function randomAvatar() {
    var list = config.AVATAR_EMOJIS || ['👤', '😊', '🌸', '🔥'];
    return list[Math.floor(Math.random() * list.length)];
  }

  function renderAvatarToolbox() {
    var box = document.getElementById('avatar-toolbox');
    if (!box || !config.AVATAR_EMOJIS) return;
    box.innerHTML = '';
    var current = (getProfile() || {}).avatar || '👤';
    config.AVATAR_EMOJIS.forEach(function (emoji) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar-tool-btn' + (emoji === current ? ' selected' : '');
      btn.textContent = emoji;
      btn.setAttribute('aria-label', 'Avatar ' + emoji);
      btn.addEventListener('click', function () {
        box.querySelectorAll('.avatar-tool-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        var avatarEl = $('profile-avatar');
        if (avatarEl) avatarEl.value = emoji;
      });
      box.appendChild(btn);
    });
  }

  function fillRandomProfile() {
    var names = ['Ania', 'Bartek', 'Kasia', 'Michał', 'Ola', 'Piotr', 'Zuza', 'Tomek', 'Nina', 'Kuba', 'User', 'Test'];
    var name = names[Math.floor(Math.random() * names.length)] + (Math.floor(Math.random() * 90) + 10);
    var age = 18 + Math.floor(Math.random() * 28);
    var height = 160 + Math.floor(Math.random() * 31);
    var avatar = randomAvatar();
    var tagOpts = ['chat', 'date', 'beer'];
    var nTags = 1 + Math.floor(Math.random() * 3);
    var tags = [];
    for (var i = 0; i < nTags; i++) {
      var t = tagOpts[Math.floor(Math.random() * tagOpts.length)];
      if (tags.indexOf(t) < 0) tags.push(t);
    }
    var bios = ['Lubię kawę i rozmowy.', 'Szukam fajnych ludzi w okolicy.', 'Spontan i dobra zabawa.', 'Cenię spotkania na żywo.'];
    var bio = bios[Math.floor(Math.random() * bios.length)];
    var intList = (config.INTEREST_EMOJIS || []).slice();
    var nInt = 2 + Math.floor(Math.random() * 5);
    var interests = [];
    for (var ii = 0; ii < nInt && intList.length; ii++) {
      var idx = Math.floor(Math.random() * intList.length);
      interests.push(intList[idx]);
      intList.splice(idx, 1);
    }
    var nameEl = $('profile-display-name');
    var ageEl = $('profile-age');
    var heightEl = $('profile-height');
    var avatarEl = $('profile-avatar');
    if (nameEl) nameEl.value = name;
    if (ageEl) ageEl.value = String(age);
    if (heightEl) heightEl.value = String(height);
    if (avatarEl) avatarEl.value = avatar;
    var bioEl = $('profile-bio');
    if (bioEl) bioEl.value = bio;
    document.querySelectorAll('.btn-tag').forEach(function (btn) {
      var tag = btn.getAttribute('data-tag');
      btn.classList.toggle('selected', tags.indexOf(tag) >= 0);
    });
    if (typeof renderInterestsToolbox === 'function') renderInterestsToolbox();
    document.querySelectorAll('.interest-btn').forEach(function (btn) {
      var em = btn.getAttribute('data-emoji');
      btn.classList.toggle('selected', interests.indexOf(em) >= 0);
    });
    saveProfileFromForm();
  }

  function goToMap() {
    var p = saveProfileFromForm();
    if (!p.displayName || !p.displayName.length) {
      App.showToast(t('error_no_profile'), 'error');
      return;
    }
    if (!p.avatar || !p.avatar.trim()) {
      p.avatar = randomAvatar();
      state.profile.avatar = p.avatar;
      setProfile(state.profile);
      var avatarEl = $('profile-avatar');
      if (avatarEl) avatarEl.value = p.avatar;
    }
    if (state.watchId != null && navigator.geolocation.clearWatch) {
      navigator.geolocation.clearWatch(state.watchId);
      state.watchId = null;
    }
    setStatus(t('status_getting_location'));
    if (!navigator.geolocation) {
      setStatus(t('status_location_error'));
      App.showToast(t('status_location_error'), 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        state.userPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        state.profile = p;
        function showMapAndMaybeRelay() {
          var radiusKm = getStoredRadiusKm();
          config.RADIUS_M = radiusKm * 1000;
          showScreen('screen-map');
          loadLeaflet().then(function () {
            initMap();
            if (state.map && state.userPosition) {
              state.map.invalidateSize();
              var c = state.userPosition;
              var R = (radiusKm * 1000) / 111320;
              state.map.fitBounds([[c.lat - R, c.lng - R], [c.lat + R, c.lng + R]], { padding: [24, 24], maxZoom: 17 });
            }
            setUserAvatar(p.avatar, p.tags);
            if (typeof App.addSimulatedUsers === 'function') App.addSimulatedUsers(state.userPosition, 2 + Math.floor(Math.random() * 2), radiusKm);
            setStatus(t('map_status_online'));
            requestNotificationPermission();
            var gun = gunConnect();
            if (gun) {
              var auth = getOrCreateAuth();
              gunAuth(auth.alias, auth.pass, function (user) {
                if (user) {
                  startLocationSync();
                  subscribeToNearby();
                  subscribeInbox(function (fromPub, text) {
                    if (state.chatWith === fromPub) {
                      appendChatMessage(fromPub, text, false);
                    } else {
                      App.showToast(t('notifications_new_user') + ': ' + (text || '').substring(0, 30));
                    }
                  });
                }
              });
            }
          }).catch(function () {
            setStatus(t('status_location_error'));
          });
        }
        showMapAndMaybeRelay();
      },
      function () {
        setStatus(t('status_location_denied'));
        App.showToast(t('status_location_denied'), 'error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
    var watchId = navigator.geolocation.watchPosition(
      function (pos) {
        state.userPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (updateUserPosition) updateUserPosition(pos.coords.latitude, pos.coords.longitude);
      },
      function () {},
      { enableHighAccuracy: true, maximumAge: config.LOCATION_UPDATE_MS }
    );
    state.watchId = watchId;
  }

  function backToStart() {
    stopLocationSync();
    if (state.watchId != null && navigator.geolocation.clearWatch) {
      navigator.geolocation.clearWatch(state.watchId);
      state.watchId = null;
    }
    showScreen('screen-start');
  }

  App.openChat = function (pub, data) {
    state.chatWith = pub;
    state.chatWithProfile = data || {};
    var name = (data && data.displayName) ? data.displayName : pub.substring(0, 8);
    var el = $('chat-with-name');
    if (el) el.textContent = (t('chat_with') || 'Z') + ' ' + name;
    var messagesEl = $('chat-messages');
    if (messagesEl) messagesEl.innerHTML = '';
    var overlay = $('chat-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.style.display = 'flex';
    }
    var input = $('chat-input');
    if (input) input.focus();
  };

  function closeChat() {
    state.chatWith = null;
    var overlay = $('chat-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
  }

  function appendChatMessage(fromPub, text, isMe) {
    var messagesEl = $('chat-messages');
    if (!messagesEl) return;
    var div = document.createElement('div');
    div.className = 'chat-msg ' + (isMe ? 'chat-msg-me' : 'chat-msg-them');
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function sendChatMessage() {
    var input = $('chat-input');
    var toPub = state.chatWith;
    if (!input || !toPub) return;
    var text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    appendChatMessage(toPub, text, true);
    sendMessage(toPub, text, function (ok) {
      if (!ok) App.showToast('Send failed', 'error');
    });
  }

  App.notifyNewNearby = function (pub, payload) {
    if (!payload || !payload.displayName) return;
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(t('notifications_new_user'), {
          body: payload.displayName + ' ' + (payload.tags && payload.tags.length ? ' · ' + payload.tags.join(', ') : ''),
          icon: '/favicon.ico'
        });
      } catch (e) {}
    }
  };

  function requestNotificationPermission() {
    if (typeof Notification === 'undefined') return;
    var hint = document.getElementById('notifications-hint');
    if (!hint) return;
    if (Notification.permission === 'granted') {
      hint.classList.add('hidden');
    } else {
      hint.classList.remove('hidden');
    }
  }

  function enableNotifications() {
    if (typeof Notification === 'undefined') {
      App.showToast('Przeglądarka nie obsługuje powiadomień.', 'error');
      return;
    }
    Notification.requestPermission().then(function (p) {
      if (p === 'granted') {
        var hint = document.getElementById('notifications-hint');
        if (hint) hint.classList.add('hidden');
        App.showToast(t('notifications_enable') + ' ✓');
      } else if (p === 'denied') {
        App.showToast('Powiadomienia zablokowane. Odblokuj w ustawieniach przeglądarki.', 'error');
      }
    });
  }

  function refreshLabels() {
    if (document.title !== undefined && window.t) document.title = window.t('app_title');
  }

  function init() {
    ensureProfile();
    applyTheme(getStoredTheme());
    loadProfileIntoForm();
    renderAvatarToolbox();
    applyLocale(refreshLabels);

    document.querySelectorAll('.btn-theme').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var theme = this.getAttribute('data-theme');
        if (theme) {
          setStoredTheme(theme);
          applyTheme(theme);
        }
      });
    });

    var btnRandomAvatar = $('btn-random-avatar');
    if (btnRandomAvatar) {
      btnRandomAvatar.addEventListener('click', function () {
        var avatar = randomAvatar();
        var avatarEl = $('profile-avatar');
        if (avatarEl) avatarEl.value = avatar;
      });
    }

    var btnFillRandom = $('btn-fill-random');
    if (btnFillRandom) btnFillRandom.addEventListener('click', fillRandomProfile);

    document.querySelectorAll('.btn-lang').forEach(function (btn) {
      btn.classList.toggle('selected', btn.getAttribute('data-lang') === (window.CURRENT_LOCALE || 'pl'));
    });
    document.querySelectorAll('.btn-lang').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        if (!lang || !window.LOCALES || !window.LOCALES[lang]) return;
        window.CURRENT_LOCALE = lang;
        if (window.setStoredLang) window.setStoredLang(lang);
        applyLocale(refreshLabels);
        document.querySelectorAll('.btn-lang').forEach(function (b) {
          b.classList.toggle('selected', b.getAttribute('data-lang') === lang);
        });
      });
    });

    document.querySelectorAll('.btn-tag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        this.classList.toggle('selected');
      });
    });

    var radiusSlider = $('radius-slider');
    var radiusValueEl = document.getElementById('radius-value');
    if (radiusSlider && radiusValueEl) {
      radiusSlider.addEventListener('input', function () {
        var km = setStoredRadiusKm(radiusSlider.value);
        radiusValueEl.textContent = km;
      });
    }

    var btnToggleInterests = $('btn-toggle-interests');
    if (btnToggleInterests) {
      btnToggleInterests.addEventListener('click', function () {
        var box = document.getElementById('interests-toolbox');
        if (box) box.classList.toggle('hidden');
      });
    }

    var btnEnter = $('btn-enter-map');
    if (btnEnter) btnEnter.addEventListener('click', goToMap);

    var btnBack = $('btn-back');
    if (btnBack) btnBack.addEventListener('click', backToStart);

    var btnProfile = $('btn-profile-map');
    if (btnProfile) {
      btnProfile.addEventListener('click', function () {
        showScreen('screen-start');
        loadProfileIntoForm();
        if (typeof renderAvatarToolbox === 'function') renderAvatarToolbox();
      });
    }

    var btnChatClose = $('btn-chat-close');
    if (btnChatClose) btnChatClose.addEventListener('click', closeChat);

    var btnChatSend = $('btn-chat-send');
    if (btnChatSend) btnChatSend.addEventListener('click', sendChatMessage);

    var chatInput = $('chat-input');
    if (chatInput) {
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendChatMessage();
        }
      });
    }

    var btnNotifications = $('btn-enable-notifications');
    if (btnNotifications) btnNotifications.addEventListener('click', enableNotifications);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
