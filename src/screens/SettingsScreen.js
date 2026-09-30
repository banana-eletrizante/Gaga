import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AccessibleButton } from '../components/AccessibleButton';
import { theme } from '../styles/theme';
import { SpeechService } from '../services/speech';
import { useSettings } from '../context/SettingsContext';

const Row = ({ label, value, hint, onPress }) => (
  <AccessibleButton
    label={`${label}. ${value}`}
    hint={hint}
    onPress={onPress}
    style={styles.row}
  >
    <View style={styles.rowInner}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </AccessibleButton>
);

export const SettingsScreen = ({ onBack }) => {
  const { settings, updateSettings } = useSettings();

  const cycleRate = async () => {
    const options = [0.75, 0.95, 1.15];
    const index = options.findIndex((value) => Math.abs(value - settings.speechRate) < 0.01);
    const next = options[(index + 1) % options.length];
    await updateSettings({ speechRate: next });
    const label = next < 0.8 ? 'lenta' : next > 1 ? 'rápida' : 'normal';
    await SpeechService.speak(`Velocidade da voz ${label}.`, { rate: next, pitch: settings.speechPitch });
  };

  const toggle = async (key, spokenOn, spokenOff) => {
    const next = !settings[key];
    await updateSettings({ [key]: next });
    await SpeechService.speak(next ? spokenOn : spokenOff, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          Configurações
        </Text>

        <Row
          label="Velocidade da voz"
          value={settings.speechRate < 0.8 ? 'Lenta' : settings.speechRate > 1 ? 'Rápida' : 'Normal'}
          hint="Toque para alternar entre lenta, normal e rápida."
          onPress={cycleRate}
        />
        <Row
          label="Falar ao abrir o app"
          value={settings.announceOnStart ? 'Ligado' : 'Desligado'}
          hint="Toque para ligar ou desligar o anúncio inicial."
          onPress={() =>
            toggle('announceOnStart', 'Anúncio inicial ligado.', 'Anúncio inicial desligado.')
          }
        />
        <Row
          label="Sacudir para descrever"
          value={settings.shakeToDescribe ? 'Ligado' : 'Desligado'}
          hint="Toque para ligar ou desligar o gesto de sacudir o celular."
          onPress={() =>
            toggle('shakeToDescribe', 'Sacudir para descrever ligado.', 'Sacudir para descrever desligado.')
          }
        />
        <Row
          label="Incluir localização no status"
          value={settings.includeLocationInStatus ? 'Ligado' : 'Desligado'}
          hint="Quando ligado, o status tenta dizer a rua e o bairro."
          onPress={() =>
            toggle(
              'includeLocationInStatus',
              'Localização no status ligada.',
              'Localização no status desligada.'
            )
          }
        />

        <AccessibleButton
          label="Voltar para a câmera"
          hint="Fecha as configurações."
          onPress={onBack}
          style={styles.back}
        >
          <Text style={styles.backText}>Voltar</Text>
        </AccessibleButton>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.large,
    gap: theme.spacing.medium,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: theme.spacing.small,
  },
  row: {
    width: '100%',
    minHeight: 72,
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    alignItems: 'stretch',
  },
  rowInner: {
    width: '100%',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
  },
  rowLabel: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  rowValue: {
    color: theme.colors.accentAlt,
    fontSize: 16,
    marginTop: 4,
  },
  back: {
    marginTop: theme.spacing.large,
    backgroundColor: theme.colors.accent,
    borderRadius: 16,
    minHeight: 64,
    width: '100%',
  },
  backText: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
});
