"use client";

import { useT } from "@/lib/i18n";

const items = [
  { icon: "🥶", k: "0" },
  { icon: "🌱", k: "1" },
  { icon: "🌪️", k: "2" },
];

export default function Problem() {
  const { t } = useT();
  return (
    <section id="problem" className="bg-cream-50 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-earth-700">
            {t("problem.eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-sage-900 sm:text-4xl">
            {t("problem.title")}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {items.map((p) => (
            <div
              key={p.k}
              className="rounded-3xl border border-sage-200/60 bg-white p-7 shadow-sm shadow-sage-900/5"
            >
              <div className="text-3xl" aria-hidden>
                {p.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-sage-900">
                {t(`problem.${p.k}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-sage-700/80">
                {t(`problem.${p.k}.body`)}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-base text-sage-700/70">
          {t("problem.footer")}
        </p>
      </div>
    </section>
  );
}
