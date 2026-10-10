/* Asso dei Cieli - service worker (stesso schema di Lucci's Space Race).
   Pagina: prima la rete, poi la copia salvata se sei offline.
   Altri file: dalla copia salvata, aggiornata in background. */
const CACHE = 'asso-dei-cieli-v20';
const CORE = ['./', './index.html', './manifest.webmanifest', './style.css', './icon-192.png', './icon-512.png',
  './01-base.js', './02-scenario.js', './03-audio.js', './04-stato.js', './05-hangar.js', './06-comandi.js', './07-nemici.js', './08-combattimento.js', './09-extra.js', './10-modalita.js', './11-aggiornamento.js', './12-disegno.js', './13-avvio.js'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var isDoc = req.mode === 'navigate' || (sameOrigin && (url.pathname.endsWith('/') || url.pathname.endsWith('.html')));
  if (isDoc) {
    e.respondWith(
      fetch(req, { cache: 'no-cache' }).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
      })
    );
    return;
  }
  var okHost = sameOrigin || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!okHost) return;
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
