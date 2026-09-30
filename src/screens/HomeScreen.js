import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView } from 'react-native';
import { CameraView } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { AccessibleButton } from '../components/AccessibleButton';
import { theme } from '../styles/theme';

export const HomeScreen = ({
  permission,
  requestPermission,
  isAnalyzing,
  resultText,
  cameraRef,
  torchOn,
  facing,
  captureAndAnalyze,
  checkStatus,
  repeatLast,
  toggleTorch,
  toggleFacing,
  openSettings,
}) => {
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.loading} />
        <Text style={styles.permissionText}>Preparando a câmera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.permissionText}>
          O Gaga precisa da câmera para descrever o ambiente, ler textos e avisar sobre obstáculos.
        </Text>
        <AccessibleButton
          style={styles.permissionButton}
          onPress={requestPermission}
          label="Conceder acesso à câmera"
          hint="Abre o pedido de permissão do sistema."
        >
          <Text style={styles.permissionButtonText}>Conceder permissão</Text>
        </AccessibleButton>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      <CameraView
        style={StyleSheet.absoluteFillObject}
        ref={cameraRef}
        facing={facing}
        enableTorch={torchOn}
        animateShutter={false}
      />

      <View style={styles.grid} pointerEvents="box-none">
        <View style={styles.row}>
          <AccessibleButton
            style={styles.quadrant}
            onPress={() => captureAndAnalyze('scene')}
            onLongPress={() => captureAndAnalyze('hazards')}
            label="Descrever cenário à frente"
            hint="Toque para ouvir a descrição. Toque longo para procurar obstáculos."
          >
            <Text style={styles.kicker}>Superior esquerdo</Text>
            <Text style={styles.quadrantTitle}>Descrever</Text>
            <Text style={styles.quadrantHint}>Toque longo: obstáculos</Text>
          </AccessibleButton>

          <AccessibleButton
            style={styles.quadrant}
            onPress={() => captureAndAnalyze('text')}
            onLongPress={() => captureAndAnalyze('colors')}
            label="Ler textos à frente"
            hint="Toque para ler placas, documentos e embalagens. Toque longo para ouvir as cores."
          >
            <Text style={styles.kicker}>Superior direito</Text>
            <Text style={styles.quadrantTitle}>Ler texto</Text>
            <Text style={styles.quadrantHint}>Toque longo: cores</Text>
          </AccessibleButton>
        </View>

        <View style={styles.row}>
          <AccessibleButton
            style={styles.quadrant}
            onPress={checkStatus}
            onLongPress={repeatLast}
            label="Ouvir hora, bateria e iluminação"
            hint="Toque para o status. Toque longo para repetir a última fala."
          >
            <Text style={styles.kicker}>Inferior esquerdo</Text>
            <Text style={styles.quadrantTitle}>Status</Text>
            <Text style={styles.quadrantHint}>Toque longo: repetir</Text>
          </AccessibleButton>

          <AccessibleButton
            style={styles.quadrant}
            onPress={toggleTorch}
            onLongPress={openSettings}
            label={torchOn ? 'Desligar lanterna' : 'Ligar lanterna'}
            hint="Toque para ligar ou desligar a lanterna. Toque longo abre as configurações."
          >
            <Text style={styles.kicker}>Inferior direito</Text>
            <Text style={styles.quadrantTitle}>{torchOn ? 'Lanterna on' : 'Lanterna'}</Text>
            <Text style={styles.quadrantHint}>Toque longo: ajustes</Text>
          </AccessibleButton>
        </View>
      </View>

      <View style={styles.footer} pointerEvents="box-none">
        {isAnalyzing ? (
          <View style={styles.badge}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.badgeText}>Analisando… toque de novo para parar</Text>
          </View>
        ) : resultText ? (
          <Text style={styles.resultText} numberOfLines={4}>
            {resultText}
          </Text>
        ) : null}

        <AccessibleButton
          style={styles.flipChip}
          onPress={toggleFacing}
          label="Alternar câmera frontal e traseira"
          hint="Vira a câmera."
        >
          <Text style={styles.flipText}>Virar câmera</Text>
        </AccessibleButton>
      </View>
    </View>
  );
};

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
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: theme.spacing.large,
  },
  permissionButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    minHeight: 56,
  },
  permissionButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  grid: {
    flex: 1,
    paddingTop: 18,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  quadrant: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  kicker: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  quadrantTitle: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  quadrantHint: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },
  footer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.overlayStrong,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    textAlign: 'center',
    backgroundColor: theme.colors.overlayStrong,
    padding: theme.spacing.medium,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  flipChip: {
    backgroundColor: 'rgba(124,92,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minHeight: 44,
  },
  flipText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
