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

// Les ressources de `/_next/static/` portent une empreinte de contenu : une URL donnée ne
// change jamais de contenu, elles peuvent donc être servies depuis le cache sans revalidation.
function isFingerprinted(url) {
  return url.pathname.startsWith("/_next/static/");
}

// À l'inverse, ces URL sont stables d'un déploiement à l'autre alors que leur contenu change :
// documents HTML, charges utiles RSC de l'export statique (`index.txt`) et manifeste. Les servir
// depuis le cache sans revalidation ferait pointer une page à jour vers des chunks supprimés.
function isVersionDefining(request, url) {
  return (
    request.mode === "navigate" ||
    request.destination === "document" ||
    url.pathname.endsWith(".txt") ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".webmanifest")
  );
}

// `cache.addAll` est atomique : une seule ressource manquante ferait échouer l'installation et
// laisserait indéfiniment la génération précédente active. On précache donc entrée par entrée.
async function precache() {
  const cache = await caches.open(CACHE);
  await Promise.all(
    APP_SHELL.map(async (url) => {
      try {
        const response = await fetch(new Request(url, { cache: "reload" }));
        if (response.ok) await cache.put(url, response);
      } catch {
        // Une ressource indisponible ne doit pas bloquer la mise à jour.
      }
    }),
  );
}

async function notifyStaleDocument() {
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) client.postMessage({ type: "antaverse:stale-asset" });
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const exact = await cache.match(request, { ignoreSearch: true });
    if (exact) return exact;
    const url = new URL(request.url);
    if (request.mode !== "navigate") return Response.error();
    const normalizedPath = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    return (await cache.match(normalizedPath)) ?? (await cache.match(OFFLINE_URL));
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  else if (response.status === 404) void notifyStaleDocument();
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    void network;
    return cached;
  }
  return (await network) ?? Response.error();
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
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

self.addEventListener("message", (event) => {
  if (event.data?.type !== "antaverse:reset") return;
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
});

// Toute lecture est volontairement limitée au cache de la génération courante : un
// `caches.match` global pourrait servir une ressource issue d'un déploiement précédent.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isVersionDefining(request, url)) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (isFingerprinted(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});
