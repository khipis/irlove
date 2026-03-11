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
    if (nameEl) nameEl.value = p.displayName || '';
    if (ageEl) ageEl.value = p.age || '';
    if (heightEl) heightEl.value = p.height || '';
    if (avatarEl) avatarEl.value = p.avatar || '👤';
    var tags = p.tags || [];
    document.querySelectorAll('.btn-tag').forEach(function (btn) {
      var tag = btn.getAttribute('data-tag');
      btn.classList.toggle('selected', tags.indexOf(tag) >= 0);
    });
  }

  function saveProfileFromForm() {
    var nameEl = $('profile-display-name');
    var ageEl = $('profile-age');
    var heightEl = $('profile-height');
    var avatarEl = $('profile-avatar');
    var tags = [];
    document.querySelectorAll('.btn-tag.selected').forEach(function (btn) {
      var tag = btn.getAttribute('data-tag');
      if (tag) tags.push(tag);
    });
    var p = {
      displayName: (nameEl && nameEl.value) ? nameEl.value.trim() : '',
      age: (ageEl && ageEl.value) ? ageEl.value.trim() : '',
      height: (heightEl && heightEl.value) ? heightEl.value.trim() : '',
      avatar: (avatarEl && avatarEl.value) ? avatarEl.value.trim() : '👤',
      tags: tags
    };
    setProfile(p);
    state.profile = p;
    return p;
  }

  function goToMap() {
    var p = saveProfileFromForm();
    if (!p.displayName || !p.displayName.length) {
      App.showToast(t('error_no_profile'), 'error');
      return;
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
        gunConnect();
        var auth = getOrCreateAuth();
        gunAuth(auth.alias, auth.pass, function (user) {
          if (!user) {
            setStatus('Auth failed');
            return;
          }
          loadLeaflet().then(function () {
            initMap();
            setUserAvatar(p.avatar);
            startLocationSync();
            subscribeToNearby();
            subscribeInbox(function (fromPub, text) {
              if (state.chatWith === fromPub) {
                appendChatMessage(fromPub, text, false);
              } else {
                App.showToast(t('notifications_new_user') + ': ' + text.substring(0, 30));
              }
            });
            showScreen('screen-map');
            setStatus(t('map_status_online'));
            requestNotificationPermission();
          }).catch(function () {
            setStatus(t('status_location_error'));
          });
        });
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
    if (Notification.permission === 'granted') return;
    var hint = document.getElementById('notifications-hint');
    if (hint) hint.classList.remove('hidden');
  }

  function enableNotifications() {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission().then(function (p) {
      if (p === 'granted') {
        var hint = document.getElementById('notifications-hint');
        if (hint) hint.classList.add('hidden');
      }
    });
  }

  function refreshLabels() {
    if (document.title !== undefined && window.t) document.title = window.t('app_title');
  }

  function init() {
    ensureProfile();
    loadProfileIntoForm();
    applyLocale(refreshLabels);

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

    var btnEnter = $('btn-enter-map');
    if (btnEnter) btnEnter.addEventListener('click', goToMap);

    var btnBack = $('btn-back');
    if (btnBack) btnBack.addEventListener('click', backToStart);

    var btnProfile = $('btn-profile-map');
    if (btnProfile) {
      btnProfile.addEventListener('click', function () {
        showScreen('screen-start');
        loadProfileIntoForm();
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
