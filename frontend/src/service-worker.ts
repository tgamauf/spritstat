declare const self: ServiceWorkerGlobalScope;

// Incrementing OFFLINE_VERSION will kick off the install event and force
//  previously cached resources to be updated from the network.
// This variable is intentionally declared and unused.
const OFFLINE_VERSION = 1;
const CACHE_NAME = "offline";
const OFFLINE_URL = "offline.html";

self.addEventListener("install", (event) => {
  console.debug("Install service worker");

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.add(new Request(OFFLINE_URL, {cache: "reload"}));

      console.debug("Service worker installed");
    })()
  );
  void self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.debug("Activate service worker");

  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported.
      // See https://developers.google.com/web/updates/2017/02/navigation-preload
      if ("navigationPreload" in self.registration) {
        // @ts-ignore this is only called if the browser supports it
        await self.registration.navigationPreload.enable();

        console.debug("Service worker enabled navigationPreload");
      }
    })()
  );

  void self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // @ts-ignore
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            console.debug("Returning preloaded response for fetch request");

            return preloadResponse;
          }

          const networkResponse = await fetch(event.request);

          console.debug("Returning network response for fetch request");

          return networkResponse;
        } catch (error) {
          // catch is only triggered if an exception is thrown, which is likely
          // due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
          console.debug(`Fetch failed; returning offline page instead: ${error}`);

          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  } else {
    console.debug("Fetch request not handled by service worker");
  }
});

export default null;
