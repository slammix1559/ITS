// sw.js – ITSApp Service Worker v5
// Gestisce cache PWA. Le notifiche push sono gestite da firebase-messaging-sw.js

const CACHE_NAME = "itsapp-v5";
const STATIC_ASSETS = ["./", "./index.html", "./firebase-messaging-sw.js"];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) {
      return c.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e) {
  // Non intercettare chiamate a Google APIs o Firebase
  if (e.request.url.includes("script.google.com")) return;
  if (e.request.url.includes("googleapis.com")) return;
  if (e.request.url.includes("firebase")) return;
  if (e.request.url.includes("gstatic.com")) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).catch(function() {
        return caches.match("./index.html");
      });
    })
  );
});
