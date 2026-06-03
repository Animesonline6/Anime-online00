importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCvgLmL_ax9Rb9Zzg_HCdBEOqJ4Qb1nNiA",
  authDomain: "animes-online-420d9.firebaseapp.com",
  projectId: "animes-online-420d9",
  storageBucket: "animes-online-420d9.firebasestorage.app",
  messagingSenderId: "959561664951",
  appId: "1:959561664951:web:442424161d849a18b5c032",
  measurementId: "G-YTYZ6PN7Z4"
});

const messaging = firebase.messaging();

// Notificação em background (quando app está fechado)
messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || '🎌 Anime Online';
  const body  = payload.notification?.body  || 'Novo episódio disponível!';
  const icon  = payload.notification?.icon  || '/icons/icon-192x192.png';

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: { url: payload.data?.url || '/' }
  });
});

// Clicar na notificação abre o app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
