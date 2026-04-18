import { getSupabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  org_id: string | null;
  last_active: string | null;
  local_handle?: string | null;
  avatar_url?: string | null;
  preferences?: Record<string, unknown> | null;
  notification_prefs?: Record<string, unknown> | null;
}

export async function fetchMyProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

export async function fetchOrgProfiles(): Promise<User[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, status, last_active, local_handle')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(
    (r: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      last_active: string | null;
      local_handle: string | null;
    }) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role as User['role'],
      status: r.status as User['status'],
      lastActive: r.last_active ? new Date(r.last_active).toLocaleString() : '—',
      localHandle: r.local_handle ?? undefined,
    })
  );
}

export async function fetchOrgSlug(orgId: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('organizations').select('slug').eq('id', orgId).maybeSingle();
  if (error) throw error;
  const slug = data?.slug as string | null | undefined;
  return slug?.trim() ? slug : null;
}
