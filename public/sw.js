const CACHE_NAME = 'ramadan-hub-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for same-origin or tile/CDN assets
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-first for API calls (prayer times, Quran data, mosque search)
  const isApiCall =
    url.hostname.includes('aladhan.com') ||
    url.hostname.includes('alquran.cloud') ||
    url.hostname.includes('overpass') ||
    url.hostname.includes('nominatim') ||
    url.hostname.includes('islamic.network');

  if (isApiCall) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets and map tiles
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request).then((response) => {
        if (response.ok && url.hostname === self.location.hostname) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
    )
  );
});
