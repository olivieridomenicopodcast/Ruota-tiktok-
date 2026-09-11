const CACHE='studio-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin) return; // lascia passare sempre le chiamate cross-origin (api.github.com)
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetchPromise=fetch(e.request).then(res=>{
        if(res && res.status===200){ const clone=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,clone)); }
        return res;
      }).catch(()=>cached);
      return cached || fetchPromise;
    })
  );
});
