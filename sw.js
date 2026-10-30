
const CACHE = "meu-sorteador-v1";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icones/icone-192.png",
  "./icones/icone-512.png"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ARQUIVOS);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    Promise.all([
      caches.keys().then((nomes) =>
        Promise.all(
          nomes
            .filter((nome) => nome !== CACHE)
            .map((nome) => caches.delete(nome))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") {
    return;
  }

  if (new URL(evento.request.url).origin !==
      self.location.origin) {
    return;
  }

  evento.respondWith(
    caches.match(evento.request).then(
      (arquivo) => arquivo || fetch(evento.request)
    )
  );
});
