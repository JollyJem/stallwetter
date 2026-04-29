const pipeline = [
  {
    num: "01",
    label: "Real local weather",
    body: "Hourly DWD data for your stable's coordinates — temperature, wind gust, precipitation, cloud cover.",
  },
  {
    num: "02",
    label: "Your horse's profile",
    body: "Clipped or unclipped, sensitive, laminitis risk. Each animal scored individually.",
  },
  {
    num: "03",
    label: "One clear call",
    body: "No charts, no guessing — blanket weight, grazing window, and the reasoning behind it.",
  },
];

export default function Solution() {
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
          Our approach
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Weather data in. Confident decisions out.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-sage-100/85">
          We pull hourly forecasts from the Deutscher Wetterdienst, blend them with your
          horse&apos;s profile — clipped, sensitive, laminitis-prone — and translate everything
          into one clear answer per day.
        </p>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-sage-600/40 ring-1 ring-white/10 sm:grid-cols-3">
          {pipeline.map((step) => (
            <div key={step.num} className="bg-sage-800 p-8 text-left">
              <p className="text-4xl font-bold text-sage-200">{step.num}</p>
              <p className="mt-3 text-base font-semibold text-white">{step.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-sage-100/70">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
