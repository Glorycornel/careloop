import { create } from 'zustand';

import { createHabit, deleteHabit, getToday, updateHabit, completeHabit } from '@/services/habits';
import { HabitToday } from '@/types/habit';

const TODAY_CACHE_TTL_MS = 30_000;

type HabitState = {
  today: HabitToday[];
  loading: boolean;
  lastFetchedAt: number | null;
  reset: () => void;
  fetchToday: (options?: { force?: boolean }) => Promise<void>;
  addHabit: (payload: {
    title: string;
    description?: string | null;
    category: 'build' | 'quit';
    frequency_type: string;
    active_days: string;
    daily_target?: number | null;
    icon?: string | null;
    reminder_time?: string | null;
    is_active?: boolean;
  }) => Promise<void>;
  editHabit: (id: number, payload: Partial<HabitState['today'][0]>) => Promise<void>;
  removeHabit: (id: number) => Promise<void>;
  markComplete: (id: number) => Promise<void>;
};

export const useHabitStore = create<HabitState>((set, get) => ({
  today: [],
  loading: false,
  lastFetchedAt: null,
  reset() {
    set({ today: [], loading: false, lastFetchedAt: null });
  },
  async fetchToday(options) {
    const force = options?.force ?? false;
    const lastFetchedAt = get().lastFetchedAt;
    if (!force && lastFetchedAt && Date.now() - lastFetchedAt < TODAY_CACHE_TTL_MS) {
      return;
    }
    set({ loading: true });
    try {
      const data = await getToday();
      set({ today: data, lastFetchedAt: Date.now() });
    } finally {
      set({ loading: false });
    }
  },
  async addHabit(payload) {
    await createHabit(payload);
    await get().fetchToday({ force: true });
  },
  async editHabit(id, payload) {
    await updateHabit(id, payload);
    await get().fetchToday({ force: true });
  },
  async removeHabit(id) {
    await deleteHabit(id);
    await get().fetchToday({ force: true });
  },
  async markComplete(id) {
    await completeHabit(id);
    await get().fetchToday({ force: true });
  },
}));
