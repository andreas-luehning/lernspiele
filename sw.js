// Service Worker: macht die Lernspiele installierbar und offline nutzbar.
//
// Strategie wie bei der Randori-Uhr: Erst das Netz (mit Prüfung auf neue Version, cache: 'no-cache'),
// nur ohne Netz der gespeicherte Stand. So bekommt das Tablet Updates sofort und nie eine Mischung aus
// alten und neuen Dateien. Nur eigene Dateien, keine fremden Adressen.
//
// Bei jeder Änderung an den Dateien VERSION erhöhen. Neue Dateien in DATEIEN eintragen
// (tests/app-browser.js prüft, dass nichts fehlt).
const VERSION = 'v8';
const CACHE = 'lernspiele-' + VERSION;
const DATEIEN = [
  './', 'index.html', 'startseite.css', 'manifest.webmanifest',
  'gemeinsam/theme.css', 'gemeinsam/thema.js', 'gemeinsam/app.js', 'gemeinsam/speicher.js', 'gemeinsam/einstellungen.js', 'gemeinsam/probe.js',
  'gemeinsam/ziffern.js', 'gemeinsam/ziffern-modell.json', 'gemeinsam/schreibfeld.js',
  'gemeinsam/runde.js', 'gemeinsam/parade-logik.js', 'gemeinsam/parade-bilder.js', 'gemeinsam/parade.js', 'gemeinsam/parade.css',
  'gemeinsam/schriften/andika-latin-400-normal.woff2', 'gemeinsam/schriften/andika-latin-700-normal.woff2',
  'gemeinsam/schriften/grandstander-latin-600-normal.woff2', 'gemeinsam/schriften/grandstander-latin-800-normal.woff2',
  'gemeinsam/icons/icon.svg', 'gemeinsam/icons/icon-192.png', 'gemeinsam/icons/icon-512.png',
  'gemeinsam/icons/icon-512-maskable.png', 'gemeinsam/icons/apple-touch-icon.png',
  'zehnerweg/', 'zehnerweg/index.html', 'zehnerweg/zehnerweg.css', 'zehnerweg/zehnerweg.js', 'zehnerweg/aufgaben.js',
  'garten/', 'garten/index.html', 'garten/garten.css', 'garten/garten.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN.map(d => new Request(d, { cache: 'no-cache' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('lernspiele-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        if (res.ok && res.type === 'basic') { const kopie = res.clone(); caches.open(CACHE).then(c => c.put(e.request, kopie)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

// Für die Diagnose auf der Startseite
self.addEventListener('message', e => { if (e.data === 'version') e.source.postMessage({ version: VERSION }); });
