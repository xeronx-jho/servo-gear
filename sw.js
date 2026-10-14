// 오프라인 사용을 위한 캐시. 파일을 바꾸면 VERSION 을 올리세요.
const VERSION = "v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "apple-touch-icon.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // 페이지는 네트워크 우선(최신 반영), 실패하면 캐시. 그 외는 캐시 우선.
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put("index.html", c)); return r; }).catch(() => caches.match("index.html")));
  } else {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { if (r.ok && new URL(e.request.url).origin === location.origin) { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); } return r; })));
  }
});
