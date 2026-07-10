// Minimal, conservative service worker for HealthZone.
// Goal: make the installed PWA open offline and load fast — WITHOUT risking
// stale content. Only same-origin GET requests are handled. Cross-origin calls
// (Supabase API/auth) always hit the network and are never cached here.

const CACHE = 'healthzone-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch API/auth calls

  // Navigations: network-first so deploys are picked up, cache fallback offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return cached || caches.match('/');
        }
      })()
    );
    return;
  }

  // Vite emits content-hashed asset filenames, so cache-first is safe: a changed
  // asset has a new URL and misses the cache, fetching fresh.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE);
        cache.put(request, fresh.clone());
        return fresh;
      })()
    );
  }
});
