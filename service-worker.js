const CACHE_NAME = 'gladiator-manager-cache-v3';

// We initially cache just the core structure
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './constants.js',
    './main_menu.js',
    './home_screen.js',
    './match_screen.js',
    './combat_screen.js',
    './fix.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    // Clean up old caches if any
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Cache falling back to network strategy, dynamically caching new assets like images
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    // We only try to cache requests for same-origin resources
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse; // Return from cache
            }

            // Otherwise, fetch from network
            return fetch(event.request).then(networkResponse => {
                // If the response is valid, cache it for future offline use
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // Return fallback if offline and not in cache
                // Could return a default offline image here if needed, or index.html if navigation
            });
        })
    );
});
