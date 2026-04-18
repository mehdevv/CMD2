# 06 — Rollout plan

Ship in six mergeable phases. Each phase ends with something demo-able; you can stop after any phase and the app still works.

Estimated time assumes one focused developer (you + agent) on the task and `schema.sql` already applied.

---

## Phase 0 — Foundations (½ day)

- [ ] `npm i @supabase/supabase-js @tanstack/react-query`.
- [ ] Create `src/lib/supabase.ts`.
- [ ] Wrap `App.tsx` in `QueryClientProvider`.
- [ ] Add `.env` file from `.env.example`; verify `supabase.auth.getSession()` returns in the console.
- [ ] Apply [`supabase/promote-admin.sql`](../../supabase/promote-admin.sql) **once** after your first sign-up so you can test admin flows.

**Demo:** `npm run build` passes; nothing visible.

---

## Phase 1 — Auth (1 day)

Covered by [`01-auth.md`](./01-auth.md).

- [ ] Replace `AuthContext` body with Supabase session + profile hydration.
- [ ] Delete `MOCK_USERS` from `src/lib/auth.ts`.
- [ ] Build `/register`, `/forgot-password`, `/reset-password`.
- [ ] Rewrite `/login` against `signInWithPassword`; add `Forgot password?` + `Create account` links.
- [ ] Add the 4 new routes in `src/App.tsx` above `ProtectedRoute` routes.
- [ ] Add Supabase Auth **redirect URLs** (dev + prod) in the dashboard.
- [ ] Turn email confirmations **off** for dev; leave on for prod.

**Demo:** `/register` creates user + org + admin profile; `/login` works; `/forgot-password` → email → `/reset-password` closes the loop.

---

## Phase 2 — Data access layer (1 day)

Covered by [`02-data-access-layer.md`](./02-data-access-layer.md).

- [ ] Add every `src/lib/db/<entity>.ts` module with `list / get / create / update / remove`.
- [ ] Add query hooks in `src/hooks/`.
- [ ] Keep `CrmDataProvider` as a facade; swap its body to consume the new hooks.
- [ ] Replace `MOCK_*` imports in every page with hook-backed data.
- [ ] Delete unused `MOCK_*` exports in `src/lib/mock-data.ts` (keep only `MOCK_LOSS_REASONS` lookup).
- [ ] Add global toast on mutation success / error (`onSaved`, `onFailed`).

**Demo:** app runs end-to-end on an empty database. Every list page renders an empty state; `Add ...` dialogs persist rows; hard refresh keeps data.

---

## Phase 3 — Lead → opportunity closing cycle (2–3 days)

Covered by [`03-lead-closing-cycle.md`](./03-lead-closing-cycle.md).

Day 3.1 — **Leads**
- [ ] Leads list + kanban wired to `useLeads`.
- [ ] `Add lead` dialog writes to `leads`.
- [ ] `ContactDetail` reads lead + tags + pain points.
- [ ] Enrichment editor writes all enrichment columns + `enriched_at`.
- [ ] Take-over writes `conversations.automation_paused` + `assigned_to`.

Day 3.2 — **Opportunities: shell + detail + conversion**
- [ ] Add RPC `convert_lead_to_opportunity` (see §3.2).
- [ ] `Convert to Opportunity` dialog calls the RPC; redirects to `/opportunities/<id>`.
- [ ] `Opportunities` list + `Board` wired to `useOpportunities`.
- [ ] `OpportunityDetail` reads opp + timeline (stage transitions).

Day 3.3 — **Stage pages**
- [ ] Qualification form upserts `opportunity_qualification` + children.
- [ ] Need Analysis form upserts `opportunity_need_analysis` + goals / metrics / criteria / stakeholders.
- [ ] Proposal editor handles versioning + supersede + line items.
- [ ] Negotiation: objections log + partial payments.
- [ ] Closing: contract upload to `contracts` bucket + final payment.
- [ ] Won / Lost dialog writes outcome + transition row.

Day 3.4 — **Meetings**
- [ ] Brief form writes `meeting_briefs`.
- [ ] Notes form writes `meeting_notes`; voice upload to `voice-notes` bucket; store path.

