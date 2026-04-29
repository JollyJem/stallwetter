import Link from "next/link";

export default function CTASection() {
  return (
    <section id="cta" className="px-6 py-24 sm:py-32 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sage-700 via-sage-800 to-earth-700 px-8 py-16 text-center sm:px-16 sm:py-24">
        <div
          aria-hidden
          className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-sage-400/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-earth-200/20 blur-3xl"
        />

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Better mornings start tomorrow.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-sage-100/85">
          Add your first horse, get tomorrow&apos;s call by sunrise. Free while we&apos;re in beta.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/app/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-sage-800 shadow-lg shadow-sage-900/30 transition hover:bg-cream-100"
          >
            Open the app
            <span aria-hidden>→</span>
          </Link>
          <a
            href="mailto:hello@stallwetter.app"
            className="inline-flex items-center rounded-full border border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Talk to us
          </a>
        </div>
      </div>
    </section>
  );
}
