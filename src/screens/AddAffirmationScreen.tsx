import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Chip } from '../components/Chip';
import { Eyebrow } from '../components/Typography';
import { Close } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useAffirmationStore } from '../store/affirmationStore';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddAffirmation'>;

const MAX = 120;

export function AddAffirmationScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const packs        = useAffirmationStore(s => s.packs);
  const addAffirmation = useAffirmationStore(s => s.addAffirmation);

  const [text, setText] = useState('');
  const [packId, setPackId] = useState<string>(packs[0]?.id ?? '');

  const canSave = text.trim().length > 0 && packId;

  const handleSave = async () => {
    if (!canSave) return;
    await addAffirmation(text.trim(), packId);
    nav.goBack();
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Nav */}
        <View style={s.nav}>
          <Pressable onPress={() => nav.goBack()}>
            <Close size={22} color={t.ink}/>
          </Pressable>
          <Text style={[s.navTitle, { color: t.ink, fontFamily: fonts.sansMedium }]}>New affirmation</Text>
          <Pressable onPress={handleSave} disabled={!canSave}>
            <Text style={[s.saveLabel, { color: canSave ? t.sage : t.soft, fontFamily: fonts.sansMedium }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
          {/* Text input */}
          <Eyebrow style={{ marginBottom: 8 }}>Write your own</Eyebrow>
          <View style={[s.textCard, { backgroundColor: t.card, borderColor: t.hairline }]}>
            <TextInput
              style={[s.textInput, { fontFamily: fonts.display, color: t.ink }]}
              placeholder={'I trust the version of me that…'}
              placeholderTextColor={t.soft}
              value={text}
              onChangeText={t => setText(t.slice(0, MAX))}
              multiline
              autoFocus
            />
          </View>
          <View style={s.charRow}>
            <Text style={[s.hint, { fontFamily: fonts.display, color: t.muted }]}>Start with "I am…" or "I trust…"</Text>
            <Text style={[s.charCount, { fontFamily: fonts.mono, color: t.muted }]}>{text.length} / {MAX}</Text>
          </View>

          {/* Pack picker */}
          <Eyebrow style={{ marginTop: 20, marginBottom: 8 }}>Pack</Eyebrow>
          <View style={s.packRow}>
            {packs.map(p => (
              <Chip
                key={p.id}
                tone={p.tone}
                active={packId === p.id}
                onPress={() => setPackId(p.id)}
              >{p.name}</Chip>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  nav:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 14 },
  navTitle:  { flex: 1, fontSize: 15, textAlign: 'center' },
  saveLabel: { fontSize: 14 },
  body:      { paddingHorizontal: 22, paddingBottom: 32 },
  textCard:  { borderRadius: 14, borderWidth: 1, padding: 16, minHeight: 110 },
  textInput: { fontSize: 22, lineHeight: 30, letterSpacing: -0.3 },
  charRow:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  hint:      { fontSize: 12, fontStyle: 'italic' },
  charCount: { fontSize: 12 },
  packRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
