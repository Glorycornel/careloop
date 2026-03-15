import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { usePalette } from '@/hooks/usePalette';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { scheduleDailyNotification } from '@/lib/notifications';
import { useHabitStore } from '@/store/useHabitStore';
import { parseTime } from '@/utils/time';

export default function EditHabitScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { user, requireAuth } = useRequireAuth();
  const params = useLocalSearchParams();
  const habitId = Number(params.id);
  const { today, editHabit } = useHabitStore();
  const habit = today.find((item) => item.id === habitId);

  const [title, setTitle] = useState(habit?.title ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(
    habit?.frequency_type === 'weekly' ? 'weekly' : 'daily',
  );
  const [reminderTime, setReminderTime] = useState(habit?.reminder_time ?? '08:00');
  const [isActive, setIsActive] = useState(habit?.is_active ?? true);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sign up to edit habits</Text>
        <Text style={styles.subtitle}>Editing and saving changes requires an account.</Text>
        <Pressable style={styles.button} onPress={() => requireAuth()}>
          <View style={styles.buttonInner}>
            <Text style={styles.buttonIcon}>＋</Text>
            <Text style={styles.buttonText}>Create account</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Habit not found</Text>
      </View>
    );
  }

  const onSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await editHabit(habitId, {
        title: title.trim(),
        description: description.trim() || null,
        frequency_type: frequency,
        reminder_time: reminderTime,
        is_active: isActive,
      });

      const parsed = parseTime(reminderTime);
      if (parsed) {
        await scheduleDailyNotification(
          'CareLoop reminder',
          `Time for: ${title.trim()}`,
          parsed.hour,
          parsed.minute,
        );
      }
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit habit</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Reminder time (HH:MM)"
          value={reminderTime}
          onChangeText={setReminderTime}
        />
        <View style={styles.row}>
          <Text style={styles.label}>Daily</Text>
          <Switch
            value={frequency === 'daily'}
            onValueChange={(value) => setFrequency(value ? 'daily' : 'weekly')}
          />
          <Text style={styles.label}>Weekly</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Active</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>
      </View>

      <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonInner}>
            <Text style={styles.buttonIcon}>✎</Text>
            <Text style={styles.buttonText}>Save Changes</Text>
          </View>
        )}
      </Pressable>
    </View>
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
    form: {
      gap: 12,
    },
    subtitle: {
      color: palette.muted,
      marginBottom: 12,
    },
    input: {
      backgroundColor: palette.card,
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: palette.primarySoft,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    label: {
      color: palette.text,
    },
    button: {
      marginTop: 20,
      backgroundColor: palette.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    },
    buttonInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    buttonIcon: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 16,
    },
  });
}
