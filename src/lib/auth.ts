import { Role } from './types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const MOCK_USERS: Record<string, AuthUser & { password: string }> = {
  'admin@scale.dz': {
    id: 'user-1',
    name: 'Karim Admin',
    email: 'admin@scale.dz',
    role: 'admin',
    password: 'demo',
  },
  'owner@scale.dz': {
    id: 'user-2',
    name: 'Sara Owner',
    email: 'owner@scale.dz',
    role: 'owner',
    password: 'demo',
  },
  'agent@scale.dz': {
    id: 'user-3',
    name: 'Mehdi Kaci',
    email: 'agent@scale.dz',
    role: 'agent',
    password: 'demo',
  },
};

const SESSION_KEY = 'scale_auth_user';

export function login(email: string, password: string): AuthUser | null {
  const user = MOCK_USERS[email.toLowerCase()];
  if (!user || user.password !== password) return null;
  const { password: _, ...authUser } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  return authUser;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getDashboardRoute(role: Role): string {
  if (role === 'admin') return '/admin/dashboard';
  return '/dashboard';
}
