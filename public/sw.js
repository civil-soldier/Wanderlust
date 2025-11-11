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
 '/sw.js'
];

// public/sw.js — Dev-safe version
self.addEventListener("install", (event) => {
  console.log("Service Worker installed (dev mode, no caching).");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated (dev mode).");
});

self.addEventListener("fetch", (event) => {
  // Don't interfere with any network requests (like PUT/POST/DELETE)
});
