/**
 * Shared TankLogic chrome strings (nav + footer)
 * Merged into page packs via Object.assign before i18n apply.
 */
window.UNCERTA_I18N_SHARED = {
  en: {
    'nav.home': 'Uncerta Dev',
    'nav.features': 'Features',
    'nav.overview': 'System Overview',
    'nav.support': 'Support',
    'nav.privacy': 'Privacy Policy',
    'nav.terms': 'Terms of Use',
    'a11y.theme': 'Toggle Theme',
    'footer.rights': '© 2026 Uncerta Dev — TankLogic. All rights reserved.'
  },
  tr: {
    'nav.home': 'Uncerta Dev',
    'nav.features': 'Özellikler',
    'nav.overview': 'Sistem Özeti',
    'nav.support': 'Destek',
    'nav.privacy': 'Gizlilik Politikası',
    'nav.terms': 'Kullanım Koşulları',
    'a11y.theme': 'Temayı Değiştir',
    'footer.rights': '© 2026 Uncerta Dev — TankLogic. Tüm hakları saklıdır.'
  },
  de: {
    'nav.home': 'Uncerta Dev',
    'nav.features': 'Funktionen',
    'nav.overview': 'Systemübersicht',
    'nav.support': 'Support',
    'nav.privacy': 'Datenschutz',
    'nav.terms': 'Nutzungsbedingungen',
    'a11y.theme': 'Design umschalten',
    'footer.rights': '© 2026 Uncerta Dev — TankLogic. Alle Rechte vorbehalten.'
  }
};

window.mergeUncertaI18n = function (pagePack) {
  var shared = window.UNCERTA_I18N_SHARED || {};
  var out = { en: {}, tr: {}, de: {} };
  ['en', 'tr', 'de'].forEach(function (lang) {
    out[lang] = Object.assign({}, shared[lang] || {}, (pagePack && pagePack[lang]) || {});
  });
  window.UNCERTA_I18N = out;
};
