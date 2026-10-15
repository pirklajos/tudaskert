export function speak(text) {
  if (!('speechSynthesis' in globalThis) || !('SpeechSynthesisUtterance' in globalThis)) return false;
  try {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hu-HU'; utterance.rate = 0.85;
    const voice = speechSynthesis.getVoices().find(item => item.lang.startsWith('hu') && item.localService);
    if (!voice) return false;
    utterance.voice = voice;
    speechSynthesis.speak(utterance); return true;
  } catch { return false; }
}
export function stopSpeech() { globalThis.speechSynthesis?.cancel(); }
