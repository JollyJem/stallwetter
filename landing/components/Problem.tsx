const problems = [
  {
    icon: "🥶",
    title: "Blanket on a warm night",
    body: "A sweating horse means a wet coat — and a chilled, sick animal by morning.",
  },
  {
    icon: "🌱",
    title: "Frosty grass, sweet sugar",
    body: "Frost spikes fructan in pasture. One careless turnout can trigger laminitis.",
  },
  {
    icon: "🌪️",
    title: "Forecast vs. reality",
    body: "App temperature, real wind chill, and your horse's age don't agree on the call.",
  },
];

export default function Problem() {
  return (
    <section id="problem" className="bg-cream-50 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-earth-700">
            The problem
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-sage-900 sm:text-4xl">
            One wrong call, and the horse pays.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-3xl border border-sage-200/60 bg-white p-7 shadow-sm shadow-sage-900/5"
            >
              <div className="text-3xl" aria-hidden>
                {p.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-sage-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sage-700/80">{p.body}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-base text-sage-700/70">
          Most owners check the weather, then guess. Guessing works most days. The few it
          doesn&apos;t are the expensive ones.
        </p>
      </div>
    </section>
  );
}
