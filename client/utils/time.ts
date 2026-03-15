export function parseTime(input: string): { hour: number; minute: number } | null {
  const parts = input.split(':');
  if (parts.length !== 2) return null;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function parseReminderTime(
  input: string,
  period: 'AM' | 'PM',
): { hour24: number; minute: number; reminder: string } | null {
  const parts = input.trim().split(':');
  if (parts.length !== 2) return null;

  const hour12 = Number(parts[0]);
  const minute = Number(parts[1]);
  if (!Number.isFinite(hour12) || !Number.isFinite(minute)) return null;
  if (hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) return null;

  let hour24 = hour12 % 12;
  if (period === 'PM') {
    hour24 += 12;
  }

  return {
    hour24,
    minute,
    reminder: `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
}
