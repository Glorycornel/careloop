import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useMemo } from 'react';

import { Colors, DarkColors } from '@/constants/colors';
import { usePreferencesStore } from '@/store/usePreferencesStore';

function TabIcon({
  icon,
  color,
  focused,
  primary,
}: {
  icon: string;
  color: string;
  focused: boolean;
  primary: string;
}) {
  return (
    <Text
      style={{
        color,
        fontSize: 16,
        backgroundColor: focused ? `${primary}20` : 'transparent',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        overflow: 'hidden',
        borderWidth: focused ? 1 : 0,
        borderColor: focused ? `${primary}66` : 'transparent',
      }}
    >
      {icon}
    </Text>
  );
}

function DynamicCalendarIcon({
  color,
  focused,
  primary,
}: {
  color: string;
  focused: boolean;
  primary: string;
}) {
  const now = new Date();
  const weekday = now
    .toLocaleDateString(undefined, { weekday: 'short' })
    .toUpperCase()
    .slice(0, 3);
  const day = String(now.getDate());

  return (
    <View
      style={{
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderWidth: focused ? 1 : 0,
        borderColor: focused ? `${primary}66` : 'transparent',
        backgroundColor: focused ? `${primary}20` : 'transparent',
        minWidth: 38,
        alignItems: 'center',
      }}
    >
      <Text style={{ color, fontSize: 8, fontWeight: '700', lineHeight: 10 }}>{weekday}</Text>
      <Text style={{ color, fontSize: 13, fontWeight: '800', lineHeight: 14 }}>{day}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const palette = useMemo(() => (themeMode === 'dark' ? DarkColors : Colors), [themeMode]);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTitleStyle: { color: palette.text },
        tabBarStyle: {
          borderTopColor: palette.border,
          backgroundColor: palette.card,
          height: 64,
          paddingTop: 6,
        },
        sceneStyle: { backgroundColor: palette.background },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <DynamicCalendarIcon color={color} focused={focused} primary={palette.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="🗒" color={color} focused={focused} primary={palette.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="📊" color={color} focused={focused} primary={palette.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="⚙️" color={color} focused={focused} primary={palette.primary} />
          ),
        }}
      />
      <Tabs.Screen name="create-habit" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="habit/[id]" options={{ href: null }} />
      <Tabs.Screen name="edit-habit/[id]" options={{ href: null }} />
    </Tabs>
  );
}
