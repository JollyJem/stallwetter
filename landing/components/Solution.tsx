"use client";

import { useT } from "@/lib/i18n";

const steps = [
  { num: "01", k: "0" },
  { num: "02", k: "1" },
  { num: "03", k: "2" },
];

export default function Solution() {
  const { t } = useT();
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-sage-700 via-sage-800 to-sage-900"
      />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-25">
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-sage-400 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-earth-300 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-sage-200">
          {t("solution.eyebrow")}
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          {t("solution.title")}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-sage-100/85">
          {t("solution.body")}
        </p>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-sage-600/40 ring-1 ring-white/10 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="bg-sage-800 p-8 text-left">
              <p className="text-4xl font-bold text-sage-200">{step.num}</p>
              <p className="mt-3 text-base font-semibold text-white">
                {t(`solution.${step.k}.label`)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-sage-100/70">
                {t(`solution.${step.k}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
