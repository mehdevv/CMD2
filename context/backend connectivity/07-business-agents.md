# 07 — Business-managed agents (`agent@business.scale`)

Every business (an `organizations` row) can provision its own sales agents. The admin / owner types an agent handle and a password into the Business dashboard and a real Supabase user is created for that agent. The agent signs in from the same `/login` page with:

```
<agent_handle>@<business_slug>.scale
<password>
```

`.scale` is a **fictional email suffix** — it does not exist as a real domain, has no DNS, and nothing is ever delivered to it. Supabase simply stores the string. We bypass the whole email pipeline by creating auth users with `email_confirm = true`. Admins and owners reset agent passwords through the `manage-agent` edge function; agents never see "forgot password" succeed.

**Detection rule:** any email whose host ends with `.scale` is a business-provisioned agent (`src/lib/agent-email.ts` → `isAgentEmail`). Real work emails never collide with this suffix, so a single Login page can route both.

This file is the complete implementation plan: schema change, secure RPC + Edge Function, frontend pages, and RLS impact.

---

## 7.1 Scope

**In:**

1. Business slug (`organizations.slug`) picked at signup or editable by admin.
2. Agent handle (`profiles.local_handle`) — unique per org.
3. Create / rename / deactivate / reactivate / delete agent.
4. Admin or owner sets **and rotates** the agent password (no email required).
5. Business dashboard sees every agent's leads, conversations, opportunities, activity.
6. Agent sees **only their own** records (RLS + UI filters already in place).

**Out (phase 2):**

- Sending real password-reset emails to agents on a routable domain.
- Multi-factor auth for agents.
- Per-agent API keys.
- Delegating "create-agent" to a non-admin/owner role.

---

## 7.2 Account model

```
organizations
  id                uuid
  slug              text  unique   ◄── NEW: lowercase [a-z0-9-], 3..40 chars
  name              text
  ...

profiles
  id                uuid  = auth.users.id
  org_id            uuid  ► organizations.id
  role              text  check in ('admin','owner','agent')
  local_handle      text           ◄── NEW: lowercase [a-z0-9._-], 3..40 chars
  name, email, status, last_active, ...
  unique (org_id, local_handle)

auth.users (Supabase-managed)
  email             ALWAYS equals   local_handle || '@' || org.slug || '.scale'
  email_confirmed   true            ◄── set by Edge Function with admin API
  encrypted_password bcrypt hash    ◄── set by admin API, rotatable
```

**Invariant:** the auth email is *derived*, never free-typed. The composed string stays in sync because every create / rename updates both `auth.users.email` and `profiles.email`.

---

## 7.3 Who can do what

| Capability | Admin | Owner | Agent |
|---|:-:|:-:|:-:|
| Choose org slug at signup | ✓ | — | — |
| Change org slug (one-off rename) | ✓ | — | — |
| Add agent | ✓ | ✓ | — |
| Rename agent handle | ✓ | ✓ | — |
| Set / rotate agent password | ✓ | ✓ | — |
| Deactivate / reactivate agent | ✓ | ✓ | — |
| Delete agent (hard) | ✓ | — | — |
| See agent pipeline, inbox, calls | ✓ | ✓ | self only |

---

## 7.4 Schema migration (repo: `supabase/migrations/20260418120000_business_agents.sql`)

```sql
-- 1. Org slug
alter table public.organizations
  add column if not exists slug text;

create unique index if not exists organizations_slug_uidx
  on public.organizations (lower(slug));

alter table public.organizations
  add constraint organizations_slug_format_chk
  check (slug is null or slug ~ '^[a-z0-9-]{3,40}$');

-- 2. Profile handle + derived-email invariant
alter table public.profiles
  add column if not exists local_handle text;

create unique index if not exists profiles_org_handle_uidx
  on public.profiles (org_id, lower(local_handle))
  where local_handle is not null;

alter table public.profiles
  add constraint profiles_local_handle_format_chk
  check (local_handle is null or local_handle ~ '^[a-z0-9._-]{3,40}$');
```

No RLS change is needed: `org_id` scoping + `current_role()` already cover it. The new **writes** below live entirely in SECURITY DEFINER RPC and an Edge Function, so the client never writes these columns directly.

---

## 7.5 Slug allocation RPC — `claim_org_slug(slug text)`

