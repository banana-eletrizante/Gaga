import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, StorageService } from '../services/storage';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    StorageService.loadSettings().then((loaded) => {
      setSettings(loaded);
      setReady(true);
    });
  }, []);

  const updateSettings = async (partial) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    await StorageService.saveSettings(next);
  };

  const value = useMemo(
    () => ({ settings, updateSettings, ready }),
    [settings, ready]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings precisa estar dentro de SettingsProvider');
  }
  return ctx;
};
