const SERVICE_WORKER_PATH = "/service-worker.js";

function setupServiceWorker() {
  window.addEventListener("load", async () => {
    if ("serviceWorker" in navigator) {
      console.debug("Register service worker");

      await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
    }
  });
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function activatePushMessages() {
  //TODO do this only if this is a mobile os - Android for now and later also iOS/iPadOs
  //TODO this needs to be initiated by a request to the user - so something like
  //  "do you want to get notifications?", soft opt-in, ...
  navigator.serviceWorker.ready
    .then((registration) => {
      // Use the PushManager to get the user's subscription to the push service.
      return registration.pushManager.getSubscription()
        .then(async (subscription) => {
          // If a subscription was found, return it.
          if (subscription) {
            return subscription;
          }

          // Get the server's public key
          const response = await fetch("./vapidPublicKey");
          const vapidPublicKey = await response.text();
          // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
          // urlBase64ToUint8Array() is defined in /tools.js
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

          // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
          // send notifications that don't have a visible effect for the user).
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
        });
    }).then((subscription) => {
    // Send the subscription details to the server using the Fetch API.
    fetch("./register", {
      method: "post",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        subscription: subscription
      }),
    });

    // TODO this is just for testing purposes - remove
    document.getElementById("doIt").onclick = function () {
      const payload = document.getElementById("notification-payload").value;
      const delay = document.getElementById("notification-delay").value;
      const ttl = document.getElementById("notification-ttl").value;

      // Ask the server to send the client a notification (for testing purposes, in actual
      // applications the push notification is likely going to be generated by some event
      // in the server).
      fetch("./sendNotification", {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          subscription: subscription,
          payload: payload,
          delay: delay,
          ttl: ttl,
        }),
      });
    };
  });
}

export {setupServiceWorker, activatePushMessages};
