import crypto from 'crypto';

// Resend's REST API directly rather than their SDK — one fetch call, one less
// dependency in the serverless bundle.
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export const SITE_URL = process.env.SITE_URL || 'https://faith.medinaacademylearning.com';

export function emailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  if (!from) throw new Error('EMAIL_FROM is not set (e.g. "Medina App <news@medinaacademylearning.com>")');
  return { apiKey, from };
}

// Unsubscribing must work from a link in an email, where the reader is not
// signed in — so the link carries a signature proving it came from us, rather
// than letting anyone remove any address by guessing the URL.
export function unsubscribeToken(email) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error('UNSUBSCRIBE_SECRET is not set');
  return crypto.createHmac('sha256', secret).update(email.toLowerCase()).digest('hex').slice(0, 32);
}

export function unsubscribeUrl(email) {
  const e = encodeURIComponent(email.toLowerCase());
  return `${SITE_URL}/api/unsubscribe?e=${e}&t=${unsubscribeToken(email)}`;
}

export async function sendEmail({ to, subject, html, text }) {
  const { apiKey, from } = emailConfig();
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
      // Lets mail clients show their own one-click unsubscribe, which keeps
      // people from reporting the mail as spam to achieve the same thing.
      headers: { 'List-Unsubscribe': `<${unsubscribeUrl(to)}>` },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function eventEmail(event, recipient) {
  const title = escapeHtml(event.title);
  const rows = [
    event.date && `📅 ${escapeHtml(event.date)}`,
    event.time && `🕐 ${escapeHtml(event.time)}`,
    event.location && `📍 ${escapeHtml(event.location)}`,
  ].filter(Boolean);

  const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f6faf8;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e3ece8">
    <div style="background:#065f46;color:#fff;padding:20px 24px">
      <p style="margin:0;font-size:20px;font-weight:700">☽ Medina App</p>
      <p style="margin:4px 0 0;color:#a7f3d0;font-size:13px">A new community event has been posted</p>
    </div>
    <div style="padding:24px">
      <h1 style="margin:0;font-size:22px;color:#111827">${title}</h1>
      ${event.description ? `<p style="color:#4b5563;line-height:1.6">${escapeHtml(event.description)}</p>` : ''}
      ${rows.length ? `<p style="color:#4b5563;line-height:1.9;margin-top:16px">${rows.join('<br>')}</p>` : ''}
      <a href="${SITE_URL}/events"
         style="display:inline-block;margin-top:20px;background:#059669;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700">
        View the event
      </a>
    </div>
    <div style="padding:16px 24px;border-top:1px solid #eef2f0;color:#9ca3af;font-size:12px">
      You are receiving this because you subscribed at ${SITE_URL}.<br>
      <a href="${unsubscribeUrl(recipient)}" style="color:#6b7280">Unsubscribe</a>
    </div>
  </div>
</div>`.trim();

  const text = [
    `A new community event has been posted: ${event.title}`,
    event.description || '',
    ...rows.map((r) => r.replace(/^[^\s]+\s/, '')),
    '',
    `View it: ${SITE_URL}/events`,
    `Unsubscribe: ${unsubscribeUrl(recipient)}`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject: `New event: ${event.title}`, html, text };
}
