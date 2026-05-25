import type { AuthUser } from '@/lib/auth';
import { DEMO_ACCOUNTS } from '@/lib/demo-accounts';

export const DEMO_ORG_ID = '00000000-0000-4000-8000-000000000001';
export const DEMO_SESSION_KEY = 'scale_demo_session';

const DEMO_USER_IDS: Record<string, string> = {
  'admin@scale.test': 'demo-admin',
  'owner@scale.test': 'demo-owner',
  'karim@demo.scale': 'demo-agent-karim',
};

export function tryDemoLogin(email: string, password: string): AuthUser | null {
  const normalized = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === normalized && a.password === password);
  if (!account) return null;

  return {
    id: DEMO_USER_IDS[normalized] ?? `demo-${account.role}`,
    name: account.label,
    email: account.email,
    role: account.role,
    orgId: DEMO_ORG_ID,
    orgSlug: 'demo',
    localHandle: account.role === 'agent' ? 'karim' : null,
    isDemo: true,
  };
}

export function saveDemoSession(user: AuthUser): void {
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
}

export function loadDemoSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed?.isDemo ? parsed : null;
  } catch {
    return null;
  }
}

export function clearDemoSession(): void {
  localStorage.removeItem(DEMO_SESSION_KEY);
}

export function isDemoUser(user: AuthUser | null | undefined): boolean {
  return Boolean(user?.isDemo);
}
