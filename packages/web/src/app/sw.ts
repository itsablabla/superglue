/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const CACHE_PREFIX = "garza-glue";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 10,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    // Never cache API calls
    {
      urlPattern: /\/(api|v1|graphql)\/.*/i,
      handler: new NetworkFirst({
        cacheName: `${CACHE_PREFIX}-api`,
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 5, // 5 minutes
          }),
        ],
      }),
    },
    // Cache-first for Next.js static chunks (hashed filenames = safe to cache)
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: new CacheFirst({
        cacheName: `${CACHE_PREFIX}-next-static`,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          }),
        ],
      }),
    },
    // Cache-first for images, fonts, icons
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp|woff2?)$/i,
      handler: new CacheFirst({
        cacheName: `${CACHE_PREFIX}-assets`,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          }),
        ],
      }),
    },
    // Stale-while-revalidate for CSS/JS not in _next/static
    {
      urlPattern: /\.(?:css|js)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: `${CACHE_PREFIX}-styles-scripts`,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          }),
        ],
      }),
    },
    // Network-first for page navigations
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: `${CACHE_PREFIX}-pages`,
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          }),
        ],
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline.html",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Push notification support (iOS 16.4+, non-EU)
self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  let data: { title?: string; body?: string; tag?: string; url?: string };
  try {
    data = event.data.json();
  } catch {
    data = { title: "Garza Glue", body: event.data.text() };
  }

  const options: NotificationOptions = {
    body: data.body || "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/favicon.png",
    tag: data.tag || "garza-glue-notification",
    data: { url: data.url || "/" },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(data.title || "Garza Glue", options));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const targetUrl = (event.notification.data as { url?: string })?.url || "/";

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

// Background sync for offline chat messages
self.addEventListener("sync", (event: ExtendableEvent & { tag?: string }) => {
  if (event.tag === "sync-chat-messages") {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages(): Promise<void> {
  // Future: read from IndexedDB queue and POST to /v1/conversations
  console.log("[SW] Background sync triggered for chat messages");
}

serwist.addEventListeners();
