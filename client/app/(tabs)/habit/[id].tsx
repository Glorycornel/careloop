import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { useHabitStore } from '@/store/useHabitStore';

export default function HabitDetailScreen() {
  const router = useRouter();
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
      <Text style={styles.title}>{habit.title}</Text>
      {habit.description ? <Text style={styles.desc}>{habit.description}</Text> : null}
      <Text style={styles.meta}>Streak: {habit.streak} days</Text>
      <Text style={styles.meta}>Frequency: {habit.frequency_type}</Text>
      {habit.reminder_time ? (
        <Text style={styles.meta}>Reminder: {habit.reminder_time}</Text>
      ) : null}

      <Pressable
        style={styles.button}
        onPress={() => router.push(`/(tabs)/edit-habit/${habit.id}`)}
      >
        <Text style={styles.buttonText}>Edit</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.danger]}
        onPress={async () => {
          await removeHabit(habit.id);
          router.replace('/(tabs)');
        }}
      >
        <Text style={styles.buttonText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  desc: {
    marginTop: 8,
    color: Colors.muted,
  },
  meta: {
    marginTop: 12,
    color: Colors.text,
  },
  button: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
