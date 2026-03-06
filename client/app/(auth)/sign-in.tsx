import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';

type FormValues = {
  email: string;
  password: string;
};

export default function SignInScreen() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await signIn(values.email.trim(), values.password);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to keep your streaks alive.</Text>

      <View style={styles.form}>
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
      </View>

      <Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </Pressable>

      <Text style={styles.footer}>
        New here? <Link href="/(auth)/sign-up">Create an account</Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.muted,
  },
  form: {
    marginTop: 24,
    gap: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: Colors.primary,
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
    color: Colors.muted,
  },
});
