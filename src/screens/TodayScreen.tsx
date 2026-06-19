import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Eyebrow, Display, DisplayItalic } from '../components/Typography';
import { SignalMark, Leaf, Settings, Sun, Bolt, Moon, Heart, Flame } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../store/settingsStore';
import { useAffirmationStore } from '../store/affirmationStore';
import { useJournalStore } from '../store/journalStore';
import { useStatsStore } from '../store/statsStore';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Today'>;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase();
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function nextAnchorLabel(a1: string, a2: string, a3: string): string {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  for (const t of [a1, a2, a3]) {
    const [h, m] = t.split(':').map(Number);
    if (h * 60 + m > mins) return t;
  }
  return 'tomorrow';
}

const SLOT_LABEL = { anchor1: 'Morning', anchor2: 'Midday', anchor3: 'Evening' } as const;

export function TodayScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const name             = useSettingsStore(s => s.name);
  const scheduleAnchor1  = useSettingsStore(s => s.scheduleAnchor1);
  const scheduleAnchor2  = useSettingsStore(s => s.scheduleAnchor2);
  const scheduleAnchor3  = useSettingsStore(s => s.scheduleAnchor3);
  const scheduleGratitude = useSettingsStore(s => s.scheduleGratitude);
  const gratitudeCount    = useSettingsStore(s => s.gratitudeCount);

  const activeSlot               = useAffirmationStore(s => s.activeSlot);
  const slotAffirmations         = useAffirmationStore(s => s.slotAffirmations);
  const toggleFavorite           = useAffirmationStore(s => s.toggleFavorite);
  const refreshDailyAffirmations = useAffirmationStore(s => s.refreshDailyAffirmations);
  const affirmationsLoaded       = useAffirmationStore(s => s.loaded);

  const streakDays          = useStatsStore(s => s.streakDays);
  const weeklyCompletions   = useStatsStore(s => s.weeklyCompletions);
  const completedSlotsToday = useStatsStore(s => s.completedSlotsToday);
  const refreshIfNewDay     = useStatsStore(s => s.refreshIfNewDay);

  useFocusEffect(useCallback(() => {
    refreshDailyAffirmations();
    refreshIfNewDay();
  }, []));

  const todayStr = new Date().toISOString().slice(0, 10);
  const gratitudeDone = useJournalStore(s => s.entries.some(e => e.date === todayStr));

  const displayName = name || 'there';
  const nextAnchor  = nextAnchorLabel(scheduleAnchor1, scheduleAnchor2, scheduleAnchor3);

  const toMins = (tm: string) => { const [h, m] = tm.split(':').map(Number); return h * 60 + m; };
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();

  // Main card is time-gated: blank/coming-soon before the morning anchor
  const beforeFirstAnchor = nowMins < toMins(scheduleAnchor1);
  const cardAffirmation   = slotAffirmations[activeSlot];
  const isFav             = cardAffirmation?.isFavorite ?? false;

  const schedule = [
    { time: scheduleAnchor1,   title: 'Morning anchor', sub: 'Hold the line', tone: 'sage',  slot: 'anchor1'   as const },
    { time: scheduleAnchor2,   title: 'Midday reset',   sub: 'On course',    tone: 'terra', slot: 'anchor2'   as const },
    { time: scheduleAnchor3,   title: 'Evening post',   sub: 'Close strong', tone: 'amber', slot: 'anchor3'   as const },
    { time: scheduleGratitude, title: 'Gratitude',      sub: gratitudeCount === 1 ? '1 thing' : `${gratitudeCount} things`, tone: 'night', slot: 'gratitude' as const },
  ] as const;

  // Anchor rows: 'done' only if the user actually read it (not just time-based).
  // 'next' = current active time window. 'pending' = future or past-unread.
  const anchorStatus = (slot: 'anchor1' | 'anchor2' | 'anchor3') => {
    if (completedSlotsToday.has(slot)) return 'done';
    const start = toMins(slot === 'anchor1' ? scheduleAnchor1 : slot === 'anchor2' ? scheduleAnchor2 : scheduleAnchor3);
    const end   = slot === 'anchor1' ? toMins(scheduleAnchor2)
                : slot === 'anchor2' ? toMins(scheduleAnchor3)
                : Infinity;
    if (nowMins >= start && nowMins < end) return 'next';
    return 'pending';
  };

  const statusOf = (time: string) => {
    const m = toMins(time);
    if (m < nowMins - 30) return 'done';
    if (m <= nowMins + 60) return 'next';
    return 'pending';
  };

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

  const weekBars = weeklyCompletions.map(done => done ? 1 : 0);
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayDow = (new Date().getDay() + 6) % 7;

  return (
    <Screen>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={[s.logoBox, { backgroundColor: t.sage }]}>
            <SignalMark size={16} color="#fff"/>
          </View>
          <Text style={[s.logoText, { color: t.ink, fontFamily: fonts.sansMedium }]}>InnerSignal</Text>
        </View>
        <Pressable onPress={() => nav.navigate('Settings')}>
          <Settings size={20} color={t.ink2}/>
        </Pressable>
      </View>

      {/* Greeting */}
      <View style={s.greeting}>
        <Eyebrow>{formattedDate()}</Eyebrow>
        <Display style={{ fontSize: 38, lineHeight: 42, marginTop: 6 }}>
          {`${greeting()}, `}
          <DisplayItalic style={{ fontSize: 38, color: t.terra }}>{displayName}</DisplayItalic>
          {'.'}
        </Display>
        <Text style={[s.subtext, { color: t.muted, fontFamily: fonts.sans }]}>
          {`Your next anchor lands at ${nextAnchor}.`}
        </Text>
      </View>

      {/* Tab chips */}
      <View style={s.chips}>
        <Chip tone="sage" active>Today</Chip>
        <Chip tone="soft" onPress={() => nav.navigate('AffirmationLibrary')}>Affirmations</Chip>
        <Chip tone="soft" onPress={() => nav.navigate('GratitudeJournal')}>Journal</Chip>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Today's affirmation card — blank before morning anchor */}
        {beforeFirstAnchor ? (
          <Card style={{ marginBottom: 12 }}>
            <Eyebrow style={{ color: t.sage }}>Morning Affirmation</Eyebrow>
            <Display style={{ fontSize: 22, lineHeight: 28, marginTop: 4, color: t.muted }}>
              {'Arrives at '}
              <DisplayItalic style={{ fontSize: 22, color: t.muted }}>{fmtTime(scheduleAnchor1)}</DisplayItalic>
            </Display>
            <Text style={[s.comingSoonSub, { color: t.soft, fontFamily: fonts.sans }]}>
              Your affirmations for today are set and ready.
            </Text>
          </Card>
        ) : (
          <Card style={{ marginBottom: 12 }}>
            <View style={s.cardHeader}>
              <Eyebrow style={{ color: t.sage }}>Today's {SLOT_LABEL[activeSlot]} Affirmation</Eyebrow>
            </View>
            <Display style={{ fontSize: 22, lineHeight: 28, marginTop: 4, ...(cardAffirmation ? {} : { color: t.muted }) }}>
              {cardAffirmation?.text ?? (affirmationsLoaded ? 'No affirmations available.' : 'Loading your affirmation…')}
            </Display>
            {!cardAffirmation && affirmationsLoaded && (
              <Text style={[s.comingSoonSub, { color: t.soft, fontFamily: fonts.sans }]}>
                Add an affirmation in your library to get started.
              </Text>
            )}
            {cardAffirmation && (
              <View style={s.cardActions}>
                <Pressable
                  style={[s.actionBtn, { backgroundColor: isFav ? t.terra : t.ink }]}
                  onPress={() => toggleFavorite(cardAffirmation.id)}
                >
                  <Heart size={14} color={t.bg}/>
                  <Text style={[s.actionBtnText, { color: t.bg, fontFamily: fonts.sansMedium }]}>
                    {isFav ? 'Saved' : 'Save to favorites'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => nav.navigate('AffirmationMoment', { slot: activeSlot })}>
                  <Text style={[s.ghostBtn, { color: t.muted, fontFamily: fonts.sansMedium }]}>Read & absorb</Text>
                </Pressable>
              </View>
            )}
          </Card>
        )}

        {/* Day schedule */}
        <Card padding={0} style={{ marginBottom: 12 }}>
          {schedule.map((item, i) => {
            const status = item.slot === 'gratitude'
              ? (gratitudeDone ? 'done' : statusOf(item.time) === 'done' ? 'next' : statusOf(item.time))
              : anchorStatus(item.slot);
            // Anchor rows are always tappable (including crossed-off, to re-read).
            // Gratitude row: tappable until done.
            const canTap = item.slot === 'gratitude'
              ? (status !== 'done')
              : true;
            return (
              <Pressable
                key={item.time}
                onPress={canTap ? () => item.slot === 'gratitude'
                  ? nav.navigate('EveningNotif')
                  : nav.navigate('AffirmationMoment', { slot: item.slot })
                  : undefined}
                style={[s.scheduleRow, i > 0 && { borderTopWidth: 1, borderTopColor: t.hairline }]}
              >
                <View style={[s.scheduleIcon, {
                  backgroundColor: item.tone === 'night' ? t.night : toneSoft(item.tone),
                  opacity: status === 'done' ? 0.5 : 1,
                }]}>
                  {item.tone === 'sage'  && <Sun  size={16} color={toneColor(item.tone)}/>}
                  {item.tone === 'terra' && <Bolt size={16} color={toneColor(item.tone)}/>}
                  {item.tone === 'amber' && <Leaf size={16} color={toneColor(item.tone)}/>}
                  {item.tone === 'night' && <View style={{ transform: [{ rotate: '180deg' }], marginTop: -5, marginLeft: 5 }}><Moon size={16} color="#fff"/></View>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.scheduleTitle, {
                    color: status === 'done' ? t.muted : t.ink,
                    textDecorationLine: status === 'done' ? 'line-through' : 'none',
                    fontFamily: fonts.sansMedium,
                  }]}>{item.title}</Text>
                  <Text style={[s.scheduleSub, { color: t.muted, fontFamily: fonts.sans }]}>{item.sub}</Text>
                </View>
                <Text style={[s.scheduleTime, {
                  color: status === 'next' ? t.terra : t.muted,
                  fontFamily: fonts.mono,
                  fontWeight: status === 'next' ? '600' : '400',
                }]}>{item.time}</Text>
              </Pressable>
            );
          })}
        </Card>

        {/* Stats row */}
        <View style={s.statsRow}>
          <Card style={{ flex: 1, marginRight: 10 }}>
            <Eyebrow>Streak</Eyebrow>
            <View style={s.streakRow}>
              <Flame size={20} color={t.terra}/>
              <Display style={{ fontSize: 28 }}> {streakDays}</Display>
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
                  backgroundColor: i === todayDow ? t.terra : v ? t.sage : t.divider,
                  opacity: i > todayDow ? 0.35 : 1,
                }]}/>
              ))}
            </View>
            <View style={s.weekLabels}>
              {weekDays.map((d, i) => (
                <Text key={i} style={[s.weekLabel, {
                  color: i === todayDow ? t.terra : t.muted,
                  fontFamily: fonts.mono,
                  fontWeight: i === todayDow ? '600' : '400',
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
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 14 },
  headerLeft:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox:       { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoText:      { fontSize: 15 },
  greeting:      { paddingHorizontal: 22, paddingBottom: 8 },
  subtext:       { fontSize: 14, marginTop: 8 },
  chips:         { flexDirection: 'row', gap: 8, paddingHorizontal: 22, paddingVertical: 12 },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingBottom: 24 },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardActions:   { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14 },
  actionBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  actionBtnText: { fontSize: 13 },
  ghostBtn:      { fontSize: 13 },
  comingSoonSub: { fontSize: 13, marginTop: 10 },
  scheduleRow:   { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 10 },
  scheduleIcon:  { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  scheduleTitle: { fontSize: 14, lineHeight: 17 },
  scheduleSub:   { fontSize: 12, lineHeight: 16, marginTop: 1 },
  scheduleTime:  { fontSize: 12 },
  statsRow:      { flexDirection: 'row' },
  streakRow:     { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  streakUnit:    { fontSize: 12 },
  weekChart:     { flexDirection: 'row', gap: 4, marginTop: 8, alignItems: 'flex-end', height: 64 },
  weekBar:       { borderRadius: 3 },
  weekLabels:    { flexDirection: 'row', marginTop: 6 },
  weekLabel:     { flex: 1, textAlign: 'center', fontSize: 10 },
});
