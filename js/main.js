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
  var MAX_INTERESTS = 10;
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
    var moodEl = $('profile-mood');
    var bioEl = $('profile-bio');
    var avatarPreview = $('profile-avatar-preview');
    var moodPreview = $('profile-mood-preview');
    if (nameEl) nameEl.value = p.displayName || '';
    if (ageEl) ageEl.value = p.age || '';
    if (heightEl) heightEl.value = p.height || '';
    var av = (p.avatar && p.avatar.trim()) ? p.avatar.trim() : '👤';
    if (avatarEl) avatarEl.value = av;
    if (avatarPreview) avatarPreview.textContent = av;
    var mo = (p.mood && p.mood.trim()) ? p.mood.trim() : '';
    if (moodEl) moodEl.value = mo;
    if (moodPreview) {
      moodPreview.textContent = mo || '—';
      moodPreview.classList.toggle('placeholder', !mo);
    }
    if (bioEl) bioEl.value = (p.bio || '').substring(0, config.BIO_MAX_LENGTH != null ? config.BIO_MAX_LENGTH : 110);
    var gender = (p.gender && p.gender.trim()) ? p.gender.trim() : '';
    document.querySelectorAll('.btn-gender').forEach(function (btn) {
      btn.classList.toggle('selected', btn.getAttribute('data-gender') === gender);
    });
    var tags = p.tags || [];
    if (typeof renderInterestsToolbox === 'function') renderInterestsToolbox();
    document.querySelectorAll('.btn-tag').forEach(function (btn) {
      var tag = btn.getAttribute('data-tag');
      btn.classList.toggle('selected', tags.indexOf(tag) >= 0);
    });
    if (typeof renderAvatarToolbox === 'function') renderAvatarToolbox();
    if (typeof renderMoodToolbox === 'function') renderMoodToolbox();
  }

  function saveProfileFromForm() {
    var nameEl = $('profile-display-name');
    var ageEl = $('profile-age');
    var heightEl = $('profile-height');
    var avatarEl = $('profile-avatar');
    var moodEl = $('profile-mood');
    var bioEl = $('profile-bio');
    var genderEl = document.querySelector('.btn-gender.selected');
    var gender = (genderEl && genderEl.getAttribute('data-gender')) ? genderEl.getAttribute('data-gender') : '';
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
    interests = interests.slice(0, MAX_INTERESTS);
    var p = {
      displayName: (nameEl && nameEl.value) ? nameEl.value.trim().substring(0, config.DISPLAY_NAME_MAX_LENGTH || 40) : '',
      age: (ageEl && ageEl.value) ? ageEl.value.trim() : '',
      height: (heightEl && heightEl.value) ? heightEl.value.trim() : '',
      gender: gender,
      avatar: (avatarEl && avatarEl.value) ? avatarEl.value.trim() : '👤',
      mood: (moodEl && moodEl.value) ? moodEl.value.trim() : '',
      bio: (bioEl && bioEl.value) ? bioEl.value.trim().substring(0, config.BIO_MAX_LENGTH || 110) : '',
      tags: tags,
      interests: interests
    };
    setProfile(p);
    state.profile = p;
    return p;
  }

  function updateInterestsSelectedDisplay() {
    var container = document.getElementById('interests-selected');
    if (!container) return;
    var interests = [];
    var box = document.getElementById('interests-toolbox');
    if (box && box.querySelectorAll) {
      box.querySelectorAll('.interest-btn.selected').forEach(function (btn) {
        var em = btn.getAttribute('data-emoji');
        if (em) interests.push(em);
      });
    } else {
      interests = ((getProfile() || {}).interests || []).slice(0, MAX_INTERESTS);
    }
    container.innerHTML = '';
    interests.forEach(function (emoji) {
      var span = document.createElement('span');
      span.className = 'interest-chip';
      span.textContent = emoji;
      span.setAttribute('aria-hidden', 'true');
      container.appendChild(span);
    });
  }

  function renderInterestsToolbox() {
    var box = document.getElementById('interests-toolbox');
    if (!box || !config.INTEREST_EMOJIS) return;
    box.innerHTML = '';
    var current = ((getProfile() || {}).interests || []).slice(0, MAX_INTERESTS);
    config.INTEREST_EMOJIS.forEach(function (emoji) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'interest-btn' + (current.indexOf(emoji) >= 0 ? ' selected' : '');
      btn.setAttribute('data-emoji', emoji);
      btn.textContent = emoji;
      btn.setAttribute('aria-label', 'Zainteresowanie ' + emoji);
      btn.addEventListener('click', function () {
        var selected = box.querySelectorAll('.interest-btn.selected').length;
        if (btn.classList.contains('selected')) {
          btn.classList.remove('selected');
        } else if (selected < MAX_INTERESTS) {
          btn.classList.add('selected');
        }
        updateInterestsSelectedDisplay();
        persistInterestsFromDOM();
      });
      box.appendChild(btn);
    });
    updateInterestsSelectedDisplay();
  }

  function persistInterestsFromDOM() {
    var box = document.getElementById('interests-toolbox');
    var interests = [];
    if (box && box.querySelectorAll) {
      box.querySelectorAll('.interest-btn.selected').forEach(function (btn) {
        var em = btn.getAttribute('data-emoji');
        if (em) interests.push(em);
      });
    }
    interests = interests.slice(0, MAX_INTERESTS);
    var p = getProfile() || ensureProfile();
    p = { displayName: p.displayName, age: p.age, height: p.height, gender: p.gender, avatar: p.avatar || '👤', mood: p.mood || '', bio: p.bio || '', status: p.status || '', tags: p.tags || [], interests: interests };
    setProfile(p);
    if (state.profile) state.profile.interests = interests;
  }

  function randomAvatar() {
    var list = config.AVATAR_EMOJIS || ['👤', '😊', '🌸', '🔥'];
    return list[Math.floor(Math.random() * list.length)];
  }

  function renderAvatarToolbox() {
    var grid = document.getElementById('avatar-toolbox-grid');
    var overlay = document.getElementById('avatar-toolbox');
    if (!grid || !config.AVATAR_EMOJIS) return;
    grid.innerHTML = '';
    var current = (getProfile() || {}).avatar || '👤';
    config.AVATAR_EMOJIS.forEach(function (emoji) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toolbox-btn' + (emoji === current ? ' selected' : '');
      btn.textContent = emoji;
      btn.setAttribute('aria-label', 'Avatar ' + emoji);
      btn.addEventListener('click', function () {
        grid.querySelectorAll('.toolbox-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        var avatarEl = $('profile-avatar');
        var preview = $('profile-avatar-preview');
        if (avatarEl) avatarEl.value = emoji;
        if (preview) preview.textContent = emoji;
        if (overlay) overlay.classList.add('hidden');
        saveProfileFromForm();
      });
      grid.appendChild(btn);
    });
  }

  function renderMoodToolbox() {
    var grid = document.getElementById('mood-toolbox-grid');
    var overlay = document.getElementById('mood-toolbox');
    if (!grid || !config.MOOD_EMOJIS) return;
    grid.innerHTML = '';
    var current = (getProfile() || {}).mood || '';
    config.MOOD_EMOJIS.forEach(function (emoji) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toolbox-btn' + (emoji === current ? ' selected' : '');
      btn.textContent = emoji;
      btn.setAttribute('aria-label', 'Humor ' + emoji);
      btn.addEventListener('click', function () {
        grid.querySelectorAll('.toolbox-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        var moodEl = $('profile-mood');
        var preview = $('profile-mood-preview');
        if (moodEl) moodEl.value = emoji;
        if (preview) { preview.textContent = emoji; preview.classList.remove('placeholder'); }
        if (overlay) overlay.classList.add('hidden');
        saveProfileFromForm();
      });
      grid.appendChild(btn);
    });
  }

  function randomMood() {
    var list = config.MOOD_EMOJIS || ['😀', '😊', '😌', '😐'];
    return list[Math.floor(Math.random() * list.length)];
  }

  function fillRandomProfile() {
    var names = ['Ania', 'Bartek', 'Kasia', 'Michał', 'Ola', 'Piotr', 'Zuza', 'Tomek', 'Nina', 'Kuba', 'User', 'Test'];
    var name = names[Math.floor(Math.random() * names.length)] + (Math.floor(Math.random() * 90) + 10);
    var age = 18 + Math.floor(Math.random() * 28);
    var height = 160 + Math.floor(Math.random() * 31);
    var avatar = randomAvatar();
    var mood = randomMood();
    var tagOpts = ['chat', 'date', 'beer', 'coffee', 'walk', 'sport'];
    var nTags = 1 + Math.floor(Math.random() * 3);
    var tags = [];
    for (var i = 0; i < nTags; i++) {
      var t = tagOpts[Math.floor(Math.random() * tagOpts.length)];
      if (tags.indexOf(t) < 0) tags.push(t);
    }
    var bios = ['Lubię kawę i rozmowy.', 'Szukam fajnych ludzi w okolicy.', 'Spontan i dobra zabawa.', 'Cenię spotkania na żywo.'];
    var bio = bios[Math.floor(Math.random() * bios.length)];
    var intList = (config.INTEREST_EMOJIS || []).slice();
    var nInt = Math.min(2 + Math.floor(Math.random() * 4), MAX_INTERESTS);
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
    var moodEl = $('profile-mood');
    var avatarPreview = $('profile-avatar-preview');
    var moodPreview = $('profile-mood-preview');
    if (nameEl) nameEl.value = name;
    if (ageEl) ageEl.value = String(age);
    if (heightEl) heightEl.value = String(height);
    if (avatarEl) avatarEl.value = avatar;
    if (avatarPreview) avatarPreview.textContent = avatar;
    if (moodEl) moodEl.value = mood;
    if (moodPreview) moodPreview.textContent = mood;
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
    if (typeof renderAvatarToolbox === 'function') renderAvatarToolbox();
    if (typeof renderMoodToolbox === 'function') renderMoodToolbox();
    saveProfileFromForm();
  }

  function goToMap() {
    var p = saveProfileFromForm();
    if (!p.displayName || !p.displayName.length) {
      App.showToast(t('error_no_profile'), 'error');
      return;
    }
    var ageNum = parseInt(p.age, 10);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 105) {
      App.showToast(t('error_age_invalid'), 'error');
      return;
    }
    var heightNum = parseInt(p.height, 10);
    if (isNaN(heightNum) || heightNum < 30 || heightNum > 240) {
      App.showToast(t('error_height_invalid'), 'error');
      return;
    }
    if (!p.avatar || !p.avatar.trim()) {
      p.avatar = randomAvatar();
      state.profile.avatar = p.avatar;
      setProfile(state.profile);
      var avatarEl = $('profile-avatar');
      var avatarPreview = $('profile-avatar-preview');
      if (avatarEl) avatarEl.value = p.avatar;
      if (avatarPreview) avatarPreview.textContent = p.avatar;
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
          var radiusKm = config.RADIUS_KM || 2;
          config.RADIUS_M = radiusKm * 1000;
          showScreen('screen-map');
          loadLeaflet().then(function () {
            initMap();
            if (state.map && state.userPosition) {
              state.map.invalidateSize();
              var c = state.userPosition;
              var R = (radiusKm * 1000) / 111320;
              var zoomFactor = 0.65;
              state.map.fitBounds([[c.lat - R * zoomFactor, c.lng - R * zoomFactor], [c.lat + R * zoomFactor, c.lng + R * zoomFactor]], { padding: [24, 24], maxZoom: 18 });
            }
            var statusInput = document.getElementById('map-status-input');
            if (statusInput) statusInput.value = p.status || '';
            setUserAvatar(p.avatar, p.tags, p.status);
            if (typeof App.addSimulatedUsers === 'function') App.addSimulatedUsers(state.userPosition, 2 + Math.floor(Math.random() * 2), radiusKm);
            setStatus(t('map_status_online'));
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

  function refreshLabels() {
    if (document.title !== undefined && window.t) document.title = window.t('app_title');
  }

  function init() {
    ensureProfile();
    loadProfileIntoForm();
    renderAvatarToolbox();
    renderMoodToolbox();
    applyLocale(refreshLabels);

    var avatarOverlay = $('avatar-toolbox');
    var avatarPreviewBtn = $('profile-avatar-preview');
    if (avatarPreviewBtn && avatarOverlay) {
      avatarPreviewBtn.addEventListener('click', function () { avatarOverlay.classList.remove('hidden'); });
    }
    var moodOverlay = $('mood-toolbox');
    var moodPreviewBtn = $('profile-mood-preview');
    if (moodPreviewBtn && moodOverlay) {
      moodPreviewBtn.addEventListener('click', function () { moodOverlay.classList.remove('hidden'); });
    }
    document.querySelectorAll('#avatar-toolbox .toolbox-close, #mood-toolbox .toolbox-close').forEach(function (closeBtn) {
      closeBtn.addEventListener('click', function () {
        var overlay = this.closest('.toolbox-overlay');
        if (overlay) overlay.classList.add('hidden');
      });
    });

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
        saveProfileFromForm();
      });
    });

    document.querySelectorAll('.btn-gender').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.btn-gender').forEach(function (b) { b.classList.remove('selected'); });
        this.classList.add('selected');
        saveProfileFromForm();
      });
    });

    var profileSaveTimeout;
    function debouncedSaveProfile() {
      clearTimeout(profileSaveTimeout);
      profileSaveTimeout = setTimeout(saveProfileFromForm, 400);
    }
    ['profile-display-name', 'profile-age', 'profile-height'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', debouncedSaveProfile);
        el.addEventListener('blur', saveProfileFromForm);
      }
    });

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
        if (typeof renderMoodToolbox === 'function') renderMoodToolbox();
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

    var mapStatusInput = document.getElementById('map-status-input');
    if (mapStatusInput) {
      var statusClearTimeout;
      var STATUS_VISIBLE_MS = 20000;
      function scheduleStatusClear() {
        clearTimeout(statusClearTimeout);
        statusClearTimeout = setTimeout(function () {
          var p = getProfile() || {};
          p.status = '';
          setProfile(p);
          state.profile = p;
          if (mapStatusInput) mapStatusInput.value = '';
          if (typeof setUserAvatar === 'function') setUserAvatar(p.avatar, p.tags, '');
        }, STATUS_VISIBLE_MS);
      }
      mapStatusInput.addEventListener('input', function () {
        var maxLen = config.STATUS_MAX_LENGTH || 55;
        var val = (this.value || '').substring(0, maxLen);
        if (this.value !== val) this.value = val;
        var p = getProfile() || {};
        p.status = (val || '').trim();
        setProfile(p);
        state.profile = p;
        if (typeof setUserAvatar === 'function') setUserAvatar(p.avatar, p.tags, p.status);
        if (p.status) scheduleStatusClear(); else clearTimeout(statusClearTimeout);
      });
    }

    var bioEl = document.getElementById('profile-bio');
    if (bioEl) {
      var bioMax = config.BIO_MAX_LENGTH != null ? config.BIO_MAX_LENGTH : 110;
      bioEl.setAttribute('maxlength', String(bioMax));
      bioEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); return false; }
      });
      bioEl.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' || e.which === 13) { e.preventDefault(); return false; }
      });
      function enforceBioMax() {
        var val = (bioEl.value || '').replace(/\r?\n/g, ' ').substring(0, bioMax);
        if (bioEl.value !== val) bioEl.value = val;
      }
      function persistBioToProfile() {
        var p = getProfile() || ensureProfile();
        p.bio = (bioEl.value || '').trim().replace(/\r?\n/g, ' ').substring(0, bioMax);
        setProfile(p);
        if (state.profile) state.profile.bio = p.bio;
      }
      var bioSaveTimeout;
      bioEl.addEventListener('input', function () {
        enforceBioMax();
        clearTimeout(bioSaveTimeout);
        bioSaveTimeout = setTimeout(persistBioToProfile, 400);
      });
      bioEl.addEventListener('paste', function () { setTimeout(enforceBioMax, 10); });
      bioEl.addEventListener('change', enforceBioMax);
      bioEl.addEventListener('blur', function () {
        enforceBioMax();
        persistBioToProfile();
      });
      enforceBioMax();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
