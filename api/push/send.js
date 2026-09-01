import webpush from 'web-push';
import { firestore, SUBSCRIPTIONS } from '../_firestore.js';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_BASE = 'https://api.aladhan.com/v1';

// The cron fires roughly every 10 minutes, so look slightly further back to
// cover jitter. Anything already sent is skipped by the dedupe key, so a small
// overlap is safe while a gap would silently drop a prayer.
const LOOKBACK_MINUTES = 14;

function toMinutes(t) {
  const [h, m] = String(t).trim().slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

// "Now" has to be evaluated in the subscriber's own timezone, not the server's.
function nowInTimezone(timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return {
    minutes: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10),
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    ddmmyyyy: `${get('day')}-${get('month')}-${get('year')}`,
  };
}

const timingsCache = new Map();

async function timingsFor(lat, lon, ddmmyyyy) {
  // Neighbours share prayer times to the minute, so round the key and reuse the
  // upstream call rather than hitting Aladhan once per subscriber.
  const key = `${lat.toFixed(2)},${lon.toFixed(2)},${ddmmyyyy}`;
  if (timingsCache.has(key)) return timingsCache.get(key);
  const res = await fetch(`${PRAYER_BASE}/timings/${ddmmyyyy}?latitude=${lat}&longitude=${lon}&method=2`);
  if (!res.ok) throw new Error(`Aladhan ${res.status}`);
  const json = await res.json();
  const value = { timings: json.data.timings, timezone: json.data.meta.timezone };
  timingsCache.set(key, value);
  return value;
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers['x-cron-secret'] || req.query?.secret;
  if (!secret || provided !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'VAPID keys are not configured' });
  }
  webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:noreply@medinaacademylearning.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  let db;
  try {
    db = firestore();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const snap = await db.collection(SUBSCRIPTIONS).get();
  const results = { checked: 0, sent: 0, pruned: 0, errors: [] };

  for (const doc of snap.docs) {
    const data = doc.data();
    results.checked++;
    try {
      const { lat, lon } = data.location || {};
      if (typeof lat !== 'number' || typeof lon !== 'number') continue;

      // Resolve the timezone from Aladhan when the client did not supply one.
      const probe = nowInTimezone(data.timezone || 'UTC');
      const { timings, timezone } = await timingsFor(lat, lon, probe.ddmmyyyy);
      const zone = data.timezone || timezone;
      const now = nowInTimezone(zone);

      const wanted = Array.isArray(data.prayers) && data.prayers.length ? data.prayers : PRAYERS;
      const sentAlready = data.sent || {};

      for (const prayer of wanted) {
        if (!timings[prayer]) continue;
        const at = toMinutes(timings[prayer]);
        const elapsed = now.minutes - at;
        if (elapsed < 0 || elapsed > LOOKBACK_MINUTES) continue;

        const key = `${now.dateKey}-${prayer}`;
        if (sentAlready[prayer] === key) continue;

        await webpush.sendNotification(
          data.subscription,
          JSON.stringify({
            title: `${prayer} — time to pray`,
            body: `It is ${timings[prayer]}, time for ${prayer}. Tap to open and play the azan.`,
            tag: `prayer-${prayer}`,
            url: '/?azan=1',
          })
        );

        await doc.ref.set({ sent: { ...sentAlready, [prayer]: key } }, { merge: true });
        sentAlready[prayer] = key;
        results.sent++;
      }
    } catch (err) {
      // 404/410 mean the browser threw the subscription away — stop storing it.
      if (err.statusCode === 404 || err.statusCode === 410) {
        await doc.ref.delete();
        results.pruned++;
      } else {
        results.errors.push(`${doc.id}: ${err.message}`);
      }
    }
  }

  return res.status(200).json(results);
}
