/*
  Firebase Messaging Service Worker (compat SDK)
  - Place this file at the web root: /firebase-messaging-sw.js
  - Handles background messages for web push notifications.
  - Uses importScripts for CDN Firebase compat SDK.
*/

console.log("[firebase-messaging-sw] Service worker loading...");

// Import Firebase compat SDK from CDN
try {
  importScripts(
    "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js"
  );
  console.log("[firebase-messaging-sw] Firebase scripts imported successfully");
} catch (err) {
  console.error(
    "[firebase-messaging-sw] Failed to import Firebase scripts:",
    err
  );
}

// Firebase config - matches NEXT_PUBLIC_FIREBASE_* environment values
const firebaseConfig = {
  apiKey: "AIzaSyBbBclV8xBKL5mSc2m00YsxmxCuZJlzc80",
  authDomain: "access-ability-3d352.firebaseapp.com",
  projectId: "access-ability-3d352",
  storageBucket: "access-ability-3d352.firebasestorage.app",
  messagingSenderId: "383661001095",
  appId: "1:383661001095:web:f7223691bbe32c06042b22",
};

try {
  firebase.initializeApp(firebaseConfig);
  console.log("[firebase-messaging-sw] Firebase app initialized");
} catch (initErr) {
  console.log(
    "[firebase-messaging-sw] Firebase app already initialized or error:",
    initErr?.message
  );
}

const messaging = firebase.messaging();
console.log("[firebase-messaging-sw] Messaging instance created");

// Service worker lifecycle handlers
self.addEventListener("install", (event) => {
  console.log("[firebase-messaging-sw] Service worker installing");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[firebase-messaging-sw] Service worker activating");
  event.waitUntil(clients.claim());
});

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw] background message received:", payload);

  const notificationTitle =
    payload?.notification?.title ||
    payload?.data?.title ||
    payload?.data?.notification_title ||
    "Notifikasi Baru";
  const notificationUrl =
    payload?.fcmOptions?.link || payload?.data?.url || payload?.data?.link || "/";
  const notificationOptions = {
    body:
      payload?.notification?.body ||
      payload?.data?.body ||
      payload?.data?.message ||
      payload?.data?.notification_body ||
      "",
    icon: payload?.notification?.icon || "/favicon.ico",
    badge: payload?.notification?.badge || "/favicon.ico",
    tag: payload?.notification?.tag || payload?.data?.tag || "firebase-notification",
    data: { ...(payload?.data || {}), url: notificationUrl },
  };

  console.log(
    "[firebase-messaging-sw] showing notification:",
    notificationTitle
  );
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client && client.url.includes(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

console.log("[firebase-messaging-sw] Service worker loaded and ready");
