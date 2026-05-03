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
        if (bBadge.tagName === 'A') {
          bBadge.setAttribute('href', 'blanket.html?h=' + encodeURIComponent(horse.id));
        }
        var bl = bBadge.querySelector('[data-field="blanket-label"]');
        if (bl) bl.textContent = cardLabel('blanket');
        var bv = bBadge.querySelector('[data-field="blanket-value"]');
        if (bv) bv.textContent = blanketLabel(blanket.blanket);
        bBadge.setAttribute('data-blanket-parts', JSON.stringify(blanket.reasonParts || []));
        bBadge.setAttribute('data-felt-like', String(blanket.feltLike != null ? blanket.feltLike : ''));
        var br = bBadge.querySelector('[data-field="blanket-reason"]');
        if (br) br.textContent = buildBlanketReason(blanket);
      }

      var gBadge = node.querySelector('[data-role="grazing-badge"]');
      if (gBadge) {
        gBadge.classList.remove(
          'badge-grazing-safe', 'badge-grazing-caution', 'badge-grazing-risky'
        );
        gBadge.classList.add(GRAZING_BADGE_CLASS[grazing.grazing]);
        if (gBadge.tagName === 'A') {
          gBadge.setAttribute('href', 'grazing.html?h=' + encodeURIComponent(horse.id));
        }
        var gl = gBadge.querySelector('[data-field="grazing-label"]');
        if (gl) gl.textContent = cardLabel('grazing');
        var gv = gBadge.querySelector('[data-field="grazing-value"]');
        if (gv) gv.textContent = grazingLabel(grazing.grazing);
        gBadge.setAttribute('data-reason-codes', (grazing.reasonCodes || []).join(','));
        var gr = gBadge.querySelector('[data-field="grazing-reason"]');
        if (gr) gr.textContent = buildGrazingReason(grazing);

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

    function buildBlanketReason(blanket) {
      var parts = blanket.reasonParts || [];
      var bits = [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.code === 'tMin') bits.push(tr('blanket.reason.tMin', { v: p.v }));
        else if (p.code === 'wind') bits.push(tr('blanket.reason.wind', { v: p.v }));
        else if (p.code === 'rain') bits.push(tr('blanket.reason.rain', { v: p.v }));
        else if (p.code === 'sensitive') bits.push(tr('blanket.reason.sensitive'));
      }
      var head = bits.join(', ');
      var feltLike = blanket.feltLike;
      if (feltLike === undefined || feltLike === null || feltLike === '') return head;
      return head + ' → ' + tr('blanket.reason.feltLike', { v: feltLike });
    }

    function buildGrazingReason(grazing) {
      var codes = grazing.reasonCodes || [];
      var bits = [];
      for (var i = 0; i < codes.length; i++) {
        bits.push(tr('grazing.reason.' + codes[i]));
      }
      return bits.join(', ');
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

        var bBadge = cards[i].querySelector('[data-role="blanket-badge"]');
        if (bBadge) {
          var partsRaw = bBadge.getAttribute('data-blanket-parts');
          var feltRaw = bBadge.getAttribute('data-felt-like');
          if (partsRaw != null) {
            try {
              var parsedParts = JSON.parse(partsRaw);
              var feltLike = feltRaw === '' || feltRaw == null ? undefined : parseInt(feltRaw, 10);
              var br2 = cards[i].querySelector('[data-field="blanket-reason"]');
              if (br2) br2.textContent = buildBlanketReason({ reasonParts: parsedParts, feltLike: feltLike });
            } catch (e) {}
          }
        }

        var gwl = cards[i].querySelector('[data-field="grazing-window-label"]');
        if (gwl) gwl.textContent = tr('card.grazingWindow');

        var gBadge = cards[i].querySelector('[data-role="grazing-badge"]');
        if (gBadge) {
          var codesAttr = gBadge.getAttribute('data-reason-codes') || '';
          var codes = codesAttr ? codesAttr.split(',') : [];
          var gr2 = cards[i].querySelector('[data-field="grazing-reason"]');
          if (gr2) gr2.textContent = buildGrazingReason({ reasonCodes: codes });
        }

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

  // ---------- Detail helpers (shared) ----------
  function getQueryParam(name) {
    var qs = window.location.search || '';
    var pairs = qs.replace(/^\?/, '').split('&');
    for (var i = 0; i < pairs.length; i++) {
      var idx = pairs[i].indexOf('=');
      if (idx === -1) continue;
      if (decodeURIComponent(pairs[i].slice(0, idx)) === name) {
        return decodeURIComponent(pairs[i].slice(idx + 1));
      }
    }
    return null;
  }

  function buildBlanketReasonText(blanket) {
    var parts = blanket.reasonParts || [];
    var bits = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p.code === 'tMin') bits.push(tr('blanket.reason.tMin', { v: p.v }));
      else if (p.code === 'wind') bits.push(tr('blanket.reason.wind', { v: p.v }));
      else if (p.code === 'rain') bits.push(tr('blanket.reason.rain', { v: p.v }));
      else if (p.code === 'sensitive') bits.push(tr('blanket.reason.sensitive'));
    }
    var head = bits.join(', ');
    if (blanket.feltLike == null) return head;
    return head + ' → ' + tr('blanket.reason.feltLike', { v: blanket.feltLike });
  }

  function buildGrazingReasonText(grazing) {
    var codes = grazing.reasonCodes || [];
    var bits = [];
    for (var i = 0; i < codes.length; i++) bits.push(tr('grazing.reason.' + codes[i]));
    return bits.join(', ');
  }

  function formatElapsed(sinceMs, kind) {
    var now = Date.now();
    var diff = Math.max(0, now - sinceMs);
    var totalMin = Math.floor(diff / 60000);
    if (totalMin < 60) {
      return tr('detail.elapsed.' + kind + '.minutes', { m: totalMin });
    }
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    return tr('detail.elapsed.' + kind + '.full', { h: h, m: m });
  }

  // ---------- Decken-Detail (blanket.html) ----------
  function initBlanket() {
    var horseId = getQueryParam('h');
    var loading = $('#loading');
    var errEl = $('#error-state');
    var notFound = $('#not-found');
    var content = $('#content');
    var nameEl = $('#detail-horse-name');
    var headline = $('#headline');
    var headlineValue = headline ? headline.querySelector('[data-field="headline-value"]') : null;
    var headlineLabel = headline ? headline.querySelector('[data-field="headline-label"]') : null;
    var headlineReason = headline ? headline.querySelector('[data-field="headline-reason"]') : null;
    var gramajValue = $('#gramaj-value');
    var summaryList = $('#summary-list');
    var segmentsRoot = $('#segments');
    var tomorrowText = $('#tomorrow-text');
    var actionBtn = $('#action-btn');
    var actionElapsed = $('#action-elapsed');
    var whyList = $('#why-list');

    if (!horseId) {
      setHidden(notFound, false);
      return;
    }

    var ctx = { horse: null, weather: null, decision: null };

    function showError(msg) {
      if (!errEl) return;
      errEl.textContent = msg || tr('today.error');
      setHidden(errEl, false);
    }

    function renderSummary(b, w) {
      if (!summaryList) return;
      summaryList.innerHTML = '';
      var rows = [
        tr('detail.summary.felt', { v: b.feltLike != null ? b.feltLike : '—' }),
        tr('detail.summary.minMax', { min: Math.round(w.tMin), max: Math.round(w.tMaxToday) }),
        tr('detail.summary.wind', { v: Math.round(w.windKmh) }),
        tr('detail.summary.rain', { v: Math.round(w.rainMm) }),
      ];
      for (var i = 0; i < rows.length; i++) {
        var li = document.createElement('li');
        li.textContent = rows[i];
        summaryList.appendChild(li);
      }
    }

    function renderSegments(w) {
      if (!segmentsRoot) return;
      segmentsRoot.innerHTML = '';
      var tomorrowHours = w.tomorrow ? w.tomorrow.tempByHour : [];
      var segments = SW.blanketSegments(w.tempByHour, tomorrowHours);
      for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        var card = document.createElement('div');
        card.className = 'segment';
        var label = document.createElement('p');
        label.className = 'segment-label';
        label.textContent = tr('detail.hourly.' + seg.key);
        card.appendChild(label);
        var range = document.createElement('p');
        range.className = 'segment-range';
        range.textContent = tr('detail.hourly.' + seg.key + 'Range');
        card.appendChild(range);
        var temp = document.createElement('p');
        temp.className = 'segment-temp';
        temp.textContent = seg.data.tempAvg == null ? tr('detail.hourly.noData') : seg.data.tempAvg + '°';
        card.appendChild(temp);
        var wind = document.createElement('p');
        wind.className = 'segment-wind';
        wind.textContent = seg.data.windMax == null ? '—' : seg.data.windMax + ' km/h';
        card.appendChild(wind);
        segmentsRoot.appendChild(card);
      }
    }

    function renderTomorrow() {
      if (!tomorrowText) return;
      var w = ctx.weather;
      if (!w || !w.tomorrow) {
        tomorrowText.textContent = tr('detail.tomorrow.unknown');
        return;
      }
      var todayBlanket = ctx.decision.blanket.blanket;
      var tomDecision = SW.decideBlanket(ctx.horse, w.tomorrow);
      var cmp = SW.compareBlanket(tomDecision.blanket, todayBlanket);
      if (cmp === 0) {
        tomorrowText.textContent = tr('detail.tomorrow.same');
      } else if (cmp < 0) {
        tomorrowText.textContent = tr('detail.tomorrow.warmer', { to: blanketLabel(tomDecision.blanket) });
      } else {
        tomorrowText.textContent = tr('detail.tomorrow.colder', { to: blanketLabel(tomDecision.blanket) });
      }
    }

    function renderGramaj(b) {
      if (!gramajValue) return;
      var g = SW.blanketGramaj(b.blanket);
      if (!g) {
        gramajValue.textContent = tr('detail.gramaj.none');
        return;
      }
      gramajValue.textContent = tr('detail.gramaj.' + b.blanket);
    }

    function renderWhy() {
      if (!whyList) return;
      whyList.innerHTML = '';
      var b = ctx.decision.blanket;
      var parts = b.reasonParts || [];
      for (var i = 0; i < parts.length; i++) {
        var li = document.createElement('li');
        var p = parts[i];
        if (p.code === 'tMin') li.textContent = tr('blanket.reason.tMin', { v: p.v });
        else if (p.code === 'wind') li.textContent = tr('blanket.reason.wind', { v: p.v });
        else if (p.code === 'rain') li.textContent = tr('blanket.reason.rain', { v: p.v });
        else if (p.code === 'sensitive') li.textContent = tr('blanket.reason.sensitive');
        whyList.appendChild(li);
      }
      var profileLi = document.createElement('li');
      var profile = ctx.horse.clipped ? tr('detail.why.profile.clipped') : tr('detail.why.profile.unclipped');
      if (ctx.horse.sensitive) profile += ', ' + tr('detail.why.profile.sensitive');
      profileLi.textContent = tr('detail.why.profile') + ': ' + profile;
      whyList.appendChild(profileLi);
    }

    function renderActionElapsed() {
      if (!actionElapsed) return;
      SW.getLastLogEntry(ctx.horse.id, 'blanket').then(function (entry) {
        if (!entry || Date.now() - entry.ts > 24 * 3600 * 1000) {
          setHidden(actionElapsed, true);
          return;
        }
        actionElapsed.textContent = formatElapsed(entry.ts, 'blanket');
        setHidden(actionElapsed, false);
      });
    }

    function renderAll() {
      var b = ctx.decision.blanket;
      if (headline) {
        headline.classList.remove(
          'badge-blanket-no', 'badge-blanket-light', 'badge-blanket-medium', 'badge-blanket-heavy'
        );
        headline.classList.add(BLANKET_BADGE_CLASS[b.blanket]);
      }
      if (headlineLabel) headlineLabel.textContent = cardLabel('blanket');
      if (headlineValue) headlineValue.textContent = blanketLabel(b.blanket);
      if (headlineReason) headlineReason.textContent = buildBlanketReasonText(b);
      renderGramaj(b);
      renderSummary(b, ctx.weather);
      renderSegments(ctx.weather);
      renderTomorrow();
      renderWhy();
      renderActionElapsed();
    }

    if (actionBtn) {
      actionBtn.addEventListener('click', function () {
        if (!ctx.horse || !ctx.decision) return;
        SW.addLogEntry({
          horseId: ctx.horse.id,
          type: 'blanket',
          payload: {
            blanket: ctx.decision.blanket.blanket,
            gramaj: SW.blanketGramaj(ctx.decision.blanket.blanket),
          },
        }).then(function () {
          actionBtn.textContent = tr('detail.action.blanketDone');
          actionBtn.setAttribute('data-i18n', 'detail.action.blanketDone');
          actionBtn.disabled = true;
          renderActionElapsed();
        });
      });
    }

    setHidden(loading, false);
    SW.findHorse(horseId)
      .then(function (horse) {
        if (!horse) {
          setHidden(loading, true);
          setHidden(notFound, false);
          throw new Error('not found');
        }
        ctx.horse = horse;
        if (nameEl) nameEl.textContent = horse.name;
        return SW.fetchWeather(horse.lat, horse.lng);
      })
      .then(function (w) {
        ctx.weather = w;
        ctx.decision = SW.decide(ctx.horse, w);
        setHidden(loading, true);
        setHidden(content, false);
        renderAll();
      })
      .catch(function (err) {
        setHidden(loading, true);
        if (err && err.message !== 'not found') {
          showError(err && err.message ? err.message : null);
        }
      });

    if (window.SW && SW.i18n && SW.i18n.onChange) {
      SW.i18n.onChange(function () {
        if (ctx.decision) renderAll();
      });
    }
  }

  // ---------- Weide-Detail (grazing.html) ----------
  function initGrazing() {
    var horseId = getQueryParam('h');
    var loading = $('#loading');
    var errEl = $('#error-state');
    var notFound = $('#not-found');
    var content = $('#content');
    var nameEl = $('#detail-horse-name');
    var headline = $('#headline');
    var headlineValue = headline ? headline.querySelector('[data-field="headline-value"]') : null;
    var headlineLabel = headline ? headline.querySelector('[data-field="headline-label"]') : null;
    var headlineReason = headline ? headline.querySelector('[data-field="headline-reason"]') : null;
    var windowValue = $('#window-value');
    var riskBar = $('#risk-bar');
    var riskAxis = $('#risk-axis');
    var riskEmpty = $('#risk-empty');
    var trendRow = $('#trend-row');
    var actionBtn = $('#action-btn');
    var actionElapsed = $('#action-elapsed');
    var whyList = $('#why-list');
    var areaRow = $('#area-row');

    if (!horseId) {
      setHidden(notFound, false);
      return;
    }

    var ctx = { horse: null, weather: null, decision: null };

    function showError(msg) {
      if (!errEl) return;
      errEl.textContent = msg || tr('today.error');
      setHidden(errEl, false);
    }

    function renderHeadline(g) {
      if (headline) {
        headline.classList.remove(
          'badge-grazing-safe', 'badge-grazing-caution', 'badge-grazing-risky'
        );
        headline.classList.add(GRAZING_BADGE_CLASS[g.grazing]);
      }
      if (headlineLabel) headlineLabel.textContent = cardLabel('grazing');
      if (headlineValue) headlineValue.textContent = grazingLabel(g.grazing);
      if (headlineReason) headlineReason.textContent = buildGrazingReasonText(g);
    }

    function renderWindow(g) {
      if (!windowValue) return;
      if (!g.bestWindow || g.bestWindow === '—') {
        windowValue.textContent = tr('detail.window.none');
      } else {
        windowValue.textContent = g.bestWindow;
      }
    }

    function renderRisk() {
      if (!riskBar || !riskAxis) return;
      riskBar.innerHTML = '';
      riskAxis.innerHTML = '';
      var hours = SW.hourlyGrazingRisk(ctx.horse, ctx.weather);
      if (!hours || hours.length === 0) {
        setHidden(riskEmpty, false);
        return;
      }
      setHidden(riskEmpty, true);
      for (var i = 0; i < hours.length; i++) {
        var cell = document.createElement('span');
        cell.className = 'risk-cell risk-cell--' + hours[i].level;
        cell.title = pad2(hours[i].hour) + ':00 — ' +
          (hours[i].temp != null ? Math.round(hours[i].temp) + '°' : '—');
        riskBar.appendChild(cell);
      }
      for (var j = 0; j < hours.length; j++) {
        var lbl = document.createElement('span');
        lbl.className = 'risk-axis-label';
        lbl.textContent = (hours[j].hour % 6 === 0) ? pad2(hours[j].hour) : '';
        riskAxis.appendChild(lbl);
      }
    }

    function pad2(n) { return n < 10 ? '0' + n : '' + n; }

    function renderTrend() {
      if (!trendRow) return;
      trendRow.innerHTML = '';
      var w = ctx.weather;
      var horse = ctx.horse;
      var todayLevel = bucketDayLevel(SW.decideGrazing(horse, w).grazing);
      var tomorrowLevel = w.tomorrow
        ? bucketDayLevel(SW.decideGrazing(horse, w.tomorrow).grazing)
        : null;
      var yesterdayLevel = bucketYesterday(w);
      var days = [
        { key: 'yesterday', level: yesterdayLevel },
        { key: 'today', level: todayLevel },
        { key: 'tomorrow', level: tomorrowLevel },
      ];
      for (var i = 0; i < days.length; i++) {
        var d = document.createElement('div');
        d.className = 'trend-day' + (days[i].level ? ' trend-day--' + days[i].level : ' trend-day--unknown');
        var lbl = document.createElement('span');
        lbl.className = 'trend-day-label';
        lbl.textContent = tr('detail.trend.day.' + days[i].key);
        var dot = document.createElement('span');
        dot.className = 'trend-day-dot';
        d.appendChild(lbl);
        d.appendChild(dot);
        trendRow.appendChild(d);
      }
    }

    function bucketDayLevel(g) {
      if (g === 'safe') return 'safe';
      if (g === 'caution') return 'caution';
      if (g === 'risky') return 'risky';
      return null;
    }

    // Cheap proxy: yesterday counts a fructan cycle if at least one happened in
    // the 72hr window. Without daily-decision recompute, surface caution/risky
    // when cycles or soil-frozen factors are in play, else safe.
    function bucketYesterday(w) {
      if (w.soilFrozen) return 'risky';
      if (w.fructanCycles72 >= 2) return 'risky';
      if (w.fructanCycles72 >= 1) return 'caution';
      return 'safe';
    }

    function renderWhy() {
      if (!whyList) return;
      whyList.innerHTML = '';
      var g = ctx.decision.grazing;
      var codes = g.reasonCodes || [];
      for (var i = 0; i < codes.length; i++) {
        var li = document.createElement('li');
        li.textContent = tr('grazing.reason.' + codes[i]);
        whyList.appendChild(li);
      }
      if (g.bestWindow && g.bestWindow !== '—') {
        var li2 = document.createElement('li');
        li2.textContent = tr('detail.window.heading') + ': ' + g.bestWindow;
        whyList.appendChild(li2);
      }
      var li3 = document.createElement('li');
      li3.textContent = tr('detail.why.profile') + ': ' + tr('risk.' + (ctx.horse.risk || 'low'));
      whyList.appendChild(li3);
    }

    function renderActionElapsed() {
      if (!actionElapsed) return;
      SW.getLastLogEntry(ctx.horse.id, 'grazing').then(function (entry) {
        if (!entry || Date.now() - entry.ts > 24 * 3600 * 1000) {
          setHidden(actionElapsed, true);
          return;
        }
        actionElapsed.textContent = formatElapsed(entry.ts, 'grazing');
        setHidden(actionElapsed, false);
      });
    }

    function renderAll() {
      var g = ctx.decision.grazing;
      renderHeadline(g);
      renderWindow(g);
      renderRisk();
      renderTrend();
      renderWhy();
      renderActionElapsed();
    }

    if (areaRow) {
      var areaBtns = areaRow.querySelectorAll('.area-btn');
      for (var i = 0; i < areaBtns.length; i++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            for (var j = 0; j < areaBtns.length; j++) areaBtns[j].classList.remove('area-btn--active');
            btn.classList.add('area-btn--active');
            var radio = btn.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
          });
        })(areaBtns[i]);
      }
    }

    if (actionBtn) {
      actionBtn.addEventListener('click', function () {
        if (!ctx.horse || !ctx.decision) return;
        var areaInput = areaRow ? areaRow.querySelector('input[name="area"]:checked') : null;
        var area = areaInput ? areaInput.value : 'pasture';
        SW.addLogEntry({
          horseId: ctx.horse.id,
          type: 'grazing',
          payload: {
            grazing: ctx.decision.grazing.grazing,
            area: area,
          },
        }).then(function () {
          actionBtn.textContent = tr('detail.action.grazingDone');
          actionBtn.setAttribute('data-i18n', 'detail.action.grazingDone');
          actionBtn.disabled = true;
          renderActionElapsed();
        });
      });
    }

    setHidden(loading, false);
    SW.findHorse(horseId)
      .then(function (horse) {
        if (!horse) {
          setHidden(loading, true);
          setHidden(notFound, false);
          throw new Error('not found');
        }
        ctx.horse = horse;
        if (nameEl) nameEl.textContent = horse.name;
        return SW.fetchWeather(horse.lat, horse.lng);
      })
      .then(function (w) {
        ctx.weather = w;
        ctx.decision = SW.decide(ctx.horse, w);
        setHidden(loading, true);
        setHidden(content, false);
        renderAll();
      })
      .catch(function (err) {
        setHidden(loading, true);
        if (err && err.message !== 'not found') {
          showError(err && err.message ? err.message : null);
        }
      });

    if (window.SW && SW.i18n && SW.i18n.onChange) {
      SW.i18n.onChange(function () {
        if (ctx.decision) renderAll();
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
    else if (page === 'blanket') initBlanket();
    else if (page === 'grazing') initGrazing();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
