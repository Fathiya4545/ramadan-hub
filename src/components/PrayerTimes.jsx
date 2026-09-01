import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPrayerTimesByCoords, fetchPrayerTimesByCity } from '../api';
// Swap this import to change the prayer section's backdrop.
import prayerBg from '../assets/Prayertime.JPG';
import PrayerNotifications from './PrayerNotifications';

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const AZAN_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const ADHAN_AUDIO_URL = 'https://cdn.aladhan.com/audio/adhans/a4.mp3';

// Iqama is set by each mosque and isn't in any prayer-time API, so these are
// only common starting points — the user adjusts them to their own masjid.
const DEFAULT_IQAMA = { Fajr: 20, Dhuhr: 15, Asr: 15, Maghrib: 10, Isha: 15 };
const DEFAULT_JUMMAH = { first: '13:00', second: '14:00' };

// Palette drawn from the backdrop photo itself — sandstone gold, terracotta
// and warm brown — so the section reads as one picture instead of navy
// furniture parked on top of a sunset.
const GOLD = '#e8c583';

// Only a light warm scrim: enough to anchor text, not enough to grey out the
// mosque. The cards below carry their own tint, so the photo can stay bright.
const PRAYER_BACKDROP = {
  backgroundImage: `linear-gradient(180deg, rgba(46,20,14,0.20) 0%, rgba(46,20,14,0.34) 45%, rgba(38,16,11,0.58) 100%), url(${prayerBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
  backgroundAttachment: 'scroll',
};
const CARD = 'rgba(56,26,19,0.68)';
const RAISED = 'rgba(122,60,42,0.52)';

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function toMinutes(timeStr) {
  const [h, m] = timeStr.trim().slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

function minutesToLabel(total) {
  const wrapped = ((total % 1440) + 1440) % 1440;
  const h24 = Math.floor(wrapped / 60);
  const m = String(wrapped % 60).padStart(2, '0');
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m} ${suffix}`;
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
  return { minutes: hour * 60 + minute, seconds: second, dateKey: `${get('year')}-${get('month')}-${get('day')}` };
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

function CountdownBox({ value, label }) {
  return (
    <div className="flex-1 rounded-2xl py-4 text-center backdrop-blur-sm" style={{ background: RAISED }}>
      <p className="text-3xl md:text-4xl font-bold tabular-nums" style={{ color: GOLD }}>
        {String(value).padStart(2, '0')}
      </p>
      <p className="text-[10px] md:text-xs tracking-widest text-white/50 mt-1">{label}</p>
    </div>
  );
}

export default function PrayerTimes() {
  const [timings, setTimings] = useState(null);
  const [timezone, setTimezone] = useState(null);
  const [error, setError] = useState(null);
  const [, setTick] = useState(0);
  const [locationLabel, setLocationLabel] = useState('your location');
  const [source, setSource] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [azanEnabled, setAzanEnabled] = useState(true);
  const [playingAzan, setPlayingAzan] = useState(null);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [azanBlocked, setAzanBlocked] = useState(null);
  const [resolvedCoords, setResolvedCoords] = useState(null);
  const [iqamaOffsets, setIqamaOffsets] = useState(() => loadStored('iqamaOffsets', DEFAULT_IQAMA));
  const [jummah, setJummah] = useState(() => loadStored('jummahTimes', DEFAULT_JUMMAH));
  const audioRef = useRef(null);
  const lastTriggeredRef = useRef(null);

  const viewingToday = isSameDay(selectedDate, new Date());

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem('iqamaOffsets', JSON.stringify(iqamaOffsets));
  }, [iqamaOffsets]);

  useEffect(() => {
    localStorage.setItem('jummahTimes', JSON.stringify(jummah));
  }, [jummah]);

  // Pick a location once; the fetch effect below reacts to it and the date.
  useEffect(() => {
    // A city the user picked has to outlive the reload. Without this, every
    // refresh re-asked for geolocation, got denied, and silently fell back to
    // Makkah — so the page kept showing Makkah's prayers to someone who had
    // already told it they were in Seattle.
    const saved = loadStored('prayerLocation', null);
    if (saved?.source) {
      setSource(saved.source);
      setLocationLabel(saved.label || 'your location');
      return;
    }
    if (!navigator.geolocation) {
      setError('Geolocation unavailable, showing Makkah.');
      setLocationLabel('Makkah');
      setSource({ type: 'coords', lat: 21.4225, lon: 39.8262 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => rememberLocation({ type: 'coords', lat: pos.coords.latitude, lon: pos.coords.longitude }, 'your location'),
      () => {
        setError('Location denied, showing Makkah.');
        setLocationLabel('Makkah');
        setSource({ type: 'coords', lat: 21.4225, lon: 39.8262 });
      }
    );
  }, []);

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    setLoading(true);
    const request =
      source.type === 'coords'
        ? fetchPrayerTimesByCoords(source.lat, source.lon, selectedDate)
        : fetchPrayerTimesByCity(source.city, source.country, selectedDate);
    request
      .then((data) => {
        if (cancelled) return;
        setTimings(data.timings);
        setTimezone(data.timezone);
        if (data.coords) setResolvedCoords(data.coords);
      })
      .catch(() => !cancelled && setError('Could not load prayer times.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [source, selectedDate]);

  function rememberLocation(nextSource, label) {
    setSource(nextSource);
    setLocationLabel(label);
    try {
      localStorage.setItem('prayerLocation', JSON.stringify({ source: nextSource, label }));
    } catch {
      // Private browsing can refuse writes; the location still works for this visit.
    }
  }

  function handleCitySearch(e) {
    e.preventDefault();
    if (!city || !country) return;
    setError(null);
    rememberLocation({ type: 'city', city, country }, city);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        rememberLocation({ type: 'coords', lat: pos.coords.latitude, lon: pos.coords.longitude }, 'your location');
        setCity('');
        setCountry('');
      },
      () => setError('Location access denied.')
    );
  }

  function shiftDay(delta) {
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + delta);
      return next;
    });
  }

  function playAzanNow(prayerName, { automatic = false } = {}) {
    if (!audioRef.current) return;
    audioRef.current.src = ADHAN_AUDIO_URL;
    setPlayingAzan(prayerName);
    setAzanBlocked(false);
    audioRef.current.play().catch(() => {
      // Browsers refuse to autoplay audio until the user has interacted with
      // the page, and this used to fail silently — the azan simply never
      // sounded. Say so instead of pretending it played.
      setPlayingAzan(null);
      if (automatic) setAzanBlocked(prayerName);
    });
  }

  function stopAzan() {
    audioRef.current?.pause();
    setPlayingAzan(null);
  }

  const iqamaFor = (prayer) => timings && toMinutes(timings[prayer]) + (Number(iqamaOffsets[prayer]) || 0);

  let currentPrayer = null;
  let countdown = null;
  let countdownTarget = null;
  let pill = null;
  let headline = null;

  if (timings && viewingToday) {
    const { minutes: nowMinutes, seconds: nowSeconds, dateKey } = getNowInTimezone(timezone);
    const schedule = AZAN_PRAYERS.map((p) => ({ name: p, athan: toMinutes(timings[p]), iqama: iqamaFor(p) }));

    if (azanEnabled) {
      const due = schedule.find((p) => p.athan === nowMinutes);
      if (due && lastTriggeredRef.current !== `${dateKey}-${due.name}`) {
        lastTriggeredRef.current = `${dateKey}-${due.name}`;
        playAzanNow(due.name, { automatic: true });
      }
    }

    const passed = schedule.filter((p) => p.athan <= nowMinutes);
    currentPrayer = passed.length ? passed[passed.length - 1] : schedule[schedule.length - 1];

    // Count down to this prayer's iqama while it's still ahead, otherwise to
    // the next athan — which is what the reference layout shows. The pill has
    // to follow the same choice: it used to always show the current prayer's
    // iqama, so at 5pm it advertised Dhuhr's 1:31pm iqama next to a countdown
    // running to Asr.
    const nowSec = nowMinutes * 60 + nowSeconds;
    if (passed.length && currentPrayer.iqama > nowMinutes) {
      countdownTarget = 'IQAMA';
      countdown = currentPrayer.iqama * 60 - nowSec;
      pill = { label: 'IQAMA', minutes: currentPrayer.iqama };
      headline = { caption: 'Current Prayer', name: currentPrayer.name };
    } else {
      const upcoming = schedule.find((p) => p.athan > nowMinutes);
      const next = upcoming || { ...schedule[0], athan: schedule[0].athan + 1440 };
      countdownTarget = next.name.toUpperCase();
      countdown = next.athan * 60 - nowSec;
      pill = { label: 'ATHAN', minutes: next.athan };
      // Once a prayer's iqama has gone, it is no longer "current" in any sense
      // the reader cares about — at midday the card was announcing "Current
      // Prayer: Fajr" to someone waiting for Dhuhr. Name what they're waiting
      // for instead.
      headline = { caption: 'Next Prayer', name: next.name };
    }
  }

  const totalSec = Math.max(0, countdown ?? 0);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  return (
    <section id="prayer-times" className="scroll-mt-20 py-10 px-4 md:px-8" style={PRAYER_BACKDROP}>
      <div className="max-w-2xl mx-auto">
        {/* Current prayer + iqama */}
        <div className="rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl" style={{ background: CARD }}>
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{ background: 'linear-gradient(90deg, rgba(150,74,50,0.78) 0%, rgba(104,44,30,0.82) 100%)' }}
          >
            <div>
              <p className="text-xs font-semibold tracking-wide" style={{ color: GOLD }}>
                {viewingToday ? headline?.caption || 'Current Prayer' : 'Schedule for'}
              </p>
              <p className="text-3xl font-bold text-white mt-0.5">
                {viewingToday ? headline?.name || '—' : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {viewingToday && pill && (
                <div className="rounded-2xl px-4 py-2 text-center bg-white/10 backdrop-blur">
                  <p className="text-[10px] tracking-widest text-white/60">{pill.label}</p>
                  <p className="text-lg font-bold text-white">{minutesToLabel(pill.minutes)}</p>
                </div>
              )}
              {timings && (
                <button
                  onClick={() => (playingAzan ? stopAzan() : playAzanNow(currentPrayer?.name || 'Azan'))}
                  title={playingAzan ? 'Stop azan' : 'Play azan now'}
                  className="shrink-0 w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-[10px] hover:brightness-110 transition"
                  style={{ background: GOLD, color: '#12233d' }}
                >
                  <span className={`text-lg leading-none ${playingAzan ? 'animate-pulse' : ''}`}>🔔</span>
                  {playingAzan ? 'STOP' : 'ATHAN'}
                </button>
              )}
            </div>
          </div>

          {viewingToday && (
            <div className="flex items-center gap-2 px-4 py-4">
              <CountdownBox value={hrs} label="HOURS" />
              <span className="text-white/30 font-bold">.</span>
              <CountdownBox value={mins} label="MINUTES" />
              <span className="text-white/30 font-bold">.</span>
              <CountdownBox value={secs} label="SECONDS" />
            </div>
          )}
        </div>

        {viewingToday && countdownTarget && (
          <p className="text-center text-white/70 text-xs mt-2 drop-shadow">until {countdownTarget}</p>
        )}

        {/* Date navigation */}
        <div className="flex items-center justify-between gap-3 mt-6">
          <button
            onClick={() => shiftDay(-1)}
            className="flex items-center gap-2 rounded-full px-5 py-3 text-white font-medium hover:brightness-125 transition"
            style={{ background: RAISED }}
          >
            ← Prev
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            title="Back to today"
            className="flex-1 rounded-full px-4 py-3 font-semibold text-center hover:brightness-95 transition"
            style={{ background: GOLD, color: '#12233d' }}
          >
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </button>
          <button
            onClick={() => shiftDay(1)}
            className="flex items-center gap-2 rounded-full px-5 py-3 text-white font-medium hover:brightness-125 transition"
            style={{ background: RAISED }}
          >
            Next →
          </button>
        </div>

        {/* Schedule header */}
        <div
          className="flex items-center justify-between rounded-2xl px-5 py-4 mt-6 border border-white/10 backdrop-blur-md"
          style={{ background: CARD }}
        >
          <div>
            <h2 className="text-2xl font-bold text-white">Prayer Times</h2>
            <button
              onClick={() => setShowCitySearch((s) => !s)}
              className="flex items-center gap-1.5 text-sm mt-0.5 rounded-full px-2.5 py-1 -ml-2.5 hover:bg-white/10 transition"
              style={{ color: GOLD }}
            >
              📍 {loading ? 'Loading…' : locationLabel}
              <span className="text-white/40 text-xs">Change</span>
            </button>
          </div>
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
            style={{ background: 'rgba(224,189,107,0.15)' }}
          >
            🕐
          </div>
        </div>

        {showCitySearch && (
          <div className="mt-3 rounded-2xl p-4" style={{ background: CARD }}>
            <form onSubmit={handleCitySearch} className="flex flex-col sm:flex-row gap-2">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Cairo)"
                autoComplete="off"
                className="flex-1 px-4 py-2 rounded-full bg-white/10 text-white placeholder-white/40 text-sm outline-none border border-white/10"
              />
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country (e.g. Egypt)"
                autoComplete="off"
                className="flex-1 px-4 py-2 rounded-full bg-white/10 text-white placeholder-white/40 text-sm outline-none border border-white/10"
              />
              <button type="submit" className="px-5 py-2 rounded-full text-sm font-semibold" style={{ background: GOLD, color: '#12233d' }}>
                Search
              </button>
            </form>
            <button onClick={handleUseMyLocation} className="text-white/50 text-xs hover:text-white mt-3">
              Use my current location instead
            </button>
          </div>
        )}

        {/* A silent Makkah fallback looks like plain wrong prayer times, so make
            the cause and both fixes obvious. */}
        {error && (
          <div className="rounded-2xl px-4 py-3 mt-3 border border-amber-400/30 bg-amber-400/10">
            <p className="text-amber-200 text-sm">{error}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={handleUseMyLocation}
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: GOLD, color: '#12233d' }}
              >
                Use my location
              </button>
              <button
                onClick={() => setShowCitySearch(true)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20"
              >
                Search my city
              </button>
            </div>
          </div>
        )}

        {/* Times table */}
        <div className="rounded-2xl overflow-hidden mt-4 border border-white/10 backdrop-blur-md">
          <div className="grid grid-cols-3 px-5 py-3 text-sm text-white/60" style={{ background: RAISED }}>
            <span>Prayer</span>
            <span className="text-right">Athan</span>
            <span className="text-right">Iqama</span>
          </div>
          {PRAYER_ORDER.map((p) => {
            // Highlight whatever the headline names, so the row and the card
            // agree — highlighting Fajr while the header counts down to Dhuhr
            // just points at the wrong line.
            const isCurrent = viewingToday && headline?.name === p;
            const showIqama = AZAN_PRAYERS.includes(p);
            return (
              <div
                key={p}
                className="grid grid-cols-3 items-center px-5 py-4 border-t border-white/5"
                style={{ background: isCurrent ? 'rgba(150,74,50,0.80)' : CARD }}
              >
                <span className="text-white font-medium flex items-center gap-2">
                  {p}
                  {showIqama && timings && (
                    <button
                      onClick={() => (playingAzan === p ? stopAzan() : playAzanNow(p))}
                      title={playingAzan === p ? 'Stop azan' : `Play ${p} azan`}
                      className={`text-sm transition ${
                        playingAzan === p ? 'animate-pulse' : 'opacity-40 hover:opacity-100'
                      }`}
                      style={{ color: GOLD }}
                    >
                      🔔
                    </button>
                  )}
                </span>
                <span className="text-right text-white/90 tabular-nums">
                  {timings ? minutesToLabel(toMinutes(timings[p])) : '—'}
                </span>
                <span className="text-right tabular-nums" style={{ color: showIqama ? GOLD : 'rgba(255,255,255,0.25)' }}>
                  {timings && showIqama ? minutesToLabel(iqamaFor(p)) : '—'}
                </span>
              </div>
            );
          })}
        </div>

        <label className="flex items-center gap-2 mt-4 text-sm text-white/85 rounded-2xl px-4 py-3 backdrop-blur-md" style={{ background: CARD }}>
          <input type="checkbox" checked={azanEnabled} onChange={(e) => setAzanEnabled(e.target.checked)} className="accent-amber-400" />
          Play azan automatically at prayer time
        </label>

        <PrayerNotifications
          coords={source?.type === 'coords' ? { lat: source.lat, lon: source.lon } : resolvedCoords}
          timezone={timezone}
          gold={GOLD}
          card={CARD}
        />

        {azanBlocked && (
          <div className="mt-3 rounded-2xl px-4 py-3 flex items-center justify-between gap-3" style={{ background: CARD }}>
            <p className="text-sm text-amber-300">
              It&apos;s time for {azanBlocked} — your browser blocked the azan from playing on its own.
            </p>
            <button
              onClick={() => playAzanNow(azanBlocked)}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: GOLD, color: '#12233d' }}
            >
              🔔 Play
            </button>
          </div>
        )}

        {/* Jummah */}
        <div className="rounded-2xl px-5 py-4 mt-5 border-l-4 backdrop-blur-md" style={{ background: CARD, borderColor: GOLD }}>
          <p className="text-white font-bold flex items-center gap-2">🕌 Jummah Prayer</p>
          <p className="text-white/70 mt-1">
            1st: {minutesToLabel(toMinutes(jummah.first))} &nbsp;•&nbsp; 2nd: {minutesToLabel(toMinutes(jummah.second))}
          </p>
        </div>

        {/* Iqama / Jummah are mosque-specific, so let people correct them. */}
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="text-white/80 hover:text-white text-xs mt-4 underline decoration-dotted rounded-full px-3 py-1.5 backdrop-blur-md inline-block" style={{ background: CARD }}
        >
          {showSettings ? 'Hide' : 'Set iqama & Jummah times for my mosque'}
        </button>

        {showSettings && (
          <div className="rounded-2xl p-5 mt-3" style={{ background: CARD }}>
            <p className="text-white/50 text-xs mb-3">
              Iqama isn&apos;t provided by any prayer-time API — it&apos;s set by each mosque. These are minutes after the
              athan; adjust them to match yours.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {AZAN_PRAYERS.map((p) => (
                <label key={p} className="text-xs text-white/60">
                  {p}
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={iqamaOffsets[p]}
                    onChange={(e) => setIqamaOffsets((o) => ({ ...o, [p]: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm outline-none border border-white/10"
                  />
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <label className="text-xs text-white/60">
                Jummah 1st
                <input
                  type="time"
                  value={jummah.first}
                  onChange={(e) => setJummah((j) => ({ ...j, first: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm outline-none border border-white/10"
                />
              </label>
              <label className="text-xs text-white/60">
                Jummah 2nd
                <input
                  type="time"
                  value={jummah.second}
                  onChange={(e) => setJummah((j) => ({ ...j, second: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm outline-none border border-white/10"
                />
              </label>
            </div>
          </div>
        )}

        <Link
          to="/calendar"
          className="flex items-center justify-center gap-2 rounded-2xl py-4 mt-6 font-bold hover:brightness-95 transition"
          style={{ background: GOLD, color: '#12233d' }}
        >
          🗓 View Monthly Schedule
        </Link>
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingAzan(null)} />
    </section>
  );
}
