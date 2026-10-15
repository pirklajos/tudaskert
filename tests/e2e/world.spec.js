import { test, expect } from '@playwright/test';
test('world navigation, three cloud games, persistence and no runtime errors', async ({page}, testInfo) => {
  const errors = []; page.on('pageerror',error => errors.push(error.message));
  await page.goto('/'); await expect(page.getByRole('heading',{name:/Szia, Zorka/})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('world.png'),fullPage:true});
  for (const name of ['Hátizsák']) {
    await page.locator('.world-object').filter({hasText:name}).click();
    await expect(page.getByRole('heading',{name})).toBeVisible();
    await page.getByRole('button',{name:'Vissza az erdei világba'}).click();
  }
  await page.locator('[data-place="clouds"]').click();
  await page.screenshot({path:testInfo.outputPath('clouds.png'),fullPage:true});
  for (const mode of ['find','pop','match']) {
    await page.locator(`[data-mode="${mode}"]`).click();
    await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');
    const target = mode === 'match' ? await page.locator('#reference').innerText() : (await page.locator('#instruction').innerText()).match(/(?:összes|az) (\S+) betű/)[1];
    const correct = page.getByRole('button',{name:`${target} betű`,exact:true});
    const count = await correct.count();
    for (let index = 0; index < count; index++) await correct.nth(index).click();
    await expect(page.locator('.next')).toBeVisible();
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('zorka.practice.v1')).length)).toBe(3);
  await page.reload(); await page.locator('[data-place="rewards"]').click(); await expect(page.getByText(/Már 3 feladatot/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('retry, levels, mute fallback and reduced motion', async ({page}) => {
  await page.addInitScript(() => {Object.defineProperty(window,'speechSynthesis',{value:undefined});});
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/');
  expect(await page.locator('.cloud .object-art').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  await page.locator('[data-place="clouds"]').click();
  await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');
  const target = (await page.locator('#instruction').innerText()).match(/az (\S+) betű/)[1];
  await page.locator('.letter-cloud').filter({hasNotText:target}).first().click();
  await expect(page.locator('.feedback')).toContainText('Próbáld');
  await page.getByRole('button',{name:'Madár: instrukció megismétlése'}).click();
  await page.locator('.letter-cloud').filter({hasText:new RegExp(`^${target}$`)}).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('zorka.practice.v1'))[0].correct)).toBe(false);
  await page.locator('[data-level="3"]').click(); await expect(page.locator('.letter-cloud')).toHaveCount(6);
});