**Demo:** the full acceptance script in §3.4 runs green on an empty org.

---

## Phase 4 — Settings, templates, automation configs (2 days)

- [ ] `AdminUsers` page lists `profiles`, supports role / status edits. Invites can be a `profile` row with `status='invited'` + manual SQL promotion (proper email invite is phase 6).
- [ ] `AdminChannels` persists connection placeholders to `channels`.
- [ ] `AdminTemplates` CRUD against `templates`, with the approval workflow on `status`.
- [ ] `AdminRules` saves to `rules` + `refund_policy`.
- [ ] `AdminBilling` reads `billing` + `invoices` (manual rows for now).
- [ ] **Automation configs** per agent: admin + owner pages write to the correct rows (see `04-features-by-role.md`).
  - [ ] Hide LLM / carrier / policy-number fields from owner UI.
- [ ] Triggers matrix editable.
- [ ] Human intervention settings editable.
- [ ] Activity log pagination + filters.

Optional but recommended here: **tighten RLS at the policy layer** with per-role `using` clauses for the admin-only tables listed in `04 §4.4`. Replace the broad `org_id = current_org_id()` policies on those tables with:

```sql
using (org_id = public.current_org_id() and public.current_role() = 'admin')
```

**Demo:** an owner-account user cannot toggle Refund policy rules or carrier API; tries returning a 401 / hidden UI. Admin account can.

---

## Phase 5 — Insights + reports + notifications (1–2 days)

- [ ] Port selectors in `src/lib/analytics.ts` to accept arrays from React Query.
- [ ] `/analytics` reads live data; URL filters persist.
- [ ] `/analytics/reports` list + detail use `analytics_reports`.
- [ ] Create-report flow inserts a row; share link works.
- [ ] `/intelligence` reads `intelligence_items` (seed a few rows manually to validate).
- [ ] Topbar bell reads `notifications`, marks read.
- [ ] Real-time subscription on `notifications` INSERT for the signed-in user.

**Demo:** generate a report, reload, open the share link in a second browser — same content.

---

## Phase 6 — Polish + hardening (½ – 1 day)

- [ ] Every list page has a meaningful empty state with a CTA.
- [ ] Every form uses `react-hook-form` + `sonner` toast.
- [ ] Global loading skeletons on list pages.
- [ ] `/not-found` wired as the catch-all instead of redirecting.
- [ ] Supabase URL / key validation errors show a readable message on boot instead of a blank page.
- [ ] Sentry or `console.error` wrap inside `onError` for mutations.
- [ ] README covers `npm run dev`, `.env.example`, and "How to promote an admin" pointing to `supabase/promote-admin.sql`.
- [ ] Audit strings: no "AI" in user-facing UI; use "automation" / "assistant".

---

## Phase 7 (future, not in MVP)

- WhatsApp Business / Instagram Graph / Facebook Messenger webhooks → edge function → `messages` / `conversations` insert.
- Live bot execution — edge functions read `automation_agent_configs` and invoke OpenAI / Anthropic.
- Stripe / Chargily billing hooks → `billing` / `invoices`.
- Email outbound for notifications via `Resend` edge function.
- Server-side invite via `auth.admin.inviteUserByEmail`.
- Cross-org admin console for your own SaaS team (separate `platform_admins` table).

---

## Risk register (for this track)

| Risk | Mitigation |
|---|---|
| Broad RLS today lets an owner overwrite admin-only tables until Phase 4 tightens it. | Hide fields in UI first; tighten SQL policies in Phase 4 before opening to external testers. |
| A signed-up user ends up with `org_id = null` if the client forgets the `bootstrap_my_org` RPC. | `AuthContext.hydrate()` always calls the RPC when `profiles.org_id` is null — idempotent by design. |
| Long mutation chains (convert lead → write multiple child rows) partially fail. | Use RPCs (`security definer`) for multi-table writes so they run in one transaction. |
| Storage paths drift from `<org_id>/…`. | Centralize uploads in `src/lib/db/storage.ts`; never inline the bucket path in a page. |
| Typescript drift between DB and domain types. | Run `supabase gen types typescript` after any schema change; commit the generated file. |
