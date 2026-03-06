export function parseTime(input: string): { hour: number; minute: number } | null {
  const parts = input.split(':');
  if (parts.length !== 2) return null;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}
