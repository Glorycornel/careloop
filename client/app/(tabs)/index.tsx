import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import HabitCard from '@/components/HabitCard';
import { Colors } from '@/constants/colors';
import { usePalette } from '@/hooks/usePalette';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useHabitStore } from '@/store/useHabitStore';

const QUOTES = [
  'Small steps every day lead to big change.',
  'Show up for yourself, even when it is hard.',
  'Consistency beats intensity over time.',
  'Progress is built in ordinary moments.',
  'Your future is shaped by today’s choices.',
  'Discipline is self-respect in action.',
  'Keep the promise you made to yourself.',
  'Start simple, then keep going.',
  'One focused day can shift everything.',
  'Good habits are quiet superpowers.',
  'Do it now, thank yourself later.',
  'Momentum starts with one action.',
];

function getDayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getCalendarParts() {
  const now = new Date();
  const weekday = now
    .toLocaleDateString(undefined, { weekday: 'short' })
    .toUpperCase()
    .slice(0, 3);
  const day = String(now.getDate());
  return { weekday, day };
}

export default function DashboardScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { user, requireAuth } = useRequireAuth();
  const { today, loading, fetchToday, markComplete, reset } = useHabitStore();
  const dayIndex = useMemo(() => getDayIndex(), []);
  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [],
  );
  const dailyQuotes = useMemo(() => {
    const start = dayIndex % QUOTES.length;
    return [QUOTES[start], QUOTES[(start + 1) % QUOTES.length], QUOTES[(start + 2) % QUOTES.length]];
  }, [dayIndex]);
  const calendar = useMemo(() => getCalendarParts(), []);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % dailyQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [dailyQuotes.length]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchToday();
        return;
      }
      reset();
    }, [fetchToday, reset, user]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>{dateLabel}</Text>
          <View style={styles.titleRow}>
            <View style={styles.calendarIcon}>
              <Text style={styles.calendarWeekday}>{calendar.weekday}</Text>
              <Text style={styles.calendarDay}>{calendar.day}</Text>
            </View>
            <Text style={styles.title}>Today</Text>
          </View>
        </View>
        <Pressable style={styles.addButton} onPress={() => router.push('/(tabs)/habits')}>
          <Text style={styles.addIcon}>+</Text>
        </Pressable>
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteLabel}>Daily motivation</Text>
        <Text style={styles.quoteText}>{dailyQuotes[quoteIndex]}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={palette.primary} />
      ) : (
        <FlatList
          data={today}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              onPress={() => router.push(`/(tabs)/habit/${item.id}`)}
              onComplete={() => {
                requireAuth(() => markComplete(item.id));
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              {user ? (
                <Text style={styles.emptyText}>No habits yet. Add your first one.</Text>
              ) : (
                <Pressable onPress={() => router.push('/(auth)/sign-up')}>
                  <Text style={[styles.emptyText, styles.emptyLink]}>Sign up to start tracking habits.</Text>
                </Pressable>
              )}
            </View>
          }
          contentContainerStyle={today.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    dateText: {
      color: palette.muted,
      fontWeight: '600',
      marginBottom: 3,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: palette.text,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    calendarIcon: {
      backgroundColor: palette.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: 6,
      paddingVertical: 3,
      alignItems: 'center',
      minWidth: 36,
    },
    calendarWeekday: {
      fontSize: 8,
      fontWeight: '700',
      lineHeight: 10,
      color: palette.muted,
    },
    calendarDay: {
      fontSize: 13,
      fontWeight: '800',
      lineHeight: 14,
      color: palette.text,
    },
    addButton: {
      backgroundColor: palette.primary,
      width: 42,
      height: 42,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addIcon: {
      color: '#fff',
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 24,
    },
    quoteCard: {
      backgroundColor: `${palette.primary}14`,
      borderWidth: 1,
      borderColor: `${palette.primary}33`,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 14,
      alignItems: 'center',
    },
    quoteLabel: {
      color: palette.primary,
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 1.4,
      opacity: 0.85,
    },
    quoteText: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '500',
      fontStyle: 'italic',
      textAlign: 'center',
      letterSpacing: 0.35,
      opacity: 0.92,
    },
    empty: {
      alignItems: 'center',
    },
    emptyText: {
      color: palette.muted,
      fontSize: 14,
    },
    emptyLink: {
      color: palette.primary,
      fontWeight: '700',
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
    },
  });
}
