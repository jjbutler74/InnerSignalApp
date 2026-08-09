import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Screen } from '../components/Screen';
import { Sun, Bolt, Leaf, Moon } from '../components/Icons';
import { Display, DisplayItalic, Eyebrow } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../store/settingsStore';
import * as Notifications from 'expo-notifications';
import { scheduleAllNotifications } from '../notifications/scheduler';
import { sortAndEnforceGap } from '../utils/anchorWindow';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OnboardingSchedule'>;

function toDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
function fromDate(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function OnboardingScheduleScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const storeAnchor1   = useSettingsStore(s => s.scheduleAnchor1);
  const storeAnchor2   = useSettingsStore(s => s.scheduleAnchor2);
  const storeAnchor3   = useSettingsStore(s => s.scheduleAnchor3);
  const storeGratitude = useSettingsStore(s => s.scheduleGratitude);
  const update         = useSettingsStore(s => s.update);

  const [times, setTimes] = useState({
    anchor1:   storeAnchor1,
    anchor2:   storeAnchor2,
    anchor3:   storeAnchor3,
    gratitude: storeGratitude,
  });
  const [picking, setPicking] = useState<keyof typeof times | null>(null);

  const slots = [
    { key: 'anchor1'   as const, label: 'Morning anchor',  Icon: Sun,  color: t.sage },
    { key: 'anchor2'   as const, label: 'Midday reset',    Icon: Bolt, color: t.terra },
    { key: 'anchor3'   as const, label: 'Evening pause',   Icon: Leaf, color: t.amber },
    { key: 'gratitude' as const, label: 'Evening gratitude', Icon: Moon, color: t.night },
  ];

  const goToApp = () =>
    nav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Today' }] }));

  const handleGetStarted = async () => {
    await update({
      scheduleAnchor1: times.anchor1,
      scheduleAnchor2: times.anchor2,
      scheduleAnchor3: times.anchor3,
      scheduleGratitude: times.gratitude,
      onboardingComplete: true,
    });

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Notifications off',
        'You can enable them later in Settings → InnerSignal to receive your anchors.',
        [{ text: 'OK', onPress: goToApp }],
      );
    } else {
      await scheduleAllNotifications(useSettingsStore.getState());
      nav.navigate('OnboardingAlarm');
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.root} keyboardShouldPersistTaps="handled">
        <View style={s.dots}>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
          <View style={[s.dot, s.dotActive, { backgroundColor: t.sage }]}/>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
        </View>

        <Display style={{ fontSize: 36, lineHeight: 40, letterSpacing: -0.5, color: t.ink, marginTop: 16, marginBottom: 6 }}>
          {'When '}
          <DisplayItalic style={{ fontSize: 36, color: t.sage }}>InnerSignal</DisplayItalic>
          {' reaches you'}
        </Display>
        <Text style={[s.sub, { color: t.muted, fontFamily: fonts.sans }]}>
          Three nudges a day, plus an evening prompt for gratitude.
        </Text>

        <View style={s.slots}>
          {slots.map(({ key, label, Icon, color }) => (
            <Pressable
              key={key}
              style={[s.slotRow, { borderColor: t.hairline }]}
              onPress={() => setPicking(key)}
            >
              <View style={[s.slotIcon, { backgroundColor: key === 'gratitude' ? t.night : color + '33' }]}>
                <Icon size={18} color={key === 'gratitude' ? '#fff' : color}/>
              </View>
              <View style={{ flex: 1 }}>
                <Eyebrow style={{ color: t.ink }}>{label}</Eyebrow>
              </View>
              <Text style={[s.slotTime, { color: t.ink, fontFamily: fonts.monoMedium }]}>{times[key]}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={[s.btn, { backgroundColor: t.ink }]} onPress={handleGetStarted}>
          <Text style={[s.btnText, { color: t.bg, fontFamily: fonts.sansMedium }]}>Allow notifications & get started →</Text>
        </Pressable>
      </ScrollView>

      {picking !== null && (
        <DateTimePicker
          value={toDate(times[picking])}
          mode="time"
          is24Hour
          display="spinner"
          onChange={(_, date) => {
            if (date) {
              const val = fromDate(date);
              setTimes(prev => {
                const next = { ...prev, [picking!]: val };
                const [a1, a2, a3] = sortAndEnforceGap(next.anchor1, next.anchor2, next.anchor3);
                return { ...next, anchor1: a1, anchor2: a2, anchor3: a3 };
              });
            }
            setPicking(null);
          }}
        />
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  root:      { paddingHorizontal: 24, paddingVertical: 20, gap: 0 },
  dots:      { flexDirection: 'row', gap: 4, justifyContent: 'flex-end' },
  dot:       { height: 3, width: 8, borderRadius: 2 },
  dotActive: { width: 18 },
  sub:       { fontSize: 14, lineHeight: 21, marginBottom: 24 },
  slots:     { gap: 10, marginBottom: 28 },
  slotRow:   { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  slotIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  slotTime:  { fontSize: 18, letterSpacing: -0.3 },
  btn:       { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText:   { fontSize: 14 },
});
