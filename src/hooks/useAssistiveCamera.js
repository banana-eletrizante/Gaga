import { useCallback, useEffect, useRef, useState } from 'react';
import { useCameraPermissions } from 'expo-camera';
import * as Network from 'expo-network';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { SpeechService } from '../services/speech';
import { GeminiService } from '../services/gemini';
import { SystemStatusService } from '../services/systemStatus';
import { HapticService } from '../services/haptics';
import { StorageService } from '../services/storage';
import { useShake } from './useShake';

const MODE_LABELS = {
  scene: 'descrever o cenário',
  text: 'ler textos',
  hazards: 'procurar obstáculos',
  colors: 'descrever cores',
};

export const useAssistiveCamera = (settings) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultText, setResultText] = useState('');
  const [lastSpoken, setLastSpoken] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState('back');
  const [screen, setScreen] = useState('home');
  const cameraRef = useRef(null);
  const analyzingRef = useRef(false);
  const announcedRef = useRef(false);
  const speechOptions = {
    rate: settings?.speechRate ?? 0.95,
    pitch: settings?.speechPitch ?? 1.0,
  };

  useEffect(() => {
    analyzingRef.current = isAnalyzing;
  }, [isAnalyzing]);

  useEffect(() => {
    if (!permission?.granted || !settings?.announceOnStart || announcedRef.current) return;
    announcedRef.current = true;
    SpeechService.speak(
      'Gaga pronto. Quadrante superior esquerdo descreve o ambiente. Superior direito lê textos. Inferior esquerdo informa hora, bateria e luz. Inferior direito controla a lanterna. Sacuda o celular para descrever. Toque de novo durante a fala para interromper.',
      speechOptions
    );
  }, [permission?.granted, settings?.announceOnStart]);

  const speakAndStore = useCallback(
    async (text, mode) => {
      setResultText(text);
      setLastSpoken(text);
      await StorageService.pushHistory({
        text,
        mode: mode || 'status',
        at: new Date().toISOString(),
      });
      await SpeechService.speak(text, speechOptions);
    },
    [speechOptions.rate, speechOptions.pitch]
  );

  const captureAndAnalyze = useCallback(
    async (mode = 'scene') => {
      if (analyzingRef.current) {
        await SpeechService.stop();
        setIsAnalyzing(false);
        return;
      }

      if (!cameraRef.current) {
        await SpeechService.speak('Câmera ainda não está pronta.', speechOptions);
        return;
      }

      if (!GeminiService.isConfigured()) {
        const msg =
          'A chave do Gemini não está configurada. Crie um arquivo .env com EXPO_PUBLIC_GEMINI_API_KEY e reinicie o app.';
        await HapticService.warning();
        await speakAndStore(msg, mode);
        return;
      }

      try {
        setIsAnalyzing(true);
        await activateKeepAwakeAsync();
        await HapticService.tap();

        const network = await Network.getNetworkStateAsync();
        if (!network.isConnected) {
          throw new Error('Sem internet. Conecte-se ao Wi-Fi ou aos dados móveis e tente de novo.');
        }

        setResultText('Analisando...');
        await SpeechService.speak(
          `Beleza. Vou ${MODE_LABELS[mode] || 'analisar a imagem'}. Aguarde.`,
          speechOptions
        );

        const photo = await cameraRef.current.takePictureAsync({
          quality: mode === 'text' ? 0.7 : 0.45,
          base64: true,
          skipProcessing: true,
          shutterSound: false,
        });

        if (!photo?.base64) {
          throw new Error('Não consegui capturar a imagem.');
        }

        const description = await GeminiService.analyzeImage(photo.base64, mode);
        await HapticService.success();
        await speakAndStore(description, mode);
      } catch (error) {
        console.error(error);
        await HapticService.error();
        const errorMsg =
          error?.message && !String(error.message).startsWith('Gemini')
            ? error.message
            : 'Falha no processamento. Toque novamente para tentar.';
        await speakAndStore(errorMsg, mode);
      } finally {
        setIsAnalyzing(false);
        try {
          deactivateKeepAwake();
        } catch (_) {}
      }
    },
    [speakAndStore, speechOptions.rate, speechOptions.pitch]
  );

  const checkStatus = useCallback(async () => {
    if (analyzingRef.current) {
      await SpeechService.stop();
      setIsAnalyzing(false);
      return;
    }

    try {
      setIsAnalyzing(true);
      await HapticService.tap();
      setResultText('Lendo sensores...');
      const statusText = await SystemStatusService.checkStatus({
        includeLocation: Boolean(settings?.includeLocationInStatus),
        speechOptions,
      });
      setResultText(statusText);
      setLastSpoken(statusText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [settings?.includeLocationInStatus, speechOptions.rate, speechOptions.pitch]);

  const repeatLast = useCallback(async () => {
    if (!lastSpoken) {
      await SpeechService.speak('Ainda não há nenhuma descrição para repetir.', speechOptions);
      return;
    }
    await HapticService.tap();
    await SpeechService.speak(lastSpoken, speechOptions);
  }, [lastSpoken, speechOptions.rate, speechOptions.pitch]);

  const toggleTorch = useCallback(async () => {
    setTorchOn((value) => !value);
    await HapticService.heavy();
    await SpeechService.speak(
      torchOn ? 'Lanterna desligada.' : 'Lanterna ligada.',
      speechOptions
    );
  }, [torchOn, speechOptions.rate, speechOptions.pitch]);

  const toggleFacing = useCallback(async () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
    await SpeechService.speak(
      facing === 'back' ? 'Câmera frontal.' : 'Câmera traseira.',
      speechOptions
    );
  }, [facing, speechOptions.rate, speechOptions.pitch]);

  const stopEverything = useCallback(async () => {
    await SpeechService.stop();
    setIsAnalyzing(false);
  }, []);

  useShake(Boolean(settings?.shakeToDescribe && permission?.granted && screen === 'home'), () => {
    if (!analyzingRef.current) {
      captureAndAnalyze('scene');
    }
  });

  return {
    permission,
    requestPermission,
    isAnalyzing,
    resultText,
    lastSpoken,
    cameraRef,
    torchOn,
    facing,
    screen,
    setScreen,
    captureAndAnalyze,
    checkStatus,
    repeatLast,
    toggleTorch,
    toggleFacing,
    stopEverything,
  };
};
