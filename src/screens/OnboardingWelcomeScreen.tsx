import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DarkScreen } from '../components/Screen';
import { SignalMark, ChevR } from '../components/Icons';
import { Eyebrow, Display, DisplayItalic } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OnboardingWelcome'>;

const CREAM     = '#ECEAE5';
const SAGE_SOFT = '#D4D6D8';
const TERRA     = '#C46A42';
const SAGE      = '#5C6268';
const INK       = '#1E1E1E';

export function OnboardingWelcomeScreen() {
  const { fonts } = useTheme();
  const nav = useNavigation<Nav>();

  return (
    <DarkScreen bg="#252528">
      <View style={s.root}>
        {/* Top bar */}
        <View style={s.topBar}>
          <View style={s.logoRow}>
            <View style={[s.logoBox, { backgroundColor: SAGE }]}>
              <SignalMark size={14} color="#fff"/>
            </View>
            <Text style={[s.logoText, { color: CREAM, fontFamily: fonts.sansMedium }]}>InnerSignal</Text>
          </View>
          <View style={s.dots}>
            <View style={[s.dot, s.dotActive, { backgroundColor: SAGE_SOFT }]}/>
            <View style={[s.dot, { backgroundColor: 'rgba(255,255,255,0.2)' }]}/>
            <View style={[s.dot, { backgroundColor: 'rgba(255,255,255,0.2)' }]}/>
          </View>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <Eyebrow style={{ color: SAGE_SOFT }}>Two practices · one rhythm</Eyebrow>
          <Display style={{ fontSize: 44, lineHeight: 48, marginTop: 10, marginBottom: 16, letterSpacing: -0.7, color: CREAM }}>
            {'Trust your inner signal by '}
            <DisplayItalic style={{ fontSize: 44, color: SAGE_SOFT }}>day</DisplayItalic>
            {',\nyour heart by '}
            <DisplayItalic style={{ fontSize: 44, color: TERRA }}>night</DisplayItalic>
            {'.'}
          </Display>
          <Text style={[s.body, { color: 'rgba(242,237,226,0.72)', fontFamily: fonts.sans }]}>
            Affirmations land a few times a day to steady you. One evening prompt asks what was good. That's it — nothing to chase, no feed to scroll.
          </Text>
        </View>

        {/* CTAs */}
        <View style={s.ctas}>
          <Pressable
            style={[s.primaryBtn, { backgroundColor: CREAM }]}
            onPress={() => nav.navigate('OnboardingName')}
          >
            <Text style={[s.primaryBtnText, { color: INK, fontFamily: fonts.sansMedium }]}>Begin</Text>
            <ChevR size={16} color={INK}/>
          </Pressable>
        </View>
      </View>
    </DarkScreen>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, paddingHorizontal: 26, paddingVertical: 20 },
  topBar:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox:       { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  logoText:      { fontSize: 14 },
  dots:          { flexDirection: 'row', gap: 4 },
  dot:           { height: 3, width: 8, borderRadius: 2 },
  dotActive:     { width: 18 },
  hero:          { flex: 1, justifyContent: 'center' },
  body:          { fontSize: 15, lineHeight: 23, maxWidth: 300 },
  ctas:          { gap: 10 },
  primaryBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, borderRadius: 14 },
  primaryBtnText:{ fontSize: 15 },
});
