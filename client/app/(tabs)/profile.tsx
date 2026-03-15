import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { usePalette } from '@/hooks/usePalette';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProfileScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { user, requireAuth } = useRequireAuth();
  const signOut = useAuthStore((state) => state.signOut);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>✨</Text>
          <Text style={styles.heroTitle}>Guest mode</Text>
        </View>
        <Text style={styles.title}>Guest mode</Text>
        <Text style={styles.label}>You can explore the app now.</Text>
        <Text style={styles.value}>Sign up to save habits, streaks, and reminders.</Text>
        <Pressable style={styles.button} onPress={() => requireAuth()}>
          <View style={styles.buttonInner}>
            <Text style={styles.buttonIcon}>＋</Text>
            <Text style={styles.buttonText}>Create account</Text>
          </View>
        </Pressable>
        <Pressable style={styles.buttonAlt} onPress={() => router.push('/(auth)/sign-in')}>
          <View style={styles.buttonInner}>
            <Text style={styles.buttonAltIcon}>→</Text>
            <Text style={styles.buttonAltText}>Sign in</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🙂</Text>
        <Text style={styles.heroTitle}>Your profile</Text>
      </View>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{user?.full_name ?? '-'}</Text>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email ?? '-'}</Text>

      <Pressable
        style={styles.button}
        onPress={async () => {
          await signOut();
          router.replace('/(tabs)');
        }}
      >
        <View style={styles.buttonInner}>
          <Text style={styles.buttonIcon}>↩</Text>
          <Text style={styles.buttonText}>Sign out</Text>
        </View>
      </Pressable>
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
  hero: {
    backgroundColor: palette.secondarySoft,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  heroIcon: {
    fontSize: 22,
  },
  heroTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 20,
  },
  label: {
    color: palette.muted,
    marginTop: 10,
  },
  value: {
    color: palette.text,
    fontSize: 16,
    backgroundColor: palette.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  button: {
    marginTop: 30,
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
  },
  buttonAlt: {
    marginTop: 10,
    backgroundColor: palette.card,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonAltText: {
    color: palette.primary,
    fontWeight: '600',
  },
  buttonAltIcon: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
  },
  });
}
