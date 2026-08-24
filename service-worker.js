const CACHE_NAME = "team-wolfpack-v7";

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

    caches.open(CACHE_NAME).then(async cache => {

      console.log(
        "Team Wolfpack: creating cache",
        CACHE_NAME
      );

      for (const file of APP_FILES) {

        try {

          await cache.add(file);

          console.log(
            "Cached:",
            file
          );

        } catch (error) {

          console.error(
            "Failed to cache:",
            file,
            error
          );

        }

      }

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

          if (
            cacheName !== CACHE_NAME &&
            cacheName.startsWith("team-wolfpack-")
          ) {

            console.log(
              "Deleting old Team Wolfpack cache:",
              cacheName
            );

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

  const requestURL =
    new URL(event.request.url);


  /*
    MANIFEST
    Always fetch the latest manifest.
    Never serve a stale cached manifest.
  */

  if (
    requestURL.pathname.endsWith(
      "/manifest.json"
    )
  ) {

    event.respondWith(

      fetch(
        event.request,
        {
          cache: "no-store"
        }
      )

    );

    return;

  }


  /*
    HTML NAVIGATION
    Network first.
    Update the cache whenever the newest
    HTML page is successfully downloaded.
  */

  if (
    event.request.mode === "navigate"
  ) {

    event.respondWith(

      fetch(event.request)

        .then(response => {

          if (
            response &&
            response.ok
          ) {

            const copy =
              response.clone();

            caches
              .open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  event.request,
                  copy
                );

              })
              .catch(error => {

                console.error(
                  "Navigation cache update failed:",
                  error
                );

              });

          }

          return response;

        })

        .catch(async () => {

          const cachedResponse =
            await caches.match(
              event.request
            );

          if (cachedResponse) {
            return cachedResponse;
          }

          return caches.match(
            "./index.html"
          );

        })

    );

    return;

  }


  /*
    SAME-ORIGIN STATIC FILES
    Network first with cached fallback.
  */

  if (
    requestURL.origin ===
    self.location.origin
  ) {

    event.respondWith(

      fetch(event.request)

        .then(response => {

          if (
            response &&
            response.ok
          ) {

            const copy =
              response.clone();

            caches
              .open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  event.request,
                  copy
                );

              })
              .catch(error => {

                console.error(
                  "Static cache update failed:",
                  error
                );

              });

          }

          return response;

        })

        .catch(() => {

          return caches.match(
            event.request
          );

        })

    );

  }

});
