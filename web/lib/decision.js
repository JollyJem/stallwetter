// Pure rule engine for blanket + grazing decisions.
// Ported verbatim from lib/decision.ts.
(function () {
  'use strict';

  var LOGIC_VERSION = '1.0.0';

  function decideBlanket(horse, w) {
    var tEff = w.tMin;
    var parts = ['Min ' + Math.round(w.tMin) + ' °C'];

    if (w.windKmh > 45) {
      tEff -= 4;
      parts.push('Wind ' + Math.round(w.windKmh) + ' km/h');
    } else if (w.windKmh > 25) {
      tEff -= 2;
      parts.push('Wind ' + Math.round(w.windKmh) + ' km/h');
    }

    if (w.rainMm > 5) {
      tEff -= 2;
      parts.push('Regen ' + Math.round(w.rainMm) + ' mm');
    }

    if (horse.sensitive) {
      tEff -= 2;
      parts.push('empfindliches Pferd');
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
      reason: parts.join(', ') + ' → gefühlt ' + Math.round(tEff) + ' °C',
    };
  }

  function decideGrazing(horse, w) {
    var score = 0;
    if (w.frostOvernight) score += 3;
    if (w.sunnyToday) score += 2;
    if (w.nowHour >= 13 && w.nowHour <= 19) score += 1;
    if (horse.risk === 'high') score += 3;
    else if (horse.risk === 'medium') score += 1;

    if (horse.risk === 'high' && w.frostOvernight) {
      return {
        grazing: 'risky',
        score: score,
        reason: 'Hufrehe-Risiko + Frost in der Nacht → kein Gras heute',
        bestWindow: '—',
      };
    }

    var grazing;
    var reason;
    if (score <= 2) {
      grazing = 'safe';
      reason = 'Bedingungen normal, kein Fruktan-Anstieg erwartet';
    } else if (score <= 5) {
      grazing = 'caution';
      if (w.frostOvernight && w.sunnyToday)
        reason = 'Frost & Sonne → Fruktan steigt nachmittags';
      else if (w.frostOvernight) reason = 'Frost in der Nacht, Zucker noch hoch im Gras';
      else reason = 'Sonnig, Graszucker erhöht';
    } else {
      grazing = 'risky';
      reason = 'Mehrere Zucker-Faktoren, lieber Paddock + Heu';
    }

    return { grazing: grazing, score: score, reason: reason, bestWindow: '05:00 – 10:00' };
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
})();
