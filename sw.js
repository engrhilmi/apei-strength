// APEIs Strength Portal — opens instantly from the copy saved on this device, then checks for a newer version in the background.
const C = 'apeis-shell-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== C) await caches.delete(k);
  await self.clients.claim();
})()));
const cacheable = u => u.origin === self.location.origin
  || (u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/'))
  || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url); if (!cacheable(u)) return;
  const page = req.mode === 'navigate';
  const key = page ? new Request(self.location.origin + u.pathname) : req;   // ?query does not make a new copy
  e.respondWith((async () => {
    const c = await caches.open(C); const hit = await c.match(key);
    const net = fetch(req).then(async r => {
      if (r && (r.ok || r.type === 'opaque')) {
        if (page && hit) { const [a, b] = await Promise.all([hit.clone().text(), r.clone().text()]); if (a !== b) {
          const all = await self.clients.matchAll({ type: 'window' }); all.forEach(w => w.postMessage('apeis-updated')); } }
        await c.put(key, r.clone());
      }
      return r;
    });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    try { return await net; }
    catch (x) { return new Response('<h2 style="font-family:sans-serif;padding:20px">No internet connection — connect and reopen the app.</h2>', { headers: { 'Content-Type': 'text/html' } }); }
  })());
});
