import {TRACES} from './writing-content.js';
import {evaluateTrace,TRACE_CONFIG} from './writing-engine.js';
import {saveResult} from './storage.js';
import {speak,stopSpeech} from './speech.js';
import {getExercise,loadPracticeLetters} from './api.js';
import {practiceLetters,writingThreshold,writingCoverage} from './practice-letters.js';
const NS='http://www.w3.org/2000/svg';
export function showWriting(root,home){
  let index=0,strokes=[],current=null,pointerId=null,attempts=[],startedAt=performance.now(),completed=false,exercise=null,generation=0,destroyed=false;
  root.innerHTML=`<section class="activity"><div class="activity-top"><button class="home" aria-label="Vissza az erdei világba">🍃 ← Haza</button><button class="help" aria-label="Madár: instrukció megismétlése">🐦 Segítség</button></div><p class="eyebrow">ÍRÁSKERT</p><h1 tabindex="-1">Rajzolj a levélösvényen!</h1><div class="trace-picker" role="group" aria-label="Mintabetű"></div><p class="trace-hint">A pöttyöknél indulj, és kövesd a nyilakat!</p><svg class="trace-board" viewBox="0 0 300 300" aria-label="Ujjal rajzolható betűminta" role="img"><path class="baseline" d="M20 250H280 M20 150H280 M20 50H280"/><g class="trace-guide"></g><g class="trace-ink"></g></svg><div class="word-actions"><button class="undo">🌱 Újrapróbálom</button><button class="primary check">Kész!</button></div><p class="feedback" role="status">Húzd végig az ujjad a mintán!</p><button class="primary next" hidden>Következő betű →</button></section>`;
  const board=root.querySelector('.trace-board'),guide=root.querySelector('.trace-guide'),ink=root.querySelector('.trace-ink'),feedback=root.querySelector('.feedback'),next=root.querySelector('.next');
  root.querySelector('.check').disabled=true;root.querySelector('section').setAttribute('aria-busy','true');
  function svg(name,attributes){const element=document.createElementNS(NS,name);for(const[key,value]of Object.entries(attributes))element.setAttribute(key,value);return element;}
  function release(){if(pointerId!==null&&board.hasPointerCapture(pointerId))board.releasePointerCapture(pointerId);pointerId=null;current=null;}
  function clear(){release();strokes=[];ink.replaceChildren();feedback.textContent='Húzd végig az ujjad a mintán!';}
  let advanceTimer;
  async function start(){
    clearTimeout(advanceTimer); stopSpeech();
    root.querySelector('section').setAttribute('aria-busy','true');
    const revision=++generation;exercise=null;clear();guide.replaceChildren();completed=false;attempts=[];next.hidden=true;root.querySelector('.check').disabled=true;
    feedback.textContent='Növekszik a betűösvény…';
    const loaded=await getExercise({module:'writing',index},()=>({id:`writing-${globalThis.crypto?.randomUUID?.()??Date.now()}`,module:'writing',trace:TRACES[index],traceConfig:{...TRACE_CONFIG,acceptancePercent:writingThreshold(),coveragePercent:writingCoverage()},serverIssued:false}));
    if(destroyed||revision!==generation)return;
    exercise=loaded;startedAt=performance.now();root.querySelector('.check').disabled=false;feedback.textContent='Húzd végig az ujjad a mintán!';
    root.querySelector('.trace-hint').textContent=`A pöttyöknél indulj, és kövesd a nyilakat! Pontosság: ${exercise.traceConfig?.acceptancePercent??70}%-tól; mintalefedettség: ${exercise.traceConfig?.coveragePercent??exercise.traceConfig?.acceptancePercent??70}%-tól.`;
    root.querySelector('section').setAttribute('aria-busy','false');
    root.querySelectorAll('[data-trace]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.trace)===index)));
    for(const stroke of exercise.trace.strokes){
      guide.append(svg('polyline',{points:stroke.map(point=>point.join(',')).join(' '),class:'guide-line'}));
      const [x,y]=stroke[0],[x2,y2]=stroke[1];const angle=Math.atan2(y2-y,x2-x)*180/Math.PI;
      guide.append(svg('circle',{cx:x,cy:y,r:7,class:'start-dot'}));
      guide.append(svg('path',{d:`M ${x+14} ${y-5} l 9 5 -9 5`,transform:`rotate(${angle} ${x} ${y})`,class:'direction-arrow'}));
    }
    board.setAttribute('aria-label',`${TRACES[index].letter} betű: ujjal rajzolható minta`);
    speak(`Rajzold le az ${TRACES[index].letter} betűt! A pöttyöknél indulj, és kövesd a nyilakat! Ha elkészültél, nyomd meg a Kész gombot!`);
  }
  let allowedIndices=[];
  async function initialize(){
    await loadPracticeLetters();if(destroyed)return;
    const selected=practiceLetters();allowedIndices=TRACES.map((trace,n)=>n).filter(n=>!selected||selected.includes(TRACES[n].letter.toLocaleUpperCase('hu')));
    allowedIndices.forEach(n=>{const button=document.createElement('button');button.textContent=TRACES[n].letter;button.dataset.trace=n;button.addEventListener('click',()=>{index=n;start();});root.querySelector('.trace-picker').append(button);});
    if(!allowedIndices.length){feedback.textContent='A kiválasztott betűkhöz még nincs rajzminta. Válassz betűfelhőt, vagy kérj segítséget egy felnőttől!';root.querySelector('.check').disabled=true;root.querySelector('section').setAttribute('aria-busy','false');return;}
    index=allowedIndices[0];start();
  }
  function point(event){const rect=board.getBoundingClientRect();return [Math.max(0,Math.min(TRACE_CONFIG.size,(event.clientX-rect.left)*TRACE_CONFIG.size/rect.width)),Math.max(0,Math.min(TRACE_CONFIG.size,(event.clientY-rect.top)*TRACE_CONFIG.size/rect.height))];}
  board.addEventListener('pointerdown',event=>{if(!exercise||completed||pointerId!==null||event.button>0||strokes.length>=30)return;event.preventDefault();pointerId=event.pointerId;board.setPointerCapture(pointerId);current=[point(event)];strokes.push(current);ink.append(svg('polyline',{points:current.map(p=>p.join(',')).join(' '),class:'ink-line'}));});
  board.addEventListener('pointermove',event=>{if(event.pointerId!==pointerId||!current)return;event.preventDefault();const p=point(event),last=current.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])<2||strokes.reduce((sum,path)=>sum+path.length,0)>=1000)return;current.push(p);ink.lastElementChild.setAttribute('points',current.map(p=>p.join(',')).join(' '));});
  board.addEventListener('pointerup',event=>{if(event.pointerId===pointerId)release();});
  board.addEventListener('pointercancel',event=>{if(event.pointerId===pointerId)release();});
  board.addEventListener('lostpointercapture',()=>{pointerId=null;current=null;});
  root.querySelector('.undo').addEventListener('click',()=>{if(completed){start();return;}clear();});
  root.querySelector('.check').addEventListener('click',()=>{
    if(!exercise)return;release();const result=evaluateTrace(strokes,exercise.trace.strokes,exercise.traceConfig??TRACE_CONFIG);attempts.push({...result,strokes:structuredClone(strokes),responseTimeMs:Math.round(performance.now()-startedAt)});
    feedback.textContent=`Vonalpontosság: ${Math.round(result.precision*100)}%. A minta lefedettsége: ${Math.round(result.coverage*100)}%. `+(result.correct?'Elfogadva! Szép betűösvényt rajzoltál! 🌷':'Haladj még egy kicsit a mintán! Most még nem elfogadott. 🌱');
    if(result.correct){completed=true;saveResult({exerciseId:exercise.id,serverIssued:!!exercise.serverIssued,module:'writing',skill:`trace:${TRACES[index].letter}`,expectedAnswer:TRACES[index].letter,givenAnswer:result,responses:attempts,correct:attempts.every(item=>item.correct),completed:true,attempts:attempts.length,responseTimeMs:Math.round(performance.now()-startedAt),difficulty:1});next.hidden=false;advanceTimer=setTimeout(()=>next.click(),1200);root.querySelector('.check').disabled=true;}
  });
  next.addEventListener('click',()=>{index=allowedIndices[(allowedIndices.indexOf(index)+1)%allowedIndices.length];start();});root.querySelector('.home').addEventListener('click',home);
  root.querySelector('.help').addEventListener('click',()=>{if(!exercise)return;const message=`Rajzold le az ${TRACES[index].letter} betűt! A pöttyöknél indulj, és kövesd a nyilakat!`;feedback.textContent=message;speak(message);});initialize();return()=>{clearTimeout(advanceTimer);destroyed=true;generation++;release();};
}
