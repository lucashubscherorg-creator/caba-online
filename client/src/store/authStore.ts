// ============================================
// AUTH STORE — CABA ONLINE
// ============================================

import { create } from 'zustand';
import { api } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';
import type { User } from '@shared/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  setUser: (user: User) => set({ user }),

  initialize: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const res = await api.get<User>('/auth/me');
      if (res.success && res.data) {
        set({ user: res.data, isLoading: false });
        initSocket(token);
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isLoading: false });
      }
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
        '/auth/login',
        { email, password }
      );

      if (!res.success || !res.data) {
        set({ error: res.error ?? 'Error al iniciar sesión', isLoading: false });
        return;
      }

      const { user, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      initSocket(accessToken);
      set({ user, isLoading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error inesperado',
        isLoading: false,
      });
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
        '/auth/register',
        { username, email, password }
      );

      if (!res.success || !res.data) {
        set({ error: res.error ?? 'Error al registrarse', isLoading: false });
        return;
      }

      const { user, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      initSocket(accessToken);
      set({ user, isLoading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error inesperado',
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      disconnectSocket();
      set({ user: null, error: null });
    }
  },
}));

// Initialize on module load
useAuthStore.getState().initialize();
