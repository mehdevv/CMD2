# 08 — Profile page & settings

Add a **self-service profile** that every signed-in user owns, and a **workspace settings** area that owners/admins use to run their organization. Today the only place to change anything personal is the `.scale` password reset an admin performs for you; there is no page where `/dashboard` users manage their own account.

> Keep these **two concepts strictly separate**:
>
> - **My profile (`/profile`)** — scoped to `auth.uid()` + my `profiles` row. Everybody (admin, owner, agent) has one.
> - **Workspace settings (`/workspace`)** — scoped to `current_org_id()`. Only owners/admins can see/write most of it.
>
> Mixing them is the usual way CRMs become confusing ("who is the avatar for, me or the workspace?"). We will not.

Stack touches: Supabase (one new bucket, a handful of RPCs), a new **`src/pages/profile/*`** tree, a new **`src/pages/workspace/*`** tree, Topbar user-menu links, Sidebar section.

---

## 1. Routes

| Path | Role | Purpose |
|------|------|---------|
| `/profile` | admin · owner · agent | Personal info: name, avatar, read-only email, read-only role. |
| `/profile/security` | admin · owner · agent | Change password. Agents cannot reach this if their email is `.scale` (admin-only reset for them). |
| `/profile/notifications` | admin · owner · agent | In-app notification toggles (lead assigned to me, new message on my thread, stage changed by automation, @mentions). |
| `/profile/sessions` | admin · owner · agent | List + sign out active Supabase sessions; "Sign out everywhere". |
| `/workspace` | admin · owner | Business profile: org name, business address (`slug`), currency, timezone, branding. |
| `/workspace/team` | admin · owner | **Reuses** `TeamAgentsSection` (already exists, see `07-business-agents.md`). |
| `/workspace/billing` | admin · owner | Plan, invoices. **Reuses** existing `AdminBillingPage` with a renamed route. |
| `/workspace/danger` | admin · owner | Transfer ownership, close workspace (async, request-based; see §6). |

Route guards live in `src/App.tsx` via `ProtectedRoute` (already in use). Every new page is wrapped in `<AppShell title="…">`.

---

## 2. What each page contains

### 2.1 `/profile` — Personal

Sections (all in one scrollable page, right-rail nav inside the shell):

1. **Identity** — avatar uploader, full name, read-only email, read-only role + "assigned by <org name>".
2. **Sign-in info** — for agents shows `handle@slug.scale` as **read-only** text with a "Contact your admin to rename" helper. For admins/owners shows the real email and a **Change email** flow (requires password re-auth; Supabase emits a confirmation email).
3. **Language & locale** — `en` only today, but scaffold the selector so we can drop `fr`/`ar` in later. Writes to `profiles.preferences` JSONB.
4. **Preferences** — timezone override (falls back to org timezone), date format (`DD/MM/YYYY` default for Algeria), number format.
5. **Danger zone** — leave workspace (agent/owner), delete my account (soft: sets `status='inactive'` on profile + `auth.admin.deleteUser` via a new edge function `delete-me`).

### 2.2 `/profile/security`

- Change password (old + new + confirm, calls `supabase.auth.updateUser({ password })`).
- Disabled form with clear message if `isAgentEmail(user.email)` — "Ask your business admin to reset your password."
- (Phase 2 placeholder) TOTP / WebAuthn card saying "Coming soon".

### 2.3 `/profile/notifications`

A matrix of toggles (rows = event, cols = [In-app, Email]). Writes to `profiles.notification_prefs` JSONB, defaults set by migration. First version:

| Event | In-app | Email |
|------|:-:|:-:|
| Lead assigned to me | ✅ on | ❌ off |
| New reply on my thread | ✅ on | ❌ off |
| Opportunity stage changed by automation | ✅ on | ❌ off |
| Automation escalated to me | ✅ on | ❌ off |
| Weekly report ready | ✅ on | ❌ off |
| Mentions (`@me`) | ✅ on | ❌ off |

### 2.4 `/profile/sessions`

Lists the result of `supabase.auth.getUserSessions()` (new SDK) or, if unavailable, reads the JWT `iat`/`user_agent` hint from the current session and shows "this browser". "Sign out everywhere" calls `supabase.auth.signOut({ scope: 'global' })`.

### 2.5 `/workspace` — Business profile

- **Business name** (`organizations.name`).
- **Business address** (`organizations.slug`) — editable via the existing `claim_org_slug` RPC. Warn before change: "This changes the sign-in address of every sales agent on your team (`handle@<new>.scale`). They must use the new address next time they sign in."
- **Currency** (`DZD` default) — used by Opportunities / Billing.
- **Timezone** (`Africa/Algiers` default) — used by reports + timestamps.
- **Brand** — org avatar (square logo) + accent color. Writes to a new `organizations.branding` JSONB column.
- **Data retention** (display-only for now): "Conversations kept 24 months, leads 7 years."

### 2.6 `/workspace/team`

Thin wrapper. Renders `<TeamAgentsSection variant="owner" />` (already built in 07). No duplication.

### 2.7 `/workspace/billing`

