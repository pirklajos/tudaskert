import test from 'node:test';
import assert from 'node:assert/strict';
import {WORDS} from '../public/js/words-content.js';
import {createWordExercise,WordGame} from '../public/js/words-engine.js';
test('20 data-driven words preserve Hungarian letter units',()=>{
  assert.equal(WORDS.length,20);
  for(const entry of WORDS){assert.equal(entry.units.join(''),entry.word);for(const mode of ['initial','pair','build','type']){
    const exercise=createWordExercise({entry,mode});
    if(['initial','pair'].includes(mode))assert.ok(exercise.choices.includes(exercise.expected));
    else for(const unit of entry.units)assert.ok(exercise.choices.includes(unit));
  }}
  assert.deepEqual(WORDS.find(item=>item.word==='anya').units,['a','ny','a']);
});
test('word evaluation normalizes accents and retains mistakes',()=>{
  const game=new WordGame();game.init({now:()=>100});game.start(createWordExercise({mode:'pair',entry:WORDS.find(item=>item.word==='béka')}));
  assert.equal(game.handleInput('beka').correct,false);assert.equal(game.finish(),null);
  assert.equal(game.handleInput('BE\u0301KA').completed,true);assert.equal(game.finish().correct,false);assert.equal(game.finish().attempts,2);
  assert.equal(game.handleInput('béka').ignored,true);
});
