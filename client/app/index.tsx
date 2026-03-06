import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';

export default function Index() {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
