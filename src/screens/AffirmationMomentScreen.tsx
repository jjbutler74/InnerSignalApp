import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Close, Heart, Check } from '../components/Icons';
import { Eyebrow } from '../components/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useAffirmationStore } from '../store/affirmationStore';
import { useStatsStore } from '../store/statsStore';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AffirmationMoment'>;

export function AffirmationMomentScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const activeAffirmation = useAffirmationStore(s => s.activeAffirmation);
  const toggleFavorite    = useAffirmationStore(s => s.toggleFavorite);
  const markSeen          = useAffirmationStore(s => s.markSeen);
  const recordCompletion  = useStatsStore(s => s.recordCompletion);

  const affText = activeAffirmation?.text ?? '';
  const dashIdx = affText.indexOf(' — ');
  const italicPart = dashIdx > -1 ? affText.slice(0, dashIdx) : '';
  const restPart   = dashIdx > -1 ? affText.slice(dashIdx) : affText;

  const handleFeltIt = async () => {
    if (!activeAffirmation) return;
    await markSeen(activeAffirmation.id);
    await recordCompletion(activeAffirmation.id, 'anchor1');
    nav.goBack();
  };

  const handleSave = () => {
    if (activeAffirmation) toggleFavorite(activeAffirmation.id);
  };

  return (
    <Screen bg={t.bg}>
      <View style={[s.root, { backgroundColor: t.bg }]}>
        {/* Nav bar */}
        <View style={s.navBar}>
          <Pressable onPress={() => nav.goBack()}>
            <Close size={22} color={t.muted}/>
          </Pressable>
          <Eyebrow style={{ color: t.sage }}>Midday anchor · 12:30</Eyebrow>
          <View style={{ width: 22 }}/>
        </View>

        {/* Affirmation text */}
        <View style={s.center}>
          <Text style={[s.affText, { fontFamily: fonts.display, color: t.ink }]}>
            {italicPart ? (
              <>
                <Text style={{ fontStyle: 'italic', color: t.terra }}>{italicPart}</Text>
                {restPart}
              </>
            ) : restPart}
          </Text>

          {/* Breathing bar — static for Phase 3, animated in Phase 5 */}
          <View style={s.breathRow}>
            <Text style={[s.breathTimer, { color: t.muted, fontFamily: fonts.mono }]}>0:00 / 0:12</Text>
            <View style={[s.breathTrack, { backgroundColor: t.divider }]}>
              <View style={[s.breathFill, { backgroundColor: t.terra, width: '0%' }]}/>
            </View>
          </View>
          <Text style={[s.breathHint, { color: t.muted, fontFamily: fonts.display }]}>
            Breathe in for 4 · hold for 4 · out for 6
          </Text>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <Pressable
            style={[s.saveBtn, { backgroundColor: t.surface2, borderColor: t.hairline }]}
            onPress={handleSave}
          >
            <Heart size={16} color={activeAffirmation?.isFavorite ? t.terra : t.ink2}/>
            <Text style={[s.saveBtnText, { color: t.ink2, fontFamily: fonts.sansMedium }]}>
              {activeAffirmation?.isFavorite ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
          <Pressable style={[s.feltBtn, { backgroundColor: t.sage }]} onPress={handleFeltIt}>
            <Check size={16} color="#fff"/>
            <Text style={[s.feltBtnText, { fontFamily: fonts.sansMedium }]}>I felt it</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, paddingHorizontal: 26, paddingBottom: 20 },
  navBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  center:     { flex: 1, justifyContent: 'center' },
  affText:    { fontSize: 38, lineHeight: 46, letterSpacing: -0.6 },
  breathRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26 },
  breathTimer:{ fontSize: 12, letterSpacing: 0.5 },
  breathTrack:{ flex: 1, height: 2, borderRadius: 1 },
  breathFill: { height: '100%', borderRadius: 1 },
  breathHint: { fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  actions:    { flexDirection: 'row', gap: 10 },
  saveBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  saveBtnText:{ fontSize: 14 },
  feltBtn:    { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  feltBtnText:{ fontSize: 14, color: '#fff' },
});
