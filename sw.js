const CACHE_NAME = 'ethio-calendar-v19';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './synaxarium_feasts.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png',
    './og-image.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            const results = await Promise.allSettled(
                ASSETS.map((url) => cache.add(url))
            );
            results.forEach((result, i) => {
                if (result.status === 'rejected') {
                    console.warn('Service worker: failed to precache', ASSETS[i], result.reason);
                }
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            )),
            self.clients.claim()
        ])
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                console.warn('Network request failed, relying on cache for:', event.request.url);
                return null;
            });

            return cachedResponse || fetchPromise.then((networkResponse) => {
                if (networkResponse) return networkResponse;
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('', { status: 503, statusText: 'Offline' });
            });
        })
    );
});