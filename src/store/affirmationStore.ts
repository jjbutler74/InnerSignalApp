import { create } from 'zustand';
import {
  getPacks, getAffirmations,
  insertAffirmation, toggleFavorite, incrementSeenCount, deleteAffirmation,
} from '../db/queries';
import { today } from '../db/database';
import { useSettingsStore } from './settingsStore';
import type { Pack, Affirmation, Slot } from '../types';

type AnchorSlot = 'anchor1' | 'anchor2' | 'anchor3';
type SlotMap = { anchor1: Affirmation | null; anchor2: Affirmation | null; anchor3: Affirmation | null };

interface AffirmationStore {
  packs: Pack[];
  affirmations: Affirmation[];
  slotAffirmations: SlotMap;
  activeAffirmation: Affirmation | null; // derived: slotAffirmations[activeSlot]
  activeSlot: AnchorSlot;
  activeDate: string;
  loaded: boolean;

  load: () => Promise<void>;
  refreshDailyAffirmations: () => void;
  selectSlotAffirmation: (slot: AnchorSlot) => void;
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
  activeAffirmation: null,
  activeSlot: 'anchor1',
  activeDate: '',
  loaded: false,

  load: async () => {
    const [packs, affirmations] = await Promise.all([getPacks(), getAffirmations()]);
    set({ packs, affirmations, loaded: true });
    get().refreshDailyAffirmations();
  },

  // Called on every TodayScreen focus.
  // - Updates activeSlot based on current time.
  // - On a new calendar day, picks all 3 affirmations (locked in for the day).
  // - Same day: just syncs activeSlot / activeAffirmation, no re-picking.
  refreshDailyAffirmations: () => {
    const { scheduleAnchor2, scheduleAnchor3 } = useSettingsStore.getState();
    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    const slot: AnchorSlot =
      nowMins < toMins(scheduleAnchor2) ? 'anchor1'
    : nowMins < toMins(scheduleAnchor3) ? 'anchor2'
    : 'anchor3';

    const date = today();
    const { activeDate } = get();

    if (date !== activeDate) {
      // New day — pick fresh affirmations for all three slots
      set({ activeDate: date });
      get().selectSlotAffirmation('anchor1');
      get().selectSlotAffirmation('anchor2');
      get().selectSlotAffirmation('anchor3');
    } else {
      // Same day — make sure each locked-in pick is still valid (not
      // deleted, not filtered out by favoritesOnly/pack changes since pick).
      get().validateSlotAffirmations();
    }

    // Sync activeSlot and derive activeAffirmation
    set(s => ({
      activeSlot: slot,
      activeAffirmation: s.slotAffirmations[slot] ?? null,
    }));
  },

  selectSlotAffirmation: (slot) => {
    const { packs, affirmations } = get();
    const activePacks = new Set(packs.filter(p => p.isActive).map(p => p.id));
    const fromActivePacks = affirmations.filter(a => activePacks.has(a.packId));
    const { favoritesOnly } = useSettingsStore.getState();
    const favorites = fromActivePacks.filter(a => a.isFavorite);
    const pool = favoritesOnly && favorites.length > 0 ? favorites : fromActivePacks;

    if (!pool.length) {
      set(s => ({ slotAffirmations: { ...s.slotAffirmations, [slot]: null } }));
      return;
    }

    // Deterministic date+slot hash, biased toward lower seenCount.
    // If the pool has shrunk (e.g. a pick was deleted), this naturally
    // lands on a different, still-available affirmation. A pool of one
    // always resolves to that single affirmation.
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
  // repicks any that are no longer valid (deleted, or filtered out by
  // favoritesOnly/active-pack changes made after the daily lock-in).
  validateSlotAffirmations: () => {
    const { packs, affirmations, slotAffirmations } = get();
    const activePacks = new Set(packs.filter(p => p.isActive).map(p => p.id));
    const fromActivePacks = affirmations.filter(a => activePacks.has(a.packId));
    const { favoritesOnly } = useSettingsStore.getState();
    const favorites = fromActivePacks.filter(a => a.isFavorite);
    const pool = favoritesOnly && favorites.length > 0 ? favorites : fromActivePacks;
    const poolIds = new Set(pool.map(a => a.id));

    (['anchor1', 'anchor2', 'anchor3'] as const).forEach(slot => {
      const current = slotAffirmations[slot];
      if (current && poolIds.has(current.id)) return;
      get().selectSlotAffirmation(slot);
    });
  },

  toggleFavorite: async (id) => {
    const { affirmations, activeAffirmation } = get();
    const aff = affirmations.find(a => a.id === id);
    if (!aff) return;
    await toggleFavorite(id, aff.isFavorite);
    const newFav = !aff.isFavorite;
    set(s => ({
      affirmations: affirmations.map(a => a.id === id ? { ...a, isFavorite: newFav } : a),
      activeAffirmation: activeAffirmation?.id === id
        ? { ...activeAffirmation, isFavorite: newFav }
        : activeAffirmation,
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
    set(s => ({ activeAffirmation: s.slotAffirmations[s.activeSlot] ?? null }));
  },
}));
