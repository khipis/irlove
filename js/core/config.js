/**
 * IRLove – app configuration.
 */
(function () {
  'use strict';
  if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }
  window.IRLove = window.IRLove || {};
  window.IRLove.config = {
    RADIUS_KM: 2,
    RADIUS_M: 2000,
    RADIUS_KM_DEFAULT: 2,
    STATUS_MAX_LENGTH: 120,
    BIO_MAX_LENGTH: 200,
    INTERESTS_MAX: 5,
    LOCATION_UPDATE_MS: 5000,
    ACTIVE_THRESHOLD_MS: 15000,
    STORAGE_KEY_PROFILE: 'irlove_profile',
    STORAGE_KEY_LANG: 'irlove_lang',
    STORAGE_KEY_THEME: 'irlove_theme',
    RELAY_URL: null,
    AVAILABILITY_TAGS: ['chat', 'date', 'beer'],
    TAG_EMOJI: { chat: '💬', date: '❤️', beer: '🍺' },
    AVATAR_EMOJIS: [
      '👤',
      '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿',
      '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿',
      '👶🏻', '👶🏼', '👶🏽', '👶🏾', '👶🏿',
      '😀', '😃', '😄', '😊', '🙂', '🤗', '😁', '🥰', '😌', '😇', '🙃', '😉'
    ],
    INTEREST_EMOJIS: ['🎵', '🎮', '📚', '☕', '🍕', '🎬', '🏃', '✈️', '🎨', '📷', '🐕', '🌸', '⚽', '🎸', '🍺', '🎧', '🧘', '🛹', '🎲', '📖', '🌿', '🍳', '🎤', '🖼️', '🏋️', '🚴', '🎯', '💻']
  };
  if (typeof window.IRLOVE_RELAY_URL === 'string' && window.IRLOVE_RELAY_URL) {
    window.IRLove.config.RELAY_URL = window.IRLOVE_RELAY_URL;
  }
})();
