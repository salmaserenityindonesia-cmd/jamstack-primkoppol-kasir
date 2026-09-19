const CACHE_NAME = 'supervisor-shell-v1';
const DYNAMIC_CACHE = 'supervisor-dynamic-v1';

const ASSETS = [
  '/supervisor',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/tailwind-theme.js',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Stale-While-Revalidate Strategy for UI shell & assets
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.ok && event.request.method === 'GET' && !event.request.url.includes('/api/')) {
          const clone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(err => {
        // Jika offline & tidak ada cache, jangan return undefined, biarkan reject agar browser menampilkan halaman offline native
        if (!cachedResponse) throw err;
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
