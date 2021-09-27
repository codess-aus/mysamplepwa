
// This is the "Offline copy of assets" service worker

const CACHE = "pwabuilder-offline";
const QUEUE_NAME = "bgSyncQueue";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin(QUEUE_NAME, {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
    plugins: [
      bgSyncPlugin
    ]
  })
);

// Respond to a server push with a user notification.
self.addEventListener('push', function (event) {
  if (Notification.permission === "granted") {
      const notificationText = event.data.text();
      const showNotification = self.registration.showNotification('Sample PWA', {
          body: notificationText,
          icon: 'images/icon512.png'
      });
      // Make sure the toast notification is displayed, before exiting the function.
      event.waitUntil(showNotification);
  }
});

// Respond to the user selecting the toast notification.
self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  // This attempts to display the current notification if it is already open and then focuses on it.
  event.waitUntil(clients.matchAll({
      type: 'window'
  }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url == 'http://localhost:1337/' && 'focus' in client)
              return client.focus();
      }
      if (clients.openWindow)
          return clients.openWindow('/');
  }));
});