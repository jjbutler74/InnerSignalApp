import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export function Card({ children, style, padding = 16 }: CardProps) {
  const { t } = useTheme();
  return (
    <View style={[
      styles.card,
      { backgroundColor: t.card, borderColor: t.hairline, padding },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
  },
});
