import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Display, DisplayItalic } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../store/settingsStore';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OnboardingName'>;

export function OnboardingNameScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();
  const update = useSettingsStore(s => s.update);

  const [name, setName] = useState('');

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await update({ name: trimmed });
    nav.navigate('OnboardingTone');
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.root}>
          <View style={s.dots}>
            <View style={[s.dot, { backgroundColor: t.divider }]}/>
            <View style={[s.dot, s.dotActive, { backgroundColor: t.sage }]}/>
            <View style={[s.dot, { backgroundColor: t.divider }]}/>
            <View style={[s.dot, { backgroundColor: t.divider }]}/>
          </View>

          <View style={s.hero}>
            <Display style={{ fontSize: 40, lineHeight: 44, letterSpacing: -0.5, color: t.ink }}>
              {'What shall we\ncall '}
              <DisplayItalic style={{ fontSize: 40, color: t.terra }}>you</DisplayItalic>
              {'?'}
            </Display>

            <TextInput
              style={[s.input, { fontFamily: fonts.display, color: t.ink, borderBottomColor: t.divider }]}
              placeholder="Your name"
              placeholderTextColor={t.soft}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          <Pressable
            style={[s.btn, { backgroundColor: name.trim() ? t.ink : t.divider }]}
            onPress={handleContinue}
            disabled={!name.trim()}
          >
            <Text style={[s.btnText, { color: name.trim() ? t.bg : t.muted, fontFamily: fonts.sansMedium }]}>
              Continue →
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, paddingHorizontal: 26, paddingVertical: 20 },
  dots:      { flexDirection: 'row', gap: 4, justifyContent: 'flex-end' },
  dot:       { height: 3, width: 8, borderRadius: 2 },
  dotActive: { width: 18 },
  hero:      { flex: 1, justifyContent: 'center', gap: 32 },
  input:     { fontSize: 32, borderBottomWidth: 1.5, paddingBottom: 8 },
  btn:       { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText:   { fontSize: 15 },
});
