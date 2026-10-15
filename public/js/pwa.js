export function registerPwa(){
  if(!('serviceWorker' in navigator)||!globalThis.isSecureContext)return;
  let controlled=!!navigator.serviceWorker.controller,reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(controlled&&!reloading){reloading=true;location.reload();}
    controlled=true;
  });
  navigator.serviceWorker.register('/service-worker.js',{updateViaCache:'none'}).then(registration=>registration.update()).catch(()=>{/* The ordinary app remains usable. */});
}
