import { parentChallenge, unlockParent, parentProgress, lockParent, parentLetters, saveParentLetters, saveWritingThreshold } from './api.js';

const MODULE_NAMES = { clouds: 'Betűfelhők', words: 'Szóház', writing: 'Íráskert', reading: 'Olvasásfa' };
const percent = (correct, total) => total ? `${Math.round(correct / total * 100)}%` : '—';
const seconds = value => `${(value / 1000).toLocaleString('hu-HU', { maximumFractionDigits: 1 })} mp`;
const skillName = key => key.replace('letter:', 'Betű: ').replace('word:', 'Szó: ').replace('trace:', 'Írás: ');

function appendTable(container, headers, rows) {
  if (!rows.length) { const empty = document.createElement('p'); empty.textContent = 'Itt még nincs gyakorlási adat.'; container.append(empty); return; }
  const wrap = document.createElement('div'); wrap.className = 'table-wrap';
  const table = document.createElement('table'); const head = table.createTHead().insertRow();
  headers.forEach(label => { const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = label; head.append(cell); });
  const body = table.createTBody();
  rows.forEach(values => { const row = body.insertRow(); values.forEach(value => { const cell = row.insertCell(); cell.textContent = value; }); });
  wrap.append(table); container.append(wrap);
}

export function showParent(root, home) {
  let destroyed = false;
  root.innerHTML = `<section class="activity parent-view"><div class="activity-top"><button class="home" aria-label="Vissza az erdei világba">🍃 ← Haza</button><span>Szülői mód</span></div><h1 tabindex="-1">Egy pillanat a felnőtteknek</h1><p class="gate-intro">A tanult betűk beállításához és a haladás megtekintéséhez oldd meg az ellenőrző feladatot.</p><form class="parent-gate"><label for="parent-answer" class="challenge">Érkezik az ellenőrző feladat…</label><input id="parent-answer" type="number" inputmode="numeric" autocomplete="off" required aria-describedby="parent-message"><button class="primary" type="submit">Megnézem a haladást</button></form><p id="parent-message" class="feedback" role="status"></p><button class="retry-challenge" hidden>Új ellenőrző feladat</button><div class="dashboard" hidden></div></section>`;
  const form = root.querySelector('form'), message = root.querySelector('#parent-message'), retry = root.querySelector('.retry-challenge');
  const submit = form.querySelector('button'); submit.disabled = true;
  async function challenge() {
    submit.disabled = true; retry.hidden = true;
    try {
      const result = await parentChallenge(); if (destroyed) return;
      root.querySelector('.challenge').textContent = result.question; submit.disabled = false; message.textContent = '';
    } catch { if (destroyed) return; message.textContent = 'A szülői adatok most nem érhetők el. Próbáld meg később.'; retry.hidden = false; }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); submit.disabled = true;
    try {
      await unlockParent(Number(form.querySelector('input').value));
      const progress = await parentProgress(); if (destroyed) return;
      form.hidden = true; retry.hidden = true; message.textContent = '';
      root.querySelector('h1').textContent = 'Zorka felfedezései';
      root.querySelector('.gate-intro').textContent = 'Minden kis lépés a saját tempójában.';
      root.querySelector('h1').focus(); renderDashboard(root.querySelector('.dashboard'), progress);
      const settings = await parentLetters(); if (!destroyed) renderLetters(root.querySelector('.dashboard'), settings);
    } catch { if (destroyed) return; message.textContent = 'Nem sikerült a belépés. Ellenőrizd a választ, vagy kérj új feladatot.'; retry.hidden = false; }
    finally { if (!destroyed) submit.disabled = false; }
  });
  retry.addEventListener('click', challenge); root.querySelector('.home').addEventListener('click', home); challenge();
  return () => { destroyed = true; void lockParent(); };
}

