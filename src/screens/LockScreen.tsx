import React from 'react';
import { View, Text } from 'react-native';
import { DarkScreen } from '../components/Screen';
import { useTheme } from '../theme/ThemeContext';

export function LockScreen() {
  const { fonts } = useTheme();
  return (
    <DarkScreen bg="#2D3B3F">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 32, color: '#F2EDE2' }}>Lock Screen</Text>
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: 'rgba(242,237,226,0.6)', marginTop: 8 }}>Coming in Phase 3</Text>
      </View>
    </DarkScreen>
  );
}
