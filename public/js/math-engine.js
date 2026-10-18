import { shuffle } from './engine.js';

const LEVELS = {
  1: { max: 10, choices: 3 },
  2: { max: 20, choices: 4 },
  3: { max: 50, choices: 4 },
};

export function createMathExercise({ mode = 'mixed', difficulty = 1, random = Math.random } = {}) {
  if (!['add','subtract','mixed'].includes(mode)) throw new Error('Invalid math mode');
  const level = LEVELS[difficulty] ?? LEVELS[1];
  const operation = mode === 'mixed' ? (random() < .5 ? 'add' : 'subtract') : mode;
  let left, right, expected;
  if (operation === 'add') {
    left = Math.floor(random() * (level.max + 1));
    right = Math.floor(random() * (level.max - left + 1));
    expected = left + right;
  } else {
    left = Math.floor(random() * (level.max + 1));
    right = Math.floor(random() * (left + 1));
    expected = left - right;
  }
  const pool = [];
  for (let delta = 1; pool.length < level.choices - 1; delta++) {
    for (const value of [expected - delta, expected + delta]) {
      if (value >= 0 && value <= level.max && value !== expected && !pool.includes(value)) pool.push(value);
      if (pool.length >= level.choices - 1) break;
    }
  }
  return {
    id: `math-${globalThis.crypto?.randomUUID?.() ?? Date.now() + '-' + random()}`,
    module: 'math', mode, operation, difficulty, skill: `math:${operation}:${level.max}`,
    left, right, expected: String(expected), choices: shuffle([expected, ...pool].map(String), random),
  };
}

export class MathGame {
  init({ now = () => performance.now() } = {}) { this.now = now; }
  start(exercise) { this.exercise = exercise; this.startedAt = this.now(); this.responses = []; this.completed = false; }
  handleInput(value) {
    if (this.completed) return { ignored: true };
    const correct = String(value) === String(this.exercise.expected);
    this.responses.push({ value: String(value), correct, responseTimeMs: Math.max(0, Math.round(this.now() - this.startedAt)) });
    this.completed = correct;
    return { correct, completed: correct };
  }
  finish() {
    if (!this.completed) return null;
    return { exerciseId:this.exercise.id, serverIssued:!!this.exercise.serverIssued, module:'math', skill:this.exercise.skill, expectedAnswer:this.exercise.expected, givenAnswer:this.responses.map(r=>r.value), responses:this.responses, correct:this.responses.every(r=>r.correct), completed:true, attempts:this.responses.length, responseTimeMs:Math.max(0,Math.round(this.now()-this.startedAt)), difficulty:this.exercise.difficulty };
  }
  destroy() { this.exercise = null; this.responses = []; }
}