Called once during signup (bootstrap), and again if an admin renames the org. Idempotent, atomic.

```sql
create or replace function public.claim_org_slug(new_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role    text := public.current_role();
  v_org_id  uuid := public.current_org_id();
  v_clean   text := lower(trim(new_slug));
begin
  if v_org_id is null then raise exception 'No organization'; end if;
  if v_role <> 'admin'  then raise exception 'Admin only'; end if;
  if v_clean !~ '^[a-z0-9-]{3,40}$' then
    raise exception 'Slug must be 3-40 chars, a-z 0-9 and hyphens';
  end if;

  update public.organizations
     set slug = v_clean
   where id = v_org_id;

exception when unique_violation then
  raise exception 'That business address is already taken';
end;
$$;
```

`bootstrap_my_org` is extended to accept an optional slug and call this in the same transaction so the very first sign-up lands with a valid slug.

---

## 7.6 Agent provisioning — Edge Function `manage-agent`

Creating a user requires the **service role key**, which must never ship to the browser. We use a single Supabase Edge Function, `manage-agent`, with an action router.

**File:** `supabase/functions/manage-agent/index.ts`

```ts
// Deno runtime. Deploy with: supabase functions deploy manage-agent
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SERVICE = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

type Action =
  | { action: 'create';   localHandle: string; name: string; password: string }
  | { action: 'rename';   profileId: string; newLocalHandle: string }
  | { action: 'password'; profileId: string; newPassword: string }
  | { action: 'status';   profileId: string; status: 'active' | 'inactive' }
  | { action: 'delete';   profileId: string };

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'No token' }, 401);

  // 1. Verify caller and pull their profile using the caller's JWT
  const asCaller = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: who } = await asCaller.auth.getUser();
  if (!who.user) return json({ error: 'Invalid session' }, 401);

  const { data: me } = await SERVICE
    .from('profiles')
    .select('id, role, org_id')
    .eq('id', who.user.id)
    .single();
  if (!me) return json({ error: 'No profile' }, 403);
  if (me.role !== 'admin' && me.role !== 'owner') {
    return json({ error: 'Forbidden' }, 403);
  }

  const { data: org } = await SERVICE
    .from('organizations').select('slug').eq('id', me.org_id).single();
  if (!org?.slug) return json({ error: 'Org has no slug' }, 400);

  const body = (await req.json()) as Action;

  if (body.action === 'create') {
    const email = `${body.localHandle.toLowerCase()}@${org.slug}.scale`;
    const created = await SERVICE.auth.admin.createUser({
      email, password: body.password, email_confirm: true,
      user_metadata: { name: body.name, role: 'agent' },
    });
    if (created.error) return json({ error: created.error.message }, 400);

    // Trigger handle_new_user() already inserted profiles row.
    // Fill the agent-specific columns we control on the server.
    const { error } = await SERVICE.from('profiles').update({
      org_id: me.org_id,
      role: 'agent',
      status: 'active',
      local_handle: body.localHandle.toLowerCase(),
      email,
      name: body.name,
    }).eq('id', created.data.user!.id);
    if (error) {
      await SERVICE.auth.admin.deleteUser(created.data.user!.id);
      return json({ error: error.message }, 400);
    }
    return json({ id: created.data.user!.id, email });
  }

  // For every non-create action, ensure the target belongs to my org + is an agent.
  const target = await SERVICE.from('profiles')
    .select('id, org_id, role, local_handle')
    .eq('id', (body as { profileId: string }).profileId)
    .single();
  if (target.error || !target.data) return json({ error: 'Not found' }, 404);
  if (target.data.org_id !== me.org_id || target.data.role !== 'agent') {
    return json({ error: 'Forbidden' }, 403);
  }

  if (body.action === 'rename') {
    const newEmail = `${body.newLocalHandle.toLowerCase()}@${org.slug}.scale`;
    const u = await SERVICE.auth.admin.updateUserById(target.data.id, { email: newEmail });
    if (u.error) return json({ error: u.error.message }, 400);
    const p = await SERVICE.from('profiles').update({
      local_handle: body.newLocalHandle.toLowerCase(), email: newEmail,
    }).eq('id', target.data.id);
    if (p.error) return json({ error: p.error.message }, 400);
    return json({ email: newEmail });
  }

  if (body.action === 'password') {
    const u = await SERVICE.auth.admin.updateUserById(target.data.id, { password: body.newPassword });
    if (u.error) return json({ error: u.error.message }, 400);
    return json({ ok: true });
  }

  if (body.action === 'status') {
    // Pause sign-in by setting banned_until; flip profile status
    const until = body.status === 'inactive' ? '2099-01-01T00:00:00Z' : 'none';
    const u = await SERVICE.auth.admin.updateUserById(target.data.id, { ban_duration: until as never });
    if (u.error) return json({ error: u.error.message }, 400);
    await SERVICE.from('profiles').update({ status: body.status }).eq('id', target.data.id);
    return json({ ok: true });
  }

  if (body.action === 'delete') {
    if (me.role !== 'admin') return json({ error: 'Admin only' }, 403);
    const u = await SERVICE.auth.admin.deleteUser(target.data.id);
    if (u.error) return json({ error: u.error.message }, 400);
    // ON DELETE CASCADE on profiles removes the profiles row.
    return json({ ok: true });
  }

  return json({ error: 'Unknown action' }, 400);
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}
```

