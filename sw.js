// Asso dei Cieli - funzionamento offline
const CACHE = 'asso-dei-cieli-v18';
const FILES = ['./', './index.html', './manifest.webmanifest', './style.css', './01-base.js', './02-scenario.js', './03-audio.js', './04-stato.js', './05-hangar.js', './06-comandi.js', './07-nemici.js', './08-combattimento.js', './09-extra.js', './10-modalita.js', './11-aggiornamento.js', './12-disegno.js', './13-avvio.js',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// I file del gioco: prima la rete (cosi' gli aggiornamenti arrivano subito), poi la cache se sei offline.
// I font di Google: prima la cache, poi la rete.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.startsWith(self.location.origin)){
    e.respondWith(fetch(e.request)
      .then(r => { if (r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  if (url.includes('fonts.g')){
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
    })));
  }
});
