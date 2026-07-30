import { create } from 'zustand';
import { getJournalEntries, upsertJournalEntry } from '../db/queries';
import { today } from '../db/database';
import { MOOD_COLORS, type JournalEntry, type Mood } from '../types';

interface Draft {
  items: [string, string, string]; // exactly 3 slots
  mood: Mood | null;
}

interface JournalStore {
  entries: JournalEntry[];
  draft: Draft;
  loaded: boolean;

  load: () => Promise<void>;
  setDraftItem: (index: 0 | 1 | 2, text: string) => void;
  setDraftMood: (mood: Mood) => void;
  saveDraft: () => Promise<JournalEntry | null>;
  clearDraft: () => void;
  hydrateDraftFromToday: () => void;
}

const emptyDraft = (): Draft => ({ items: ['', '', ''], mood: null });

export const useJournalStore = create<JournalStore>((set, get) => ({
  entries: [],
  draft: emptyDraft(),
  loaded: false,

  load: async () => {
    const entries = await getJournalEntries();
    set({ entries, loaded: true });
  },

  setDraftItem: (index, text) => {
    const items = [...get().draft.items] as Draft['items'];
    items[index] = text;
    set(s => ({ draft: { ...s.draft, items } }));
  },

  setDraftMood: (mood) => {
    set(s => ({ draft: { ...s.draft, mood } }));
  },

  saveDraft: async () => {
    const { draft, entries } = get();
    const filled = draft.items.filter(t => t.trim().length > 0);
    if (filled.length === 0 || !draft.mood) return null;

    const mood = draft.mood;
    const moodColor = MOOD_COLORS[mood];
    const entry = await upsertJournalEntry(today(), filled, mood, moodColor);

    const existing = entries.findIndex(e => e.date === entry.date);
    const updated = existing >= 0
      ? entries.map((e, i) => (i === existing ? entry : e))
      : [entry, ...entries];

    set({ entries: updated, draft: emptyDraft() });
    return entry;
  },

  clearDraft: () => set({ draft: emptyDraft() }),

  // Lets the composer reopen today's already-saved entry for editing,
  // up until the date rolls over (saveDraft always writes to today()).
  hydrateDraftFromToday: () => {
    const existing = get().entries.find(e => e.date === today());
    if (!existing) return;
    const items: Draft['items'] = ['', '', ''];
    existing.items.forEach((text, i) => { if (i < 3) items[i] = text; });
    set({ draft: { items, mood: existing.mood } });
  },

}));
