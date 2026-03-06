export type Habit = {
  id: number;
  title: string;
  description?: string | null;
  frequency_type: 'daily' | 'weekly' | string;
  reminder_time?: string | null;
  is_active: boolean;
  created_at: string;
};

export type HabitToday = Habit & {
  completed_today: boolean;
  streak: number;
};
