const CACHE_NAME = 'gladiator-manager-cache-v7';

// We initially cache just the core structure
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    // CSS
    './css/variables.css',
    './css/base.css',
    './css/components.css',
    './css/main-menu.css',
    './css/home-screen.css',
    './css/match-screen.css',
    './css/combat-screen.css',
    './css/responsive.css',
    // JS — Data
    './js/data/classes.js',
    './js/data/names.js',
    './js/data/teams.js',
    // JS — Utilities
    './js/utils.js',
    // JS — Engine
    './js/engine/gladiator.js',
    './js/engine/season.js',
    // JS — UI
    './js/ui/components.js',
    './js/ui/audio.js',
    // JS — Screens
    './js/screens/main-menu.js',
    './js/screens/home-screen.js',
    './js/screens/match-screen.js',
    './js/screens/combat-screen.js',
    // Assets — Icons
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    // Assets — UI
    './assets/ui/colosseum.png',
    './assets/ui/colosseum_interior.png',
    './assets/ui/crossed_swords.png',
    './assets/ui/empty_slot.png',
    './assets/ui/fireball.png',
    './assets/ui/arrow.png',
    // Assets — Portraits & Logos
    './assets/portraits/logo_fenric.png',
    './assets/portraits/logo_kaelen.png',
    './assets/portraits/logo_lucinda.png',
    './assets/portraits/logo_madeirna.png',
    './assets/portraits/logo_orion.png',
    './assets/portraits/logo_sacre.png',
    './assets/portraits/logo_soren.png',
    './assets/portraits/logo_theron.png',
    './assets/portraits/logo_valen.png',
    './assets/portraits/logo_vane.png',
    './assets/portraits/logo_zephyr.png',
    './assets/portraits/portrait_cleric_f.png',
    './assets/portraits/portrait_cleric_m.png',
    './assets/portraits/portrait_hunter_f.png',
    './assets/portraits/portrait_hunter_m.png',
    './assets/portraits/portrait_mage_f.png',
    './assets/portraits/portrait_mage_m.png',
    './assets/portraits/portrait_paladin_f.png',
    './assets/portraits/portrait_paladin_m.png',
    './assets/portraits/portrait_rogue_f.png',
    './assets/portraits/portrait_rogue_m.png',
    './assets/portraits/portrait_warrior_f.png',
    './assets/portraits/portrait_warrior_m.png',
    // Assets — Arenas
    './assets/arenas/arena_fenric_falcons.png',
    './assets/arenas/arena_kaelen_krakens.png',
    './assets/arenas/arena_lucinda_lions.png',
    './assets/arenas/arena_madeirna_marauders.png',
    './assets/arenas/arena_orion_owls.png',
    './assets/arenas/arena_sacre_scarabs.png',
    './assets/arenas/arena_soren_serpents.png',
    './assets/arenas/arena_theron_thunder.png',
    './assets/arenas/arena_valen_valkyries.png',
    './assets/arenas/arena_vane_vanguard.png',
    './assets/arenas/arena_zephyr_vipers.png'
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
