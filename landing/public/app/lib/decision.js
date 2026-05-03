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

  function blanketGramaj(blanket) {
    if (blanket === 'light') return '100g';
    if (blanket === 'medium') return '200g';
    if (blanket === 'heavy') return '300g';
    return null;
  }

  // Per-hour grazing risk traffic light. Risk thresholds tighten with horse risk
  // tier; soil-frozen forces every hour to risky (no sugar drop).
  function hourlyGrazingRisk(horse, w) {
    var byHour = (w && w.tempByHour) || [];
    var risk = (horse && horse.risk) || 'low';
    var soilFrozen = !!(w && w.soilFrozen);
    var arr = [];
    for (var i = 0; i < byHour.length; i++) {
      var h = byHour[i];
      var temp = h.temp;
      var level;
      if (soilFrozen) {
        level = 'risky';
      } else if (temp == null) {
        level = 'caution';
      } else if (risk === 'high') {
        if (temp > 8) level = 'safe';
        else if (temp > 3) level = 'caution';
        else level = 'risky';
      } else if (risk === 'medium') {
        if (temp > 6) level = 'safe';
        else if (temp > 1) level = 'caution';
        else level = 'risky';
      } else {
        if (temp > 5) level = 'safe';
        else if (temp > 0) level = 'caution';
        else level = 'risky';
      }
      arr.push({ hour: h.hour, level: level, temp: temp, cloud: h.cloud });
    }
    return arr;
  }

  // Aggregate hourly weather into 4 day-parts (morning/noon/evening/night).
  // Caller passes a flat list of hour entries; for the night segment, pass
  // today 21-23 + tomorrow 00-06.
  function aggregateSegment(hours, hourMatches) {
    var temps = [];
    var winds = [];
    var clouds = [];
    for (var i = 0; i < hours.length; i++) {
      if (!hourMatches(hours[i])) continue;
      if (hours[i].temp != null) temps.push(hours[i].temp);
      if (hours[i].wind != null) winds.push(hours[i].wind);
      if (hours[i].cloud != null) clouds.push(hours[i].cloud);
    }
    function avgArr(a) {
      if (a.length === 0) return null;
      var s = 0;
      for (var i = 0; i < a.length; i++) s += a[i];
      return s / a.length;
    }
    var tAvg = avgArr(temps);
    var cAvg = avgArr(clouds);
    return {
      tempAvg: tAvg == null ? null : Math.round(tAvg),
      windMax: winds.length > 0 ? Math.round(Math.max.apply(null, winds)) : null,
      cloudAvg: cAvg == null ? null : Math.round(cAvg),
    };
  }

  function blanketSegments(todayHours, tomorrowHours) {
    todayHours = todayHours || [];
    tomorrowHours = tomorrowHours || [];
    var morning = aggregateSegment(todayHours, function (h) { return h.hour >= 6 && h.hour < 12; });
    var noon = aggregateSegment(todayHours, function (h) { return h.hour >= 12 && h.hour < 15; });
    var evening = aggregateSegment(todayHours, function (h) { return h.hour >= 15 && h.hour < 21; });
    var nightHours = [];
    for (var i = 0; i < todayHours.length; i++) {
      if (todayHours[i].hour >= 21) nightHours.push(todayHours[i]);
    }
    for (var j = 0; j < tomorrowHours.length; j++) {
      if (tomorrowHours[j].hour < 6) nightHours.push(tomorrowHours[j]);
    }
    var night = aggregateSegment(nightHours, function () { return true; });
    return [
      { key: 'morning', data: morning },
      { key: 'noon', data: noon },
      { key: 'evening', data: evening },
      { key: 'night', data: night },
    ];
  }

  function compareBlanket(a, b) {
    var order = { no: 0, light: 1, medium: 2, heavy: 3 };
    return (order[a] || 0) - (order[b] || 0);
  }

  window.SW = window.SW || {};
  window.SW.LOGIC_VERSION = LOGIC_VERSION;
  window.SW.decideBlanket = decideBlanket;
  window.SW.decideGrazing = decideGrazing;
  window.SW.decide = decide;
  window.SW.computeWindow = computeWindow;
  window.SW.blanketGramaj = blanketGramaj;
  window.SW.hourlyGrazingRisk = hourlyGrazingRisk;
  window.SW.blanketSegments = blanketSegments;
  window.SW.compareBlanket = compareBlanket;
})();
