// Page-aware controller for StallWetter web.
(function () {
  'use strict';

  var BLANKET_BADGE_CLASS = {
    no: 'badge-blanket-no',
    light: 'badge-blanket-light',
    medium: 'badge-blanket-medium',
    heavy: 'badge-blanket-heavy',
  };
  var GRAZING_BADGE_CLASS = {
    safe: 'badge-grazing-safe',
    caution: 'badge-grazing-caution',
    risky: 'badge-grazing-risky',
  };

  function tr(key, vars) {
    if (window.SW && SW.i18n && typeof SW.i18n.t === 'function') return SW.i18n.t(key, vars);
    return key;
  }

  function blanketLabel(b) { return tr('blanket.' + b); }
  function grazingLabel(g) { return tr('grazing.' + g); }
  function riskLabel(r) { return tr('risk.' + r); }
  function cardLabel(role) { return tr('card.' + role); }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute('hidden', '');
    else el.removeAttribute('hidden');
  }

  function formatDate(d) {
    var lang = (window.SW && SW.i18n && SW.i18n.getLang) ? SW.i18n.getLang() : 'de';
    var locale = lang === 'en' ? 'en-US' : 'de-DE';
    try {
      return d.toLocaleDateString(locale, {
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
    var loading = $('#loading');
    var errorState = $('#error-state');
    var emptyState = $('#empty-state');
    var listSection = $('#recommendations-list');
    var template = $('#horse-recommendation-template');

    function refreshDate() {
      if (dateEl) dateEl.textContent = formatDate(new Date());
    }
    refreshDate();

    function clearCards() {
      if (!listSection) return;
      var cards = listSection.querySelectorAll('article.horse-card');
      for (var i = 0; i < cards.length; i++) cards[i].parentNode.removeChild(cards[i]);
    }

    function showError(message) {
      if (!errorState) return;
      errorState.textContent = '';
      var msg = document.createElement('p');
      msg.textContent = message || tr('today.error');
      errorState.appendChild(msg);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-primary';
      btn.style.marginTop = '12px';
      btn.textContent = tr('today.retry');
      btn.setAttribute('data-i18n', 'today.retry');
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
      node.setAttribute('data-blanket', blanket.blanket);
      node.setAttribute('data-grazing', grazing.grazing);

      var nameEl = node.querySelector('.horse-name');
      if (nameEl) nameEl.textContent = horse.name;
      var locEl = node.querySelector('.horse-location');
      if (locEl) locEl.textContent = horse.lat.toFixed(2) + ', ' + horse.lng.toFixed(2);

      var bBadge = node.querySelector('[data-role="blanket-badge"]');
      if (bBadge) {
        bBadge.classList.remove(
          'badge-blanket-no', 'badge-blanket-light', 'badge-blanket-medium', 'badge-blanket-heavy'
        );
        bBadge.classList.add(BLANKET_BADGE_CLASS[blanket.blanket]);
        var bl = bBadge.querySelector('[data-field="blanket-label"]');
        if (bl) bl.textContent = cardLabel('blanket');
        var bv = bBadge.querySelector('[data-field="blanket-value"]');
        if (bv) bv.textContent = blanketLabel(blanket.blanket);
        var br = bBadge.querySelector('[data-field="blanket-reason"]');
        if (br) br.textContent = blanket.reason;
      }

      var gBadge = node.querySelector('[data-role="grazing-badge"]');
      if (gBadge) {
        gBadge.classList.remove(
          'badge-grazing-safe', 'badge-grazing-caution', 'badge-grazing-risky'
        );
        gBadge.classList.add(GRAZING_BADGE_CLASS[grazing.grazing]);
        var gl = gBadge.querySelector('[data-field="grazing-label"]');
        if (gl) gl.textContent = cardLabel('grazing');
        var gv = gBadge.querySelector('[data-field="grazing-value"]');
        if (gv) gv.textContent = grazingLabel(grazing.grazing);
        var gr = gBadge.querySelector('[data-field="grazing-reason"]');
        if (gr) gr.textContent = grazing.reason;

        var gwl = gBadge.querySelector('[data-field="grazing-window-label"]');
        if (gwl) gwl.textContent = tr('card.grazingWindow');
        var gwv = gBadge.querySelector('[data-field="grazing-window-value"]');
        if (gwv) gwv.textContent = grazing.bestWindow || '—';

        gBadge.setAttribute('data-cycles', String(grazing.fructanCycles72 || 0));
        gBadge.setAttribute('data-soil-frozen', grazing.soilFrozen ? '1' : '0');

        var gtRow = gBadge.querySelector('[data-field="grazing-trend-row"]');
        var gtLabel = gBadge.querySelector('[data-field="grazing-trend-label"]');
        var gtVal = gBadge.querySelector('[data-field="grazing-trend-value"]');
        var trendText = buildTrendText(grazing);
        if (gtRow) {
          if (trendText) {
            setHidden(gtRow, false);
            if (gtLabel) gtLabel.textContent = tr('card.grazingTrend');
            if (gtVal) gtVal.textContent = trendText;
          } else {
            setHidden(gtRow, true);
          }
        }
      }

      listSection.appendChild(node);
    }

    function buildTrendText(grazing) {
      var parts = [];
      var cycles = grazing.fructanCycles72 || 0;
      if (cycles >= 1) parts.push(cycles + '× ' + tr('trend.cycle'));
      if (grazing.soilFrozen) parts.push(tr('trend.soil'));
      return parts.join(' · ');
    }

    function rerenderLabels() {
      // Re-translate dynamic labels when language changes, without re-fetching.
      refreshDate();
      var cards = listSection ? listSection.querySelectorAll('article.horse-card') : [];
      for (var i = 0; i < cards.length; i++) {
        var b = cards[i].getAttribute('data-blanket');
        var g = cards[i].getAttribute('data-grazing');
        var bl = cards[i].querySelector('[data-field="blanket-label"]');
        if (bl) bl.textContent = cardLabel('blanket');
        var bv = cards[i].querySelector('[data-field="blanket-value"]');
        if (bv && b) bv.textContent = blanketLabel(b);
        var gl = cards[i].querySelector('[data-field="grazing-label"]');
        if (gl) gl.textContent = cardLabel('grazing');
        var gv = cards[i].querySelector('[data-field="grazing-value"]');
        if (gv && g) gv.textContent = grazingLabel(g);

        var gwl = cards[i].querySelector('[data-field="grazing-window-label"]');
        if (gwl) gwl.textContent = tr('card.grazingWindow');

        var gBadge = cards[i].querySelector('[data-role="grazing-badge"]');
        var gtRow = cards[i].querySelector('[data-field="grazing-trend-row"]');
        if (gBadge && gtRow) {
          var cycles = parseInt(gBadge.getAttribute('data-cycles') || '0', 10);
          var soilFrozen = gBadge.getAttribute('data-soil-frozen') === '1';
          var trendText = buildTrendText({ fructanCycles72: cycles, soilFrozen: soilFrozen });
          if (trendText) {
            setHidden(gtRow, false);
            var gtLabel = cards[i].querySelector('[data-field="grazing-trend-label"]');
            if (gtLabel) gtLabel.textContent = tr('card.grazingTrend');
            var gtVal = cards[i].querySelector('[data-field="grazing-trend-value"]');
            if (gtVal) gtVal.textContent = trendText;
          } else {
            setHidden(gtRow, true);
          }
        }
      }
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

    if (window.SW && SW.i18n && SW.i18n.onChange) SW.i18n.onChange(rerenderLabels);
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
      if (locEl) locEl.textContent = horse.lat.toFixed(2) + ', ' + horse.lng.toFixed(2);

      var clippedTag = node.querySelector('.tag-clipped');
      if (clippedTag) setHidden(clippedTag, !horse.clipped);
      var sensitiveTag = node.querySelector('.tag-sensitive');
      if (sensitiveTag) setHidden(sensitiveTag, !horse.sensitive);
      var riskTag = node.querySelector('.tag-risk');
      if (riskTag) {
        riskTag.textContent = riskLabel(horse.risk);
        riskTag.setAttribute('data-risk', horse.risk);
      }

      var delBtn = node.querySelector('[data-action="delete"]');
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          if (window.confirm(tr('horses.confirmDelete', { name: horse.name }))) {
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

    if (window.SW && SW.i18n && SW.i18n.onChange) SW.i18n.onChange(render);
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
      var locBtnDefaultKey = 'new.useLocation';
      locBtn.addEventListener('click', function () {
        if (!navigator.geolocation) {
          showError(tr('new.error.geolocationUnsupported'));
          return;
        }
        clearError();
        locBtn.disabled = true;
        // Switch i18n key while locating, so a language change mid-flight still translates.
        locBtn.setAttribute('data-i18n', 'new.locating');
        locBtn.textContent = tr('new.locating');
        navigator.geolocation.getCurrentPosition(
          function (pos) {
            latInput.value = pos.coords.latitude.toFixed(2);
            lngInput.value = pos.coords.longitude.toFixed(2);
            locBtn.disabled = false;
            locBtn.setAttribute('data-i18n', locBtnDefaultKey);
            locBtn.textContent = tr(locBtnDefaultKey);
          },
          function (err) {
            locBtn.disabled = false;
            locBtn.setAttribute('data-i18n', locBtnDefaultKey);
            locBtn.textContent = tr(locBtnDefaultKey);
            showError(
              tr('new.error.locationFailed') +
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
          showError(tr('new.error.name'));
          return;
        }
        var lat = parseFloat(latStr);
        var lng = parseFloat(lngStr);
        if (isNaN(lat) || isNaN(lng)) {
          showError(tr('new.error.location'));
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
            showError(tr('new.error.saveFailed'));
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
