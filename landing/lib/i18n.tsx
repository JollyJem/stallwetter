"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "de" | "en";

const STORAGE_KEY = "stallwetter:lang";
const DEFAULT_LANG: Lang = "de";

type Dict = Record<string, string | string[]>;

const translations: Record<Lang, Dict> = {
  de: {
    "nav.why": "Warum",
    "nav.features": "Funktionen",
    "nav.pricing": "Preise",
    "nav.openApp": "App öffnen",

    "hero.badge": "Für alltägliche Pferdehalter gemacht",
    "hero.title.a": "Sichere Entscheidungen für dein Pferd,",
    "hero.title.b": "jeden Morgen.",
    "hero.body":
      "StallWetter liest das heutige Wetter, kennt dein Pferd und sagt dir, ob die Decke drauf muss und ob die Weide sicher ist – in Sekunden.",
    "hero.cta.openApp": "App öffnen",
    "hero.cta.howItWorks": "So funktioniert's",
    "hero.trust": "Vertraut von Ställen in Deutschland & Österreich",
    "hero.card.eyebrow": "Heute · Lotte",
    "hero.card.title": "Leichte Decke",
    "hero.card.body": "Min 4 °C, Wind 28 km/h → gefühlt 2 °C",
    "hero.card.grazing": "Weide",
    "hero.card.safe": "OK",
    "hero.card.tomorrow": "Morgen",
    "hero.card.caution": "Vorsicht · Zuckerspitze",

    "problem.eyebrow": "Das Problem",
    "problem.title": "Eine falsche Entscheidung – das Pferd zahlt den Preis.",
    "problem.0.title": "Decke in der warmen Nacht",
    "problem.0.body":
      "Ein schwitzendes Pferd bedeutet ein nasses Fell – und am Morgen ein durchgekühltes, krankes Tier.",
    "problem.1.title": "Frostgras, süßer Zucker",
    "problem.1.body":
      "Frost lässt den Fruktangehalt im Gras hochschnellen. Ein unbedachter Weidegang kann Hufrehe auslösen.",
    "problem.2.title": "Vorhersage vs. Wirklichkeit",
    "problem.2.body":
      "App-Temperatur, echter Windchill und das Alter deines Pferdes sind sich nicht einig.",
    "problem.footer":
      "Die meisten Halter checken das Wetter und raten dann. Raten klappt an den meisten Tagen. Die wenigen, an denen es schiefgeht, sind die teuren.",

    "solution.eyebrow": "Unser Ansatz",
    "solution.title": "Wetterdaten rein. Klare Entscheidungen raus.",
    "solution.body":
      "Wir holen stündliche Vorhersagen vom Deutschen Wetterdienst, kombinieren sie mit dem Profil deines Pferdes – geschoren, empfindlich, hufrehe-gefährdet – und übersetzen alles in eine klare Antwort pro Tag.",
    "solution.0.label": "Echtes lokales Wetter",
    "solution.0.body":
      "Stündliche DWD-Daten für die Koordinaten deines Stalls – Temperatur, Windböen, Niederschlag, Bewölkung.",
    "solution.1.label": "Profil deines Pferdes",
    "solution.1.body":
      "Geschoren oder unbeschoren, empfindlich, Hufrehe-Risiko. Jedes Tier individuell bewertet.",
    "solution.2.label": "Eine klare Entscheidung",
    "solution.2.body":
      "Keine Diagramme, kein Raten – Deckengewicht, Weidefenster und die Begründung dahinter.",

    "features.eyebrow": "Funktionen",
    "features.title": "Gebaut um die zwei Fragen, die du jeden Tag stellst.",
    "features.0.title": "Decken-Entscheidung",
    "features.0.body":
      "Windchill, Regen und das Fell deines Pferdes – verdichtet zu einer Zahl, mit der jede Stallhilfe arbeiten kann.",
    "features.0.bullet.0": "Keine / leicht / mittel / dick",
    "features.0.bullet.1": "Berücksichtigt geschorene Felle",
    "features.0.bullet.2": "Begründung neben der Empfehlung",
    "features.1.title": "Weidesicherheit",
    "features.1.body":
      "Frost plus Sonne ergibt eine Zuckerspitze. Wir achten auf die Bedingungen, die für Hufrehe wirklich zählen.",
    "features.1.bullet.0": "Sicher / Vorsicht / kein Gras",
    "features.1.bullet.1": "Bestes Weidefenster pro Tag",
    "features.1.bullet.2": "Berücksichtigt das Risiko jedes Pferdes",
    "features.2.title": "Tägliche Hinweise",
    "features.2.body":
      "Eine Morgen-Benachrichtigung, wenn sich die Empfehlung ändert – damit dich kein Frosteinbruch beim Kaffee überrascht.",
    "features.2.bullet.0": "Zusammenfassungen pro Pferd",
    "features.2.bullet.1": "Stille Tage bleiben still",
    "features.2.bullet.2": "Ausblick auf morgen inklusive",

    "appPreview.eyebrow": "In deiner Tasche",
    "appPreview.title": "Gemacht für den Stallgang, nicht den Schreibtisch.",
    "appPreview.body":
      "Große Schrift, große Knöpfe, handschuhfreundlich. Jeder Bildschirm ist eine Geste von der Antwort entfernt, wegen der du gekommen bist.",
    "appPreview.0.title": "iOS, Android, Web",
    "appPreview.0.body": "Gleiche Daten, gleiche Empfehlung, auf jedem Gerät.",
    "appPreview.1.title": "Stall-genau",
    "appPreview.1.body":
      "Wir nutzen die Koordinaten deines Stalls – nicht die nächste größere Stadt.",
    "appPreview.2.title": "Profile pro Pferd",
    "appPreview.2.body": "Jedes Tier nach Fell und Risiko individuell bewertet.",
    "appPreview.card.today": "Heute",
    "appPreview.card.blanket": "Decke",
    "appPreview.card.blanketValue": "Leicht",
    "appPreview.card.blanketBody": "Wind 28 km/h → gefühlt 2 °C",
    "appPreview.card.grazing": "Weide",
    "appPreview.card.grazingValue": "OK",
    "appPreview.card.grazingBody": "Bewölkt, kein Nachtfrost",
    "appPreview.card.tab.today": "Heute",
    "appPreview.card.tab.tomorrow": "Morgen",
    "appPreview.card.tab.week": "Woche",

    "cta.title": "Bessere Morgen beginnen morgen.",
    "cta.body":
      "Lege dein erstes Pferd an, hol dir die Empfehlung für morgen bis Sonnenaufgang. Während der Beta kostenlos.",
    "cta.openApp": "App öffnen",
    "cta.contact": "Sprich mit uns",

    "footer.brand": "StallWetter",
    "footer.tagline": "Decken- und Weide-Empfehlungen, jeden Morgen.",
    "footer.features": "Funktionen",
    "footer.getApp": "App holen",
    "footer.contact": "Kontakt",
    "footer.privacy": "Datenschutz",

    "lang.aria": "Sprache",
  },
  en: {
    "nav.why": "Why",
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.openApp": "Open app",

    "hero.badge": "Built for everyday horse owners",
    "hero.title.a": "Confident calls for your horse,",
    "hero.title.b": "every morning.",
    "hero.body":
      "StallWetter reads today's weather, knows your horse, and tells you whether to put the blanket on and whether the pasture is safe — in seconds.",
    "hero.cta.openApp": "Open the app",
    "hero.cta.howItWorks": "See how it works",
    "hero.trust": "Trusted by stables across Germany & Austria",
    "hero.card.eyebrow": "Today · Lotte",
    "hero.card.title": "Light blanket",
    "hero.card.body": "Min 4 °C, wind 28 km/h → felt 2 °C",
    "hero.card.grazing": "Grazing",
    "hero.card.safe": "Safe",
    "hero.card.tomorrow": "Tomorrow",
    "hero.card.caution": "Caution · sugar spike",

    "problem.eyebrow": "The problem",
    "problem.title": "One wrong call, and the horse pays.",
    "problem.0.title": "Blanket on a warm night",
    "problem.0.body":
      "A sweating horse means a wet coat — and a chilled, sick animal by morning.",
    "problem.1.title": "Frosty grass, sweet sugar",
    "problem.1.body":
      "Frost spikes fructan in pasture. One careless turnout can trigger laminitis.",
    "problem.2.title": "Forecast vs. reality",
    "problem.2.body":
      "App temperature, real wind chill, and your horse's age don't agree on the call.",
    "problem.footer":
      "Most owners check the weather, then guess. Guessing works most days. The few it doesn't are the expensive ones.",

    "solution.eyebrow": "Our approach",
    "solution.title": "Weather data in. Confident decisions out.",
    "solution.body":
      "We pull hourly forecasts from the Deutscher Wetterdienst, blend them with your horse's profile — clipped, sensitive, laminitis-prone — and translate everything into one clear answer per day.",
    "solution.0.label": "Real local weather",
    "solution.0.body":
      "Hourly DWD data for your stable's coordinates — temperature, wind gust, precipitation, cloud cover.",
    "solution.1.label": "Your horse's profile",
    "solution.1.body":
      "Clipped or unclipped, sensitive, laminitis risk. Each animal scored individually.",
    "solution.2.label": "One clear call",
    "solution.2.body":
      "No charts, no guessing — blanket weight, grazing window, and the reasoning behind it.",

    "features.eyebrow": "Features",
    "features.title": "Built around the two questions you ask every day.",
    "features.0.title": "Blanket decision",
    "features.0.body":
      "Wind chill, rain, and your horse's coat — distilled into one number a stable hand can act on.",
    "features.0.bullet.0": "No / light / medium / heavy",
    "features.0.bullet.1": "Adjusts for clipped coats",
    "features.0.bullet.2": "Reasoning shown next to the call",
    "features.1.title": "Grazing safety",
    "features.1.body":
      "Frost plus sun equals sugar spike. We watch the conditions that actually matter for laminitis.",
    "features.1.bullet.0": "Safe / caution / no grass",
    "features.1.bullet.1": "Best turnout window per day",
    "features.1.bullet.2": "Honors per-horse risk profile",
    "features.2.title": "Daily alerts",
    "features.2.body":
      "A morning push when the call changes — so a freak frost never catches you mid-coffee.",
    "features.2.bullet.0": "Per-horse summaries",
    "features.2.bullet.1": "Quiet on stable days",
    "features.2.bullet.2": "Tomorrow's outlook included",

    "appPreview.eyebrow": "In your pocket",
    "appPreview.title": "Designed for the barn aisle, not a desk.",
    "appPreview.body":
      "Big text, big buttons, gloves-friendly taps. Every screen is one glance away from the answer you came for.",
    "appPreview.0.title": "iOS, Android, web",
    "appPreview.0.body": "Same data, same call, on every device.",
    "appPreview.1.title": "Stable-precise",
    "appPreview.1.body":
      "We use your stable's coordinates — not the nearest big city.",
    "appPreview.2.title": "Per-horse profiles",
    "appPreview.2.body": "Every animal scored on its own coat and risk.",
    "appPreview.card.today": "Today",
    "appPreview.card.blanket": "Blanket",
    "appPreview.card.blanketValue": "Light",
    "appPreview.card.blanketBody": "Wind 28 km/h → felt 2 °C",
    "appPreview.card.grazing": "Grazing",
    "appPreview.card.grazingValue": "Safe",
    "appPreview.card.grazingBody": "Cloudy, no overnight frost",
    "appPreview.card.tab.today": "Today",
    "appPreview.card.tab.tomorrow": "Tomorrow",
    "appPreview.card.tab.week": "Week",

    "cta.title": "Better mornings start tomorrow.",
    "cta.body":
      "Add your first horse, get tomorrow's call by sunrise. Free while we're in beta.",
    "cta.openApp": "Open the app",
    "cta.contact": "Talk to us",

    "footer.brand": "StallWetter",
    "footer.tagline": "Blanket and grazing calls, every morning.",
    "footer.features": "Features",
    "footer.getApp": "Get the app",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy",

    "lang.aria": "Language",
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "de" || stored === "en") {
        setLangState(stored);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string) => {
      const v = translations[lang][key];
      if (typeof v === "string") return v;
      return key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside LanguageProvider");
  return ctx;
}
