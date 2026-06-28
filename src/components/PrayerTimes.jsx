import { useEffect, useState } from 'react';
import { fetchPrayerTimesByCoords } from '../api';

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

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

export default function PrayerTimes() {
  const [timings, setTimings] = useState(null);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation unavailable, using default location.');
      fetchPrayerTimesByCoords(21.4225, 39.8262)
        .then(setTimings)
        .catch(() => setError('Could not load prayer times.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchPrayerTimesByCoords(pos.coords.latitude, pos.coords.longitude)
          .then(setTimings)
          .catch(() => setError('Could not load prayer times.'));
      },
      () => {
        setError('Location denied, showing Makkah prayer times.');
        fetchPrayerTimesByCoords(21.4225, 39.8262)
          .then(setTimings)
          .catch(() => setError('Could not load prayer times.'));
      }
    );
  }, []);

  let nextPrayer = null;
  let msUntilNext = null;
  let progressPercent = 0;

  if (timings) {
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const prayerMinutes = PRAYER_ORDER.map((p) => ({
      name: p,
      minutes: toMinutes(timings[p]),
    }));
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
    const secondsNow = nowMinutes * 60 + new Date().getSeconds();
    const secondsTarget = upcoming.minutes * 60;
    msUntilNext = (secondsTarget - secondsNow) * 1000;
    const total = (upcoming.minutes - prevMinutes) * 60;
    const elapsed = total - (secondsTarget - secondsNow);
    progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  return (
    <section className="bg-emerald-50 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Prayer Times</h2>
      <p className="text-gray-500 mt-2">Today's prayer schedule for your location</p>

      {error && <p className="text-amber-600 text-sm mt-3">{error}</p>}

      <div className="grid md:grid-cols-3 gap-6 mt-10 max-w-4xl mx-auto">
        <div className="md:col-span-2 grid grid-cols-3 gap-3">
          {PRAYER_ORDER.map((p) => (
            <div key={p} className="bg-white rounded-xl p-4">
              <div className="text-xs text-gray-500">{p}</div>
              <div className="font-bold text-emerald-700 mt-1">
                {timings ? timings[p] : '--:--'}
              </div>
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
    </section>
  );
}
