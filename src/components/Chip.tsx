import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Tone = 'sage' | 'terra' | 'amber' | 'soft' | 'night';

interface ChipProps {
  children: React.ReactNode;
  tone?: Tone;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ children, tone = 'soft', active = false, onPress }: ChipProps) {
  const { t, fonts } = useTheme();

  const getBg = () => {
    if (!active) return t.surface2;
    switch (tone) {
      case 'sage':  return t.sageSoft;
      case 'terra': return t.terraSoft;
      case 'amber': return t.amberSoft;
      case 'night': return t.night;
      default:      return t.surface2;
    }
  };

  const getColor = () => {
    if (!active) return t.ink2;
    switch (tone) {
      case 'sage':  return t.sage;
      case 'terra': return t.terra;
      case 'amber': return t.amber;
      case 'night': return '#fff';
      default:      return t.ink;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: getBg() }]}
    >
      <Text style={[styles.label, { color: getColor(), fontFamily: fonts.sansMedium }]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    flexShrink: 0,
  },
  label: {
    fontSize: 12,
  },
});
