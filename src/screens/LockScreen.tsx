import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DarkScreen } from '../components/Screen';
import { SignalMark } from '../components/Icons';
import { Eyebrow } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useAffirmationStore } from '../store/affirmationStore';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Lock'>;

function clockTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
}
function clockDate(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function LockScreen() {
  const { fonts } = useTheme();
  const nav = useNavigation<Nav>();
  const activeAffirmation = useAffirmationStore(s => s.activeAffirmation);

  const [time, setTime] = useState(clockTime);
  useEffect(() => {
    const id = setInterval(() => setTime(clockTime()), 10000);
    return () => clearInterval(id);
  }, []);

  const affText = activeAffirmation?.text ?? '';
  const dashIdx = affText.indexOf(' — ');
  const italicPart = dashIdx > -1 ? affText.slice(0, dashIdx) : affText;
  const restPart   = dashIdx > -1 ? affText.slice(dashIdx) : '';

  return (
    <DarkScreen bg="#1A2326">
      <View style={s.root}>
        <View style={s.clockBlock}>
          <Text style={[s.clockTime, { fontFamily: fonts.sans }]}>{time}</Text>
          <Text style={[s.clockDate, { fontFamily: fonts.sans }]}>{clockDate()}</Text>
        </View>

        <View style={{ flex: 1 }}/>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.appIcon}><SignalMark size={11} color="#fff"/></View>
            <Text style={[s.appName, { fontFamily: fonts.sansMedium }]}>InnerSignal</Text>
            <Text style={[s.cardTime, { fontFamily: fonts.sans }]}>now</Text>
          </View>
          <Eyebrow style={{ color: '#8A7B6E', marginBottom: 6 }}>Midday anchor</Eyebrow>
          <Text style={[s.affText, { fontFamily: fonts.display }]}>
            <Text style={{ fontStyle: 'italic' }}>{italicPart}</Text>
            {restPart}
          </Text>
          <View style={s.actions}>
            <Pressable style={s.primaryBtn} onPress={() => nav.navigate('AffirmationMoment')}>
              <Text style={[s.primaryBtnText, { fontFamily: fonts.sansMedium }]}>Read & breathe</Text>
            </Pressable>
            <Pressable style={s.secondaryBtn}>
              <Text style={[s.secondaryBtnText, { fontFamily: fonts.sansMedium }]}>Snooze 1h</Text>
            </Pressable>
          </View>
        </View>

        <Text style={[s.hint, { fontFamily: fonts.sans }]}>Swipe up to open · hold to silence today</Text>
        <View style={{ flex: 0.3 }}/>
      </View>
    </DarkScreen>
  );
}

const CREAM = '#F2EDE2';
const INK   = '#2A211B';

const s = StyleSheet.create({
  root:            { flex: 1, paddingHorizontal: 22 },
  clockBlock:      { alignItems: 'center', marginTop: 18 },
  clockTime:       { fontSize: 64, lineHeight: 68, letterSpacing: -2.5, color: CREAM, fontWeight: '300' },
  clockDate:       { fontSize: 14, color: 'rgba(242,237,226,0.7)', marginTop: 6 },
  card:            { backgroundColor: 'rgba(250,246,238,0.96)', borderRadius: 22, padding: 16 },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  appIcon:         { width: 18, height: 18, borderRadius: 5, backgroundColor: '#6F8169', alignItems: 'center', justifyContent: 'center' },
  appName:         { fontSize: 12, color: '#4A3F36', flex: 1 },
  cardTime:        { fontSize: 11, color: '#8A7B6E' },
  affText:         { fontSize: 22, lineHeight: 27, color: INK, letterSpacing: -0.2 },
  actions:         { flexDirection: 'row', gap: 8, marginTop: 12 },
  primaryBtn:      { flex: 1, backgroundColor: INK, borderRadius: 999, paddingVertical: 10, alignItems: 'center' },
  primaryBtnText:  { fontSize: 13, color: CREAM },
  secondaryBtn:    { backgroundColor: '#F6F0E2', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 },
  secondaryBtnText:{ fontSize: 13, color: INK },
  hint:            { textAlign: 'center', fontSize: 12, color: 'rgba(242,237,226,0.55)', marginTop: 14 },
});
