import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import axios from 'axios';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { usePalette } from '@/hooks/usePalette';
import { useAuthStore } from '@/store/useAuthStore';

type FormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function getAuthErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Something went wrong. Please try again.';
  }

  const detail = error.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((item) => item?.msg).filter(Boolean).join(', ') || 'Please check your input and try again.';
  }

  if (!error.response) {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  return 'Unable to create account. Please try again.';
}

export default function SignUpScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const signUp = useAuthStore((state) => state.signUp);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    if (!values.fullName.trim() || !values.email.trim() || !values.password || !values.confirmPassword) {
      setFormError('All fields are required.');
      return;
    }

    if (values.password !== values.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      await signUp(values.fullName.trim(), values.email.trim(), values.password);
      router.replace('/(tabs)');
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Pressable style={styles.close} onPress={() => router.back()}>
            <View style={styles.closeInner}>
              <Text style={styles.closeIcon}>×</Text>
              <Text style={styles.closeText}>Close</Text>
            </View>
          </Pressable>
          <Text style={styles.title}>Create your CareLoop</Text>
          <Text style={styles.subtitle}>Start with one habit today.</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.buttonIcon}>＋</Text>
                <Text style={styles.buttonText}>Create account</Text>
              </View>
            )}
          </Pressable>

          <Text style={styles.footer}>
            Already have an account? <Link href="/(auth)/sign-in">Sign in</Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function makeStyles(palette: typeof Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(17, 24, 39, 0.4)',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheetWrap: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: palette.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 32,
      minHeight: '74%',
      borderWidth: 1,
      borderColor: palette.border,
    },
    grabber: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: '#D1D5DB',
      marginBottom: 14,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: palette.text,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 14,
      color: palette.muted,
    },
    form: {
      marginTop: 24,
      gap: 12,
    },
    input: {
      backgroundColor: palette.background,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: palette.border,
      color: palette.text,
    },
    button: {
      marginTop: 20,
      backgroundColor: palette.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    footer: {
      marginTop: 16,
      color: palette.muted,
    },
    close: {
      alignSelf: 'flex-end',
      marginBottom: 6,
    },
    closeText: {
      color: palette.primary,
      fontWeight: '600',
    },
    closeInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    closeIcon: {
      color: palette.primary,
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 16,
    },
    error: {
      marginTop: 10,
      color: palette.danger,
    },
    buttonInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    buttonIcon: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 16,
    },
  });
}
