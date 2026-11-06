const CACHE_NAME = "dairyflow-cache-v2";
const STATIC_ASSETS = [
  "/",
  "/login",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/official-logo.png",
];

// 1. Install Event: Cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up old caches & take control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith("dairyflow-cache-") && key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-first for navigations, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Let the browser and Next.js manage application code and API requests.
  const url = new URL(request.url);

  // Ignore non-GET requests, framework chunks, and backend requests.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/") ||
    request.url.includes("/_next/webpack-hmr") ||
    request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  // HTML page navigations -> Network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("/");
          return fallback || new Response("Offline. Please check your connection.", { status: 503 });
        })
    );
    return;
  }

  // Cache images and fonts only. Never serve stale JavaScript or styles.
  if (
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(async () => {
      return caches.match(request);
    })
  );
});
