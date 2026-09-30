import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 1.75;
const COOLDOWN_MS = 1600;

export const useShake = (enabled, onShake) => {
  const lastShake = useRef(0);
  const callbackRef = useRef(onShake);
  callbackRef.current = onShake;

  useEffect(() => {
    if (!enabled) return undefined;

    Accelerometer.setUpdateInterval(120);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const gForce = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (gForce > SHAKE_THRESHOLD && now - lastShake.current > COOLDOWN_MS) {
        lastShake.current = now;
        callbackRef.current?.();
      }
    });

    return () => subscription.remove();
  }, [enabled]);
};
