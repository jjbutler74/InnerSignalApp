import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Display, DisplayItalic } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { openExactAlarmSettings, requestExactAlarmReschedule } from '../utils/exactAlarm';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OnboardingAlarm'>;

export function OnboardingAlarmScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const goToApp = () =>
    nav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Lock' }] }));

  const handleEnable = async () => {
    // Signal App.tsx's foreground listener to bypass the 30-second debounce
    // on the next active transition. The flag is module-level so it survives
    // the screen unmount that goToApp() triggers while the user is still in
    // Android's system settings UI.
    requestExactAlarmReschedule();
    await openExactAlarmSettings();
    goToApp();
  };

  return (
    <Screen>
      <View style={s.root}>
        <View style={s.dots}>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
          <View style={[s.dot, { backgroundColor: t.divider }]}/>
          <View style={[s.dot, s.dotActive, { backgroundColor: t.sage }]}/>
        </View>

        <Display style={s.heading}>
          {'Arrive '}
          <DisplayItalic style={{ fontSize: 36, lineHeight: 40, letterSpacing: -0.5, color: t.sage }}>on time</DisplayItalic>
        </Display>

        <Text style={[s.body, { color: t.muted, fontFamily: fonts.sans }]}>
          Android can quietly delay notifications by several minutes to save battery. One extra permission fixes that — your anchors will fire at exactly the moment you chose.
        </Text>

        <Text style={[s.instruction, { color: t.ink, fontFamily: fonts.sans }]}>
          Tap below, then toggle{' '}
          <Text style={{ fontFamily: fonts.sansMedium }}>Alarms &amp; reminders</Text>
          {' '}on for InnerSignal.
        </Text>

        <Pressable style={[s.btn, { backgroundColor: t.ink }]} onPress={handleEnable}>
          <Text style={[s.btnText, { color: t.bg, fontFamily: fonts.sansMedium }]}>
            Set up on-time reminders →
          </Text>
        </Pressable>

        <Pressable style={s.skip} onPress={goToApp}>
          <Text style={[s.skipText, { color: t.muted, fontFamily: fonts.sans }]}>
            Skip for now
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, paddingHorizontal: 24, paddingVertical: 20 },
  dots:        { flexDirection: 'row', gap: 4, justifyContent: 'flex-end', marginBottom: 0 },
  dot:         { height: 3, width: 8, borderRadius: 2 },
  dotActive:   { width: 18 },
  heading:     { fontSize: 36, lineHeight: 40, letterSpacing: -0.5, marginTop: 16, marginBottom: 20 },
  body:        { fontSize: 15, lineHeight: 23, marginBottom: 18 },
  instruction: { fontSize: 15, lineHeight: 23, marginBottom: 36 },
  btn:         { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  btnText:     { fontSize: 14 },
  skip:        { alignItems: 'center', paddingVertical: 8 },
  skipText:    { fontSize: 14 },
});
