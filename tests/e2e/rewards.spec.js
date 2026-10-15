import {test,expect} from '@playwright/test';
test('earned stickers survive mistakes and duplicate submissions',async({page,request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop','Reward rules do not depend on viewport');
  const current=await(await request.get('/api/child/current')).json();const headers={'X-CSRF-Token':current.csrfToken};await request.post('/api/sessions',{headers,data:{}});
  for(let n=0;n<5;n++){
    const exercise=await(await request.get('/api/exercises/next')).json();const target=exercise.choices.find(item=>item.value===exercise.target),wrong=exercise.choices.find(item=>item.value!==exercise.target);
    const responses=(n===4?[wrong,target]:[target]).map((item,index)=>({id:item.id,responseTimeMs:(index+1)*100}));
    const data={exerciseId:exercise.id,responses,responseTimeMs:250};expect((await request.post('/api/attempts',{headers,data})).status()).toBe(201);expect((await request.post('/api/attempts',{headers,data})).status()).toBe(200);
  }
  const rewards=await(await request.get('/api/rewards')).json();expect(rewards.rewards.map(item=>item.key).sort()).toEqual(['first-leaf','forest-friend']);
  const world=await(await request.get('/api/world')).json();expect(world.decorations).toContain('squirrel');
});
