"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export default function Hero() {
  const { t } = useT();
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-cream-50 via-cream-100 to-sage-50"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 -top-40 -z-10 mx-auto h-[40rem] max-w-5xl rounded-full bg-sage-200/40 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-sage-100 px-4 py-1.5 text-sm font-medium text-sage-800 ring-1 ring-sage-200">
              <span aria-hidden className="h-2 w-2 rounded-full bg-sage-500" />
              {t("hero.badge")}
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-sage-900 sm:text-5xl lg:text-6xl">
              {t("hero.title.a")}{" "}
              <span className="text-sage-600">{t("hero.title.b")}</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-sage-800/75 sm:text-xl">
              {t("hero.body")}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/app/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-sage-700/25 transition hover:bg-sage-800"
              >
                {t("hero.cta.openApp")}
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-sage-300 bg-white/70 px-8 py-4 text-base font-semibold text-sage-800 backdrop-blur transition hover:bg-white"
              >
                {t("hero.cta.howItWorks")}
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4 text-sm text-sage-700/70">
              <div className="flex -space-x-2">
                {[
                  "from-earth-200 to-sage-300",
                  "from-sage-200 to-earth-300",
                  "from-cream-300 to-sage-400",
                  "from-earth-300 to-sage-500",
                ].map((g, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-full border-2 border-cream-50 bg-gradient-to-br ${g}`}
                  />
                ))}
              </div>
              <span>{t("hero.trust")}</span>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-sage-200 opacity-60 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-earth-200 opacity-50 blur-3xl"
            />

            <div className="relative mx-auto max-w-sm rounded-[2.5rem] border border-sage-200/50 bg-white p-3 shadow-2xl shadow-sage-900/10">
              <div className="rounded-[2rem] bg-gradient-to-b from-sage-50 to-cream-100 p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sage-600">
                  {t("hero.card.eyebrow")}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-sage-900">{t("hero.card.title")}</h3>
                <p className="mt-1 text-sm text-sage-700/80">{t("hero.card.body")}</p>

                <div className="mt-5 rounded-2xl bg-sage-700 p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-80">
                    {t("hero.card.grazing")}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">{t("hero.card.safe")}</p>
                </div>

                <div className="mt-3 rounded-2xl bg-amber-100 p-5 text-amber-900">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-80">
                    {t("hero.card.tomorrow")}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">{t("hero.card.caution")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
