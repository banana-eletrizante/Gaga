import { useState, useRef, useEffect } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { SpeechService } from '../services/speech';
import { GeminiService } from '../services/gemini';
import { SystemStatusService } from '../services/systemStatus';

export const useAssistiveCamera = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultText, setResultText] = useState('');
  const cameraRef = useRef(null);

  useEffect(() => {
    SpeechService.speak(
      "Aplicativo de assistência visual iniciado. A tela está dividida ao meio. Toque na metade superior para descrever o ambiente à sua frente. Toque na metade inferior para ouvir o nível de bateria e iluminação."
    );
  }, []);

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setResultText('Analisando...');

      await SpeechService.speak("Processando imagem, por favor aguarde.");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.4,
        base64: true,
      });

      if (!photo || !photo.base64) {
        throw new Error("Erro na gravação dos dados da imagem.");
      }

      const description = await GeminiService.analyzeImage(photo.base64);
      setResultText(description);
      await SpeechService.speak(description);

    } catch (error) {
      console.error(error);
      const errorMsg = "Ocorreu uma falha no processamento. Toque na metade superior para tentar novamente.";
      setResultText(errorMsg);
      await SpeechService.speak(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkStatus = async () => {
    if (isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setResultText('Lendo sensores...');
      const statusText = await SystemStatusService.checkStatus();
      setResultText(statusText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    permission,
    requestPermission,
    isAnalyzing,
    resultText,
    cameraRef,
    captureAndAnalyze,
    checkStatus,
  };
};