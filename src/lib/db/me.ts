import { getSupabase } from '@/lib/supabase';

export async function fetchOrganizationSummary(
  orgId: string
): Promise<{ name: string; timezone: string } | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('organizations')
    .select('name, timezone')
    .eq('id', orgId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { name: data.name as string, timezone: data.timezone as string };
}

export async function updateMyProfileFields(input: {
  newName?: string;
  newPrefs?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('update_my_profile', {
    new_name: input.newName ?? null,
    new_prefs: input.newPrefs ?? null,
  });
  if (error) throw error;
}

export async function setMyNotificationPrefsDelta(delta: Record<string, unknown>): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('set_my_notification_prefs', { delta });
  if (error) throw error;
}

export async function setMyAvatarUrl(avatarUrl: string | null): Promise<void> {
  const supabase = getSupabase();
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) throw new Error('Not signed in');
  const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', uid);
  if (error) throw error;
}

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadMyAvatar(file: File, orgId: string, userId: string): Promise<string> {
  if (!AVATAR_TYPES.includes(file.type)) {
    throw new Error('Use a JPEG, PNG, or WebP image.');
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error('Image must be 2 MB or smaller.');
  }
  const ext =
    file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${orgId}/profiles/${userId}.${ext}`;
  const supabase = getSupabase();
  const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  if (!data.publicUrl) throw new Error('Upload failed');
  await setMyAvatarUrl(data.publicUrl);
  return data.publicUrl;
}
