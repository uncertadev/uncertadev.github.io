/**
 * Device-language i18n for uncerta.dev
 * tr → Turkish, de → German, otherwise English
 */
(function () {
  function resolveLang() {
    var list = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || 'en'];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i] || '').toLowerCase();
      if (code.startsWith('tr')) return 'tr';
      if (code.startsWith('de')) return 'de';
    }
    return 'en';
  }

  function dict() {
    var pack = window.UNCERTA_I18N || {};
    var lang = resolveLang();
    return pack[lang] || pack.en || {};
  }

  function t(key) {
    var d = dict();
    var en = (window.UNCERTA_I18N && window.UNCERTA_I18N.en) || {};
    if (d[key] != null && d[key] !== '') return d[key];
    if (en[key] != null) return en[key];
    return null;
  }

  function apply() {
    var lang = resolveLang();
    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val == null) return;
      el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      var val = t(key);
      if (val == null) return;
      el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var spec = el.getAttribute('data-i18n-attr');
      if (!spec) return;
      spec.split(';').forEach(function (part) {
        var bits = part.split(':');
        if (bits.length < 2) return;
        var attr = bits[0].trim();
        var key = bits.slice(1).join(':').trim();
        var val = t(key);
        if (val == null) return;
        el.setAttribute(attr, val);
      });
    });

    var titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey) {
      var titleVal = t(titleKey);
      if (titleVal) document.title = titleVal;
    }

    var descEl = document.querySelector('meta[name="description"][data-i18n-content]');
    if (descEl) {
      var descVal = t(descEl.getAttribute('data-i18n-content'));
      if (descVal) descEl.setAttribute('content', descVal);
    }

    document.documentElement.classList.add('i18n-ready');
  }

  window.UncertaI18n = { resolveLang: resolveLang, t: t, apply: apply };

  function safeApply() {
    try {
      apply();
    } catch (err) {
      document.documentElement.classList.add('i18n-ready');
      if (typeof console !== 'undefined' && console.error) {
        console.error('UncertaI18n apply failed', err);
      }
    }
  }

  // Never leave the page blank if apply stalls
  setTimeout(function () {
    document.documentElement.classList.add('i18n-ready');
  }, 1500);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeApply);
  } else {
    safeApply();
  }
})();
