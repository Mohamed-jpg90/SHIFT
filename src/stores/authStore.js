import { create } from 'zustand';

const USERS_KEY = 'shift_users';
const SESSION_KEY = 'shift_session';

const loadUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const loadSession = () => {
  try {
    return localStorage.getItem(SESSION_KEY) || null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  currentUser: loadSession(),
  error: null,

  isAuthenticated: () => Boolean(get().currentUser),

  signUp: (username, password) => {
    const name = username.trim();
    if (!name || !password) {
      set({ error: 'Username and password are required.' });
      return false;
    }

    const users = loadUsers();
    if (users[name]) {
      set({ error: 'That username is already taken.' });
      return false;
    }

    users[name] = { password };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, name);
    set({ currentUser: name, error: null });
    return true;
  },

  logIn: (username, password) => {
    const name = username.trim();
    const users = loadUsers();
    const user = users[name];

    if (!user || user.password !== password) {
      set({ error: 'Invalid username or password.' });
      return false;
    }

    localStorage.setItem(SESSION_KEY, name);
    set({ currentUser: name, error: null });
    return true;
  },

  logOut: () => {
    localStorage.removeItem(SESSION_KEY);
    set({ currentUser: null, error: null });
  },

  clearError: () => set({ error: null }),
}));