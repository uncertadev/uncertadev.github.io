/**
 * Device-language i18n for uncerta.dev
 * First visit follows the device (tr / de / en).
 * A sessionStorage.lang override wins until the tab or browser is closed.
 */
(function () {
  var LANG_KEY = 'lang';
  try {
    localStorage.removeItem(LANG_KEY);
    localStorage.removeItem('theme');
  } catch (err) {}
  var SUPPORTED = ['en', 'de', 'tr'];
  var CODES = { en: 'EN', de: 'DE', tr: 'TR' };
  var BOX = 'inline-flex items-center justify-center min-w-[2.75rem] px-2.5 py-2 rounded-xl border font-mono text-xs font-semibold transition-colors ';
  var ACTIVE = BOX + 'border-cyan-500/40 bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-sm';
  var IDLE = BOX + 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400';
  var currentLang = null;

  function deviceLang() {
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

  function storedLang() {
    try {
      var value = sessionStorage.getItem(LANG_KEY);
      if (SUPPORTED.indexOf(value) !== -1) return value;
    } catch (err) {}
    return null;
  }

  function resolveLang() {
    return currentLang || storedLang() || deviceLang();
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
    currentLang = lang;
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

    syncSwitchers();
    document.documentElement.classList.add('i18n-ready');
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    currentLang = lang;
    try {
      sessionStorage.setItem(LANG_KEY, lang);
    } catch (err) {}
    closeAllMenus();
    apply();
  }

  function closeAllMenus() {
    document.querySelectorAll('[data-lang-switcher] .lang-switcher-menu').forEach(function (menu) {
      menu.classList.add('hidden');
    });
    document.querySelectorAll('[data-lang-switcher] .lang-switcher-btn').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function syncSwitchers() {
    var lang = resolveLang();
    var label = t('a11y.lang_switcher') || 'Change language';

    document.querySelectorAll('[data-lang-switcher]').forEach(function (root) {
      var btn = root.querySelector('.lang-switcher-btn');
      var code = root.querySelector('.lang-switcher-code');
      if (btn) {
        btn.setAttribute('aria-label', label);
      }
      if (code) {
        code.textContent = CODES[lang] || 'EN';
      }
      root.querySelectorAll('[data-lang]').forEach(function (option) {
        var active = option.getAttribute('data-lang') === lang;
        option.className = active ? ACTIVE : IDLE;
        option.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    });
  }

  window.UncertaI18n = {
    resolveLang: resolveLang,
    setLang: setLang,
    t: t,
    apply: apply
  };

  document.addEventListener('click', function (event) {
    var el = event.target;
    if (!el) return;
    if (el.nodeType !== 1) el = el.parentElement;
    if (!el || !el.closest) return;

    var option = el.closest('[data-lang-switcher] [data-lang]');
    if (option) {
      event.preventDefault();
      setLang(option.getAttribute('data-lang'));
      return;
    }

    var toggle = el.closest('.lang-switcher-btn');
    if (toggle) {
      event.preventDefault();
      var root = toggle.closest('[data-lang-switcher]');
      var menu = root && root.querySelector('.lang-switcher-menu');
      if (!menu) return;
      var willOpen = menu.classList.contains('hidden');
      closeAllMenus();
      if (willOpen) {
        menu.classList.remove('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
      return;
    }

    closeAllMenus();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAllMenus();
  });

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

  setTimeout(function () {
    document.documentElement.classList.add('i18n-ready');
  }, 1500);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeApply);
  } else {
    safeApply();
  }
})();
