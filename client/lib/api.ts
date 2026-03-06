import axios from 'axios';

import { getToken } from '@/lib/storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
