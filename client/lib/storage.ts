import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'careloop_access_token';
const REFRESH_TOKEN_KEY = 'careloop_refresh_token';
const THEME_KEY = 'careloop_theme_mode';

export async function saveAuthTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearAuthTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveThemeMode(mode: 'light' | 'dark') {
  await SecureStore.setItemAsync(THEME_KEY, mode);
}

export async function getThemeMode() {
  const mode = await SecureStore.getItemAsync(THEME_KEY);
  return mode === 'dark' ? 'dark' : 'light';
}
