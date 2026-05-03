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

  function defaults() {
    return {
      tMin: 0,
      windKmh: 0,
      rainMm: 0,
      frostOvernight: false,
      sunnyToday: false,
      nowHour: 8,
      fructanCycles72: 0,
      soilFrozen: false,
      tempByHour: [],
    };
  }

  function runAll() {
    // ---------- decideBlanket (unchanged) ----------
    test('decideBlanket: unclipped, mild day (tMin=10) -> no', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: 10, windKmh: 0, rainMm: 0 }), 'no');
    });

    test('decideBlanket: unclipped, tMin=5 boundary -> no', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: 5, windKmh: 0, rainMm: 0 }), 'no');
    });

    test('decideBlanket: unclipped, tMin=4 -> light', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: 4, windKmh: 0, rainMm: 0 }), 'light');
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

    test('decideBlanket: rain>5 subtracts 2 (unclipped, tMin=6, rain=10 -> light)', function () {
      assertEqual(blanket({ clipped: false, sensitive: false }, { tMin: 6, windKmh: 0, rainMm: 10 }), 'light');
    });

    test('decideBlanket: sensitive subtracts 2 (unclipped, tMin=6, sensitive -> light)', function () {
      assertEqual(blanket({ clipped: false, sensitive: true }, { tMin: 6, windKmh: 0, rainMm: 0 }), 'light');
    });

    // ---------- decideGrazing v2 ----------
    test('grazing v2: low risk, calm -> safe', function () {
      var r = grazing({ risk: 'low' }, defaults());
      assertEqual(r.grazing, 'safe');
      assertEqual(r.score, 0);
    });

    test('grazing v2: low risk, frost+sun today only -> caution (score 5)', function () {
      var w = defaults(); w.frostOvernight = true; w.sunnyToday = true;
      var r = grazing({ risk: 'low' }, w);
      assertEqual(r.score, 5);
      assertEqual(r.grazing, 'caution');
    });

    test('grazing v2: low risk + 2 prior cycles + frost+sun today -> risky', function () {
      var w = defaults(); w.frostOvernight = true; w.sunnyToday = true; w.fructanCycles72 = 2;
      var r = grazing({ risk: 'low' }, w);
      // cycles 4 + frost 2 + sun 2 + combo 1 = 9
      assertEqual(r.score, 9);
      assertEqual(r.grazing, 'risky');
    });

    test('grazing v2: 1 prior cycle + frost+sun today -> caution (score 7)', function () {
      var w = defaults(); w.frostOvernight = true; w.sunnyToday = true; w.fructanCycles72 = 1;
      var r = grazing({ risk: 'low' }, w);
      // cycles 2 + frost 2 + sun 2 + combo 1 = 7
      assertEqual(r.score, 7);
      assertEqual(r.grazing, 'caution');
    });

    test('grazing v2: cloudy cold day scores lower than sunny cold day', function () {
      var cloudy = defaults(); cloudy.frostOvernight = true; cloudy.sunnyToday = false;
      var sunny = defaults(); sunny.frostOvernight = true; sunny.sunnyToday = true;
      var rc = grazing({ risk: 'low' }, cloudy);
      var rs = grazing({ risk: 'low' }, sunny);
      if (!(rc.score < rs.score)) throw new Error('cloudy ' + rc.score + ' should be < sunny ' + rs.score);
    });

    test('grazing v2: soil frozen + low risk -> bestWindow "—"', function () {
      var w = defaults(); w.soilFrozen = true;
      var r = grazing({ risk: 'low' }, w);
      assertEqual(r.bestWindow, '—');
      assertEqual(r.soilFrozen, true);
    });

    test('grazing v2: high risk + 1 cycle short-circuits -> hardStop code', function () {
      var w = defaults(); w.fructanCycles72 = 1;
      var r = grazing({ risk: 'high' }, w);
      assertEqual(r.grazing, 'risky');
      assertEqual(r.bestWindow, '—');
      assertEqual((r.reasonCodes || []).join(','), 'hardStop');
    });

    test('grazing v2: low risk safe -> reasonCodes ["normal"]', function () {
      var r = grazing({ risk: 'low' }, defaults());
      assertEqual((r.reasonCodes || []).join(','), 'normal');
    });

    test('grazing v2: caution emits factor codes', function () {
      var w = defaults(); w.frostOvernight = true; w.sunnyToday = true;
      var r = grazing({ risk: 'low' }, w);
      // caution branch with frost+sun: codes = ['frostNight','sunny']
      assertEqual((r.reasonCodes || []).join(','), 'frostNight,sunny');
    });

    test('grazing v2: risky (>=8) emits multipleFactors', function () {
      var w = defaults();
      w.fructanCycles72 = 2; w.frostOvernight = true; w.sunnyToday = true;
      var r = grazing({ risk: 'low' }, w);
      assertEqual(r.grazing, 'risky');
      assertEqual((r.reasonCodes || []).join(','), 'multipleFactors');
    });

    test('blanket: emits reasonParts + feltLike', function () {
      var d = window.SW.decideBlanket(
        { clipped: false, sensitive: true },
        { tMin: 6, windKmh: 30, rainMm: 10 }
      );
      assertEqual(Array.isArray(d.reasonParts), true);
      // tMin always present; wind 25-45 emits wind; rain>5 emits rain; sensitive emits sensitive
      var codes = d.reasonParts.map(function (p) { return p.code; }).join(',');
      assertEqual(codes, 'tMin,wind,rain,sensitive');
      assertEqual(typeof d.feltLike, 'number');
    });

    test('grazing v2: high risk + frost+sun short-circuits', function () {
      var w = defaults(); w.frostOvernight = true; w.sunnyToday = true;
      var r = grazing({ risk: 'high' }, w);
      assertEqual(r.grazing, 'risky');
      assertEqual(r.bestWindow, '—');
    });

    test('grazing v2: high risk + soil frozen short-circuits', function () {
      var w = defaults(); w.soilFrozen = true;
      var r = grazing({ risk: 'high' }, w);
      assertEqual(r.grazing, 'risky');
      assertEqual(r.bestWindow, '—');
    });

    test('grazing v2: high risk + frost only (no sun, no cycle, no soil) -> caution', function () {
      var w = defaults(); w.frostOvernight = true;
      var r = grazing({ risk: 'high' }, w);
      // frost 2 + risk 3 = 5
      assertEqual(r.score, 5);
      assertEqual(r.grazing, 'caution');
    });

    test('grazing v2: medium risk + sunny only -> safe', function () {
      var w = defaults(); w.sunnyToday = true;
      var r = grazing({ risk: 'medium' }, w);
      assertEqual(r.score, 3);
      assertEqual(r.grazing, 'safe');
    });

    test('grazing v2: result includes fructanCycles72 and soilFrozen', function () {
      var w = defaults(); w.fructanCycles72 = 2; w.soilFrozen = true;
      var r = grazing({ risk: 'low' }, w);
      assertEqual(r.fructanCycles72, 2);
      assertEqual(r.soilFrozen, true);
    });

    // ---------- computeWindow ----------
    test('computeWindow: soil frozen -> "—"', function () {
      assertEqual(window.SW.computeWindow({ soilFrozen: true }), '—');
    });

    test('computeWindow: no hourly, frost+sun -> 10:00 – 14:00', function () {
      assertEqual(window.SW.computeWindow({ frostOvernight: true, sunnyToday: true }), '10:00 – 14:00');
    });

    test('computeWindow: no hourly, frost only -> 08:00 – 16:00', function () {
      assertEqual(window.SW.computeWindow({ frostOvernight: true }), '08:00 – 16:00');
    });

    test('computeWindow: no hourly, sunny only -> 06:00 – 12:00', function () {
      assertEqual(window.SW.computeWindow({ sunnyToday: true }), '06:00 – 12:00');
    });

    test('computeWindow: no hourly, calm -> 06:00 – 20:00', function () {
      assertEqual(window.SW.computeWindow({}), '06:00 – 20:00');
    });

    test('computeWindow: hourly thaw at 09 + frost+sun -> 09:00 – 12:00', function () {
      var byHour = [];
      for (var h = 0; h < 24; h++) byHour.push({ hour: h, temp: h >= 9 ? 6 : -2, cloud: 20 });
      var w = { frostOvernight: true, sunnyToday: true, tempByHour: byHour };
      assertEqual(window.SW.computeWindow(w), '09:00 – 12:00');
    });

    test('computeWindow: never thaws -> "—"', function () {
      var byHour = [];
      for (var h = 0; h < 24; h++) byHour.push({ hour: h, temp: -3, cloud: 20 });
      var w = { frostOvernight: true, sunnyToday: false, tempByHour: byHour };
      assertEqual(window.SW.computeWindow(w), '—');
    });

    test('computeWindow: hourly thaw at 07 + cloudy mild -> 07:00 – 20:00', function () {
      var byHour = [];
      for (var h = 0; h < 24; h++) byHour.push({ hour: h, temp: h >= 7 ? 8 : 2, cloud: 80 });
      var w = { frostOvernight: false, sunnyToday: false, tempByHour: byHour };
      assertEqual(window.SW.computeWindow(w), '07:00 – 20:00');
    });

    // ---------- composition ----------
    test('decide() returns { blanket, grazing, logicVersion: "2.1.0" }', function () {
      var out = window.SW.decide(
        { clipped: false, sensitive: false, risk: 'low' },
        {
          tMin: 10, windKmh: 0, rainMm: 0,
          frostOvernight: false, sunnyToday: false, nowHour: 8,
          fructanCycles72: 0, soilFrozen: false, tempByHour: [],
        }
      );
      if (!out.blanket || typeof out.blanket !== 'object') throw new Error('missing blanket object');
      if (!out.grazing || typeof out.grazing !== 'object') throw new Error('missing grazing object');
      assertEqual(out.logicVersion, '2.1.0');
      assertEqual(out.blanket.blanket, 'no');
      assertEqual(out.grazing.grazing, 'safe');
    });

    test('LOGIC_VERSION === "2.1.0"', function () {
      assertEqual(window.SW.LOGIC_VERSION, '2.1.0');
    });

    // ---------- blanketGramaj ----------
    test('blanketGramaj: no -> null', function () {
      assertEqual(window.SW.blanketGramaj('no'), null);
    });
    test('blanketGramaj: light -> 100g', function () {
      assertEqual(window.SW.blanketGramaj('light'), '100g');
    });
    test('blanketGramaj: medium -> 200g', function () {
      assertEqual(window.SW.blanketGramaj('medium'), '200g');
    });
    test('blanketGramaj: heavy -> 300g', function () {
      assertEqual(window.SW.blanketGramaj('heavy'), '300g');
    });

    // ---------- compareBlanket ----------
    test('compareBlanket: same -> 0', function () {
      assertEqual(window.SW.compareBlanket('light', 'light'), 0);
    });
    test('compareBlanket: lighter -> negative', function () {
      if (!(window.SW.compareBlanket('light', 'medium') < 0)) {
        throw new Error('expected light < medium');
      }
    });
    test('compareBlanket: heavier -> positive', function () {
      if (!(window.SW.compareBlanket('heavy', 'medium') > 0)) {
        throw new Error('expected heavy > medium');
      }
    });

    // ---------- hourlyGrazingRisk ----------
    test('hourlyGrazingRisk: low risk warm hour -> safe', function () {
      var w = { tempByHour: [{ hour: 12, temp: 10, cloud: 50 }], soilFrozen: false };
      var arr = window.SW.hourlyGrazingRisk({ risk: 'low' }, w);
      assertEqual(arr.length, 1);
      assertEqual(arr[0].level, 'safe');
    });

    test('hourlyGrazingRisk: low risk freezing hour -> risky', function () {
      var w = { tempByHour: [{ hour: 4, temp: -2, cloud: 10 }], soilFrozen: false };
      var arr = window.SW.hourlyGrazingRisk({ risk: 'low' }, w);
      assertEqual(arr[0].level, 'risky');
    });

    test('hourlyGrazingRisk: soil frozen forces risky', function () {
      var w = { tempByHour: [{ hour: 12, temp: 15, cloud: 80 }], soilFrozen: true };
      var arr = window.SW.hourlyGrazingRisk({ risk: 'low' }, w);
      assertEqual(arr[0].level, 'risky');
    });

    test('hourlyGrazingRisk: high risk same warmth tighter than low', function () {
      var w = { tempByHour: [{ hour: 12, temp: 7, cloud: 50 }], soilFrozen: false };
      var lowArr = window.SW.hourlyGrazingRisk({ risk: 'low' }, w);
      var highArr = window.SW.hourlyGrazingRisk({ risk: 'high' }, w);
      assertEqual(lowArr[0].level, 'safe');
      assertEqual(highArr[0].level, 'caution');
    });

    test('hourlyGrazingRisk: missing tempByHour returns []', function () {
      var arr = window.SW.hourlyGrazingRisk({ risk: 'low' }, {});
      assertEqual(arr.length, 0);
    });

    // ---------- blanketSegments ----------
    test('blanketSegments: morning aggregates 06-11', function () {
      var today = [];
      for (var h = 0; h < 24; h++) {
        today.push({ hour: h, temp: h, cloud: 50, wind: h * 2 });
      }
      var segs = window.SW.blanketSegments(today, []);
      assertEqual(segs.length, 4);
      assertEqual(segs[0].key, 'morning');
      // 06..11 avg = 8.5 -> rounds to 9 (Math.round)
      assertEqual(segs[0].data.tempAvg, 9);
      // wind max 11*2 = 22
      assertEqual(segs[0].data.windMax, 22);
    });

    test('blanketSegments: night merges today 21-23 + tomorrow 00-05', function () {
      var today = [
        { hour: 21, temp: 5, cloud: 60, wind: 10 },
        { hour: 22, temp: 4, cloud: 60, wind: 12 },
        { hour: 23, temp: 3, cloud: 60, wind: 14 },
      ];
      var tomorrow = [
        { hour: 0, temp: 2, cloud: 70, wind: 16 },
        { hour: 5, temp: 0, cloud: 80, wind: 8 },
      ];
      var segs = window.SW.blanketSegments(today, tomorrow);
      var night = segs[3];
      assertEqual(night.key, 'night');
      // (5+4+3+2+0)/5 = 2.8 -> 3
      assertEqual(night.data.tempAvg, 3);
      assertEqual(night.data.windMax, 16);
    });

    test('blanketSegments: empty input -> nulls', function () {
      var segs = window.SW.blanketSegments([], []);
      assertEqual(segs[0].data.tempAvg, null);
      assertEqual(segs[3].data.windMax, null);
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
