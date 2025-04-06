const CACHE_NAME = 'mealcal-cache-v1';
const urlsToCache = [
  '/Mealcal/',
  '/Mealcal/index.html',
  '/Mealcal/styles.css', // Replace with your CSS
  '/Mealcal/app.js', // Replace with your JS
  '/Mealcal/bowl-app.png', // Any icons/images used
  '/Mealcal/bowl-app2.png',
    '/Mealcal/ss7.png',
    '/Mealcal/ss8.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/Mealcal/index.html');
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
