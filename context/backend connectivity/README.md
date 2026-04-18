# Backend connectivity — MVP

This folder is the execution plan for wiring the Scale frontend to the Supabase backend you just created with `supabase/schema.sql`. It picks up where `context/plans/07-supabase-backend.md` left off.

**Scope of this plan:** everything needed to run the CRM on real data — no mock arrays.
**Out of scope for this round:** social-channel ingest (WhatsApp / Instagram / Facebook webhooks), Stripe billing hooks, running the four automation bots live. Those plug in later without schema changes.

---

## Read in this order

| # | File | Why |
|---|---|---|
| 01 | [`01-auth.md`](./01-auth.md) | Sign up, sign in, logout, password reset, session persistence, role-based routing. |
| 02 | [`02-data-access-layer.md`](./02-data-access-layer.md) | `src/lib/supabase.ts`, per-entity `src/lib/db/*.ts`, React Query hooks, error + toast patterns. |
| 03 | [`03-lead-closing-cycle.md`](./03-lead-closing-cycle.md) | End-to-end flow: Create lead → enrich → convert to opportunity → Qualification → Need Analysis → Proposal → Negotiation → Closing → Won / Lost. Each action mapped to its SQL writes. |
| 04 | [`04-features-by-role.md`](./04-features-by-role.md) | Every feature per role (admin / owner / agent) with the tables it reads and writes. |
| 05 | [`05-connectivity-map.md`](./05-connectivity-map.md) | One-screen cheat sheet: page → React Query hook → Supabase table. |
| 06 | [`06-rollout-plan.md`](./06-rollout-plan.md) | Phased build order so each merge stays shippable. |
| 07 | [`07-business-agents.md`](./07-business-agents.md) | Business-managed agents on the `agent@business.scale` namespace — schema, Edge Function, dashboard pages. |

Helper SQL outside this folder:

- [`supabase/schema.sql`](../../supabase/schema.sql) — the full database (already applied).
- [`supabase/promote-admin.sql`](../../supabase/promote-admin.sql) — paste an email, run once, that user becomes admin.

---

## What "done" looks like

An empty Supabase project, started from `schema.sql`, is wired up to the UI so that:

1. A new visitor can **sign up** (email + password). A profile + organization is auto-created and the signup user is the org admin.
2. They can **sign in**, get a persistent session, and land on the right role dashboard.
3. They can **reset their password** via a magic link in email.
4. They can **manually create a Lead**, fill enrichment fields, record tags / pain points — all persisted.
5. They can **Convert to Opportunity**, walk the opportunity through every stage, upload a signed contract, record payments, mark **Won** or **Lost**.
6. They can write meeting **briefs** and post-meeting **notes** (text or voice). Voice goes to a private Storage bucket.
7. They can edit **agent configurations** for Follow-Up / Chat / Tracking / Refund — bots don't fire yet, but all settings save.
8. They can review the **triggers matrix**, **human intervention** settings, and a paginated **activity log**.
9. Report generation writes into `analytics_reports`; the share link works across browsers.
10. Nothing in `src/lib/mock-data.ts` is used by any page.

Sign-out, sign back in, hard refresh, open in a second browser — same data, scoped by org, RLS-enforced.

---

## Tech decisions (one place)

- **Client:** [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript).
- **Data fetching:** [TanStack Query](https://tanstack.com/query) (install: `@tanstack/react-query`). Keeps list pages fast and auto-invalidates on mutation.
- **Forms:** continue using `react-hook-form` (already installed).
- **Toasts:** `sonner` (already installed) for success / error feedback on mutations.
- **Routing:** `wouter` (unchanged).
- **Auth state:** single `AuthContext` provider, driven by `supabase.auth.onAuthStateChange`.
- **File uploads:** Supabase Storage buckets (`proposals`, `contracts`, `voice-notes`) — upload path always starts with `<org_id>/…`.

No Redux, no Zustand, no SWR, no custom fetch client. One library for data, one for auth, nothing else.
