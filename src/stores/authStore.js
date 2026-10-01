import { create } from 'zustand';
import * as authApi from '../api/authApi';

const STORAGE_KEY = 'shift_auth';

const loadStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistSession = (session) => {
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
};

const emptySession = {
  userId: null,
  fullName: null,
  email: null,
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
};

const toSession = (data) => ({
  userId: data.userId,
  fullName: data.fullName,
  email: data.email,
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
  accessTokenExpiresAt: data.accessTokenExpiresAt,
});

const extractErrorMessage = (err) => {
  const data = err?.response?.data;
  if (!data) return err?.message || 'Network error — is the backend running on :5195?';
  if (typeof data === 'string') return data;
  if (data.errors) {
    const firstKey = Object.keys(data.errors)[0];
    return data.errors?.[firstKey]?.[0] ?? data.description ?? 'Validation failed.';
  }
  return data.description || data.title || 'Something went wrong.';
};

export const useAuthStore = create((set, get) => ({
  ...emptySession,
  isLoading: false,
  error: null,

  isAuthenticated: () => Boolean(get().accessToken),

  setSession: (data) => {
    const session = toSession(data);
    persistSession(session);
    set({ ...session, error: null });
  },

  clearSession: () => {
    persistSession(null);
    set({ ...emptySession, error: null });
  },

  signUp: async ({ userName, name, email, password, confirmPassword }) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register({ userName, name, email, password, confirmPassword });
      get().setSession(data);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err) });
      return false;
    }
  },

  logIn: async (userName, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login({ userName, password });
      get().setSession(data);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err) });
      return false;
    }
  },

  requestPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.forgotPassword(email);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err) });
      return false;
    }
  },

  resetPassword: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.resetPassword(payload);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err) });
      return false;
    }
  },

  logOut: async () => {
    const { refreshToken } = get();
    get().clearSession();
    if (refreshToken) authApi.logout(refreshToken).catch(() => {});
  },

  clearError: () => set({ error: null }),
}));

// Rehydrate session on load so a refresh doesn't kick the player to /
const stored = loadStoredSession();
if (stored?.accessToken) {
  useAuthStore.setState(stored);
}
