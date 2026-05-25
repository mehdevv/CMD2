import type { Role } from '@/lib/types';

export interface DemoAccount {
  role: Role;
  label: string;
  email: string;
  password: string;
  hint: string;
}

/** Shared password for all demo / tester accounts (Supabase Auth). */
export const DEMO_PASSWORD = 'ScaleDemo2026!';

/**
 * Tester accounts shown on `/login`.
 * Run `node scripts/seed-demo-users.mjs` once against your Supabase project to create them.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'admin',
    label: 'Platform admin',
    email: 'admin@scale.test',
    password: DEMO_PASSWORD,
    hint: 'Platform supervision — users, automation, channels, billing settings (no client CRM)',
  },
  {
    role: 'owner',
    label: 'Business owner',
    email: 'owner@scale.test',
    password: DEMO_PASSWORD,
    hint: 'Full business CRM — leads, pipeline, inbox, intelligence, billing',
  },
  {
    role: 'agent',
    label: 'Sales agent',
    email: 'karim@demo.scale',
    password: DEMO_PASSWORD,
    hint: 'My leads, inbox, follow-ups — scoped to assigned records',
  },
];
