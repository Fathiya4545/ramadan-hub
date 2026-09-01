// Shared layout for the Umrah and Hajj guides — they differ only in content.

function Dua({ dua }) {
  return (
    <div className="rounded-xl bg-emerald-50 dark:bg-gray-900/60 border border-emerald-100 dark:border-gray-700 p-4 mt-3">
      {dua.label && (
        <p className="text-[11px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-semibold">
          {dua.label}
        </p>
      )}
      <p
        lang="ar"
        dir="rtl"
        className="text-2xl md:text-3xl leading-loose text-gray-800 dark:text-gray-100 mt-2"
      >
        {dua.arabic}
      </p>
      <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-3 italic">{dua.transliteration}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5">{dua.meaning}</p>
    </div>
  );
}

function Bullets({ items }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((item) => (
        <li key={item} className="text-sm text-gray-600 dark:text-gray-300 flex gap-2 leading-relaxed">
          <span aria-hidden="true" className="text-emerald-600 dark:text-emerald-400 shrink-0">
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ProhibitionList({ title, items }) {
  return (
    <div>
      {title && <p className="font-semibold text-rose-900 dark:text-rose-200 text-sm mt-5">{title}</p>}
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-rose-900/90 dark:text-rose-100/90 flex gap-2 leading-relaxed">
            <span aria-hidden="true" className="shrink-0">
              🚫
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PilgrimageGuide({ guide }) {
  return (
    <section className="py-14 px-6 md:px-12 bg-emerald-50/60 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <header className="text-center">
          <p className="text-4xl md:text-5xl text-emerald-800 dark:text-emerald-300 leading-loose" lang="ar" dir="rtl">
            {guide.arabic}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">{guide.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{guide.tagline}</p>
          <p className="text-gray-600 dark:text-gray-300 mt-5 max-w-2xl mx-auto leading-relaxed">{guide.intro}</p>
        </header>

        <ol className="mt-12 space-y-5">
          {guide.steps.map((step, i) => (
            <li
              key={step.title}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 md:p-6"
            >
              <div className="flex gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  {i + 1}
                </span>
                <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 self-center">{step.title}</h2>
              </div>

              <div className="md:pl-12">
                {step.bullets && !step.afterDuas && <Bullets items={step.bullets} />}

                {step.ordered && (
                  <ol className="mt-3 space-y-1.5 list-decimal list-inside">
                    {step.ordered.map((item) => (
                      <li key={item} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ol>
                )}

                {step.intro && <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">{step.intro}</p>}

                {step.duas?.map((dua) => (
                  <Dua key={dua.transliteration} dua={dua} />
                ))}

                {step.afterDuas && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">{step.afterDuas}</p>
                    {step.bullets && <Bullets items={step.bullets} />}
                  </>
                )}

                {step.note && (
                  <p className="text-sm text-amber-800 dark:text-amber-300 mt-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3 leading-relaxed">
                    {step.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl p-6 mt-12 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
          <h2 className="font-bold text-xl text-rose-900 dark:text-rose-200">What is prohibited during Ihram</h2>
          <p className="text-sm text-rose-900/80 dark:text-rose-100/80 mt-2">{guide.prohibitions.intro}</p>
          <ProhibitionList items={guide.prohibitions.general} />
          <ProhibitionList title="Additional rules for men" items={guide.prohibitions.men} />
          <ProhibitionList title="Additional rules for women" items={guide.prohibitions.women} />
        </div>

        <div className="rounded-2xl p-5 mt-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{guide.compensationNote}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
            {guide.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 dark:text-emerald-400 underline decoration-dotted"
              >
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>

        {/* People act on this for an obligation they may perform once in a
            lifetime, so be explicit that an app is not the final authority. */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-8 text-center leading-relaxed">
          This is a general summary of the widely agreed practice. Rulings differ between the schools of fiqh, and
          individual circumstances vary. Confirm the details with a qualified scholar or your official pilgrimage guide.
        </p>
      </div>
    </section>
  );
}
