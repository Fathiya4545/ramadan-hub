import { firestore, SUBSCRIPTIONS, endpointId } from '../_firestore.js';

const VALID_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let db;
  try {
    db = firestore();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  if (req.method === 'DELETE') {
    if (!body.endpoint) return res.status(400).json({ error: 'endpoint required' });
    await db.collection(SUBSCRIPTIONS).doc(endpointId(body.endpoint)).delete();
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { subscription, location, timezone, prayers } = body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ error: 'A valid push subscription is required' });
  }
  if (typeof location?.lat !== 'number' || typeof location?.lon !== 'number') {
    return res.status(400).json({ error: 'location {lat, lon} is required' });
  }

  const wanted = Array.isArray(prayers) && prayers.length
    ? prayers.filter((p) => VALID_PRAYERS.includes(p))
    : VALID_PRAYERS;

  await db
    .collection(SUBSCRIPTIONS)
    .doc(endpointId(subscription.endpoint))
    .set(
      {
        subscription,
        location: { lat: location.lat, lon: location.lon },
        timezone: timezone || null,
        prayers: wanted,
        updatedAt: new Date().toISOString(),
      },
      // Merge so re-subscribing keeps the record of what was already sent and
      // does not replay today's prayers.
      { merge: true }
    );

  return res.status(200).json({ ok: true, prayers: wanted });
}
