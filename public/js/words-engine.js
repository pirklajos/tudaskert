import { WORDS } from './words-content.js';
import { HUNGARIAN_UNITS } from './content.js';
import { shuffle } from './engine.js';
export function createWordExercise({mode = 'initial', random = Math.random, entry, letters = null} = {}) {
  if (!['initial','pair','build','type'].includes(mode)) throw new Error('Invalid word mode');
  const words = WORDS.filter(item => !letters || (mode === 'initial' ? item.units.slice(0,1) : item.units).every(unit => letters.includes(unit.toLocaleUpperCase('hu'))));
  if (!words.length) return {module:'words',unavailable:true};
  entry ??= words[Math.floor(random()*words.length)];
  const expected = mode === 'initial' ? entry.units[0].toLocaleUpperCase('hu') : entry.word;
  let choices;
  if (mode === 'initial') choices = shuffle([expected,...shuffle((letters ?? HUNGARIAN_UNITS).filter(unit => unit !== expected),random).slice(0,3)],random);
  else if (mode === 'pair') choices = shuffle([expected,...shuffle(words.filter(item => item.word !== expected),random).slice(0,3).map(item => item.word)],random);
  else choices = mode === 'build' ? shuffle(entry.units,random) : [...new Set([...entry.units,...shuffle(letters ? letters.map(letter=>letter.toLocaleLowerCase('hu')) : ['a','e','i','o','ö','u','ü','á','é','k','l','m','n','s','t'],random).slice(0,4)])];
  return {id:`words-${globalThis.crypto?.randomUUID?.() ?? Date.now() + '-' + random()}`,module:'words',skill:entry.id,mode,difficulty:mode === 'initial' ? 1 : 2,entry,expected,choices};
}
export class WordGame {
  init({now = () => performance.now()} = {}) {this.now = now;}
  start(exercise) {this.exercise=exercise;this.startedAt=this.now();this.responses=[];this.completed=false;}
  handleInput(value) {
    if(this.completed) return {ignored:true};
    const correct=value.normalize('NFC').toLocaleLowerCase('hu') === this.exercise.expected.normalize('NFC').toLocaleLowerCase('hu');
    this.responses.push({value,correct,responseTimeMs:Math.max(0,Math.round(this.now()-this.startedAt))});this.completed=correct;
    return {correct,completed:correct};
  }
  finish() {return this.completed ? {exerciseId:this.exercise.id,serverIssued:!!this.exercise.serverIssued,module:this.exercise.module,skill:this.exercise.skill,expectedAnswer:this.exercise.expected,givenAnswer:this.responses.map(item=>item.value),responses:this.responses,correct:this.responses.every(item=>item.correct),completed:true,attempts:this.responses.length,responseTimeMs:Math.max(0,Math.round(this.now()-this.startedAt)),difficulty:this.exercise.difficulty} : null;}
  destroy() {this.exercise=null;this.responses=[];}
}
