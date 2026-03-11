/**
 * IRLove – profile in localStorage (display name, age, height, avatar, availability tags).
 */
(function () {
  'use strict';
  var App = window.IRLove;
  var config = App.config;

  function getProfile() {
    try {
      var raw = localStorage.getItem(config.STORAGE_KEY_PROFILE);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function setProfile(profile) {
    try {
      localStorage.setItem(config.STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {}
  }

  function getDefaultProfile() {
    return {
      displayName: '',
      age: '',
      height: '',
      avatar: '👤',
      bio: '',
      status: '',
      tags: [],
      interests: []
    };
  }

  function ensureProfile() {
    var p = getProfile();
    if (p && typeof p.displayName === 'string') return p;
    var def = getDefaultProfile();
    setProfile(def);
    return def;
  }

  App.getProfile = getProfile;
  App.setProfile = setProfile;
  App.getDefaultProfile = getDefaultProfile;
  App.ensureProfile = ensureProfile;
})();
