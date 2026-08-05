import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { setupChannels } from '../notifications/channels';
import { scheduleAllNotifications } from '../notifications/scheduler';
import { playPreview } from '../utils/sound';
import { openExactAlarmSettings } from '../utils/exactAlarm';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PressableRow } from '../components/PressableRow';
import { Eyebrow, Display, DisplayItalic } from '../components/Typography';
import { ChevL } from '../components/Icons';
import { Toggle } from '../components/Toggle';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../store/settingsStore';
import { useAffirmationStore } from '../store/affirmationStore';
import { useJournalStore } from '../store/journalStore';
import { useStatsStore } from '../store/statsStore';
import { resetDatabase } from '../db/database';
import { seedIronPacks, seedSagePacks } from '../db/seed';
import { getJournalEntries } from '../db/queries';
import { DEFAULT_SETTINGS } from '../types';
import type { UserSettings } from '../types';
import type { RootStackParamList } from '../../App';
import pkg from '../../package.json';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SOUND_CYCLE: UserSettings['sound'][] = ['bell', 'chime', 'silent'];
const THEME_CYCLE: UserSettings['theme'][]  = ['auto', 'light', 'dark'];

const SOUND_LABEL: Record<UserSettings['sound'], string> = {
  bell: 'Soft bell', chime: 'Chime', silent: 'Silent',
};
const THEME_LABEL: Record<UserSettings['theme'], string> = {
  auto: 'System', light: 'Cream', dark: 'Dark',
};

