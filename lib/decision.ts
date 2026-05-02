// Pure rule engine for blanket + grazing + coat-wetting decisions.
// No I/O. Same input → same output. Easy to unit-test.

export type HorseProfile = {
  clipped: boolean;
  sensitive: boolean;
  risk: 'low' | 'medium' | 'high';
};

export type WeatherInput = {
  tMin: number;             // °C, raw min over the day
  tFeelsLikeMin: number;    // °C, OpenWeatherMap "feels like" min (wind + humidity adjusted)
  windKmh: number;          // max gust km/h
  rainMm: number;           // total mm over the horizon
  rainProbability: number;  // 0..1, max forecast probability
  humidity: number;         // 0..100 %, avg
  frostOvernight: boolean;  // T < 2 °C between 00:00 and 06:00
  sunnyToday: boolean;      // avg cloud cover < 40 % from 10:00 to 16:00
  nowHour: number;          // 0..23 local
  locationName?: string;
};

export type BlanketResult = {
  blanket: 'no' | 'light' | 'medium' | 'heavy';
  reason: string;
};

export type GrazingResult = {
  grazing: 'safe' | 'caution' | 'risky';
  score: number;
  reason: string;
  bestWindow: string;
};

export type CoatWettingResult = {
  risk: 'dry' | 'damp' | 'soaked';
  reason: string;
};

export const LOGIC_VERSION = '1.1.0' as const;

export function decideBlanket(horse: HorseProfile, w: WeatherInput): BlanketResult {
  let tEff = w.tFeelsLikeMin;
  const parts: string[] = [`Gefühlt min ${Math.round(w.tFeelsLikeMin)} °C`];

  if (w.rainMm > 5) {
    tEff -= 3;
    parts.push(`Regen ${Math.round(w.rainMm)} mm`);
  } else if (w.rainMm > 1) {
    tEff -= 1;
    parts.push('leichter Regen');
  }

  // High humidity + wet coat → evaporative drying stalls
  if (w.humidity > 85 && w.rainMm > 0) {
    tEff -= 1;
    parts.push(`Luftfeuchte ${Math.round(w.humidity)}%`);
  }

  if (horse.sensitive) {
    tEff -= 2;
    parts.push('empfindliches Pferd');
  }

  let blanket: BlanketResult['blanket'];
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
    blanket,
    reason: `${parts.join(', ')} → effektiv ${Math.round(tEff)} °C`,
  };
}

export function decideGrazing(horse: HorseProfile, w: WeatherInput): GrazingResult {
  let score = 0;
  if (w.frostOvernight) score += 3;
  if (w.sunnyToday) score += 2;
  if (w.nowHour >= 13 && w.nowHour <= 19) score += 1;
  if (horse.risk === 'high') score += 3;
  else if (horse.risk === 'medium') score += 1;

  if (horse.risk === 'high' && w.frostOvernight) {
    return {
      grazing: 'risky',
      score,
      reason: 'Hufrehe-Risiko + Frost in der Nacht → kein Gras heute',
      bestWindow: '—',
    };
  }

  let grazing: GrazingResult['grazing'];
  let reason: string;
  if (score <= 2) {
    grazing = 'safe';
    reason = 'Bedingungen normal, kein Fruktan-Anstieg erwartet';
  } else if (score <= 5) {
    grazing = 'caution';
    if (w.frostOvernight && w.sunnyToday) reason = 'Frost & Sonne → Fruktan steigt nachmittags';
    else if (w.frostOvernight) reason = 'Frost in der Nacht, Zucker noch hoch im Gras';
    else reason = 'Sonnig, Graszucker erhöht';
  } else {
    grazing = 'risky';
    reason = 'Mehrere Zucker-Faktoren, lieber Paddock + Heu';
  }

  return { grazing, score, reason, bestWindow: '05:00 – 10:00' };
}

export function decideCoatWetting(horse: HorseProfile, w: WeatherInput): CoatWettingResult {
  const heavyRain = w.rainMm > 5;
  const someRain = w.rainMm > 0.5;
  const highProb = w.rainProbability > 0.6;
  const humid = w.humidity > 85;
  const cold = w.tFeelsLikeMin < 5;

  if (heavyRain || (someRain && humid && cold)) {
    const base = `${Math.round(w.rainMm)} mm Regen erwartet`;
    return {
      risk: 'soaked',
      reason: horse.clipped
        ? `${base} + geschoren → Regendecke nötig, sonst Auskühlung`
        : `${base}, Luftfeuchte ${Math.round(w.humidity)}% → Fell trocknet kaum`,
    };
  }
  if (someRain || (highProb && humid)) {
    return {
      risk: 'damp',
      reason: highProb
        ? `Regen-Wahrscheinlichkeit ${Math.round(w.rainProbability * 100)}% → Decke griffbereit halten`
        : 'Leichter Regen, Fell wird feucht',
    };
  }
  return {
    risk: 'dry',
    reason: humid ? `Luftfeuchte ${Math.round(w.humidity)}%, Fell bleibt trocken` : 'Trocken',
  };
}

export function decide(horse: HorseProfile, w: WeatherInput) {
  return {
    blanket: decideBlanket(horse, w),
    grazing: decideGrazing(horse, w),
    coatWetting: decideCoatWetting(horse, w),
    weather: w,
    logicVersion: LOGIC_VERSION,
  };
}
