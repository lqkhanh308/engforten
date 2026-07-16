// ===========================================================================
// sw.js — Service Worker: cache toàn bộ app để chạy OFFLINE sau lần đầu.
//   - App shell (HTML/CSS/JS/icon/manifest): cache-first, precache.
//   - Ảnh trong assets/images/*: runtime cache (lần đầu xem -> cache lại).
//
// Khi sửa code: TĂNG CACHE_VERSION để người dùng nhận bản mới.
// ===========================================================================

const CACHE_VERSION = "v56";
const APP_CACHE = `engweb-app-${CACHE_VERSION}`;
const IMG_CACHE = `engweb-img-${CACHE_VERSION}`;

// Đường dẫn tương đối so với vị trí sw.js (thư mục gốc).
const APP_SHELL = [
  "./",
  "./index.html",
  "./admin.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/data.js",
  "./js/speak.js",
  "./js/ui.js",
  "./js/app.js",
  "./js/admin.js",
  "./js/games/common.js",
  "./js/games/tap-picture.js",
  "./js/games/memory.js",
  "./js/games/memory-board.js",
  "./js/games/memory-classic.js",
  "./js/games/adventure.js",
  "./js/games/match.js",
  "./js/games/quiz.js",
  "./js/games/bubble.js",
  "./js/games/shadow.js",
  "./js/games/count.js",
  "./js/games/color.js",
  "./games/adventure.html",
  "./games/tap-picture.html",
  "./games/memory.html",
  "./games/match.html",
  "./games/quiz.html",
  "./games/bubble.html",
  "./games/shadow.html",
  "./games/count.html",
  "./games/color.html",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) =>
      // addAll thất bại nếu 1 file lỗi -> dùng từng cái cho an toàn.
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== APP_CACHE && k !== IMG_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // bỏ qua cross-origin

  // Ảnh từ vựng: cache-first trong IMG_CACHE, tự cache khi xem lần đầu.
  if (url.pathname.includes("/assets/images/")) {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        } catch (_) {
          // Thiếu ảnh khi offline -> trả lỗi êm, UI tự hiện emoji.
          return Response.error();
        }
      })
    );
    return;
  }

  // App shell: cache-first, nếu mạng có thì cập nhật ngầm.
  event.respondWith(
    caches.match(req).then((hit) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(APP_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => null);

      if (hit) return hit;
      return fetchPromise.then((res) => {
        if (res) return res;
        // Điều hướng khi offline mà chưa cache -> trả trang chủ.
        if (req.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    })
  );
});
