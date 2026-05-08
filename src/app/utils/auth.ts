// Authentication utilities — wraps the backend JWT auth API
// Replaces the previous mock-based implementation
import { User, UserRole } from '../types';
import { authAPI, setToken, removeToken, getToken } from '../services/api';

const AUTH_USER_KEY = 'zhc_current_user';

/** Store user object in localStorage for quick access without re-fetching */
const storeUser = (user: User) => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

/** Remove stored user on logout */
const clearUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};

/**
 * Login with email and password.
 * Stores the JWT token and user object in localStorage.
 * Returns the user on success, null on failure.
 */
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const res = await authAPI.login(email, password);
    if (res.success) {
      setToken(res.token);
      storeUser(res.user);
      return res.user as User;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

/**
 * Register a new user.
 * Stores the JWT token and user object in localStorage.
 */
export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  address: string;
}): Promise<User> => {
  const res = await authAPI.register(data);
  if (res.success) {
    setToken(res.token);
    storeUser(res.user);
    return res.user as User;
  }
  throw new Error('Registration failed');
};

/**
 * Logout — removes JWT token and user from localStorage,
 * then redirects to the login page.
 */
export const logout = async () => {
  try {
    await authAPI.logout();
  } catch {
    // Ignore errors — we always clear local state
  } finally {
    removeToken();
    clearUser();
    window.location.href = '/login';
  }
};

/**
 * Get the currently authenticated user from localStorage.
 * Returns null if not logged in.
 */
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }
  return null;
};

/** Returns true if a JWT token is present in localStorage */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

/**
 * Refresh the user profile from the backend and update localStorage.
 * Useful after profile updates.
 */
export const refreshCurrentUser = async (): Promise<User | null> => {
  try {
    const res = await authAPI.getMe();
    if (res.success) {
      storeUser(res.user);
      return res.user as User;
    }
    return null;
  } catch {
    return null;
  }
};