**Environment (Dashboard → Edge Functions → manage-agent → Secrets):**

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Deploy:

```bash
supabase functions deploy manage-agent --project-ref <ref>
```

---

## 7.7 Frontend — data layer

**New file:** `src/lib/db/agents.ts`

```ts
import { getSupabase } from '@/lib/supabase';

export interface AgentRow {
  id: string; name: string; email: string; localHandle: string;
  status: 'active' | 'inactive' | 'invited'; lastActive: string | null;
}

export async function listAgents(): Promise<AgentRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('profiles')
    .select('id, name, email, local_handle, status, last_active')
    .eq('role', 'agent').order('name');
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id, name: r.name, email: r.email,
    localHandle: r.local_handle ?? '',
    status: r.status as AgentRow['status'],
    lastActive: r.last_active,
  }));
}

async function callManage(body: Record<string, unknown>) {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke('manage-agent', { body });
  if (error) throw error;
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as Record<string, unknown>;
}

export const createAgent   = (p: { localHandle: string; name: string; password: string }) => callManage({ action: 'create', ...p });
export const renameAgent   = (id: string, newLocalHandle: string) => callManage({ action: 'rename',   profileId: id, newLocalHandle });
export const resetAgentPwd = (id: string, newPassword: string)    => callManage({ action: 'password', profileId: id, newPassword });
export const setAgentStatus= (id: string, status: 'active' | 'inactive') => callManage({ action: 'status', profileId: id, status });
export const deleteAgent   = (id: string) => callManage({ action: 'delete', profileId: id });
```

`useQuery({ queryKey: ['agents'], queryFn: listAgents })` + invalidate on each mutation. Slots into the existing CRM context pattern.

---

## 7.8 Frontend — Business dashboard pages

### `/admin/users` (rework) and `/dashboard/agents` (new, owner-facing)

Both pages render the **same** AgentsTable component — admins see everyone in org (admin / owner / agent), owners see agents only.

**Table columns:** avatar + name · address (`handle@slug.scale`) · status · last active · pipeline count · won in last 30 days · row actions.

**Row actions:**

- `Reset password` → modal with new password + confirm.
- `Rename handle` → modal; warns "the agent will sign in with the new address from now on".
- `Deactivate` / `Reactivate` → confirm → flips status.
- `Delete` → admin-only; typed confirm.

**Primary CTA — `+ Add agent`:**

```
Handle          [  sara-k                         ]
Full name       [  Sara Kerbouche                ]
Temporary pwd   [  ●●●●●●●●  ]  [Generate]

Sign-in address:  sara-k@brightwave.scale
                  └── org slug, read-only

[ Cancel ]                              [ Create ]
```

Server validates:

- Handle unique per org (unique index).
- Handle `^[a-z0-9._-]{3,40}$`.
- Password ≥ 8 chars.

On success, toast shows the full address and password with a "Copy credentials" button. We deliberately show the password exactly once; admin hands it to the agent out of band.

### Agent detail drawer `/admin/users/:id`

Read-only pipeline summary:

- Open leads (with link to `/leads?ownerId=:id`).
- Open opportunities by stage.
- Won / lost last 30 days.
- Recent inbox threads.

