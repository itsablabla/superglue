// Garza Glue PWA Service Worker
// Cache version is derived from the build ID injected by Next.js at build time.
// When a new build deploys, the SW file changes → browser detects update → old caches purged.
const BUILD_ID = "{{BUILD_ID}}";
const STATIC_CACHE = "gg-static-" + BUILD_ID;
const RUNTIME_CACHE = "gg-runtime-" + BUILD_ID;

const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/logo.svg",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Pass through API calls, SW itself, and _next/data — never cache
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/v1/") ||
    url.pathname.startsWith("/graphql") ||
    url.pathname === "/sw.js" ||
    url.pathname.startsWith("/_next/data/")
  ) {
    return;
  }

  // Cache-first for immutable Next.js build assets (hashed filenames, safe to cache forever)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      }),
    );
    return;
  }

  // Network-first for navigation (pages) — always try fresh HTML, fall back to cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match("/offline.html");
          });
        }),
    );
    return;
  }

  // Stale-while-revalidate for other static assets (icons, fonts, images)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?|css)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => cached || new Response("Offline", { status: 503 }));
        return cached || fetchPromise;
      }),
    );
    return;
  }
});

// Push notification support (iOS 16.4+, non-EU)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Garza Glue", body: event.data.text() };
  }

  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/favicon.png",
    tag: data.tag || "garza-glue-notification",
    data: { url: data.url || "/" },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(data.title || "Garza Glue", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});

// Background sync for offline chat messages (when available)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-chat-messages") {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages() {
  // Future: read from IndexedDB queue and POST to /v1/conversations
  console.log("[SW] Background sync triggered for chat messages");
}
