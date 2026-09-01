// Web Push subscription helpers.
//
// iOS is the awkward case: Safari only allows notifications for a web app that
// has been added to the Home Screen, so on iPhone this is unavailable until the
// user installs it. Everything here degrades to "unsupported" rather than
// throwing, so callers can explain instead of failing silently.

export const VAPID_PUBLIC_KEY =
  'BMcNp3pU1RHXOt17hj54BqEo7FysNBhWDUJFRRqWE0WwjBbuGd_o8n4TZ4wOzjtMZHvQoHXx3tiG3eWnCjS16vs';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
}

export function pushSupport() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    // iOS below 16.4, or a browser without push at all.
    if (isIos() && !isStandalone()) {
      return { supported: false, reason: 'ios-not-installed' };
    }
    return { supported: false, reason: 'unsupported' };
  }
  if (isIos() && !isStandalone()) {
    return { supported: false, reason: 'ios-not-installed' };
  }
  return { supported: true, reason: null };
}

export async function getExistingSubscription() {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export async function subscribeToPrayerPush({ location, timezone, prayers }) {
  const reg = await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notifications are blocked. Enable them for this site in your browser settings.'
        : 'Notification permission was not granted.'
    );
  }

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub, location, timezone, prayers }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Could not save your reminder settings (${res.status}).`);
  }
  return sub;
}

export async function unsubscribeFromPrayerPush() {
  const sub = await getExistingSubscription();
  if (!sub) return;
  await fetch('/api/push/subscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => {});
  await sub.unsubscribe();
}
