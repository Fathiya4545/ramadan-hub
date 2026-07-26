import { useRef, useState } from 'react';
import { sleepPlaylist } from '../data/sleepPlaylist';
import sleepBanner from '../assets/Sleep.PNG';

export default function SleepPage() {
  const [playingId, setPlayingId] = useState(null);
  const [shuffleOrder, setShuffleOrder] = useState(null);
  const audioRef = useRef(null);

  const order = shuffleOrder || sleepPlaylist;

  function playTrack(track) {
    if (!audioRef.current) return;
    if (playingId === track.id) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current.src = track.audioUrl;
    audioRef.current.play().catch(() => {});
    setPlayingId(track.id);
  }

  function handlePlayAll() {
    setShuffleOrder(null);
    playTrack(sleepPlaylist[0]);
  }

  function handleShuffle() {
    const shuffled = [...sleepPlaylist].sort(() => Math.random() - 0.5);
    setShuffleOrder(shuffled);
    playTrack(shuffled[0]);
  }

  function handleEnded() {
    const idx = order.findIndex((t) => t.id === playingId);
    const next = order[idx + 1];
    if (next) {
      playTrack(next);
    } else {
      setPlayingId(null);
    }
  }

  const nowPlaying = sleepPlaylist.find((t) => t.id === playingId);

  return (
    <section className="min-h-screen bg-black">
      <div
        className="w-full h-56 md:h-72 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${sleepBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <h2 className="absolute bottom-4 left-0 right-0 text-center text-white text-2xl font-bold drop-shadow-lg">
          🌙 Quran for Sleep
        </h2>
      </div>

      <div className="max-w-2xl mx-auto py-10 px-4 md:px-10">
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2.5">
          <span className="text-white/40">🔍</span>
          <input
            type="text"
            placeholder="Surah"
            className="bg-transparent flex-1 text-white placeholder-white/40 text-sm outline-none"
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-5 mt-5">
          <div className="flex items-start gap-4">
            <img
              src={sleepBanner}
              alt="Quran for Sleep"
              className="w-24 h-24 rounded-2xl object-cover shrink-0"
            />
            <div>
              <p className="text-white font-bold text-lg">Quran for Sleep</p>
              <p className="text-white/40 text-sm mt-0.5">Recorded {sleepPlaylist.length} surahs</p>
              <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-400 text-xs font-bold px-3 py-1.5 rounded-full mt-2">
                ⤓ ALL
              </div>
            </div>
          </div>
          <p className="text-white/50 text-sm mt-4 leading-relaxed">
            Struggling with falling asleep? Quran for Sleep is a collection of soothing surahs
            from the Holy Quran, recited gently to help calm the mind and body before rest.
          </p>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handlePlayAll}
            className="flex-1 bg-white/5 hover:bg-white/10 text-rose-400 font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2"
          >
            ▶ Play
          </button>
          <button
            onClick={handleShuffle}
            className="flex-1 bg-white/5 hover:bg-white/10 text-rose-400 font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2"
          >
            ⤨ Shuffle
          </button>
        </div>

        <div className="bg-white/5 rounded-2xl mt-5 divide-y divide-white/5 overflow-hidden">
          {sleepPlaylist.map((track, i) => {
            const isPlaying = playingId === track.id;
            return (
              <button
                key={track.id}
                onClick={() => playTrack(track)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5"
              >
                <span className="text-white/30 text-sm w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isPlaying ? 'text-rose-400' : 'text-white'}`}>
                    {track.reciterEn} ({track.surahEn})
                  </p>
                  <p dir="rtl" className="text-white/40 text-sm truncate">
                    {track.reciterAr} ({track.surahAr})
                  </p>
                </div>
                <span className={`text-xl shrink-0 ${isPlaying ? 'text-rose-400' : 'text-white/60'}`}>
                  {isPlaying ? '⏸' : '▶'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {nowPlaying && (
        <div className="sticky bottom-4 mt-6 max-w-2xl mx-auto bg-gray-900 border border-white/10 text-white rounded-2xl shadow-lg px-5 py-3 flex items-center gap-3">
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-semibold truncate">
              {nowPlaying.reciterEn} — {nowPlaying.surahEn}
            </p>
            <p className="text-xs text-white/40">Quran for Sleep</p>
          </div>
          <button
            onClick={() => playTrack(nowPlaying)}
            className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center shrink-0"
          >
            ⏸
          </button>
        </div>
      )}

      <audio ref={audioRef} onEnded={handleEnded} onPause={() => {}} />
    </section>
  );
}
