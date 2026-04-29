const appPoints = [
  {
    icon: "📱",
    title: "iOS, Android, web",
    body: "Same data, same call, on every device.",
  },
  {
    icon: "📍",
    title: "Stable-precise",
    body: "We use your stable's coordinates — not the nearest big city.",
  },
  {
    icon: "🐴",
    title: "Per-horse profiles",
    body: "Every animal scored on its own coat and risk.",
  },
];

export default function AppPreview() {
  return (
    <section className="relative py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-cream-50 via-cream-100 to-sage-50"
      />

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-earth-700">
              In your pocket
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-sage-900 sm:text-4xl">
              Designed for the barn aisle, not a desk.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-sage-800/75">
              Big text, big buttons, gloves-friendly taps. Every screen is one glance away from
              the answer you came for.
            </p>

            <ul className="mt-8 space-y-4">
              {appPoints.map((p) => (
                <li key={p.title} className="flex gap-4">
                  <div
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-lg text-sage-700 ring-1 ring-sage-200/60"
                  >
                    {p.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sage-900">{p.title}</p>
                    <p className="mt-1 text-sm text-sage-700/80">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative order-1 lg:order-2">
            <div aria-hidden className="absolute inset-0 -z-10 mx-auto max-w-md">
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-sage-200 via-cream-200 to-earth-200 opacity-70 blur-2xl" />
            </div>

            <div className="relative mx-auto max-w-xs">
              <div className="rounded-[2.75rem] border-[8px] border-sage-900/90 bg-sage-900 p-1 shadow-2xl shadow-sage-900/30">
                <div className="overflow-hidden rounded-[2.25rem] bg-cream-50 p-5 pt-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sage-600">
                        Today
                      </p>
                      <p className="mt-0.5 text-2xl font-bold text-sage-900">Lotte</p>
                    </div>
                    <div className="rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700 ring-1 ring-sage-200">
                      4&nbsp;°C
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-sage-700 p-5 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-80">
                      Blanket
                    </p>
                    <p className="mt-1 text-2xl font-extrabold">Light</p>
                    <p className="mt-1 text-xs opacity-80">Wind 28&nbsp;km/h → felt 2&nbsp;°C</p>
                  </div>

                  <div className="mt-3 rounded-2xl bg-emerald-600 p-5 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-80">
                      Grazing
                    </p>
                    <p className="mt-1 text-2xl font-extrabold">Safe</p>
                    <p className="mt-1 text-xs opacity-80">Cloudy, no overnight frost</p>
                  </div>

                  <div className="mt-5 flex gap-2 text-[11px] text-sage-700/70">
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-sage-200">
                      Today
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-sage-200">
                      Tomorrow
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-sage-200">
                      Week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
