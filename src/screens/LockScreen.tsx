import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { DarkScreen } from '../components/Screen';
import { SignalMark } from '../components/Icons';
import { Eyebrow } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { darkTokens, lightTokens, withAlpha } from '../theme/tokens';
import { useAffirmationStore } from '../store/affirmationStore';
import { useSettingsStore } from '../store/settingsStore';
import { snoozeAffirmationNotification } from '../notifications/scheduler';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Lock'>;
type Route = RouteProp<RootStackParamList, 'Lock'>;

const SLOT_LABEL: Record<'anchor1' | 'anchor2' | 'anchor3', string> = {
  anchor1: 'Morning anchor',
  anchor2: 'Midday reset',
  anchor3: 'Evening pause',
};

function clockTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
}
function clockDate(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function LockScreen() {
  const { fonts } = useTheme();
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const slot  = route.params?.slot ?? 'anchor1';
  const activeAffirmation = useAffirmationStore(s => s.activeAffirmation);

  const [time, setTime] = useState(clockTime);
  useEffect(() => {
    const id = setInterval(() => setTime(clockTime()), 10000);
    return () => clearInterval(id);
  }, []);

  const [snoozed, setSnoozed] = useState(false);
  const handleSnooze = async () => {
    if (snoozed) return;
    setSnoozed(true);
    await snoozeAffirmationNotification(useSettingsStore.getState(), slot);
    nav.navigate('Today');
  };

  const affText = activeAffirmation?.text ?? '';
  const dashIdx = affText.indexOf(' — ');
  const italicPart = dashIdx > -1 ? affText.slice(0, dashIdx) : affText;
  const restPart   = dashIdx > -1 ? affText.slice(dashIdx) : '';

  return (
    <DarkScreen>
      <View style={s.root}>
        <View style={s.clockBlock}>
          <Text style={[s.clockTime, { fontFamily: fonts.sans }]}>{time}</Text>
          <Text style={[s.clockDate, { fontFamily: fonts.sans }]}>{clockDate()}</Text>
        </View>

        <View style={{ flex: 1 }}/>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.appIcon}><SignalMark size={14} color="#fff"/></View>
            <Text style={[s.appName, { fontFamily: fonts.sansMedium }]}>InnerSignal</Text>
            <Text style={[s.cardTime, { fontFamily: fonts.sans }]}>now</Text>
          </View>
          <Eyebrow style={{ color: lightTokens.cardSub, marginBottom: 6 }}>{SLOT_LABEL[slot]}</Eyebrow>
          <Text style={[s.affText, { fontFamily: fonts.display }]}>
            <Text style={{ fontStyle: 'italic' }}>{italicPart}</Text>
            {restPart}
          </Text>
          <View style={s.actions}>
            <Pressable style={s.primaryBtn} onPress={() => nav.navigate('AffirmationMoment', { slot })}>
              <Text style={[s.primaryBtnText, { fontFamily: fonts.sansMedium }]}>Read & absorb</Text>
            </Pressable>
            <Pressable style={s.secondaryBtn} onPress={handleSnooze} disabled={snoozed}>
              <Text style={[s.secondaryBtnText, { fontFamily: fonts.sansMedium }]}>
                {snoozed ? 'Snoozed ✓' : 'Snooze 1h'}
              </Text>
            </Pressable>
          </View>
        </View>

<View style={{ flex: 0.3 }}/>
      </View>
    </DarkScreen>
  );
}

const CREAM = darkTokens.ink;
const INK   = lightTokens.ink;

const s = StyleSheet.create({
  root:            { flex: 1, paddingHorizontal: 22 },
  clockBlock:      { alignItems: 'center', marginTop: 18 },
  clockTime:       { fontSize: 64, lineHeight: 68, letterSpacing: -2.5, color: CREAM, fontWeight: '300' },
  clockDate:       { fontSize: 14, color: withAlpha(CREAM, 0.7), marginTop: 6 },
  card:            { backgroundColor: withAlpha(lightTokens.surface, 0.96), borderRadius: 22, padding: 16 },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  appIcon:         { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  appName:         { fontSize: 12, color: lightTokens.cardLabel, flex: 1 },
  cardTime:        { fontSize: 11, color: lightTokens.cardSub },
  affText:         { fontSize: 22, lineHeight: 27, color: INK, letterSpacing: -0.2 },
  actions:         { flexDirection: 'row', gap: 8, marginTop: 12 },
  primaryBtn:      { flex: 1, backgroundColor: INK, borderRadius: 999, paddingVertical: 10, alignItems: 'center' },
  primaryBtnText:  { fontSize: 13, color: CREAM },
  secondaryBtn:    { backgroundColor: lightTokens.surface2, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 },
  secondaryBtnText:{ fontSize: 13, color: INK },
});
