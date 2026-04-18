import { getSupabase } from '@/lib/supabase';

async function invokeManage(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke('manage-agent', { body });
  if (error) throw new Error(error.message);
  const payload = data as { error?: string } | null;
  if (payload && typeof payload.error === 'string') {
    throw new Error(payload.error);
  }
  return (data ?? {}) as Record<string, unknown>;
}

export async function claimOrgSlug(newSlug: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('claim_org_slug', { new_slug: newSlug.trim().toLowerCase() });
  if (error) throw error;
}

export function createAgent(params: { localHandle: string; name: string; password: string }) {
  return invokeManage({ action: 'create', ...params });
}

export function renameAgent(profileId: string, newLocalHandle: string) {
  return invokeManage({ action: 'rename', profileId, newLocalHandle });
}

export function resetAgentPassword(profileId: string, newPassword: string) {
  return invokeManage({ action: 'password', profileId, newPassword });
}

export function setAgentStatus(profileId: string, status: 'active' | 'inactive') {
  return invokeManage({ action: 'status', profileId, status });
}

export function deleteAgentUser(profileId: string) {
  return invokeManage({ action: 'delete', profileId });
}
