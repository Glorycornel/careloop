import { useMemo } from 'react';

import { Colors, DarkColors } from '@/constants/colors';
import { usePreferencesStore } from '@/store/usePreferencesStore';

export function usePalette() {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  return useMemo(() => (themeMode === 'dark' ? DarkColors : Colors), [themeMode]);
}
