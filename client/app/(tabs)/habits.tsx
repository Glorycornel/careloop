import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { usePalette } from '@/hooks/usePalette';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getHabits } from '@/services/habits';
import { useHabitStore } from '@/store/useHabitStore';
import { Habit, HabitCategory } from '@/types/habit';

type HabitGroup = 'all' | HabitCategory;

type TemplateHabit = {
  title: string;
  description: string;
  group: HabitCategory;
};

const TEMPLATE_HABITS: TemplateHabit[] = [
  { title: 'Read 10 pages', description: 'Grow your mind daily', group: 'build' },
  { title: 'Morning stretch', description: '5 mins to start strong', group: 'build' },
  { title: 'Drink 2L water', description: 'Hydration matters', group: 'build' },
  { title: 'Sleep by 11PM', description: 'Protect recovery', group: 'build' },
  { title: 'No sugary drinks', description: 'Quit daily sugar spikes', group: 'quit' },
  { title: 'No smoking', description: 'Breathe cleaner each day', group: 'quit' },
  { title: 'No doom scrolling', description: 'Limit late-night scrolling', group: 'quit' },
  { title: 'No junk snacks', description: 'Swap for better choices', group: 'quit' },
  { title: 'Walk daily', description: 'Stay consistent with movement', group: 'build' },
  { title: 'Stand more', description: 'Break long sitting periods', group: 'build' },
  { title: 'Sleep 7-8 hours', description: 'Prioritize sleep quality', group: 'build' },
  { title: 'Cycling', description: 'Build cardio and endurance', group: 'build' },
  { title: 'Burn calories', description: 'Reach your energy goal', group: 'build' },
  { title: 'Exercise', description: 'Move your body every day', group: 'build' },
  { title: 'Meditation', description: 'Calm and train your mind', group: 'build' },
  { title: 'Drink water', description: 'Hydrate throughout the day', group: 'build' },
  { title: 'Drink less caffeine', description: 'Reduce stimulant intake', group: 'quit' },
  { title: 'Workout', description: 'Strength or cardio session', group: 'build' },
  { title: 'Run', description: 'Improve cardio fitness', group: 'build' },
  { title: 'Track active calories', description: 'Monitor daily activity output', group: 'build' },
  { title: 'Read a book', description: 'Build focused reading time', group: 'build' },
  { title: 'Study the Bible', description: 'Spend time in scripture', group: 'build' },
  { title: 'Drink less alcohol', description: 'Cut back for better recovery', group: 'quit' },
  { title: 'Anaerobic training', description: 'Train power and intensity', group: 'build' },
  { title: 'Swim', description: 'Low-impact full-body activity', group: 'build' },
  { title: 'Stretch', description: 'Improve mobility and recovery', group: 'build' },
  { title: 'Track expenses', description: 'Know where money goes', group: 'build' },
  { title: 'Save money', description: 'Build financial margin', group: 'build' },
  { title: 'Eat less sugar', description: 'Lower added sugar intake', group: 'quit' },
  { title: 'Breathing practice', description: 'Reset with mindful breathing', group: 'build' },
  { title: 'Learn something new', description: 'Practice daily growth', group: 'build' },
  { title: 'Review the day', description: 'Reflect and improve tomorrow', group: 'build' },
  { title: 'Mind clearing', description: 'Declutter your thoughts', group: 'build' },
  { title: 'Pray', description: 'Daily spiritual connection', group: 'build' },
  { title: 'Fast', description: 'Practice disciplined eating windows', group: 'build' },
  { title: 'Eat fruits', description: 'Add fruit to your meals', group: 'build' },
  { title: 'Eat vegetables', description: 'Increase nutrient-rich foods', group: 'build' },
  { title: 'No sugar', description: 'Avoid added sugars today', group: 'quit' },
  { title: 'No alcohol', description: 'Skip alcohol today', group: 'quit' },
  { title: 'Sleep early', description: 'Wind down and sleep sooner', group: 'build' },
  { title: 'Smile more', description: 'Bring more positivity to your day', group: 'build' },
  { title: 'Laugh out loud', description: 'Make room for joy', group: 'build' },
  { title: 'Eat low fat', description: 'Choose leaner options', group: 'build' },
  { title: 'Eat an apple', description: 'Simple daily fruit target', group: 'build' },
  { title: 'Eat breakfast', description: 'Start your day nourished', group: 'build' },
  { title: 'Drink less sugary beverages', description: 'Reduce sweet drink intake', group: 'quit' },
  { title: 'Watch less TV', description: 'Cut passive screen time', group: 'quit' },
  { title: 'Less social media', description: 'Reduce scrolling time', group: 'quit' },
  { title: 'Spend less', description: 'Control unnecessary spending', group: 'quit' },
  { title: 'Sit less', description: 'Move more during the day', group: 'quit' },
  { title: 'Complain less', description: 'Practice constructive thinking', group: 'quit' },
  { title: 'Play less games', description: 'Limit gaming time', group: 'quit' },
  { title: 'Eat less carbohydrates', description: 'Reduce refined carbs', group: 'quit' },
];

