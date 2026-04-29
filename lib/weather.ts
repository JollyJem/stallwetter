// DWD weather via Brightsky's free JSON API (https://brightsky.dev).
// Same data as DWD MOSMIX, no API key, no rate limits at MVP scale.
// Maps the hourly response into our WeatherInput shape.

import type { WeatherInput } from './decision';

type BrightskyHour = {
  timestamp: string;
  temperature: number | null;
  wind_gust_speed: number | null;
  precipitation: number | null;
  cloud_cover: number | null;
};

type BrightskyResponse = {
  weather: BrightskyHour[];
};

const cache = new Map<string, { data: WeatherInput; expiresAt: number }>();
const TTL_MS = 15 * 60 * 1000;

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherInput> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.data;

  const today = new Date();
  const url = `https://api.brightsky.dev/weather?lat=${lat}&lon=${lng}&date=${dateKey(today)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wetterdienst nicht erreichbar (${res.status})`);
  const data = (await res.json()) as BrightskyResponse;

  const hours = data.weather ?? [];
  if (hours.length === 0) throw new Error('Keine Wetterdaten verfügbar');

  const nowHour = today.getHours();

  const temps = hours.map(h => h.temperature).filter((t): t is number => t !== null);
  const tMin = temps.length > 0 ? Math.min(...temps) : 0;

  const overnightTemps = hours
    .filter(h => new Date(h.timestamp).getHours() <= 6)
    .map(h => h.temperature)
    .filter((t): t is number => t !== null);
  const frostOvernight = overnightTemps.length > 0 && Math.min(...overnightTemps) < 2;

  const dayClouds = hours
    .filter(h => {
      const hr = new Date(h.timestamp).getHours();
      return hr >= 10 && hr <= 16;
    })
    .map(h => h.cloud_cover)
    .filter((c): c is number => c !== null);
  const avgClouds =
    dayClouds.length > 0 ? dayClouds.reduce((a, b) => a + b, 0) / dayClouds.length : 100;
  const sunnyToday = avgClouds < 40;

  const winds = hours.map(h => h.wind_gust_speed).filter((w): w is number => w !== null);
  const windKmh = winds.length > 0 ? Math.max(...winds) : 0;

  const rainMm = hours
    .map(h => h.precipitation)
    .filter((p): p is number => p !== null)
    .reduce((a, b) => a + b, 0);

  const result: WeatherInput = { tMin, windKmh, rainMm, frostOvernight, sunnyToday, nowHour };
  cache.set(key, { data: result, expiresAt: Date.now() + TTL_MS });
  return result;
}
