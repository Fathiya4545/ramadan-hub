import { useEffect, useRef, useState } from 'react';
import { fetchVerseOfDay } from '../api';

export default function VerseOfDay() {
  const [verse, setVerse] = useState(null);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchVerseOfDay().then(setVerse).catch(() => setError('Could not load verse of the day.'));
  }, []);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  async function handleShare() {
    const text = verse ? `"${verse.translationText}" — ${verse.surahName}` : '';
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Verse copied to clipboard!');
    }
  }

  return (
    <section className="py-16 px-6 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Verse of the Day</h2>
      {verse && <p className="text-gray-500 mt-2">From Surah {verse.surahName}</p>}

      {error && <p className="text-amber-600 text-sm mt-4">{error}</p>}

      {verse ? (
        <>
          <p dir="rtl" className="text-3xl text-emerald-800 mt-8 leading-relaxed max-w-2xl mx-auto">
            {verse.arabicText}
          </p>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto italic">{verse.translationText}</p>
          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={togglePlay}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium"
            >
              {playing ? '⏸ Pause' : '▶ Play Audio'}
            </button>
            <button
              onClick={handleShare}
              className="border border-emerald-600 text-emerald-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-50"
            >
              ↗ Share
            </button>
          </div>
          <audio
            ref={audioRef}
            src={verse.audioUrl}
            onEnded={() => setPlaying(false)}
          />
        </>
      ) : (
        !error && <p className="text-gray-400 mt-8">Loading verse...</p>
      )}
    </section>
  );
}
