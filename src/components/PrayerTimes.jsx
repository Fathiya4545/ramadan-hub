import { useEffect, useRef, useState } from 'react';
import { fetchPrayerTimesByCoords, fetchPrayerTimesByCity } from '../api';

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const ADHAN_AUDIO_URL = 'https://cdn.aladhan.com/audio/adhans/a4.mp3';

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
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
  const audioRef = useRef(null);
  const lastTriggeredRef = useRef(null);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation unavailable, using default location.');
      setLocationLabel('Makkah (default)');
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
        setLocationLabel('Makkah (default)');
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
        setLocationLabel(`${city}, ${country}`);
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
    const prayerMinutes = PRAYER_ORDER.map((p) => ({
      name: p,
      minutes: toMinutes(timings[p]),
    }));

    if (azanEnabled) {
      const dueNow = prayerMinutes.find((p) => p.minutes === nowMinutes);
      if (dueNow) {
        const key = `${dateKey}-${dueNow.name}`;
        if (lastTriggeredRef.current !== key) {
          lastTriggeredRef.current = key;
          playAzanNow(dueNow.name);
        }
      }
    }

    let upcoming = prayerMinutes.find((p) => p.minutes > nowMinutes);
    let prevMinutes;
    if (!upcoming) {
      upcoming = { ...prayerMinutes[0], minutes: prayerMinutes[0].minutes + 1440 };
      prevMinutes = prayerMinutes[prayerMinutes.length - 1].minutes;
    } else {
      const idx = prayerMinutes.findIndex((p) => p.name === upcoming.name);
      prevMinutes = idx === 0 ? prayerMinutes[prayerMinutes.length - 1].minutes - 1440 : prayerMinutes[idx - 1].minutes;
    }
    nextPrayer = upcoming.name;
    const secondsNow = nowMinutes * 60 + nowSeconds;
    const secondsTarget = upcoming.minutes * 60;
    msUntilNext = (secondsTarget - secondsNow) * 1000;
    const total = (upcoming.minutes - prevMinutes) * 60;
    const elapsed = total - (secondsTarget - secondsNow);
    progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  return (
    <section id="prayer-times" className="scroll-mt-20 bg-emerald-50 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Prayer Times</h2>
      <p className="text-gray-500 mt-2">Today's prayer schedule for {locationLabel}</p>

      <form
        onSubmit={handleCitySearch}
        className="flex flex-col sm:flex-row gap-2 justify-center mt-6 max-w-md mx-auto"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City (e.g. Cairo)"
          autoComplete="off"
          className="px-4 py-2 rounded-full border border-gray-200 text-sm outline-none flex-1"
        />
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country (e.g. Egypt)"
          autoComplete="off"
          className="px-4 py-2 rounded-full border border-gray-200 text-sm outline-none flex-1"
        />
        <button
          type="submit"
          disabled={loadingCity}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-full text-sm font-medium"
        >
          {loadingCity ? '...' : 'Search'}
        </button>
      </form>
      <button
        onClick={handleUseMyLocation}
        className="text-emerald-700 text-xs font-medium hover:underline mt-2"
      >
        Use my current location instead
      </button>

      <label className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={azanEnabled}
          onChange={(e) => setAzanEnabled(e.target.checked)}
          className="accent-emerald-600"
        />
        Play Azan automatically at prayer time
      </label>

      {error && <p className="text-amber-600 text-sm mt-3">{error}</p>}

      {playingAzan && (
        <div className="mt-4 max-w-sm mx-auto bg-emerald-700 text-white rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">🔊 Azan &mdash; {playingAzan}</span>
          <button
            onClick={stopAzan}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-full"
          >
            Stop
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
        <div className="md:col-span-2 grid grid-cols-3 gap-3">
          {PRAYER_ORDER.map((p) => (
            <div key={p} className="bg-white rounded-xl p-4">
              <div className="text-xs text-gray-500">{p}</div>
              <div className="font-bold text-emerald-700 mt-1">
                {timings ? timings[p] : '--:--'}
              </div>
              {timings && (
                <button
                  onClick={() => playAzanNow(p)}
                  title="Preview Azan"
                  className="text-[10px] text-emerald-600 hover:underline mt-1"
                >
                  ▶ Preview Azan
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500">Time Until Next Prayer</div>
          <div className="text-sm text-gray-600 mt-1">Next Prayer: {nextPrayer || '...'}</div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {msUntilNext != null ? formatCountdown(msUntilNext) : '--:--:--'}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingAzan(null)} />
    </section>
  );
}
