import { LETTERS } from './content.js';

export function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createCloudExercise({ mode = 'find', difficulty = 1, random = Math.random, letters = LETTERS } = {}) {
  if (!['find','pop','match'].includes(mode) || ![1,2,3].includes(difficulty) || letters.length < 1) throw new Error('Invalid exercise configuration');
  const target = letters[Math.floor(random() * letters.length)];
  const count = [3,4,6][difficulty - 1];
  const others = shuffle(letters.filter(letter => letter !== target), random).slice(0, count - 1);
  const values = mode === 'pop' ? [target, target, ...others] : [target, ...others];
  const choices = shuffle(values, random).map((value, index) => ({ id: String(index), value, label: difficulty === 3 && index % 2 ? value.toLocaleLowerCase('hu') : value }));
  return { id: `clouds-${globalThis.crypto?.randomUUID?.() ?? Date.now() + '-' + random()}`, module: 'clouds', skill: `letter:${target}`, mode, difficulty, target, choices };
}

export class CloudGame {
  init({ now = () => performance.now() } = {}) { this.now = now; }
  start(exercise) { this.exercise = exercise; this.startedAt = this.now(); this.inputs = []; this.selected = new Set(); this.completed = false; }
  handleInput(id) {
    if (this.completed || this.selected.has(id)) return { ignored: true };
    const choice = this.exercise.choices.find(item => item.id === id);
    if (!choice) return { ignored: true };
    const correct = choice.value === this.exercise.target;
    this.inputs.push({ id, value: choice.value, correct, responseTimeMs: Math.max(0, Math.round(this.now() - this.startedAt)) });
    if (correct) this.selected.add(id);
    const needed = this.exercise.mode === 'pop' ? this.exercise.choices.filter(item => item.value === this.exercise.target).length : 1;
    this.completed = this.selected.size === needed;
    return { correct, completed: this.completed };
  }
  finish() {
    if (!this.completed) return null;
    return { exerciseId: this.exercise.id, serverIssued: !!this.exercise.serverIssued, module: 'clouds', skill: this.exercise.skill, expectedAnswer: this.exercise.target, givenAnswer: this.inputs.map(item => item.value), correct: this.inputs.every(item => item.correct), completed: true, attempts: this.inputs.length, responses: this.inputs, responseTimeMs: Math.max(0, Math.round(this.now() - this.startedAt)), difficulty: this.exercise.difficulty };
  }
  destroy() { this.exercise = null; this.inputs = []; this.selected.clear(); }
}
