"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { t } = useT();
  return (
    <header className="sticky top-0 z-30 border-b border-sage-200/40 bg-cream-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-sage-900">
          <Image
            src="/logo.png"
            alt="StallWetter"
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-2xl object-contain"
          />
          StallWetter
        </Link>
        <nav className="hidden gap-8 sm:flex">
          <a href="#problem" className="text-sm font-medium text-sage-700 hover:text-sage-900">
            {t("nav.why")}
          </a>
          <a href="#features" className="text-sm font-medium text-sage-700 hover:text-sage-900">
            {t("nav.features")}
          </a>
          <a href="#cta" className="text-sm font-medium text-sage-700 hover:text-sage-900">
            {t("nav.pricing")}
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/app/"
            className="rounded-full bg-sage-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sage-800"
          >
            {t("nav.openApp")}
          </Link>
        </div>
      </div>
    </header>
  );
}
