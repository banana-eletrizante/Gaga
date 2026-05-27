import { useState, useRef, useEffect } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { SpeechService } from '../services/speech';
import { GeminiService } from '../services/gemini';

export const useAssistiveCamera = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultText, setResultText] = useState('');
  const cameraRef = useRef(null);

  useEffect(() => {
    SpeechService.speak(
      "Aplicativo de assistência iniciado. Toque duas vezes em qualquer lugar da tela para descrever o cenário."
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
      const errorMsg = "Ocorreu uma falha no processamento. Toque novamente para tentar.";
      setResultText(errorMsg);
      await SpeechService.speak(errorMsg);
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
  };
};