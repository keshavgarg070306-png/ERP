import { create } from 'zustand';
import { apiFetch } from '../utils/api';

export interface UserRole {
  id: number;
  name: string;
  readInventory: boolean;
  writeInventory: boolean;
  readSales: boolean;
  writeSales: boolean;
  readFinance: boolean;
  writeFinance: boolean;
  readHR: boolean;
  writeHR: boolean;
  readSettings: boolean;
  writeSettings: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<User>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/auth/me');
      if (data && data.user) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password, rememberMe) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe }),
      });
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data.user;
    } catch (err: any) {
      const message = err.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
