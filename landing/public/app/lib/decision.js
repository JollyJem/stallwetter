// Pure rule engine for blanket + grazing decisions.
//
// v2.1.0 — emits reason codes (not pre-translated strings) so the UI layer
// can localize. Multi-day fructan trend + soil-freeze proxy + dynamic safe
// window. Fructan accumulates over 48-72hr of frost + sun cycles; sunny
// cold days matter more than cloudy cold days; frozen soil prevents the
// overnight fructan drop even when air warms above zero.
(function () {
  'use strict';

  var LOGIC_VERSION = '2.1.0';

  function decideBlanket(horse, w) {
    var tEff = w.tMin;
    var parts = [{ code: 'tMin', v: Math.round(w.tMin) }];

    if (w.windKmh > 45) {
      tEff -= 4;
      parts.push({ code: 'wind', v: Math.round(w.windKmh) });
    } else if (w.windKmh > 25) {
      tEff -= 2;
      parts.push({ code: 'wind', v: Math.round(w.windKmh) });
    }

    if (w.rainMm > 5) {
      tEff -= 2;
      parts.push({ code: 'rain', v: Math.round(w.rainMm) });
    }

    if (horse.sensitive) {
      tEff -= 2;
      parts.push({ code: 'sensitive' });
    }

    var blanket;
    if (horse.clipped) {
      if (tEff >= 10) blanket = 'no';
      else if (tEff >= 5) blanket = 'light';
      else if (tEff >= 0) blanket = 'medium';
      else blanket = 'heavy';
    } else {
      if (tEff >= 5) blanket = 'no';
      else if (tEff >= 0) blanket = 'light';
      else blanket = 'medium';
    }

    return {
      blanket: blanket,
      reasonParts: parts,
      feltLike: Math.round(tEff),
    };
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function computeWindow(w) {
    if (w.soilFrozen) return '—';

    var byHour = w.tempByHour;
    if (!byHour || byHour.length === 0) {
      if (w.frostOvernight && w.sunnyToday) return '10:00 – 14:00';
      if (w.frostOvernight) return '08:00 – 16:00';
      if (w.sunnyToday) return '06:00 – 12:00';
      return '06:00 – 20:00';
    }

    var startHour = -1;
    for (var i = 0; i < byHour.length; i++) {
      var h = byHour[i];
      if (h.hour < 6 || h.hour > 20) continue;
      if (h.temp != null && h.temp > 4) {
        startHour = h.hour;
        break;
      }
    }
    if (startHour === -1) return '—';

    var endHour;
    if (w.frostOvernight && w.sunnyToday) {
      endHour = Math.min(14, Math.max(startHour + 2, 12));
    } else if (w.frostOvernight) {
      endHour = 16;
    } else if (w.sunnyToday) {
      endHour = 18;
    } else {
      endHour = 20;
    }

    if (startHour >= endHour) return '—';

    return pad(startHour) + ':00 – ' + pad(endHour) + ':00';
  }

  function decideGrazing(horse, w) {
    var score = 0;
    var codes = [];

    if (w.fructanCycles72 >= 2) {
      score += 4;
      codes.push('cycles.many');
    } else if (w.fructanCycles72 >= 1) {
      score += 2;
      codes.push('cycles.one');
    }

    if (w.frostOvernight) {
      score += 2;
      codes.push('frostNight');
    }
    if (w.sunnyToday) {
      score += 2;
      codes.push('sunny');
    }
    if (w.frostOvernight && w.sunnyToday) {
      score += 1;
    }

    if (w.soilFrozen) {
      score += 3;
      codes.push('soilFrozen');
    }

    if (w.nowHour >= 13 && w.nowHour <= 19) score += 1;

    if (horse.risk === 'high') score += 3;
    else if (horse.risk === 'medium') score += 1;

    var bestWindow = computeWindow(w);
    var fructanCycles72 = w.fructanCycles72 || 0;
    var soilFrozen = !!w.soilFrozen;

    if (
      horse.risk === 'high' &&
      (fructanCycles72 >= 1 || soilFrozen || (w.frostOvernight && w.sunnyToday))
    ) {
      return {
        grazing: 'risky',
        score: score,
        reasonCodes: ['hardStop'],
        bestWindow: '—',
        fructanCycles72: fructanCycles72,
        soilFrozen: soilFrozen,
      };
    }

    var grazing;
    var finalCodes;
    if (score <= 3) {
      grazing = 'safe';
      finalCodes = ['normal'];
    } else if (score <= 7) {
      grazing = 'caution';
      finalCodes = codes.length > 0 ? codes : ['elevated'];
    } else {
      grazing = 'risky';
      finalCodes = ['multipleFactors'];
    }

    return {
      grazing: grazing,
      score: score,
      reasonCodes: finalCodes,
      bestWindow: bestWindow,
      fructanCycles72: fructanCycles72,
      soilFrozen: soilFrozen,
    };
  }

  function decide(horse, w) {
    return {
      blanket: decideBlanket(horse, w),
      grazing: decideGrazing(horse, w),
      logicVersion: LOGIC_VERSION,
    };
  }

  window.SW = window.SW || {};
  window.SW.LOGIC_VERSION = LOGIC_VERSION;
  window.SW.decideBlanket = decideBlanket;
  window.SW.decideGrazing = decideGrazing;
  window.SW.decide = decide;
  window.SW.computeWindow = computeWindow;
})();
