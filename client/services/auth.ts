import api from '@/lib/api';
import { User } from '@/types/user';

export async function register(full_name: string, email: string, password: string) {
  await api.post('/auth/register', { full_name, email, password });
}

export async function login(email: string, password: string): Promise<string> {
  const response = await api.post('/auth/login', { email, password });
  return response.data.access_token as string;
}

export async function me(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data as User;
}