Move the existing `AdminBillingPage` content here. Keep the old path as a redirect for one release, then delete.

### 2.8 `/workspace/danger`

- **Transfer ownership** → searches `profiles` where `org_id = current_org_id()` and `role = 'owner'` (so promote another owner first — single-step transfer is phase 2).
- **Close workspace** → opens an email-us / confirmation dialog; no hard-delete path exposed from the UI.

---

## 3. Data model changes

### 3.1 `profiles`

Add two JSONB columns + a preferences helper:

```sql
alter table public.profiles
  add column if not exists preferences       jsonb not null default '{}'::jsonb,
  add column if not exists notification_prefs jsonb not null default '{}'::jsonb;
```

- `preferences` — `{ language, timezone, dateFormat, numberFormat }` (all optional; fall back to org).
- `notification_prefs` — `{ <event>: { in_app: bool, email: bool } }` (missing keys default to table in §2.3).

RLS already allows self-update (`id = auth.uid()`); no policy change needed.

### 3.2 `organizations`

```sql
alter table public.organizations
  add column if not exists branding jsonb not null default '{}'::jsonb;
```

`branding` = `{ logo_url, accent_color }`. `timezone` / `currency` / `plan` already exist.

### 3.3 New storage bucket — `avatars` (public)

User avatars are public URLs (simplest). Organizations' logos also go here. Path layout: `avatars/<org_id>/profiles/<user_id>.<ext>` and `avatars/<org_id>/org/logo.<ext>` — the same "first folder segment = org_id" rule the other buckets already enforce.

```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
```

Storage policies: extend the existing "scale objects *" family to include `avatars` (read is already public because `public = true`; writes still require `org_id` prefix and `authenticated` role).

### 3.4 New RPCs

Only as many as we need for the UI; avoid dumping sensitive writes onto `from('profiles').update(...)`.

```sql
-- Rename myself (name only; email is handled by auth.updateUser or manage-agent).
create or replace function public.update_my_profile(new_name text, new_prefs jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set name        = coalesce(nullif(new_name,''), name),
         preferences = coalesce(new_prefs, preferences)
   where id = auth.uid();
end;$$;

-- Notification prefs — merge, don't replace.
create or replace function public.set_my_notification_prefs(delta jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare out jsonb;
begin
  update public.profiles
     set notification_prefs = notification_prefs || coalesce(delta,'{}'::jsonb)
   where id = auth.uid()
  returning notification_prefs into out;
  return out;
end;$$;

-- Org update (owner/admin only).
create or replace function public.update_my_org(
  new_name      text    default null,
  new_timezone  text    default null,
  new_currency  text    default null,
  new_branding  jsonb   default null
) returns void language plpgsql security definer set search_path = public as $$
declare r text := public.current_role();
begin
  if r is null or r not in ('admin','owner') then
    raise exception 'Forbidden';
  end if;
  update public.organizations
     set name     = coalesce(nullif(new_name,''), name),
         timezone = coalesce(nullif(new_timezone,''), timezone),
         currency = coalesce(nullif(new_currency,''), currency),
         branding = coalesce(new_branding, branding)
   where id = public.current_org_id();
end;$$;

grant execute on function public.update_my_profile(text, jsonb)            to authenticated;
grant execute on function public.set_my_notification_prefs(jsonb)          to authenticated;
grant execute on function public.update_my_org(text, text, text, jsonb)    to authenticated;
```

`claim_org_slug(text)` already exists from 07 — reused as-is.

### 3.5 New edge function — `delete-me`

Mirrors `manage-agent` but for self-deletion. Reason: cannot call `auth.admin.deleteUser` from the browser. Soft-deletes the profile (status='inactive', org_id=null) then removes the auth user. **Owner** who is the last owner of the org cannot delete themselves — must transfer ownership first.

---

## 4. Frontend scaffolding

```
src/
├── lib/db/
│   └── me.ts                  # updateMyProfile, setMyNotificationPrefs, updateMyOrg
├── pages/
│   ├── profile/
│   │   ├── ProfilePage.tsx            # /profile
│   │   ├── SecurityPage.tsx           # /profile/security
│   │   ├── NotificationsPage.tsx      # /profile/notifications
│   │   └── SessionsPage.tsx           # /profile/sessions
│   └── workspace/
│       ├── WorkspacePage.tsx          # /workspace
│       ├── WorkspaceBillingPage.tsx   # /workspace/billing (move from AdminBillingPage)
│       ├── WorkspaceTeamPage.tsx      # /workspace/team (re-export OwnerAgents)
│       └── WorkspaceDangerPage.tsx    # /workspace/danger
└── components/
    ├── profile/
    │   ├── AvatarUploader.tsx
    │   ├── ProfileIdentityCard.tsx
    │   ├── NotificationPrefsMatrix.tsx
    │   └── ProfileNav.tsx             # tabs/rail for the 4 profile sub-pages
    └── workspace/
        ├── WorkspaceNav.tsx
        └── OrgBrandingCard.tsx
```

Reuse **`AppShell`**, **`PageHeader`**, **`PageSection`**, **`ScaleBadge`**, **`EmptyState`** from `src/components/layout` and `src/components/ui`.

