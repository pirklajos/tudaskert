import { CloudGame, createCloudExercise } from './engine.js';
import { saveResult } from './storage.js';
import { speak, stopSpeech } from './speech.js';
import { getExercise } from './api.js';
import { practiceLetters } from './practice-letters.js';
import { LETTERS } from './content.js';

export function showClouds(root, home) {
  const game = new CloudGame(); game.init();
  let mode = 'find'; let difficulty = 1; let generation = 0; let destroyed = false;
  root.innerHTML = `<section class="activity clouds-activity"><div class="activity-top"><button class="home" aria-label="Vissza az erdei világba">🍃 ← <span>Haza</span></button><button class="help" aria-label="Madár: instrukció megismétlése">🐦 Segítség</button></div><p class="eyebrow">BETŰFELHŐK</p><div class="mode-picker" role="group" aria-label="Játéktípus"><button data-mode="find">🔎 Keresés</button><button data-mode="pop">🫧 Pukkasztás</button><button data-mode="match">🧩 Párosítás</button></div><div class="difficulty-picker" role="group" aria-label="Nehézség"><button data-level="1">1 · Kezdő</button><button data-level="2">2 · Felfedező</button><button data-level="3">3 · Kis és nagy</button></div><h1 id="instruction" tabindex="-1"></h1><div id="reference"></div><div class="letter-clouds"></div><p class="feedback" role="status" aria-live="polite"></p><button class="primary next" hidden>Új felhők →</button></section>`;
  const instruction = root.querySelector('#instruction');
  const feedback = root.querySelector('.feedback');
  const next = root.querySelector('.next');
  function readTask() {
    if (!game.exercise) return;
    speak(mode === 'match' ? 'Nézd meg a mintabetűt! Keresd meg a párját a felhők között!' : mode === 'pop' ? `Pukkaszd ki az összes ${game.exercise.target} betűt!` : `Figyelj! Keresd meg az ${game.exercise.target} betűt!`);
  }
  let advanceTimer;
  async function start() {
    clearTimeout(advanceTimer); stopSpeech();
    const revision = ++generation;
    root.querySelector('section').setAttribute('aria-busy', 'true');
    next.hidden = true; root.querySelector('.letter-clouds').replaceChildren();
    feedback.textContent = 'Érkeznek a felhők…'; game.exercise = null;
    const exercise = await getExercise({ module: 'clouds', mode, difficulty }, () => createCloudExercise({ mode, difficulty, letters: practiceLetters() ?? LETTERS }));
    if (destroyed || revision !== generation) return;
    game.start(exercise);
    root.querySelector('section').setAttribute('aria-busy', 'false');
    instruction.textContent = mode === 'pop' ? `Pukkaszd ki az összes ${exercise.target} betűt!` : mode === 'match' ? 'Nézd meg a mintát! Melyik a párja?' : 'Figyelj a hangra! Melyik betűt hallottad?';
    root.querySelector('#reference').textContent = mode === 'match' ? exercise.target : '';
    root.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    root.querySelectorAll('[data-level]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.level) === difficulty)));
    feedback.textContent = 'Érints meg egy felhőt!'; next.hidden = true;
    readTask();
    const choices = root.querySelector('.letter-clouds'); choices.replaceChildren();
    exercise.choices.forEach(choice => {
      const button = document.createElement('button'); button.className = 'letter-cloud'; button.textContent = choice.label; button.setAttribute('aria-label', `${choice.label} betű`);
      button.addEventListener('click', () => {
        const response = game.handleInput(choice.id); if (response.ignored) return;
        button.classList.remove('wiggle'); void button.offsetWidth;
        if (!response.correct) { button.classList.add('wiggle'); feedback.textContent = 'Próbáld meg egy másik felhővel! 🌱'; return; }
        button.disabled = true; button.classList.add('found');
        feedback.textContent = response.completed ? 'Megtaláltad! Szép felfedezés! ⭐' : 'Ez az! Keresd meg a többit is!';
        if (response.completed) {
          const saved = saveResult(game.finish());
          if (!saved) feedback.textContent += ' Most együtt örülünk a sikernek!';
          next.hidden = false;
          advanceTimer = setTimeout(() => next.click(), 1200);
        }
      }); choices.append(button);
    });
  }
  root.querySelector('.home').addEventListener('click', home);
  root.querySelector('.help').addEventListener('click', readTask);
  root.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode; start(); }));
  root.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click', () => { difficulty = Number(button.dataset.level); start(); }));
  next.addEventListener('click', start); start();
  return () => { clearTimeout(advanceTimer); destroyed = true; generation++; game.destroy(); };
}
