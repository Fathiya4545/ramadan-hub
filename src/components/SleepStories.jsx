import { Link } from 'react-router-dom';

const SLEEP_SURAHS = [
  { number: 67, name: 'Al-Mulk', meaning: 'The Sovereignty' },
  { number: 36, name: 'Yaseen', meaning: 'Ya-Sin' },
  { number: 56, name: "Al-Waqi'ah", meaning: 'The Inevitable' },
  { number: 112, name: 'Al-Ikhlas', meaning: 'Sincerity' },
  { number: 113, name: 'Al-Falaq', meaning: 'The Daybreak' },
  { number: 114, name: 'An-Nas', meaning: 'Mankind' },
];

export default function SleepStories() {
  return (
    <section id="sleep" className="scroll-mt-20 bg-white py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">🌙 Sleep Recitations</h2>
      <p className="text-gray-500 mt-2 max-w-xl mx-auto">
        Surahs traditionally recited before sleep — tap one to open it in the Quran reader with full audio
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
        {SLEEP_SURAHS.map((s) => (
          <Link
            key={s.number}
            to={`/quran?surah=${s.number}`}
            className="bg-emerald-50 hover:bg-emerald-100 rounded-xl p-5 text-left transition-colors"
          >
            <div className="text-xs text-emerald-600 font-medium">Surah {s.number}</div>
            <div className="font-bold text-gray-800 mt-1">{s.name}</div>
            <div className="text-sm text-gray-500">{s.meaning}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
