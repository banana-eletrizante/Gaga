import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export const AccessibleButton = ({ onPress, disabled, children, label, hint }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: theme.touchTarget.minHeight,
    minWidth: theme.touchTarget.minWidth,
  },
});