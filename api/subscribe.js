import { firestore } from './_firestore.js';
import { sendEmail, unsubscribeUrl, SITE_URL } from './_email.js';

// Deliberately simple: enough to reject nonsense, not so strict that it turns
// away valid but unusual addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function welcomeEmail(to) {
  const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f6faf8;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e3ece8">
    <div style="background:#065f46;color:#fff;padding:24px">
      <p style="margin:0;font-size:22px;font-weight:700">☽ Medina App</p>
      <p style="margin:6px 0 0;color:#a7f3d0;font-size:14px">Thank you for subscribing</p>
    </div>
    <div style="padding:24px;color:#374151;line-height:1.7">
      <p style="margin:0 0 14px">Assalamu alaikum,</p>
      <p style="margin:0 0 14px">
        You're subscribed to updates from Medina App. We'll email you when a new community
        event is posted — nothing more, and never your address to anyone else.
      </p>
      <p style="margin:0 0 6px">In the meantime you can:</p>
      <ul style="margin:0 0 18px;padding-left:20px">
        <li>Check prayer times for your city</li>
        <li>Read the Qur'an and daily azkar</li>
        <li>Find the Qibla and nearby mosques</li>
        <li>Follow the Umrah and Hajj guides</li>
      </ul>
      <a href="${SITE_URL}"
         style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700">
        Open Medina App
      </a>
    </div>
    <div style="padding:16px 24px;border-top:1px solid #eef2f0;color:#9ca3af;font-size:12px">
      You are receiving this because you subscribed at ${SITE_URL}.<br>
      <a href="${unsubscribeUrl(to)}" style="color:#6b7280">Unsubscribe</a>
    </div>
  </div>
</div>`.trim();

  const text = [
    'Assalamu alaikum,',
    '',
    "You're subscribed to updates from Medina App. We'll email you when a new community event is posted.",
    '',
    `Open the app: ${SITE_URL}`,
    `Unsubscribe: ${unsubscribeUrl(to)}`,
  ].join('\n');

  return { subject: 'Thank you for subscribing to Medina App', html, text };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const email = String(body.email || '').trim().toLowerCase();

  if (!EMAIL_RE.test(email) || email.length > 200) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  let db;
  try {
    db = firestore();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  // The address is the document id, so subscribing twice updates one record
  // rather than leaving duplicates behind.
  const ref = db.collection('subscribers').doc(email);
  const existing = await ref.get();
  await ref.set(
    { email, createdAt: existing.exists ? existing.data().createdAt : new Date().toISOString() },
    { merge: true }
  );

  // Saving is the part that matters; a mail problem must not make a
  // successful subscription look like a failure.
  let welcomed = false;
  let mailError = null;
  if (!existing.exists) {
    try {
      const { subject, html, text } = welcomeEmail(email);
      await sendEmail({ to: email, subject, html, text });
      welcomed = true;
    } catch (err) {
      mailError = err.message;
    }
  }

  return res.status(200).json({ ok: true, alreadySubscribed: existing.exists, welcomed, mailError });
}
