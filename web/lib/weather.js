// Brightsky weather fetch with 15-minute in-memory cache.
// Ported from lib/weather.ts.
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

  function fetchWeather(lat, lng) {
    var key = lat.toFixed(2) + ',' + lng.toFixed(2);
    var hit = cache[key];
    if (hit && hit.expiresAt > Date.now()) {
      return Promise.resolve(hit.data);
    }

    var today = new Date();
    var url =
      'https://api.brightsky.dev/weather?lat=' +
      lat +
      '&lon=' +
      lng +
      '&date=' +
      dateKey(today);

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

        var nowHour = today.getHours();

        var temps = hours
          .map(function (h) {
            return h.temperature;
          })
          .filter(function (t) {
            return t !== null && t !== undefined;
          });
        var tMin = temps.length > 0 ? Math.min.apply(null, temps) : 0;

        var overnightTemps = hours
          .filter(function (h) {
            return new Date(h.timestamp).getHours() <= 6;
          })
          .map(function (h) {
            return h.temperature;
          })
          .filter(function (t) {
            return t !== null && t !== undefined;
          });
        var frostOvernight =
          overnightTemps.length > 0 && Math.min.apply(null, overnightTemps) < 2;

        var dayClouds = hours
          .filter(function (h) {
            var hr = new Date(h.timestamp).getHours();
            return hr >= 10 && hr <= 16;
          })
          .map(function (h) {
            return h.cloud_cover;
          })
          .filter(function (c) {
            return c !== null && c !== undefined;
          });
        var avgClouds =
          dayClouds.length > 0
            ? dayClouds.reduce(function (a, b) {
                return a + b;
              }, 0) / dayClouds.length
            : 100;
        var sunnyToday = avgClouds < 40;

        var winds = hours
          .map(function (h) {
            return h.wind_gust_speed;
          })
          .filter(function (w) {
            return w !== null && w !== undefined;
          });
        var windKmh = winds.length > 0 ? Math.max.apply(null, winds) : 0;

        var rainMm = hours
          .map(function (h) {
            return h.precipitation;
          })
          .filter(function (p) {
            return p !== null && p !== undefined;
          })
          .reduce(function (a, b) {
            return a + b;
          }, 0);

        var result = {
          tMin: tMin,
          windKmh: windKmh,
          rainMm: rainMm,
          frostOvernight: frostOvernight,
          sunnyToday: sunnyToday,
          nowHour: nowHour,
        };
        cache[key] = { data: result, expiresAt: Date.now() + TTL_MS };
        return result;
      });
  }

  window.SW = window.SW || {};
  window.SW.fetchWeather = fetchWeather;
})();
