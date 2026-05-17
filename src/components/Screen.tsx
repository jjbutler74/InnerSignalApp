import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ScreenProps {
  children: React.ReactNode;
  bg?: string;
  style?: object;
}

// React Navigation native-stack handles safe areas natively on Android.
// We use plain View here — SafeAreaProvider at the App root supplies inset context.
export function Screen({ children, bg, style }: ScreenProps) {
  const { t, isDark } = useTheme();
  const background = bg ?? t.bg;
  return (
    <View style={[styles.root, { backgroundColor: background }, style]}>
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
  return (
    <View style={[styles.root, { backgroundColor: bg }, style]}>
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
