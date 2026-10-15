import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { LETTERS, HUNGARIAN_UNITS } from '../public/js/content.js';
import { WORDS } from '../public/js/words-content.js';
import { TRACES } from '../public/js/writing-content.js';
import { TRACE_CONFIG } from '../public/js/writing-engine.js';
import { REWARDS } from '../public/js/rewards-content.js';
import { READINGS } from '../public/js/reading-content.js';
const path = new URL('../public/data/learning.json', import.meta.url);
const content = JSON.stringify({ letters: LETTERS, units: HUNGARIAN_UNITS, words: WORDS, traces: TRACES, traceConfig: TRACE_CONFIG, rewards: REWARDS, readings: READINGS }, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(path, 'utf8') !== content) throw new Error('Run node scripts/export-content.mjs');
} else {
  mkdirSync(new URL('../public/data/', import.meta.url), { recursive: true });
  writeFileSync(path, content);
}
