import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import HabitCard from '@/components/HabitCard';
import { Colors } from '@/constants/colors';
import { useHabitStore } from '@/store/useHabitStore';

export default function DashboardScreen() {
  const router = useRouter();
  const { today, loading, fetchToday, markComplete } = useHabitStore();

  useFocusEffect(
    useCallback(() => {
      fetchToday();
    }, [fetchToday]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/(tabs)/create-habit')}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={today}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              onPress={() => router.push(`/(tabs)/habit/${item.id}`)}
              onComplete={() => markComplete(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No habits yet. Add your first one.</Text>
            </View>
          }
          contentContainerStyle={today.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 14,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
