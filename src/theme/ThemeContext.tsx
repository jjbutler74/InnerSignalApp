import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { lightTokens, darkTokens, fonts, type Tokens } from './tokens';
import { useSettingsStore } from '../store/settingsStore';

interface ThemeContextValue {
  t: Tokens;
  fonts: typeof fonts;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  t: lightTokens,
  fonts,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const themeSetting = useSettingsStore(s => s.theme);

  const isDark =
    themeSetting === 'dark' ? true :
    themeSetting === 'light' ? false :
    scheme === 'dark';

  return (
    <ThemeContext.Provider value={{ t: isDark ? darkTokens : lightTokens, fonts, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
