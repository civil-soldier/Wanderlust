// sw.js
const CACHE_NAME = 'wanderlust-cache-v1';
const urlsToCache = [
 '/',
 '/manifest.json',
 '/favicon/android-chrome-192x192.png',
 '/favicon/android-chrome-512x512.png',
 '/favicon/apple-touch-icon.png',
 '/favicon/favicon-16x16.png',
 '/favicon/favicon-32x32.png',
 '/favicon/favicon.ico',
 '/favicon/site.webmanifest',
 '/js/map.js',
 '/js/script.js',
 '/js/searchSuggestions.js',
 '/js/register-sw.js',
 '/js/taxToggle.js',
 '/css/style.css',
 '/css/rating.css',
 '/js/sw.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});