import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Display, DisplayItalic, Eyebrow } from '../components/Typography';
import { ChevL, Flame, Heart, Moon } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useStatsStore } from '../store/statsStore';
import { useAffirmationStore } from '../store/affirmationStore';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'WeeklyRecap'>;

function weekLabel(): string {
  const end = new Date();
  const start = new Date(); start.setDate(end.getDate() - 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `Week of ${fmt(start)} – ${fmt(end)}`;
}

function buildMoodPath(moods: (number | null)[]): { line: string; fill: string } {
  const W = 200, H = 80, yRange = 60, yBase = 15;
  const pts = moods.map((v, i) => ({
    x: (i / 6) * W,
    y: H - yBase - (v ?? 0) * yRange,
  }));

  if (pts.every(p => p.y === H - yBase)) {
    const y = H - yBase;
    return {
      line: `M 0 ${y} L ${W} ${y}`,
      fill: `M 0 ${y} L ${W} ${y} L ${W} ${H} L 0 ${H} Z`,
    };
  }

  // Smooth curve using cubic bezier control points
  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
    const cp2x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
    line += ` C ${cp1x} ${pts[i - 1].y}, ${cp2x} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const fill = `${line} L ${W} ${H} L 0 ${H} Z`;
  return { line, fill };
}

export function WeeklyRecapScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const streakDays    = useStatsStore(s => s.streakDays);
  const totalSeen     = useStatsStore(s => s.totalSeen);
  const totalEvenings = useStatsStore(s => s.totalEvenings);
  const weeklyMoods   = useStatsStore(s => s.weeklyMoods);

  const affirmations  = useAffirmationStore(s => s.affirmations);
  const topAffirmation = [...affirmations].sort((a, b) => b.seenCount - a.seenCount)[0];

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const { line, fill } = buildMoodPath(weeklyMoods);

  const stats = [
    { n: String(streakDays),    label: 'day streak',      Icon: Flame, tone: 'terra' as const },
    { n: String(totalSeen),     label: 'affirmations',    Icon: Heart, tone: 'sage'  as const },
    { n: String(totalEvenings), label: 'evenings logged', Icon: Moon,  tone: 'night' as const },
  ];

  return (
    <Screen>
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()}>
          <ChevL size={22} color={t.ink}/>
        </Pressable>
        <Text style={[s.headerTitle, { color: t.ink, fontFamily: fonts.sansMedium }]}>Weekly recap</Text>
        <View style={{ width: 22 }}/>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Eyebrow>{weekLabel()}</Eyebrow>
        <Display style={{ fontSize: 32, lineHeight: 36, marginTop: 4, marginBottom: 16 }}>
          {'A '}
          <DisplayItalic style={{ fontSize: 32, color: t.terra }}>good</DisplayItalic>
          {' week.'}
        </Display>

        {/* Stat cards */}
        <View style={s.statsRow}>
          {stats.map(({ n, label, Icon, tone }) => (
            <Card key={label} style={s.statCard}>
              <View style={[s.statIcon, {
                backgroundColor: tone === 'night' ? t.night : tone === 'terra' ? t.terraSoft : t.sageSoft,
              }]}>
                {tone === 'night' ? (
                  <View style={{ transform: [{ rotate: '180deg' }], marginTop: -4, marginLeft: 4 }}>
                    <Icon size={14} color="#fff"/>
                  </View>
                ) : (
                  <Icon size={14} color={tone === 'terra' ? t.terra : t.sage}/>
                )}
              </View>
              <Text style={[s.statN, { fontFamily: fonts.display, color: t.ink }]}>{n}</Text>
              <Text style={[s.statLabel, { fontFamily: fonts.mono, color: t.muted }]}>{label.toUpperCase()}</Text>
            </Card>
          ))}
        </View>

        {/* Mood arc */}
        <Card style={{ marginBottom: 12 }}>
          <Eyebrow>Mood arc</Eyebrow>
          <View style={{ marginTop: 12, height: 80 }}>
            <Svg width="100%" height="80" viewBox="0 0 200 80" preserveAspectRatio="none">
              <Path d={fill} fill={t.terraSoft} opacity={0.5}/>
              <Path d={line} stroke={t.terra} strokeWidth={2} fill="none" strokeLinecap="round"/>
            </Svg>
          </View>
          <View style={s.moodDays}>
            {weekDays.map((d, i) => (
              <Text key={i} style={[s.moodDay, { color: t.muted, fontFamily: fonts.mono }]}>{d}</Text>
            ))}
          </View>
        </Card>

        {/* Top affirmation */}
        {topAffirmation && topAffirmation.seenCount > 0 && (
          <Card>
            <Eyebrow style={{ color: t.sage }}>The one that stayed</Eyebrow>
            <Text style={[s.topAff, { fontFamily: fonts.display, color: t.ink }]}>
              {topAffirmation.text}
            </Text>
            <Text style={[s.topAffMeta, { fontFamily: fonts.mono, color: t.muted }]}>
              FELT IT · {topAffirmation.seenCount} TIMES
            </Text>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 14 },
  headerTitle:{ flex: 1, fontSize: 15, textAlign: 'center' },
  content:    { paddingHorizontal: 22, paddingBottom: 32 },
  statsRow:   { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard:   { flex: 1, alignItems: 'center', gap: 4 },
  statIcon:   { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statN:      { fontSize: 26, lineHeight: 30 },
  statLabel:  { fontSize: 9, letterSpacing: 0.5, textAlign: 'center' },
  moodDays:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  moodDay:    { fontSize: 10 },
  topAff:     { fontSize: 19, lineHeight: 26, marginTop: 8, letterSpacing: -0.3 },
  topAffMeta: { fontSize: 10, letterSpacing: 0.5, marginTop: 8 },
});
