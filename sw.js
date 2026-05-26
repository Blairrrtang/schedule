const CACHE_NAME = "schedule-app-v11";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./shared.js",
  "./app.js",
  "./calendar/calendar.js",
  "./todolist/dailyTodo.js",
  "./todolist/longPlan.js",
  "./notes/uncomfortableNotes.js",
  "./notes/quickThings.js",
  "./plan/readingPlan.js",
  "./plan/exercisePlan.js",
  "./travel/travelPlanner.js",
  "./manifest.webmanifest",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