### 4.1 Entry points already in the codebase

Wire new links into files that already exist:

- **`src/components/layout/Topbar.tsx`** — user menu already has a dropdown. Add two `DropdownMenuItem`s above *Sign out*:
  - "My profile" → `/profile` (always).
  - "Workspace settings" → `/workspace` (shown only when `user.role !== 'agent'`).
- **`src/components/layout/Sidebar.tsx`** — add a new bottom section "Settings" with:
  - "Profile" → `/profile` (all roles).
  - "Workspace" → `/workspace` (admin/owner only).
- **`src/App.tsx`** — 8 new `<Route>`s + `ProtectedRoute`.

---

## 5. Copy guidelines

- Never say "AI" in the UI. Use "automation" or "assistant" (per `DESIGN_SYSTEM.md`).
- Page titles: **Profile**, **Security**, **Notifications**, **Sessions**, **Workspace**, **Team**, **Billing**, **Danger zone**.
- Role label in Identity section is human-readable via `roleLabel()` (already in `src/lib/utils.ts`).
- For `.scale` agents on `/profile`, show the explanation once at the top of the Identity card, not next to every field: *"Your sign-in is managed by your business admin. You can change your name and password here; email changes go through your admin."*

---

## 6. Acceptance criteria

### `/profile`
- [ ] Any signed-in user sees their current name, avatar, email, role, org name.
- [ ] Name change hits `update_my_profile` RPC; toast "Saved"; `AuthContext.refreshUser()` re-hydrates.
- [ ] Avatar uploader writes to `avatars/<org_id>/profiles/<uid>.<ext>`, saves the **public** URL in `profiles.avatar_url`, and updates `<UserAvatar />` instances across the app (existing component reads from props, so only Topbar + Sidebar need to read the new URL).
- [ ] Email is read-only for every role. A "Change email" row appears for non-agents and opens a Supabase flow (out-of-scope; show a placeholder modal in v1).
- [ ] Role badge is read-only.
- [ ] "Leave workspace" is not shown to the only remaining owner.

### `/profile/security`
- [ ] Changing password requires old password (client-side verify via `signInWithPassword` then `updateUser`), min 8 chars, confirm match.
- [ ] `.scale` agents get a locked-out state explaining the admin must reset.

### `/profile/notifications`
- [ ] Toggling a switch calls `set_my_notification_prefs({ <event>: { in_app | email: bool } })` immediately (optimistic + rollback on error).
- [ ] Defaults from §2.3 apply when the column is `{}`.

### `/profile/sessions`
- [ ] Shows at least the current session. "Sign out everywhere" signs out, redirects to `/login`.

### `/workspace`
- [ ] Only admin/owner can load the page; agents see **403 → /profile redirect**.
- [ ] Saving name, timezone, currency, branding uses `update_my_org` RPC.
- [ ] Changing the slug warns first, then calls `claim_org_slug`. On success, shows the new sign-in address `handle@<new>.scale` and refreshes `user.orgSlug`.
- [ ] Unique-slug collision shows the existing "That business address is already taken" error.

### `/workspace/billing`
- [ ] Replaces `AdminBillingPage`; redirect from old path (one release).
- [ ] No feature change in v1.

### `/workspace/danger`
- [ ] Transfer/close are confirmation-gated; irreversible actions require typing the org slug to enable the button (same pattern as delete-agent in `TeamAgentsSection`).

---

## 7. Security notes

- All writes go through **SECURITY DEFINER RPCs** with `set search_path = public` and role checks at the top. No direct `from('organizations').update(...)` from the browser.
- `delete-me` edge function enforces: caller JWT matches target; owner cannot leave if they are the last one.
- Avatars bucket is public; no PII should ever be embedded in the **filename**. We use `<uid>.<ext>` only.
- Session listing, if implemented via `auth.getUserSessions`, is read-only; we never accept a session_id from the URL.

---

## 8. Rollout order

1. **Schema migration** — new columns + bucket + RPCs + policies. File: `supabase/migrations/20260420120000_profile_and_workspace.sql`.
2. **Edge function** — `supabase/functions/delete-me/index.ts`.
3. **Frontend scaffolding (read-only)** — all pages render current values; no writes yet. Ships behind feature flag `VITE_PROFILE_ENABLED` for 1 release.
4. **Writes** — name, avatar, password, notification matrix.
5. **Workspace** — org name, timezone, currency, branding, slug rename flow.
6. **Billing move** — retire `AdminBillingPage`.
7. **Sessions + danger zone** — last; depends on SDK availability of `getUserSessions`.

Each step ships independently and is reversible by dropping the migration + removing the routes.

---

## 9. Out of scope (phase 2+)

- Full **SSO / OAuth** sign-in.
- **MFA** (TOTP/WebAuthn) beyond the placeholder.
- **Per-agent API keys** (for agents to drive the CRM from scripts).
- **Role management** from the workspace UI (add/remove **owners**). Handled via SQL today; UI is a later ticket.
- **GDPR-style data export** of "everything about me".
- **Audit log** of profile/workspace changes (the `manage-agent` edge function already has the hook point from 07).
