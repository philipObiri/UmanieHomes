import { useEffect } from 'react';
import { useTenantStore } from './stores/tenantStore';
import { useAuthStore } from './stores/authStore';
import { PageLoader } from './components/ui/PageLoader';

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { fetchTenant, fetchTheme, isLoading } = useTenantStore();
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    fetchTenant();
    fetchTheme();
    fetchMe();
  }, []);

  if (isLoading) return <PageLoader />;

  return <>{children}</>;
}
