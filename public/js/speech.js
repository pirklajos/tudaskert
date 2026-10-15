let voiceTimer;
let voicesReady;

export function speak(text) {
  if (!('speechSynthesis' in globalThis) || !('SpeechSynthesisUtterance' in globalThis)) return false;
  try {
    stopSpeech();
    const play = () => {
      clearTimeout(voiceTimer);
      if (voicesReady) speechSynthesis.removeEventListener('voiceschanged', voicesReady);
      voicesReady = null;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hu-HU'; utterance.rate = 0.85;
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(item => item.lang.startsWith('hu') && item.localService)
        ?? voices.find(item => item.lang.startsWith('hu'));
      if (voice) utterance.voice = voice;
      speechSynthesis.speak(utterance);
    };
    if (speechSynthesis.getVoices().length) play();
    else {
      voicesReady = play;
      speechSynthesis.addEventListener('voiceschanged', voicesReady);
      voiceTimer = setTimeout(play, 600);
    }
    return true;
  } catch { return false; }
}
export function stopSpeech() {
  clearTimeout(voiceTimer);
  if (voicesReady) globalThis.speechSynthesis?.removeEventListener('voiceschanged', voicesReady);
  voicesReady = null;
  globalThis.speechSynthesis?.cancel();
}
