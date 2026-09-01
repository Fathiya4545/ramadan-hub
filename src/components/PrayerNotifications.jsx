import { useEffect, useState } from 'react';
import {
  pushSupport,
  getExistingSubscription,
  subscribeToPrayerPush,
  unsubscribeFromPrayerPush,
} from '../push';

const ALL_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function PrayerNotifications({ coords, timezone, gold, card }) {
  const [support, setSupport] = useState({ supported: true, reason: null });
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [prayers, setPrayers] = useState(ALL_PRAYERS);

  useEffect(() => {
    setSupport(pushSupport());
    getExistingSubscription()
      .then((sub) => setEnabled(!!sub))
      .catch(() => {});
  }, []);

  async function toggle() {
    setError(null);
    setBusy(true);
    try {
      if (enabled) {
        await unsubscribeFromPrayerPush();
        setEnabled(false);
      } else {
        if (!coords) {
          throw new Error('Set your location above first, so reminders match your city.');
        }
        await subscribeToPrayerPush({ location: coords, timezone, prayers });
        setEnabled(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function togglePrayer(p) {
    const next = prayers.includes(p) ? prayers.filter((x) => x !== p) : [...prayers, p];
    setPrayers(next);
    if (enabled && coords) {
      // Already subscribed — push the revised list straight through.
      try {
        await subscribeToPrayerPush({ location: coords, timezone, prayers: next });
      } catch (err) {
        setError(err.message);
      }
    }
  }

  if (!support.supported) {
    return (
      <div className="rounded-2xl px-5 py-4 mt-4 backdrop-blur-md" style={{ background: card }}>
        <p className="text-white font-bold text-sm">🔔 Prayer reminders</p>
        {support.reason === 'ios-not-installed' ? (
          <p className="text-white/70 text-sm mt-1">
            On iPhone, reminders only work once the app is on your Home Screen. Tap Share in Safari,
            then <strong>Add to Home Screen</strong>, and open it from there.
          </p>
        ) : (
          <p className="text-white/70 text-sm mt-1">
            This browser doesn&apos;t support notifications. Try Chrome on Android, or install the app
            to your Home Screen on iPhone.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl px-5 py-4 mt-4 backdrop-blur-md" style={{ background: card }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-white font-bold text-sm">🔔 Prayer reminders</p>
          <p className="text-white/60 text-xs mt-0.5">
            {enabled ? 'Your phone will alert you at each prayer time.' : 'Get notified even when the app is closed.'}
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={busy}
          className="shrink-0 px-4 py-2 rounded-full text-sm font-bold disabled:opacity-60"
          style={enabled ? { background: 'rgba(255,255,255,0.15)', color: 'white' } : { background: gold, color: '#12233d' }}
        >
          {busy ? '…' : enabled ? 'Turn off' : 'Turn on'}
        </button>
      </div>

      {enabled && (
        <div className="flex flex-wrap gap-2 mt-3">
          {ALL_PRAYERS.map((p) => {
            const on = prayers.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePrayer(p)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={
                  on
                    ? { background: gold, color: '#12233d', borderColor: gold }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.25)' }
                }
              >
                {p}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-amber-300 text-xs mt-3">{error}</p>}

      {enabled && (
        <p className="text-white/40 text-[11px] mt-3">
          A notification can&apos;t play the full azan on its own — tap it to open the app and hear it.
        </p>
      )}
    </div>
  );
}
