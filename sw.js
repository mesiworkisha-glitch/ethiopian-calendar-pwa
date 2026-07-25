const CACHE_NAME = 'ethio-calendar-v331';
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
    './og-image.png',
    './favicon.ico',
    './icon-192x192.png'
];

// Install event - cache all assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[SW] Caching assets...');
            const results = await Promise.allSettled(
                ASSETS.map((url) => cache.add(url).catch((err) => {
                    console.warn('[SW] Failed to cache:', url, err);
                    // Return null on failure to continue caching other assets
                    return null;
                }))
            );
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                console.warn(`[SW] ${failed.length} assets failed to cache`);
            } else {
                console.log('[SW] All assets cached successfully');
            }
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients immediately
            self.clients.claim()
        ])
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and chrome-extension requests
    if (event.request.method !== 'GET' || 
        event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // If found in cache, return it (stale-while-revalidate)
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Update cache with fresh response
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch((error) => {
                console.warn('[SW] Network request failed:', event.request.url, error);
                return null;
            });

            // Return cached response immediately, then update in background
            if (cachedResponse) {
                // Return cached response, but don't wait for network
                return cachedResponse;
            }

            // If not in cache, try network
            return fetchPromise.then((networkResponse) => {
                if (networkResponse) return networkResponse;
                
                // If both cache and network fail, try to return the offline page
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                
                return new Response('', { 
                    status: 503, 
                    statusText: 'Offline - Please check your internet connection' 
                });
            });
        })
    );
});

// Message event - handle skip waiting
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Handle offline fallback for images
self.addEventListener('fetch', (event) => {
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).catch(() => {
                    // Return a simple SVG placeholder for missing images
                    return new Response(
                        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                            <rect width="200" height="200" fill="#e2e8f0"/>
                            <text x="100" y="100" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#718096">Image unavailable</text>
                        </svg>`,
                        { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                });
            })
        );
    }
});