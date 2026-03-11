/**
 * IRLove – apply locale (PL/EN), refresh labels.
 */
(function () {
  'use strict';
  var App = window.IRLove;

  function applyLocale(refresh) {
    var lang = window.CURRENT_LOCALE || (window.getStoredLang && window.getStoredLang()) || 'pl';
    document.documentElement.lang = lang === 'en' ? 'en' : 'pl';
    if (document.title !== undefined && window.t) document.title = window.t('app_title');
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key && window.t) el.textContent = window.t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (key && window.t) el.title = window.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key && window.t) el.placeholder = window.t(key);
    });
    if (typeof refresh === 'function') refresh();
  }

  App.applyLocale = applyLocale;
})();
