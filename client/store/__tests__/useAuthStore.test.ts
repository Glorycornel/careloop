import { useAuthStore } from '@/store/useAuthStore';

jest.mock('@/services/auth', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
  register: jest.fn(),
  updateMe: jest.fn(),
}));

jest.mock('@/lib/storage', () => ({
  clearAuthTokens: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  saveAuthTokens: jest.fn(),
}));

import type { User } from '@/types/user';
import { login, logout, me, register } from '@/services/auth';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from '@/lib/storage';

const mockUser: User = {
  id: 1,
  full_name: 'Test User',
  email: 'user@example.com',
  created_at: '2026-03-10T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, token: null, isHydrated: false });
});

test('hydrate clears auth state when there are no stored tokens', async () => {
  (getAccessToken as jest.Mock).mockResolvedValue(null);
  (getRefreshToken as jest.Mock).mockResolvedValue(null);

  await useAuthStore.getState().hydrate();

  expect(useAuthStore.getState()).toMatchObject({
    user: null,
    token: null,
    isHydrated: true,
  });
  expect(me).not.toHaveBeenCalled();
});

test('hydrate loads the current user when a stored token exists', async () => {
  (getAccessToken as jest.Mock).mockResolvedValue('access-1');
  (getRefreshToken as jest.Mock).mockResolvedValue('refresh-1');
  (me as jest.Mock).mockResolvedValue(mockUser);

  await useAuthStore.getState().hydrate();

  expect(me).toHaveBeenCalledTimes(1);
  expect(useAuthStore.getState()).toMatchObject({
    user: mockUser,
    token: 'access-1',
    isHydrated: true,
  });
});

test('signIn stores both tokens and hydrates the user', async () => {
  (login as jest.Mock).mockResolvedValue({
    access_token: 'access-2',
    refresh_token: 'refresh-2',
    token_type: 'bearer',
  });
  (me as jest.Mock).mockResolvedValue(mockUser);

  await useAuthStore.getState().signIn('user@example.com', 'secret123');

  expect(saveAuthTokens).toHaveBeenCalledWith('access-2', 'refresh-2');
  expect(useAuthStore.getState()).toMatchObject({
    user: mockUser,
    token: 'access-2',
    isHydrated: true,
  });
});

test('signUp registers then stores both tokens and hydrates the user', async () => {
  (register as jest.Mock).mockResolvedValue(undefined);
  (login as jest.Mock).mockResolvedValue({
    access_token: 'access-3',
    refresh_token: 'refresh-3',
    token_type: 'bearer',
  });
  (me as jest.Mock).mockResolvedValue(mockUser);

  await useAuthStore.getState().signUp('Test User', 'user@example.com', 'secret123');

  expect(register).toHaveBeenCalledWith('Test User', 'user@example.com', 'secret123');
  expect(saveAuthTokens).toHaveBeenCalledWith('access-3', 'refresh-3');
  expect(useAuthStore.getState()).toMatchObject({
    user: mockUser,
    token: 'access-3',
    isHydrated: true,
  });
});

test('signOut revokes the refresh token and clears local auth state', async () => {
  useAuthStore.setState({ user: mockUser, token: 'access-4', isHydrated: true });
  (getRefreshToken as jest.Mock).mockResolvedValue('refresh-4');
  (logout as jest.Mock).mockResolvedValue(undefined);

  await useAuthStore.getState().signOut();

  expect(logout).toHaveBeenCalledWith('refresh-4');
  expect(clearAuthTokens).toHaveBeenCalledTimes(1);
  expect(useAuthStore.getState()).toMatchObject({
    user: null,
    token: null,
  });
});
