(function () {
  'use strict';

  var results = [];

  function test(name, fn) {
    try {
      fn();
      results.push({ name: name, ok: true });
    } catch (e) {
      results.push({ name: name, ok: false, err: (e && e.message) || String(e) });
    }
  }

  function assertEqual(a, b, msg) {
    if (a !== b) {
      throw new Error((msg ? msg + ': ' : '') + 'expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a));
    }
  }

  function blanket(horse, w) {
    return window.SW.decideBlanket(horse, w).blanket;
  }

  function grazing(horse, w) {
    return window.SW.decideGrazing(horse, w);
  }

  function runAll() {
    // ---------- decideBlanket ----------
    test('decideBlanket: unclipped, mild day (tMin=10) -> no', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: 10, windKmh: 0, rainMm: 0 }), 'no');
    });

    test('decideBlanket: unclipped, tMin=5 boundary -> no', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: 5, windKmh: 0, rainMm: 0 }), 'no');
    });

    test('decideBlanket: unclipped, tMin=4 -> light', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: 4, windKmh: 0, rainMm: 0 }), 'light');
    });

    test('decideBlanket: unclipped, tMin=3 -> light', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: 3, windKmh: 0, rainMm: 0 }), 'light');
    });

    test('decideBlanket: unclipped, tMin=-1 -> medium', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: -1, windKmh: 0, rainMm: 0 }), 'medium');
    });

    test('decideBlanket: clipped, tMin=10 -> no', function () {
      assertEqual(blanket({ clipped: true, sensitive: false }, { tMin: 10, windKmh: 0, rainMm: 0 }), 'no');
    });

    test('decideBlanket: clipped, tMin=7 -> light', function () {
      assertEqual(blanket({ clipped: true, sensitive: false }, { tMin: 7, windKmh: 0, rainMm: 0 }), 'light');
    });

    test('decideBlanket: clipped, tMin=2 -> medium', function () {
      assertEqual(blanket({ clipped: true, sensitive: false }, { tMin: 2, windKmh: 0, rainMm: 0 }), 'medium');
    });

    test('decideBlanket: clipped, tMin=-5 -> heavy', function () {
      assertEqual(blanket({ clipped: true, sensitive: false }, { tMin: -5, windKmh: 0, rainMm: 0 }), 'heavy');
    });

    test('decideBlanket: wind>45 subtracts 4 (clipped, tMin=12, wind=50 -> light)', function () {
      assertEqual(blanket({ clipped: true, sensitive: false }, { tMin: 12, windKmh: 50, rainMm: 0 }), 'light');
    });

    test('decideBlanket: wind 25-45 subtracts 2 (unclipped, tMin=6, wind=30 -> light)', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: 6, windKmh: 30, rainMm: 0 }), 'light');
    });

    test('decideBlanket: rain>5 subtracts 2 (unclipped, tMin=6, rain=10 -> light)', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: 6, windKmh: 0, rainMm: 10 }), 'light');
    });

    test('decideBlanket: sensitive subtracts 2 (unclipped, tMin=6, sensitive -> light)', function () {
      assertEqual(blanket({ clipped: false, sensitive: true }, { tMin: 6, windKmh: 0, rainMm: 0 }), 'light');
    });

    test('decideBlanket: combined (clipped, tMin=5, wind=50, rain=10, sensitive -> heavy)', function () {
      assertEqual(blanket({ clipped: true, sensitive: true }, { tMin: 5, windKmh: 50, rainMm: 10 }), 'heavy');
    });

    // ---------- decideGrazing ----------
    test('decideGrazing: low risk, no frost, cloudy, hour=8 -> safe', function () {
      var r = grazing({ risk: 'low' }, { frostOvernight: false, sunnyToday: false, nowHour: 8 });
      assertEqual(r.grazing, 'safe');
      assertEqual(r.score, 0);
      assertEqual(r.bestWindow, '05:00 – 10:00');
    });

    test('decideGrazing: low risk, frost+sun, hour=14 (score=6) -> risky', function () {
      var r = grazing({ risk: 'low' }, { frostOvernight: true, sunnyToday: true, nowHour: 14 });
      assertEqual(r.grazing, 'risky');
      assertEqual(r.score, 6);
      assertEqual(r.bestWindow, '05:00 – 10:00');
    });

    test('decideGrazing: medium risk, sunny, hour=14 (score=4) -> caution', function () {
      var r = grazing({ risk: 'medium' }, { frostOvernight: false, sunnyToday: true, nowHour: 14 });
      assertEqual(r.grazing, 'caution');
      assertEqual(r.score, 4);
    });

    test('decideGrazing: high risk + frost short-circuits -> risky with specific reason', function () {
      var r = grazing({ risk: 'high' }, { frostOvernight: true, sunnyToday: false, nowHour: 8 });
      assertEqual(r.grazing, 'risky');
      assertEqual(r.reason, 'Hufrehe-Risiko + Frost in der Nacht → kein Gras heute');
      assertEqual(r.bestWindow, '—');
    });

    test('decideGrazing: high risk, no frost, cloudy, hour=8 (score=3) -> caution', function () {
      var r = grazing({ risk: 'high' }, { frostOvernight: false, sunnyToday: false, nowHour: 8 });
      assertEqual(r.grazing, 'caution');
      assertEqual(r.score, 3);
      assertEqual(r.bestWindow, '05:00 – 10:00');
    });

    test('decideGrazing: bestWindow is "05:00 – 10:00" when not short-circuited', function () {
      var r = grazing({ risk: 'low' }, { frostOvernight: false, sunnyToday: true, nowHour: 14 });
      assertEqual(r.bestWindow, '05:00 – 10:00');
    });

    // ---------- decide() composition ----------
    test('decide() returns { blanket, grazing, logicVersion: "1.0.0" }', function () {
      var out = window.SW.decide(
        { clipped: false, sensitive: false, risk: 'low' },
        { tMin: 10, windKmh: 0, rainMm: 0, frostOvernight: false, sunnyToday: false, nowHour: 8 }
      );
      if (!out.blanket || typeof out.blanket !== 'object') throw new Error('missing blanket object');
      if (!out.grazing || typeof out.grazing !== 'object') throw new Error('missing grazing object');
      assertEqual(out.logicVersion, '1.0.0');
      assertEqual(out.blanket.blanket, 'no');
      assertEqual(out.grazing.grazing, 'safe');
    });

    test('LOGIC_VERSION === "1.0.0"', function () {
      assertEqual(window.SW.LOGIC_VERSION, '1.0.0');
    });

    render();
  }

  function render() {
    var ul = document.getElementById('results');
    var passed = 0;
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var li = document.createElement('li');
      li.className = r.ok ? 'pass' : 'fail';
      li.textContent = r.name;
      if (!r.ok && r.err) {
        var span = document.createElement('span');
        span.className = 'err';
        span.textContent = r.err;
        li.appendChild(span);
      }
      ul.appendChild(li);
      if (r.ok) passed++;
    }
    var summary = document.getElementById('summary');
    summary.textContent = passed + ' / ' + results.length + ' passed';
    summary.style.color = passed === results.length ? '#047857' : '#b91c1c';
  }

  window.addEventListener('load', runAll);
})();
