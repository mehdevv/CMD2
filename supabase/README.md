# Supabase setup

Everything you need to bring up the Scale backend on a fresh Supabase project.

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick a region close to your users.
3. Save the **database password** — it ends up in `SUPABASE_DB_URL`.

## 2. Apply the schema

1. Dashboard → **SQL Editor** → **New query**.
2. Paste the entire contents of [`schema.sql`](./schema.sql).
3. Click **Run**.

The script is idempotent (re-running it is safe). You should see `Success. No rows returned.`

## 3. Create your first user

Dashboard → **Authentication → Users → Add user** → email + password (skip email confirmation for local dev).

Sign in once through the Scale app (see [`../context/plans/07-supabase-backend.md`](../context/plans/07-supabase-backend.md) §7.2 step 6). On first login the app calls the bootstrap RPC which:

- creates your organization
- sets your profile to **`owner`** (business tenant). The **`admin`** role is reserved for Scale platform operators; assign it with [`promote-admin.sql`](./promote-admin.sql).
- inserts the 4 default agent configs, the triggers matrix, empty refund policy, empty intervention settings, and empty billing row.

If an older database still assigned `admin` on bootstrap, apply migration [`migrations/20260418200000_bootstrap_owner_role.sql`](./migrations/20260418200000_bootstrap_owner_role.sql), then set mistaken rows to `owner` in **SQL Editor** (replace the id with the user from **Authentication → Users**):

`update public.profiles set role = 'owner' where id = 'USER_UUID_HERE';`

## 4. Environment variables

Copy [`../.env.example`](../.env.example) to `.env`, fill the Supabase fields from **Settings → API** and **Settings → Database**.

## 5. Storage

The schema creates three private buckets:

- `proposals` — proposal attachments, public signed URLs on demand.
- `contracts` — signed contract files from the Closing stage.
- `voice-notes` — post-meeting voice recordings.

Files **must** be uploaded under a path that starts with the org's UUID, e.g. `<bucket>/<org_id>/<filename>`. RLS enforces this.

## 6. What this schema does **not** yet include

- WhatsApp / Instagram / Facebook webhook ingestion (edge function to be added later).
- Stripe / payment-processor hooks.
- Real LLM keys — those live in `automation_agent_configs` per org, not in `.env`.
- Email/SMS outbound for notifications — everything is in-app first.

Continue with [`../context/plans/07-supabase-backend.md`](../context/plans/07-supabase-backend.md) for the full wiring plan and MVP checklist.

## 7. Business agents (`handle@slug.scale`)

If you already applied `schema.sql` **before** org slugs existed, run the migration once:

1. **SQL:** paste and run [`migrations/20260418120000_business_agents.sql`](./migrations/20260418120000_business_agents.sql) in the SQL Editor (or merge the same changes from the bottom of [`schema.sql`](./schema.sql) on a greenfield project).

2. **Edge function** (creates agent users with the service role — required for “Add sales agent” in the app):

   Deploy from this repo so [`config.toml`](./config.toml) is applied. It sets **`verify_jwt = false`** for `manage-agent` so the browser’s **OPTIONS** preflight (which has no `Authorization` header) is not rejected by the gateway with 401 — the function still checks the JWT on every **POST**.

   From the repo root, use **`npx`** so the CLI installed by `npm i supabase` is found (plain `supabase` is not on your PATH unless you install it globally):

   ```bash
   npx supabase functions deploy manage-agent --project-ref YOUR_PROJECT_REF
   ```

   Or: `npm run deploy:manage-agent -- --project-ref YOUR_PROJECT_REF` (same thing; see root `package.json`).

   In the Supabase dashboard → **Edge Functions → manage-agent → Secrets**, set:

   - `SUPABASE_URL` — same as project URL
   - `SUPABASE_ANON_KEY` — public anon key
   - `SUPABASE_SERVICE_ROLE_KEY` — **service role** (never put this in `VITE_*`)

3. **Auth:** `.scale` is a **fictional** suffix — nothing is ever delivered there. Supabase stores it as any other email because the Edge Function creates users with `email_confirm = true`. If your project has an allowlist under **Authentication → Providers → Email → Allowed Email Domains**, either leave it empty or note that the Edge Function uses the service role, which bypasses that list anyway. Do not configure SMTP for `.scale`.

Details: [`07-business-agents.md`](../context/backend%20connectivity/07-business-agents.md).
