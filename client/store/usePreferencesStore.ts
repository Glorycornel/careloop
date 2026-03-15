import { create } from 'zustand';

import { getThemeMode, saveThemeMode } from '@/lib/storage';

type ThemeMode = 'light' | 'dark';

type PreferencesState = {
  themeMode: ThemeMode;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  themeMode: 'light',
  isHydrated: false,
  async hydrate() {
    const mode = await getThemeMode();
    set({ themeMode: mode, isHydrated: true });
  },
  async setThemeMode(mode) {
    await saveThemeMode(mode);
    set({ themeMode: mode });
  },
}));
