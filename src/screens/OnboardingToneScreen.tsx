import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Display, DisplayItalic } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useAffirmationStore } from '../store/affirmationStore';
import type { TonePreference } from '../types';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OnboardingTone'>;

type Tok = ReturnType<typeof useTheme>['t'];

type Card = {
  tone: TonePreference;
  label: string;
  tagline: string;
  description: string;
  accent: (t: Tok) => string;
  selectedBg: (t: Tok) => string;
  textOnSelected: (t: Tok) => string;
};

const CARDS: Card[] = [
  {
    tone: 'iron',
    label: 'Iron',
    tagline: 'Direct · Disciplined · Action-oriented',
    description: 'Cut through noise. Build resolve. Hold the line.',
    accent: t => t.night,
    selectedBg: t => t.night,
    textOnSelected: _ => '#fff',
  },
  {
    tone: 'sage',
    label: 'Sage',
    tagline: 'Gentle · Reflective · Compassionate',
    description: 'Make space. Go inward. Meet yourself with care.',
    accent: t => t.sage,
    selectedBg: t => t.sageSoft,
    textOnSelected: t => t.sage,
  },
  {
    tone: 'balance',
    label: 'Balance',
    tagline: 'Strength and softness, both',
    description: 'Some days call for grit, others for grace. You get both.',
    accent: t => t.amber,
    selectedBg: t => t.amberSoft,
    textOnSelected: t => t.amber,
  },
];

export function OnboardingToneScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();
  const setActiveTone = useAffirmationStore(s => s.setActiveTone);

  const [selected, setSelected] = useState<TonePreference>('balance');

  const handleContinue = async () => {
    await setActiveTone(selected);
    nav.navigate('OnboardingSchedule');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.root} keyboardShouldPersistTaps="handled">
        <View style={s.dots}>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
          <View style={[s.dot, s.dotActive, { backgroundColor: t.sage }]}/>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
        </View>

        <Display style={{ fontSize: 36, lineHeight: 40, letterSpacing: -0.5, color: t.ink, marginTop: 16, marginBottom: 6 }}>
          {'Your '}
          <DisplayItalic style={{ fontSize: 36, color: t.terra }}>voice</DisplayItalic>
        </Display>
        <Text style={[s.sub, { color: t.muted, fontFamily: fonts.sans }]}>
          Choose the tone that resonates most. You can always change it later in Settings.
        </Text>

        <View style={s.cards}>
          {CARDS.map(card => {
            const isSelected = selected === card.tone;
            const accent = card.accent(t);
            const textColor = isSelected ? card.textOnSelected(t) : t.ink;
            const isIronSelected = card.tone === 'iron' && isSelected;
            const checkBg = isIronSelected ? 'rgba(255,255,255,0.2)' : accent;
            const borderColor = isIronSelected ? 'rgba(255,255,255,0.55)' : isSelected ? accent : t.hairline;
            return (
              <Pressable
                key={card.tone}
                style={[
                  s.card,
                  {
                    borderColor,
                    borderWidth: isSelected ? 2 : 1,
                    backgroundColor: isSelected ? card.selectedBg(t) : t.surface,
                  },
                ]}
                onPress={() => setSelected(card.tone)}
              >
                <View style={s.cardHeader}>
                  <Text style={[s.cardLabel, { color: textColor, fontFamily: fonts.sansSemiBold }]}>
                    {card.label}
                  </Text>
                  {isSelected && (
                    <View style={[s.check, { backgroundColor: checkBg }]}>
                      <Text style={[s.checkMark, { fontFamily: fonts.sansSemiBold }]}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.cardTagline, { color: isSelected ? textColor : t.muted, fontFamily: fonts.mono }]}>
                  {card.tagline}
                </Text>
                <Text style={[s.cardDesc, { color: isSelected ? textColor : t.ink2, fontFamily: fonts.sans }]}>
                  {card.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={[s.btn, { backgroundColor: t.ink }]} onPress={handleContinue}>
          <Text style={[s.btnText, { color: t.bg, fontFamily: fonts.sansMedium }]}>Continue →</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  root:       { paddingHorizontal: 24, paddingVertical: 20, gap: 0 },
  dots:       { flexDirection: 'row', gap: 4, justifyContent: 'flex-end' },
  dot:        { height: 3, width: 8, borderRadius: 2 },
  dotActive:  { width: 18 },
  sub:        { fontSize: 14, lineHeight: 21, marginBottom: 28 },
  cards:      { gap: 12, marginBottom: 28 },
  card:       { borderRadius: 16, padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardLabel:  { fontSize: 20, letterSpacing: -0.3 },
  check:      { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  checkMark:  { fontSize: 11, color: '#fff' },
  cardTagline:{ fontSize: 11, letterSpacing: 0.2, marginBottom: 8 },
  cardDesc:   { fontSize: 14, lineHeight: 20 },
  btn:        { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText:    { fontSize: 15 },
});
