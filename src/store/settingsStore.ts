import { create } from 'zustand';
import { loadSettings, saveSettings } from '../db/queries';
import { DEFAULT_SETTINGS, type UserSettings } from '../types';

interface SettingsStore extends UserSettings {
  loaded: boolean;
  load: () => Promise<void>;
  update: (partial: Partial<UserSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    const saved = await loadSettings();
    set({ ...DEFAULT_SETTINGS, ...saved, loaded: true });
  },

  update: async (partial) => {
    set(partial as Partial<SettingsStore>);
    await saveSettings(partial);
  },
}));
