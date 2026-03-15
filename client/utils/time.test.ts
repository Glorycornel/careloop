import { parseReminderTime, parseTime } from '@/utils/time';

describe('parseTime', () => {
  test('parses a valid 24-hour time', () => {
    expect(parseTime('08:30')).toEqual({ hour: 8, minute: 30 });
    expect(parseTime('23:59')).toEqual({ hour: 23, minute: 59 });
  });

  test('rejects malformed or out-of-range times', () => {
    expect(parseTime('')).toBeNull();
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('12:60')).toBeNull();
    expect(parseTime('abc')).toBeNull();
  });
});

describe('parseReminderTime', () => {
  test('parses AM and PM values into 24-hour reminder time', () => {
    expect(parseReminderTime('08:30', 'AM')).toEqual({
      hour24: 8,
      minute: 30,
      reminder: '08:30',
    });
    expect(parseReminderTime('08:30', 'PM')).toEqual({
      hour24: 20,
      minute: 30,
      reminder: '20:30',
    });
  });

  test('handles 12 AM and 12 PM correctly', () => {
    expect(parseReminderTime('12:00', 'AM')).toEqual({
      hour24: 0,
      minute: 0,
      reminder: '00:00',
    });
    expect(parseReminderTime('12:00', 'PM')).toEqual({
      hour24: 12,
      minute: 0,
      reminder: '12:00',
    });
  });

  test('rejects malformed reminder times', () => {
    expect(parseReminderTime('', 'AM')).toBeNull();
    expect(parseReminderTime('00:15', 'AM')).toBeNull();
    expect(parseReminderTime('13:00', 'PM')).toBeNull();
    expect(parseReminderTime('07:60', 'AM')).toBeNull();
    expect(parseReminderTime('bad', 'PM')).toBeNull();
  });
});
