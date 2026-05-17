import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Leaf, ChevR } from '../components/Icons';
import { Eyebrow, Display, DisplayItalic } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OnboardingWelcome'>;

export function OnboardingWelcomeScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  return (
    <Screen bg={t.sageSoft}>
      <View style={[s.root, { backgroundColor: t.sageSoft }]}>
        {/* Top bar */}
        <View style={s.topBar}>
          <View style={s.logoRow}>
            <View style={[s.logoBox, { backgroundColor: t.sage }]}>
              <Leaf size={14} color="#fff"/>
            </View>
            <Text style={[s.logoText, { color: t.ink, fontFamily: fonts.sansMedium }]}>InnerSignal</Text>
          </View>
          <View style={s.dots}>
            <View style={[s.dot, s.dotActive, { backgroundColor: t.sage }]}/>
            <View style={[s.dot, { backgroundColor: t.divider }]}/>
            <View style={[s.dot, { backgroundColor: t.divider }]}/>
          </View>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <Eyebrow style={{ color: t.sage }}>Two practices · one rhythm</Eyebrow>
          <Display style={{ fontSize: 44, lineHeight: 48, marginTop: 10, marginBottom: 16, letterSpacing: -0.7 }}>
            {'Trust your inner signal by '}
            <DisplayItalic style={{ fontSize: 44, color: t.sage }}>day</DisplayItalic>
            {',\nyour heart by '}
            <DisplayItalic style={{ fontSize: 44, color: t.terra }}>night</DisplayItalic>
            {'.'}
          </Display>
          <Text style={[s.body, { color: t.ink2, fontFamily: fonts.sans }]}>
            Gentle affirmations land a few times a day to steady you. One quiet evening prompt asks what was good. That's it — nothing to chase, no feed to scroll.
          </Text>
        </View>

        {/* CTAs */}
        <View style={s.ctas}>
          <Pressable
            style={[s.primaryBtn, { backgroundColor: t.ink }]}
            onPress={() => nav.navigate('OnboardingName')}
          >
            <Text style={[s.primaryBtnText, { color: t.bg, fontFamily: fonts.sansMedium }]}>Begin</Text>
            <ChevR size={16} color={t.bg}/>
          </Pressable>
          <Pressable style={s.ghostBtn}>
            <Text style={[s.ghostBtnText, { color: t.muted, fontFamily: fonts.sans }]}>I already have an account</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, paddingHorizontal: 26, paddingVertical: 20 },
  topBar:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox:      { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  logoText:     { fontSize: 14 },
  dots:         { flexDirection: 'row', gap: 4 },
  dot:          { height: 3, width: 8, borderRadius: 2 },
  dotActive:    { width: 18 },
  hero:         { flex: 1, justifyContent: 'center' },
  body:         { fontSize: 15, lineHeight: 23, maxWidth: 300 },
  ctas:         { gap: 10 },
  primaryBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, borderRadius: 14 },
  primaryBtnText:{ fontSize: 15 },
  ghostBtn:     { alignItems: 'center', paddingVertical: 12 },
  ghostBtnText: { fontSize: 14 },
});
