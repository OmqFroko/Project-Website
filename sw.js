// Runs in the background, separate from any open tab — this is what lets a
// notification appear even when the browser is fully closed on this device.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "Timer", body: "One of your timers has finished." };
  try {
    if (event.data) payload = event.data.json();
  } catch {
    /* fall back to the default payload above */
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Timer", {
      body: payload.body || "",
      tag: payload.tag,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("./timers.html"));
});