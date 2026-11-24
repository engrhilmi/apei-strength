// APEIs Strength Portal — lets phones install the portal as an app. Always fetches the latest version.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request).catch(() => new Response('<h2 style="font-family:sans-serif;padding:20px">No internet connection — connect and reopen the app.</h2>', {headers:{'Content-Type':'text/html'}})));
});
