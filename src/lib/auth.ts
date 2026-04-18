import type { Role } from './types';

/** Signed-in user exposed to the app (backed by Supabase `profiles` + `auth.users`). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Set after `bootstrap_my_org` (or SQL promotion). */
  orgId: string | null;
  /** `organizations.slug` for agent sign-in addresses. */
  orgSlug: string | null;
  /** Public avatar URL from `profiles.avatar_url`. */
  avatarUrl?: string | null;
  /** Sales agent handle segment (`local_handle`); optional for owners/admins. */
  localHandle?: string | null;
}

export function getDashboardRoute(role: Role): string {
  if (role === 'admin') return '/admin/dashboard';
  return '/dashboard';
}
