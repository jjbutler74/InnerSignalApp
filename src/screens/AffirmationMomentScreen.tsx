import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { useTheme } from '../theme/ThemeContext';

export function AffirmationMomentScreen() {
  const { t, fonts } = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 32, color: t.ink }}>Affirmation Moment</Text>
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: t.muted, marginTop: 8 }}>Coming in Phase 3</Text>
      </View>
    </Screen>
  );
}
