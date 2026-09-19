/**
 * sw.js — Service Worker Ringan untuk PWA Pengawas Primkoppol
 * Cache-First Strategy untuk shell UI Supervisor Dashboard.
 */

const CACHE_NAME = 'koppol-supervisor-v1';

const SHELL_ASSETS = [
    '/supervisor',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/tailwind-theme.js',
    'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap',
    'https://cdn.tailwindcss.com'
];

// Install: pra-cache shell assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Koppol Monitor Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(SHELL_ASSETS.filter(url => !url.startsWith('https://cdn')));
        }).then(() => self.skipWaiting())
    );
});

// Activate: hapus cache lama
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Koppol Monitor Service Worker...');
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: Cache-First untuk shell, Network-First untuk API
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Network-first untuk API calls (data harus segar)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
        return;
    }

    // Cache-first untuk shell UI dan aset statis
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                if (response.ok && request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            }).catch(() => {
                // Fallback ke halaman supervisor saat offline
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/supervisor');
                }
            });
        })
    );
});
