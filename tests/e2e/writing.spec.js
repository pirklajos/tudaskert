import {test,expect} from '@playwright/test';
import {TRACES} from '../../public/js/writing-content.js';
test('pointer tracing, retry and completion',async({page,context},testInfo)=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/');await page.locator('[data-place="writing"]').click();
  await page.getByRole('button',{name:'Kész!',exact:true}).click();await expect(page.locator('.feedback')).toContainText('Haladj');
  await page.getByRole('button',{name:'🌱 Újrapróbálom',exact:true}).click();
  const board=page.locator('.trace-board');await board.scrollIntoViewIfNeeded();const box=await board.boundingBox();
  const touch=testInfo.project.name!=='desktop';const cdp=touch?await context.newCDPSession(page):null;
  for(const stroke of TRACES[0].strokes){
    const points=[];
    for(let i=1;i<stroke.length;i++){const a=stroke[i-1],b=stroke[i];for(let n=0;n<=15;n++)points.push({x:box.x+(a[0]+(b[0]-a[0])*n/15)*box.width/300,y:box.y+(a[1]+(b[1]-a[1])*n/15)*box.height/300});}
    if(touch){
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});
      for(const point of points.slice(1))await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }else{
      await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();for(const point of points.slice(1))await page.mouse.move(point.x,point.y);await page.mouse.up();
    }
  }
  await page.getByRole('button',{name:'Kész!',exact:true}).click();await expect(page.locator('.next')).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('zorka.practice.v1'))[0].attempts)).toBe(2);
  await page.locator('.next').click();await expect(page.locator('[data-trace="1"]')).toHaveAttribute('aria-pressed','true');
  expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
