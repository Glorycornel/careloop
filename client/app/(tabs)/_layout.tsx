import { Tabs } from 'expo-router';

import { Colors } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTitleStyle: { color: Colors.text },
        tabBarStyle: { borderTopColor: '#E5E7EB' },
        tabBarActiveTintColor: Colors.primary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="create-habit" options={{ title: 'New Habit' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="habit/[id]" options={{ href: null }} />
      <Tabs.Screen name="edit-habit/[id]" options={{ href: null }} />
    </Tabs>
  );
}
