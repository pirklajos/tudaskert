import { rememberLetters, rememberWritingThreshold, rememberWritingCoverage } from './practice-letters.js';
let identity = null;
let connecting = null;

async function request(path, { method = 'GET', body, token } = {}) {
  if (navigator.onLine === false) throw new Error('Offline');
  const response = await fetch(`/api${path}`, {
    method, credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(2500),
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json', 'X-CSRF-Token': token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) throw new Error('API unavailable');
  return response.json();
}

async function connect() {
  if (identity) return identity;
  if (!connecting) connecting = (async () => {
    const current = await request('/child/current');
    rememberLetters(current.practiceLetters);
    rememberWritingThreshold(current.writingThreshold); rememberWritingCoverage(current.writingCoverage);
    const session = await request('/sessions', { method: 'POST', body: { deviceType: innerWidth < 600 ? 'phone' : innerWidth < 1100 ? 'tablet' : 'desktop' }, token: current.csrfToken });
    identity = { token: current.csrfToken, sessionId: session.id };
    return identity;
  })().finally(() => { connecting = null; });
  return connecting;
}

export async function getExercise(options, fallback) {
  try {
    await connect();
    const result = await request(`/exercises/next?${new URLSearchParams(options)}`);
    if (result.unavailable && result.module === options.module) return result;
    if (!result.serverIssued || !result.id || result.module !== options.module) throw new Error('Invalid exercise');
    return result;
  } catch { identity = null; return fallback(); }
}

export async function submitResult(result) {
  if (!result.serverIssued) return false;
  try {
    const context = await connect();
    await request('/attempts', { method: 'POST', body: { exerciseId: result.exerciseId, responses: result.responses, responseTimeMs: result.responseTimeMs }, token: context.token });
    return true;
  } catch { identity = null; return false; }
}

export async function finishSession() {
  if (!identity) return;
  const context = identity; identity = null;
  try { await request(`/sessions/${context.sessionId}/finish`, { method: 'PATCH', body: {}, token: context.token }); } catch { /* Local practice remains available. */ }
}

export async function parentChallenge() { await connect(); return request('/parent/challenge'); }
export async function loadPracticeLetters() { try { await connect(); } catch { /* Use the saved offline selection. */ } }
export async function unlockParent(answer) { const context = await connect(); return request('/parent/unlock', { method: 'POST', body: { answer }, token: context.token }); }
export async function parentProgress() { await connect(); return request('/progress'); }
export async function parentLetters() { await connect(); const result = await request('/parent/letters'); rememberLetters(result.letters); rememberWritingThreshold(result.writingThreshold); rememberWritingCoverage(result.writingCoverage); return result; }
export async function saveWritingThreshold(acceptancePercent, coveragePercent) { const context=await connect();const result=await request('/parent/writing',{method:'PUT',body:{acceptancePercent,coveragePercent},token:context.token});rememberWritingThreshold(result.writingThreshold); rememberWritingCoverage(result.writingCoverage);return result; }
export async function saveParentLetters(letters) { const context = await connect(); const result = await request('/parent/letters', { method: 'PUT', body: { letters }, token: context.token }); rememberLetters(result.letters); return result; }
export async function lockParent() {
  try { const context = await connect(); await request('/parent/lock', { method: 'POST', body: {}, token: context.token }); } catch { /* The server gate also expires after 15 minutes. */ }
}
export async function getRewards() { try { await connect(); return (await request('/rewards')).rewards; } catch { return null; } }
export async function getWorld() { try { return await request('/world'); } catch { return null; } }
