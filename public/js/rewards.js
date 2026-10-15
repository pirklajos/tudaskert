import {REWARDS} from './rewards-content.js';
import {loadResults} from './storage.js';
import {getRewards} from './api.js';
export function localRewards(){return REWARDS.filter(reward=>loadResults().length>=reward.threshold);}
export function showRewards(root,home){
  let destroyed=false;
  root.innerHTML=`<section class="activity"><button class="home" aria-label="Vissza az erdei világba">🍃 ← Haza</button><div class="placeholder-art" aria-hidden="true">🎒</div><h1 tabindex="-1">Hátizsák</h1><p class="reward-count"></p><p>A kalandjaid emlékei. Hibázáskor is megmaradnak!</p><div class="reward-collection"></div><p class="reward-note"></p></section>`;
  const count=loadResults().length;root.querySelector('.reward-count').textContent=`Már ${count} feladatot végigpróbáltál. Minden próbálkozás egy kis felfedezés!`;
  const collection=root.querySelector('.reward-collection');
  function render(rewards){collection.replaceChildren();if(!rewards.length){const p=document.createElement('p');p.textContent='Az első kalandod emléke is ide kerül majd.';collection.append(p);return;}
    rewards.forEach(reward=>{const card=document.createElement('div');card.className='reward-card';const art=document.createElement('span');art.className='reward-art';art.setAttribute('aria-hidden','true');art.textContent=reward.icon;const text=document.createElement('strong');text.textContent=reward.title;card.append(art,text);collection.append(card);});
  }
  render(localRewards());
  void getRewards().then(rewards=>{if(destroyed||rewards===null)return;render(rewards.map(item=>item.metadata));});
  root.querySelector('.home').addEventListener('click',home);return()=>{destroyed=true;};
}
