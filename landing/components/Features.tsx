"use client";

import { useT } from "@/lib/i18n";

const items = [
  { icon: "🛡️", k: "0" },
  { icon: "🌾", k: "1" },
  { icon: "🔔", k: "2" },
];

export default function Features() {
  const { t } = useT();
  return (
    <section id="features" className="bg-cream-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-earth-700">
            {t("features.eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-sage-900 sm:text-4xl">
            {t("features.title")}
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {items.map((f) => (
            <div
              key={f.k}
              className="group relative overflow-hidden rounded-3xl border border-sage-200/60 bg-white p-8 transition hover:border-sage-300 hover:shadow-lg hover:shadow-sage-900/5"
            >
              <div
                aria-hidden
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-2xl text-sage-700 ring-1 ring-sage-200/60"
              >
                {f.icon}
              </div>
              <h3 className="mt-6 text-xl font-bold text-sage-900">
                {t(`features.${f.k}.title`)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-sage-700/80">
                {t(`features.${f.k}.body`)}
              </p>
              <ul className="mt-6 space-y-2 text-sm text-sage-700/90">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-500"
                    />
                    <span>{t(`features.${f.k}.bullet.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
