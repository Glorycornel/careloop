import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { useAuthStore } from '@/store/useAuthStore';

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
