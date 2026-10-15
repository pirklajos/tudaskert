import { LOCATIONS } from './content.js';
import { showClouds } from './clouds.js';
import { showWords } from './words.js';
import { showWriting } from './writing.js';
import { loadResults } from './storage.js';
import { speak, stopSpeech } from './speech.js';
import { finishSession, getWorld } from './api.js';
import { showParent } from './parent.js';
import { showRewards, localRewards } from './rewards.js';
import { REWARDS } from './rewards-content.js';
import { showReading } from './reading.js';
import { registerPwa } from './pwa.js';

const app = document.querySelector('#app');
let cleanup = () => {};
export function navigate(id = 'world') {
  cleanup(); stopSpeech(); cleanup = () => {};
  if (id === 'world') { void finishSession(); showWorld(); }
  else if (id === 'clouds') cleanup = showClouds(app, () => navigate());
  else if (id === 'words') cleanup = showWords(app, () => navigate());
  else if (id === 'writing') cleanup = showWriting(app, () => navigate());
  else if (id === 'parent') cleanup = showParent(app, () => navigate());
  else if (id === 'rewards') cleanup = showRewards(app, () => navigate());
  else if (id === 'reading') cleanup = showReading(app, () => navigate());
  else showLocation(id);
  app.querySelector('h1')?.focus({ preventScroll: true });
}
function showWorld() {
  app.innerHTML = `<section class="world" aria-label="Erdei tanulóvilág"><div class="world-intro"><p class="eyebrow">A TE KIS ERDEI VILÁGOD</p><h1 tabindex="-1">Szia, Zorka! <span>Merre induljunk?</span></h1></div><div class="sun" aria-hidden="true">☀</div><div class="hills" aria-hidden="true"></div><div class="path" aria-hidden="true"></div><div class="world-objects">${LOCATIONS.map(place => `<button class="world-object ${place.className}" data-place="${place.id}"><span class="object-art" aria-hidden="true">${place.icon}</span><span class="object-label">${place.title}</span><span class="object-hint">${place.hint}</span></button>`).join('')}</div><button class="bird" aria-label="Madár: segítség"><span aria-hidden="true">🐦</span><span>Segítek!</span></button><p class="bird-message" role="status">Érints meg egy helyszínt!</p><span class="flowers" aria-hidden="true">✿ · ✿ · ✿</span></section>`;
  app.querySelectorAll('[data-place]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.place)));
  const decoration=document.createElement('div');decoration.className='earned-decorations';decoration.setAttribute('aria-hidden','true');decoration.textContent=localRewards().map(reward=>reward.icon).join(' ');app.querySelector('.world').append(decoration);
  void getWorld().then(world=>{if(world)decoration.textContent=REWARDS.filter(reward=>world.decorations.includes(reward.decoration)).map(reward=>reward.icon).join(' ');});
  app.querySelector('.bird').addEventListener('click', () => {
    const message = 'A felhőkben betűket kereshetsz. Válassz egy helyszínt!';
    app.querySelector('.bird-message').textContent = message; speak(message);
  });
}
function showLocation(id) {
  const place = LOCATIONS.find(item => item.id === id);
  const results = loadResults();
  const message = id === 'rewards' ? `Már ${results.length} feladatot végigpróbáltál. Minden próbálkozás egy kis felfedezés!` : 'Ez a helyszín még növekszik. Addig várnak a betűfelhők!';
  app.innerHTML = `<section class="activity"><button class="home" aria-label="Vissza az erdei világba">🍃 ← <span>Haza</span></button><div class="placeholder-art" aria-hidden="true">${place.icon}</div><h1 tabindex="-1">${place.title}</h1><p>${message}</p><button class="primary" id="visit-clouds">☁️ Betűfelhők</button></section>`;
  app.querySelector('.home').addEventListener('click', () => navigate());
  app.querySelector('#visit-clouds').addEventListener('click', () => navigate('clouds'));
}
document.querySelector('.parent-entry').addEventListener('click', () => navigate('parent'));
registerPwa();
navigate();
