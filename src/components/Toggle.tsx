import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ToggleProps {
  on: boolean;
  onToggle?: (next: boolean) => void;
}

export function Toggle({ on, onToggle }: ToggleProps) {
  const { t } = useTheme();
  return (
    <Pressable
      onPress={() => onToggle?.(!on)}
      style={[styles.track, { backgroundColor: on ? t.sage : t.divider }]}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
    >
      <View style={[styles.thumb, { transform: [{ translateX: on ? 18 : 2 }] }]}/>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 42,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
});
