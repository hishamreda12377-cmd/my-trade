self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('store-v1').then((cache) => {
            return cache.addAll(['index.html', 'styles.css', 'js.js']);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});