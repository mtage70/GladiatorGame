const CACHE_NAME = 'gladiator-manager-cache-v6';

// We initially cache just the core structure
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './constants.js',
    './gladiator_generation.js',
    './main_menu.js',
    './home_screen.js',
    './match_screen.js',
    './combat_screen.js',
    './colosseum.png',
    './colosseum_interior.png',
    './crossed_swords.png',
    './empty_slot.png',
    './icon-192.png',
    './icon-512.png',
    // Portraits & Logos
    './portraits/logo_fenric.png',
    './portraits/logo_kaelen.png',
    './portraits/logo_lucinda.png',
    './portraits/logo_madeirna.png',
    './portraits/logo_orion.png',
    './portraits/logo_sacre.png',
    './portraits/logo_soren.png',
    './portraits/logo_theron.png',
    './portraits/logo_valen.png',
    './portraits/logo_vane.png',
    './portraits/logo_zephyr.png',
    './portraits/portrait_cleric_f.png',
    './portraits/portrait_cleric_m.png',
    './portraits/portrait_hunter_f.png',
    './portraits/portrait_hunter_m.png',
    './portraits/portrait_mage_f.png',
    './portraits/portrait_mage_m.png',
    './portraits/portrait_paladin_f.png',
    './portraits/portrait_paladin_m.png',
    './portraits/portrait_rogue_f.png',
    './portraits/portrait_rogue_m.png',
    './portraits/portrait_warrior_f.png',
    './portraits/portrait_warrior_m.png',
    // Arenas
    './arenas/arena_fenric_falcons.png',
    './arenas/arena_kaelen_krakens.png',
    './arenas/arena_lucinda_lions.png',
    './arenas/arena_madeirna_marauders.png',
    './arenas/arena_orion_owls.png',
    './arenas/arena_sacre_scarabs.png',
    './arenas/arena_soren_serpents.png',
    './arenas/arena_theron_thunder.png',
    './arenas/arena_valen_valkyries.png',
    './arenas/arena_vane_vanguard.png',
    './arenas/arena_zephyr_vipers.png'
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

    // For cross-origin requests (like Google Fonts), we still try to serve from cache or fetch.
    const isSameOrigin = event.request.url.startsWith(self.location.origin);

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse; // Return from cache
            }

            // Otherwise, fetch from network
            return fetch(event.request).then(networkResponse => {
                // If the response is valid, cache it for future offline use
                // For cross-origin assets (like fonts) we check for 'opaque' or 'cors' types
                if (!networkResponse || networkResponse.status !== 200 ||
                    (isSameOrigin && networkResponse.type !== 'basic')) {
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
