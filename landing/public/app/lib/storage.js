// Local horse profiles + action log via localStorage. Ported from lib/storage.ts.
(function () {
  'use strict';

  var KEY = 'stallwetter:horses';
  var LOG_KEY = 'stallwetter:log';
  var LOG_CAP = 200;

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

  function readLog() {
    try {
      var raw = localStorage.getItem(LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeLog(entries) {
    localStorage.setItem(LOG_KEY, JSON.stringify(entries));
  }

  function listHorses() {
    return Promise.resolve(readAll());
  }

  function findHorse(id) {
    var matches = readAll().filter(function (h) { return h.id === id; });
    return Promise.resolve(matches.length > 0 ? matches[0] : null);
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

  function updateHorse(id, patch) {
    var horses = readAll();
    for (var i = 0; i < horses.length; i++) {
      if (horses[i].id === id) {
        var keys = Object.keys(patch || {});
        for (var k = 0; k < keys.length; k++) {
          horses[i][keys[k]] = patch[keys[k]];
        }
        writeAll(horses);
        return Promise.resolve(horses[i]);
      }
    }
    return Promise.reject(new Error('horse not found'));
  }

  function deleteHorse(id) {
    var horses = readAll().filter(function (h) {
      return h.id !== id;
    });
    writeAll(horses);
    return Promise.resolve();
  }

  function addLogEntry(entry) {
    var entries = readLog();
    var now = Date.now();
    entries.push({
      id: now + '-' + Math.random().toString(36).slice(2, 6),
      ts: now,
      horseId: entry.horseId,
      type: entry.type,
      payload: entry.payload || {},
    });
    if (entries.length > LOG_CAP) entries = entries.slice(-LOG_CAP);
    writeLog(entries);
    return Promise.resolve(entries[entries.length - 1]);
  }

  function getLastLogEntry(horseId, type) {
    var entries = readLog();
    for (var i = entries.length - 1; i >= 0; i--) {
      if (entries[i].horseId === horseId && entries[i].type === type) {
        return Promise.resolve(entries[i]);
      }
    }
    return Promise.resolve(null);
  }

  window.SW = window.SW || {};
  window.SW.listHorses = listHorses;
  window.SW.findHorse = findHorse;
  window.SW.addHorse = addHorse;
  window.SW.updateHorse = updateHorse;
  window.SW.deleteHorse = deleteHorse;
  window.SW.addLogEntry = addLogEntry;
  window.SW.getLastLogEntry = getLastLogEntry;
})();
