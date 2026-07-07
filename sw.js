/**
 * Service Worker — Cache-First 离线策略
 * PWA 可安装、离线可用
 */
const CACHE_NAME = 'youxiao-huaqian-v11';
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // 逐个缓存，单个文件失败不影响整体安装（addAll 是原子操作，一个 404 就全废）
      Promise.all(CACHE_URLS.map((url) => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // HTML 页面：网络优先（在线永远拿最新），离线再回退缓存
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // 其它资源：缓存优先
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
