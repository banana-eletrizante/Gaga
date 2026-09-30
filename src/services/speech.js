import * as Speech from 'expo-speech';

let speaking = false;

export const SpeechService = {
  isSpeaking: () => speaking,

  speak: (text, options = {}) => {
    return new Promise((resolve) => {
      if (!text) {
        resolve();
        return;
      }

      const finish = () => {
        speaking = false;
        resolve();
      };

      Speech.stop()
        .catch(() => {})
        .finally(() => {
          speaking = true;
          Speech.speak(String(text), {
            language: options.language || 'pt-BR',
            pitch: options.pitch ?? 1.0,
            rate: options.rate ?? 0.95,
            onDone: finish,
            onStopped: finish,
            onError: finish,
          });
        });
    });
  },

  stop: async () => {
    try {
      speaking = false;
      await Speech.stop();
    } catch (error) {
      console.error('Erro ao parar fala:', error);
    }
  },
};
