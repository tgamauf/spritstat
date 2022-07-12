declare const self: ServiceWorkerGlobalScope;

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

// TODO
self.addEventListener("push", (event) => {
  // Retrieve the textual payload from event.data (a PushMessageData object).
  // Other formats are supported (ArrayBuffer, Blob, JSON), check out the documentation
  // on https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData.
  const payload = event.data ? event.data.text() : "no payload";

  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    // Show a notification with title 'ServiceWorker Cookbook' and use the payload
    // as the body.
    self.registration.showNotification("ServiceWorker Cookbook", {
      body: payload,
    })
  );
});

export default null;
