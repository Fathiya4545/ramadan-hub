import { asmaUlHusna } from '../data/asmaUlHusna';
import { useArabicSpeech } from '../useArabicSpeech';

export default function AsmaUlHusna() {
  const { speak, speakingId, supported } = useArabicSpeech();

  return (
    <section id="names-of-allah" className="scroll-mt-20 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">The 99 Names of Allah</h2>
      <p className="text-gray-500 mt-2">Asma-ul-Husna &mdash; the Most Beautiful Names</p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-10 max-w-5xl mx-auto text-left">
        {asmaUlHusna.map((name) => (
          <div
            key={name.number}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-emerald-400 hover:shadow-sm"
          >
            <div className="flex-1">
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 mr-1">
                {name.number}
              </span>
              <span className="font-semibold text-gray-800">{name.transliteration}</span>
              <p className="text-xs text-gray-500 mt-1">{name.meaning}</p>
              {supported && (
                <button
                  onClick={() => speak(name.number, name.arabic)}
                  className="text-xs text-emerald-700 hover:underline mt-1"
                >
                  {speakingId === name.number ? '⏸ Pause' : '▶ Listen'}
                </button>
              )}
            </div>
            <div dir="rtl" className="text-emerald-700 text-xl font-medium shrink-0">
              {name.arabic}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recitation Video</h3>
        <div className="relative w-full rounded-xl overflow-hidden shadow-sm" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/lgm3puP3tMA"
            title="99 Names of Allah Recitation"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
