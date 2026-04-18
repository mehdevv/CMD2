# 07 — Supabase backend (MVP)

This plan wires the whole app to **Supabase** so every CRM entity, configuration, and conversation persists server-side, scoped by organization and secured by Row-Level Security. It **removes all mock data** so you start from an empty database and add real leads, opportunities, templates, etc. by hand (or via CSV import later).

Socials (WhatsApp Business / Instagram DMs / Facebook Messenger) are **out of scope** for this phase — channels appear as placeholders and can be connected in a later phase without any schema change.

---

## 7.0 What you ship in this phase

1. A Supabase project with the full schema in `supabase/schema.sql`.
2. A Vite client that uses Supabase Auth + PostgREST instead of `MOCK_USERS` and `MOCK_*`.
3. An empty CRM: no mock leads / opportunities / conversations. First login bootstraps the signed-in user's own organization + 4 default agent configs + the triggers matrix.
4. All agent configuration (Follow-Up, Chat, Tracking, Refund) is persisted per org.
5. Basic enrichment + closing-lead flow works end-to-end:
   - manually create a Lead → edit enrichment fields → mark Qualified → **Convert to Opportunity** → walk through all 5 stages → Win/Lose.
6. Meetings (briefs + notes) persist. Voice recordings land in a private Storage bucket.
7. Reports generated on `/analytics/reports` save to `analytics_reports` and are shareable by link.

---

## 7.1 Environment variables

Copy `.env.example` → `.env` at the project root and fill:

| Variable | Where it comes from | Used by |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase dashboard → Settings → API → **Project URL** | Browser + server |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Settings → API → **Publishable key** (`sb_publishable_...`) *or* legacy **anon public** | Browser |
| `SUPABASE_SECRET_KEY` | Settings → API → **Secret key** (`sb_secret_...`) *or* legacy **service_role** | Edge functions / migrations only. **Never** ship to the client. |
| `SUPABASE_DB_URL` | Settings → Database → **Connection string (URI)** | Psql, migrations, seed scripts |
| `VITE_APP_URL` | e.g. `http://localhost:5173` or your prod URL | Auth redirect URLs |
| `VITE_APP_NAME` | "Scale" | Browser tab title, copy |

LLM keys (OpenAI / Anthropic / Google) are **stored per-org in the database** on the agent configuration page, not in `.env`. The only reason to set `VITE_OPENAI_API_KEY` locally is quick development.

Apply the redirect URLs in Supabase:
- Dashboard → Authentication → URL Configuration
- **Site URL:** `https://YOUR-DOMAIN` (or `http://localhost:5173`)
- **Additional Redirect URLs:** add every URL you will use (preview, staging, production).

---

## 7.2 Bootstrap the database

1. Open Supabase → **SQL Editor** → **New query**.
2. Paste the entire content of `supabase/schema.sql`.
3. Click **Run**. You should see `Success. No rows returned`.
4. The schema enables RLS and creates a helper RPC `bootstrap_my_org('Org name')`.
5. Dashboard → **Authentication → Users → Add user** → create your first user (email + password). No email confirmation needed in dev.
6. Sign in to the Scale app once (see section 7.4). On first login the app calls `bootstrap_my_org()` which creates your org, promotes your profile to **admin**, and seeds default refund policy, intervention settings, 4 empty agent configs, and the triggers matrix.

After that, everything is empty until you type it in.

---

## 7.3 Data model (one-screen summary)

Everything is scoped by `org_id`. RLS compares it to `public.current_org_id()`, a SECURITY DEFINER function that reads the caller's `profiles.org_id`.

```
organizations
  └── profiles (role: admin | owner | agent)
  └── billing
  └── invoices
  └── channels (whatsapp/ig/fb placeholders)
  └── refund_policy
  └── intervention_settings
  └── automation_triggers
  └── templates
  └── rules
  └── leads (enrichment fields, converted_opportunity_id ↩)
       └── lead_tags, lead_pain_points
       └── conversations
            └── messages
       └── meeting_briefs (or on opportunity)
       └── meeting_notes  (or on opportunity)
  └── opportunities
       └── qualification (+ competing solutions, risk flags)
       └── need_analysis (+ goals, metrics, decision criteria, stakeholders)
       └── proposals (+ proposal_line_items)
       └── payments
       └── stage_transitions
       └── objections
  └── automation_agent_configs (one row per agent_id)
       └── agent_forbidden_topics
       └── followup_steps                — Follow-Up agent only
       └── faq_entries                    — Chat agent only
       └── carrier_integrations + status_messages — Tracking agent only
       └── policy_rules + refund_decisions — Refund agent only
  └── automation_activity_log
  └── intelligence_items
  └── analytics_reports
  └── notifications
```

