import test from 'node:test';
import assert from 'node:assert/strict';
import {createCloudExercise} from '../public/js/engine.js';
import {createWordExercise} from '../public/js/words-engine.js';
import {canRead} from '../public/js/practice-letters.js';
test('a single learned letter and Hungarian multigraphs remain solvable',()=>{
  for(const mode of ['find','pop','match']){
    const exercise=createCloudExercise({mode,letters:['NY'],difficulty:3});
    assert.equal(exercise.target,'NY');assert.ok(exercise.choices.every(choice=>choice.value==='NY'));
  }
  assert.equal(createWordExercise({mode:'build',letters:['A']}).unavailable,true);
  const initial=createWordExercise({mode:'initial',letters:['A']});
  assert.deepEqual(initial.choices,['A']);
  const word=createWordExercise({mode:'build',letters:['A','NY']});
  assert.equal(word.entry.word,'anya');
  assert.equal(canRead('A nyár.', ['A','NY','Á','R']),true);
  assert.equal(canRead('A nyár.', ['A','N','Y','Á','R']),false);
});
