/**
 * Lokalizacja UI: applyLocale, instrukcja zasięgu, odświeżanie etykiet.
 */
(function () {
  'use strict';
  var Sp = window.Spacerek;
  var state = Sp.state;

  function t(key, replacements) {
    return window.t ? window.t(key, replacements) : key;
  }

  function updateDistanceInstruction() {
    var el = document.getElementById('instruction-distance');
    if (!el) return;
    el.textContent = (state.mapStyle === 'noir' ? t('start_instruction_world_size') : t('start_instruction_distance'));
  }

  function applyLocale(refreshDynamicLabels) {
    var lang = window.CURRENT_LOCALE || 'pl';
    document.documentElement.lang = lang === 'en' ? 'en' : 'pl';
    if (document.title !== undefined) document.title = t('app_title');
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (key) el.title = t(key);
    });
    var sel = document.getElementById('map-style-select');
    if (sel) {
      [].slice.call(sel.options).forEach(function (opt) {
        var key = 'mode_' + opt.value;
        if (window.t && window.t(key) !== key) opt.textContent = window.t(key);
      });
    }
    updateDistanceInstruction();
    if (typeof refreshDynamicLabels === 'function') refreshDynamicLabels();
  }

  Sp.updateDistanceInstruction = updateDistanceInstruction;
  Sp.applyLocale = applyLocale;
})();
