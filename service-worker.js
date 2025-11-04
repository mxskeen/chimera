/**
 * Service Worker for Advanced Multi-Model AI
 * Provides offline support and caching capabilities
 */

const CACHE_NAME = 'advanced-ai-v2.0';
const OFFLINE_URL = '/offline.html';

// Assets to cache for offline functionality
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/collaborative-worker.js',
    OFFLINE_URL,
    // External fonts and icons
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /openrouter\.ai\/api\/v1\/models/,
    /openrouter\.ai\/api\/v1\/chat\/completions/
];

/**
 * Install event - cache core assets
 */
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Service Worker: Caching core assets');
                return cache.addAll(ASSETS_TO_CACHE.filter(url =>
                    url.startsWith('/') || url.startsWith(window.location.origin)
                ));
            })
            .then(() => {
                console.log('✅ Service Worker: Installed successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker: Installation failed', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: Activating...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - handle network requests with caching strategy
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests with different strategy
    if (isAPIRequest(url)) {
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Handle app shell with cache-first strategy
    if (isAppShellRequest(url)) {
        event.respondWith(handleAppShellRequest(request));
        return;
    }

    // Handle navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }

    // Handle other requests with network-first strategy
    event.respondWith(handleOtherRequests(request));
});

/**
 * Check if request is for API
 */
function isAPIRequest(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href)) ||
           url.hostname.includes('openrouter.ai') ||
           url.hostname.includes('znapai.com');
}

/**
 * Check if request is for app shell
 */
function isAppShellRequest(url) {
    return url.pathname === '/' ||
           url.pathname.endsWith('.html') ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.woff2') ||
           url.pathname.endsWith('.woff') ||
           url.pathname.endsWith('.ttf');
}

/**
 * Handle API requests with network-first strategy
 */
async function handleAPIRequest(request) {
    const url = new URL(request.url);

    try {
        // Try network first for fresh data
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache successful API responses (excluding chat completions to avoid caching sensitive data)
            if (!url.pathname.includes('/chat/completions')) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        }

        throw new Error('Network response not ok');
    } catch (error) {
        console.log('🌐 Service Worker: Network failed, trying cache for API:', url.pathname);

        // Fall back to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline response for API requests
        return new Response(JSON.stringify({
            error: 'Offline - This feature requires an internet connection',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle app shell requests with cache-first strategy
 */
async function handleAppShellRequest(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Try network and cache if successful
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());

        return networkResponse;
    } catch (error) {
        console.log('🌐 Service Worker: Failed to fetch app shell:', request.url);

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL) ||
                   new Response('Offline - Please check your connection', {
                       status: 503,
                       headers: { 'Content-Type': 'text/html' }
                   });
        }

        throw error;
    }
}

/**
 * Handle navigation requests
 */
async function handleNavigationRequest(request) {
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        console.log('🌐 Service Worker: Navigation failed, showing offline page');

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        return caches.match(OFFLINE_URL) ||
               new Response('Offline - Please check your connection', {
                   status: 503,
                   headers: { 'Content-Type': 'text/html' }
               });
    }
}

/**
 * Handle other requests with network-first strategy
 */
async function handleOtherRequests(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache successful responses for static assets
        if (networkResponse.ok && request.url.includes('/assets/')) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        throw error;
    }
}

/**
 * Handle background sync for offline data
 */
self.addEventListener('sync', event => {
    console.log('🔄 Service Worker: Background sync triggered:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(syncOfflineData());
    }
});

/**
 * Sync offline data when connection is restored
 */
async function syncOfflineData() {
    try {
        // Get offline data from IndexedDB or cache
        const offlineData = await getOfflineData();

        for (const item of offlineData) {
            try {
                const response = await fetch(item.url, {
                    method: item.method,
                    headers: item.headers,
                    body: item.body
                });

                if (response.ok) {
                    // Remove successfully synced item
                    await removeOfflineData(item.id);
                    console.log('✅ Service Worker: Synced offline item:', item.id);
                }
            } catch (error) {
                console.warn('⚠️ Service Worker: Failed to sync item:', item.id, error);
            }
        }
    } catch (error) {
        console.error('❌ Service Worker: Background sync failed:', error);
    }
}

/**
 * Get offline data (simplified implementation)
 */
async function getOfflineData() {
    // This would typically use IndexedDB for more robust storage
    const cache = await caches.open(CACHE_NAME);
    const offlineCache = await cache.match('/offline-data');
    return offlineCache ? await offlineCache.json() : [];
}

/**
 * Remove synced offline data
 */
async function removeOfflineData(id) {
    // Implementation would remove item from IndexedDB
    console.log('🗑️ Service Worker: Removed offline data:', id);
}

/**
 * Handle push notifications (for future enhancement)
 */
self.addEventListener('push', event => {
    console.log('📱 Service Worker: Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'New message received',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open App',
                icon: '/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Advanced Multi-Model AI', options)
    );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', event => {
    console.log('🔔 Service Worker: Notification clicked');

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Periodic background sync (experimental)
 */
self.addEventListener('periodicsync', event => {
    console.log('⏰ Service Worker: Periodic sync triggered:', event.tag);

    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

/**
 * Sync content periodically
 */
async function syncContent() {
    try {
        // Refresh cached content
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();

        for (const request of requests) {
            try {
                await fetch(request);
            } catch (error) {
                console.warn('⚠️ Service Worker: Failed to refresh cache:', request.url);
            }
        }

        console.log('✅ Service Worker: Content sync completed');
    } catch (error) {
        console.error('❌ Service Worker: Content sync failed:', error);
    }
}

// Handle messages from the main thread
self.addEventListener('message', event => {
    console.log('💬 Service Worker: Message received:', event.data);

    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
            case 'CLEAR_CACHE':
                event.waitUntil(
                    caches.delete(CACHE_NAME).then(() => {
                        event.ports[0].postMessage({ success: true });
                    })
                );
                break;
            case 'OFFLINE_DATA':
                // Handle offline data storage
                event.waitUntil(storeOfflineData(event.data.payload));
                break;
        }
    }
});

/**
 * Store offline data for later sync
 */
async function storeOfflineData(data) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
        await cache.put('/offline-data', response);
        console.log('💾 Service Worker: Stored offline data');
    } catch (error) {
        console.error('❌ Service Worker: Failed to store offline data:', error);
    }
}

console.log('🎯 Service Worker: Script loaded successfully');