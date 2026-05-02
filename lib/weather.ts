// OpenWeatherMap integration: current + 5-day/3-hour forecast.
// Free tier endpoints (data/2.5/weather + data/2.5/forecast).
// Maps responses into WeatherInput, including feels-like, humidity,
// rain probability — used by decision.ts to highlight coat-wetting risk.

import type { WeatherInput } from './decision';

const API_KEY = process.env.EXPO_PUBLIC_OWM_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';

type CurrentResponse = {
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number; gust?: number };
  rain?: { '1h'?: number; '3h'?: number };
  clouds: { all: number };
  name: string;
};

type ForecastItem = {
  dt: number;
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number; gust?: number };
  rain?: { '3h'?: number };
  clouds: { all: number };
  pop: number;
};

type ForecastResponse = {
  list: ForecastItem[];
  city: { name: string };
};

const cache = new Map<string, { data: WeatherInput; expiresAt: number }>();
const TTL_MS = 15 * 60 * 1000;

export async function fetchWeather(lat: number, lng: number): Promise<WeatherInput> {
  if (!API_KEY) {
    throw new Error('EXPO_PUBLIC_OWM_KEY ist nicht gesetzt. Siehe .env.example.');
  }
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.data;

  const params = `lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=de`;
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${BASE}/weather?${params}`),
    fetch(`${BASE}/forecast?${params}`),
  ]);
  if (!currentRes.ok) throw new Error(`Wetterdienst nicht erreichbar (${currentRes.status})`);
  if (!forecastRes.ok) throw new Error(`Wettervorhersage nicht erreichbar (${forecastRes.status})`);

  const current = (await currentRes.json()) as CurrentResponse;
  const forecast = (await forecastRes.json()) as ForecastResponse;

  const now = new Date();
  const dayEndMs = new Date(now).setHours(23, 59, 59, 999);

  const todayItems = forecast.list.filter(it => {
    const ms = it.dt * 1000;
    return ms >= now.getTime() && ms <= dayEndMs;
  });
  const horizon = todayItems.length > 0 ? todayItems : forecast.list.slice(0, 8);

  const feelsLikes = [current.main.feels_like, ...horizon.map(i => i.main.feels_like)];
  const tFeelsLikeMin = Math.min(...feelsLikes);

  const temps = [current.main.temp, ...horizon.map(i => i.main.temp)];
  const tMin = Math.min(...temps);

  const currentWindKmh = (current.wind.gust ?? current.wind.speed) * 3.6;
  const horizonWinds = horizon.map(i => (i.wind.gust ?? i.wind.speed) * 3.6);
  const windKmh = Math.max(currentWindKmh, ...horizonWinds);

  const forecastRain = horizon.reduce((sum, i) => sum + (i.rain?.['3h'] ?? 0), 0);
  const currentRain = current.rain?.['1h'] ?? current.rain?.['3h'] ?? 0;
  const rainMm = currentRain + forecastRain;

  const rainProbability = horizon.reduce((m, i) => Math.max(m, i.pop ?? 0), 0);

  const within24hMs = 24 * 60 * 60 * 1000;
  const overnight = forecast.list.filter(it => {
    const ms = it.dt * 1000;
    if (ms - now.getTime() > within24hMs) return false;
    return new Date(ms).getHours() <= 6;
  });
  const overnightTemps = overnight.map(i => i.main.temp);
  const frostOvernight = overnightTemps.length > 0 && Math.min(...overnightTemps) < 2;

  const dayClouds = forecast.list
    .filter(it => {
      const ms = it.dt * 1000;
      if (ms - now.getTime() > within24hMs) return false;
      const hr = new Date(ms).getHours();
      return hr >= 10 && hr <= 16;
    })
    .map(i => i.clouds.all);
  const avgClouds =
    dayClouds.length > 0
      ? dayClouds.reduce((a, b) => a + b, 0) / dayClouds.length
      : current.clouds.all;
  const sunnyToday = avgClouds < 40;

  const humidities = [current.main.humidity, ...horizon.map(i => i.main.humidity)];
  const humidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;

  const result: WeatherInput = {
    tMin,
    tFeelsLikeMin,
    windKmh,
    rainMm,
    rainProbability,
    humidity,
    frostOvernight,
    sunnyToday,
    nowHour: now.getHours(),
    locationName: current.name,
  };
  cache.set(key, { data: result, expiresAt: Date.now() + TTL_MS });
  return result;
}
