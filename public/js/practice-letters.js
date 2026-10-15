const KEY = 'zorka.practiceLetters.v1';
export function writingThreshold() { try { const value=Number(localStorage.getItem('zorka.writingThreshold.v1')); return Number.isInteger(value)&&value>=1&&value<=100?value:70; } catch { return 70; } }
export function rememberWritingThreshold(value) { if(!Number.isInteger(value)||value<1||value>100)return;try { localStorage.setItem('zorka.writingThreshold.v1',String(value)); } catch { /* Local storage may be unavailable. */ } }
export function practiceLetters() {
  try { const value = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(value) && value.length ? value : null; } catch { return null; }
}
export function rememberLetters(letters) {
  try { if (letters?.length) localStorage.setItem(KEY, JSON.stringify(letters)); else localStorage.removeItem(KEY); } catch { /* Browser storage may be unavailable. */ }
}
export function canRead(text, letters = practiceLetters()) {
  return !letters || (text.toLocaleUpperCase('hu').match(/DZS|DZ|CS|GY|LY|NY|SZ|TY|ZS|[A-ZÁÉÍÓÖŐÚÜŰ]/gu) ?? []).every(letter => letters.includes(letter));
}

export function writingCoverage() { try { const value=Number(localStorage.getItem('zorka.writingCoverage.v1')); return Number.isInteger(value)&&value>=1&&value<=100?value:writingThreshold(); } catch { return writingThreshold(); } }
export function rememberWritingCoverage(value) { if(!Number.isInteger(value)||value<1||value>100)return;try { localStorage.setItem('zorka.writingCoverage.v1',String(value)); } catch {} }
