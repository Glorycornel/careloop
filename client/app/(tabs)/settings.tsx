import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Colors, DarkColors } from '@/constants/colors';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';

export default function SettingsScreen() {
  const { user, requireAuth } = useRequireAuth();
  const signOut = useAuthStore((state) => state.signOut);
  const updateFullName = useAuthStore((state) => state.updateFullName);
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const themeHydrated = usePreferencesStore((state) => state.isHydrated);
  const hydrateTheme = usePreferencesStore((state) => state.hydrate);
  const setThemeMode = usePreferencesStore((state) => state.setThemeMode);

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [savingName, setSavingName] = useState(false);

  const palette = useMemo(() => (themeMode === 'dark' ? DarkColors : Colors), [themeMode]);
  const styles = useMemo(() => makeStyles(palette), [palette]);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  useEffect(() => {
    setFullName(user?.full_name ?? '');
  }, [user?.full_name]);

  const onSaveName = async () => {
    const value = fullName.trim();
    if (!value) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setSavingName(true);
    try {
      await updateFullName(value);
      Alert.alert('Saved', 'Your username has been updated.');
    } finally {
      setSavingName(false);
    }
  };

  if (!themeHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⚙️ Settings</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.guestText}>Sign up to access profile and personalized settings.</Text>
          <Pressable style={styles.primaryButton} onPress={() => requireAuth()}>
            <Text style={styles.primaryText}>Create account</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>Dark mode</Text>
          <Switch value={themeMode === 'dark'} onValueChange={(value) => void setThemeMode(value ? 'dark' : 'light')} />
        </View>
        <Text style={styles.hint}>Switch between light and dark theme preference.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter username"
          placeholderTextColor={palette.muted}
        />
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
        <Pressable style={styles.primaryButton} onPress={() => void onSaveName()} disabled={savingName}>
          {savingName ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Save username</Text>}
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutName}>CareLoop</Text>
        <Text style={styles.aboutTagline}>Build better days, one habit at a time.</Text>
      </View>

      <Pressable
        style={styles.signOut}
        onPress={async () => {
          await signOut();
        }}
      >
        <Text style={styles.signOutText}>↩ Logout</Text>
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
      gap: 12,
    },
    title: {
      fontSize: 28,
      color: palette.text,
      fontWeight: '700',
    },
    card: {
      backgroundColor: palette.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 12,
    },
    sectionTitle: {
      color: palette.text,
      fontWeight: '700',
      marginBottom: 8,
    },
    label: {
      color: palette.muted,
      marginTop: 8,
      marginBottom: 4,
    },
    value: {
      color: palette.text,
      fontWeight: '600',
    },
    input: {
      backgroundColor: palette.background,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      color: palette.text,
    },
    guestText: {
      color: palette.muted,
      marginTop: 6,
      marginBottom: 10,
    },
    primaryButton: {
      backgroundColor: palette.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 12,
    },
    primaryText: {
      color: '#fff',
      fontWeight: '700',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    rowLabel: {
      color: palette.text,
      fontWeight: '600',
    },
    hint: {
      color: palette.muted,
      fontSize: 12,
    },
    aboutName: {
      color: palette.text,
      fontWeight: '800',
      fontSize: 18,
      marginBottom: 4,
    },
    aboutTagline: {
      color: palette.muted,
    },
    signOut: {
      backgroundColor: palette.secondarySoft,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      paddingVertical: 12,
      alignItems: 'center',
    },
    signOutText: {
      color: palette.secondary,
      fontWeight: '700',
    },
  });
}
