# 01 — Auth, password reset, session

Supabase Auth replaces the mock `MOCK_USERS` in `src/lib/auth.ts`. Every authenticated request the app makes is scoped by `profiles.org_id` through the RLS helper `public.current_org_id()` created in `schema.sql`.

---

## 1.1 Flows at a glance

```
Sign up  ──► auth.users INSERT
            ├─► trigger public.handle_new_user() inserts public.profiles
            └─► app calls RPC bootstrap_my_org()
                ├─► creates organizations row
                ├─► sets profiles.org_id + role='admin'
                ├─► seeds billing / refund_policy / intervention_settings
                ├─► seeds 4 automation_agent_configs (disabled)
                └─► seeds 6-row automation_triggers matrix
            └─► redirect /admin/dashboard

Sign in  ──► auth.signInWithPassword
            └─► fetch profile (id, role, org_id)
            └─► redirect by role (/admin/dashboard | /dashboard | /dashboard)

Forgot   ──► auth.resetPasswordForEmail(email, redirectTo: /reset-password)
            └─► email contains magic link with ?token=...&type=recovery

Reset    ──► /reset-password handles the callback
            ├─► supabase picks up the token from the URL hash
            └─► auth.updateUser({ password })

Logout   ──► auth.signOut → redirect /login
```

Invited users (admin → owner / agent): MVP recommendation is to ask the person to sign up themselves, then an admin promotes them via [`supabase/promote-admin.sql`](../../supabase/promote-admin.sql) (or the `/admin/users` page, once it is wired to update `profiles.role`). A server-side invite via `auth.admin.inviteUserByEmail` is a phase-2 item — requires an edge function so the service-role key is never shipped to the browser.

---

## 1.2 Files to create / touch

| File | What changes |
|---|---|
| `src/lib/supabase.ts` | new — single client instance |
| `src/contexts/AuthContext.tsx` | replace mock with Supabase session + profile hydration |
| `src/lib/auth.ts` | drop `MOCK_USERS`; keep `getDashboardRoute(role)` |
| `src/pages/Login.tsx` | real sign-in; add "Forgot password" + link to `/register` |
| `src/pages/Register.tsx` | new — email + password + org name |
| `src/pages/ForgotPassword.tsx` | new — email input, sends reset email |
| `src/pages/ResetPassword.tsx` | new — new-password form, used by the reset email link |
| `src/App.tsx` | register the 3 new public routes before role-guarded ones |

---

## 1.3 Supabase client

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,    // needed for the password-recovery redirect
    flowType: 'pkce',
  },
});
```

---

## 1.4 AuthContext (new body)

Same public API the app already uses — pages don't change:

```ts
interface AuthState {
  user: { id: string; email: string; name: string; role: Role; orgId: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, orgName: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  completePasswordReset: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

Key implementation points:

- On mount, call `supabase.auth.getSession()` once, then subscribe via `supabase.auth.onAuthStateChange`.
- `hydrate(session)` loads `profiles` for `session.user.id`. If the profile has no `org_id` yet, call `supabase.rpc('bootstrap_my_org', { org_name })` to fix that in-place, then refetch.
- The whole app stays inside `<AuthProvider>` (already the case).

---

## 1.5 Sign-up page

`src/pages/Register.tsx`:

```tsx
async function onSubmit({ email, password, name, orgName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },   // fills profiles.name via handle_new_user()
  });
  if (error) throw error;

  // If email confirmations are on, data.session is null — show "check your email".
  if (!data.session) return setState('awaiting_confirmation');

  // Confirmations off (dev): we are already signed in.
  await supabase.rpc('bootstrap_my_org', { org_name: orgName });
  navigate('/admin/dashboard');
}
```

For dev, turn **email confirmations OFF** in Supabase → Authentication → Providers → Email. Turn them back on for production and add a "check your inbox" screen.

---

## 1.6 Forgot + reset pages

`src/pages/ForgotPassword.tsx`:

```tsx
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
});
```

`src/pages/ResetPassword.tsx` (loaded from the email link — the Supabase client auto-parses the hash because of `detectSessionInUrl: true`):

```tsx
useEffect(() => {
  const { data: sub } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') setReady(true);
  });
  return () => sub.subscription.unsubscribe();
}, []);

async function onSubmit({ password }) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  navigate('/login?reset=ok');
}
```

---

## 1.7 Routing changes

`src/App.tsx` — add public routes **before** the role-guarded ones:

```tsx
<Route path="/login" component={LoginPage} />
<Route path="/register" component={RegisterPage} />
<Route path="/forgot-password" component={ForgotPasswordPage} />
<Route path="/reset-password" component={ResetPasswordPage} />
```

Supabase redirect-URL allow-list (Dashboard → Authentication → URL configuration):

- **Site URL:** `http://localhost:5173` (dev) / your production URL.
- **Additional Redirect URLs:** add `http://localhost:5173/reset-password` and the production equivalent.

---

## 1.8 Role-based redirects

`ProtectedRoute` stays in `App.tsx` (no change needed). It already redirects:

- not signed in → `/login`
- wrong role → role default dashboard

`getDashboardRoute(role)` keeps the mapping:

```
admin  → /admin/dashboard
owner  → /dashboard        (OwnerDashboard)
agent  → /dashboard        (AgentDashboard)
```

---

## 1.9 Acceptance checklist

- [ ] `/register` creates `auth.users`, `profiles`, `organizations`, seeds defaults, redirects to `/admin/dashboard`.
- [ ] `/login` signs in an existing user and routes by role.
- [ ] Hard refresh keeps you signed in.
- [ ] `/forgot-password` emails a reset link to `/reset-password`.
- [ ] `/reset-password` completes and logs you in.
- [ ] Logout returns to `/login` and clears the session.
- [ ] Wrong role on a protected route bounces to the correct dashboard, not `/login`.
- [ ] Pasting `supabase/promote-admin.sql` with a user's email promotes them immediately (verify `select role from profiles`).
