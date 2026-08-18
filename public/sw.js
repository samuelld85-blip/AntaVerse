try {
  importScripts("/precache-manifest.js");
} catch {
  // Le manifeste est produit après l’export statique. Le repli garde le service worker robuste.
}

const CACHE = self.__ANTAVERSE_CACHE_VERSION ?? "antaverse-v1";
const OFFLINE_URL = "/offline.html";
const APP_SHELL = self.__ANTAVERSE_PRECACHE ?? [
  "/",
  "/installer/",
  "/quoi-de-9/",
  "/la-relance/",
  "/sans-le-dire/",
  OFFLINE_URL,
  "/icons/app-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin)
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const exact = await caches.match(event.request, { ignoreSearch: true });
          if (exact) return exact;
          const url = new URL(event.request.url);
          const normalizedPath = url.pathname.endsWith("/")
            ? url.pathname
            : `${url.pathname}/`;
          return (await caches.match(normalizedPath)) ?? caches.match(OFFLINE_URL);
        }),
    );
    return;
  }
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(
      (cached) =>
        cached ??
        fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        }),
    ),
  );
});
