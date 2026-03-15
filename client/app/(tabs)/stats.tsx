import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { usePalette } from '@/hooks/usePalette';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useHabitStore } from '@/store/useHabitStore';

function dayLabel(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

export default function StatsScreen() {
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { user, requireAuth } = useRequireAuth();
  const { today, fetchToday, reset } = useHabitStore();

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchToday();
        return;
      }
      reset();
    }, [fetchToday, reset, user]),
  );

  const stats = useMemo(() => {
    const activeHabits = today.length;
    const completedToday = today.filter((habit) => habit.completed_today).length;
    const dailyCompletion = activeHabits > 0 ? Math.round((completedToday / activeHabits) * 100) : 0;
    const avgStreak =
      activeHabits > 0
        ? today.reduce((sum, habit) => sum + Math.min(habit.streak, 30), 0) / activeHabits
        : 0;
    const monthlyCompletionRate = Math.round((avgStreak / 30) * 100);

    const bars = Array.from({ length: 7 }).map((_, idx) => {
      const offset = 6 - idx;
      const value = today.filter((habit) => habit.streak > offset).length;
      return {
        label: dayLabel(offset),
        value,
      };
    });

    const topStreaks = [...today]
      .filter((habit) => habit.streak > 0)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5);

    return { activeHabits, completedToday, dailyCompletion, monthlyCompletionRate, bars, topStreaks };
  }, [today]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📊 Statistics</Text>
        <Text style={styles.subtitle}>Sign up to view your completion chart and streak badges.</Text>
        <Pressable style={styles.cta} onPress={() => requireAuth()}>
          <Text style={styles.ctaText}>Create account</Text>
        </Pressable>
      </View>
    );
  }

  const maxBar = Math.max(1, ...stats.bars.map((bar) => bar.value));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Statistics</Text>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Daily completion</Text>
          <Text style={styles.metricValue}>{stats.dailyCompletion}%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Active habits</Text>
          <Text style={styles.metricValue}>{stats.activeHabits}</Text>
        </View>
        <View style={styles.metricCardWide}>
          <Text style={styles.metricLabel}>Monthly completion rate</Text>
          <Text style={styles.metricValue}>{stats.monthlyCompletionRate}%</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Last 7 days activity</Text>
        <View style={styles.barRow}>
          {stats.bars.map((bar) => (
            <View key={bar.label} style={styles.barItem}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${Math.max(8, Math.round((bar.value / maxBar) * 100))}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{bar.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.badgeCard}>
        <Text style={styles.sectionTitle}>🔥 Streak badges</Text>
        {stats.topStreaks.length === 0 ? (
          <Text style={styles.empty}>No streak badges yet. Complete habits to earn them.</Text>
        ) : (
          stats.topStreaks.map((habit) => (
            <View key={habit.id} style={styles.badgeRow}>
              <Text style={styles.badgeName}>{habit.title}</Text>
              <Text style={styles.badgePill}>🏅 {habit.streak}d</Text>
            </View>
          ))
        )}
      </View>
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
    fontSize: 28,
    color: palette.text,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: palette.muted,
    marginBottom: 12,
  },
  cta: {
    marginTop: 8,
    backgroundColor: palette.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
  },
  metricsGrid: {
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: palette.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  metricCardWide: {
    backgroundColor: palette.primarySoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  metricLabel: {
    color: palette.muted,
    fontWeight: '600',
  },
  metricValue: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
  },
  chartCard: {
    backgroundColor: palette.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    color: palette.text,
    fontWeight: '700',
    marginBottom: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    height: 150,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 18,
    height: 118,
    backgroundColor: palette.secondarySoft,
    borderRadius: 999,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: palette.secondary,
    borderRadius: 999,
  },
  barLabel: {
    marginTop: 8,
    color: palette.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  badgeCard: {
    backgroundColor: palette.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  empty: {
    color: palette.muted,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeName: {
    color: palette.text,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badgePill: {
    color: palette.text,
    backgroundColor: palette.secondarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '700',
  },
  });
}