export function SettingsScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const streakDays  = useStatsStore(s => s.streakDays);
  const activePacks = useAffirmationStore(s => s.packs.filter(p => p.isActive).length);
  const name    = useSettingsStore(s => s.name);
  const sound   = useSettingsStore(s => s.sound);
  const theme   = useSettingsStore(s => s.theme);
  const anchor1       = useSettingsStore(s => s.scheduleAnchor1);
  const anchor2       = useSettingsStore(s => s.scheduleAnchor2);
  const anchor3       = useSettingsStore(s => s.scheduleAnchor3);
  const favoritesOnly = useSettingsStore(s => s.favoritesOnly);
  const update        = useSettingsStore(s => s.update);

  const scheduleValue = `${anchor1} · ${anchor2} · ${anchor3}`;
  const initials = (name || '?')[0].toUpperCase();

  const cycleSound = async () => {
    await Haptics.selectionAsync();
    const next = SOUND_CYCLE[(SOUND_CYCLE.indexOf(sound) + 1) % SOUND_CYCLE.length];
    await update({ sound: next });
    const s = useSettingsStore.getState();
    await setupChannels(s.sound);
    await scheduleAllNotifications(s);
    if (next !== 'silent') await playPreview(next);
  };

  const cycleTheme = async () => {
    await Haptics.selectionAsync();
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
    await update({ theme: next });
  };

  const handleReset = () => {
    Alert.alert(
      'Start fresh?',
      'Your journal entries, streak, and settings will be cleared. Affirmations stay. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset app',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            await seedIronPacks();
            await seedSagePacks();
            useSettingsStore.setState({ ...DEFAULT_SETTINGS, loaded: true });
            await Promise.all([
              useAffirmationStore.getState().load(),
              useJournalStore.getState().load(),
              useStatsStore.getState().load(),
            ]);
            nav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'OnboardingWelcome' }] }));
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      const entries = await getJournalEntries();
      const st = useSettingsStore.getState();
      const data = {
        exportedAt: new Date().toISOString(),
        appVersion: pkg.version,
        settings: {
          name: st.name,
          schedule: {
            morning:  st.scheduleAnchor1,
            midday:   st.scheduleAnchor2,
            evening:  st.scheduleAnchor3,
            gratitude: st.scheduleGratitude,
          },
          gratitudeCount: st.gratitudeCount,
          sound: st.sound,
          theme: st.theme,
          weekendMode: st.weekendMode,
        },
        journal: entries.map(e => ({
          date:  e.date,
          mood:  e.mood,
          items: e.items,
        })),
      };
      await Share.share({
        message: JSON.stringify(data, null, 2),
        title: 'InnerSignal export',
      });
    } catch {
      Alert.alert('Export failed', 'Could not export your data.');
    }
  };

  return (
    <Screen>
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()}>
          <ChevL size={22} color={t.ink}/>
        </Pressable>
        <Text style={[s.headerTitle, { color: t.ink, fontFamily: fonts.sansMedium }]}>Settings</Text>
        <View style={{ width: 22 }}/>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={[s.profileRow, { backgroundColor: t.card, borderRadius: t.rMd, borderColor: t.hairline, borderWidth: 1, marginBottom: 20 }]}>
          <View style={[s.avatar, { backgroundColor: t.terraSoft }]}>
            <Text style={[s.avatarText, { color: t.terra, fontFamily: fonts.display }]}>{initials}</Text>
          </View>
          <View>
            <Text style={[s.profileName, { color: t.ink, fontFamily: fonts.sansMedium }]}>{name || 'You'}</Text>
            <Text style={[s.profileSub, { color: t.muted, fontFamily: fonts.sans }]}>
              {streakDays > 0 ? `${streakDays} day streak` : 'Just getting started'}
            </Text>
          </View>
        </View>

        {/* Practice */}
        <Eyebrow style={{ marginBottom: 8 }}>Practice</Eyebrow>
        <Card padding={0} style={{ marginBottom: 20 }}>
          <PressableRow
            label="Schedule"
            value={scheduleValue}
            topBorder={false}
            onPress={() => nav.navigate('Schedule')}
          />
          <PressableRow
            label="Affirmation packs"
            value={`${activePacks} active`}
            onPress={() => nav.navigate('AffirmationLibrary')}
          />
          <PressableRow
            label="On-time reminders"
            value="Allow exact alarms"
            onPress={openExactAlarmSettings}
          />
          <View style={[s.toggleRow, { borderTopWidth: 1, borderTopColor: t.hairline }]}>
            <Text style={[s.toggleLabel, { color: t.ink, fontFamily: fonts.sansMedium }]}>Favorites only</Text>
            <Toggle
              on={favoritesOnly}
              onToggle={v => update({ favoritesOnly: v })}
            />
          </View>
        </Card>

        {/* Sound & feel */}
        <Eyebrow style={{ marginBottom: 8 }}>Sound & feel</Eyebrow>
        <Card padding={0} style={{ marginBottom: 20 }}>
          <PressableRow
            label="Sound"
            value={SOUND_LABEL[sound]}
            topBorder={false}
            onPress={cycleSound}
          />
          <PressableRow
            label="Theme"
            value={THEME_LABEL[theme]}
            onPress={cycleTheme}
          />
        </Card>

        {/* Recap shortcut */}
        <Pressable
          style={[s.recapBtn, { borderColor: t.hairline }]}
          onPress={() => nav.navigate('WeeklyRecap')}
        >
          <Display style={{ fontSize: 15 }}>
            View <DisplayItalic style={{ fontSize: 15 }}>weekly recap</DisplayItalic> →
          </Display>
        </Pressable>

        {/* Danger zone */}
        <Eyebrow style={{ marginTop: 32, marginBottom: 8 }}>Account</Eyebrow>
        <Card padding={0} style={{ marginBottom: 20 }}>
          <PressableRow
            label="Export data"
            value="JSON"
            topBorder={false}
            onPress={handleExport}
          />
          <PressableRow
            label="Start fresh"
            value="Reset app"
            onPress={handleReset}
            valueStyle={{ color: '#C0392B' }}
          />
        </Card>

        <Text style={[s.version, { color: t.soft, fontFamily: fonts.mono }]}>v{pkg.version}</Text>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 14 },
  headerTitle: { flex: 1, fontSize: 15, textAlign: 'center' },
  content:     { paddingHorizontal: 22, paddingBottom: 40 },
  profileRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  avatar:      { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 22 },
  profileName: { fontSize: 16 },
  profileSub:  { fontSize: 12, marginTop: 3 },
  recapBtn:    { paddingVertical: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  toggleLabel: { flex: 1, fontSize: 14 },
  version:     { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
