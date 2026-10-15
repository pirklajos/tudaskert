import {test,expect} from '@playwright/test';
test('writing threshold persists across devices and is fixed for each issued drawing',async({page})=>{
  await page.goto('/');
  expect((await page.request.put('/api/parent/writing',{data:{acceptancePercent:80}})).status()).toBe(403);
  await page.getByRole('button',{name:'Szülőknek',exact:true}).click();
  await expect(page.locator('.challenge')).toContainText('×');
  const numbers=(await page.locator('.challenge').innerText()).match(/\d+/g).map(Number);
  await page.locator('#parent-answer').fill(String(numbers[0]*numbers[1]));
  await page.getByRole('button',{name:'Megnézem a haladást'}).click();
  await expect(page.locator('#writing-threshold')).toBeVisible();
  const previous=Number(await page.locator('#writing-threshold').inputValue());
  const previousCoverage=Number(await page.locator('#writing-coverage').inputValue());
  const csrf=(await(await page.request.get('/api/child/current')).json()).csrfToken;
  try{
    await page.locator('#writing-threshold').fill('80');
    await page.locator('#writing-coverage').fill('60');
    await page.getByRole('button',{name:'Írásbeállítás mentése',exact:true}).click();
    await expect(page.locator('.writing-save-message')).toContainText('Mentve!');
    for(const acceptancePercent of [0,101,12.5,'80']) expect((await page.request.put('/api/parent/writing',{data:{acceptancePercent},headers:{'X-CSRF-Token':csrf}})).status()).toBe(422);
    for(const coveragePercent of [0,101,12.5,'60']) expect((await page.request.put('/api/parent/writing',{data:{acceptancePercent:80,coveragePercent},headers:{'X-CSRF-Token':csrf}})).status()).toBe(422);
    const other=await page.context().browser().newContext();
    try {const settings=await(await other.request.get('http://127.0.0.1:8080/api/child/current')).json();expect(settings.writingThreshold).toBe(80);expect(settings.writingCoverage).toBe(60);}finally{await other.close();}
    await page.getByRole('button',{name:'Vissza az erdei világba'}).click();
    await page.locator('[data-place="writing"]').click();
    await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');
    await expect(page.locator('.trace-hint')).toContainText('80%');
    await expect(page.locator('.trace-hint')).toContainText('60%');
    await page.getByRole('button',{name:'Kész!',exact:true}).click();
    await expect(page.locator('.feedback')).toContainText('0%');
    await expect(page.locator('.next')).toBeHidden();
  }finally{
    // The gate remains open on the server until lockParent runs on exit.
    const challenge=await(await page.request.get('/api/parent/challenge')).json();
    const n=challenge.question.match(/\d+/g).map(Number);
    await page.request.post('/api/parent/unlock',{data:{answer:n[0]*n[1]},headers:{'X-CSRF-Token':csrf}});
    await page.request.put('/api/parent/writing',{data:{acceptancePercent:previous,coveragePercent:previousCoverage},headers:{'X-CSRF-Token':csrf}});
  }
});
