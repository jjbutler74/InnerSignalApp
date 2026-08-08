import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { DarkScreen } from '../components/Screen';
import { Close, Heart, Check } from '../components/Icons';
import { Eyebrow } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { darkTokens, lightTokens, withAlpha } from '../theme/tokens';
import { useAffirmationStore } from '../store/affirmationStore';
import { useSettingsStore } from '../store/settingsStore';
import { playPreview } from '../utils/sound';
import { useStatsStore } from '../store/statsStore';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AffirmationMoment'>;
type Route = RouteProp<RootStackParamList, 'AffirmationMoment'>;

const SLOT_LABEL: Record<'anchor1' | 'anchor2' | 'anchor3', string> = {
  anchor1: 'Morning anchor',
  anchor2: 'Midday reset',
  anchor3: 'Evening post',
};

const INHALE = 4;
const HOLD   = 4;
const EXHALE = 6;
const CYCLE  = INHALE + HOLD + EXHALE;

const CREAM = darkTokens.ink;
const AMBER = lightTokens.amber;
const SAGE  = lightTokens.sage;
const DIM   = withAlpha(CREAM, 0.5);

function formatTime(secs: number): string {
  return `0:${String(secs).padStart(2, '0')}`;
}

export function AffirmationMomentScreen() {
  const { fonts } = useTheme();
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { slot, reviewOnly } = route.params;

  const affirmation        = useAffirmationStore(s => s.slotAffirmations[slot]);
  const toggleFavorite     = useAffirmationStore(s => s.toggleFavorite);
  const markSeen           = useAffirmationStore(s => s.markSeen);
  const recordCompletion   = useStatsStore(s => s.recordCompletion);
  const completedSlotsToday = useStatsStore(s => s.completedSlotsToday);
  const alreadyDone        = completedSlotsToday.has(slot) || !!reviewOnly;

  const slotTime = useSettingsStore(s =>
    slot === 'anchor1' ? s.scheduleAnchor1 :
    slot === 'anchor2' ? s.scheduleAnchor2 :
                         s.scheduleAnchor3
  );
  const sound = useSettingsStore(s => s.sound);

  const breathAnim  = useRef(new Animated.Value(0)).current;
  const feltItFired = useRef(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(breathAnim, {
        toValue: CYCLE,
        duration: CYCLE * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    animation.start();

    const interval = setInterval(() => {
      setElapsed(prev => (prev + 1) % CYCLE);
    }, 1000);

    return () => {
      animation.stop();
      clearInterval(interval);
    };
  }, []);

  const fillWidth = breathAnim.interpolate({
    inputRange: [0, INHALE, INHALE + HOLD, CYCLE],
    outputRange: ['0%', '100%', '100%', '0%'],
  });

  const breathPhase =
    elapsed < INHALE             ? 'Breathe in'  :
    elapsed < INHALE + HOLD      ? 'Hold'         :
                                   'Breathe out';

  const affText    = affirmation?.text ?? '';
  const dashIdx    = affText.indexOf(' — ');
  const italicPart = dashIdx > -1 ? affText.slice(0, dashIdx) : '';
  const restPart   = dashIdx > -1 ? affText.slice(dashIdx) : affText;

  const handleFeltIt = async () => {
    if (!affirmation || alreadyDone) { nav.navigate('Today'); return; }
    if (feltItFired.current) return;
    feltItFired.current = true;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (sound !== 'silent') playPreview(sound);
      await markSeen(affirmation.id);
      await recordCompletion(affirmation.id, slot);
    } finally {
      nav.navigate('Today');
    }
  };

  const handleSave = () => {
    if (!affirmation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(affirmation.id);
  };

  return (
    <DarkScreen>
      <View style={s.root}>
        {/* Nav bar */}
        <View style={s.navBar}>
          <Pressable onPress={() => nav.goBack()}>
            <Close size={22} color={DIM}/>
          </Pressable>
          <Eyebrow style={{ color: DIM }}>
            {SLOT_LABEL[slot]} · {reviewOnly ? 'Review only' : completedSlotsToday.has(slot) ? 'Done' : slotTime}
          </Eyebrow>
          <View style={{ width: 22 }}/>
        </View>

        {/* Affirmation text */}
        <View style={s.center}>
          {affirmation ? (
            <>
              <Text style={[s.affText, { fontFamily: fonts.display, color: CREAM }]}>
                {italicPart ? (
                  <>
                    <Text style={{ fontStyle: 'italic', color: AMBER }}>{italicPart}</Text>
                    {restPart}
                  </>
                ) : restPart}
              </Text>

              {/* Breathing bar */}
              <View style={s.breathRow}>
                <Text style={[s.breathTimer, { color: DIM, fontFamily: fonts.mono }]}>
                  {formatTime(elapsed)} / {formatTime(CYCLE)}
                </Text>
                <View style={[s.breathTrack, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                  <Animated.View style={[s.breathFill, { backgroundColor: AMBER, width: fillWidth }]}/>
                </View>
              </View>
              <Text style={[s.breathHint, { color: DIM, fontFamily: fonts.display }]}>
                {breathPhase}
              </Text>
            </>
          ) : (
            <Text style={[s.affText, { fontFamily: fonts.display, color: DIM, fontSize: 24, lineHeight: 30 }]}>
              No affirmations available. Add one in your library to get started.
            </Text>
          )}
        </View>

        {/* Actions */}
        {affirmation && (
          <View style={s.actions}>
            <Pressable
              style={[s.saveBtn, { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }]}
              onPress={handleSave}
            >
              <Heart size={16} color={affirmation.isFavorite ? AMBER : withAlpha(CREAM, 0.7)} filled={affirmation.isFavorite}/>
              <Text style={[s.saveBtnText, { color: withAlpha(CREAM, 0.7), fontFamily: fonts.sansMedium }]}>
                {affirmation.isFavorite ? 'Saved' : 'Save'}
              </Text>
            </Pressable>
            {alreadyDone ? (
              <Pressable style={[s.feltBtn, { backgroundColor: SAGE }]} onPress={() => nav.navigate('Today')}>
                <Close size={16} color="#fff"/>
                <Text style={[s.feltBtnText, { fontFamily: fonts.sansMedium }]}>Close</Text>
              </Pressable>
            ) : (
              <Pressable style={[s.feltBtn, { backgroundColor: SAGE }]} onPress={handleFeltIt}>
                <Check size={16} color="#fff"/>
                <Text style={[s.feltBtnText, { fontFamily: fonts.sansMedium }]}>I felt it</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </DarkScreen>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, paddingHorizontal: 26, paddingBottom: 20 },
  navBar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  center:      { flex: 1, justifyContent: 'center' },
  affText:     { fontSize: 38, lineHeight: 46, letterSpacing: -0.6 },
  breathRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26 },
  breathTimer: { fontSize: 12, letterSpacing: 0.5, width: 52 },
  breathTrack: { flex: 1, height: 2, borderRadius: 1 },
  breathFill:  { height: '100%', borderRadius: 1 },
  breathHint:  { fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  actions:     { flexDirection: 'row', gap: 10 },
  saveBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  saveBtnText: { fontSize: 14 },
  feltBtn:     { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  feltBtnText: { fontSize: 14, color: '#fff' },
});
