// Brightsky weather fetch with 15-minute in-memory cache.
// Pulls 72hr lookback + today so we can score multi-day fructan trends,
// derive a soil-freeze proxy, and compute a dynamic grazing window.
(function () {
  'use strict';

  var cache = {};
  var TTL_MS = 15 * 60 * 1000;

  function dateKey(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1);
    if (m.length < 2) m = '0' + m;
    var day = String(d.getDate());
    if (day.length < 2) day = '0' + day;
    return y + '-' + m + '-' + day;
  }

  function notNull(v) { return v !== null && v !== undefined; }

  function avg(arr) {
    if (arr.length === 0) return null;
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
  }

  function fetchWeather(lat, lng) {
    var key = lat.toFixed(2) + ',' + lng.toFixed(2);
    var hit = cache[key];
    if (hit && hit.expiresAt > Date.now()) {
      return Promise.resolve(hit.data);
    }

    var today = new Date();
    var startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 3);
    var endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1);

    var url =
      'https://api.brightsky.dev/weather?lat=' + lat + '&lon=' + lng +
      '&date=' + dateKey(startDate) +
      '&last_date=' + dateKey(endDate);

    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Wetterdienst nicht erreichbar (' + res.status + ')');
        }
        return res.json();
      })
      .then(function (data) {
        var hours = (data && data.weather) || [];
        if (hours.length === 0) throw new Error('Keine Wetterdaten verfügbar');

        var nowMs = Date.now();
        var nowHour = today.getHours();
        var todayKey = dateKey(today);

        var annotated = [];
        for (var i = 0; i < hours.length; i++) {
          var h = hours[i];
          var ts = new Date(h.timestamp);
          annotated.push({
            tsMs: ts.getTime(),
            date: dateKey(ts),
            hour: ts.getHours(),
            temp: h.temperature,
            cloud: h.cloud_cover,
            wind: h.wind_gust_speed,
            rain: h.precipitation,
          });
        }

        var todayHours = [];
        var last72 = [];
        var last24 = [];
        for (var j = 0; j < annotated.length; j++) {
          var a = annotated[j];
          if (a.date === todayKey) todayHours.push(a);
          if (a.tsMs >= nowMs - 72 * 3600 * 1000 && a.tsMs <= nowMs) last72.push(a);
          if (a.tsMs >= nowMs - 24 * 3600 * 1000 && a.tsMs <= nowMs) last24.push(a);
        }

        var todayTemps = todayHours.map(function (x) { return x.temp; }).filter(notNull);
        var tMin = todayTemps.length > 0 ? Math.min.apply(null, todayTemps) : 0;
        var tMaxToday = todayTemps.length > 0 ? Math.max.apply(null, todayTemps) : 0;

        var todayWinds = todayHours.map(function (x) { return x.wind; }).filter(notNull);
        var windKmh = todayWinds.length > 0 ? Math.max.apply(null, todayWinds) : 0;

        var rainMm = todayHours
          .map(function (x) { return x.rain; })
          .filter(notNull)
          .reduce(function (a, b) { return a + b; }, 0);

        var overnightTemps = todayHours
          .filter(function (x) { return x.hour <= 6; })
          .map(function (x) { return x.temp; })
          .filter(notNull);
        var frostOvernight =
          overnightTemps.length > 0 && Math.min.apply(null, overnightTemps) < 2;

        var dayClouds = todayHours
          .filter(function (x) { return x.hour >= 10 && x.hour <= 16; })
          .map(function (x) { return x.cloud; })
          .filter(notNull);
        var avgClouds = avg(dayClouds);
        if (avgClouds === null) avgClouds = 100;
        var sunnyToday = avgClouds < 40;

        // 72hr aggregates
        var frostHours72 = 0;
        var sunnyDaylightHours72 = 0;
        for (var k = 0; k < last72.length; k++) {
          var l = last72[k];
          if (l.temp != null && l.temp < 0) frostHours72++;
          if (l.cloud != null && l.cloud < 40 && l.hour >= 10 && l.hour <= 16) sunnyDaylightHours72++;
        }

        // Fructan cycles: per-day combo of overnight frost + sunny day in last 72hr
        var dayMap = {};
        for (var m = 0; m < last72.length; m++) {
          var n = last72[m];
          if (!dayMap[n.date]) dayMap[n.date] = { tempsNight: [], cloudsDay: [] };
          if (n.hour <= 6 && n.temp != null) dayMap[n.date].tempsNight.push(n.temp);
          if (n.hour >= 10 && n.hour <= 16 && n.cloud != null) dayMap[n.date].cloudsDay.push(n.cloud);
        }
        var fructanCycles72 = 0;
        Object.keys(dayMap).forEach(function (d) {
          var dm = dayMap[d];
          var nightFrost = dm.tempsNight.length > 0 && Math.min.apply(null, dm.tempsNight) < 0;
          var avgC = avg(dm.cloudsDay);
          if (avgC === null) avgC = 100;
          if (nightFrost && avgC < 50) fructanCycles72++;
        });

        // Soil-frozen proxy: extended cold + still cool air
        var last24Temps = last24.map(function (x) { return x.temp; }).filter(notNull);
        var min24 = last24Temps.length > 0 ? Math.min.apply(null, last24Temps) : 0;
        var hoursBelowZero24 = 0;
        for (var p = 0; p < last24.length; p++) {
          if (last24[p].temp != null && last24[p].temp < 0) hoursBelowZero24++;
        }
        var nowTemp = tMin;
        for (var q = annotated.length - 1; q >= 0; q--) {
          if (annotated[q].tsMs <= nowMs && annotated[q].temp != null) {
            nowTemp = annotated[q].temp;
            break;
          }
        }
        var soilFrozen = (min24 < -2 && nowTemp < 6) || (hoursBelowZero24 >= 12 && nowTemp < 5);

        todayHours.sort(function (a, b) { return a.hour - b.hour; });
        var tempByHour = todayHours.map(function (x) {
          return { hour: x.hour, temp: x.temp, cloud: x.cloud, wind: x.wind };
        });

        var tomorrowDate = new Date(today);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        var tomorrowKey = dateKey(tomorrowDate);
        var tomorrowHours = [];
        for (var jt = 0; jt < annotated.length; jt++) {
          if (annotated[jt].date === tomorrowKey) tomorrowHours.push(annotated[jt]);
        }
        tomorrowHours.sort(function (a, b) { return a.hour - b.hour; });

        var tomorrow = null;
        if (tomorrowHours.length > 0) {
          var tomTemps = tomorrowHours.map(function (x) { return x.temp; }).filter(notNull);
          var tomWinds = tomorrowHours.map(function (x) { return x.wind; }).filter(notNull);
          var tomRain = tomorrowHours
            .map(function (x) { return x.rain; })
            .filter(notNull)
            .reduce(function (a, b) { return a + b; }, 0);
          var tomOvernight = tomorrowHours
            .filter(function (x) { return x.hour <= 6; })
            .map(function (x) { return x.temp; })
            .filter(notNull);
          var tomDayClouds = tomorrowHours
            .filter(function (x) { return x.hour >= 10 && x.hour <= 16; })
            .map(function (x) { return x.cloud; })
            .filter(notNull);
          var tomAvgClouds = avg(tomDayClouds);
          if (tomAvgClouds === null) tomAvgClouds = 100;
          tomorrow = {
            tMin: tomTemps.length > 0 ? Math.min.apply(null, tomTemps) : 0,
            tMaxToday: tomTemps.length > 0 ? Math.max.apply(null, tomTemps) : 0,
            windKmh: tomWinds.length > 0 ? Math.max.apply(null, tomWinds) : 0,
            rainMm: tomRain,
            frostOvernight:
              tomOvernight.length > 0 && Math.min.apply(null, tomOvernight) < 2,
            sunnyToday: tomAvgClouds < 40,
            avgClouds: tomAvgClouds,
            nowHour: 12,
            fructanCycles72: fructanCycles72,
            soilFrozen: soilFrozen,
            tempByHour: tomorrowHours.map(function (x) {
              return { hour: x.hour, temp: x.temp, cloud: x.cloud, wind: x.wind };
            }),
          };
        }

        var result = {
          tMin: tMin,
          tMaxToday: tMaxToday,
          windKmh: windKmh,
          rainMm: rainMm,
          frostOvernight: frostOvernight,
          sunnyToday: sunnyToday,
          avgClouds: avgClouds,
          nowHour: nowHour,
          nowTemp: nowTemp,
          frostHours72: frostHours72,
          sunnyHours72: sunnyDaylightHours72,
          fructanCycles72: fructanCycles72,
          soilFrozen: soilFrozen,
          tempByHour: tempByHour,
          tomorrow: tomorrow,
        };
        cache[key] = { data: result, expiresAt: Date.now() + TTL_MS };
        return result;
      });
  }

  window.SW = window.SW || {};
  window.SW.fetchWeather = fetchWeather;
})();
