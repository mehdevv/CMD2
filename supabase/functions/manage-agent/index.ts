import { createClient } from 'npm:@supabase/supabase-js@2';

// Keep in sync with @supabase/supabase-js `src/cors.ts` (browser clients send these headers).
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-retry-count',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

type Body =
  | { action: 'create'; localHandle: string; name: string; password: string }
  | { action: 'rename'; profileId: string; newLocalHandle: string }
  | { action: 'password'; profileId: string; newPassword: string }
  | { action: 'status'; profileId: string; status: 'active' | 'inactive' }
  | { action: 'delete'; profileId: string };

/** Echo request Origin when present so credentialed / strict clients succeed; else SDK defaults. */
function cors(req: Request, extra: Record<string, string> = {}) {
  const origin = req.headers.get('Origin');
  return {
    ...corsHeaders,
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    ...extra,
  };
}

function json(data: unknown, req: Request, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(req), 'Content-Type': 'application/json' },
  });
}

const HANDLE_RE = /^[a-z0-9._-]{3,40}$/;

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: cors(req) });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !serviceKey || !anonKey) {
    return json({ error: 'Server misconfigured' }, req, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'No authorization' }, req, 401);
  }

  const service = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const asCaller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: who, error: userErr } = await asCaller.auth.getUser();
  if (userErr || !who.user) {
    return json({ error: 'Invalid session' }, req, 401);
  }

  const { data: me, error: meErr } = await service.from('profiles').select('id, role, org_id').eq('id', who.user.id).single();
  if (meErr || !me?.org_id) {
    return json({ error: 'No profile or organization' }, req, 403);
  }
  if (me.role !== 'admin' && me.role !== 'owner') {
    return json({ error: 'Forbidden' }, req, 403);
  }

  const { data: org, error: orgErr } = await service.from('organizations').select('slug').eq('id', me.org_id).single();
  if (orgErr || !org?.slug) {
    return json({ error: 'Set your business address (slug) on the team page before adding agents.' }, req, 400);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: 'Invalid JSON' }, req, 400);
  }

  if (body.action === 'create') {
    const h = body.localHandle.trim().toLowerCase();
    if (!HANDLE_RE.test(h)) {
      return json({ error: 'Handle must be 3–40 chars: lowercase letters, digits, . _ -' }, req, 400);
    }
    if (body.password.length < 8) {
      return json({ error: 'Password must be at least 8 characters' }, req, 400);
    }
    const email = `${h}@${org.slug}.scale`;
    const created = await service.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: { name: body.name.trim(), role: 'agent' },
    });
    if (created.error) {
      return json({ error: created.error.message }, req, 400);
    }
    const uid = created.data.user!.id;
    const { error: upErr } = await service
      .from('profiles')
      .update({
        org_id: me.org_id,
        role: 'agent',
        status: 'active',
        local_handle: h,
        email,
        name: body.name.trim() || h,
      })
      .eq('id', uid);
    if (upErr) {
      await service.auth.admin.deleteUser(uid);
      return json({ error: upErr.message }, req, 400);
    }
    return json({ id: uid, email }, req);
  }

  const profileId = 'profileId' in body ? body.profileId : '';
  if (!profileId) {
    return json({ error: 'Missing profileId' }, req, 400);
  }

  const { data: target, error: tErr } = await service
    .from('profiles')
    .select('id, org_id, role, local_handle')
    .eq('id', profileId)
    .single();
  if (tErr || !target) {
    return json({ error: 'User not found' }, req, 404);
  }
  if (target.org_id !== me.org_id || target.role !== 'agent') {
    return json({ error: 'Forbidden' }, req, 403);
  }

  if (body.action === 'rename') {
    const nh = body.newLocalHandle.trim().toLowerCase();
    if (!HANDLE_RE.test(nh)) {
      return json({ error: 'Invalid handle format' }, req, 400);
    }
    const newEmail = `${nh}@${org.slug}.scale`;
    const u = await service.auth.admin.updateUserById(target.id, { email: newEmail });
    if (u.error) {
      return json({ error: u.error.message }, req, 400);
    }
    const p = await service.from('profiles').update({ local_handle: nh, email: newEmail }).eq('id', target.id);
    if (p.error) {
      return json({ error: p.error.message }, req, 400);
    }
    return json({ email: newEmail }, req);
  }

  if (body.action === 'password') {
    if (body.newPassword.length < 8) {
      return json({ error: 'Password must be at least 8 characters' }, req, 400);
    }
    const u = await service.auth.admin.updateUserById(target.id, { password: body.newPassword });
    if (u.error) {
      return json({ error: u.error.message }, req, 400);
    }
    return json({ ok: true }, req);
  }

  if (body.action === 'status') {
    const ban = body.status === 'inactive' ? '876600h' : 'none';
    const u = await service.auth.admin.updateUserById(target.id, { ban_duration: ban });
    if (u.error) {
      return json({ error: u.error.message }, req, 400);
    }
    await service.from('profiles').update({ status: body.status }).eq('id', target.id);
    return json({ ok: true }, req);
  }

  if (body.action === 'delete') {
    if (me.role !== 'admin' && me.role !== 'owner') {
      return json({ error: 'Forbidden' }, req, 403);
    }
    const u = await service.auth.admin.deleteUser(target.id);
    if (u.error) {
      return json({ error: u.error.message }, req, 400);
    }
    return json({ ok: true }, req);
  }

  return json({ error: 'Unknown action' }, req, 400);
});