Storage buckets:
- `proposals/<org_id>/...` (PDF / link attachments from proposal drafts)
- `contracts/<org_id>/...` (signed closing-stage contracts)
- `voice-notes/<org_id>/...` (post-meeting voice recordings)

---

## 7.4 Frontend integration

### 7.4.1 Install client + helper packages

```bash
npm i @supabase/supabase-js @tanstack/react-query
```

### 7.4.2 Create `src/lib/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !key) {
  // Fail fast so you notice a missing .env during dev.
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});
```

### 7.4.3 Replace `AuthContext` with real Supabase auth

Keep the same hook signature (`const { user, loading, login, logout } = useAuth()`) so pages don't change:

```ts
// src/contexts/AuthContext.tsx — new body (sketch)
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    hydrate(data.session);
    setLoading(false);
  });
  const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => hydrate(session));
  return () => sub.subscription.unsubscribe();
}, []);

async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}
async function logout() { await supabase.auth.signOut(); }
```

`hydrate()` fetches `profiles` for `session.user.id` and exposes `{ id, email, role, name, orgId }` to the rest of the app.

First-time login flow for an admin:

```ts
// run once per user; safe to re-run
const { data } = await supabase.rpc('bootstrap_my_org', { org_name: 'My Business' });
```

### 7.4.4 Data-access layer (`src/lib/db/*.ts`)

One file per feature. Each exports simple `list / get / create / update / remove` functions built on `supabase.from('...').select()` / `.insert()` / `.update()` / `.delete()`.

Suggested files:

```
src/lib/db/
  leads.ts
  opportunities.ts
  proposals.ts
  payments.ts
  conversations.ts
  messages.ts
  meetings.ts
  templates.ts
  rules.ts
  billing.ts
  channels.ts
  agent-config.ts
  followup-steps.ts
  faq-entries.ts
  status-messages.ts
  policy-rules.ts
  refund-decisions.ts
  automation-triggers.ts
  intervention.ts
  activity-log.ts
  intelligence.ts
  reports.ts
  notifications.ts
```

Each file looks like:

```ts
import { supabase } from '@/lib/supabase';
import type { Lead } from '@/lib/types';

export async function listLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*, lead_tags(tag), lead_pain_points(point)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Lead[];
}

export async function createLead(input: Partial<Lead>) { … }
export async function updateLead(id: string, patch: Partial<Lead>) { … }
export async function deleteLead(id: string) { … }
```

Wrap reads in React Query hooks:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useLeads() {
  return useQuery({ queryKey: ['leads'], queryFn: listLeads });
}
```

### 7.4.5 Remove all mock data

Files to gut (in one commit so the diff is reviewable):

1. **Delete mock arrays** in `src/lib/mock-data.ts`:
   - `MOCK_USERS`, `MOCK_AGENTS`, `MOCK_LEADS`, `MOCK_CONVERSATIONS`,
     `MOCK_MEETING_BRIEFS`, `MOCK_MEETING_NOTES`, `MOCK_INTELLIGENCE`,
     `MOCK_ACTIVITY_FEED`, `MOCK_TEMPLATES`, `MOCK_PENDING_TEMPLATES`,
     `MOCK_INVOICES`, `MOCK_LEADERBOARD`, `MOCK_AI_AGENT_METRICS`,
     `DEFAULT_FOLLOWUP_STEPS`, `DEFAULT_FAQ`, `DEFAULT_RULES`,
     `MOCK_OPPORTUNITIES`, `MOCK_REPORTS`.
   - Keep only `MOCK_LOSS_REASONS` (static lookup, not CRM data) and
     `DEFAULT_FOLLOWUP_STEPS` if you still want a visual prefilled
     sample — otherwise remove them too.
2. **`CrmDataContext`** in `src/contexts/CrmDataContext.tsx`:
   - Replace the in-memory state with React Query hooks from §7.4.4.
   - Every page already consumes a hook — swap the implementation, not the API.
3. **`src/lib/auth.ts`** — delete `MOCK_USERS`. Keep `getDashboardRoute()`.
4. **`Login.tsx`** — remove the "Demo credentials" hint banner.
5. **Empty states** — every list page must render an informative empty
   state + **Add your first …** CTA because the DB starts empty.

After this commit, starting the app with no seed data shows:
Leads (0), Opportunities (0), Inbox (0), Templates (0), Invoices (0),
Intelligence items (0), Reports (0), Channels (all disconnected),
with the 4 agent configs present but **disabled**.

### 7.4.6 Role-scoped queries (match `04 §4.9`)

RLS enforces org isolation. The additional "agent only sees their own rows" rule is applied at the **query** level:

```ts
export async function listOpportunitiesForUser(user) {
  const q = supabase.from('opportunities').select('*');
  return user.role === 'agent' ? q.eq('owner_id', user.id) : q;
}
```

Admin + owner see everything in their org. Agents see rows they own (`leads.assigned_to` or `opportunities.owner_id`).

---

## 7.5 Feature-by-feature MVP checklist

Grouped so you can ship in vertical slices. Each item is a **completed state** you can demo.

### A. Auth & org

- [ ] Supabase project created, schema applied, keys in `.env`.
- [ ] Email/password sign-in works; session persists.
- [ ] First login calls `bootstrap_my_org` and sets role = admin.
- [ ] Invite flow (`/admin/users`): admin adds `profiles(email, role='agent', status='invited')` and sends a Supabase magic link.
- [ ] Logout.

### B. Leads + enrichment + closing flow (the "enrichment and closing" core)

- [ ] Leads list + kanban read from `public.leads`.
- [ ] **Add lead** dialog inserts into `leads` (owner-assigned if created by admin, else self-assigned).
- [ ] Contact Detail updates enrichment fields (`company`, `company_size`, `industry`, `country`, `city`, `budget_range`, `timeline`, `qualification_score`) and bumps `enriched_at`.
- [ ] Tags / pain points persisted to `lead_tags` / `lead_pain_points`.
- [ ] **Take over** toggles `conversations.automation_paused` + assigns to current user.
- [ ] **Convert to Opportunity** creates an `opportunities` row + links it back via `leads.converted_opportunity_id`, and stamps `leads.ai_status='completed'`.
- [ ] Opportunity detail reads & updates:
  - `opportunities` (stage, value, probability, next step, close date)
  - `opportunity_qualification` (+ competing / risk children)
  - `opportunity_need_analysis` (+ goals / metrics / criteria / stakeholders)
  - `proposals` + `proposal_line_items` (versioned)
  - `payments`
  - `opportunity_stage_transitions` (one row on every stage move)
  - `opportunity_objections` (on negotiation entries)
- [ ] `canAdvance()` stays client-side; server still accepts any legal stage string. Drag-to-move on the board pops the confirmation dialog before mutating.
- [ ] **Won / Lost** writes `outcome`, `loss_reason` / `won_detail`, `stage='won'|'lost'`, and appends a transition row.
- [ ] Contracts uploaded on Closing stage go to Storage `contracts/<org_id>/<opportunity_id>/<filename>`.

### C. Conversations (manual for now, WhatsApp/IG/FB later)

- [ ] Inbox lists conversations with RLS + org scope.
- [ ] Compose sends an `INSERT` into `messages` and updates `conversations.last_message` + `last_time`.
- [ ] Take over / release uses `automation_paused` on the conversation row.
- [ ] New conversations can be **manually added** from a lead detail page (useful before socials are connected).

### D. Meetings

- [ ] **Brief** inserts into `meeting_briefs` with `lead_id` or `opportunity_id`.
- [ ] **Notes** inserts into `meeting_notes`; voice recording uploaded to `voice-notes/<org_id>/<meeting_id>.webm`; row stores `voice_file_url`.

### E. Templates, rules, refund policy

- [ ] `/admin/templates` CRUD against `templates`.
- [ ] `/admin/rules`:
  - Refund policy card → upsert `refund_policy`.
  - IF/THEN rows → CRUD `rules`.
- [ ] Template approval flow updates `templates.status`.

### F. Automation agents

All four configuration pages now save to the database. No bot runs yet — these are just the settings the bots will later read from.

- [ ] `/admin/agents` grid shows each row in `automation_agent_configs` with its `enabled` toggle.
- [ ] **Lead Follow-Up** (`/admin/agents/followup`):
  - Update `automation_agent_configs` (LLM + personality fields).
  - CRUD ordered `followup_steps` rows.
  - Assignment strategy stored in `extra->>'assignment'` JSON.
- [ ] **Client Chat** (`/admin/agents/chat`):
  - Update `automation_agent_configs` (tone, opening, `emoji_level`, `mirror_energy`, `max_response_sec`, `holding_message`).
  - CRUD `faq_entries`.
- [ ] **Order Tracking** (`/admin/agents/tracking`):
  - Upsert `carrier_integrations`.
  - CRUD `status_messages`.
- [ ] **Refund** (`/admin/agents/refund`):
  - Update `automation_agent_configs.policy_*` fields.
  - CRUD `policy_rules`.
  - **Decision log** reads from `refund_decisions`.
- [ ] Owner-facing pages show the same rows but edit only the copy fields (name, tone, system prompt, FAQ, customer-facing messages). Everything else is read-only.

### G. Triggers, intervention, activity log

- [ ] `/admin/automation/triggers` is a live editable table against `automation_triggers` (seeded defaults created by `bootstrap_my_org`).
- [ ] `/admin/automation/intervention` upserts the single row in `intervention_settings`.
- [ ] `/admin/automation/activity` pages through `automation_activity_log` with filters on `kind` and `agent_id`.

### H. Analytics + reports

- [ ] Selectors in `src/lib/analytics.ts` run over server data (accept arrays returned from Supabase instead of mock arrays).
- [ ] `/analytics` charts stay pure functions of the arrays.
- [ ] `/analytics/reports`:
  - Generating a report inserts a row in `analytics_reports` with `sections` as JSONB.
  - The report detail page loads by id; **share link** encodes `share_slug` so reports can be opened publicly (separate RLS policy may be added later; for MVP share links stay org-scoped).

### I. Notifications

- [ ] The Topbar bell lists `notifications` where `recipient_id = auth.uid()`.
- [ ] Marking read updates the row.

---

## 7.6 What is deliberately deferred

To keep this phase shippable in a week:

1. **Social channel ingest** — WhatsApp Cloud API / Instagram Graph / FB Messenger webhooks. The `channels` table and `messages` table are ready, so when you add an edge function that receives carrier webhooks it can insert rows without schema changes.
2. **Email / SMS notifications** — `notifications` are in-app only. An edge function can later subscribe to `notifications INSERT` events and send email via Supabase Resend.
3. **Live LLM calls** from the bots — configurations are saved; wiring the agents to OpenAI / Anthropic happens in a separate phase.
4. **Billing automation** — `billing` is read/write but no Stripe webhook yet.
5. **Cross-org admin** — single-org per user. Multi-org memberships can be added later by replacing `profiles.org_id` with an `org_members(org_id, user_id, role)` table; RLS helpers `current_org_id()` / `current_role()` keep the same name.

---

## 7.7 Acceptance demo script

1. `npm run dev`, visit `/login`, sign in with the Supabase user you created.
2. App reports "No leads yet" on `/leads`. Click **Add lead** → fill name + phone + channel → Save. Lead appears in the **New** column.
3. Open the lead → edit enrichment (company, size, industry, score). Add two tags + a pain point. Save. Refresh the page — data persists.
4. Header → **Convert to Opportunity**. New row appears on `/opportunities` with stage `Qualification`.
5. Walk the opportunity through every stage: Qualification → Need Analysis → Proposal (add a line item → send) → Negotiation (log an objection) → Closing (upload a signed PDF → bucket `contracts/`). Mark **Won**. Kanban + list reflect it.
6. Go to `/meetings/notes/<lead_id>`, record a voice note → submit. Row + file appear.
7. `/admin/agents/chat` — add 3 FAQ entries, change tone to **friendly**, hit Save. Hard-refresh — fields persist.
8. `/analytics/reports` — ask "Why did we lose deals last month?". A report is generated + saved. Copy link, open in a new incognito tab, sign in, land on the same report.
9. Open Supabase Dashboard → Table editor — every piece of data you created is visible there.

When that script is green end-to-end on an empty-then-populated database, this phase is done.
