// Upgraded version to v3 to force update and new strategies
const CACHE_NAME = 'ethio-calendar-v3';
const ASSETS = [
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './synaxarium_feasts.json',
    './icon.svg' // CRITICAL FIX: The app icon is now cached for strict offline capability
];

self.addEventListener('install', (event) => {
    // Force the new service worker to take over immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate event to clear old cache deployments
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Stale-While-Revalidate strategy for optimal offline PWA capability
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Initiate a network request to update the cache in the background
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Silently ignore network errors to ensure smooth offline fallback
                console.warn('Network request failed, relying purely on cache for: ', event.request.url);
            });

            // Return the cached response immediately if present, otherwise wait for the network request
            return cachedResponse || fetchPromise;
        })
    );
});