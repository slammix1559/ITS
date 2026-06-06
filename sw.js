// sw.js – ITSApp Service Worker v4
const CACHE_NAME = "itsapp-v4";
const STATIC_ASSETS = ["./", "./index.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
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
  if (e.request.url.includes("script.google.com")) return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).catch(() => caches.match("./index.html"))
    )
  );
});

// ── NOTIFICHE PUSH FCM ──
self.addEventListener("push", e => {
  let data = { title: "ITSApp", body: "Nuova comunicazione", url: "./" };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch(x) {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./logoITS.png",
      badge: "./logoITS.png",
      data: { url: data.url },
      vibrate: [200, 100, 200]
    })
  );
});

// Clic sulla notifica → apre l'app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes("slammix1559.github.io") && "focus" in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});
