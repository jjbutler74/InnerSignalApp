export type Tone = 'sage' | 'terra' | 'amber' | 'soft' | 'night';
export type Mood = 'Heavy' | 'Mixed' | 'Steady' | 'Light' | 'Lit up';
export type Sound = 'bell' | 'chime' | 'silent';
export type Theme = 'light' | 'dark' | 'auto';
export type Slot = 'anchor1' | 'anchor2' | 'anchor3' | 'gratitude';

export interface Pack {
  id: string;
  name: string;
  tone: Tone;
  isBuiltIn: boolean;
  isActive: boolean;
}

export interface Affirmation {
  id: string;
  text: string;
  packId: string;
  isFavorite: boolean;
  seenCount: number;
  createdAt: string; // ISO date string
}

export interface JournalEntry {
  id: string;
  date: string;       // YYYY-MM-DD
  items: string[];    // 1–3 gratitude items
  mood: Mood;
  moodColor: string;
  createdAt: string;  // ISO datetime
}

export interface UserSettings {
  name: string;
  scheduleAnchor1: string;   // "HH:MM"
  scheduleAnchor2: string;
  scheduleAnchor3: string;
  scheduleGratitude: string;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  weekendMode: boolean;
  sound: Sound;
  theme: Theme;
  onboardingComplete: boolean;
}

export interface Completion {
  id: string;
  date: string;           // YYYY-MM-DD
  affirmationId: string;
  slot: Slot;
}

export const MOOD_COLORS: Record<Mood, string> = {
  Heavy:   '#A88276',
  Mixed:   '#C9A86B',
  Steady:  '#9CAE85',
  Light:   '#7AA89A',
  'Lit up': '#C97B5B',
};

export const DEFAULT_SETTINGS: UserSettings = {
  name: '',
  scheduleAnchor1: '07:30',
  scheduleAnchor2: '12:30',
  scheduleAnchor3: '17:00',
  scheduleGratitude: '21:30',
  quietHoursStart: null,
  quietHoursEnd: null,
  weekendMode: false,
  sound: 'bell',
  theme: 'auto',
  onboardingComplete: false,
};
