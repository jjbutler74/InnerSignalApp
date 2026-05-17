import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Display, DisplayItalic, Eyebrow } from '../components/Typography';
import { ChevL, Plus, Heart } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useAffirmationStore } from '../store/affirmationStore';
import type { Affirmation, Pack } from '../types';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AffirmationLibrary'>;

export function AffirmationLibraryScreen() {
  const { t, fonts } = useTheme();
  const nav = useNavigation<Nav>();

  const packs         = useAffirmationStore(s => s.packs);
  const affirmations  = useAffirmationStore(s => s.affirmations);
  const toggleFav     = useAffirmationStore(s => s.toggleFavorite);

  const [activePackId, setActivePackId] = useState<string | 'all' | 'favorites'>('all');

  const filtered = affirmations.filter(a => {
    if (activePackId === 'all')       return true;
    if (activePackId === 'favorites') return a.isFavorite;
    return a.packId === activePackId;
  });

  const packById = (id: string): Pack | undefined => packs.find(p => p.id === id);

  const renderItem = ({ item }: { item: Affirmation }) => {
    const pack = packById(item.packId);
    return (
      <Card style={s.affCard}>
        <View style={s.affRow}>
          <Text style={[s.affText, { fontFamily: fonts.display, color: t.ink }]}>{item.text}</Text>
          <Pressable onPress={() => toggleFav(item.id)} hitSlop={8}>
            <Heart
              size={16}
              color={item.isFavorite ? t.terra : t.soft}
              filled={item.isFavorite}
            />
          </Pressable>
        </View>
        <View style={s.affMeta}>
          {pack && <Chip tone={pack.tone}>{pack.name}</Chip>}
          <Text style={[s.seenText, { color: t.muted, fontFamily: fonts.mono }]}>
            seen {item.seenCount}×
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()}>
          <ChevL size={22} color={t.ink}/>
        </Pressable>
        <Text style={[s.headerTitle, { color: t.ink, fontFamily: fonts.sansMedium }]}>Affirmations</Text>
        <Pressable
          style={[s.addBtn, { backgroundColor: t.ink }]}
          onPress={() => nav.navigate('AddAffirmation')}
        >
          <Plus size={16} color={t.bg}/>
        </Pressable>
      </View>

      {/* Title */}
      <View style={s.titleBlock}>
        <Display style={{ fontSize: 32, lineHeight: 36 }}>
          {'Your '}
          <DisplayItalic style={{ fontSize: 32 }}>library</DisplayItalic>
        </Display>
        <Text style={[s.subtitle, { color: t.muted, fontFamily: fonts.sans }]}>
          {affirmations.length} affirmations · {packs.filter(p => p.isActive).length} packs active
        </Text>
      </View>

      {/* Filter chips */}
      <View style={s.chips}>
        <Chip
          tone="sage"
          active={activePackId === 'all'}
          onPress={() => setActivePackId('all')}
        >All</Chip>
        <Chip
          tone="terra"
          active={activePackId === 'favorites'}
          onPress={() => setActivePackId('favorites')}
        >Favorites</Chip>
        {packs.map(p => (
          <Chip
            key={p.id}
            tone={p.tone}
            active={activePackId === p.id}
            onPress={() => setActivePackId(p.id)}
          >{p.name}</Chip>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Eyebrow>Nothing here yet</Eyebrow>
          </View>
        }
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 14 },
  headerTitle: { flex: 1, fontSize: 15, textAlign: 'center' },
  addBtn:      { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titleBlock:  { paddingHorizontal: 22, paddingBottom: 8 },
  subtitle:    { fontSize: 13, marginTop: 4 },
  chips:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 22, paddingBottom: 12 },
  list:        { paddingHorizontal: 22, paddingBottom: 24, gap: 8 },
  affCard:     { gap: 0 },
  affRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  affText:     { flex: 1, fontSize: 15, lineHeight: 21 },
  affMeta:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  seenText:    { fontSize: 11 },
  empty:       { alignItems: 'center', paddingTop: 40 },
});
