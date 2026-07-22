import { useEffect, useRef, useState } from 'react';
import { fetchAyahForDate } from '../api';

const BACKGROUNDS = [
  'linear-gradient(160deg, #3f2d1d 0%, #8a6d3b 55%, #2f2416 100%)',
  'linear-gradient(160deg, #1a3a2a 0%, #3f7d4e 55%, #12271c 100%)',
  'linear-gradient(160deg, #1e2a4a 0%, #40548c 55%, #131b30 100%)',
  'linear-gradient(160deg, #4a1e2e 0%, #8c4055 55%, #2b1119 100%)',
  'linear-gradient(160deg, #2d1d3f 0%, #6d3b8a 55%, #1c1227 100%)',
  'linear-gradient(160deg, #3d3416 0%, #94823a 55%, #262009 100%)',
];

const DAILY_DUAS = [
  {
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    english: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
  },
  {
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
    english: 'My Lord, expand for me my chest and ease for me my task.',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
    english: 'O Allah, I ask You for guidance, piety, chastity, and contentment.',
  },
  {
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    english: 'Allah is sufficient for us, and He is the best Disposer of affairs.',
  },
  {
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    english: 'My Lord, increase me in knowledge.',
  },
  {
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    english: 'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
  },
  {
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
    english: 'Our Lord, let not our hearts deviate after You have guided us.',
  },
];

function dayLabel(date, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function DayCard({ date, index, playingUrl, onPlay }) {
  const [verse, setVerse] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAyahForDate(date)
      .then(setVerse)
      .catch(() => setError(true));
  }, [date]);

  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const dua = DAILY_DUAS[dayOfYear % DAILY_DUAS.length];
  const bg = BACKGROUNDS[dayOfYear % BACKGROUNDS.length];
  const isPlaying = verse && playingUrl === verse.audioUrl;

  return (
    <div className="mb-10">
      <h3 className="text-left text-2xl font-bold text-white mb-3">
        {dayLabel(date, index)}{' '}
        {index > 1 ? null : (
          <span className="text-white/40 text-lg font-normal">
            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </h3>

      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl px-6 py-12 text-center"
        style={{ background: bg }}
      >
        {/* soft decorative glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.14), transparent 60%)' }}
          aria-hidden="true"
        />

        {error && <p className="text-white/70 text-sm">Could not load today's verse.</p>}

        {verse && (
          <>
            <p dir="rtl" className="text-white text-3xl md:text-4xl leading-relaxed drop-shadow-lg">
              {verse.arabicText}
            </p>
            <p className="text-white/90 uppercase tracking-wide text-sm md:text-base font-semibold mt-6 max-w-xl mx-auto drop-shadow">
              {verse.translationText}
            </p>
            <p className="text-white/50 text-xs mt-3">
              Surah {verse.surahName} &middot; Verse {verse.ayahInSurah}
            </p>

            <button
              onClick={() => onPlay(verse.audioUrl)}
              className={`mt-6 w-16 h-16 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur flex items-center justify-center mx-auto transition-transform ${
                isPlaying ? 'scale-110 ring-4 ring-rose-500/60' : ''
              }`}
              title={isPlaying ? 'Pause recitation' : 'Play recitation'}
            >
              <span className={`text-2xl ${isPlaying ? 'text-rose-400' : 'text-rose-500'}`}>
                {isPlaying ? '⏸' : '▶'}
              </span>
            </button>
          </>
        )}

        {!verse && !error && <p className="text-white/50 text-sm py-10">Loading...</p>}

        {/* Dua of the day */}
        <div className="mt-10 bg-black/30 backdrop-blur rounded-2xl px-5 py-4 max-w-xl mx-auto">
          <p className="text-amber-300 text-xs font-bold tracking-widest uppercase mb-2">
            🤲 Dua of the Day
          </p>
          <p dir="rtl" className="text-white text-xl leading-relaxed">{dua.arabic}</p>
          <p className="text-white/70 text-sm italic mt-2">{dua.english}</p>
        </div>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const [playingUrl, setPlayingUrl] = useState(null);
  const audioRef = useRef(null);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  });

  function handlePlay(url) {
    if (!audioRef.current) return;
    if (playingUrl === url) {
      audioRef.current.pause();
      setPlayingUrl(null);
      return;
    }
    audioRef.current.src = url;
    audioRef.current.play();
    setPlayingUrl(url);
  }

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  return (
    <section
      className="min-h-screen py-14 px-4 md:px-10"
      style={{ background: 'linear-gradient(180deg, #0d0d10 0%, #16161c 100%)' }}
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-center text-3xl font-bold text-white">☀️ Today</h2>
        <p className="text-center text-white/50 mt-2 mb-10">
          A verse and a dua for every day — tap ▶ to hear the recitation
        </p>

        {days.map((d, i) => (
          <DayCard key={d.toDateString()} date={d} index={i} playingUrl={playingUrl} onPlay={handlePlay} />
        ))}
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingUrl(null)} onPause={() => setPlayingUrl(null)} />
    </section>
  );
}
