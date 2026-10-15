import {test,expect} from '@playwright/test';
import {READINGS} from '../../public/js/reading-content.js';
test('all five reading activities complete and persist',async({page},testInfo)=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/');await page.locator('[data-place="reading"]').click();
  for(const mode of ['syllables','word','sentence','story','comprehension']){
    await page.locator(`[data-reading-mode="${mode}"]`).click();await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');
    const text=await page.locator('.reading-text').innerText(),question=await page.locator('.activity h1').innerText(),image=await page.locator('.word-picture').innerText();const entry=READINGS.find(item=>item.mode===mode&&item.text===text&&item.question===question&&item.image===image);
    await page.getByRole('button',{name:entry.expected,exact:true}).click();await expect(page.locator('.next')).toBeVisible();
  }
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('zorka.practice.v1')).filter(item=>item.synced).length)).toBe(5);
  await page.screenshot({path:testInfo.outputPath('reading.png'),fullPage:true});expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
