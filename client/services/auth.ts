import api from '@/lib/api';
import { User } from '@/types/user';

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
};

export async function register(full_name: string, email: string, password: string) {
  await api.post('/auth/register', { full_name, email, password });
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const response = await api.post('/auth/login', { email, password });
  return response.data as AuthTokens;
}

export async function refresh(refresh_token: string): Promise<AuthTokens> {
  const response = await api.post('/auth/refresh', { refresh_token });
  return response.data as AuthTokens;
}

export async function logout(refresh_token: string): Promise<void> {
  await api.post('/auth/logout', { refresh_token });
}

export async function me(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data as User;
}

export async function updateMe(full_name: string): Promise<User> {
  const response = await api.patch('/auth/me', { full_name });
  return response.data as User;
}
