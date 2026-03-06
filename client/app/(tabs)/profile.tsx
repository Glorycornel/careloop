import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{user?.full_name ?? '-'}</Text>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email ?? '-'}</Text>

      <Pressable
        style={styles.button}
        onPress={async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        }}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  label: {
    color: Colors.muted,
    marginTop: 10,
  },
  value: {
    color: Colors.text,
    fontSize: 16,
  },
  button: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
