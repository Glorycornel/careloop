import { useRouter } from 'expo-router';

import { useAuthStore } from '@/store/useAuthStore';

export function useRequireAuth() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const requireAuth = (action?: () => void) => {
    if (!user) {
      router.push('/(auth)/sign-up');
      return false;
    }
    action?.();
    return true;
  };

  return { user, requireAuth };
}
