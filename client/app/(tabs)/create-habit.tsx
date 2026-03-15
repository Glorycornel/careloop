import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { usePalette } from '@/hooks/usePalette';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { scheduleDailyNotification } from '@/lib/notifications';
import { useHabitStore } from '@/store/useHabitStore';
import { HabitCategory } from '@/types/habit';
import { parseReminderTime } from '@/utils/time';

const WEEK_DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const;

const ICON_OPTIONS = [
  '✅', '🗒', '📘', '📚', '🧠', '💡', '🧘', '🙏', '❤️', '💪',
  '🏃', '🚶', '🚴', '🏊', '🤸', '🧍', '😴', '⏰', '🍎', '🥗',
  '🥦', '🍌', '🥕', '💧', '☕', '🍵', '🧃', '🍷', '🚭', '🍬',
  '📵', '📱', '📺', '🎮', '💰', '🧾', '📈', '🎯', '🗓', '📝',
  '🙂', '😄', '🌱', '🔥', '⚖️', '🫁', '🧹', '🌞', '🌙', '⭐',
];

export default function CreateHabitScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { user, requireAuth } = useRequireAuth();
  const addHabit = useHabitStore((state) => state.addHabit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('build');
  const [activeDays, setActiveDays] = useState<string[]>(WEEK_DAYS.map((day) => day.key));
  const [dailyTarget, setDailyTarget] = useState('');
  const [icon, setIcon] = useState('✅');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderPeriod, setReminderPeriod] = useState<'AM' | 'PM'>('AM');
  const [loading, setLoading] = useState(false);

  const activeDaysValue = useMemo(() => activeDays.join(','), [activeDays]);

  const toggleDay = (day: string) => {
    setActiveDays((current) => {
      if (current.includes(day)) {
        return current.filter((item) => item !== day);
      }
      return [...current, day];
    });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Sign up to create habits</Text>
        <Pressable style={styles.primaryButton} onPress={() => requireAuth()}>
          <View style={styles.buttonInner}>
            <Text style={styles.buttonIcon}>＋</Text>
            <Text style={styles.primaryButtonText}>Create account</Text>
          </View>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.secondaryButtonText}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    );
  }

  const onSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Habit name required', 'Please enter a habit name.');
      return;
    }
    if (activeDays.length === 0) {
      Alert.alert('Active days required', 'Select at least one active day.');
      return;
    }

    let parsedTarget: number | null = null;
    if (dailyTarget.trim()) {
      const value = Number(dailyTarget.trim());
      if (!Number.isFinite(value) || value <= 0) {
        Alert.alert('Invalid daily target', 'Enter a positive number or leave it empty.');
        return;
      }
      parsedTarget = Math.round(value);
    }

    const parsedReminder = parseReminderTime(reminderTime, reminderPeriod);
    if (!parsedReminder) {
      Alert.alert('Invalid reminder time', 'Use format hh:mm and choose AM or PM.');
      return;
    }

    setLoading(true);
    try {
      await addHabit({
        title: trimmedTitle,
        description: description.trim() || null,
        category,
        frequency_type: 'daily',
        active_days: activeDaysValue,
        daily_target: parsedTarget,
        icon,
        reminder_time: parsedReminder.reminder,
        is_active: true,
      });
      await scheduleDailyNotification(
        'CareLoop reminder',
        `Time for: ${trimmedTitle}`,
        parsedReminder.hour24,
        parsedReminder.minute,
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 0}
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>Create habit</Text>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>1. Habit name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter habit name"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>2. Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Describe this habit"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>3. Habit type</Text>
          <View style={styles.categoryRow}>
            <Pressable
              style={[styles.categoryChip, category === 'build' && styles.categoryChipActive]}
              onPress={() => setCategory('build')}
            >
              <Text
                style={[styles.categoryChipText, category === 'build' && styles.categoryChipTextActive]}
              >
                Build
              </Text>
            </Pressable>
            <Pressable
              style={[styles.categoryChip, category === 'quit' && styles.categoryChipActive]}
              onPress={() => setCategory('quit')}
            >
              <Text
                style={[styles.categoryChipText, category === 'quit' && styles.categoryChipTextActive]}
              >
                Quit
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>4. Active days</Text>
          <View style={styles.daysWrap}>
            {WEEK_DAYS.map((day) => {
              const selected = activeDays.includes(day.key);
              return (
                <Pressable
                  key={day.key}
                  style={[styles.dayChip, selected && styles.dayChipActive]}
                  onPress={() => toggleDay(day.key)}
                >
                  <Text style={[styles.dayChipText, selected && styles.dayChipTextActive]}>
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>5. Daily target (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 8"
            value={dailyTarget}
            onChangeText={setDailyTarget}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>6. Icon</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map((item) => {
              const selected = icon === item;
              return (
                <Pressable
                  key={item}
                  style={[styles.iconCell, selected && styles.iconCellActive]}
                  onPress={() => setIcon(item)}
                >
                  <Text style={styles.iconText}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>7. Time for daily reminder</Text>
          <View style={styles.timeRow}>
            <TextInput
              style={[styles.input, styles.timeInput]}
              placeholder="hh:mm"
              value={reminderTime}
              onChangeText={setReminderTime}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
            />
            <View style={styles.periodRow}>
              {(['AM', 'PM'] as const).map((period) => (
                <Pressable
                  key={period}
                  onPress={() => setReminderPeriod(period)}
                  style={[styles.periodChip, reminderPeriod === period && styles.periodChipActive]}
                >
                  <Text
                    style={[
                      styles.periodChipText,
                      reminderPeriod === period && styles.periodChipTextActive,
                    ]}
                  >
                    {period}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Text style={styles.timeHint}>Example: 08:30 PM</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonInner}>
              <Text style={styles.buttonIcon}>＋</Text>
              <Text style={styles.primaryButtonText}>Save Habit</Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(palette: typeof Colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  backButtonText: {
    color: palette.primary,
    fontWeight: '700',
  },
  form: {
    gap: 14,
    paddingBottom: 140,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: palette.text,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  categoryChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  categoryChipText: {
    color: palette.text,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  daysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    minWidth: 52,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dayChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  dayChipText: {
    color: palette.text,
    fontWeight: '600',
  },
  dayChipTextActive: {
    color: '#fff',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconCell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCellActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  iconText: {
    fontSize: 20,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 16,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 6,
  },
  periodChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  periodChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  periodChipText: {
    color: palette.text,
    fontWeight: '700',
  },
  periodChipTextActive: {
    color: '#fff',
  },
  timeHint: {
    color: palette.muted,
    fontSize: 12,
  },
  });
}