function inferGroup(title: string): HabitGroup {
  const lower = title.toLowerCase();
  if (/(quit|stop|avoid|less|no\s)/.test(lower)) {
    return 'quit';
  }
  return 'build';
}

function iconForHabit(title: string, category?: HabitCategory): string {
  const lower = title.toLowerCase();
  if (/(walk|run|cycling|cycle|swim)/.test(lower)) return '🏃';
  if (/(workout|exercise|anaerobic|active calorie|burn calorie)/.test(lower)) return '💪';
  if (/(stand|sit less|stretch)/.test(lower)) return '🧍';
  if (/(sleep|sleep early)/.test(lower)) return '😴';
  if (/(meditation|mind clearing|breathe|breathing)/.test(lower)) return '🧘';
  if (/(water|hydrate)/.test(lower)) return '💧';
  if (/(caffeine|beverage)/.test(lower)) return '☕';
  if (/(alcohol|alchohol)/.test(lower)) return '🍷';
  if (/(sugar|carbohydrate|fat|breakfast|apple|fruits|vegetables|vege|snack)/.test(lower)) return '🥗';
  if (/(read|book|study|bible|learn)/.test(lower)) return '📚';
  if (/(pray|fast)/.test(lower)) return '🙏';
  if (/(expenses|save money|spend less|spend)/.test(lower)) return '💰';
  if (/(social media|tv|game|doom scrolling)/.test(lower)) return '📱';
  if (/(review the day|review|track)/.test(lower)) return '📝';
  if (/(smile|laugh)/.test(lower)) return '🙂';
  return category === 'quit' ? '🛑' : '✅';
}

