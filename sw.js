const VERSION = "41";

const STATIC_CACHE = `ethio-static-${VERSION}`;
const RUNTIME_CACHE = `ethio-runtime-${VERSION}`;
const IMAGE_CACHE = `ethio-images-${VERSION}`;
const DATA_CACHE = `ethio-data-${VERSION}`;

const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./offline.html",
    "./style.css",
    "./planning.css",
    "./planning.js",
    "./planning-integrated.js",
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
    while (keys.length > maxEntries) await cache.delete(keys.shift());
}

self.addEventListener("install", event => {
    self.skipWaiting();
    event.waitUntil((async () => {
        const staticCache = await caches.open(STATIC_CACHE);
        const dataCache = await caches.open(DATA_CACHE);
        await Promise.allSettled(STATIC_ASSETS.map(asset => staticCache.add(asset)));
        await Promise.allSettled(DATA_FILES.map(asset => dataCache.add(asset)));
    })());
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
        const expected = [STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE, DATA_CACHE];
        const keys = await caches.keys();
        await Promise.all(keys.map(key => expected.includes(key) ? undefined : caches.delete(key)));
        await self.clients.claim();
        const clients = await self.clients.matchAll();
        clients.forEach(client => client.postMessage({type:"SW_ACTIVATED",version:VERSION}));
    })());
});

self.addEventListener("fetch", event => {
    const request = event.request;
    if (request.method !== "GET") return;
    const url = new URL(request.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") return;
    // Keep the remainder of the existing fetch strategy unchanged by using
    // the same cache-first/static and network/runtime behavior as the prior SW.
    if (STATIC_ASSETS.includes(url.pathname.replace(/.*(?=\/)/, ".")) || request.mode === "navigate") {
        event.respondWith((async () => {
            const cached = await caches.match(request);
            if (cached) return cached;
            try { return await fetch(request); } catch (_) { return caches.match("./offline.html"); }
        })());
        return;
    }
    event.respondWith((async () => {
        const cached = await caches.match(request);
        try {
            const response = await fetch(request);
            if (response && response.ok && url.origin === self.location.origin) {
                const cache = await caches.open(RUNTIME_CACHE);
                await cache.put(request, response.clone());
                trimCache(RUNTIME_CACHE, 60);
            }
            return response;
        } catch (_) { return cached || caches.match("./offline.html"); }
    })());
});