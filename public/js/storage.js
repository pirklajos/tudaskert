import { submitResult } from './api.js';
import { STATISTICS_RESET_AT } from './statistics-reset.js';
const KEY = 'zorka.practice.v1';
export function loadResults() {
  try { const value = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(value) ? value.filter(item=>!STATISTICS_RESET_AT||item.createdAt>STATISTICS_RESET_AT) : []; } catch { return []; }
}
export function saveResult(result) {
  const entry = { ...result, responses: result.responses?.map(({strokes, ...response}) => response), createdAt: new Date().toISOString(), synced: false };
  let stored = false;
  try { localStorage.setItem(KEY, JSON.stringify([...loadResults(), entry].slice(-1000))); stored = true; } catch { /* Memory-only use is allowed. */ }
  void submitResult(result).then(synced => {
    if (!synced) return;
    try { localStorage.setItem(KEY, JSON.stringify(loadResults().map(item => item.exerciseId === result.exerciseId ? { ...item, synced: true } : item))); } catch { /* Server already saved it. */ }
  });
  return stored;
}

export async function syncPendingResults() {
  const pending = loadResults().filter(item => item.serverIssued && !item.synced && item.module !== 'writing');
  for (const result of pending) {
    if (!await submitResult(result)) break;
    try { localStorage.setItem(KEY, JSON.stringify(loadResults().map(item => item.exerciseId === result.exerciseId ? { ...item, synced: true } : item))); } catch { return; }
  }
}
if (typeof window !== 'undefined') window.addEventListener('online', () => { void syncPendingResults(); });
