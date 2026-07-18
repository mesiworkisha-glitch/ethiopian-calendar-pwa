// Changed version to v2 to force an update
const CACHE_NAME = 'ethio-calendar-v2';
const ASSETS = [
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './synaxarium_feasts.json'
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

// Added an activate event to delete the old 'v1' cache
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

// Changed to Network-First strategy
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // If the network works, update the cache with the fresh file and return it
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // If the network fails (offline), fall back to the cache
                return caches.match(event.request);
            })
    );
});