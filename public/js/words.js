import {createWordExercise, WordGame} from './words-engine.js';
import {saveResult} from './storage.js';
import {speak,stopSpeech} from './speech.js';
import {getExercise} from './api.js';
import {practiceLetters} from './practice-letters.js';

export function showWords(root,home) {
  const game=new WordGame();game.init();let mode='initial';let selected=[];let generation=0;let destroyed=false;
  root.innerHTML=`<section class="activity"><div class="activity-top"><button class="home" aria-label="Vissza az erdei világba">🍃 ← Haza</button><button class="help" aria-label="Madár: instrukció megismétlése">🐦 Segítség</button></div><p class="eyebrow">SZÓHÁZ</p><div class="mode-picker" aria-label="Szójáték típusa" role="group"><button data-word-mode="initial">🌱 Kezdőbetű</button><button data-word-mode="pair">🖼️ Kép és szó</button><button data-word-mode="build">🧩 Kirakás</button><button data-word-mode="type">✍️ Beírás</button></div><h1 id="word-instruction" tabindex="-1"></h1><div class="word-picture" role="img"></div><div class="word-slots" aria-live="polite"></div><div class="word-choices"></div><div class="word-actions"><button class="undo">🍃 Visszaveszem</button><button class="primary check">Kész!</button></div><p class="feedback" role="status"></p><button class="primary next" hidden>Új kép →</button></section>`;
  const feedback=root.querySelector('.feedback'), next=root.querySelector('.next'), slots=root.querySelector('.word-slots'), choices=root.querySelector('.word-choices'), actions=root.querySelector('.word-actions');
  function updateSlots(){slots.textContent=selected.map(item=>item.value).join('')||'· · ·';}
  function readTask(){if(game.exercise)speak(`${root.querySelector('#word-instruction').textContent} A képen: ${game.exercise.entry.word}.`);}
  function answer(value){
    const response=game.handleInput(value);if(response.ignored)return;
    feedback.textContent=response.correct?'Megtaláltad! Ügyesen dolgoztál! ⭐':'Nézzük meg még egyszer! 🌱';
    if(response.correct){saveResult(game.finish());next.hidden=false;advanceTimer=setTimeout(()=>next.click(),1200);choices.querySelectorAll('button').forEach(button=>button.disabled=true);actions.hidden=true;}
  }
  let advanceTimer;
  async function start(){
    clearTimeout(advanceTimer); stopSpeech();
    root.querySelector('section').setAttribute('aria-busy','true');
    const revision=++generation;game.exercise=null;next.hidden=true;choices.replaceChildren();actions.hidden=true;feedback.textContent='Érkezik az új kép…';
    const exercise=await getExercise({module:'words',mode},()=>createWordExercise({mode,letters:practiceLetters()}));
    if(destroyed||revision!==generation)return;
    if(exercise.unavailable){root.querySelector('section').setAttribute('aria-busy','false');root.querySelector('.word-picture').textContent='';slots.textContent='';root.querySelector('#word-instruction').textContent='Ezek a szavak még növekednek!';feedback.textContent='A tanult betűkhöz itt még nincs feladat. Próbáld ki a kezdőbetűket vagy a betűfelhőket!';return;}
    game.start(exercise);selected=[];next.hidden=true;feedback.textContent='Érintsd meg a választ!';
    root.querySelector('section').setAttribute('aria-busy','false');
    root.querySelectorAll('[data-word-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.wordMode===mode)));
    root.querySelector('#word-instruction').textContent=({initial:'Melyik betűvel kezdődik?',pair:'Melyik szó illik a képhez?',build:'Rakd ki a kép nevét!',type:'Írd be a kép nevét!'})[mode];
    const picture=root.querySelector('.word-picture');picture.textContent=game.exercise.entry.image;picture.setAttribute('aria-label',game.exercise.entry.word);
    readTask();
    slots.hidden=!['build','type'].includes(mode);actions.hidden=slots.hidden;updateSlots();choices.replaceChildren();
    game.exercise.choices.forEach((value,index)=>{
      const button=document.createElement('button');button.className='word-tile';button.textContent=value;
      button.addEventListener('click',()=>{
        if(['initial','pair'].includes(mode)){answer(value);return;}
        if(selected.length>=game.exercise.entry.units.length)return;
        selected.push({value,index});if(mode==='build')button.disabled=true;updateSlots();
      });choices.append(button);
    });
  }
  root.querySelector('.undo').addEventListener('click',()=>{const item=selected.pop();if(item&&mode==='build')choices.children[item.index].disabled=false;updateSlots();});
  root.querySelector('.check').addEventListener('click',()=>{if(!selected.length){feedback.textContent='Előbb válassz néhány betűt!';return;}answer(selected.map(item=>item.value).join(''));});
  root.querySelector('.home').addEventListener('click',home);
  root.querySelector('.help').addEventListener('click',()=>{if(!game.exercise)return;const message=`${root.querySelector('#word-instruction').textContent} A képen: ${game.exercise.entry.word}.`;feedback.textContent=message;speak(message);});
  root.querySelectorAll('[data-word-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.wordMode;start();}));
  next.addEventListener('click',start);start();return()=>{clearTimeout(advanceTimer);destroyed=true;generation++;game.destroy();};
}
