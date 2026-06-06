// sw.js – ITSApp Service Worker
const CACHE_NAME = "itsapp-v2";
const STATIC_ASSETS = [
  "./",
  "./index.html"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Per le chiamate API, sempre rete
  if (e.request.url.includes("script.google.com")) return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).catch(() => caches.match("./index.html"))
    )
  );
});

// Notifiche push (future)
self.addEventListener("push", e => {
  const data = e.data ? e.data.json() : { title: "ITSApp", body: "Nuova comunicazione" };
  e.waitUntil(
    self.registration.showNotification(data.title || "ITSApp", {
      body: data.body || "",
      icon: "./logoITS.png",
      badge: "./logoITS.png"
    })
  );
});
