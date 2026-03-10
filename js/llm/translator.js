/**
 * Offline translator for NPC dialogue (Marian MT / Opus-MT via Transformers.js).
 * Uses UI language (getStoredLang): if PL → translate input PL→EN for LLM, response EN→PL for display.
 * Logs to console.debug so you can see what is sent to LLM and what is shown (filter by "Spacerek").
 */
(function () {
  'use strict';

  var TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0';
  var MODEL_PL_EN = 'Xenova/opus-mt-pl-en';
  var MODEL_EN_PL = 'Helsinki-NLP/opus-mt-en-pl';
  var DEBUG_PREFIX = '[Spacerek]';

  var plEnPipe = null;
  var enPlPipe = null;
  var plEnLoadPromise = null;
  var enPlLoadPromise = null;

  function log() {
    if (typeof console !== 'undefined' && console.debug) {
      var args = [].slice.call(arguments);
      args[0] = DEBUG_PREFIX + ' ' + (args[0] || '');
      console.debug.apply(console, args);
    }
  }

  function loadPlEn() {
    if (plEnLoadPromise) return plEnLoadPromise;
    plEnLoadPromise = import(/* webpackIgnore: true */ TRANSFORMERS_CDN)
      .then(function (mod) {
        var pipeline = mod.pipeline || (mod.default && mod.default.pipeline);
        if (!pipeline) throw new Error('pipeline not found');
        return pipeline('translation', MODEL_PL_EN, { progress_callback: null });
      })
      .then(function (pipe) {
        plEnPipe = pipe;
        log('Translator PL→EN załadowany (Opus-MT)');
        return pipe;
      })
      .catch(function (err) {
        log('Translator PL→EN load failed', err);
        plEnLoadPromise = null;
        return null;
      });
    return plEnLoadPromise;
  }

  function loadEnPl() {
    if (enPlLoadPromise) return enPlLoadPromise;
    enPlLoadPromise = import(/* webpackIgnore: true */ TRANSFORMERS_CDN)
      .then(function (mod) {
        var pipeline = mod.pipeline || (mod.default && mod.default.pipeline);
        if (!pipeline) throw new Error('pipeline not found');
        return pipeline('translation', MODEL_EN_PL, { progress_callback: null });
      })
      .then(function (pipe) {
        enPlPipe = pipe;
        log('Translator EN→PL załadowany (Opus-MT)');
        return pipe;
      })
      .catch(function (err) {
        log('Translator EN→PL load failed', err);
        enPlLoadPromise = null;
        return null;
      });
    return enPlLoadPromise;
  }

  /**
   * Translate Polish → English (Marian/Opus-MT via Transformers.js).
   * Used as pre-processing before sending to LLM.
   */
  async function translateToEnglish(text) {
    if (!text || typeof text !== 'string') return '';
    var t = text.trim();
    if (!t.length) return '';
    try {
      var pipe = await loadPlEn();
      if (!pipe) return t;
      var out = await pipe(t, { max_length: 150 });
      var result = (out && Array.isArray(out) && out[0] && out[0].translation_text) ? out[0].translation_text : (typeof out === 'string' ? out : t);
      log('PL→EN: "' + t + '" → "' + result + '"');
      return result;
    } catch (e) {
      log('PL→EN error', e);
      return t;
    }
  }

  /**
   * Translate English → Polish (Marian/Opus-MT via Transformers.js).
   * Used as post-processing of LLM response when UI language is Polish.
   */
  async function translateToPolish(text) {
    if (!text || typeof text !== 'string') return '';
    var t = text.trim();
    if (!t.length) return '';
    try {
      var pipe = await loadEnPl();
      if (!pipe) return t;
      var out = await pipe(t, { max_length: 150 });
      var result = (out && Array.isArray(out) && out[0] && out[0].translation_text) ? out[0].translation_text : (typeof out === 'string' ? out : t);
      log('EN→PL: "' + t + '" → "' + result + '"');
      return result;
    } catch (e) {
      log('EN→PL error', e);
      return t;
    }
  }

  /**
   * Kept for optional use; dialogue flow uses UI language (getStoredLang) instead.
   */
  function detectPlayerInputLanguage(text) {
    if (!text || typeof text !== 'string') return 'en';
    var polish = /[ąęćłńóśźżĄĘĆŁŃÓŚŹŻ]/;
    if (polish.test(text.trim())) return 'pl';
    return 'en';
  }

  if (typeof window !== 'undefined') {
    window.Spacerek = window.Spacerek || {};
    window.Spacerek.detectPlayerInputLanguage = detectPlayerInputLanguage;
    window.Spacerek.translateToEnglish = translateToEnglish;
    window.Spacerek.translateToPolish = translateToPolish;
  }
})();
