"use client";

import { useT, type Lang } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useT();
  const langs: Lang[] = ["de", "en"];

  return (
    <div
      role="group"
      aria-label={t("lang.aria")}
      className="inline-flex overflow-hidden rounded-full border border-sage-200/70 bg-white/70 text-xs font-semibold backdrop-blur"
    >
      {langs.map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            className={
              active
                ? "px-3 py-1.5 bg-sage-700 text-white"
                : "px-3 py-1.5 text-sage-700 hover:bg-sage-100"
            }
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
