const CACHE_NAME = 'anime-online-v1';

// Recursos para cache inicial (shell do app)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// ── Instalação: faz o pre-cache do shell ──────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// ── Ativação: limpa caches antigos ───────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Cache First para assets estáticos, Network First para o resto ─────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-GET e de outras origens (ex.: CDNs de vídeo)
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // Estratégia Cache First para assets (CSS, JS, imagens, fontes)
  const isAsset = /\.(css|js|png|jpg|jpeg|gif|svg|webp|woff2?|ico)$/i.test(url.pathname);

  if (isAsset) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Estratégia Network First para HTML (sempre tenta buscar versão fresca)
  event.respondWith(
    fetch(request)
      .then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
  );
});
