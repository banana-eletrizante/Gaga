import { Platform } from 'react-native';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import { LightSensor } from 'expo-sensors';
import { SpeechService } from './speech';

const getInstantLightLevel = () => {
  return new Promise((resolve) => {
    if (Platform.OS !== 'android') {
      resolve(null);
      return;
    }

    let resolved = false;
    let subscription = null;

    const finish = (value) => {
      if (resolved) return;
      resolved = true;
      if (subscription) subscription.remove();
      resolve(value);
    };

    try {
      subscription = LightSensor.addListener(({ light }) => finish(light));
    } catch (_) {
      finish(null);
      return;
    }

    setTimeout(() => finish(null), 1200);
  });
};

const classifyLight = (lightLevel) => {
  if (lightLevel === null || lightLevel === undefined) {
    return Platform.OS === 'ios'
      ? 'Sensor de iluminação indisponível no iOS.'
      : 'Não foi possível ler o sensor de luminosidade.';
  }
  if (lightLevel < 10) return 'O ambiente está muito escuro. As luzes parecem apagadas.';
  if (lightLevel < 50) return 'A luminosidade está fraca.';
  if (lightLevel < 150) return 'A iluminação está média.';
  return 'O ambiente está bem iluminado.';
};

const formatTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const weekdays = [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ];
  return `Agora são ${hours} horas e ${minutes}. Hoje é ${weekdays[now.getDay()]}.`;
};

const getNetworkText = async () => {
  try {
    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected) return 'Sem conexão com a internet.';
    if (state.type === Network.NetworkStateType.WIFI) return 'Conectado no Wi-Fi.';
    if (state.type === Network.NetworkStateType.CELLULAR) return 'Usando dados móveis.';
    return 'Internet disponível.';
  } catch (_) {
    return 'Não foi possível verificar a rede.';
  }
};

const getLocationText = async () => {
  try {
    const services = await Location.hasServicesEnabledAsync();
    if (!services) return 'Serviço de localização desligado.';

    const permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
      const asked = await Location.requestForegroundPermissionsAsync();
      if (!asked.granted) return 'Permissão de localização não concedida.';
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const [place] = await Location.reverseGeocodeAsync(position.coords);
    if (!place) {
      return `Localização aproximada: latitude ${position.coords.latitude.toFixed(3)}, longitude ${position.coords.longitude.toFixed(3)}.`;
    }
    const street = [place.street, place.streetNumber].filter(Boolean).join(', ');
    const city = [place.district, place.city, place.region].filter(Boolean).join(', ');
    return `Você está perto de ${[street, city].filter(Boolean).join('. ')}.`;
  } catch (_) {
    return 'Não foi possível obter a localização.';
  }
};

export const SystemStatusService = {
  checkStatus: async ({ includeLocation = false, speechOptions = {} } = {}) => {
    try {
      const batteryLevelRaw = await Battery.getBatteryLevelAsync();
      const batteryLevel = Math.round(Math.max(0, batteryLevelRaw) * 100);
      const batteryState = await Battery.getBatteryStateAsync();
      const isCharging =
        batteryState === Battery.BatteryState.CHARGING ||
        batteryState === Battery.BatteryState.FULL;

      const batteryText = `Bateria em ${batteryLevel} por cento${
        isCharging ? ', carregando' : ''
      }.`;

      const [lightLevel, networkText] = await Promise.all([
        getInstantLightLevel(),
        getNetworkText(),
      ]);

      const parts = [
        formatTime(),
        batteryText,
        classifyLight(lightLevel),
        networkText,
      ];

      if (includeLocation) {
        parts.push(await getLocationText());
      }

      const statusText = parts.join(' ');
      await SpeechService.speak(statusText, speechOptions);
      return statusText;
    } catch (error) {
      console.error('Erro no SystemStatusService:', error);
      const errorMsg = 'Falha ao ler os sensores do dispositivo.';
      await SpeechService.speak(errorMsg, speechOptions);
      return errorMsg;
    }
  },
};
