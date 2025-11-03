// Lightweight Web Speech API adapter for in-browser TTS
// Provides: isAvailable(), listVoices(), speak(text, voiceName), cancel()

export function isAvailable() {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
}

function normalizeVoice(v) {
  return {
    Id: v.name + (v.lang ? `-${v.lang}` : ''),
    Name: v.name,
    LanguageCode: v.lang || '',
    Gender: v.voiceURI || '',
    _raw: v,
  };
}

export function listVoices() {
  if (!isAvailable()) return [];
  // speechSynthesis.getVoices() may be empty initially; return current list
  const raw = window.speechSynthesis.getVoices() || [];
  return raw.map(normalizeVoice);
}

let _currentUtterance = null;

export function speak(text, voiceNameOrId, options = {}) {
  if (!isAvailable()) return Promise.reject(new Error('Web Speech API not available'));
  if (!text) return Promise.resolve();

  return new Promise((resolve, reject) => {
    try {
      // pick voice by Name or Id
      const voices = window.speechSynthesis.getVoices() || [];
      let voice = voices.find((v) => v.name === voiceNameOrId || (v.name + (v.lang ? `-${v.lang}` : '')) === voiceNameOrId);

      const utter = new SpeechSynthesisUtterance(text);
      if (voice) utter.voice = voice;
      if (options.rate) utter.rate = options.rate;
      if (options.pitch) utter.pitch = options.pitch;
      if (options.volume) utter.volume = options.volume;

      utter.onend = () => {
        _currentUtterance = null;
        resolve();
      };
      utter.onerror = (e) => {
        _currentUtterance = null;
        reject(e);
      };

      _currentUtterance = utter;
      window.speechSynthesis.cancel(); // stop any existing
      window.speechSynthesis.speak(utter);
    } catch (e) {
      _currentUtterance = null;
      reject(e);
    }
  });
}

export function cancel() {
  if (!isAvailable()) return;
  window.speechSynthesis.cancel();
  _currentUtterance = null;
}
