"use client";

import { useT } from "@/lib/i18n";

export default function Footer() {
  const { t } = useT();
  return (
    <footer className="border-t border-sage-200/60 bg-cream-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="text-lg font-bold text-sage-900">{t("footer.brand")}</p>
          <p className="mt-1 text-sm text-sage-700/70">{t("footer.tagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-sage-700">
          <a href="#features" className="hover:text-sage-900">
            {t("footer.features")}
          </a>
          <a href="#cta" className="hover:text-sage-900">
            {t("footer.getApp")}
          </a>
          <a href="mailto:hello@stallwetter.app" className="hover:text-sage-900">
            {t("footer.contact")}
          </a>
          <a href="/privacy" className="hover:text-sage-900">
            {t("footer.privacy")}
          </a>
        </nav>
        <p className="text-sm text-sage-700/60">
          © {new Date().getFullYear()} StallWetter
        </p>
      </div>
    </footer>
  );
}
