import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchSurahList, fetchSurah } from '../api';
import { reciters, ayahAudioUrl, fullSurahAudioUrl } from '../data/reciters';
import { useAuth } from '../AuthContext';
import { watchFavorites, toggleFavorite, saveReadingProgress, getReadingProgress } from '../userData';

export default function QuranReader() {
  const [searchParams] = useSearchParams();
  const [surahs, setSurahs] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [surahDetail, setSurahDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [playingFullSurah, setPlayingFullSurah] = useState(null);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [reciter, setReciter] = useState(reciters[0]);
  const [favorites, setFavorites] = useState([]);
  const [progress, setProgress] = useState(null);
  const audioRef = useRef(null);
  const autoPlayPendingRef = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchSurahList()
      .then(setSurahs)
      .catch(() => setError('Could not load the list of surahs.'));
  }, []);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    const unsubscribe = watchFavorites(user.uid, setFavorites);
    getReadingProgress(user.uid).then(setProgress);
    return unsubscribe;
  }, [user]);

  function handleToggleFavorite(surahNumber, e) {
    e.stopPropagation();
    if (!user) return;
    toggleFavorite(user.uid, surahNumber, favorites);
  }

  useEffect(() => {
    const surahParam = Number(searchParams.get('surah'));
    if (surahParam && surahs.some((s) => s.number === surahParam)) {
      handleSelect(surahParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahs]);

  function startSurahPlayback(detail) {
    if (!audioRef.current) return;
    if (!reciter.hasAudio) {
      setError(`Recitation audio for ${reciter.name} is not available yet.`);
      return;
    }
    setError(null);
    if (reciter.hasFullSurahAudio) {
      audioRef.current.src = fullSurahAudioUrl(reciter, detail.number);
      audioRef.current.play();
      setPlayingFullSurah(detail.number);
      setPlayingAyah(null);
    } else {
      const first = detail.ayahs[0];
      audioRef.current.src = ayahAudioUrl(reciter, first.globalNumber);
      audioRef.current.play();
      setPlayingAyah(first.number);
      setPlayingFullSurah(null);
    }
    setIsPaused(false);
  }

  function handleSelect(number) {
    setSelected(number);
    setSurahDetail(null);
    setLoadingDetail(true);
    fetchSurah(number)
      .then((detail) => {
        setSurahDetail(detail);
        if (user) saveReadingProgress(user.uid, number, detail.englishName);
      })
      .catch(() => setError('Could not load this surah.'))
      .finally(() => setLoadingDetail(false));
  }

  useEffect(() => {
    if (surahDetail && autoPlayPendingRef.current) {
      autoPlayPendingRef.current = false;
      startSurahPlayback(surahDetail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahDetail]);

  function handleBack() {
    setSelected(null);
    setSurahDetail(null);
    setPlayingAyah(null);
    setPlayingFullSurah(null);
    audioRef.current?.pause();
  }

  function playAyah(ayah) {
    if (!audioRef.current) return;
    if (!reciter.hasAudio) {
      setError(`Recitation audio for ${reciter.name} is not available yet.`);
      return;
    }
    if (playingAyah === ayah.number) {
      audioRef.current.pause();
      setPlayingAyah(null);
      return;
    }
    audioRef.current.src = ayahAudioUrl(reciter, ayah.globalNumber);
    audioRef.current.play();
    setPlayingAyah(ayah.number);
    setPlayingFullSurah(null);
    setIsPaused(false);
    setError(null);
  }

  function playFullSurah(number, detail) {
    if (!audioRef.current) return;
    if (!reciter.hasAudio) {
      setError(`Recitation audio for ${reciter.name} is not available yet.`);
      return;
    }
    const isCurrentlyPlaying = reciter.hasFullSurahAudio
      ? playingFullSurah === number
      : playingAyah != null && surahDetail?.number === number;
    if (isCurrentlyPlaying) {
      audioRef.current.pause();
      setPlayingFullSurah(null);
      setPlayingAyah(null);
      return;
    }
    if (detail) {
      startSurahPlayback(detail);
    } else if (reciter.hasFullSurahAudio) {
      audioRef.current.src = fullSurahAudioUrl(reciter, number);
      audioRef.current.play();
      setPlayingFullSurah(number);
      setPlayingAyah(null);
      setIsPaused(false);
      setError(null);
    } else {
      autoPlayPendingRef.current = true;
      handleSelect(number);
    }
  }

  function pickNextSurahNumber(currentNumber) {
    if (shuffle) {
      const others = surahs.filter((s) => s.number !== currentNumber);
      if (others.length === 0) return null;
      return others[Math.floor(Math.random() * others.length)].number;
    }
    const idx = surahs.findIndex((s) => s.number === currentNumber);
    return surahs[idx + 1]?.number ?? null;
  }

  function goToNextSurah(currentNumber) {
    const nextNumber = pickNextSurahNumber(currentNumber);
    if (!nextNumber) {
      setPlayingFullSurah(null);
      setPlayingAyah(null);
      return;
    }
    autoPlayPendingRef.current = true;
    handleSelect(nextNumber);
  }

  function handleAudioEnded() {
    if (playingAyah != null && surahDetail) {
      const idx = surahDetail.ayahs.findIndex((a) => a.number === playingAyah);
      const next = surahDetail.ayahs[idx + 1];
      if (next) {
        playAyah(next);
        return;
      }
      if (autoplayNext) {
        goToNextSurah(surahDetail.number);
        return;
      }
      setPlayingAyah(null);
      return;
    }

    if (playingFullSurah != null) {
      if (autoplayNext) {
        goToNextSurah(playingFullSurah);
        return;
      }
      setPlayingFullSurah(null);
    }
  }

  function handlePlayAll() {
    if (surahs.length === 0) return;
    if (!reciter.hasAudio) {
      setError(`Recitation audio for ${reciter.name} is not available yet.`);
      return;
    }
    setShuffle(false);
    setAutoplayNext(true);
    autoPlayPendingRef.current = true;
    handleSelect(surahs[0].number);
  }

  function handleShufflePlay() {
    if (surahs.length === 0) return;
    if (!reciter.hasAudio) {
      setError(`Recitation audio for ${reciter.name} is not available yet.`);
      return;
    }
    setShuffle(true);
    setAutoplayNext(true);
    const random = surahs[Math.floor(Math.random() * surahs.length)];
    autoPlayPendingRef.current = true;
    handleSelect(random.number);
  }

  function toggleMiniPlayerPause() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPaused(false);
    } else {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }

  function handleReciterChange(id) {
    const next = reciters.find((r) => r.id === id);
    if (!next) return;
    setReciter(next);
    audioRef.current?.pause();
    setPlayingAyah(null);
    setPlayingFullSurah(null);
    setError(null);
  }

  const nowPlayingSurah =
    playingFullSurah != null
      ? surahs.find((s) => s.number === playingFullSurah)
      : playingAyah != null && surahDetail
      ? surahDetail
      : null;

  const isSurahPlaying = (number) =>
    reciter.hasFullSurahAudio
      ? playingFullSurah === number
      : playingAyah != null && surahDetail?.number === number && selected === number;

  return (
    <section id="quran" className="scroll-mt-20 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">The Holy Quran</h2>
      <p className="text-gray-500 mt-2">
        Browse all 114 surahs with Arabic text, translation, and full audio recitation
      </p>

      {error && <p className="text-amber-600 text-sm mt-3">{error}</p>}

      {!selected ? (
        <div className="max-w-2xl mx-auto mt-8 text-left">
          {user && progress && (
            <button
              onClick={() => handleSelect(progress.surahNumber)}
              className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl p-4 mb-4 text-left"
            >
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Continue Reading</p>
              <p className="font-bold text-gray-800 mt-1">Surah {progress.surahName}</p>
            </button>
          )}
          {user && favorites.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Favorites</p>
              <div className="flex flex-wrap gap-2">
                {favorites.map((num) => {
                  const s = surahs.find((x) => x.number === num);
                  if (!s) return null;
                  return (
                    <button
                      key={num}
                      onClick={() => handleSelect(num)}
                      className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full px-3 py-1.5 text-xs font-medium text-amber-800"
                    >
                      ⭐ {s.englishName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
            {reciter.image ? (
              <img
                src={reciter.image}
                alt={reciter.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-300 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 border-2 border-emerald-300 shrink-0 flex items-center justify-center text-xl font-bold">
                {reciter.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-800 text-lg">{reciter.name}</p>
              {reciter.hasAudio ? (
                <>
                  <p className="text-sm text-gray-500">Recorded 114 surahs</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Full Quran recitation, available verse-by-verse{reciter.hasFullSurahAudio ? ' or surah-by-surah' : ''}
                  </p>
                </>
              ) : (
                <p className="text-xs text-amber-600 mt-1">Recitation audio not available yet</p>
              )}
            </div>
          </div>

          <label className="block mt-4">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Choose a reciter</span>
            <select
              value={reciter.id}
              onChange={(e) => handleReciterChange(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
            >
              {reciters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePlayAll}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
            >
              ▶ Play All
            </button>
            <button
              onClick={handleShufflePlay}
              className="flex-1 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-5 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
            >
              🔀 Shuffle
            </button>
          </div>

          <label className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoplayNext}
              onChange={(e) => setAutoplayNext(e.target.checked)}
              className="accent-emerald-600"
            />
            Auto-play next surah
          </label>

          <div className="mt-6 max-h-[480px] overflow-y-auto divide-y divide-gray-100 border-t border-gray-100">
            {surahs.length === 0 && !error && (
              <p className="text-gray-400 text-sm py-4">Loading surahs...</p>
            )}
            {surahs.map((s) => (
              <div key={s.number} className="flex items-center gap-3 py-3">
                <span className="w-6 text-sm text-gray-400 shrink-0">{s.number}</span>
                <button onClick={() => handleSelect(s.number)} className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">
                    Surah {s.englishName} ({s.englishNameTranslation})
                  </div>
                  <div dir="rtl" className="text-sm text-gray-400 mt-0.5">
                    {s.name}
                  </div>
                </button>
                {user && (
                  <button
                    onClick={(e) => handleToggleFavorite(s.number, e)}
                    title={favorites.includes(s.number) ? 'Remove from favorites' : 'Add to favorites'}
                    className="shrink-0 text-lg"
                  >
                    {favorites.includes(s.number) ? '⭐' : '☆'}
                  </button>
                )}
                <button
                  onClick={() => playFullSurah(s.number)}
                  title="Play this surah"
                  className="shrink-0 w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center"
                >
                  {isSurahPlaying(s.number) ? '⏸' : '▶'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 max-w-3xl mx-auto text-left pb-20">
          <button
            onClick={handleBack}
            className="text-emerald-700 text-sm font-medium hover:underline mb-4"
          >
            &larr; Back to surah list
          </button>

          {loadingDetail && <p className="text-gray-400 text-sm">Loading surah...</p>}

          {surahDetail && (
            <>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {surahDetail.englishName}{' '}
                  <span dir="rtl" className="text-emerald-700">
                    {surahDetail.name}
                  </span>
                </h3>
                <p className="text-sm text-gray-500">
                  {surahDetail.englishNameTranslation} &middot;{' '}
                  {surahDetail.revelationType} &middot; {surahDetail.ayahs.length} verses
                </p>
                <p className="text-xs text-gray-400 mt-1">Reciter: {reciter.name}</p>
                <button
                  onClick={() => playFullSurah(surahDetail.number, surahDetail)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium"
                >
                  {isSurahPlaying(surahDetail.number)
                    ? '⏸ Pause Full Surah'
                    : '▶ Listen to Full Surah'}
                </button>
                {autoplayNext && (
                  <p className="text-xs text-emerald-600 mt-2">
                    Playlist mode on{shuffle ? ' (shuffling)' : ''} &mdash; next surah plays automatically
                  </p>
                )}
              </div>

              <div className="space-y-5">
                {surahDetail.ayahs.map((ayah) => (
                  <div
                    key={ayah.number}
                    className={`bg-white border rounded-xl p-4 ${
                      playingAyah === ayah.number ? 'border-emerald-400 shadow-sm' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-1">
                        {ayah.number}
                      </span>
                      <button
                        onClick={() => playAyah(ayah)}
                        className="text-xs text-emerald-700 hover:underline shrink-0"
                      >
                        {playingAyah === ayah.number ? '⏸ Pause' : '▶ Play'}
                      </button>
                    </div>
                    <p dir="rtl" className="text-2xl text-emerald-800 mt-3 leading-relaxed">
                      {ayah.arabicText}
                    </p>
                    <p className="text-gray-600 mt-2 text-sm italic">{ayah.translationText}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {nowPlayingSurah && (
        <div className="sticky bottom-4 mt-6 max-w-2xl mx-auto bg-emerald-900 text-white rounded-2xl shadow-lg px-5 py-3 flex items-center gap-3">
          {reciter.image ? (
            <img
              src={reciter.image}
              alt={reciter.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-semibold shrink-0">
              {reciter.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
          )}
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-semibold truncate">
              {nowPlayingSurah.englishName}
              {nowPlayingSurah.name ? (
                <span dir="rtl" className="ml-2 text-emerald-200">
                  {nowPlayingSurah.name}
                </span>
              ) : null}
            </p>
            <p className="text-xs text-emerald-300 truncate">
              {reciter.name} &middot; {playingAyah != null ? `Verse ${playingAyah}` : 'Full surah'}
              {autoplayNext ? ' · playlist' : ''}
            </p>
          </div>
          <button
            onClick={toggleMiniPlayerPause}
            className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center shrink-0"
          >
            {isPaused ? '▶' : '⏸'}
          </button>
        </div>
      )}

      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onPause={() => setIsPaused(true)}
        onPlay={() => setIsPaused(false)}
      />
    </section>
  );
}
