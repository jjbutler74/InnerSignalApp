import { create } from 'zustand';
import {
  getPacks, getAffirmations,
  insertAffirmation, toggleFavorite, incrementSeenCount, deleteAffirmation,
  setPackActiveByCategory, deletePacksByCategory, saveSettings,
} from '../db/queries';
import { today } from '../db/database';
import { seedIronPacks, seedSagePacks } from '../db/seed';
import { useSettingsStore } from './settingsStore';
import type { Pack, Affirmation, Slot, TonePreference } from '../types';

type AnchorSlot = 'anchor1' | 'anchor2' | 'anchor3';
type SlotMap = { anchor1: Affirmation | null; anchor2: Affirmation | null; anchor3: Affirmation | null };

interface AffirmationStore {
  packs: Pack[];
  affirmations: Affirmation[];
  slotAffirmations: SlotMap;
  activeDate: string;
  loaded: boolean;

  load: () => Promise<void>;
  setActiveTone: (tone: TonePreference) => Promise<void>;
  refreshDailyAffirmations: () => void;
  selectSlotAffirmation: (slot: AnchorSlot, excludeIds?: Set<string>) => void;
  validateSlotAffirmations: () => void;
  toggleFavorite: (id: string) => Promise<void>;
  markSeen: (id: string) => Promise<void>;
  addAffirmation: (text: string, packId: string) => Promise<void>;
  deleteAffirmation: (id: string) => Promise<void>;
}

const EMPTY_SLOTS: SlotMap = { anchor1: null, anchor2: null, anchor3: null };

