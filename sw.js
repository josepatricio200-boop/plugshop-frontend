// PLUGSHOP: service worker mínimo.
// - Páginas: siempre se pide la versión nueva a internet; si no hay conexión, se muestra la última guardada.
// - Nunca se guarda nada del servidor de datos (pedidos, cuentas, tokens): solo la propia página y los íconos.
const CACHE = 'plugshop-shell-v1';
const SHELL = ['/', '/index.html', '/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API, Cloudinary, CDN: no se tocan
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok && !url.pathname.startsWith('/admin')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('/index.html', copy)); }
        return res;
      }).catch(() => caches.match(url.pathname.startsWith('/admin') ? '/admin.html' : '/index.html').then(r => r || caches.match('/index.html')))
    );
  }
});
