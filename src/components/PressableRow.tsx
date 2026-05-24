import React from 'react';
import { Pressable, View, Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevR } from './Icons';

interface PressableRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  topBorder?: boolean;
  valueStyle?: TextStyle;
}

export function PressableRow({ label, value, onPress, topBorder = true, valueStyle }: PressableRowProps) {
  const { t, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        topBorder && { borderTopWidth: 1, borderTopColor: t.hairline },
        pressed && { backgroundColor: t.surface2 },
      ]}
    >
      <Text style={[styles.label, { color: t.ink, fontFamily: fonts.sansMedium }]}>{label}</Text>
      {value ? (
        <Text style={[styles.value, { color: t.muted, fontFamily: fonts.sans }, valueStyle]}>{value}</Text>
      ) : null}
      <ChevR size={14} color={t.soft}/>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  value: {
    fontSize: 12,
    marginRight: 6,
  },
});
