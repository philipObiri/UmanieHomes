import { useEffect } from 'react';
import { useTenantStore } from './stores/tenantStore';
import { useAuthStore } from './stores/authStore';
import { usePWA } from './hooks/usePushNotifications';

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { fetchTenant, fetchTheme } = useTenantStore();
  const { fetchMe } = useAuthStore();

  usePWA();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    fetchTenant();
    fetchTheme();
    fetchMe();
  }, []);

  return <>{children}</>;
}
