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
    checkStatus,
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
      {/* 1. Preview da câmera isolado em segundo plano */}
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} facing="back" />
      
      {/* 2. Camada de interface dividida em duas metades (50% / 50%) */}
      <View style={StyleSheet.absoluteFillObject}>
        
        {/* Metade Superior: Análise de Imagem (Gemini) */}
        <AccessibleButton
          onPress={captureAndAnalyze}
          disabled={isAnalyzing}
          label="Descrever cenário à frente"
          hint="Toque na metade superior para tirar uma foto do ambiente e ouvir a descrição."
        >
          <View style={styles.halfOverlayContainer}>
            <Text style={styles.instructionText}>
              Metade Superior: Descrever cenário
            </Text>
          </View>
        </AccessibleButton>

        {/* Metade Inferior: Status e Luminosidade */}
        <AccessibleButton
          onPress={checkStatus}
          disabled={isAnalyzing}
          label="Verificar bateria e iluminação"
          hint="Toque na metade inferior para ouvir o nível da bateria e se as luzes estão acesas."
        >
          <View style={styles.halfOverlayContainer}>
            <Text style={styles.instructionText}>
              Metade Inferior: Verificar bateria e luzes
            </Text>
            {resultText !== '' && (
              <Text style={styles.resultText} numberOfLines={5}>
                {resultText}
              </Text>
            )}
          </View>
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
  halfOverlayContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', // Escurecimento para garantir legibilidade
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', // Linha divisória sutil entre as metades
    paddingHorizontal: theme.spacing.medium,
  },
  instructionText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: theme.colors.overlay,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: theme.spacing.small,
  },
  resultText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: theme.spacing.medium,
    borderRadius: 8,
    maxWidth: '95%',
    marginTop: theme.spacing.small,
  },
});