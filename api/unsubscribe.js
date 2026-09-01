import { firestore } from './_firestore.js';
import { unsubscribeToken, SITE_URL } from './_email.js';

function page(title, message, ok = true) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f6faf8;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px">
  <div style="max-width:460px;background:#fff;border:1px solid #e3ece8;border-radius:16px;padding:32px;text-align:center">
    <p style="font-size:40px;margin:0">${ok ? '☽' : '⚠️'}</p>
    <h1 style="font-size:20px;color:#111827;margin:12px 0 8px">${title}</h1>
    <p style="color:#4b5563;line-height:1.6;margin:0">${message}</p>
    <a href="${SITE_URL}" style="display:inline-block;margin-top:22px;background:#059669;color:#fff;text-decoration:none;padding:11px 22px;border-radius:999px;font-weight:700">Back to Medina App</a>
  </div>
</body></html>`;
}

export default async function handler(req, res) {
  const email = String(req.query.e || '').toLowerCase();
  const token = String(req.query.t || '');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!email || !token) {
    return res.status(400).send(page('Link incomplete', 'That unsubscribe link is missing information.', false));
  }

  let expected;
  try {
    expected = unsubscribeToken(email);
  } catch (err) {
    return res.status(500).send(page('Not configured', err.message, false));
  }
  if (token !== expected) {
    // Without the signature check anyone could unsubscribe anyone by editing
    // the address in the URL.
    return res.status(403).send(page('Link not valid', 'That unsubscribe link could not be verified.', false));
  }

  try {
    await firestore().collection('subscribers').doc(email).delete();
  } catch (err) {
    return res.status(500).send(page('Something went wrong', err.message, false));
  }

  return res
    .status(200)
    .send(page('You have been unsubscribed', `${email} will no longer receive updates from us.`));
}
