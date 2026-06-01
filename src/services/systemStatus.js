import { Platform } from 'react-native';
import * as Battery from 'expo-battery';
import { LightSensor } from 'expo-sensors';
import { SpeechService } from './speech';

/**
 * Função auxiliar que captura uma leitura única do sensor de luz (apenas Android).
 * Retorna uma Promise resolvida com o nível em Lux ou null.
 */
const getInstantLightLevel = () => {
  return new Promise((resolve) => {
    if (Platform.OS !== 'android') {
      resolve(null);
      return;
    }

    let resolved = false;
    const subscription = LightSensor.addListener(({ light }) => {
      if (!resolved) {
        resolved = true;
        subscription.remove(); // Desinscreve imediatamente para poupar bateria
        resolve(light);
      }
    });

    // Timeout de segurança caso o sensor falhe em responder
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        subscription.remove();
        resolve(null);
      }
    }, 1500);
  });
};

export const SystemStatusService = {
  /**
   * Analisa a bateria e a iluminação, gerando uma resposta em áudio.
   * @returns {Promise<string>} O texto consolidado que foi falado.
   */
  checkStatus: async () => {
    try {
      // 1. Coleta nível de bateria
      const batteryLevelRaw = await Battery.getBatteryLevelAsync();
      const batteryLevel = Math.round(batteryLevelRaw * 100);
      
      // 2. Coleta estado da bateria (se está carregando ou não)
      const batteryState = await Battery.getBatteryStateAsync();
      const isCharging = 
        batteryState === Battery.BatteryState.CHARGING || 
        batteryState === Battery.BatteryState.FULL;

      const batteryText = `Bateria em ${batteryLevel} por cento${isCharging ? ', carregando' : ', descarregando'}.`;

      // 3. Coleta nível de luz ambiente
      const lightLevel = await getInstantLightLevel();
      let lightText = '';

      if (lightLevel === null) {
        lightText = Platform.OS === 'ios' 
          ? 'Sensor de iluminação indisponível no sistema iOS.' 
          : 'Não foi possível acessar o sensor de luminosidade.';
      } else {
        // Classificação do nível de luminosidade em Lux
        if (lightLevel < 10) {
          lightText = 'O cômodo está muito escuro, indicando que as luzes estão apagadas.';
        } else if (lightLevel >= 10 && lightLevel < 50) {
          lightText = 'A luminosidade do ambiente está fraca.';
        } else if (lightLevel >= 50 && lightLevel < 150) {
          lightText = 'A iluminação está média, típica de ambientes residenciais.';
        } else {
          lightText = 'O ambiente está bem iluminado, indicando que as luzes estão acesas.';
        }
      }

      const statusText = `${batteryText} ${lightText}`;
      
      // 4. Executa a reprodução sonora
      await SpeechService.speak(statusText);

      return statusText;
    } catch (error) {
      console.error('Erro no SystemStatusService:', error);
      const errorMsg = 'Falha ao ler os sensores do dispositivo.';
      await SpeechService.speak(errorMsg);
      return errorMsg;
    }
  }
};