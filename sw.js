// sw.js – ITSApp Service Worker v9 — UNIFICATO con Firebase
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "AIzaSyCRMdHMu41u0UEgUvT3SNfQF1BlvdZwfC8",
  authDomain:        "its-lombardia-meccatronica.firebaseapp.com",
  projectId:         "its-lombardia-meccatronica",
  storageBucket:     "its-lombardia-meccatronica.firebasestorage.app",
  messagingSenderId: "260932633943",
  appId:             "1:260932633943:web:1bcdb5d8f2393ff667aa12"
});

const messaging = firebase.messaging();

const CACHE_NAME = "itsapp-v9";

self.addEventListener("install", function(e) {
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
      // RIMOSSO: client.navigate che causava reload e interrompeva registraDevice
    })
  );
});

self.addEventListener("fetch", function(e) {
  if (e.request.url.includes("script.google.com")) return;
  if (e.request.url.includes("googleapis.com")) return;
  if (e.request.url.includes("firebase")) return;
  if (e.request.url.includes("gstatic.com")) return;

  // Network-first per index.html
  if (e.request.mode === "navigate" ||
      e.request.url.endsWith("/ITS/") ||
      e.request.url.endsWith("/ITS/index.html") ||
      e.request.url.endsWith("index.html")) {
    e.respondWith(
      fetch(e.request).then(function(networkResponse) {
        var clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        return networkResponse;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Network-first per tutto
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});

// NOTIFICHE FCM IN BACKGROUND
messaging.onBackgroundMessage(function(payload) {
  const n = payload.notification || {};
  const title = n.title || "Libretto digitale";
  const body  = n.body  || "Nuova comunicazione";
  return self.registration.showNotification(title, {
    body:     body,
    icon:     "https://slammix1559.github.io/ITS/ITS_academy_logo.png",
    badge:    "https://slammix1559.github.io/ITS/ITS_academy_logo.png",
    vibrate:  [200, 100, 200],
    tag:      "itsapp-notifica",
    renotify: true,
    data:     { url: "https://slammix1559.github.io/ITS/" }
  });
});

self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url)
    ? e.notification.data.url
    : "https://slammix1559.github.io/ITS/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes("slammix1559.github.io") && "focus" in list[i]) {
          return list[i].focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
