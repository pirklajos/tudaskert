import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('accessibility, touch targets and bounded frontend size',async({page})=>{
  await page.goto('/');
  const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  const world=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(world.violations).toEqual([]);
  for(const module of ['clouds','words','writing','reading']){
    await page.locator(`[data-place="${module}"]`).click();await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations).toEqual([]);
    const sizes=await page.locator('button:visible').evaluateAll(buttons=>buttons.map(button=>{const bounds=button.getBoundingClientRect();return [bounds.width,bounds.height];}));expect(sizes.every(([width,height])=>width>=48&&height>=48)).toBe(true);
    await page.getByRole('button',{name:'Vissza az erdei világba'}).click();
  }
  await page.getByRole('button',{name:'Szülőknek',exact:true}).click();await expect(page.locator('.challenge')).toContainText('×');
  const gate=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(gate.violations).toEqual([]);
  const numbers=(await page.locator('.challenge').innerText()).match(/\d+/g).map(Number);await page.locator('#parent-answer').fill(String(numbers[0]*numbers[1]));await page.getByRole('button',{name:'Megnézem a haladást'}).click();await expect(page.locator('.dashboard')).toBeVisible();
  const dashboard=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(dashboard.violations).toEqual([]);expect(errors).toEqual([]);
  const bytes=await page.evaluate(()=>performance.getEntriesByType('resource').filter(entry=>new URL(entry.name).origin===location.origin&&!entry.name.includes('/api/')).reduce((sum,entry)=>sum+entry.transferSize,0));expect(bytes).toBeLessThan(300000);
});
test('manifest satisfies Chromium installability criteria',async({page,context},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop','Installability check uses desktop CDP');
  await page.goto('/');await page.evaluate(()=>navigator.serviceWorker.ready);const cdp=await context.newCDPSession(page);
  const manifest=await cdp.send('Page.getAppManifest');expect(manifest.errors).toEqual([]);expect(manifest.url).toContain('/manifest.webmanifest');
  const criteria=await cdp.send('Page.getInstallabilityErrors');expect(criteria.installabilityErrors).toEqual([]);
});
