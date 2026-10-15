import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
test.beforeEach(async ({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'API coverage is independent of viewport'); });
async function begin(request) {
  const current = await (await request.get('/api/child/current')).json();
  const headers = {'X-CSRF-Token':current.csrfToken};
  const response = await request.post('/api/sessions',{headers,data:{deviceType:'desktop'}});
  expect(response.status()).toBe(201);
  return {headers,session:await response.json()};
}
test('server evaluates, persists each mistake, deduplicates and checks ownership',async({request,playwright})=>{
  const {headers,session}=await begin(request);
  const issued=await request.get('/api/exercises/next?module=clouds&mode=pop');expect(issued.status()).toBe(200);const exercise=await issued.json();
  const wrong=exercise.choices.find(item=>item.value!==exercise.target),targets=exercise.choices.filter(item=>item.value===exercise.target);
  const responses=[wrong,...targets].map((item,index)=>({id:item.id,correct:true,value:'forged',responseTimeMs:(index+1)*100}));
  const data={exerciseId:exercise.id,responses,responseTimeMs:350,correct:true};
  const saved=await request.post('/api/attempts',{headers,data});expect(saved.status()).toBe(201);expect(await saved.json()).toMatchObject({saved:true,attempts:3,correct:false});
  expect((await request.post('/api/attempts',{headers,data})).status()).toBe(200);
  const rows=JSON.parse(execFileSync('php',['backend/tests/inspect-attempt.php',exercise.id],{encoding:'utf8',env:{...process.env,APP_ENV:'test'}}));expect(rows).toHaveLength(3);expect(Number(rows[0].correct)).toBe(0);expect(Number(rows[1].correct)).toBe(1);
  const other=await playwright.request.newContext({baseURL:'http://127.0.0.1:8080'});const foreign=await begin(other);
  expect((await other.post('/api/attempts',{headers:foreign.headers,data})).status()).toBe(404);
  expect((await other.patch(`/api/sessions/${session.id}/finish`,{headers:foreign.headers,data:{}})).status()).toBe(404);await other.dispose();
  expect((await request.patch(`/api/sessions/${session.id}/finish`,{headers,data:{}})).status()).toBe(200);
  expect((await request.get('/api/exercises/next')).status()).toBe(409);
});
test('API rejects CSRF, malformed input, bad difficulty and protected progress',async({request})=>{
  await request.get('/api/child/current');expect((await request.post('/api/sessions',{data:{}})).status()).toBe(403);
  const {headers}=await begin(request);
  expect((await request.post('/api/sessions',{headers,data:{deviceType:'invalid'}})).status()).toBe(422);
  expect((await request.post('/api/sessions',{headers:{...headers,'Content-Type':'application/json'},data:'{bad'})).status()).toBe(400);
  expect((await request.get('/api/exercises/next?difficulty=9')).status()).toBe(422);
  expect((await request.get('/api/progress')).status()).toBe(403);
  const exercise=await(await request.get('/api/exercises/next')).json();
  const forged=await request.post('/api/attempts',{headers,data:{exerciseId:exercise.id,responseTimeMs:100,responses:[{id:'absent',responseTimeMs:100,correct:true}]}});expect(forged.status()).toBe(422);
});
test('browser results reach MySQL and backend loss keeps practice usable',async({page})=>{
  await page.goto('/');await page.locator('[data-place="clouds"]').click();await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');
  const target=(await page.locator('#instruction').innerText()).match(/az (\S+) betű/)[1];
  await page.getByRole('button',{name:`${target} betű`,exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('zorka.practice.v1'))?.[0]?.synced)).toBe(true);
  const result=await page.evaluate(()=>JSON.parse(localStorage.getItem('zorka.practice.v1'))[0]);
  const rows=JSON.parse(execFileSync('php',['backend/tests/inspect-attempt.php',result.exerciseId],{encoding:'utf8',env:{...process.env,APP_ENV:'test'}}));expect(rows).toHaveLength(1);
  await page.route('**/api/**',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'}));
  await page.locator('.next').click();await expect(page.locator('.activity')).toHaveAttribute('aria-busy','false');await expect(page.locator('.letter-cloud')).toHaveCount(3);
  const nextTarget=(await page.locator('#instruction').innerText()).match(/az (\S+) betű/)[1];await page.getByRole('button',{name:`${nextTarget} betű`,exact:true}).click();await expect(page.locator('.next')).toBeVisible();
});
