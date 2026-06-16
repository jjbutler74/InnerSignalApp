import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DarkScreen } from '../components/Screen';
import { Moon } from '../components/Icons';
import { Eyebrow } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../store/settingsStore';
import type { RootStackParamList } from '../../App';

const COUNT_WORDS = { 1: 'One', 2: 'Two', 3: 'Three' } as const;

type Nav = NativeStackNavigationProp<RootStackParamList, 'EveningNotif'>;

function clockTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
function clockLabel(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' }) + ' evening';
}

export function EveningNotifScreen() {
  const { fonts } = useTheme();
  const nav = useNavigation<Nav>();
  const gratitudeCount = useSettingsStore(s => s.gratitudeCount);

  const [time, setTime] = useState(clockTime);
  useEffect(() => {
    const id = setInterval(() => setTime(clockTime()), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <DarkScreen bg="#141414">
      <View style={s.root}>
        <View style={s.clockBlock}>
          <Text style={[s.clockTime, { fontFamily: fonts.sans }]}>{time}</Text>
          <Text style={[s.clockDate, { fontFamily: fonts.sans }]}>{clockLabel()}</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={s.card}>
            <View style={s.cardHeader}>
              <View style={s.appIcon}>
                <View style={{ transform: [{ rotate: '180deg' }], marginTop: -3, marginLeft: 3 }}>
                  <Moon size={11} color="#fff"/>
                </View>
              </View>
              <Text style={[s.appName, { fontFamily: fonts.sansMedium }]}>InnerSignal</Text>
              <Text style={[s.cardTime, { fontFamily: fonts.sans }]}>{time}</Text>
            </View>
            <Eyebrow style={{ color: '#252528', marginBottom: 6 }}>
              {COUNT_WORDS[gratitudeCount]} good {gratitudeCount === 1 ? 'thing' : 'things'}
            </Eyebrow>
            <Text style={[s.affText, { fontFamily: fonts.display }]}>
              {'Before sleep — '}
              <Text style={{ fontStyle: 'italic' }}>what are you grateful for today?</Text>
            </Text>
            <View style={s.actions}>
              <Pressable style={s.primaryBtn} onPress={() => nav.navigate('GratitudeComposer')}>
                <Text style={[s.primaryBtnText, { fontFamily: fonts.sansMedium }]}>Begin</Text>
              </Pressable>
              <Pressable style={s.secondaryBtn} onPress={() => nav.goBack()}>
                <Text style={[s.secondaryBtnText, { fontFamily: fonts.sansMedium }]}>Not now</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View style={{ flex: 0.3 }}/>
      </View>
    </DarkScreen>
  );
}

const CREAM = '#ECEAE5';
const INK   = '#1E1E1E';

const s = StyleSheet.create({
  root:            { flex: 1, paddingHorizontal: 22 },
  clockBlock:      { alignItems: 'center', marginTop: 18 },
  clockTime:       { fontSize: 64, lineHeight: 68, letterSpacing: -2.5, color: CREAM, fontWeight: '300' },
  clockDate:       { fontSize: 14, color: 'rgba(242,237,226,0.7)', marginTop: 6 },
  card:            { backgroundColor: 'rgba(250,246,238,0.96)', borderRadius: 22, padding: 16 },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  appIcon:         { width: 18, height: 18, borderRadius: 5, backgroundColor: '#252528', alignItems: 'center', justifyContent: 'center' },
  appName:         { fontSize: 12, color: '#4A3F36', flex: 1 },
  cardTime:        { fontSize: 11, color: '#8A7B6E' },
  affText:         { fontSize: 22, lineHeight: 27, color: INK },
  actions:         { flexDirection: 'row', gap: 8, marginTop: 12 },
  primaryBtn:      { flex: 1, backgroundColor: INK, borderRadius: 999, paddingVertical: 10, alignItems: 'center' },
  primaryBtnText:  { fontSize: 13, color: CREAM },
  secondaryBtn:    { backgroundColor: '#EFEDE8', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 },
  secondaryBtnText:{ fontSize: 13, color: INK },
});
