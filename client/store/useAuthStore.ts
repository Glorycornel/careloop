import { create } from 'zustand';

import { login, me, register } from '@/services/auth';
import { clearToken, getToken, saveToken } from '@/lib/storage';
import { User } from '@/types/user';

type AuthState = {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,
  async hydrate() {
    const token = await getToken();
    if (!token) {
      set({ token: null, user: null, isHydrated: true });
      return;
    }
    try {
      const user = await me();
      set({ token, user, isHydrated: true });
    } catch {
      await clearToken();
      set({ token: null, user: null, isHydrated: true });
    }
  },
  async signIn(email, password) {
    const token = await login(email, password);
    await saveToken(token);
    const user = await me();
    set({ token, user });
  },
  async signUp(fullName, email, password) {
    await register(fullName, email, password);
    const token = await login(email, password);
    await saveToken(token);
    const user = await me();
    set({ token, user });
  },
  async signOut() {
    await clearToken();
    set({ token: null, user: null });
  },
}));
