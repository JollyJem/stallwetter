import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-sage-200/40 bg-cream-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-sage-900">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sage-700 text-base text-white shadow-sm shadow-sage-900/20"
          >
            🐴
          </span>
          StallWetter
        </Link>
        <nav className="hidden gap-8 sm:flex">
          <a href="#problem" className="text-sm font-medium text-sage-700 hover:text-sage-900">
            Why
          </a>
          <a href="#features" className="text-sm font-medium text-sage-700 hover:text-sage-900">
            Features
          </a>
          <a href="#cta" className="text-sm font-medium text-sage-700 hover:text-sage-900">
            Pricing
          </a>
        </nav>
        <Link
          href="/app/"
          className="rounded-full bg-sage-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sage-800"
        >
          Open app
        </Link>
      </div>
    </header>
  );
}
