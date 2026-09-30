import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { HapticService } from '../services/haptics';

export const AccessibleButton = ({
  onPress,
  onLongPress,
  disabled,
  children,
  label,
  hint,
  style,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, style, pressed && styles.pressed, disabled && styles.disabled]}
      onPress={async () => {
        if (disabled) return;
        await HapticService.tap();
        onPress?.();
      }}
      onLongPress={onLongPress}
      delayLongPress={450}
      disabled={disabled}
      accessible
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: theme.touchTarget.minHeight,
    minWidth: theme.touchTarget.minWidth,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.55,
  },
});
