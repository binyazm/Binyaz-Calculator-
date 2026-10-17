const CACHE_NAME = "binyaz-calculator-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Activate and remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key.startsWith("binyaz-calculator-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

// Serve cached files when offline
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const url = new URL(event.request.url);

          if (url.origin === self.location.origin) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, copy);
            });
          }
        }

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
