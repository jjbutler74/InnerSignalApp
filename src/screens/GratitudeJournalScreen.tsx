import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Display, DisplayItalic, Eyebrow } from '../components/Typography';
import { ChevL } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useJournalStore } from '../store/journalStore';
import type { JournalEntry } from '../types';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GratitudeJournal'>;

function calendarDays(): { date: string; day: number; dow: string }[] {
  const result = [];
  const today = new Date();
  for (let i = 10; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push({
      date: d.toISOString().slice(0, 10),
      day:  d.getDate(),
      dow:  ['S','M','T','W','T','F','S'][d.getDay()],
    });
  }
  return result;
}

function formatEntryDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (dateStr === today.toISOString().slice(0, 10))     return `Tonight · ${d.toLocaleDateString('en-US', { weekday: 'short' })}`;
  if (dateStr === yesterday.toISOString().slice(0, 10)) return `Last night · ${d.toLocaleDateString('en-US', { weekday: 'short' })}`;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function GratitudeJournalScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();
  const entries = useJournalStore(s => s.entries);
  const todayStr = new Date().toISOString().slice(0, 10);

  const cal = calendarDays();
  const entryDates = new Set(entries.map(e => e.date));

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={[s.entryCard, { backgroundColor: t.card, borderColor: t.hairline }]}>
      <View style={s.entryHeader}>
        <Text style={[s.entryDate, { color: t.muted, fontFamily: fonts.mono }]}>
          {formatEntryDate(item.date).toUpperCase()}
        </Text>
        <View style={s.moodRow}>
          <View style={[s.moodDot, { backgroundColor: item.moodColor }]}/>
          <Text style={[s.moodLabel, { color: t.ink2, fontFamily: fonts.sans }]}>{item.mood}</Text>
        </View>
      </View>
      <View style={s.items}>
        {item.items.map((text, i) => (
          <View key={i} style={s.itemRow}>
            <Text style={[s.itemDot, { color: item.moodColor }]}>·</Text>
            <Text style={[s.itemText, { fontFamily: fonts.display, color: t.ink }]}>{text}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()}>
          <ChevL size={22} color={t.ink}/>
        </Pressable>
        <Text style={[s.headerTitle, { color: t.ink, fontFamily: fonts.sansMedium }]}>Journal</Text>
        <View style={{ width: 22 }}/>
      </View>

      {/* Title */}
      <View style={s.titleBlock}>
        <Eyebrow>{new Date().toLocaleDateString('en-US', { month: 'long' })} · {entries.length} entries</Eyebrow>
        <Display style={{ fontSize: 30, lineHeight: 34, marginTop: 4 }}>
          {'The '}
          <DisplayItalic style={{ fontSize: 30 }}>small things</DisplayItalic>
          {' kept.'}
        </Display>
      </View>

      {/* Calendar strip */}
      <View style={s.calStrip}>
        {cal.map(({ date, day, dow }) => {
          const isToday  = date === todayStr;
          const hasEntry = entryDates.has(date);
          return (
            <View key={date} style={s.calCell}>
              <Text style={[s.calDow, { color: t.muted, fontFamily: fonts.mono }]}>{dow}</Text>
              <View style={[s.calDay, {
                backgroundColor: isToday ? t.terra : hasEntry ? t.sageSoft : 'transparent',
                borderWidth: isToday || hasEntry ? 0 : 1,
                borderColor: t.divider,
                borderStyle: 'dashed',
              }]}>
                <Text style={[s.calDayNum, {
                  color: isToday ? '#fff' : hasEntry ? t.sage : t.soft,
                  fontFamily: fonts.mono,
                  fontWeight: isToday ? '600' : '500',
                }]}>{day}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={renderEntry}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Eyebrow>No entries yet</Eyebrow>
            <Text style={[s.emptyHint, { color: t.muted, fontFamily: fonts.display }]}>
              Your first gratitude entry will appear here.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 14 },
  headerTitle: { flex: 1, fontSize: 15, textAlign: 'center' },
  titleBlock:  { paddingHorizontal: 22, paddingBottom: 8 },
  calStrip:    { flexDirection: 'row', paddingHorizontal: 22, paddingBottom: 10, gap: 4 },
  calCell:     { flex: 1, alignItems: 'center', gap: 4 },
  calDow:      { fontSize: 10 },
  calDay:      { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  calDayNum:   { fontSize: 11 },
  list:        { paddingHorizontal: 22, paddingBottom: 32, gap: 12 },
  entryCard:   { borderRadius: 14, borderWidth: 1, padding: 14 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  entryDate:   { fontSize: 11, letterSpacing: 0.5 },
  moodRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moodDot:     { width: 8, height: 8, borderRadius: 4 },
  moodLabel:   { fontSize: 11 },
  items:       { gap: 6 },
  itemRow:     { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  itemDot:     { fontSize: 18, lineHeight: 22, marginTop: 1 },
  itemText:    { flex: 1, fontSize: 14, lineHeight: 20 },
  empty:       { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyHint:   { fontSize: 16, fontStyle: 'italic' },
});
