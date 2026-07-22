import { useEffect, useRef, useState } from 'react';
import { fetchPrayerTimesByCoords, fetchPrayerTimesByCity } from '../api';

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const AZAN_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const ADHAN_AUDIO_URL = 'https://cdn.aladhan.com/audio/adhans/a4.mp3';

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

function getNowInTimezone(timezone) {
  const now = new Date();
  if (!timezone) {
    return { minutes: now.getHours() * 60 + now.getMinutes(), seconds: now.getSeconds(), dateKey: now.toDateString() };
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const hour = parseInt(get('hour'), 10) % 24;
  const minute = parseInt(get('minute'), 10);
  const second = parseInt(get('second'), 10);
  const dateKey = `${get('year')}-${get('month')}-${get('day')}`;
  return { minutes: hour * 60 + minute, seconds: second, dateKey };
}

// Sunset-over-the-Bosphorus backdrop with a mosque silhouette, evoking the Blue Mosque photo
const MOSQUE_BACKDROP = {
  background:
    'linear-gradient(180deg, #f3a6c9 0%, #e08fc0 18%, #b57cc9 32%, #7d6cc4 48%, #4f5aad 64%, #2e3f82 78%, #1b2c5e 100%)',
};

function MosqueSilhouette() {
  return (
    <svg
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 w-full h-[62%] pointer-events-none"
      aria-hidden="true"
    >
      <g fill="#10163a" opacity="0.92">
        {/* distant skyline */}
        <rect x="0" y="230" width="1200" height="190" opacity="0.35" />
        {/* left minaret */}
        <rect x="120" y="60" width="14" height="300" />
        <polygon points="127,10 118,60 136,60" />
        <circle cx="127" cy="8" r="4" />
        {/* second minaret */}
        <rect x="230" y="130" width="12" height="230" />
        <polygon points="236,90 228,130 244,130" />
        <circle cx="236" cy="88" r="3.5" />
        {/* main domes cluster */}
        <path d="M480,360 C480,280 560,240 620,240 C680,240 760,280 760,360 Z" />
        <path d="M560,300 C560,255 600,230 630,230 C660,230 700,255 700,300 Z" opacity="0.9" />
        <circle cx="630" cy="222" r="10" />
        <rect x="626" y="200" width="8" height="26" />
        {/* small side domes */}
        <path d="M400,360 C400,320 430,300 450,300 C470,300 500,320 500,360 Z" />
        <path d="M740,360 C740,320 770,300 790,300 C810,300 840,320 840,360 Z" />
        {/* right minaret */}
        <rect x="950" y="120" width="12" height="240" />
        <polygon points="956,80 948,120 964,120" />
        <circle cx="956" cy="78" r="3.5" />
        {/* far right minaret */}
        <rect x="1050" y="60" width="14" height="300" />
        <polygon points="1057,10 1048,60 1066,60" />
        <circle cx="1057" cy="8" r="4" />
        {/* base building */}
        <rect x="380" y="330" width="480" height="90" />
      </g>
      {/* water reflection strip */}
      <rect x="0" y="410" width="1200" height="10" fill="#0d1230" opacity="0.6" />
    </svg>
  );
}

export default function PrayerTimes() {
  const [timings, setTimings] = useState(null);
  const [timezone, setTimezone] = useState(null);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [locationLabel, setLocationLabel] = useState('your location');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loadingCity, setLoadingCity] = useState(false);
  const [azanEnabled, setAzanEnabled] = useState(true);
  const [playingAzan, setPlayingAzan] = useState(null);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const audioRef = useRef(null);
  const lastTriggeredRef = useRef(null);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation unavailable, using default location.');
      setLocationLabel('Makkah');
      fetchPrayerTimesByCoords(21.4225, 39.8262)
        .then((data) => {
          setTimings(data.timings);
          setTimezone(data.timezone);
        })
        .catch(() => setError('Could not load prayer times.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchPrayerTimesByCoords(pos.coords.latitude, pos.coords.longitude)
          .then((data) => {
            setTimings(data.timings);
            setTimezone(data.timezone);
          })
          .catch(() => setError('Could not load prayer times.'));
      },
      () => {
        setError('Location denied, showing Makkah prayer times.');
        setLocationLabel('Makkah');
        fetchPrayerTimesByCoords(21.4225, 39.8262)
          .then((data) => {
            setTimings(data.timings);
            setTimezone(data.timezone);
          })
          .catch(() => setError('Could not load prayer times.'));
      }
    );
  }, []);

  function handleCitySearch(e) {
    e.preventDefault();
    if (!city || !country) return;
    setLoadingCity(true);
    setError(null);
    fetchPrayerTimesByCity(city, country)
      .then((data) => {
        setTimings(data.timings);
        setTimezone(data.timezone);
        setLocationLabel(city);
      })
      .catch(() => setError(`Could not find prayer times for "${city}, ${country}". Check the spelling and try again.`))
      .finally(() => setLoadingCity(false));
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    setError(null);
    setLoadingCity(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchPrayerTimesByCoords(pos.coords.latitude, pos.coords.longitude)
          .then((data) => {
            setTimings(data.timings);
            setTimezone(data.timezone);
            setLocationLabel('your location');
            setCity('');
            setCountry('');
          })
          .catch(() => setError('Could not load prayer times.'))
          .finally(() => setLoadingCity(false));
      },
      () => {
        setError('Location access denied.');
        setLoadingCity(false);
      }
    );
  }

  function playAzanNow(prayerName) {
    if (!audioRef.current) return;
    audioRef.current.src = ADHAN_AUDIO_URL;
    audioRef.current.play().catch(() => {});
    setPlayingAzan(prayerName);
  }

  function stopAzan() {
    audioRef.current?.pause();
    setPlayingAzan(null);
  }

  let nextPrayer = null;
  let msUntilNext = null;
  let progressPercent = 0;

  if (timings) {
    const { minutes: nowMinutes, seconds: nowSeconds, dateKey } = getNowInTimezone(timezone);
    const azanMinutes = AZAN_PRAYERS.map((p) => ({ name: p, minutes: toMinutes(timings[p]) }));

    if (azanEnabled) {
      const dueNow = azanMinutes.find((p) => p.minutes === nowMinutes);
      if (dueNow) {
        const key = `${dateKey}-${dueNow.name}`;
        if (lastTriggeredRef.current !== key) {
          lastTriggeredRef.current = key;
          playAzanNow(dueNow.name);
        }
      }
    }

    let upcoming = azanMinutes.find((p) => p.minutes > nowMinutes);
    let prevMinutes;
    if (!upcoming) {
      upcoming = { ...azanMinutes[0], minutes: azanMinutes[0].minutes + 1440 };
      prevMinutes = azanMinutes[azanMinutes.length - 1].minutes;
    } else {
      const idx = azanMinutes.findIndex((p) => p.name === upcoming.name);
      prevMinutes = idx === 0 ? azanMinutes[azanMinutes.length - 1].minutes - 1440 : azanMinutes[idx - 1].minutes;
    }
    nextPrayer = upcoming.name;
    const secondsNow = nowMinutes * 60 + nowSeconds;
    const secondsTarget = upcoming.minutes * 60;
    msUntilNext = (secondsTarget - secondsNow) * 1000;
    const total = (upcoming.minutes - prevMinutes) * 60;
    const elapsed = total - (secondsTarget - secondsNow);
    progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  const recentDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  });

  return (
    <section id="prayer-times" className="scroll-mt-20 relative overflow-hidden" style={MOSQUE_BACKDROP}>
      <MosqueSilhouette />

      {/* Top countdown bar, like the reference app */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4 bg-black/25 backdrop-blur-sm">
        <p className="text-white font-semibold text-lg">
          {nextPrayer ? `${nextPrayer} in ` : 'Loading '}
          <span className="font-bold">{msUntilNext != null ? formatCountdown(msUntilNext) : '--:--'}</span>
        </p>
        <button
          onClick={() => (playingAzan ? stopAzan() : nextPrayer && playAzanNow(nextPrayer))}
          className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold px-4 py-2 rounded-full"
        >
          🔔 {playingAzan ? 'STOP' : 'ATHAN'}
        </button>
      </div>

      {/* Day picker row */}
      <div className="relative z-10 flex gap-4 px-6 md:px-12 py-6 overflow-x-auto">
        {recentDays.map((d, i) => (
          <div key={d.toDateString()} className="flex flex-col items-center gap-1.5 shrink-0">
            <div
              className={`w-16 h-16 rounded-full bg-white/15 backdrop-blur border-2 flex items-center justify-center text-white/70 text-xs ${
                i === 0 ? 'border-white' : 'border-white/30'
              }`}
            >
              {d.getDate()}
            </div>
            <span className="text-white/80 text-xs font-medium">
              {d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      <div className="relative z-10 px-6 md:px-12 pb-16">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-white font-bold text-xl">Today</p>
          <button
            onClick={() => setShowCitySearch((s) => !s)}
            className="text-white/70 hover:text-white text-sm underline decoration-dotted"
          >
            {locationLabel}
          </button>
        </div>

        {showCitySearch && (
          <form
            onSubmit={handleCitySearch}
            className="flex flex-col sm:flex-row gap-2 mb-4 max-w-md"
          >
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. Cairo)"
              autoComplete="off"
              className="px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white placeholder-white/50 text-sm outline-none flex-1"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country (e.g. Egypt)"
              autoComplete="off"
              className="px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white placeholder-white/50 text-sm outline-none flex-1"
            />
            <button
              type="submit"
              disabled={loadingCity}
              className="bg-sky-500 hover:bg-sky-400 disabled:bg-gray-400 text-white px-5 py-2 rounded-full text-sm font-semibold"
            >
              {loadingCity ? '...' : 'Search'}
            </button>
          </form>
        )}

        {showCitySearch && (
          <button
            onClick={handleUseMyLocation}
            className="text-white/70 text-xs font-medium hover:underline mb-4 block"
          >
            Use my current location instead
          </button>
        )}

        <label className="flex items-center gap-2 mb-6 text-sm text-white/80">
          <input
            type="checkbox"
            checked={azanEnabled}
            onChange={(e) => setAzanEnabled(e.target.checked)}
            className="accent-sky-400"
          />
          Play Azan automatically at prayer time
        </label>

        {error && <p className="text-amber-300 text-sm mb-4">{error}</p>}

        <div className="grid grid-cols-3 gap-3 max-w-2xl">
          {PRAYER_ORDER.map((p) => {
            const isNext = p === nextPrayer;
            return (
              <div
                key={p}
                className={`rounded-2xl p-4 backdrop-blur-md border ${
                  isNext
                    ? 'bg-black/70 border-sky-400'
                    : 'bg-white/10 border-white/10'
                }`}
              >
                <div className="flex justify-end">
                  <span className="text-sky-300 text-sm">🔔</span>
                </div>
                <p className="text-white/70 text-sm mt-2">{p}</p>
                <p className={`font-bold text-lg mt-0.5 ${isNext ? 'text-sky-300' : 'text-white'}`}>
                  {timings ? timings[p] : '--:--'}
                </p>
                {timings && AZAN_PRAYERS.includes(p) && (
                  <button
                    onClick={() => playAzanNow(p)}
                    className="text-[10px] text-white/50 hover:text-white/80 mt-1"
                  >
                    ▶ Preview Azan
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 max-w-2xl">
          <div className="w-full bg-white/15 rounded-full h-1.5">
            <div
              className="bg-sky-400 h-1.5 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingAzan(null)} />
    </section>
  );
}