export default function HabitsScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { user, requireAuth } = useRequireAuth();
  const addHabit = useHabitStore((state) => state.addHabit);
  const [group, setGroup] = useState<HabitGroup>('all');
  const [loading, setLoading] = useState(false);
  const [addingTemplateTitle, setAddingTemplateTitle] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);

  const loadHabits = useCallback(async () => {
    if (!user) {
      setHabits([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getHabits();
      setHabits(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [loadHabits]),
  );

  const filteredHabits = useMemo(() => {
    if (group === 'all') {
      return habits;
    }
    return habits.filter((habit) => (habit.category ?? inferGroup(habit.title)) === group);
  }, [group, habits]);

  const filteredTemplates = useMemo(() => {
    if (group === 'all') {
      return TEMPLATE_HABITS;
    }
    return TEMPLATE_HABITS.filter((item) => item.group === group);
  }, [group]);

  const existingTemplateTitles = useMemo(
    () => new Set(habits.map((habit) => habit.title.trim().toLowerCase())),
    [habits],
  );

  const addFromTemplate = async (template: TemplateHabit) => {
    const normalizedTitle = template.title.trim().toLowerCase();
    if (addingTemplateTitle === template.title || existingTemplateTitles.has(normalizedTitle)) {
      return;
    }

    requireAuth(async () => {
      setAddingTemplateTitle(template.title);
      try {
        await addHabit({
          title: template.title,
          description: template.description,
          category: template.group,
          frequency_type: 'daily',
          active_days: 'mon,tue,wed,thu,fri,sat,sun',
          daily_target: null,
          icon: iconForHabit(template.title, template.group),
          reminder_time: '08:00',
          is_active: true,
        });
        await loadHabits();
      } finally {
        setAddingTemplateTitle(null);
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>🗒️ Habit Library</Text>
          <Text style={styles.title}>Habits</Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => requireAuth(() => router.push('/(tabs)/create-habit'))}
        >
          <Text style={styles.addIcon}>＋</Text>
          <Text style={styles.addText}>New</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        {(['all', 'build', 'quit'] as HabitGroup[]).map((key) => (
          <Pressable
            key={key}
            onPress={() => setGroup(key)}
            style={[styles.filterChip, group === key && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, group === key && styles.filterTextActive]}>
              {key === 'all' ? 'All' : key === 'build' ? 'Build' : 'Quit'}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>Prebuilt ideas</Text>
            {filteredTemplates.map((template) => (
              <Pressable
                key={template.title}
                style={({ pressed }) => {
                  const isAdding = addingTemplateTitle === template.title;
                  const alreadyAdded = existingTemplateTitles.has(template.title.trim().toLowerCase());
                  return [
                    styles.templateCard,
                    pressed && !isAdding && !alreadyAdded && styles.templateCardPressed,
                    isAdding && styles.templateCardPending,
                    alreadyAdded && styles.templateCardAdded,
                  ];
                }}
                disabled={
                  addingTemplateTitle === template.title ||
                  existingTemplateTitles.has(template.title.trim().toLowerCase())
                }
                onPress={() => addFromTemplate(template)}
              >
                <View style={styles.templateTopRow}>
                  <View style={styles.templateTitleRow}>
                    <Text style={styles.habitIcon}>{iconForHabit(template.title, template.group)}</Text>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                  </View>
                  {addingTemplateTitle === template.title ? (
                    <ActivityIndicator size="small" color={palette.primary} />
                  ) : existingTemplateTitles.has(template.title.trim().toLowerCase()) ? (
                    <Text style={styles.templateAddedLabel}>Added</Text>
                  ) : (
                    <Text style={styles.templateAdd}>＋</Text>
                  )}
                </View>
                <Text style={styles.templateDesc}>{template.description}</Text>
              </Pressable>
            ))}

            <Pressable
              style={styles.customHabitButton}
              onPress={() => requireAuth(() => router.push('/(tabs)/create-habit'))}
            >
              <Text style={styles.customHabitPlus}>＋</Text>
              <Text style={styles.customHabitText}>Custom habit</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Your habits</Text>
            {loading ? (
              <ActivityIndicator size="small" color={palette.primary} style={styles.loader} />
            ) : null}
            {!loading && filteredHabits.length === 0 ? (
              <Text style={styles.emptyText}>
                {user ? 'No habits in this group yet.' : 'Sign up to save habits from this library.'}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.habitCard}
            onPress={() => router.push(`/(tabs)/habit/${item.id}`)}
          >
            <View style={styles.habitTitleRow}>
              <Text style={styles.habitIcon}>{item.icon || iconForHabit(item.title, item.category)}</Text>
              <Text style={styles.habitTitle}>{item.title}</Text>
            </View>
            {!!item.description ? <Text style={styles.habitDesc}>{item.description}</Text> : null}
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eyebrow: {
    color: palette.muted,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    color: palette.text,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addIcon: {
    color: '#fff',
    fontWeight: '800',
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  filterText: {
    color: palette.text,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    color: palette.text,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },
  templateCard: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  templateCardPressed: {
    transform: [{ scale: 0.985 }],
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  templateCardPending: {
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
    opacity: 0.85,
  },
  templateCardAdded: {
    borderColor: palette.border,
    backgroundColor: palette.secondarySoft,
  },
  templateTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateTitle: {
    color: palette.text,
    fontWeight: '700',
  },
  templateAdd: {
    color: palette.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  templateAddedLabel: {
    color: palette.secondary,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  templateDesc: {
    color: palette.muted,
    marginTop: 4,
  },
  customHabitButton: {
    marginTop: 6,
    marginBottom: 2,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  customHabitPlus: {
    color: palette.primary,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 17,
  },
  customHabitText: {
    color: palette.primary,
    fontWeight: '700',
  },
  loader: {
    marginVertical: 8,
  },
  emptyText: {
    color: palette.muted,
    marginBottom: 8,
  },
  habitCard: {
    backgroundColor: palette.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    marginBottom: 8,
  },
  habitTitle: {
    color: palette.text,
    fontWeight: '700',
  },
  habitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitIcon: {
    fontSize: 16,
    lineHeight: 18,
  },
  habitDesc: {
    marginTop: 4,
    color: palette.muted,
  },
  listContent: {
    paddingBottom: 24,
  },
  });
}
