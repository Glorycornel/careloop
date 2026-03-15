import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { usePalette } from '@/hooks/usePalette';
import { HabitToday } from '@/types/habit';

type Props = {
  habit: HabitToday;
  onPress?: () => void;
  onComplete?: () => void;
};

export default function HabitCard({ habit, onPress, onComplete }: Props) {
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <View style={[styles.dot, habit.completed_today ? styles.dotDone : styles.dotPending]} />
            <Text style={styles.title}>{habit.title}</Text>
          </View>
          {habit.description ? <Text style={styles.desc}>{habit.description}</Text> : null}
        </View>
        <View style={styles.meta}>
          <View style={styles.streakWrap}>
            <Text style={styles.streakIcon}>⚡</Text>
            <Text style={styles.streak}>{habit.streak}d</Text>
          </View>
          <Pressable
            onPress={onComplete}
            style={[styles.button, habit.completed_today && styles.buttonDone]}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonIcon}>{habit.completed_today ? '✓' : '○'}</Text>
              <Text style={styles.buttonText}>
                {habit.completed_today ? 'Done' : 'Mark'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function makeStyles(palette: typeof Colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
      borderWidth: 1,
      borderColor: palette.border,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    info: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    dotDone: {
      backgroundColor: palette.success,
    },
    dotPending: {
      backgroundColor: palette.secondary,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    desc: {
      marginTop: 4,
      fontSize: 13,
      color: palette.muted,
    },
    meta: {
      alignItems: 'center',
      gap: 8,
    },
    streakWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: palette.primarySoft,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 999,
    },
    streak: {
      fontSize: 13,
      fontWeight: '700',
      color: palette.primary,
    },
    streakIcon: {
      fontSize: 12,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    buttonDone: {
      backgroundColor: palette.success,
    },
    buttonInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    },
    buttonIcon: {
      color: '#fff',
      fontWeight: '700',
    },
  });
}
