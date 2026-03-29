/**
 * Wasel | واصل — Service Worker
 * Versioned cache strategy with safe auth-token persistence.
 *
 * Cache naming convention: wasel-<type>-v<MAJOR>.<MINOR>.<PATCH>
 * Bump CACHE_VERSION on every deploy to bust stale caches without
 * breaking auth tokens stored in IndexedDB / localStorage.
 */

const CACHE_VERSION   = 'v2.1.0';
const STATIC_CACHE    = `wasel-static-${CACHE_VERSION}`;
const RUNTIME_CACHE   = `wasel-runtime-${CACHE_VERSION}`;
const API_CACHE_NAME  = `wasel-api-${CACHE_VERSION}`;

// Managed caches — any other wasel-* cache is from a previous version and
// will be purged during the activate phase.
const MANAGED_CACHES  = [STATIC_CACHE, RUNTIME_CACHE, API_CACHE_NAME];

// API cache TTL (ms)
const API_CACHE_TTL   = 5 * 60 * 1_000; // 5 minutes

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log('[Wasel SW] Installing', CACHE_VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => {
        console.log('[Wasel SW] Pre-cache complete');
        // Skip waiting so the new SW activates immediately on next navigation.
        return self.skipWaiting();
      })
      .catch((err) => console.error('[Wasel SW] Pre-cache failed:', err)),
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  console.log('[Wasel SW] Activating', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('wasel-') && !MANAGED_CACHES.includes(name))
            .map((stale) => {
              console.log('[Wasel SW] Purging stale cache:', stale);
              return caches.delete(stale);
            }),
        ),
      )
      .then(() => {
        console.log('[Wasel SW] Stale cache purge complete');
        // Take control of all open clients immediately.
        return self.clients.claim();
      }),
  );
});

// ─── Fetch strategy ───────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // ── Supabase / API calls — Network-first with short TTL cache ──────────────
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/make-server-')
  ) {
    event.respondWith(networkFirstWithTTL(request, API_CACHE_NAME, API_CACHE_TTL));
    return;
  }

  // ── Auth endpoints — always Network-only (never cache) ────────────────────
  if (url.pathname.includes('/auth/') || url.pathname.includes('/token')) {
    event.respondWith(fetch(request));
    return;
  }

  // ── Static app shell — Cache-first ────────────────────────────────────────
  if (
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── Everything else — Stale-while-revalidate ──────────────────────────────
  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});

// ─── Strategy helpers ─────────────────────────────────────────────────────────

/** Cache-first: serve from cache, fall back to network, cache the result. */
async function cacheFirst(request, cacheName) {
  const cache    = await caches.open(cacheName);
  const cached   = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const offline = await caches.match('/offline.html');
    return offline || new Response('Offline', { status: 503 });
  }
}

/** Network-first with TTL: always try network; serve cache only if network fails or stale. */
async function networkFirstWithTTL(request, cacheName, ttl) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('sw-cached-at', Date.now().toString());
      const clone = new Response(await response.clone().blob(), { status: response.status, headers });
      cache.put(request, clone);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      const cachedAt = Number(cached.headers.get('sw-cached-at') ?? 0);
      if (Date.now() - cachedAt < ttl) return cached;
    }
    return new Response(JSON.stringify({ error: 'Network unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/** Stale-while-revalidate: serve cache immediately, refresh in background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || (await networkFetch) || new Response('Offline', { status: 503 });
}

// ─── Push notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'واصل | Wasel', body: event.data.text() };
  }

  const options = {
    body:    payload.body  ?? '',
    icon:    '/icon-192.png',
    badge:   '/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data:    { url: payload.url ?? '/' },
    actions: [
      { action: 'open',    title: 'Open'    },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'واصل | Wasel', options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const match = windowClients.find((c) => c.url === targetUrl && 'focus' in c);
        return match ? match.focus() : clients.openWindow(targetUrl);
      }),
  );
});

// ─── Background sync ─────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-bookings') {
    event.waitUntil(syncPendingBookings());
  }
});

async function syncPendingBookings() {
  console.log('[Wasel SW] Syncing pending bookings...');
  // Actual sync logic handled by the frontend via postMessage after re-connect.
}
