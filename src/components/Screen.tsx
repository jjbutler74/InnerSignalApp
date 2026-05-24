import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

interface ScreenProps {
  children: React.ReactNode;
  bg?: string;
  style?: object;
}

export function Screen({ children, bg, style }: ScreenProps) {
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const background = bg ?? t.bg;
  return (
    <View style={[styles.root, { backgroundColor: background, paddingTop: insets.top, paddingBottom: insets.bottom }, style]}>
      <StatusBar
        backgroundColor={background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      />
      {children}
    </View>
  );
}

export function DarkScreen({ children, bg = '#1A2326', style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }, style]}>
      <StatusBar backgroundColor={bg} barStyle="light-content" translucent={false}/>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
  },
});
