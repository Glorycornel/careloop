import { create } from 'zustand';

import { createHabit, deleteHabit, getToday, updateHabit, completeHabit } from '@/services/habits';
import { HabitToday } from '@/types/habit';

type HabitState = {
  today: HabitToday[];
  loading: boolean;
  fetchToday: () => Promise<void>;
  addHabit: (payload: {
    title: string;
    description?: string | null;
    frequency_type: string;
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
  async fetchToday() {
    set({ loading: true });
    try {
      const data = await getToday();
      set({ today: data });
    } finally {
      set({ loading: false });
    }
  },
  async addHabit(payload) {
    await createHabit(payload);
    await get().fetchToday();
  },
  async editHabit(id, payload) {
    await updateHabit(id, payload);
    await get().fetchToday();
  },
  async removeHabit(id) {
    await deleteHabit(id);
    await get().fetchToday();
  },
  async markComplete(id) {
    await completeHabit(id);
    await get().fetchToday();
  },
}));
