import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { usePalette } from '@/hooks/usePalette';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useHabitStore } from '@/store/useHabitStore';

export default function HabitDetailScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { user, requireAuth } = useRequireAuth();
  const params = useLocalSearchParams();
  const habitId = Number(params.id);
  const { today, removeHabit } = useHabitStore();
  const habit = today.find((item) => item.id === habitId);

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Habit not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{habit.icon ? `${habit.icon} ${habit.title}` : habit.title}</Text>
      {habit.description ? <Text style={styles.desc}>{habit.description}</Text> : null}
      <Text style={styles.meta}>Streak: {habit.streak} days</Text>
      <Text style={styles.meta}>Type: {habit.category === 'quit' ? 'Quit' : 'Build'}</Text>
      <Text style={styles.meta}>Active days: {habit.active_days}</Text>
      {habit.daily_target ? <Text style={styles.meta}>Daily target: {habit.daily_target}</Text> : null}
      {habit.reminder_time ? (
        <Text style={styles.meta}>Reminder: {habit.reminder_time}</Text>
      ) : null}

      <Pressable
        style={styles.button}
        onPress={() => requireAuth(() => router.push(`/(tabs)/edit-habit/${habit.id}`))}
      >
        <View style={styles.buttonInner}>
          <Text style={styles.buttonIcon}>✎</Text>
          <Text style={styles.buttonText}>Edit</Text>
        </View>
      </Pressable>
      <Pressable
        style={[styles.button, styles.danger]}
        onPress={() => requireAuth(async () => {
          await removeHabit(habit.id);
          router.replace('/(tabs)');
        })}
      >
        <View style={styles.buttonInner}>
          <Text style={styles.buttonIcon}>🗑</Text>
          <Text style={styles.buttonText}>Delete</Text>
        </View>
      </Pressable>
      {!user ? (
        <Text style={styles.note}>Sign up to edit, delete, and track this habit.</Text>
      ) : null}
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
    },
    desc: {
      marginTop: 8,
      color: palette.muted,
      fontSize: 15,
    },
    meta: {
      marginTop: 12,
      color: palette.text,
      backgroundColor: palette.primarySoft,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
    },
    button: {
      marginTop: 16,
      backgroundColor: palette.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    danger: {
      backgroundColor: palette.danger,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    },
    buttonIcon: {
      color: '#fff',
    },
    buttonInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    note: {
      marginTop: 12,
      color: palette.muted,
    },
  });
}
