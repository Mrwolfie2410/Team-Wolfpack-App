const CACHE_NAME = "team-wolfpack-v6";

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

      console.log("Team Wolfpack: creating cache", CACHE_NAME);

      for (const file of APP_FILES) {

        try {

          await cache.add(file);

          console.log("Cached:", file);

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

          if (cacheName !== CACHE_NAME) {

            console.log(
              "Deleting old cache:",
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


  /* MANIFEST — ALWAYS NETWORK */

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


  /* HTML NAVIGATION — NETWORK FIRST */

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

              });

          }

          return response;

        })

        .catch(async () => {

          const cached =
            await caches.match(
              event.request
            );

          if (cached) {
            return cached;
          }

          return caches.match(
            "./index.html"
          );

        })

    );

    return;

  }


  /* STATIC FILES — NETWORK FIRST */

  event.respondWith(

    fetch(event.request)

      .then(response => {

        if (
          response &&
          response.ok &&
          requestURL.origin ===
            self.location.origin
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

});
