import test from 'node:test';
import assert from 'node:assert/strict';
import { createCloudExercise, CloudGame, shuffle } from '../public/js/engine.js';
import { HUNGARIAN_UNITS } from '../public/js/content.js';

test('each mode and level supplies solvable unique-id choices', () => {
  for (const mode of ['find','pop','match']) for (const difficulty of [1,2,3]) for (let n = 0; n < 100; n++) {
    const exercise = createCloudExercise({mode,difficulty});
    assert.equal(new Set(exercise.choices.map(item => item.id)).size, exercise.choices.length);
    assert.equal(exercise.choices.filter(item => item.value === exercise.target).length, mode === 'pop' ? 2 : 1);
  }
});
test('mistakes are recorded, retry completes without hiding errors', () => {
  let time = 0; const game = new CloudGame(); game.init({now: () => time});
  game.start(createCloudExercise()); time = 100;
  assert.equal(game.finish(), null);
  assert.equal(game.handleInput('missing').ignored, true);
  assert.equal(game.handleInput(game.exercise.choices.find(item => item.value !== game.exercise.target).id).correct, false);
  time = 250;
  assert.equal(game.handleInput(game.exercise.choices.find(item => item.value === game.exercise.target).id).completed, true);
  const result = game.finish(); assert.equal(result.correct, false); assert.equal(result.completed, true); assert.equal(result.attempts, 2); assert.equal(result.responseTimeMs, 250);
});
test('pop requires every target and ignores duplicate taps', () => {
  const game = new CloudGame(); game.init(); game.start(createCloudExercise({mode:'pop'}));
  const targets = game.exercise.choices.filter(item => item.value === game.exercise.target);
  assert.equal(game.handleInput(targets[0].id).completed, false);
  assert.equal(game.handleInput(targets[0].id).ignored, true);
  assert.equal(game.handleInput(targets[1].id).completed, true);
  assert.equal(game.finish().attempts, 2); assert.equal(game.finish().correct, true);
});
test('Hungarian digraphs stay single learning units', () => {
  const exercise = createCloudExercise({letters:['DZS','CS','GY','SZ'],random: () => 0});
  assert.equal(exercise.target,'DZS'); assert.ok(HUNGARIAN_UNITS.includes('DZS'));
  assert.ok(exercise.choices.some(item => item.value === 'DZS'));
});
test('shuffle preserves input and configuration is validated', () => {
  const input = ['A','B','C']; assert.deepEqual(shuffle(input, () => 0).sort(), [...input].sort()); assert.deepEqual(input,['A','B','C']);
  assert.throws(() => createCloudExercise({difficulty:4}));
});