export const useAffirmationStore = create<AffirmationStore>((set, get) => ({
  packs: [],
  affirmations: [],
  slotAffirmations: EMPTY_SLOTS,
  activeDate: '',
  loaded: false,

  load: async () => {
    const [packs, affirmations] = await Promise.all([getPacks(), getAffirmations()]);
    set({ packs, affirmations, loaded: true });
    get().refreshDailyAffirmations();
  },

  setActiveTone: async (tone) => {
    await saveSettings({ tonePreference: tone });
    if (tone === 'iron') {
      await seedIronPacks();
      await deletePacksByCategory('sage');
    }
    if (tone === 'sage') {
      await seedSagePacks();
      await deletePacksByCategory('iron');
    }
    await setPackActiveByCategory(tone);
    // Reset activeDate so next refreshDailyAffirmations picks fresh from
    // the new-tone pool rather than just validating existing picks.
    set({ activeDate: '' });
    await get().load();
  },

  // Called on every TodayScreen focus and on cold-start notification taps.
  // New day: picks all 3 affirmations, deduplicated.
  // Same day: re-validates existing picks in case the pool changed.
  refreshDailyAffirmations: () => {
    const date = today();
    const { activeDate } = get();

    if (date !== activeDate) {
      // New day — pick 3 unique affirmations, deduplicating across slots.
      set({ activeDate: date });
      const used = new Set<string>();
      get().selectSlotAffirmation('anchor1', used);
      const a1 = get().slotAffirmations.anchor1;
      if (a1) used.add(a1.id);
      get().selectSlotAffirmation('anchor2', used);
      const a2 = get().slotAffirmations.anchor2;
      if (a2) used.add(a2.id);
      get().selectSlotAffirmation('anchor3', used);
    } else {
      // Same day — repick only slots that became invalid (deleted, filtered out).
      get().validateSlotAffirmations();
    }
  },

  selectSlotAffirmation: (slot, excludeIds = new Set()) => {
    const { packs, affirmations } = get();
    const activePacks = new Set(packs.filter(p => p.isActive).map(p => p.id));
    const fromActivePacks = affirmations.filter(a => activePacks.has(a.packId));
    const { favoritesOnly } = useSettingsStore.getState();
    const favorites = fromActivePacks.filter(a => a.isFavorite);
    const fullPool = favoritesOnly && favorites.length > 0 ? favorites : fromActivePacks;

    // Prefer a unique pick; fall back to full pool when there aren't enough
    // distinct affirmations to go around.
    const pool = excludeIds.size > 0 && fullPool.length > excludeIds.size
      ? fullPool.filter(a => !excludeIds.has(a.id))
      : fullPool;

    if (!pool.length) {
      set(s => ({ slotAffirmations: { ...s.slotAffirmations, [slot]: null } }));
      return;
    }

    // Deterministic date+slot hash, biased toward lower seenCount.
    const sorted = [...pool].sort((a, b) => a.seenCount - b.seenCount);
    const dateSlotKey = `${today()}-${slot}`;
    let hash = 0;
    for (let i = 0; i < dateSlotKey.length; i++) {
      hash = (hash * 31 + dateSlotKey.charCodeAt(i)) >>> 0;
    }
    const cutoff = Math.ceil(sorted.length * 0.5);
    const preferLow = (hash % 10) < 8;
    const candidate = preferLow
      ? sorted[hash % cutoff]
      : sorted[cutoff + (hash % (sorted.length - cutoff || 1))];

    set(s => ({
      slotAffirmations: { ...s.slotAffirmations, [slot]: candidate ?? pool[0] },
    }));
  },

  // Re-checks each locked-in slot pick against the current pool and
  // repicks any that are no longer valid, excluding IDs from still-valid slots.
  validateSlotAffirmations: () => {
    const { packs, affirmations } = get();
    const activePacks = new Set(packs.filter(p => p.isActive).map(p => p.id));
    const fromActivePacks = affirmations.filter(a => activePacks.has(a.packId));
    const { favoritesOnly } = useSettingsStore.getState();
    const favorites = fromActivePacks.filter(a => a.isFavorite);
    const pool = favoritesOnly && favorites.length > 0 ? favorites : fromActivePacks;
    const poolIds = new Set(pool.map(a => a.id));

    (['anchor1', 'anchor2', 'anchor3'] as const).forEach(slot => {
      const current = get().slotAffirmations[slot];
      if (current && poolIds.has(current.id)) return;
      // Build excludeIds from valid picks in other slots (read latest state
      // so we see repicks from earlier iterations).
      const excludeIds = new Set(
        (['anchor1', 'anchor2', 'anchor3'] as const)
          .filter(s => s !== slot)
          .map(s => get().slotAffirmations[s])
          .filter((a): a is Affirmation => a !== null && poolIds.has(a.id))
          .map(a => a.id),
      );
      get().selectSlotAffirmation(slot, excludeIds);
    });
  },

  toggleFavorite: async (id) => {
    const { affirmations } = get();
    const aff = affirmations.find(a => a.id === id);
    if (!aff) return;
    await toggleFavorite(id, aff.isFavorite);
    const newFav = !aff.isFavorite;
    set(s => ({
      affirmations: affirmations.map(a => a.id === id ? { ...a, isFavorite: newFav } : a),
      slotAffirmations: {
        anchor1: s.slotAffirmations.anchor1?.id === id ? { ...s.slotAffirmations.anchor1, isFavorite: newFav } : s.slotAffirmations.anchor1,
        anchor2: s.slotAffirmations.anchor2?.id === id ? { ...s.slotAffirmations.anchor2, isFavorite: newFav } : s.slotAffirmations.anchor2,
        anchor3: s.slotAffirmations.anchor3?.id === id ? { ...s.slotAffirmations.anchor3, isFavorite: newFav } : s.slotAffirmations.anchor3,
      },
    }));
  },

  markSeen: async (id) => {
    await incrementSeenCount(id);
    set(s => ({
      affirmations: s.affirmations.map(a => a.id === id ? { ...a, seenCount: a.seenCount + 1 } : a),
    }));
  },

  addAffirmation: async (text, packId) => {
    const aff = await insertAffirmation(text, packId);
    set(s => ({ affirmations: [aff, ...s.affirmations] }));
  },

  deleteAffirmation: async (id) => {
    await deleteAffirmation(id);
    set(s => ({
      affirmations: s.affirmations.filter(a => a.id !== id),
    }));
    get().validateSlotAffirmations();
  },
}));
