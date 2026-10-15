import {test,expect} from '@playwright/test';
test('a parent sees database practice recorded by a different device',async({page})=>{
  async function openParent(){
    await page.goto('/');await page.getByRole('button',{name:'Szülőknek',exact:true}).click();
    await expect(page.locator('.challenge')).toContainText('×');
    const n=(await page.locator('.challenge').innerText()).match(/\d+/g).map(Number);
    await page.locator('#parent-answer').fill(String(n[0]*n[1]));
    await page.getByRole('button',{name:'Megnézem a haladást'}).click();
    await expect(page.locator('.dashboard')).toBeVisible();
  }
  await openParent();
  const before=await(await page.request.get('/api/progress')).json();
  const learner=await page.context().browser().newContext();
  try{
    const current=await(await learner.request.get('http://127.0.0.1:8080/api/child/current')).json();
    await learner.request.post('http://127.0.0.1:8080/api/sessions',{data:{deviceType:'tablet'},headers:{'X-CSRF-Token':current.csrfToken}});
    expect((await learner.request.get('http://127.0.0.1:8080/api/progress')).status()).toBe(403);
    const exercise=await(await learner.request.get('http://127.0.0.1:8080/api/exercises/next?module=clouds&mode=find')).json();
    const id=exercise.choices.find(choice=>choice.value===exercise.target).id;
    const data={exerciseId:exercise.id,responses:[{id,responseTimeMs:100}],responseTimeMs:100};
    expect((await learner.request.post('http://127.0.0.1:8080/api/attempts',{data,headers:{'X-CSRF-Token':current.csrfToken}})).status()).toBe(201);
    await learner.request.post('http://127.0.0.1:8080/api/attempts',{data,headers:{'X-CSRF-Token':current.csrfToken}});
    await openParent();
    const after=await(await page.request.get('/api/progress')).json();
    expect(after.attempts).toBe(before.attempts+1);expect(after.completedExercises).toBe(before.completedExercises+1);
    expect(after.recentActivity.some(item=>item.deviceType==='tablet'&&item.skill===exercise.skill&&item.correct===1)).toBe(true);
    await expect(page.locator('.recent-activity')).toContainText('Tablet');
    await expect(page.locator('.recent-activity')).toContainText(`Betű: ${exercise.target}`);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }finally{await learner.close();}
});
