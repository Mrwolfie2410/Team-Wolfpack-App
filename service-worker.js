const CACHE_NAME = "team-wolfpack-v5";

const APP_FILES = [
  "./",
  "./index.html",
  "./fighters.html",
  "./mrs-wolfie.html",
  "./greig-sloan.html",
  "./fights.html",
  "./more.html",
  "./about.html",
  "./pack.html",
  "./sponsors.html",
  "./contact.html",
  "./socials.html",
  "./merch.html",
  "./icon-192.png",
  "./icon-512.png"
];


/* INSTALL */

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_FILES);
      })
  );

  self.skipWaiting();

});


/* ACTIVATE */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(cacheNames => {

      return Promise.all(

        cacheNames.map(cacheName => {

          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }

        })

      );

    })

  );

  self.clients.claim();

});


/* FETCH */

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  const requestURL = new URL(event.request.url);


  /*
    MANIFEST
    Always request the latest manifest from the network.
    Do not store manifest.json in the app cache.
  */

  if (requestURL.pathname.endsWith("/manifest.json")) {

    event.respondWith(
      fetch(event.request, {
        cache: "no-store"
      })
    );

    return;

  }


  /*
    HTML / NAVIGATION
    Network first so app updates appear immediately.
  */

  if (event.request.mode === "navigate") {

    event.respondWith(

      fetch(event.request)
        .then(response => {

          if (response && response.ok) {

            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, copy);
              });

          }

          return response;

        })
        .catch(() => {

          return caches.match(event.request)
            .then(cachedResponse => {

              if (cachedResponse) {
                return cachedResponse;
              }

              return caches.match("./index.html");

            });

        })

    );

    return;

  }


  /*
    OTHER APP FILES
    Network first with cached fallback.
  */

  event.respondWith(

    fetch(event.request)
      .then(response => {

        if (
          response &&
          response.ok &&
          requestURL.origin === self.location.origin
        ) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, copy);
            });

        }

        return response;

      })
      .catch(() => {

        return caches.match(event.request);

      })

  );

});
