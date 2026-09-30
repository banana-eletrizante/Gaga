import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

/**
 * Chave do Gemini.
 * Ordem: EXPO_PUBLIC_GEMINI_API_KEY > extra.geminiApiKey no app.json > fallback vazio.
 * Nunca commite uma chave real. Use .env com EXPO_PUBLIC_GEMINI_API_KEY.
 */
export const ENV = {
  GEMINI_API_KEY:
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    extra.geminiApiKey ||
    '',
  GEMINI_MODELS: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'],
};
