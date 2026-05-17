import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PressableRow } from '../components/PressableRow';
import { Display, DisplayItalic, Eyebrow } from '../components/Typography';
import { ChevL, Moon } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../store/settingsStore';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Schedule'>;

function toDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0); return d;
}
function fromDate(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const ANCHOR_COLORS = ['#6F8169', '#C97B5B', '#D4A24C'] as const;

export function ScheduleScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const anchor1   = useSettingsStore(s => s.scheduleAnchor1);
  const anchor2   = useSettingsStore(s => s.scheduleAnchor2);
  const anchor3   = useSettingsStore(s => s.scheduleAnchor3);
  const gratitude = useSettingsStore(s => s.scheduleGratitude);
  const update    = useSettingsStore(s => s.update);

  const anchors = [anchor1, anchor2, anchor3];
  const labels  = ['Morning', 'Midday', 'Evening'];

  const [picking, setPicking] = useState<'anchor1' | 'anchor2' | 'anchor3' | 'gratitude' | null>(null);

  const handleChange = (_: unknown, date?: Date) => {
    if (date && picking) {
      const val = fromDate(date);
      const key = picking === 'gratitude' ? 'scheduleGratitude'
        : picking === 'anchor1' ? 'scheduleAnchor1'
        : picking === 'anchor2' ? 'scheduleAnchor2'
        : 'scheduleAnchor3';
      update({ [key]: val });
    }
    setPicking(null);
  };

  const currentPickValue = picking === 'gratitude' ? gratitude
    : picking === 'anchor1' ? anchor1
    : picking === 'anchor2' ? anchor2
    : picking === 'anchor3' ? anchor3
    : anchor1;

  // Timeline: 6 AM to 10 PM = 16 hours
  const timelinePct = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return ((h + m / 60 - 6) / 16) * 100;
  };

  return (
    <Screen>
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()}>
          <ChevL size={22} color={t.ink}/>
        </Pressable>
        <Text style={[s.headerTitle, { color: t.ink, fontFamily: fonts.sansMedium }]}>Schedule</Text>
        <View style={{ width: 22 }}/>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Display style={{ fontSize: 30, lineHeight: 34, marginBottom: 6 }}>
          {'When '}
          <DisplayItalic style={{ fontSize: 30 }}>InnerSignal</DisplayItalic>
          {' reaches you'}
        </Display>
        <Text style={[s.sub, { color: t.muted, fontFamily: fonts.sans }]}>
          Three gentle nudges a day, plus an evening prompt for gratitude.
        </Text>

        {/* Affirmations timeline */}
        <Card style={{ marginBottom: 12 }}>
          <View style={s.cardHead}>
            <Eyebrow>Affirmations</Eyebrow>
            <Text style={[s.badge, { color: t.sage, fontFamily: fonts.mono }]}>3× / day</Text>
          </View>
          <View style={s.timeline}>
            <View style={[s.timelineTrack, { backgroundColor: t.divider }]}/>
            {anchors.map((time, i) => (
              <Pressable
                key={i}
                style={[s.timelineDot, { left: `${timelinePct(time)}%`, backgroundColor: ANCHOR_COLORS[i] }]}
                onPress={() => setPicking(`anchor${i + 1}` as 'anchor1' | 'anchor2' | 'anchor3')}
              >
                <Text style={[s.timelineDotLabel, { fontFamily: fonts.mono, color: t.muted }]}>{time}</Text>
                <View style={[s.dot, { backgroundColor: ANCHOR_COLORS[i] }]}/>
                <Text style={[s.timelineDotSub, { fontFamily: fonts.sans, color: t.ink2 }]}>{labels[i]}</Text>
              </Pressable>
            ))}
          </View>
          <View style={s.timelineEdges}>
            <Text style={[s.edgeLabel, { color: t.soft, fontFamily: fonts.mono }]}>6 AM</Text>
            <Text style={[s.edgeLabel, { color: t.soft, fontFamily: fonts.mono }]}>10 PM</Text>
          </View>
        </Card>

        {/* Gratitude */}
        <Card style={{ marginBottom: 12 }}>
          <View style={s.cardHead}>
            <Eyebrow>Gratitude</Eyebrow>
            <Text style={[s.badge, { color: t.night, fontFamily: fonts.mono }]}>1× / evening</Text>
          </View>
          <Pressable style={s.gratRow} onPress={() => setPicking('gratitude')}>
            <View style={[s.gratIcon, { backgroundColor: t.night }]}>
              <Moon size={20} color="#fff"/>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.gratTime, { fontFamily: fonts.display, color: t.ink }]}>{gratitude}</Text>
              <Text style={[s.gratSub, { color: t.muted, fontFamily: fonts.sans }]}>3 things · ~2 minutes</Text>
            </View>
          </Pressable>
        </Card>

        {/* Other settings */}
        <Card padding={0}>
          <PressableRow label="Quiet hours"   value="Off"          topBorder={false}/>
          <PressableRow label="Weekends"      value="Lighter schedule"/>
          <PressableRow label="Repeat sound"  value="Soft bell"/>
        </Card>
      </ScrollView>

      {picking !== null && (
        <DateTimePicker
          value={toDate(currentPickValue)}
          mode="time"
          is24Hour
          display="spinner"
          onChange={handleChange}
        />
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 14 },
  headerTitle:    { flex: 1, fontSize: 15, textAlign: 'center' },
  content:        { paddingHorizontal: 22, paddingBottom: 40 },
  sub:            { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  cardHead:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  badge:          { fontSize: 11 },
  timeline:       { height: 60, position: 'relative', marginBottom: 4 },
  timelineTrack:  { position: 'absolute', top: 28, left: 0, right: 0, height: 2 },
  timelineDot:    { position: 'absolute', transform: [{ translateX: -18 }], alignItems: 'center', top: 0 },
  dot:            { width: 16, height: 16, borderRadius: 8, marginVertical: 4 },
  timelineDotLabel:{ fontSize: 10 },
  timelineDotSub: { fontSize: 10 },
  timelineEdges:  { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  edgeLabel:      { fontSize: 10 },
  gratRow:        { flexDirection: 'row', alignItems: 'center', gap: 14 },
  gratIcon:       { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  gratTime:       { fontSize: 22 },
  gratSub:        { fontSize: 12, marginTop: 2 },
});
