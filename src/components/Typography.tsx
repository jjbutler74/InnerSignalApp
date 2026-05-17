import React from 'react';
import { Text, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface TypographyProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function Eyebrow({ children, style }: TypographyProps) {
  const { t, fonts } = useTheme();
  return (
    <Text style={[{
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: t.muted,
    }, style]}>
      {children}
    </Text>
  );
}

export function Display({ children, style }: TypographyProps) {
  const { t, fonts } = useTheme();
  return (
    <Text style={[{
      fontFamily: fonts.display,
      letterSpacing: -0.2,
      color: t.ink,
    }, style]}>
      {children}
    </Text>
  );
}

export function DisplayItalic({ children, style }: TypographyProps) {
  const { fonts, t } = useTheme();
  return (
    <Text style={[{
      fontFamily: fonts.displayItalic,
      letterSpacing: -0.2,
      color: t.ink,
    }, style]}>
      {children}
    </Text>
  );
}