function renderLetters(container, settings) {
  const writing = document.createElement('section');
  writing.innerHTML = `<h2>Íráskert elfogadási küszöbe</h2><p class="parent-note">A vonal pontosságát és a teljes betűminta lefedettségét is mérjük. Mindkét értéknek el kell érnie a saját, külön beállított küszöbét. A küszöb alatti eredmény újrapróbálást kér, az azt elérő vagy meghaladó eredmény elfogadott. A rövid, még nem értékelhető rajz 0%.</p><form class="writing-settings parent-gate"><label for="writing-threshold">Minimális vonalpontosság (1–100%)</label><input id="writing-threshold" type="number" min="1" max="100" step="1" required><label for="writing-coverage">Minimális mintalefedettség (1–100%)</label><input id="writing-coverage" type="number" min="1" max="100" step="1" required><button class="primary" type="submit">Írásbeállítás mentése</button><p class="writing-save-message" role="status"></p></form>`;
  writing.querySelector('#writing-threshold').value = settings.writingThreshold ?? 70;
  writing.querySelector('#writing-coverage').value = settings.writingCoverage ?? settings.writingThreshold ?? 70;
  writing.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault();const button=writing.querySelector('button'),message=writing.querySelector('.writing-save-message');button.disabled=true;
    try { await saveWritingThreshold(Number(writing.querySelector('#writing-threshold').value), Number(writing.querySelector('#writing-coverage').value));message.textContent='Mentve! A következő rajz ezt a küszöböt használja minden eszközön.'; }
    catch { message.textContent='Nem sikerült menteni. Próbáld újra!'; }
    finally { button.disabled=false; }
  });
  container.prepend(writing);
  const section = document.createElement('section');
  section.innerHTML = `<h2>Gyakorolható betűk</h2><p class="parent-note">Jelöld be a már tanult betűket. A Betűfelhőkben csak ezek jelennek meg; az Íráskertben ezek meglévő mintái választhatók. A Szóház és az Olvasásfa is a tanult betűkhöz illő feladatokat kínálja. Ha még nincs megfelelő szó vagy szöveg, ezt jelzi.</p><form class="letter-settings"><fieldset><legend>Már tanult betűk</legend><div class="parent-letters"></div></fieldset><div class="word-actions"><button type="button" class="select-all">Mindet kijelölöm</button><button type="button" class="clear-letters">Kijelölés törlése</button><button type="submit" class="primary">Betűk mentése</button></div><p role="status" class="letter-save-message"></p></form>`;
  const form = section.querySelector('form'), grid = section.querySelector('.parent-letters');
  settings.available.forEach(letter => {
    const label = document.createElement('label'), input = document.createElement('input');
    input.type = 'checkbox'; input.value = letter; input.checked = settings.letters === null || settings.letters.includes(letter);
    label.append(input, document.createTextNode(letter)); grid.append(label);
  });
  section.querySelector('.select-all').onclick = () => grid.querySelectorAll('input').forEach(input => { input.checked = true; });
  section.querySelector('.clear-letters').onclick = () => grid.querySelectorAll('input').forEach(input => { input.checked = false; });
  form.addEventListener('submit', async event => {
    event.preventDefault(); const message = section.querySelector('.letter-save-message');
    const letters = [...grid.querySelectorAll('input:checked')].map(input => input.value);
    if (!letters.length) { message.textContent = 'Válassz legalább egy betűt!'; return; }
    const button = form.querySelector('[type="submit"]'); button.disabled = true;
    try { await saveParentLetters(letters); message.textContent = 'Mentve! A következő betűgyakorlat már ezeket használja.'; }
    catch { message.textContent = 'Nem sikerült menteni. Ellenőrizd az internetkapcsolatot, és próbáld újra.'; }
    finally { button.disabled = false; }
  });
  container.prepend(section);
}

function renderDashboard(container, progress) {
  container.hidden = false;
  container.innerHTML = `<p class="parent-note">Az adatok az összes eszközön adatbázisba mentett gyakorlást összesítik. A javítás előtti tévesztések is szerepelnek; nincs pontlevonás vagy minősítés.</p><div class="stats-cards"></div><p class="last-practice"></p><section><h2>Legutóbbi gyakorlások – minden eszközről</h2><div class="recent-activity"></div></section><section><h2>Feladattípusok</h2><div class="module-stats"></div></section><section><h2>Betűk és készségek</h2><div class="skill-stats"></div></section><section><h2>Gyakoribb tévesztések</h2><div class="confusion-stats"></div></section><section><h2>Gyakorlás időben</h2><p class="parent-note">A napi bontás budapesti helyi idő szerint jelenik meg.</p><div class="history-stats"></div></section>`;
  const cards = [['Befejezett feladat', progress.completedExercises], ['Válaszok', progress.attempts], ['Aktív gyakorlás', seconds(progress.practiceTimeMs)], ['Átlagos válaszidő', seconds(progress.averageResponseTimeMs)]];
  cards.forEach(([label, value]) => { const card = document.createElement('div'); card.className = 'stats-card'; const strong = document.createElement('strong'); strong.textContent = value; const text = document.createElement('span'); text.textContent = label; card.append(strong, text); container.querySelector('.stats-cards').append(card); });
  container.querySelector('.last-practice').textContent = progress.lastPracticedAt ? `Utolsó gyakorlás: ${new Intl.DateTimeFormat('hu-HU', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Budapest' }).format(new Date(progress.lastPracticedAt))}` : 'Még nincs mentett gyakorlás.';
  appendTable(container.querySelector('.module-stats'), ['Helyszín', 'Válaszok', 'Helyes arány'], Object.entries(progress.modules).map(([key, value]) => [MODULE_NAMES[key] ?? key, value.attempts, percent(value.correct, value.attempts)]));
  const devices = {phone:'Telefon',tablet:'Tablet',desktop:'Számítógép',unknown:'Más eszköz'};
  appendTable(container.querySelector('.recent-activity'), ['Mikor', 'Eszköz', 'Gyakorlat', 'Válaszok', 'Helyes arány', 'Íráseredmény'], (progress.recentActivity ?? []).map(item => [new Intl.DateTimeFormat('hu-HU', {dateStyle:'short',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(item.practicedAt)), devices[item.deviceType] ?? 'Más eszköz', `${MODULE_NAMES[item.module] ?? item.module} · ${skillName(item.skill)}`, item.attempts, percent(item.correct,item.attempts), item.writingPercent == null ? '—' : `${item.writingPercent}%`]));
  appendTable(container.querySelector('.skill-stats'), ['Készség', 'Válaszok', 'Helyes arány', 'Átlagidő'], Object.entries(progress.skills).map(([key, value]) => [skillName(key), value.attempts, percent(value.correct, value.attempts), seconds(value.timeMs / value.attempts)]));
  appendTable(container.querySelector('.confusion-stats'), ['Várt válasz', 'Választott válasz', 'Alkalom'], progress.confusions.map(value => [value.expected, value.given, value.count]));
  appendTable(container.querySelector('.history-stats'), ['Nap', 'Válaszok', 'Helyes arány', 'Aktív idő'], Object.entries(progress.history).map(([key, value]) => [key, value.attempts, percent(value.correct, value.attempts), seconds(value.timeMs)]));
}
