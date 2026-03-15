import { create } from 'zustand';
import axios from 'axios';

import { login, logout, me, register, updateMe } from '@/services/auth';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from '@/lib/storage';
import { User } from '@/types/user';

type AuthState = {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateFullName: (fullName: string) => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,
  async hydrate() {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    if (!accessToken && !refreshToken) {
      set({ token: null, user: null, isHydrated: true });
      return;
    }
    try {
      const user = await me();
      const token = await getAccessToken();
      set({ token, user, isHydrated: true });
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) {
        await clearAuthTokens();
        set({ token: null, user: null, isHydrated: true });
        return;
      }
      // Keep locally stored auth material for transient network/server issues.
      set({ token: accessToken, user: null, isHydrated: true });
    }
  },
  async signIn(email, password) {
    const tokens = await login(email, password);
    await saveAuthTokens(tokens.access_token, tokens.refresh_token);
    const user = await me();
    set({ token: tokens.access_token, user, isHydrated: true });
  },
  async signUp(fullName, email, password) {
    await register(fullName, email, password);
    const tokens = await login(email, password);
    await saveAuthTokens(tokens.access_token, tokens.refresh_token);
    const user = await me();
    set({ token: tokens.access_token, user, isHydrated: true });
  },
  async signOut() {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await logout(refreshToken);
      } catch {
        // Local sign-out should still succeed if the server token is already invalid.
      }
    }
    await clearAuthTokens();
    set({ token: null, user: null });
  },
  async updateFullName(fullName) {
    const user = await updateMe(fullName);
    set({ user });
  },
}));
