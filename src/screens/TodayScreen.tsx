import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Eyebrow, Display, DisplayItalic } from '../components/Typography';
import { Leaf, Settings, Sun, Bolt, Moon, Heart, Flame, More } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Today'>;

export function TodayScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const schedule = [
    { time: '7:30',  title: 'Morning anchor', sub: 'Set the tone',  status: 'done',    tone: 'sage'  },
    { time: '12:30', title: 'Midday reset',   sub: 'Coming up',     status: 'next',    tone: 'terra' },
    { time: '17:00', title: 'Evening pause',  sub: 'Tonight',       status: 'pending', tone: 'amber' },
    { time: '21:30', title: 'Gratitude',      sub: '3 things',      status: 'pending', tone: 'night' },
  ] as const;

  const weekBars = [1, 1, 1, 0.7, 0.9, 0.5, 0];
  const weekDays = ['M','T','W','T','F','S','S'];

  const toneColor = (tone: string) => {
    switch (tone) {
      case 'sage':  return t.sage;
      case 'terra': return t.terra;
      case 'amber': return t.amber;
      default:      return t.night;
    }
  };
  const toneSoft = (tone: string) => {
    switch (tone) {
      case 'sage':  return t.sageSoft;
      case 'terra': return t.terraSoft;
      case 'amber': return t.amberSoft;
      default:      return t.night;
    }
  };

  return (
    <Screen>
      {/* Header */}
      <View style={[s.header]}>
        <View style={s.headerLeft}>
          <View style={[s.logoBox, { backgroundColor: t.sage }]}>
            <Leaf size={16} color="#fff"/>
          </View>
          <Text style={[s.logoText, { color: t.ink, fontFamily: fonts.sansMedium }]}>InnerSignal</Text>
        </View>
        <Pressable onPress={() => nav.navigate('Settings')}>
          <Settings size={20} color={t.ink2}/>
        </Pressable>
      </View>

      {/* Greeting */}
      <View style={s.greeting}>
        <Eyebrow>Tuesday · May 11</Eyebrow>
        <Display style={{ fontSize: 38, lineHeight: 42, marginTop: 6 }}>
          {'Good morning, '}
          <DisplayItalic style={{ fontSize: 38, color: t.terra }}>Maya</DisplayItalic>
          {'.'}
        </Display>
        <Text style={[s.subtext, { color: t.muted, fontFamily: fonts.sans }]}>
          Your first anchor lands at 9:00.
        </Text>
      </View>

      {/* Tab chips */}
      <View style={s.chips}>
        <Chip tone="sage" active>Today</Chip>
        <Chip tone="soft" onPress={() => nav.navigate('AffirmationLibrary')}>Affirmations</Chip>
        <Chip tone="soft" onPress={() => nav.navigate('GratitudeJournal')}>Journal</Chip>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today's affirmation card */}
        <Card style={{ marginBottom: 12 }}>
          <View style={s.cardHeader}>
            <Eyebrow style={{ color: t.sage }}>Today's affirmation</Eyebrow>
            <Pressable><More size={18} color={t.muted}/></Pressable>
          </View>
          <Display style={{ fontSize: 22, lineHeight: 28, marginTop: 4 }}>
            <DisplayItalic style={{ fontSize: 22, color: t.terra }}>I am allowed</DisplayItalic>
            {' to take up space — and to move slowly when I need to.'}
          </Display>
          <View style={s.cardActions}>
            <Pressable style={[s.actionBtn, { backgroundColor: t.ink }]}>
              <Heart size={14} color={t.bg}/>
              <Text style={[s.actionBtnText, { color: t.bg, fontFamily: fonts.sansMedium }]}>Save to favorites</Text>
            </Pressable>
            <Pressable onPress={() => nav.navigate('AffirmationMoment')}>
              <Text style={[s.ghostBtn, { color: t.muted, fontFamily: fonts.sansMedium }]}>Read & breathe</Text>
            </Pressable>
          </View>
        </Card>

        {/* Day schedule */}
        <Card padding={0} style={{ marginBottom: 12 }}>
          {schedule.map((item, i) => (
            <Pressable
              key={item.time}
              onPress={item.status === 'next' ? () => nav.navigate('AffirmationMoment') : undefined}
              style={[s.scheduleRow, i > 0 && { borderTopWidth: 1, borderTopColor: t.hairline }]}
            >
              <View style={[s.scheduleIcon, {
                backgroundColor: item.tone === 'night' ? t.night : toneSoft(item.tone),
                opacity: item.status === 'done' ? 0.5 : 1,
              }]}>
                {item.tone === 'sage'  && <Sun size={16} color={toneColor(item.tone)}/>}
                {item.tone === 'terra' && <Bolt size={16} color={toneColor(item.tone)}/>}
                {item.tone === 'amber' && <Leaf size={16} color={toneColor(item.tone)}/>}
                {item.tone === 'night' && <Moon size={16} color="#fff"/>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.scheduleTitle, {
                  color: item.status === 'done' ? t.muted : t.ink,
                  textDecorationLine: item.status === 'done' ? 'line-through' : 'none',
                  fontFamily: fonts.sansMedium,
                }]}>{item.title}</Text>
                <Text style={[s.scheduleSub, { color: t.muted, fontFamily: fonts.sans }]}>{item.sub}</Text>
              </View>
              <Text style={[s.scheduleTime, {
                color: item.status === 'next' ? t.terra : t.muted,
                fontFamily: fonts.mono,
                fontWeight: item.status === 'next' ? '600' : '400',
              }]}>{item.time}</Text>
            </Pressable>
          ))}
        </Card>

        {/* Stats row */}
        <View style={s.statsRow}>
          <Card style={{ flex: 1, marginRight: 10 }}>
            <Eyebrow>Streak</Eyebrow>
            <View style={s.streakRow}>
              <Flame size={20} color={t.terra}/>
              <Display style={{ fontSize: 28 }}> 14</Display>
              <Text style={[s.streakUnit, { color: t.muted, fontFamily: fonts.sans }]}> days</Text>
            </View>
          </Card>
          <Card style={{ flex: 1.4 }}>
            <Eyebrow>This week</Eyebrow>
            <View style={s.weekChart}>
              {weekBars.map((v, i) => (
                <View key={i} style={[s.weekBar, {
                  flex: 1,
                  height: Math.max(v * 60, 4),
                  backgroundColor: i === 3 ? t.terra : v ? t.sage : t.divider,
                  opacity: v ? 1 : 0.5,
                }]}/>
              ))}
            </View>
            <View style={s.weekLabels}>
              {weekDays.map((d, i) => (
                <Text key={i} style={[s.weekLabel, {
                  color: i === 3 ? t.terra : t.muted,
                  fontFamily: fonts.mono,
                  fontWeight: i === 3 ? '600' : '400',
                }]}>{d}</Text>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 15 },
  greeting: { paddingHorizontal: 22, paddingBottom: 8 },
  subtext: { fontSize: 14, marginTop: 8 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 22, paddingVertical: 12 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  actionBtnText: { fontSize: 13 },
  ghostBtn: { fontSize: 13 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 10 },
  scheduleIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  scheduleTitle: { fontSize: 14, lineHeight: 17 },
  scheduleSub: { fontSize: 12, lineHeight: 16, marginTop: 1 },
  scheduleTime: { fontSize: 12 },
  statsRow: { flexDirection: 'row' },
  streakRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  streakUnit: { fontSize: 12 },
  weekChart: { flexDirection: 'row', gap: 4, marginTop: 8, alignItems: 'flex-end', height: 64 },
  weekBar: { borderRadius: 3 },
  weekLabels: { flexDirection: 'row', marginTop: 6 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 10 },
});
