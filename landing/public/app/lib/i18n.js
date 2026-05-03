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
      'blanket.reason.tMin': 'Min {v} °C',
      'blanket.reason.wind': 'Wind {v} km/h',
      'blanket.reason.rain': 'Regen {v} mm',
      'blanket.reason.sensitive': 'empfindliches Pferd',
      'blanket.reason.feltLike': 'gefühlt {v} °C',
      'grazing.reason.normal': 'Bedingungen normal, kein Fruktan-Anstieg erwartet',
      'grazing.reason.elevated': 'Erhöhte Zucker-Faktoren',
      'grazing.reason.multipleFactors': 'Mehrere Zucker-Faktoren – lieber Paddock + Heu',
      'grazing.reason.hardStop': 'Hufrehe-Risiko + Fruktan-Stress → kein Gras heute',
      'grazing.reason.cycles.many': 'Mehrtägige Frost-Sonne-Zyklen',
      'grazing.reason.cycles.one': 'Frost-Sonne gestern',
      'grazing.reason.frostNight': 'Frost in der Nacht',
      'grazing.reason.sunny': 'Sonniger Tag',
      'grazing.reason.soilFrozen': 'Boden gefroren – kein Zuckerabbau',
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
      'pageTitle.blanket': 'StallWetter — Decken-Empfehlung',
      'pageTitle.grazing': 'StallWetter — Weide-Empfehlung',

      'lang.aria': 'Sprache',

      'detail.back': '← Zurück',
      'detail.notFound': 'Pferd nicht gefunden.',
      'detail.loading': 'Wetterdaten werden geladen…',

      'detail.blanket.heading': 'Decken-Empfehlung',
      'detail.grazing.heading': 'Weide-Empfehlung',

      'detail.summary.heading': 'Heute',
      'detail.summary.felt': 'Gefühlt {v} °C',
      'detail.summary.minMax': 'Min {min} °C / Max {max} °C',
      'detail.summary.wind': 'Wind bis {v} km/h',
      'detail.summary.rain': 'Regen {v} mm',

      'detail.gramaj.heading': 'Welche Decke?',
      'detail.gramaj.none': 'Keine Decke nötig',
      'detail.gramaj.light': '100 g – leichte Übergangsdecke',
      'detail.gramaj.medium': '200 g – mittlere Decke',
      'detail.gramaj.heavy': '300 g – dicke Winterdecke',
      'detail.gramaj.hint': 'Faustregel: Füllgewicht in g/m²',

      'detail.tomorrow.heading': 'Morgen',
      'detail.tomorrow.same': 'Morgen ähnlich, gleiche Empfehlung.',
      'detail.tomorrow.warmer': 'Morgen wärmer – {to} reicht.',
      'detail.tomorrow.colder': 'Morgen kälter – auf {to} wechseln.',
      'detail.tomorrow.unknown': 'Morgen-Daten noch nicht verfügbar.',

      'detail.hourly.heading': 'Tagesverlauf',
      'detail.hourly.morning': 'Morgen',
      'detail.hourly.noon': 'Mittag',
      'detail.hourly.evening': 'Abend',
      'detail.hourly.night': 'Nacht',
      'detail.hourly.morningRange': '06–12 Uhr',
      'detail.hourly.noonRange': '12–15 Uhr',
      'detail.hourly.eveningRange': '15–21 Uhr',
      'detail.hourly.nightRange': '21–06 Uhr',
      'detail.hourly.noData': '—',

      'detail.window.heading': 'Beste Zeit zum Grasen',
      'detail.window.none': 'Heute kein gutes Fenster',

      'detail.risk.heading': 'Stündliches Risiko (heute)',
      'detail.risk.legend.safe': 'OK',
      'detail.risk.legend.caution': 'Vorsicht',
      'detail.risk.legend.risky': 'Risiko',
      'detail.risk.noData': 'Stündliche Daten nicht verfügbar.',

      'detail.trend.heading': '3-Tage-Trend',
      'detail.trend.day.yesterday': 'Gestern',
      'detail.trend.day.today': 'Heute',
      'detail.trend.day.tomorrow': 'Morgen',

      'detail.action.blanket': 'Decke aufgelegt',
      'detail.action.blanketDone': 'Eingetragen ✓',
      'detail.action.grazing': 'Aufs Gras gestellt',
      'detail.action.grazingDone': 'Eingetragen ✓',
      'detail.elapsed.blanket.minutes': 'Decke vor {m} min aufgelegt',
      'detail.elapsed.blanket.full': 'Decke seit {h} h {m} min',
      'detail.elapsed.grazing.minutes': 'Auf der Weide seit {m} min',
      'detail.elapsed.grazing.full': 'Auf der Weide seit {h} h {m} min',

      'detail.area.heading': 'Wo gegrast?',
      'detail.area.track': 'Track / Paddock-Pfad',
      'detail.area.dryLot': 'Paddock (kein Gras)',
      'detail.area.pasture': 'Normale Weide',

      'detail.editHorse': 'Pferd bearbeiten',
      'detail.why.heading': 'Warum diese Empfehlung?',
      'detail.why.show': 'Details anzeigen',
      'detail.why.hide': 'Details ausblenden',
      'detail.why.profile': 'Pferdeprofil',
      'detail.why.profile.clipped': 'geschoren',
      'detail.why.profile.unclipped': 'ungeschoren',
      'detail.why.profile.sensitive': 'empfindlich',
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
      'blanket.reason.tMin': 'Min {v} °C',
      'blanket.reason.wind': 'Wind {v} km/h',
      'blanket.reason.rain': 'Rain {v} mm',
      'blanket.reason.sensitive': 'sensitive horse',
      'blanket.reason.feltLike': 'feels like {v} °C',
      'grazing.reason.normal': 'Normal conditions, no fructan rise expected',
      'grazing.reason.elevated': 'Elevated sugar factors',
      'grazing.reason.multipleFactors': 'Multiple sugar factors – prefer paddock + hay',
      'grazing.reason.hardStop': 'Laminitis risk + fructan stress → no grazing today',
      'grazing.reason.cycles.many': 'Multi-day frost-and-sun cycles',
      'grazing.reason.cycles.one': 'Frost + sun yesterday',
      'grazing.reason.frostNight': 'Frost overnight',
      'grazing.reason.sunny': 'Sunny day',
      'grazing.reason.soilFrozen': 'Soil frozen – no sugar drop',
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
      'pageTitle.blanket': 'StallWetter — Blanket recommendation',
      'pageTitle.grazing': 'StallWetter — Grazing recommendation',

      'lang.aria': 'Language',

      'detail.back': '← Back',
      'detail.notFound': 'Horse not found.',
      'detail.loading': 'Loading weather data…',

      'detail.blanket.heading': 'Blanket recommendation',
      'detail.grazing.heading': 'Grazing recommendation',

      'detail.summary.heading': 'Today',
      'detail.summary.felt': 'Feels like {v} °C',
      'detail.summary.minMax': 'Min {min} °C / Max {max} °C',
      'detail.summary.wind': 'Wind up to {v} km/h',
      'detail.summary.rain': 'Rain {v} mm',

      'detail.gramaj.heading': 'Which blanket?',
      'detail.gramaj.none': 'No blanket needed',
      'detail.gramaj.light': '100 g – light transitional blanket',
      'detail.gramaj.medium': '200 g – medium blanket',
      'detail.gramaj.heavy': '300 g – heavy winter blanket',
      'detail.gramaj.hint': 'Rule of thumb: fill weight in g/m²',

      'detail.tomorrow.heading': 'Tomorrow',
      'detail.tomorrow.same': 'Tomorrow similar, same recommendation.',
      'detail.tomorrow.warmer': 'Tomorrow warmer – {to} is enough.',
      'detail.tomorrow.colder': 'Tomorrow colder – switch to {to}.',
      'detail.tomorrow.unknown': 'Tomorrow data not available yet.',

      'detail.hourly.heading': 'Through the day',
      'detail.hourly.morning': 'Morning',
      'detail.hourly.noon': 'Noon',
      'detail.hourly.evening': 'Evening',
      'detail.hourly.night': 'Night',
      'detail.hourly.morningRange': '06–12',
      'detail.hourly.noonRange': '12–15',
      'detail.hourly.eveningRange': '15–21',
      'detail.hourly.nightRange': '21–06',
      'detail.hourly.noData': '—',

      'detail.window.heading': 'Best time to graze',
      'detail.window.none': 'No good window today',

      'detail.risk.heading': 'Hourly risk (today)',
      'detail.risk.legend.safe': 'OK',
      'detail.risk.legend.caution': 'Caution',
      'detail.risk.legend.risky': 'Risk',
      'detail.risk.noData': 'Hourly data not available.',

      'detail.trend.heading': '3-day trend',
      'detail.trend.day.yesterday': 'Yesterday',
      'detail.trend.day.today': 'Today',
      'detail.trend.day.tomorrow': 'Tomorrow',

      'detail.action.blanket': 'Blanket put on',
      'detail.action.blanketDone': 'Logged ✓',
      'detail.action.grazing': 'Sent to grass',
      'detail.action.grazingDone': 'Logged ✓',
      'detail.elapsed.blanket.minutes': 'Blanket on {m} min ago',
      'detail.elapsed.blanket.full': 'Blanket on for {h} h {m} min',
      'detail.elapsed.grazing.minutes': 'On pasture {m} min',
      'detail.elapsed.grazing.full': 'On pasture {h} h {m} min',

      'detail.area.heading': 'Where grazing?',
      'detail.area.track': 'Track / paddock path',
      'detail.area.dryLot': 'Dry lot (no grass)',
      'detail.area.pasture': 'Normal pasture',

      'detail.editHorse': 'Edit horse',
      'detail.why.heading': 'Why this recommendation?',
      'detail.why.show': 'Show details',
      'detail.why.hide': 'Hide details',
      'detail.why.profile': 'Horse profile',
      'detail.why.profile.clipped': 'clipped',
      'detail.why.profile.unclipped': 'unclipped',
      'detail.why.profile.sensitive': 'sensitive',
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
