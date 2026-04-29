// Page-aware controller for StallWetter web.
(function () {
  'use strict';

  var BLANKET_LABEL = {
    no: 'Keine Decke',
    light: 'Leichte Decke',
    medium: 'Mittlere Decke',
    heavy: 'Dicke Decke',
  };
  var BLANKET_BADGE_CLASS = {
    no: 'badge-blanket-no',
    light: 'badge-blanket-light',
    medium: 'badge-blanket-medium',
    heavy: 'badge-blanket-heavy',
  };
  var GRAZING_LABEL = {
    safe: 'Weide OK',
    caution: 'Vorsicht',
    risky: 'Kein Gras',
  };
  var GRAZING_BADGE_CLASS = {
    safe: 'badge-grazing-safe',
    caution: 'badge-grazing-caution',
    risky: 'badge-grazing-risky',
  };
  var RISK_LABEL = {
    low: 'Risiko: Niedrig',
    medium: 'Risiko: Mittel',
    high: 'Risiko: Hoch',
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute('hidden', '');
    else el.removeAttribute('hidden');
  }

  function formatDateDe(d) {
    try {
      return d.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return d.toDateString();
    }
  }

  // ---------- Heute (index.html) ----------
  function initToday() {
    var dateEl = $('#today-date');
    if (dateEl) dateEl.textContent = formatDateDe(new Date());

    var loading = $('#loading');
    var errorState = $('#error-state');
    var emptyState = $('#empty-state');
    var listSection = $('#recommendations-list');
    var template = $('#horse-recommendation-template');

    function clearCards() {
      if (!listSection) return;
      var cards = listSection.querySelectorAll('article.horse-card');
      for (var i = 0; i < cards.length; i++) cards[i].parentNode.removeChild(cards[i]);
    }

    function showError(message) {
      if (!errorState) return;
      errorState.textContent = '';
      var msg = document.createElement('p');
      msg.textContent =
        message || 'Wetterdaten konnten nicht geladen werden. Bitte später erneut versuchen.';
      errorState.appendChild(msg);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-primary';
      btn.style.marginTop = '12px';
      btn.textContent = 'Erneut versuchen';
      btn.addEventListener('click', function () {
        errorState.textContent = '';
        setHidden(errorState, true);
        load();
      });
      errorState.appendChild(btn);
      setHidden(errorState, false);
    }

    function renderRow(horse, blanket, grazing) {
      if (!template || !template.content) return;
      var node = template.content.firstElementChild.cloneNode(true);
      node.setAttribute('data-horse-id', horse.id);
      var nameEl = node.querySelector('.horse-name');
      if (nameEl) nameEl.textContent = horse.name;
      var locEl = node.querySelector('.horse-location');
      if (locEl)
        locEl.textContent = horse.lat.toFixed(2) + ', ' + horse.lng.toFixed(2);

      var bBadge = node.querySelector('[data-role="blanket-badge"]');
      if (bBadge) {
        bBadge.classList.remove(
          'badge-blanket-no',
          'badge-blanket-light',
          'badge-blanket-medium',
          'badge-blanket-heavy'
        );
        bBadge.classList.add(BLANKET_BADGE_CLASS[blanket.blanket]);
        var bv = bBadge.querySelector('[data-field="blanket-value"]');
        if (bv) bv.textContent = BLANKET_LABEL[blanket.blanket];
        var br = bBadge.querySelector('[data-field="blanket-reason"]');
        if (br) br.textContent = blanket.reason;
      }

      var gBadge = node.querySelector('[data-role="grazing-badge"]');
      if (gBadge) {
        gBadge.classList.remove(
          'badge-grazing-safe',
          'badge-grazing-caution',
          'badge-grazing-risky'
        );
        gBadge.classList.add(GRAZING_BADGE_CLASS[grazing.grazing]);
        var gv = gBadge.querySelector('[data-field="grazing-value"]');
        if (gv) gv.textContent = GRAZING_LABEL[grazing.grazing];
        var gr = gBadge.querySelector('[data-field="grazing-reason"]');
        if (gr) gr.textContent = grazing.reason;
      }

      listSection.appendChild(node);
    }

    function load() {
      setHidden(errorState, true);
      setHidden(emptyState, true);
      setHidden(loading, false);
      clearCards();

      SW.listHorses()
        .then(function (horses) {
          if (!horses || horses.length === 0) {
            setHidden(loading, true);
            setHidden(emptyState, false);
            return;
          }
          var weatherCache = {};
          var chain = Promise.resolve();
          var results = [];
          horses.forEach(function (h) {
            chain = chain.then(function () {
              var key = h.lat.toFixed(2) + ',' + h.lng.toFixed(2);
              var p = weatherCache[key];
              if (!p) {
                p = SW.fetchWeather(h.lat, h.lng);
                weatherCache[key] = p;
              }
              return p.then(function (w) {
                var d = SW.decide(h, w);
                results.push({ horse: h, blanket: d.blanket, grazing: d.grazing });
              });
            });
          });
          return chain.then(function () {
            setHidden(loading, true);
            results.forEach(function (r) {
              renderRow(r.horse, r.blanket, r.grazing);
            });
          });
        })
        .catch(function (err) {
          setHidden(loading, true);
          showError(err && err.message ? err.message : null);
        });
    }

    load();
  }

  // ---------- Pferde (horses.html) ----------
  function initHorses() {
    var listSection = $('#horses-list');
    var emptyState = $('#empty-state');
    var errorState = $('#error-state');
    var template = $('#horse-card-template');

    function clearCards() {
      if (!listSection) return;
      var cards = listSection.querySelectorAll('article.horse-card');
      for (var i = 0; i < cards.length; i++) cards[i].parentNode.removeChild(cards[i]);
    }

    function renderHorse(horse) {
      if (!template || !template.content) return;
      var node = template.content.firstElementChild.cloneNode(true);
      node.setAttribute('data-horse-id', horse.id);
      var nameEl = node.querySelector('.horse-name');
      if (nameEl) nameEl.textContent = horse.name;
      var locEl = node.querySelector('.horse-location');
      if (locEl)
        locEl.textContent = horse.lat.toFixed(2) + ', ' + horse.lng.toFixed(2);

      var clippedTag = node.querySelector('.tag-clipped');
      if (clippedTag) setHidden(clippedTag, !horse.clipped);
      var sensitiveTag = node.querySelector('.tag-sensitive');
      if (sensitiveTag) setHidden(sensitiveTag, !horse.sensitive);
      var riskTag = node.querySelector('.tag-risk');
      if (riskTag) {
        riskTag.textContent = RISK_LABEL[horse.risk] || '';
        riskTag.setAttribute('data-risk', horse.risk);
      }

      var delBtn = node.querySelector('[data-action="delete"]');
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          if (window.confirm(horse.name + ' wirklich entfernen?')) {
            SW.deleteHorse(horse.id).then(render);
          }
        });
      }

      listSection.appendChild(node);
    }

    function render() {
      setHidden(errorState, true);
      clearCards();
      SW.listHorses()
        .then(function (horses) {
          if (!horses || horses.length === 0) {
            setHidden(emptyState, false);
            return;
          }
          setHidden(emptyState, true);
          horses.forEach(renderHorse);
        })
        .catch(function () {
          setHidden(errorState, false);
        });
    }

    render();
  }

  // ---------- Neues Pferd (horses-new.html) ----------
  function initNew() {
    var form = $('#horse-form');
    var nameInput = $('#field-name');
    var latInput = $('#field-lat');
    var lngInput = $('#field-lng');
    var clippedInput = $('#field-clipped');
    var sensitiveInput = $('#field-sensitive');
    var locBtn = $('#use-location-btn');
    var errorState = $('#error-state');

    function showError(msg) {
      if (!errorState) {
        window.alert(msg);
        return;
      }
      errorState.textContent = msg;
      setHidden(errorState, false);
    }

    function clearError() {
      if (!errorState) return;
      setHidden(errorState, true);
    }

    var riskBtns = document.querySelectorAll('.risk-btn');
    for (var i = 0; i < riskBtns.length; i++) {
      (function (label) {
        var radio = label.querySelector('input[type="radio"]');
        if (!radio) return;
        radio.addEventListener('change', updateRiskActive);
        label.addEventListener('click', function () {
          // ensure radio is selected then update visual
          setTimeout(updateRiskActive, 0);
        });
      })(riskBtns[i]);
    }

    function updateRiskActive() {
      for (var j = 0; j < riskBtns.length; j++) {
        var radio = riskBtns[j].querySelector('input[type="radio"]');
        if (radio && radio.checked) riskBtns[j].classList.add('risk-btn--active');
        else riskBtns[j].classList.remove('risk-btn--active');
      }
    }

    if (locBtn) {
      locBtn.addEventListener('click', function () {
        if (!navigator.geolocation) {
          showError('Geolokalisierung wird nicht unterstützt.');
          return;
        }
        clearError();
        var prev = locBtn.textContent;
        locBtn.disabled = true;
        locBtn.textContent = 'Standort wird ermittelt…';
        navigator.geolocation.getCurrentPosition(
          function (pos) {
            latInput.value = pos.coords.latitude.toFixed(2);
            lngInput.value = pos.coords.longitude.toFixed(2);
            locBtn.disabled = false;
            locBtn.textContent = prev;
          },
          function (err) {
            locBtn.disabled = false;
            locBtn.textContent = prev;
            showError(
              'Standort konnte nicht ermittelt werden' +
                (err && err.message ? ': ' + err.message : '.')
            );
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearError();

        var name = (nameInput.value || '').trim();
        var latStr = (latInput.value || '').trim();
        var lngStr = (lngInput.value || '').trim();

        if (!name) {
          showError('Bitte einen Namen eingeben.');
          return;
        }
        var lat = parseFloat(latStr);
        var lng = parseFloat(lngStr);
        if (isNaN(lat) || isNaN(lng)) {
          showError('Bitte den Standort ermitteln.');
          return;
        }

        var risk = 'low';
        var checked = document.querySelector('input[name="risk"]:checked');
        if (checked) risk = checked.value;

        SW.addHorse({
          name: name,
          lat: lat,
          lng: lng,
          clipped: !!(clippedInput && clippedInput.checked),
          sensitive: !!(sensitiveInput && sensitiveInput.checked),
          risk: risk,
        })
          .then(function () {
            location.href = 'horses.html';
          })
          .catch(function () {
            showError('Speichern fehlgeschlagen.');
          });
      });
    }
  }

  function init() {
    var page = document.body && document.body.dataset && document.body.dataset.page;
    if (!page) {
      if (document.getElementById('recommendations-list')) page = 'today';
      else if (document.getElementById('horses-list')) page = 'horses';
      else if (document.getElementById('horse-form')) page = 'new';
    }
    if (page === 'today') initToday();
    else if (page === 'horses') initHorses();
    else if (page === 'new') initNew();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
