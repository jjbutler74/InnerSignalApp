import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PressableRow } from '../components/PressableRow';
import { Eyebrow, Display, DisplayItalic } from '../components/Typography';
import { ChevL } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../store/settingsStore';
import { useStatsStore } from '../store/statsStore';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

function practicingSince(): string {
  // Placeholder — will use real onboarding date in Phase 6
  return 'Practicing daily';
}

export function SettingsScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const name   = useSettingsStore(s => s.name);
  const sound  = useSettingsStore(s => s.sound);
  const theme  = useSettingsStore(s => s.theme);
  const anchor1 = useSettingsStore(s => s.scheduleAnchor1);
  const anchor2 = useSettingsStore(s => s.scheduleAnchor2);
  const anchor3 = useSettingsStore(s => s.scheduleAnchor3);
  const gratitude = useSettingsStore(s => s.scheduleGratitude);

  const scheduleValue = `${anchor1} · ${anchor2} · ${anchor3}`;
  const initials = (name || '?')[0].toUpperCase();

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
            <Text style={[s.profileSub, { color: t.muted, fontFamily: fonts.sans }]}>{practicingSince()}</Text>
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
            value={`${5} active`}
            onPress={() => nav.navigate('AffirmationLibrary')}
          />
        </Card>

        {/* Sound & feel */}
        <Eyebrow style={{ marginBottom: 8 }}>Sound & feel</Eyebrow>
        <Card padding={0} style={{ marginBottom: 20 }}>
          <PressableRow
            label="Sound"
            value={sound === 'bell' ? 'Soft bell' : sound === 'chime' ? 'Chime' : 'Silent'}
            topBorder={false}
          />
          <PressableRow
            label="Theme"
            value={theme === 'auto' ? 'System' : theme === 'light' ? 'Cream' : 'Dark'}
          />
        </Card>

        {/* Privacy */}
        <Eyebrow style={{ marginBottom: 8 }}>Privacy</Eyebrow>
        <Card padding={0} style={{ marginBottom: 20 }}>
          <PressableRow label="Lock journal"  value="Face Unlock"    topBorder={false}/>
          <PressableRow label="Export"        value="PDF · JSON"/>
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
});
