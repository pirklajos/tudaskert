import {chromium} from '@playwright/test';
import {readFileSync} from 'node:fs';
const svg=readFileSync(new URL('../public/icons/icon.svg',import.meta.url),'utf8');
const browser=await chromium.launch();
try{
  for(const size of [192,512]){
    const page=await browser.newPage({viewport:{width:size,height:size}});
    await page.setContent(`<style>body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
    await page.screenshot({path:new URL(`../public/icons/icon-${size}.png`,import.meta.url).pathname});await page.close();
  }
}finally{await browser.close();}
