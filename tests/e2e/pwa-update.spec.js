import {test,expect} from '@playwright/test';
test('an updated worker activates with an open tab and refreshes the interface',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop','Worker lifecycle is independent of viewport');
  await page.addInitScript(()=>sessionStorage.setItem('testBoots',String(Number(sessionStorage.getItem('testBoots')||0)+1)));
  await page.goto('/');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
  const before=await page.evaluate(()=>Number(sessionStorage.getItem('testBoots')));
  // A query variant changes the registered worker URL without changing server files.
  await page.evaluate(async()=>{await navigator.serviceWorker.register('/service-worker.js?update-test=1',{updateViaCache:'none'});});
  await expect.poll(()=>page.evaluate(()=>Number(sessionStorage.getItem('testBoots'))).catch(()=>0)).toBeGreaterThan(before);
  await expect(page.getByRole('button',{name:'Szülőknek',exact:true})).toBeVisible();
});
