const features = [
  {
    icon: "🛡️",
    title: "Blanket decision",
    body: "Wind chill, rain, and your horse's coat — distilled into one number a stable hand can act on.",
    bullets: [
      "No / light / medium / heavy",
      "Adjusts for clipped coats",
      "Reasoning shown next to the call",
    ],
  },
  {
    icon: "🌾",
    title: "Grazing safety",
    body: "Frost plus sun equals sugar spike. We watch the conditions that actually matter for laminitis.",
    bullets: [
      "Safe / caution / no grass",
      "Best turnout window per day",
      "Honors per-horse risk profile",
    ],
  },
  {
    icon: "🔔",
    title: "Daily alerts",
    body: "A morning push when the call changes — so a freak frost never catches you mid-coffee.",
    bullets: [
      "Per-horse summaries",
      "Quiet on stable days",
      "Tomorrow's outlook included",
    ],
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-cream-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-earth-700">
            Features
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-sage-900 sm:text-4xl">
            Built around the two questions you ask every day.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-3xl border border-sage-200/60 bg-white p-8 transition hover:border-sage-300 hover:shadow-lg hover:shadow-sage-900/5"
            >
              <div
                aria-hidden
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-2xl text-sage-700 ring-1 ring-sage-200/60"
              >
                {f.icon}
              </div>
              <h3 className="mt-6 text-xl font-bold text-sage-900">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-sage-700/80">{f.body}</p>
              <ul className="mt-6 space-y-2 text-sm text-sage-700/90">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-500"
                    />
                    <span>{b}</span>
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
