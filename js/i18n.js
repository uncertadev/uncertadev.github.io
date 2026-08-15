/**
 * Device-language i18n for uncerta.dev
 * First visit follows the device (tr / de / en).
 * A stored localStorage.lang override wins until the user changes it.
 */
(function () {
  var LANG_KEY = 'lang';
  var SUPPORTED = ['en', 'tr', 'de'];
  var CODES = { en: 'EN', tr: 'TR', de: 'DE' };
  var NAMES = { en: 'English', tr: 'Türkçe', de: 'Deutsch' };

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
      var value = localStorage.getItem(LANG_KEY);
      if (SUPPORTED.indexOf(value) !== -1) return value;
    } catch (err) {}
    return null;
  }

  function resolveLang() {
    return storedLang() || deviceLang();
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

    syncSwitchers();
    document.documentElement.classList.add('i18n-ready');
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (err) {}
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

  function optionClass(active) {
    return 'w-full text-left px-3 py-2 text-sm transition-colors ' +
      (active
        ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold'
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70');
  }

  function syncSwitchers() {
    var lang = resolveLang();
    var label = t('a11y.lang_switcher') || 'Change language';

    document.querySelectorAll('[data-lang-switcher]').forEach(function (root) {
      if (!root.getAttribute('data-bound')) {
        root.classList.add('relative');
        root.innerHTML =
          '<button type="button" class="lang-switcher-btn inline-flex items-center justify-center min-w-[2.75rem] px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all font-mono text-xs font-semibold tracking-wide" aria-haspopup="listbox" aria-expanded="false">' +
            CODES[lang] +
          '</button>' +
          '<div class="lang-switcher-menu hidden absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e17] shadow-lg py-1 z-[60]" role="listbox">' +
            SUPPORTED.map(function (code) {
              return '<button type="button" role="option" data-lang="' + code + '" class="' + optionClass(code === lang) + '">' + NAMES[code] + '</button>';
            }).join('') +
          '</div>';

        var btn = root.querySelector('.lang-switcher-btn');
        var menu = root.querySelector('.lang-switcher-menu');

        btn.addEventListener('click', function (event) {
          event.stopPropagation();
          var open = menu.classList.contains('hidden');
          closeAllMenus();
          if (open) {
            menu.classList.remove('hidden');
            btn.setAttribute('aria-expanded', 'true');
          }
        });

        menu.addEventListener('click', function (event) {
          var option = event.target.closest('[data-lang]');
          if (!option) return;
          event.stopPropagation();
          setLang(option.getAttribute('data-lang'));
          closeAllMenus();
        });

        root.setAttribute('data-bound', '1');
      }

      var btn = root.querySelector('.lang-switcher-btn');
      var menu = root.querySelector('.lang-switcher-menu');
      if (btn) {
        btn.textContent = CODES[lang];
        btn.setAttribute('aria-label', label);
      }
      if (menu) {
        menu.querySelectorAll('[data-lang]').forEach(function (option) {
          var code = option.getAttribute('data-lang');
          option.className = optionClass(code === lang);
          option.setAttribute('aria-selected', code === lang ? 'true' : 'false');
        });
      }
    });
  }

  window.UncertaI18n = {
    resolveLang: resolveLang,
    setLang: setLang,
    t: t,
    apply: apply
  };

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

  document.addEventListener('click', closeAllMenus);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAllMenus();
  });

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
