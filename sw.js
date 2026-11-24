// 앱 화면을 기기에 저장해 두고 바로 열리게 해요. 메모 데이터는 여기서 다루지 않아요.
const CACHE = 'simple-notes-v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 저장해 둔 화면을 먼저 보여 주고, 뒤에서 최신 버전을 받아 다음 실행 때 반영해요.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const network = fetch(req).then(async (res) => {
    if (res.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(req, res.clone());
    }
    return res;
  });
  e.waitUntil(network.catch(() => {}));
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => cached || network)
  );
});
