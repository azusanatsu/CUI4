const CACHE = 'cui4-v1';
const CORE = [
  './',
  './index.html',
  './site.webmanifest',
  './icons/web-app-manifest-192x192.png',
  './icons/web-app-manifest-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  './icons/favicon.svg',
  './icons/favicon-96x96.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 只接管同源请求，第三方（Cloudflare Worker、wttr.in、cdnjs 等）直接放行
  if (url.origin !== location.origin) return;

  e.respondWith(
    Promise.race([
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }),
      new Promise((_, rej) => setTimeout(rej, 3000))
    ]).catch(() => caches.match(e.request))
  );
});