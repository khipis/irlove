/**
 * Offline translator for NPC dialogue (free, no external API, no Hugging Face).
 * Uses UI language (getStoredLang): if PL → would translate input PL→EN for LLM, response EN→PL.
 * This version is pass-through only (no model fetch): no tokenizer.json, no auth, works fully offline.
 * To add real translation later: plug in Bergamot/Marian WASM or self-hosted models.
 */
(function () {
  'use strict';

  var DEBUG_PREFIX = '[Spacerek]';

  function log() {
    if (typeof console !== 'undefined' && console.debug) {
      var args = [].slice.call(arguments);
      args[0] = DEBUG_PREFIX + ' ' + (args[0] || '');
      console.debug.apply(console, args);
    }
  }

  /**
   * Translate Polish → English. Free offline: pass-through (no external model).
   */
  async function translateToEnglish(text) {
    if (!text || typeof text !== 'string') return '';
    var t = text.trim();
    if (!t.length) return '';
    log('PL→EN (pass-through, no model): "' + t + '"');
    return Promise.resolve(t);
  }

  /**
   * Translate English → Polish. Free offline: pass-through (no external model).
   */
  async function translateToPolish(text) {
    if (!text || typeof text !== 'string') return '';
    var t = text.trim();
    if (!t.length) return '';
    log('EN→PL (pass-through, no model): "' + t + '"');
    return Promise.resolve(t);
  }

  function detectPlayerInputLanguage(text) {
    if (!text || typeof text !== 'string') return 'en';
    if (/[ąęćłńóśźżĄĘĆŁŃÓŚŹŻ]/.test(text.trim())) return 'pl';
    return 'en';
  }

  if (typeof window !== 'undefined') {
    window.Spacerek = window.Spacerek || {};
    window.Spacerek.translatorIsPassThrough = true;
    window.Spacerek.detectPlayerInputLanguage = detectPlayerInputLanguage;
    window.Spacerek.translateToEnglish = translateToEnglish;
    window.Spacerek.translateToPolish = translateToPolish;
  }
})();
