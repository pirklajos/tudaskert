import { createMathExercise, MathGame } from './math-engine.js';
import { saveResult } from './storage.js';
import { speak, stopSpeech } from './speech.js';
import { getExercise } from './api.js';

export function showMath(root, home) {
  const game = new MathGame(); game.init();
  let mode = 'mixed', difficulty = 1, generation = 0, destroyed = false, advanceTimer;
  root.innerHTML = `<section class="activity math-game"><div class="activity-top"><button class="home" aria-label="Vissza az erdei világba">🍃 ← Haza</button><button class="help" aria-label="Madár: instrukció megismétlése">🐦 Segítség</button></div><p class="eyebrow">SZÁMLIGET</p><h1 tabindex="-1">Számoljunk együtt!</h1><div class="mode-picker" role="group" aria-label="Művelet"><button data-math-mode="add">➕ Összeadás</button><button data-math-mode="subtract">➖ Kivonás</button><button data-math-mode="mixed">🌈 Vegyes</button></div><div class="math-levels" role="group" aria-label="Nehézség"><button data-level="1">🌱 10-ig</button><button data-level="2">🌿 20-ig</button><button data-level="3">🌳 50-ig</button></div><div class="math-story" aria-hidden="true"></div><div class="math-problem" aria-live="polite"></div><div class="math-choices"></div><p class="feedback" role="status"></p><button class="primary next" hidden>Új feladat →</button></section>`;
  const feedback=root.querySelector('.feedback'), choices=root.querySelector('.math-choices'), next=root.querySelector('.next');
  function instruction(){ if(!game.exercise)return ''; const e=game.exercise, op=e.operation==='add'?'plusz':'mínusz'; return `Mennyi ${e.left} ${op} ${e.right}?`; }
  function readTask(){ speak(instruction()); }
  async function start(){
    clearTimeout(advanceTimer); stopSpeech(); const revision=++generation; next.hidden=true; choices.replaceChildren(); feedback.textContent='Gondolkodj, és válaszd ki a jó számot! 🌱';
    const exercise=await getExercise({module:'math',mode,difficulty},()=>createMathExercise({mode,difficulty}));
    if(destroyed||revision!==generation)return; game.start(exercise);
    root.querySelectorAll('[data-math-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mathMode===mode)));
    root.querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.level)===difficulty)));
    const sign=exercise.operation==='add'?'+':'−'; root.querySelector('.math-problem').textContent=`${exercise.left} ${sign} ${exercise.right} = ?`;
    const item=exercise.operation==='add'?'🍎':'🐿️'; const total=Math.min(exercise.left,12), second=Math.min(exercise.right,12); root.querySelector('.math-story').textContent=exercise.operation==='add'?`${item.repeat(total)}  +  ${item.repeat(second)}`:`${item.repeat(total)}  −  ${item.repeat(second)}`;
    exercise.choices.forEach(value=>{const button=document.createElement('button');button.className='math-tile';button.textContent=value;button.addEventListener('click',()=>answer(value,button));choices.append(button);});
    readTask();
  }
  function answer(value,button){const response=game.handleInput(value);if(response.ignored)return;if(response.correct){feedback.textContent='Igen! Megtaláltad! ⭐';button.classList.add('correct');choices.querySelectorAll('button').forEach(b=>b.disabled=true);saveResult(game.finish());next.hidden=false;advanceTimer=setTimeout(()=>next.click(),1300);}else{feedback.textContent='Majdnem! Számold meg még egyszer! 🌱';button.disabled=true;button.classList.add('try-again');}}
  root.querySelector('.home').addEventListener('click',home);root.querySelector('.help').addEventListener('click',()=>{feedback.textContent=instruction();readTask();});
  root.querySelectorAll('[data-math-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mathMode;start();}));root.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{difficulty=Number(b.dataset.level);start();}));next.addEventListener('click',start);start();
  return()=>{clearTimeout(advanceTimer);destroyed=true;generation++;game.destroy();stopSpeech();};
}
