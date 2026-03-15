export type HabitCategory = 'build' | 'quit';

export type Habit = {
  id: number;
  title: string;
  description?: string | null;
  category: HabitCategory;
  frequency_type: 'daily' | 'weekly' | string;
  active_days: string;
  daily_target?: number | null;
  icon?: string | null;
  reminder_time?: string | null;
  is_active: boolean;
  created_at: string;
};

export type HabitToday = Habit & {
  completed_today: boolean;
  streak: number;
};
