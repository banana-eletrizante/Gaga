import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';

import { useAssistiveCamera } from './src/hooks/useAssistiveCamera';
import { AccessibleButton } from './src/components/AccessibleButton';
import { theme } from './src/styles/theme';

export default function App() {
  const {
    permission,
    requestPermission,
    isAnalyzing,
    resultText,
    cameraRef,
    captureAndAnalyze,
  } = useAssistiveCamera();

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.loading} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.permissionText}>
          O aplicativo precisa de acesso à câmera para analisar o seu ambiente.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
          accessible={true}
          accessibilityLabel="Conceder acesso à câmera"
          accessibilityRole="button"
        >
          <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Preview da Câmera isolado sem filhos */}
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} facing="back" />
      
      {/* 2. Camada de botão sobreposta de forma absoluta */}
      <View style={StyleSheet.absoluteFillObject}>
        <AccessibleButton
          onPress={captureAndAnalyze}
          disabled={isAnalyzing}
          label="Analisar cenário"
          hint="Dê dois toques na tela para tirar uma foto do ambiente e ouvir a descrição."
        >
          {isAnalyzing ? (
            <View style={styles.overlayContainer}>
              <ActivityIndicator size="large" color={theme.colors.loading} />
              <Text style={styles.overlayText}>Processando imagem...</Text>
            </View>
          ) : (
            <View style={styles.overlayContainer}>
              <Text style={styles.instructionText}>
                Toque na tela para analisar o ambiente
              </Text>
              {resultText !== '' && (
                <Text style={styles.resultText} numberOfLines={8}>
                  {resultText}
                </Text>
              )}
            </View>
          )}
        </AccessibleButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.large,
  },
  permissionText: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  permissionButton: {
    backgroundColor: '#0055ff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minHeight: theme.touchTarget.minHeight,
    justifyContent: 'center',
  },
  permissionButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 50,
    paddingHorizontal: theme.spacing.medium,
  },
  overlayText: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: theme.spacing.medium,
    textAlign: 'center',
  },
  instructionText: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: theme.colors.overlay,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: theme.spacing.medium,
  },
  resultText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: theme.spacing.medium,
    borderRadius: 8,
    maxWidth: '95%',
  },
});