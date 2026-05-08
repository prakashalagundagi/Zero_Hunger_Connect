// Mock authentication utilities
import { User, UserRole } from '../types';
import { mockUsers, setCurrentUser as setMockCurrentUser } from '../data/mockData';

const AUTH_STORAGE_KEY = 'zhc_current_user';

export const login = (email: string, password: string): User | null => {
  // Mock login - in real app, this would call backend API
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    setMockCurrentUser(user);
    return user;
  }
  return null;
};

export const register = (data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  address: string;
}): User => {
  // Mock registration - in real app, this would call backend API
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    phone: data.phone,
    location: {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      address: data.address
    },
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
    createdAt: new Date().toISOString()
  };
  
  mockUsers.push(newUser);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
  setMockCurrentUser(newUser);
  return newUser;
};

export const logout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.href = '/';
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    try {
      const user = JSON.parse(stored);
      setMockCurrentUser(user);
      return user;
    } catch {
      return null;
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
