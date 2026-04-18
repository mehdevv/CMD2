import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AuthUser } from '@/lib/auth';
import type { Role } from '@/lib/types';
import { fetchMyProfile, fetchOrgSlug } from '@/lib/db/profiles';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (
    email: string,
    password: string,
    name: string,
    orgName: string,
    orgSlug: string
  ) => Promise<{ needsEmailConfirmation: boolean; user: AuthUser | null }>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  authDisabled: boolean;
  /** Re-load profile + org slug from the current session (e.g. after `claim_org_slug`). */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function ensureOrgBootstrap(orgName = 'My Business', orgSlug?: string | null): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('bootstrap_my_org', {
    org_name: orgName,
    org_slug: orgSlug?.trim() ? orgSlug.trim().toLowerCase() : null,
  });
  if (error) throw error;
}

function sessionUserToAuthUser(
  session: Session,
  profile: {
    name: string;
    role: string;
    org_id: string | null;
    avatar_url?: string | null;
    local_handle?: string | null;
  },
  orgSlug: string | null
): AuthUser {
  return {
    id: session.user.id,
    email: session.user.email ?? profile.name,
    name: profile.name,
    role: profile.role as Role,
    orgId: profile.org_id,
    orgSlug,
    avatarUrl: profile.avatar_url ?? null,
    localHandle: profile.local_handle ?? null,
  };
}

async function buildUserFromSession(session: Session): Promise<AuthUser | null> {
  let profile = await fetchMyProfile(session.user.id);
  if (!profile) {
    await new Promise(r => setTimeout(r, 400));
    profile = await fetchMyProfile(session.user.id);
  }
  if (!profile) return null;

  let orgId = profile.org_id;
  if (!orgId) {
    try {
      await ensureOrgBootstrap();
    } catch (e) {
      console.error('bootstrap_my_org failed', e);
    }
    const again = await fetchMyProfile(session.user.id);
    orgId = again?.org_id ?? null;
  }

  let orgSlug: string | null = null;
  if (orgId) {
    try {
      orgSlug = await fetchOrgSlug(orgId);
    } catch (e) {
      console.error('fetchOrgSlug failed', e);
    }
  }

  return sessionUserToAuthUser(
    session,
    {
      name: profile.name,
      role: profile.role,
      org_id: orgId,
      avatar_url: profile.avatar_url,
      local_handle: profile.local_handle,
    },
    orgSlug
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const hydrateFromSession = useCallback(async (session: Session | null) => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    const next = await buildUserFromSession(session);
    setUser(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    const supabase = getSupabase();
    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) void hydrateFromSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrateFromSession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [hydrateFromSession]);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser | null> => {
    if (!isSupabaseConfigured) return null;
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      console.error(error);
      return null;
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    const next = await buildUserFromSession(data.session);
    setUser(next);
    setLoading(false);
    return next;
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      orgName: string,
      orgSlug: string
    ): Promise<{ needsEmailConfirmation: boolean; user: AuthUser | null }> => {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      if (!data.session) {
        return { needsEmailConfirmation: true, user: null };
      }
      await ensureOrgBootstrap(orgName.trim() || 'My Business', orgSlug.trim().toLowerCase());
      const next = await buildUserFromSession(data.session);
      setUser(next);
      setLoading(false);
      return { needsEmailConfirmation: false, user: next };
    },
    []
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    const supabase = getSupabase();
    // Always use the page’s real origin (e.g. https://scalecrm.vercel.app). Preferring `VITE_APP_URL` here breaks
    // production when that env is still set to localhost from local dev — the email then links to the wrong host.
    const base = window.location.origin.replace(/\/$/, '');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${base}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    await hydrateFromSession(data.session);
  }, [hydrateFromSession]);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      requestPasswordReset,
      logout,
      loading,
      authDisabled: !isSupabaseConfigured,
      refreshUser,
    }),
    [user, login, register, requestPasswordReset, logout, loading, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
