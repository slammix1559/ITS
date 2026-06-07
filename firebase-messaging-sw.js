// firebase-messaging-sw.js – ITSApp
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

// Notifiche in background
messaging.onBackgroundMessage(function(payload) {
  const n = payload.notification || {};
  const title = n.title || "ITSApp";
  const body  = n.body  || "Nuova comunicazione";
  return self.registration.showNotification(title, {
    body:    body,
    icon:    "https://slammix1559.github.io/ITS/logoITS.png",
    badge:   "https://slammix1559.github.io/ITS/logoITS.png",
    vibrate: [200, 100, 200],
    tag:     "itsapp-notifica",
    renotify: true,
    data:    { url: "https://slammix1559.github.io/ITS/" }
  });
});

// Clic sulla notifica
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
