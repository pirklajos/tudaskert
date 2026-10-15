import {test,expect} from '@playwright/test';
import {WORDS} from '../../public/js/words-content.js';
test('installed shell supports offline reload and every learning location',async({page,context})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/');
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const cachePaths=await page.evaluate(async()=>{const keys=await caches.keys();return(await(await caches.open(keys.find(key=>key.startsWith('zorka-shell-')))).keys()).map(request=>new URL(request.url).pathname);});
  expect(cachePaths).toContain('/js/reading-content.js');expect(cachePaths.some(path=>path.startsWith('/api/'))).toBe(false);
  await context.setOffline(true);await page.reload();await expect(page.locator('.world')).toBeVisible();
  await page.locator('[data-place="clouds"]').click();await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');const target=(await page.locator('#instruction').innerText()).match(/az (\S+) betű/)[1];await page.getByRole('button',{name:`${target} betű`,exact:true}).click();await expect(page.locator('.next')).toBeVisible();
  await page.getByRole('button',{name:'Vissza az erdei világba'}).click();await page.locator('[data-place="words"]').click();await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');const word=await page.locator('.word-picture').getAttribute('aria-label');const entry=WORDS.find(item=>item.word===word);await page.getByRole('button',{name:entry.units[0].toLocaleUpperCase('hu'),exact:true}).click();await expect(page.locator('.next')).toBeVisible();
  await page.getByRole('button',{name:'Vissza az erdei világba'}).click();await page.locator('[data-place="writing"]').click();await expect(page.locator('.check')).toBeEnabled();await expect(page.locator('.guide-line')).toHaveCount(2);
  await page.getByRole('button',{name:'Vissza az erdei világba'}).click();await page.locator('[data-place="reading"]').click();await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');await expect(page.locator('.word-tile')).toHaveCount(3);
  await page.getByRole('button',{name:'Szülőknek',exact:true}).click();await expect(page.locator('#parent-message')).toContainText('nem érhetők el');
  expect(errors).toEqual([]);await context.setOffline(false);
});
test('issued answers synchronize once after reconnect',async({page,context})=>{
  await page.goto('/');await page.locator('[data-place="clouds"]').click();await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');const target=(await page.locator('#instruction').innerText()).match(/az (\S+) betű/)[1];
  await context.setOffline(true);await page.getByRole('button',{name:`${target} betű`,exact:true}).click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('zorka.practice.v1'))[0].synced)).toBe(false);
  await context.setOffline(false);await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('zorka.practice.v1'))[0].synced)).toBe(true);
});
