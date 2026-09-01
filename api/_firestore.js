// Firestore access for the serverless functions.
//
// The browser talks to Firestore through the client SDK under security rules,
// but the cron job has to read every subscriber's record, which no client is
// allowed to do. So the functions authenticate as a service account instead.
//
// Set FIREBASE_SERVICE_ACCOUNT in Vercel to the whole service-account JSON
// (Firebase console → Project settings → Service accounts → Generate new
// private key). It is a secret: it bypasses security rules entirely.

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db;

export function firestore() {
  if (db) return db;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
  }

  let credentials;
  try {
    // Accept the raw JSON or a base64 copy of it — pasting multi-line JSON into
    // a dashboard field goes wrong often enough to be worth allowing both.
    const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    credentials = JSON.parse(text);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON');
  }

  const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(credentials) });
  db = getFirestore(app);
  return db;
}

export const SUBSCRIPTIONS = 'pushSubscriptions';

// Push endpoints are long URLs; Firestore document ids cannot contain "/" and
// are capped at 1500 bytes, so key documents by a hash of the endpoint.
export function endpointId(endpoint) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < endpoint.length; i++) {
    const ch = endpoint.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (
    (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')
  );
}
