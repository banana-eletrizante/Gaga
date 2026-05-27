import * as Speech from 'expo-speech';

export const SpeechService = {
  speak: async (text) => {
    try {
      await Speech.stop();
      Speech.speak(text, {
        language: 'pt-BR',
        pitch: 1.0,
        rate: 1.0,
      });
    } catch (error) {
      console.error('Erro no SpeechService:', error);
    }
  },

  stop: async () => {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Erro ao parar fala:', error);
    }
  }
};