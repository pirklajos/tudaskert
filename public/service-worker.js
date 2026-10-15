importScripts('./precache.js');
self.addEventListener('install',event=>{event.waitUntil(caches.open(self.SHELL_CACHE).then(cache=>cache.addAll(self.SHELL_ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('zorka-shell-')&&name!==self.SHELL_CACHE)await caches.delete(name);await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(async()=>{const cache=await caches.open(self.SHELL_CACHE);return await cache.match('/index.html');}));return;
  }
  if(self.SHELL_ASSETS.includes(url.pathname))event.respondWith(caches.open(self.SHELL_CACHE).then(async cache=>(await cache.match(url.pathname))??fetch(event.request)));
});
