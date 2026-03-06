import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { HabitToday } from '@/types/habit';

type Props = {
  habit: HabitToday;
  onPress?: () => void;
  onComplete?: () => void;
};

export default function HabitCard({ habit, onPress, onComplete }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.title}>{habit.title}</Text>
          {habit.description ? <Text style={styles.desc}>{habit.description}</Text> : null}
        </View>
        <View style={styles.meta}>
          <Text style={styles.streak}>{habit.streak}d</Text>
          <Pressable
            onPress={onComplete}
            style={[styles.button, habit.completed_today && styles.buttonDone]}
          >
            <Text style={styles.buttonText}>
              {habit.completed_today ? 'Done' : 'Mark'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  desc: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.muted,
  },
  meta: {
    alignItems: 'center',
    gap: 8,
  },
  streak: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  buttonDone: {
    backgroundColor: Colors.success,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