Everything is already org-scoped in SQL — the drawer just reuses `listLeads`, `listOpportunities`, `listConversations` with a `?ownerId=` filter added to the selectors in `src/lib/analytics.ts`.

---

## 7.9 Org slug picker (first-run)

The Register page gets one extra field:

```
Business address   [  brightwave          ] .scale
                      └── 3–40 chars, a–z 0–9 and hyphens
```

On submit: `auth.signUp` → `bootstrap_my_org` → `rpc('claim_org_slug', { new_slug })`. If the slug is taken, show inline error and let them retry without losing the rest of the form.

Admin can change the slug later at `/admin/settings/organization`. Renaming the slug rewrites every agent's `auth.users.email` via the same `manage-agent` function with a new `action: 'rename-org'` variant (trivial loop over `profiles where role='agent'`). Recommend running the rename off-hours and telling agents the new address in advance.

---

## 7.10 Sign-in flow (agent)

`/login` is unchanged — the agent types:

```
sara-k@brightwave.scale
<password provided by business>
```

`supabase.auth.signInWithPassword` succeeds because `email_confirmed = true`, the profile row exists with `role = 'agent'`, `getDashboardRoute('agent')` → `/dashboard`. No email is ever sent to `.scale`.

If `status = 'inactive'` (or `banned_until` in the future), Supabase returns `invalid_credentials`; the Login page maps that to "Your account is disabled — ask your admin".

---

## 7.11 Agent permissions inside the app

Already enforced by existing RLS + frontend filters. Reiterated here so nothing regresses:

- Leads: agent sees only rows where `assigned_to = auth.uid()`. UI also filters.
- Conversations / messages: agent can read rows in their org; they only write on threads they've taken over (`automation_paused = true and assigned_to = me`).
- Opportunities: agent CRUD on rows where `owner_id = auth.uid()`.
- Meeting briefs / notes: scoped by `lead_id` / `opportunity_id` they own.
- Automation configs, triggers, templates, billing, channels, refund_policy, intervention_settings: **no write access**; the `profiles_role_agent` check in each table's RLS already blocks it.

---

## 7.12 Acceptance checklist

- [ ] Migration applied: `organizations.slug`, `profiles.local_handle`, unique indexes, format checks.
- [ ] `claim_org_slug` RPC returns the slug on success, errors on collision.
- [ ] `bootstrap_my_org(org_name, org_slug)` accepts and stores the slug in one call.
- [ ] `manage-agent` edge function deployed with service-role secret set.
- [ ] `/register` requires a slug, shows the `@…​.scale` preview live.
- [ ] Admin can add an agent from `/admin/users`; resulting agent signs in with `<handle>@<slug>.scale` and the chosen password.
- [ ] Admin rotates the agent's password from the UI; old password fails, new password works.
- [ ] Deactivating an agent blocks sign-in immediately; reactivating restores it.
- [ ] Agent sees only their own leads / opportunities / conversations. Owner and admin see everything in the org.
- [ ] Renaming the agent's handle updates `auth.users.email` and `profiles.email` atomically; the agent signs in with the new address on the next attempt.
- [ ] Deleting an agent removes `auth.users` and cascades to `profiles`; their records' `assigned_to`/`owner_id` become `NULL` (already handled by existing `ON DELETE SET NULL`).

---

## 7.13 Security notes

- The service-role key lives **only** in the Edge Function's environment. Do not add it to `.env` or any `VITE_*` variable.
- The Edge Function re-derives `org_id` and `role` from the caller's JWT on every call — clients cannot spoof another org.
- Passwords flow over HTTPS to the Edge Function, never stored by the app; Supabase stores them with bcrypt.
- Rate-limit the function with Supabase's built-in request quotas and add an application-side `captcha` if abuse appears.
- Audit trail: every successful mutation writes one row to `automation_activity_log` with `source='admin'` and the acting profile id. (Trivial extension inside the Edge Function.)

---

## 7.14 Rollout slot

Insert between Phase 3 and Phase 4 of [`06-rollout-plan.md`](./06-rollout-plan.md) — directly after auth and data-access are live, before polishing the pipeline UI. One developer-day:

- ½ day: migration + RPC + Edge Function deploy.
- ½ day: `/admin/users` rework + Add-agent modal + agent detail drawer.
