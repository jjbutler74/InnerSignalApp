import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { useTheme } from '../theme/ThemeContext';

export function OnboardingWelcomeScreen() {
  const { t, fonts } = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 32, color: t.ink }}>Welcome</Text>
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: t.muted, marginTop: 8 }}>Onboarding Step 1 — coming in Phase 6</Text>
      </View>
    </Screen>
  );
}
