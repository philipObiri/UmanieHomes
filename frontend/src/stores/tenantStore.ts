import { create } from 'zustand';
import { tenantApi } from '../api';
import type { Tenant, ThemeConfig } from '../types';

interface TenantState {
  tenant: Tenant | null;
  theme: ThemeConfig | null;
  isLoading: boolean;
  fetchTenant: () => Promise<void>;
  fetchTheme: () => Promise<void>;
  applyTheme: (theme: ThemeConfig) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  theme: null,
  isLoading: false,

  fetchTenant: async () => {
    try {
      const raw = await tenantApi.current();
      const tenant = {
        ...raw,
        contact_phone: raw.phone,
        contact_email: raw.email,
        business_hours: raw.business_days
          ? `${raw.business_days}: ${raw.business_hours_start?.slice(0, 5)}–${raw.business_hours_end?.slice(0, 5)}`
          : raw.business_hours,
      };
      set({ tenant });
    } catch {
      // Fail silently — tenant might not resolve on localhost
    }
  },

  fetchTheme: async () => {
    try {
      const theme = await tenantApi.theme();
      set({ theme });
      // Remove dark class in case it was set before
      document.documentElement.classList.remove('dark');
      // Apply theme vars
      const root = document.documentElement;
      const vars = theme.css_vars || {};
      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value as string);
      });
      if (theme.custom_css) {
        let styleEl = document.getElementById('tenant-custom-css');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'tenant-custom-css';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = theme.custom_css;
      }
      if (theme.favicon_url) {
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = theme.favicon_url;
        link.type = 'image/png';
      }
    } catch {
      // Use default CSS vars already in stylesheet
    }
  },

  applyTheme: (theme: ThemeConfig) => {
    const root = document.documentElement;
    const vars = theme.css_vars || {};
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });
    if (theme.custom_css) {
      let styleEl = document.getElementById('tenant-custom-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'tenant-custom-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = theme.custom_css;
    }
  },
}));
