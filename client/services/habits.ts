import api from '@/lib/api';
import { Habit, HabitToday } from '@/types/habit';

type HabitPayload = {
  title: string;
  description?: string | null;
  frequency_type: string;
  reminder_time?: string | null;
  is_active?: boolean;
};

export async function getHabits(): Promise<Habit[]> {
  const response = await api.get('/habits');
  return response.data as Habit[];
}

export async function getToday(): Promise<HabitToday[]> {
  const response = await api.get('/habits/today');
  return response.data as HabitToday[];
}

export async function createHabit(payload: HabitPayload): Promise<Habit> {
  const response = await api.post('/habits', payload);
  return response.data as Habit;
}

export async function updateHabit(id: number, payload: Partial<HabitPayload>): Promise<Habit> {
  const response = await api.patch(`/habits/${id}`, payload);
  return response.data as Habit;
}

export async function deleteHabit(id: number): Promise<void> {
  await api.delete(`/habits/${id}`);
}

export async function completeHabit(id: number): Promise<{ streak: number }> {
  const response = await api.post(`/habits/${id}/complete`);
  return response.data as { streak: number };
}
