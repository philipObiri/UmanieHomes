import { create } from 'zustand';
import { authApi } from '../api';
import { clearStoredTokens, setStoredTokens, getStoredTokens } from '../api/client';
import type { User, LoginCredentials } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!getStoredTokens(),
  isLoading: false,

  login: async (creds) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login(creds);
      setStoredTokens({ access: data.access, refresh: data.refresh });
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    const tokens = getStoredTokens();
    if (tokens?.refresh) {
      try {
        await authApi.logout(tokens.refresh);
      } catch {
        // ignore logout errors
      }
    }
    clearStoredTokens();
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    if (!getStoredTokens()) return;
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true });
    } catch {
      clearStoredTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),
}));
