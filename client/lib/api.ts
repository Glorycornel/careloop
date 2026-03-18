import axios from 'axios';

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from '@/lib/storage';
import type { AuthTokens } from '@/services/auth';

const fallbackBaseURL = __DEV__ ? 'http://localhost:8000' : 'https://careloop-wnnp.onrender.com';
const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || fallbackBaseURL;

const api = axios.create({
  baseURL,
  timeout: 30000,
});

const refreshClient = axios.create({
  baseURL,
  timeout: 30000,
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableRequest(method?: string) {
  return !method || method.toUpperCase() === 'GET';
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<AuthTokens | null> | null = null;

async function refreshAccessToken(): Promise<AuthTokens | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await clearAuthTokens();
      return null;
    }

    try {
      const response = await refreshClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      const tokens = response.data as AuthTokens;
      await saveAuthTokens(tokens.access_token, tokens.refresh_token);
      return tokens;
    } catch {
      await clearAuthTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestConfig = error.config as typeof error.config & { _retry?: boolean };
    const requestUrl = requestConfig.url || '';
    const isAuthRefreshRequest = requestUrl.includes('/auth/refresh');
    const isAuthLoginRequest = requestUrl.includes('/auth/login');
    const isAuthRegisterRequest = requestUrl.includes('/auth/register');
    const isAuthLogoutRequest = requestUrl.includes('/auth/logout');

    if (
      status !== 401 ||
      requestConfig._retry ||
      isAuthRefreshRequest ||
      isAuthLoginRequest ||
      isAuthRegisterRequest ||
      isAuthLogoutRequest
    ) {
      return Promise.reject(error);
    }

    requestConfig._retry = true;
    const tokens = await refreshAccessToken();
    if (!tokens) {
      return Promise.reject(error);
    }

    requestConfig.headers = requestConfig.headers || {};
    requestConfig.headers.Authorization = `Bearer ${tokens.access_token}`;
    return api(requestConfig);
  },
);

api.interceptors.response.use(undefined, async (error) => {
  if (!axios.isAxiosError(error) || !error.config) {
    return Promise.reject(error);
  }

  const requestConfig = error.config as typeof error.config & { _retryCount?: number };
  const shouldRetry =
    isRetryableRequest(requestConfig.method) &&
    (error.code === 'ECONNABORTED' || !error.response || (error.response.status >= 500 && error.response.status < 600));

  if (!shouldRetry) {
    return Promise.reject(error);
  }

  const retryCount = requestConfig._retryCount ?? 0;
  if (retryCount >= 2) {
    return Promise.reject(error);
  }

  requestConfig._retryCount = retryCount + 1;
  await sleep(300 * requestConfig._retryCount);
  return api(requestConfig);
});

export default api;
