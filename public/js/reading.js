import {READINGS} from './reading-content.js';
import {shuffle} from './engine.js';
import {WordGame} from './words-engine.js';
import {getExercise} from './api.js';
import {saveResult} from './storage.js';
import {speak} from './speech.js';
import {canRead} from './practice-letters.js';
export function showReading(root,home){
  const game=new WordGame();game.init();let mode='syllables',generation=0,destroyed=false;
  root.innerHTML=`<section class="activity"><div class="activity-top"><button class="home" aria-label="Vissza az erdei világba">🍃 ← Haza</button><button class="help" aria-label="Madár: felolvasás">🐦 Olvasd fel!</button></div><p class="eyebrow">OLVASÁSFA</p><div class="mode-picker" role="group" aria-label="Olvasási feladat"><button data-reading-mode="syllables">🍃 Szótagok</button><button data-reading-mode="word">🌱 Szavak</button><button data-reading-mode="sentence">🌿 Mondatok</button><button data-reading-mode="story">📖 Kis mese</button><button data-reading-mode="comprehension">🦉 Értsd meg!</button></div><div class="word-picture" role="img"></div><p class="reading-text"></p><h1 tabindex="-1"></h1><div class="reading-choices"></div><p class="feedback" role="status"></p><button class="primary next" hidden>Új levél →</button></section>`;
  const choices=root.querySelector('.reading-choices'),feedback=root.querySelector('.feedback'),next=root.querySelector('.next');
  async function start(){
    const revision=++generation;game.exercise=null;root.querySelector('section').setAttribute('aria-busy','true');choices.replaceChildren();next.hidden=true;feedback.textContent='Nő egy új meselevél…';
    const exercise=await getExercise({module:'reading',mode},()=>{
      const entries=READINGS.filter(item=>item.mode===mode && canRead(`${item.text} ${item.choices.join(' ')}`)),entry=entries[Math.floor(Math.random()*entries.length)];
      if(!entry)return {module:'reading',unavailable:true};
      return {...entry,id:`reading-${globalThis.crypto?.randomUUID?.()??Date.now()}`,module:'reading',skill:`reading:${entry.key}`,difficulty:mode==='syllables'||mode==='word'?1:2,choices:shuffle(entry.choices),serverIssued:false};
    });
    if(destroyed||revision!==generation)return;
    if(exercise.unavailable){root.querySelector('section').setAttribute('aria-busy','false');root.querySelector('.word-picture').textContent='';root.querySelector('.reading-text').textContent='';root.querySelector('h1').textContent='Ezek a levelek még növekednek!';feedback.textContent='A tanult betűkhöz itt még nincs olvasnivaló. Addig várnak a betűfelhők!';return;}
    game.start(exercise);
    root.querySelector('section').setAttribute('aria-busy','false');root.querySelector('.word-picture').textContent=exercise.image;root.querySelector('.word-picture').setAttribute('aria-label','A történet képe');root.querySelector('.reading-text').textContent=exercise.text;root.querySelector('h1').textContent=exercise.question;feedback.textContent='Olvass a saját tempódban!';
    root.querySelectorAll('[data-reading-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.readingMode===mode)));
    exercise.choices.forEach(value=>{const button=document.createElement('button');button.className='word-tile';button.textContent=value;button.addEventListener('click',()=>{const response=game.handleInput(value);if(response.ignored)return;feedback.textContent=response.correct?'Szépen olvastál! 🌳':'Olvassuk el még egyszer! 🌱';if(response.correct){saveResult(game.finish());next.hidden=false;choices.querySelectorAll('button').forEach(item=>item.disabled=true);}});choices.append(button);});
  }
  root.querySelector('.home').addEventListener('click',home);root.querySelector('.help').addEventListener('click',()=>{if(game.exercise)speak(`${game.exercise.text} ${game.exercise.question}`);});root.querySelectorAll('[data-reading-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.readingMode;start();}));next.addEventListener('click',start);start();return()=>{destroyed=true;generation++;game.destroy();};
}
