// Local horse profiles via localStorage. Ported from lib/storage.ts.
(function () {
  'use strict';

  var KEY = 'stallwetter:horses';

  function readAll() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeAll(horses) {
    localStorage.setItem(KEY, JSON.stringify(horses));
  }

  function listHorses() {
    return Promise.resolve(readAll());
  }

  function addHorse(input) {
    var horses = readAll();
    var horse = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      name: input.name,
      lat: input.lat,
      lng: input.lng,
      clipped: !!input.clipped,
      sensitive: !!input.sensitive,
      risk: input.risk,
    };
    horses.push(horse);
    writeAll(horses);
    return Promise.resolve(horse);
  }

  function deleteHorse(id) {
    var horses = readAll().filter(function (h) {
      return h.id !== id;
    });
    writeAll(horses);
    return Promise.resolve();
  }

  window.SW = window.SW || {};
  window.SW.listHorses = listHorses;
  window.SW.addHorse = addHorse;
  window.SW.deleteHorse = deleteHorse;
})();
