import React from 'react';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { useAssistiveCamera } from './src/hooks/useAssistiveCamera';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const AppShell = () => {
  const { settings, ready } = useSettings();
  const assistive = useAssistiveCamera(ready ? settings : null);

  if (assistive.screen === 'settings') {
    return <SettingsScreen onBack={() => assistive.setScreen('home')} />;
  }

  return (
    <HomeScreen
      {...assistive}
      openSettings={() => assistive.setScreen('settings')}
    />
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <AppShell />
    </SettingsProvider>
  );
}
