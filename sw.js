/* GPS HCQ — service worker: deja la app disponible sin internet una vez abierta.
   Sube el número de VERSION cada vez que se publique una versión nueva de index.html. */
const VERSION = 'gps-hcq-v9';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
const PLANOS = ['./planos/S1.jpg', './planos/N1.jpg', './planos/N2.jpg', './planos/N3.jpg', './planos/S2.jpg', './planos/NC.jpg'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(CORE);
    // los planos se guardan de a uno: si alguno falla, la app igual se instala
    await Promise.all(PLANOS.map(u => c.add(u).catch(() => null)));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return; // fuentes de Google, etc.: directo a la red
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/');
  if (isPage) {
    // página: primero red (para recibir versiones nuevas), si no hay red se usa la copia guardada
    e.respondWith((async () => {
      try { const r = await fetch(req); const c = await caches.open(VERSION); c.put('./index.html', r.clone()); return r; }
      catch (err) { return (await caches.match('./index.html')) || Response.error(); }
    })());
    return;
  }
  // planos, teselas, íconos: primero la copia guardada, si no existe se baja y se guarda
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true }); if (hit) return hit;
    try { const r = await fetch(req); if (r.ok && /\.(jpg|jpeg|png|webp|json|webmanifest)$/i.test(url.pathname)) { const c = await caches.open(VERSION); c.put(req, r.clone()); } return r; }
    catch (err) { return Response.error(); }
  })());
});
