(function () {
  'use strict';

  var SW = (window.SW = window.SW || {});

  var translations = {
    de: {
      'app.tagline': 'Decke & Weide für dein Pferd',
      'nav.today': 'Heute',
      'nav.horses': 'Pferde verwalten',
      'nav.add': 'Pferd hinzufügen',
      'nav.aria': 'Hauptnavigation',

      'today.heading': 'Heute',
      'today.loading': 'Wetterdaten werden geladen…',
      'today.error': 'Wetterdaten konnten nicht geladen werden. Bitte später erneut versuchen.',
      'today.retry': 'Erneut versuchen',
      'today.empty.title': 'Noch keine Pferde angelegt',
      'today.empty.body': 'Lege dein erstes Pferd an, um tägliche Decken- und Weide-Empfehlungen zu erhalten.',
      'today.empty.cta': 'Pferd hinzufügen',
      'today.list.aria': 'Empfehlungen pro Pferd',

      'card.blanket': 'Decke',
      'card.grazing': 'Weide',
      'card.grazingWindow': 'Beste Zeit',
      'card.grazingTrend': '3-Tage-Trend',
      'trend.cycle': 'Frost & Sonne',
      'trend.soil': 'Boden gefroren',
      'blanket.no': 'Keine Decke',
      'blanket.light': 'Leichte Decke',
      'blanket.medium': 'Mittlere Decke',
      'blanket.heavy': 'Dicke Decke',
      'grazing.safe': 'Weide OK',
      'grazing.caution': 'Vorsicht',
      'grazing.risky': 'Kein Gras',

      'horses.heading': 'Pferde verwalten',
      'horses.subheading': 'Verwalte deine Pferde und ihre Eigenschaften.',
      'horses.add': '+ Pferd hinzufügen',
      'horses.list.aria': 'Pferdeliste',
      'horses.error': 'Pferde konnten nicht geladen werden.',
      'horses.empty.title': 'Noch keine Pferde angelegt',
      'horses.empty.body': 'Füge dein erstes Pferd hinzu, um loszulegen.',
      'horses.empty.cta': 'Pferd hinzufügen',
      'horses.delete': 'Löschen',
      'horses.tag.clipped': 'Geschoren',
      'horses.tag.sensitive': 'Empfindlich',
      'horses.confirmDelete': '{name} wirklich entfernen?',
      'risk.low': 'Risiko: Niedrig',
      'risk.medium': 'Risiko: Mittel',
      'risk.high': 'Risiko: Hoch',

      'new.heading': 'Neues Pferd',
      'new.subheading': 'Trage die Eigenschaften deines Pferdes ein.',
      'new.error.required': 'Bitte alle Pflichtfelder ausfüllen.',
      'new.field.name': 'Name',
      'new.field.namePlaceholder': 'z. B. Luna',
      'new.field.location': 'Standort des Stalls',
      'new.field.lat': 'Breitengrad',
      'new.field.lng': 'Längengrad',
      'new.useLocation': '📍 Aktuellen Standort verwenden',
      'new.locating': 'Standort wird ermittelt…',
      'new.field.props': 'Eigenschaften',
      'new.field.clipped': 'Geschoren',
      'new.field.sensitive': 'Empfindlich',
      'new.field.risk': 'Hufrehe-Risiko',
      'new.risk.aria': 'Hufrehe-Risiko',
      'new.risk.low': 'Niedrig',
      'new.risk.medium': 'Mittel',
      'new.risk.high': 'Hoch',
      'new.hint': 'Hoch = Hufrehe-Vorgeschichte, EMS oder Cushing. Mittel = leichtfutternd, Pony-Rasse, Übergewicht.',
      'new.cancel': 'Abbrechen',
      'new.save': 'Speichern',
      'new.error.name': 'Bitte einen Namen eingeben.',
      'new.error.location': 'Bitte den Standort ermitteln.',
      'new.error.geolocationUnsupported': 'Geolokalisierung wird nicht unterstützt.',
      'new.error.locationFailed': 'Standort konnte nicht ermittelt werden',
      'new.error.saveFailed': 'Speichern fehlgeschlagen.',

      'pageTitle.today': 'StallWetter — Heute',
      'pageTitle.horses': 'StallWetter — Pferde verwalten',
      'pageTitle.new': 'StallWetter — Neues Pferd',

      'lang.aria': 'Sprache',
    },
    en: {
      'app.tagline': 'Blanket & grazing advice for your horse',
      'nav.today': 'Today',
      'nav.horses': 'Manage horses',
      'nav.add': 'Add horse',
      'nav.aria': 'Main navigation',

      'today.heading': 'Today',
      'today.loading': 'Loading weather data…',
      'today.error': 'Could not load weather data. Please try again later.',
      'today.retry': 'Try again',
      'today.empty.title': 'No horses yet',
      'today.empty.body': 'Add your first horse to get daily blanket and grazing recommendations.',
      'today.empty.cta': 'Add horse',
      'today.list.aria': 'Recommendations per horse',

      'card.blanket': 'Blanket',
      'card.grazing': 'Grazing',
      'card.grazingWindow': 'Best time',
      'card.grazingTrend': '3-day trend',
      'trend.cycle': 'frost & sun',
      'trend.soil': 'soil frozen',
      'blanket.no': 'No blanket',
      'blanket.light': 'Light blanket',
      'blanket.medium': 'Medium blanket',
      'blanket.heavy': 'Heavy blanket',
      'grazing.safe': 'Grazing OK',
      'grazing.caution': 'Caution',
      'grazing.risky': 'No grazing',

      'horses.heading': 'Manage horses',
      'horses.subheading': 'Manage your horses and their attributes.',
      'horses.add': '+ Add horse',
      'horses.list.aria': 'Horse list',
      'horses.error': 'Could not load horses.',
      'horses.empty.title': 'No horses yet',
      'horses.empty.body': 'Add your first horse to get started.',
      'horses.empty.cta': 'Add horse',
      'horses.delete': 'Delete',
      'horses.tag.clipped': 'Clipped',
      'horses.tag.sensitive': 'Sensitive',
      'horses.confirmDelete': 'Really remove {name}?',
      'risk.low': 'Risk: Low',
      'risk.medium': 'Risk: Medium',
      'risk.high': 'Risk: High',

      'new.heading': 'New horse',
      'new.subheading': "Enter your horse's details.",
      'new.error.required': 'Please fill in all required fields.',
      'new.field.name': 'Name',
      'new.field.namePlaceholder': 'e.g. Luna',
      'new.field.location': 'Stable location',
      'new.field.lat': 'Latitude',
      'new.field.lng': 'Longitude',
      'new.useLocation': '📍 Use current location',
      'new.locating': 'Getting location…',
      'new.field.props': 'Attributes',
      'new.field.clipped': 'Clipped',
      'new.field.sensitive': 'Sensitive',
      'new.field.risk': 'Laminitis risk',
      'new.risk.aria': 'Laminitis risk',
      'new.risk.low': 'Low',
      'new.risk.medium': 'Medium',
      'new.risk.high': 'High',
      'new.hint': 'High = history of laminitis, EMS or Cushing. Medium = easy keeper, pony breed, overweight.',
      'new.cancel': 'Cancel',
      'new.save': 'Save',
      'new.error.name': 'Please enter a name.',
      'new.error.location': 'Please get the location first.',
      'new.error.geolocationUnsupported': 'Geolocation is not supported.',
      'new.error.locationFailed': 'Could not get location',
      'new.error.saveFailed': 'Could not save.',

      'pageTitle.today': 'StallWetter — Today',
      'pageTitle.horses': 'StallWetter — Manage horses',
      'pageTitle.new': 'StallWetter — New horse',

      'lang.aria': 'Language',
    },
  };

  var STORAGE_KEY = 'stallwetter:lang';
  var DEFAULT_LANG = 'de';
  var SUPPORTED = ['de', 'en'];
  var listeners = [];

  function getLang() {
    try {
      var stored = window.localStorage && localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.setAttribute('lang', lang);
    applyTranslations();
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](lang); } catch (e) {}
    }
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  function t(key, vars) {
    var lang = getLang();
    var dict = translations[lang] || translations[DEFAULT_LANG];
    var s = dict[key];
    if (s == null) s = translations[DEFAULT_LANG][key];
    if (s == null) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(vars[k]);
      });
    }
    return s;
  }

  function applyTranslations() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = t(els[i].getAttribute('data-i18n'));
    }
    var phs = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < phs.length; j++) {
      phs[j].setAttribute('placeholder', t(phs[j].getAttribute('data-i18n-placeholder')));
    }
    var ar = document.querySelectorAll('[data-i18n-aria-label]');
    for (var k = 0; k < ar.length; k++) {
      ar[k].setAttribute('aria-label', t(ar[k].getAttribute('data-i18n-aria-label')));
    }

    var page = document.body && document.body.dataset && document.body.dataset.page;
    if (page) {
      var titleKey = 'pageTitle.' + page;
      var ts = t(titleKey);
      if (ts !== titleKey) document.title = ts;
    }

    var btns = document.querySelectorAll('[data-lang-btn]');
    var current = getLang();
    for (var n = 0; n < btns.length; n++) {
      if (btns[n].getAttribute('data-lang-btn') === current) {
        btns[n].classList.add('lang-btn--active');
        btns[n].setAttribute('aria-pressed', 'true');
      } else {
        btns[n].classList.remove('lang-btn--active');
        btns[n].setAttribute('aria-pressed', 'false');
      }
    }
  }

  function initSwitcher() {
    var btns = document.querySelectorAll('[data-lang-btn]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          setLang(btn.getAttribute('data-lang-btn'));
        });
      })(btns[i]);
    }
    document.documentElement.setAttribute('lang', getLang());
    applyTranslations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwitcher);
  } else {
    initSwitcher();
  }

  SW.i18n = {
    t: t,
    getLang: getLang,
    setLang: setLang,
    onChange: onChange,
    applyTranslations: applyTranslations,
  };
})();
