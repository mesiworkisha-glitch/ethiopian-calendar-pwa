const VERSION = "38";

const STATIC_CACHE = `ethio-static-${VERSION}`;
const RUNTIME_CACHE = `ethio-runtime-${VERSION}`;
const IMAGE_CACHE = `ethio-images-${VERSION}`;
const DATA_CACHE = `ethio-data-${VERSION}`;

const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./offline.html",
    "./style.css",
    "./app.js",
    "./helpers.js",
    "./manifest.json",
    "./sw-register.js",
    "./icon.svg",
    "./icon-192x192.png",
    "./icon-512.png",
    "./og-image.png"
];

const DATA_FILES = [
    "./synaxarium_feasts.json"
];

async function trimCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    while (keys.length > maxEntries) {
        await cache.delete(keys.shift());
    }
}

self.addEventListener("install", event => {
    self.skipWaiting();

    event.waitUntil((async () => {
        const staticCache = await caches.open(STATIC_CACHE);
        const dataCache = await caches.open(DATA_CACHE);

        await Promise.allSettled(
            STATIC_ASSETS.map(asset => staticCache.add(asset))
        );

        await Promise.allSettled(
            DATA_FILES.map(asset => dataCache.add(asset))
        );
    })());
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {

        if (self.registration.navigationPreload) {
            await self.registration.navigationPreload.enable();
        }

        const expected = [
            STATIC_CACHE,
            RUNTIME_CACHE,
            IMAGE_CACHE,
            DATA_CACHE
        ];

        const keys = await caches.keys();

        await Promise.all(
            keys.map(key => {
                if (!expected.includes(key)) {
                    return caches.delete(key);
                }
            })
        );

        await self.clients.claim();

        const clients = await self.clients.matchAll();

        clients.forEach(client => {
            client.postMessage({
                type: "SW_ACTIVATED",
                version: VERSION
            });
        });

    })());
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (url.protocol !== "http:" && url.protocol !== "https:") return;

    if (
        url.protocol.startsWith("chrome-extension") ||
        url.protocol.startsWith("moz-extension") ||
        url.protocol.startsWith("edge-extension")
    ) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(networkFirstNavigation(event));
        return;
    }

    if (request.destination === "image") {
        event.respondWith(cacheFirstImage(request));
        return;
    }

    if (request.url.endsWith(".json") || request.url.includes("synaxarium")) {
        event.respondWith(networkFirstData(request));
        return;
    }

    if (
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "font" ||
        request.destination === "manifest"
    ) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    event.respondWith(runtimeCache(request));
});

async function networkFirstNavigation(event) {
    const request = event.request;
    
    try {
        const preload = await event?.preloadResponse;
        if (preload) return preload;
    } catch {}

    try {
        const response = await fetch(request);

        if (response && response.ok && response.type === "basic") {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
            trimCache(RUNTIME_CACHE, 50);
        }

        return response;

    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return (await caches.match("./offline.html")) || (await caches.match("./index.html"));
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    
    const network = fetch(request)
        .then(response => {
            if (response && response.ok && response.type === "basic") {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => null);

    return cached || network;
}

async function networkFirstData(request) {
    const cache = await caches.open(DATA_CACHE);
    
    try {
        const response = await fetch(request);

        if (response && response.ok) {
            cache.put(request, response.clone());
            trimCache(DATA_CACHE, 25);
        }

        return response;
    } catch {
        const cached = await cache.match(request);
        if (cached) return cached;

        return new Response("{}", {
            headers: { "Content-Type": "application/json" }
        });
    }
}

async function cacheFirstImage(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);

        if (response && response.ok) {
            cache.put(request, response.clone());
            trimCache(IMAGE_CACHE, 100);
        }

        return response;
    } catch {
        return (await caches.match("./icon.svg")) || (await caches.match("./icon-192x192.png"));
    }
}

async function runtimeCache(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);

        if (response && response.ok && response.type === "basic") {
            cache.put(request, response.clone());
            trimCache(RUNTIME_CACHE, 50);
        }

        return response;
    } catch {
        return cached || Response.error();
    }
}

self.addEventListener("message", event => {
    if (!event.data) return;

    switch (event.data.type) {
        case "SKIP_WAITING":
            self.skipWaiting();
            break;
    }
});