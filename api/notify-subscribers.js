import { getAuth } from 'firebase-admin/auth';
import { firestore } from './_firestore.js';
import { sendEmail, eventEmail } from './_email.js';

// Must match ADMIN_EMAILS in src/admins.js and the admins in firestore.rules.
const ADMIN_EMAILS = ['medinaacademylearning@gmail.com'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // This endpoint can mail every subscriber, so it verifies the caller's
  // Firebase token server-side. Trusting a flag from the browser would let
  // anyone who found the URL send mail from your domain.
  const header = req.headers.authorization || '';
  const idToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!idToken) return res.status(401).json({ error: 'Missing auth token' });

  let db;
  try {
    db = firestore();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  let caller;
  try {
    caller = await getAuth().verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ error: 'Invalid auth token' });
  }
  if (!ADMIN_EMAILS.includes((caller.email || '').toLowerCase())) {
    return res.status(403).json({ error: 'Not an admin' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const event = body.event;
  if (!event?.title) return res.status(400).json({ error: 'event.title is required' });

  const snap = await db.collection('subscribers').get();
  const recipients = snap.docs.map((d) => d.data().email).filter(Boolean);
  if (!recipients.length) return res.status(200).json({ sent: 0, failed: 0, note: 'No subscribers yet' });

  const results = { sent: 0, failed: 0, errors: [] };

  // One message per person, so each carries its own unsubscribe link and no
  // subscriber can see another's address.
  for (const to of recipients) {
    try {
      const { subject, html, text } = eventEmail(event, to);
      await sendEmail({ to, subject, html, text });
      results.sent++;
    } catch (err) {
      results.failed++;
      if (results.errors.length < 5) results.errors.push(`${to}: ${err.message}`);
    }
  }

  return res.status(200).json(results);
}
