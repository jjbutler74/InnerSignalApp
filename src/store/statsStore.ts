import { create } from 'zustand';
import {
  getCompletionDates, getJournalDates,
  getTotalCounts, getWeeklyMoodValues,
  getTodayCompletedSlots,
  recordCompletion,
} from '../db/queries';
import { today, localDateString, parseLocalDate } from '../db/database';
import type { Slot } from '../types';

interface StatsStore {
  streakDays: number;
  lastCompletedDate: string | null;
  totalSeen: number;
  totalEvenings: number;
  weeklyCompletions: boolean[]; // [Mon..Sun], true = had at least one completion
  weeklyMoods: (number | null)[]; // [Mon..Sun], 0–1 normalized mood, null = no entry
  completedSlotsToday: Set<string>;
  statsDate: string;

  load: () => Promise<void>;
  refreshIfNewDay: () => void;
  recordCompletion: (affirmationId: string, slot: Slot) => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  streakDays: 0,
  lastCompletedDate: null,
  totalSeen: 0,
  totalEvenings: 0,
  weeklyCompletions: Array(7).fill(false),
  weeklyMoods: Array(7).fill(null),
  completedSlotsToday: new Set(),
  statsDate: '',

  load: async () => {
    const [completionDates, journalDates, counts, weeklyMoods, todaySlots] = await Promise.all([
      getCompletionDates(365),
      getJournalDates(365),
      getTotalCounts(),
      getWeeklyMoodValues(),
      getTodayCompletedSlots(),
    ]);

    const activeDates = new Set([...completionDates, ...journalDates]);
    const streak = computeStreak(activeDates);
    const candidates = [completionDates[0], journalDates[0]].filter((d): d is string => d != null);
    const lastCompleted = candidates.length > 0 ? candidates.reduce((a, b) => (a > b ? a : b)) : null;
    const weeklyCompletions = computeWeeklyCompletions(activeDates);

    set({
      streakDays: streak,
      lastCompletedDate: lastCompleted,
      totalSeen: counts.totalSeen,
      totalEvenings: counts.totalEvenings,
      weeklyCompletions,
      weeklyMoods,
      completedSlotsToday: new Set(todaySlots),
      statsDate: today(),
    });
  },

  // Re-query today's completions when the calendar date has rolled over
  // while the app stayed open, so checkmarks/strikethroughs clear at midnight.
  refreshIfNewDay: () => {
    if (get().statsDate === today()) return;
    get().load();
  },

  recordCompletion: async (affirmationId, slot) => {
    await recordCompletion(affirmationId, slot);
    const t = today();
    const todayDow = (new Date().getDay() + 6) % 7;
    set(s => ({
      totalSeen: s.totalSeen + 1,
      lastCompletedDate: t,
      streakDays: s.lastCompletedDate === t ? s.streakDays : s.streakDays + 1,
      completedSlotsToday: new Set([...s.completedSlotsToday, slot]),
      weeklyCompletions: s.weeklyCompletions.map((v, i) => i === todayDow ? true : v),
    }));
  },
}));

function computeStreak(activeDates: Set<string>): number {
  let streak = 0;
  const d = new Date();
  // Allow today to count even if not yet completed (don't break streak mid-day)
  for (let i = 0; i < 365; i++) {
    const key = localDateString(d);
    if (activeDates.has(key)) {
      streak++;
    } else if (i > 0) {
      break; // gap found
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function computeWeeklyCompletions(activeDates: Set<string>): boolean[] {
  const monday = getMondayOfCurrentWeek();
  return Array.from({ length: 7 }, (_, i) => {
    const d = parseLocalDate(monday);
    d.setDate(d.getDate() + i);
    return activeDates.has(localDateString(d));
  });
}

function getMondayOfCurrentWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return localDateString(d);
}
