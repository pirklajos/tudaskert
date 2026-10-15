import {test,expect} from '@playwright/test';
import {WORDS} from '../../public/js/words-content.js';
test('all word modes work with touch and persist results',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/');await page.locator('[data-place="words"]').click();
  for(const mode of ['initial','pair','build','type']){
    await page.locator(`[data-word-mode="${mode}"]`).click();
    await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');
    const word=await page.locator('.word-picture').getAttribute('aria-label');const entry=WORDS.find(item=>item.word===word);
    if(mode==='initial'||mode==='pair')await page.getByRole('button',{name:mode==='initial'?entry.units[0].toLocaleUpperCase('hu'):word,exact:true}).click();
    else{
      for(const unit of entry.units)await page.locator('.word-tile:enabled').filter({hasText:new RegExp(`^${unit}$`)}).first().click();
      await page.getByRole('button',{name:'Kész!',exact:true}).click();
    }
    await expect(page.locator('.next')).toBeVisible();
  }
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('zorka.practice.v1')).length)).toBe(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
  await page.getByRole('button',{name:'Vissza az erdei világba'}).click();await expect(page.locator('.world')).toBeVisible();
});
