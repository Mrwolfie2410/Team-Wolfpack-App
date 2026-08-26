const CACHE_NAME = "team-wolfpack-v8";

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
  "./chat.html",
  "./chat-rules.html",
  "./admin-reports.html",
  "./admin-members.html",
  "./icon-192.png",
  "./icon-512.png"
];


/* ========================================
   INSTALL
======================================== */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME).then(async cache => {

      console.log(
        "Team Wolfpack: creating cache",
        CACHE_NAME
      );

      for (const file of APP_FILES) {

        try {

          const response = await fetch(
            file,
            {
              cache: "reload"
            }
          );

          if (response.ok) {

            await cache.put(
              file,
              response
            );

            console.log(
              "Cached:",
              file
            );

          }

        } catch (error) {

          console.warn(
            "Could not cache:",
            file,
            error
          );

        }

      }

    })

  );

  self.skipWaiting();

});


/* ========================================
   ACTIVATE
======================================== */

self.addEventListener("activate", event => {

  event.waitUntil(

    (async () => {

      const cacheNames =
        await caches.keys();

      await Promise.all(

        cacheNames.map(cacheName => {

          if (
            cacheName.startsWith("team-wolfpack-") &&
            cacheName !== CACHE_NAME
          ) {

            console.log(
              "Deleting old Team Wolfpack cache:",
              cacheName
            );

            return caches.delete(
              cacheName
            );

          }

        })

      );

      await self.clients.claim();

      console.log(
        "Team Wolfpack service worker activated:",
        CACHE_NAME
      );

    })()

  );

});


/* ========================================
   FETCH
======================================== */

self.addEventListener("fetch", event => {

  if (
    event.request.method !== "GET"
  ) {
    return;
  }


  const requestURL =
    new URL(event.request.url);


  /* ======================================
     IGNORE FIREBASE / GOOGLE REQUESTS
     Let browser handle them normally
  ====================================== */

  if (
    requestURL.origin !==
    self.location.origin
  ) {

    return;

  }


  /* ======================================
     MANIFEST
     ALWAYS GET NEWEST VERSION
  ====================================== */

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


  /* ======================================
     HTML PAGES

     ALWAYS TRY NETWORK FIRST.

     cache:"no-store" prevents the browser's
     normal HTTP cache from returning an
     older copy before the service worker
     sees it.
  ====================================== */

  if (
    event.request.mode === "navigate" ||
    requestURL.pathname.endsWith(".html")
  ) {

    event.respondWith(

      (async () => {

        try {

          const response =
            await fetch(
              event.request,
              {
                cache: "no-store"
              }
            );


          if (
            response &&
            response.ok
          ) {

            const copy =
              response.clone();


            const cache =
              await caches.open(
                CACHE_NAME
              );


            await cache.put(
              event.request,
              copy
            );

          }


          return response;


        } catch (error) {

          console.warn(
            "Network unavailable. Trying cached page.",
            error
          );


          const cached =
            await caches.match(
              event.request
            );


          if (cached) {

            return cached;

          }


          const home =
            await caches.match(
              "./index.html"
            );


          if (home) {

            return home;

          }


          return new Response(
            "Team Wolfpack is currently offline.",
            {
              status: 503,
              headers: {
                "Content-Type":
                  "text/plain"
              }
            }
          );

        }

      })()

    );

    return;

  }


  /* ======================================
     SERVICE WORKER FILE ITSELF

     NEVER CACHE IT
  ====================================== */

  if (
    requestURL.pathname.endsWith(
      "/service-worker.js"
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


  /* ======================================
     STATIC FILES
     NETWORK FIRST
  ====================================== */

  event.respondWith(

    (async () => {

      try {

        const response =
          await fetch(
            event.request,
            {
              cache: "no-cache"
            }
          );


        if (
          response &&
          response.ok
        ) {

          const copy =
            response.clone();


          const cache =
            await caches.open(
              CACHE_NAME
            );


          await cache.put(
            event.request,
            copy
          );

        }


        return response;


      } catch (error) {


        const cached =
          await caches.match(
            event.request
          );


        if (cached) {

          return cached;

        }


        throw error;

      }

    })()

  );

});
