import { create } from 'zustand';
import {
  getPacks, getAffirmations,
  insertAffirmation, toggleFavorite, incrementSeenCount, deleteAffirmation,
} from '../db/queries';
import { today } from '../db/database';
import { useSettingsStore } from './settingsStore';
import type { Pack, Affirmation, Slot } from '../types';

interface AffirmationStore {
  packs: Pack[];
  affirmations: Affirmation[];
  activeAffirmation: Affirmation | null;
  activeSlot: 'anchor1' | 'anchor2' | 'anchor3';
  loaded: boolean;

  load: () => Promise<void>;
  refreshActiveAffirmation: () => void;
  selectDailyAffirmation: (slot: Slot) => void;
  toggleFavorite: (id: string) => Promise<void>;
  markSeen: (id: string) => Promise<void>;
  addAffirmation: (text: string, packId: string) => Promise<void>;
  deleteAffirmation: (id: string) => Promise<void>;
}

export const useAffirmationStore = create<AffirmationStore>((set, get) => ({
  packs: [],
  affirmations: [],
  activeAffirmation: null,
  activeSlot: 'anchor1',
  loaded: false,

  load: async () => {
    const [packs, affirmations] = await Promise.all([getPacks(), getAffirmations()]);
    set({ packs, affirmations, loaded: true });
    get().refreshActiveAffirmation();
  },

  refreshActiveAffirmation: () => {
    const { scheduleAnchor2, scheduleAnchor3 } = useSettingsStore.getState();
    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const now = new Date().getHours() * 60 + new Date().getMinutes();
    const slot: 'anchor1' | 'anchor2' | 'anchor3' =
      now < toMins(scheduleAnchor2) ? 'anchor1'
    : now < toMins(scheduleAnchor3) ? 'anchor2'
    : 'anchor3';
    set({ activeSlot: slot });
    get().selectDailyAffirmation(slot);
  },

  selectDailyAffirmation: (slot) => {
    const { packs, affirmations } = get();
    const activePacks = new Set(packs.filter(p => p.isActive).map(p => p.id));
    const fromActivePacks = affirmations.filter(a => activePacks.has(a.packId));
    const { favoritesOnly } = useSettingsStore.getState();
    const favorites = fromActivePacks.filter(a => a.isFavorite);
    const pool = favoritesOnly && favorites.length > 0 ? favorites : fromActivePacks;
    if (!pool.length) return;

    // Date-seeded pick, biased toward lower seenCount
    // Sort by seenCount asc, then use date+slot hash to pick consistently per day
    const sorted = [...pool].sort((a, b) => a.seenCount - b.seenCount);
    const dateSlotKey = `${today()}-${slot}`;
    let hash = 0;
    for (let i = 0; i < dateSlotKey.length; i++) {
      hash = (hash * 31 + dateSlotKey.charCodeAt(i)) >>> 0;
    }
    // Weight: bottom 50% of seenCount range gets 80% of picks
    const cutoff = Math.ceil(sorted.length * 0.5);
    const preferLow = (hash % 10) < 8;
    const candidate = preferLow
      ? sorted[hash % cutoff]
      : sorted[cutoff + (hash % (sorted.length - cutoff || 1))];

    set({ activeAffirmation: candidate ?? pool[0] });
  },

  toggleFavorite: async (id) => {
    const { affirmations, activeAffirmation } = get();
    const aff = affirmations.find(a => a.id === id);
    if (!aff) return;
    await toggleFavorite(id, aff.isFavorite);
    const newFav = !aff.isFavorite;
    set({
      affirmations: affirmations.map(a =>
        a.id === id ? { ...a, isFavorite: newFav } : a,
      ),
      activeAffirmation: activeAffirmation?.id === id
        ? { ...activeAffirmation, isFavorite: newFav }
        : activeAffirmation,
    });
  },

  markSeen: async (id) => {
    await incrementSeenCount(id);
    set(s => ({
      affirmations: s.affirmations.map(a =>
        a.id === id ? { ...a, seenCount: a.seenCount + 1 } : a,
      ),
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
      activeAffirmation: s.activeAffirmation?.id === id ? null : s.activeAffirmation,
    }));
  },
}));
