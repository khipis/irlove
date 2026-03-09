/**
 * App entry point: init, event binding, label refresh.
 */
(function () {
  'use strict';
  var Sp = window.Spacerek;
  if (!Sp || !Sp.state || !Sp.$) {
    var tip = 'Nie załadowano wszystkich plików. Otwórz aplikację przez serwer (w folderze projektu: python3 -m http.server 8000, potem http://localhost:8000).';
    if (typeof document !== 'undefined' && document.body) {
      var div = document.createElement('div');
      div.style.cssText = 'position:fixed;inset:0;background:#1a1a2e;color:#e8e4de;padding:2rem;font-family:sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;z-index:99999;';
      div.textContent = tip;
      document.body.appendChild(div);
    } else {
      alert(tip);
    }
    return;
  }
  var state = Sp.state;
  var $ = Sp.$;
  var getStoredTheme = Sp.getStoredTheme;
  var setStoredTheme = Sp.setStoredTheme;
  var clearStorage = Sp.clearStorage;
  var applyLocale = Sp.applyLocale;
  var updateDistanceInstruction = Sp.updateDistanceInstruction;
  var applyTheme = Sp.applyTheme;
  var applyMapStyle = Sp.applyMapStyle;
  var renderExperiencePanel = Sp.renderExperiencePanel;
  var openExperiencePanel = Sp.openExperiencePanel;
  var closeExperiencePanel = Sp.closeExperiencePanel;
  var updateDistanceHint = Sp.updateDistanceHint;
  var updateDebugPanel = Sp.updateDebugPanel;
  var updateRevealButton = Sp.updateRevealButton;
  var backToMap = Sp.backToMap;
  var resetWalk = Sp.resetWalk;
  var showWalkStats = Sp.showWalkStats;
  var startWalk = Sp.startWalk;
  var simulateArrival = Sp.simulateArrival;

  function t(key, replacements) {
    return window.t ? window.t(key, replacements) : key;
  }

  function refreshDynamicLabels() {
    var userEl = document.querySelector('.user-marker-fun');
    if (userEl) userEl.title = t('tooltip_you_short');
    if (state.userMarker) {
      var userTip = state.userMarker.getTooltip && state.userMarker.getTooltip();
      if (userTip) userTip.setContent(t('tooltip_you'));
    }
    if (state.targetMarkers && state.targetMarkers.length) {
      state.targetMarkers.forEach(function (m) {
        var tip = m.getTooltip && m.getTooltip();
        var tierKey = m._tier ? 'tier_' + m._tier : 'tier_epic';
        if (tip) tip.setContent(t(tierKey));
      });
    }
    if (state.visitedMarkers && state.visitedMarkers.length) {
      state.visitedMarkers.forEach(function (m) {
        var tip = m.getTooltip && m.getTooltip();
        if (tip && m._placeName) tip.setContent(m._placeName + t('tooltip_visited'));
      });
    }
    updateDistanceHint();
    updateDebugPanel();
    updateRevealButton();
    renderExperiencePanel();
  }

  function initStartScreen() {
    var btnStart = $('btn-start');
    var buttons = document.querySelectorAll('.btn-distance');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        state.selectedKm = parseFloat(btn.getAttribute('data-km'));
        btnStart.disabled = false;
      });
    });
    var defaultKmBtn = document.querySelector('.btn-distance[data-km="1.9"]');
    if (defaultKmBtn) {
      buttons.forEach(function (b) { b.classList.remove('selected'); });
      defaultKmBtn.classList.add('selected');
      btnStart.disabled = false;
    }

    var styleButtons = document.querySelectorAll('.btn-map-style');
    function updateMapStyleSelection() {
      styleButtons.forEach(function (b) {
        b.classList.toggle('selected', b.getAttribute('data-style') === state.mapStyle);
      });
    }
    styleButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.mapStyle = btn.getAttribute('data-style') || 'adventure';
        setStoredTheme(state.mapStyle);
        updateMapStyleSelection();
        applyTheme();
        updateDistanceInstruction();
      });
    });
    updateMapStyleSelection();

    var numInput = document.getElementById('num-attractions');
    var numValue = document.getElementById('num-attractions-value');
    if (numInput && numValue) {
      numInput.value = state.numAttractions;
      numValue.textContent = state.numAttractions;
      numInput.addEventListener('input', function () {
        state.numAttractions = Math.min(10, Math.max(1, parseInt(numInput.value, 10) || 5));
        numInput.value = state.numAttractions;
        numValue.textContent = state.numAttractions;
      });
    }

    btnStart.addEventListener('click', function () {
      if (state.selectedKm == null) return;
      startWalk();
    });
  }

  function init() {
    state.mapStyle = getStoredTheme();
    applyLocale(refreshDynamicLabels);
    applyTheme();

    document.querySelectorAll('.btn-lang').forEach(function (b) {
      b.classList.toggle('selected', b.getAttribute('data-lang') === (window.CURRENT_LOCALE || 'pl'));
    });
    document.querySelectorAll('.btn-lang').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        if (!lang || !window.LOCALES || !window.LOCALES[lang]) return;
        window.CURRENT_LOCALE = lang;
        if (window.setStoredLang) window.setStoredLang(lang);
        applyLocale(refreshDynamicLabels);
        document.querySelectorAll('.btn-lang').forEach(function (b) {
          b.classList.toggle('selected', b.getAttribute('data-lang') === lang);
        });
      });
    });

    var btnReveal = $('btn-reveal-action');
    if (btnReveal) {
      btnReveal.addEventListener('click', function () {
        var collected = Object.keys(state.collectedIndices).length;
        if (collected < state.targetPlaces.length) {
          backToMap();
        } else {
          showWalkStats();
        }
      });
    }

    function closeStatsAndReset() {
      var overlay = document.getElementById('stats-overlay');
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
      }
      resetWalk();
    }
    var btnStatsClose = $('btn-stats-close');
    var btnStatsFinish = $('btn-stats-finish');
    if (btnStatsClose) btnStatsClose.addEventListener('click', closeStatsAndReset);
    if (btnStatsFinish) btnStatsFinish.addEventListener('click', closeStatsAndReset);

    var btnDebug = $('btn-debug-toggle');
    if (btnDebug) {
      btnDebug.addEventListener('click', function () {
        var panel = $('debug-panel');
        if (panel) panel.classList.toggle('debug-open');
      });
    }

    var btnSimulate = $('btn-simulate-arrival');
    if (btnSimulate) btnSimulate.addEventListener('click', simulateArrival);

    var styleSelect = document.getElementById('map-style-select');
    if (styleSelect) {
      styleSelect.addEventListener('change', function () {
        state.mapStyle = styleSelect.value || 'adventure';
        setStoredTheme(state.mapStyle);
        applyMapStyle();
      });
    }

    initStartScreen();

    var btnExp = $('btn-experience');
    var btnExpMap = $('btn-experience-map');
    if (btnExp) btnExp.addEventListener('click', openExperiencePanel);
    if (btnExpMap) btnExpMap.addEventListener('click', openExperiencePanel);
    var btnExpClose = $('btn-experience-close');
    if (btnExpClose) btnExpClose.addEventListener('click', closeExperiencePanel);
    var btnClear = $('btn-clear-storage');
    if (btnClear) {
      btnClear.addEventListener('click', function () {
        clearStorage(renderExperiencePanel);
        closeExperiencePanel();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
