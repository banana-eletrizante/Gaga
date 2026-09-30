import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@gaga/settings/v1';
const HISTORY_KEY = '@gaga/history/v1';
const MAX_HISTORY = 12;

export const DEFAULT_SETTINGS = {
  speechRate: 0.95,
  speechPitch: 1.0,
  announceOnStart: true,
  shakeToDescribe: true,
  includeLocationInStatus: false,
  highContrastLabels: true,
  onboardingDone: false,
};

export const StorageService = {
  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (error) {
      console.error('Erro ao ler configurações:', error);
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings: async (settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  },

  loadHistory: async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Erro ao ler histórico:', error);
      return [];
    }
  },

  pushHistory: async (entry) => {
    try {
      const current = await StorageService.loadHistory();
      const next = [entry, ...current].slice(0, MAX_HISTORY);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    } catch (error) {
      console.error('Erro ao gravar histórico:', error);
      return [];
    }
  },
};
