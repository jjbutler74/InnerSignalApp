import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Close, Check } from '../components/Icons';
import { Eyebrow, Display, DisplayItalic } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useJournalStore } from '../store/journalStore';
import { useStatsStore } from '../store/statsStore';
import { useSettingsStore } from '../store/settingsStore';
import { scheduleAllNotifications } from '../notifications/scheduler';
import { MOOD_COLORS, type Mood } from '../types';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GratitudeComposer'>;

const MOODS: Mood[] = ['Heavy', 'Mixed', 'Steady', 'Clear', 'Resolved'];

export function GratitudeComposerScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const draft       = useJournalStore(s => s.draft);
  const setItem     = useJournalStore(s => s.setDraftItem);
  const setMood     = useJournalStore(s => s.setDraftMood);
  const saveDraft   = useJournalStore(s => s.saveDraft);
  const loadStats   = useStatsStore(s => s.load);
  const slotCount   = useSettingsStore(s => s.gratitudeCount);

  const input1 = useRef<TextInput>(null);
  const input2 = useRef<TextInput>(null);
  const input3 = useRef<TextInput>(null);
  const refs   = [input1, input2, input3];

  const slots = Array.from({ length: slotCount }, (_, i) => i as 0 | 1 | 2);
  const filledCount = draft.items.slice(0, slotCount).filter(i => i.trim()).length;

  const handleSave = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const entry = await saveDraft();
    if (entry) {
      await loadStats();
      scheduleAllNotifications(useSettingsStore.getState());
      nav.dispatch(CommonActions.reset({ index: 1, routes: [{ name: 'Today' }, { name: 'GratitudeJournal' }] }));
    }
  };

  const slotState = (i: number) => {
    if (draft.items[i].trim()) return 'done';
    if (i === 0 || draft.items[i - 1].trim()) return 'active';
    return 'pending';
  };

  return (
    <Screen bg={t.bg}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={[s.root, { backgroundColor: t.bg }]} keyboardShouldPersistTaps="handled">

          {/* Nav */}
          <View style={s.nav}>
            <Pressable onPress={() => nav.goBack()}>
              <Close size={22} color={t.muted}/>
            </Pressable>
            <Eyebrow style={{ color: t.night }}>Tonight · {filledCount} of {slotCount}</Eyebrow>
            <Pressable onPress={() => nav.goBack()}>
              <Text style={[s.skipText, { color: t.muted, fontFamily: fonts.sansMedium }]}>Skip</Text>
            </Pressable>
          </View>

          {/* Prompt */}
          <Display style={{ fontSize: 32, lineHeight: 36, marginTop: 8, marginBottom: 4, letterSpacing: -0.4 }}>
            {'What are you '}
            <DisplayItalic style={{ fontSize: 32, color: t.terra }}>grateful for</DisplayItalic>
            {' today?'}
          </Display>
          <Text style={[s.sub, { color: t.muted, fontFamily: fonts.sans }]}>
            Big or small. A couple minutes is enough.
          </Text>

          {/* Slots */}
          <View style={s.slots}>
            {slots.map(i => {
              const state = slotState(i);
              return (
                <Pressable
                  key={i}
                  style={[
                    s.slot,
                    {
                      backgroundColor: state === 'done' ? t.surface2 : state === 'active' ? t.card : 'transparent',
                      borderColor: state === 'active' ? t.terra : t.hairline,
                      borderStyle: state === 'pending' ? 'dashed' : 'solid',
                      minHeight: state === 'active' ? 110 : 64,
                    },
                  ]}
                  onPress={() => refs[i].current?.focus()}
                >
                  <View style={s.slotHeader}>
                    <View style={[s.slotBadge, {
                      backgroundColor: state === 'done' ? t.sage : state === 'active' ? t.terra : 'transparent',
                      borderWidth: state === 'pending' ? 1.5 : 0,
                      borderColor: t.soft,
                      borderStyle: 'dashed',
                    }]}>
                      {state === 'done'
                        ? <Check size={12} color="#fff"/>
                        : state === 'active'
                          ? <Text style={[s.slotNum, { fontFamily: fonts.mono }]}>{i + 1}</Text>
                          : null}
                    </View>
                    <Text style={[s.slotLabel, {
                      color: state === 'active' ? t.terra : t.muted,
                      fontFamily: fonts.mono,
                    }]}>
                      {state === 'done' ? 'Saved' : state === 'active' ? 'Writing' : `Thing ${i + 1}`}
                    </Text>
                  </View>
                  {state !== 'pending' && (
                    <TextInput
                      ref={refs[i]}
                      style={[s.slotInput, { fontFamily: fonts.display, color: state === 'done' ? t.ink2 : t.soft }]}
                      value={draft.items[i]}
                      onChangeText={v => setItem(i, v)}
                      placeholder={i === 0 ? 'Something that happened today…' : `Thing ${i + 1}…`}
                      placeholderTextColor={t.soft}
                      multiline
                      editable={state === 'active' || state === 'done'}
                      returnKeyType="next"
                      onSubmitEditing={() => refs[i + 1]?.current?.focus()}
                    />
                  )}
                  {state === 'pending' && (
                    <Text style={[s.pendingHint, { fontFamily: fonts.display, color: t.soft }]}>
                      Tap to add the {['first', 'second', 'third'][i]}…
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Mood picker */}
          <Eyebrow style={{ marginBottom: 8 }}>How does the day feel?</Eyebrow>
          <View style={s.moods}>
            {MOODS.map(mood => {
              const active = draft.mood === mood;
              const color  = MOOD_COLORS[mood];
              return (
                <Pressable
                  key={mood}
                  style={[s.moodBtn, {
                    backgroundColor: active ? color : t.surface2,
                    shadowColor: active ? color : 'transparent',
                    shadowOpacity: active ? 0.3 : 0,
                    shadowRadius: 4,
                    elevation: active ? 3 : 0,
                  }]}
                  onPress={() => { Haptics.selectionAsync(); setMood(mood); }}
                >
                  <Text style={[s.moodText, { color: active ? '#fff' : t.ink2, fontFamily: fonts.sansMedium }]}>
                    {mood}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Save */}
          <Pressable
            style={[s.saveBtn, { backgroundColor: t.night, opacity: filledCount > 0 && draft.mood ? 1 : 0.4 }]}
            onPress={handleSave}
            disabled={filledCount === 0 || !draft.mood}
          >
            <Text style={[s.saveBtnText, { fontFamily: fonts.sansMedium }]}>Save & sleep well →</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  root:        { paddingHorizontal: 22, paddingBottom: 32 },
  nav:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  skipText:    { fontSize: 13 },
  sub:         { fontSize: 13, marginBottom: 16 },
  slots:       { gap: 10, marginBottom: 20 },
  slot:        { borderRadius: 14, borderWidth: 1, padding: 14 },
  slotHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  slotBadge:   { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  slotNum:     { fontSize: 11, color: '#fff', fontWeight: '600' },
  slotLabel:   { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  slotInput:   { fontSize: 15, lineHeight: 22 },
  pendingHint: { fontSize: 13, fontStyle: 'italic' },
  moods:       { flexDirection: 'row', gap: 6, marginBottom: 16 },
  moodBtn:     { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  moodText:    { fontSize: 11 },
  saveBtn:     { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 14, color: '#ECEAE5' },
});
