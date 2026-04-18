# 04 — Features by role + data touched

Exhaustive per-role view: every feature, every column/table it reads or writes, and every Storage bucket it touches. Use this to reason about permissions, QA coverage, and what can break if you rename a column.

Legend: **R** = reads · **W** = writes (insert / update / delete) · **F** = file in Storage.
Every authenticated request is automatically scoped by `org_id` via RLS — the column is omitted from the table below for brevity.

---

## 4.1 Admin — platform / business administrator

Admin is the top-level user of a business. They manage the whole org: users, channels, templates, billing, and all the automation.

### Admin features

| Area | Feature / Page | R | W | F | Notes |
|---|---|---|---|---|---|
| Auth | Sign in / up / reset | `profiles` | `profiles`, `organizations`, `billing`, `refund_policy`, `intervention_settings`, `automation_agent_configs`, `automation_triggers` (all via RPC) | — | `bootstrap_my_org()` runs once on first login. |
| Dashboard | `/admin/dashboard` | `leads`, `opportunities`, `automation_activity_log`, `channels`, `templates` (pending), `automation_triggers` | — | — | KPI cards, activity feed, channel health. |
| Dashboard | Approve template | — | `templates.status` | — | |
| Dashboard | System alerts | `notifications` | `notifications.read` | — | Admin sees all org notifications. |
| Leads | List / kanban | `leads`, `profiles` | — | — | |
| Leads | Add / edit | — | `leads`, `lead_tags`, `lead_pain_points` | — | |
| Leads | Contact detail | `leads`, `lead_tags`, `lead_pain_points`, `conversations`, `messages`, `meeting_briefs`, `meeting_notes` | `leads`, `lead_tags`, `lead_pain_points`, `conversations.automation_paused` | — | |
| Leads | Convert to opportunity | `leads` | `opportunities`, `leads.converted_opportunity_id`, `opportunity_stage_transitions` | — | Via `convert_lead_to_opportunity` RPC. |
| Opportunities | List / board / detail | `opportunities` + children | `opportunities` + children | `contracts` | Full pipeline access. |
| Meetings | Brief + notes | `meeting_briefs`, `meeting_notes` | same | `voice-notes` | |
| Inbox | Conversations / take over | `conversations`, `messages` | `conversations.assigned_to`, `automation_paused`, `messages` | — | |
| Intelligence | Objections / opportunities / risks | `intelligence_items`, `opportunities`, `leads`, `opportunity_objections` | — | — | |
| Performance | Leaderboard + digest | `profiles`, `opportunities`, `opportunity_stage_transitions` | — | — | |
| Analytics | KPIs / funnel / trends | `leads`, `opportunities`, `proposals`, `payments`, `opportunity_stage_transitions` | — | — | Selectors in `src/lib/analytics.ts`. |
| Reports | Generate + save + share | `analytics_reports` | `analytics_reports` | — | |
| Automation | Agents overview | `automation_agent_configs` | `automation_agent_configs.enabled` | — | |
| Automation | Follow-Up config | `automation_agent_configs`, `followup_steps`, `agent_forbidden_topics`, `templates` | same | — | LLM keys live here, admin-only. |
| Automation | Chat config | `automation_agent_configs`, `faq_entries` | same | — | |
| Automation | Tracking config | `automation_agent_configs`, `carrier_integrations`, `status_messages` | same | — | Carrier API key stays admin. |
| Automation | Refund config | `automation_agent_configs`, `policy_rules`, `refund_decisions` | same | — | |
| Automation | Triggers matrix | `automation_triggers` | `automation_triggers` | — | |
| Automation | Human intervention | `intervention_settings` | `intervention_settings` | — | |
| Automation | Activity log | `automation_activity_log` | — | — | |
| Settings | Users | `profiles` | `profiles.role`, `profiles.status` | — | Invite / deactivate. |
| Settings | Channels | `channels` | `channels` | — | Connect / disconnect. |
| Settings | Templates | `templates` | `templates` | — | |
| Settings | Rules | `rules`, `refund_policy` | same | — | |
| Settings | Billing | `billing`, `invoices` | `billing.*`, `invoices.*` | — | |
| Notifications | List / read | `notifications` | `notifications.read` | — | |

### Admin-only writes that nobody else has

- `automation_agent_configs.provider / api_key / model / temperature / max_tokens / max_response_sec`
- `carrier_integrations.*`
- `templates.status` (approved / rejected)
- `refund_policy.*`
- `billing.*`
- `channels.*`
- `intervention_settings.*` (global defaults)
- Any write to `profiles.role`

---

## 4.2 Owner — business owner / commercial director

Owner shapes **what customers hear** and watches the pipeline. They don't touch LLM keys, carrier APIs, or billing.

### Owner features

| Area | Feature / Page | R | W | F | Notes |
|---|---|---|---|---|---|
| Auth | Sign in / reset | `profiles` | — | — | Signup flow reserved for admin seat today; owners usually invited. |
| Dashboard | `/dashboard` (owner) | `leads`, `opportunities`, `intelligence_items`, `meeting_notes`, `profiles` | — | — | KPIs + pipeline-by-stage + intelligence cards + team table + meeting summaries. |
| Leads | List / detail / enrich / convert | same as admin | same as admin | — | Full lead CRUD. |
| Opportunities | List / board / detail (all stages) | same as admin | same as admin | `contracts` | |
| Inbox | Conversations | `conversations`, `messages` | `messages`, `conversations.automation_paused` | — | |
| Meetings | Brief + notes | `meeting_briefs`, `meeting_notes` | same | `voice-notes` | |
| Intelligence | Objections / opps / risks | `intelligence_items`, `opportunities`, `leads` | — | — | |
| Performance | Leaderboard + digest | `profiles`, `opportunities` | — | — | |
| Analytics | Full dashboard | `leads`, `opportunities`, `proposals`, `payments` | — | — | |
| Reports | Generate + share | `analytics_reports` | `analytics_reports` | — | |
| Automation (owner) | Overview | `automation_agent_configs` | `automation_agent_configs.enabled` | — | |
| Automation (owner) | Follow-Up prompts + sequence | `automation_agent_configs`, `followup_steps`, `agent_forbidden_topics` | `automation_agent_configs.agent_name/tone/language/system_prompt/business_context`, `followup_steps.*`, `agent_forbidden_topics.*` | — | Cannot touch LLM fields. |
| Automation (owner) | Chat prompts + FAQ | `automation_agent_configs`, `faq_entries` | copy fields + `faq_entries.*` | — | |
| Automation (owner) | Tracking customer messages | `automation_agent_configs`, `status_messages` | `status_messages.customer_message / enabled` | — | **Cannot** write to `carrier_integrations`. |
| Automation (owner) | Refund customer copy | `automation_agent_configs` | copy fields only | — | **Cannot** write `policy_rules` / refund policy numbers. |
| Notifications | List / read | `notifications` | `notifications.read` | — | |

### Owner must NOT be able to

- Update `profiles.role` on anyone.
- Write to `billing`, `invoices`, `channels`, `rules` (global), `refund_policy`, `intervention_settings`, `automation_triggers`, `templates.status`, `carrier_integrations`, `policy_rules`, or the LLM fields on `automation_agent_configs`.

> **Note:** RLS in `schema.sql` grants org-wide CRUD to any signed-in org member. Owner-vs-admin write restrictions are currently **enforced in the UI** (pages hide those fields for non-admins). Tightening at the SQL policy layer is a follow-up item — add `using (... and public.current_role() in ('admin',…))` clauses per table. See `06-rollout-plan.md` §Phase 4.

---

## 4.3 Agent — sales / customer-service agent

Agent works the leads and opportunities **assigned to them**. They can always see their own data, and (for MVP) read other teammates' pipelines read-only; the UI filters to their own rows by default.

### Agent features

| Area | Feature / Page | R | W | F | Notes |
|---|---|---|---|---|---|
| Auth | Sign in / reset | `profiles` | — | — | |
| Dashboard | `/dashboard` (agent) | `leads where assigned_to = me`, `opportunities where owner_id = me`, `automation_activity_log` | — | — | |
| Leads | List — **only mine** | `leads` filtered by `assigned_to` | `leads`, `lead_tags`, `lead_pain_points` | — | Client filter enforced; RLS still allows reading peers for now. |
| Leads | Detail | `leads`, `lead_tags`, `lead_pain_points`, `conversations`, `messages`, `meeting_briefs`, `meeting_notes` | `leads` (fields of their own lead), `lead_tags`, `lead_pain_points`, `conversations.automation_paused` (take over) | — | |
| Leads | Convert to opportunity | — | `opportunities (owner_id=me)`, `leads.converted_opportunity_id`, `opportunity_stage_transitions` | — | |
| Opportunities | List — **only mine** | `opportunities where owner_id = me` | all opp tables for rows they own | `contracts` | |
| Inbox | Threads assigned to me | `conversations`, `messages` | `messages`, `conversations.automation_paused` / `assigned_to` | — | |
| Meetings | Brief / notes for their leads | `meeting_briefs`, `meeting_notes` | same | `voice-notes` | |
| Notifications | Own list | `notifications where recipient_id = me` | `notifications.read` | — | |

Agents never see: Automation pages, Users, Channels, Templates, Rules, Billing, Analytics, Reports, Intelligence, Performance.

---

## 4.4 Quick role × write-access matrix

Columns indicate **write** access — reads follow the same org scope via RLS.

| Table | admin | owner | agent |
|---|---|---|---|
| `organizations` | ✅ | ✅* | — |
| `profiles` (self fields) | ✅ | ✅ | ✅ |
| `profiles` (`role`) | ✅ | — | — |
| `channels` | ✅ | — | — |
| `billing`, `invoices` | ✅ | — | — |
| `leads`, `lead_tags`, `lead_pain_points` | ✅ | ✅ | ✅ (own) |
| `conversations`, `messages` | ✅ | ✅ | ✅ (assigned) |
| `opportunities` + all children | ✅ | ✅ | ✅ (owned) |
| `meeting_briefs`, `meeting_notes` | ✅ | ✅ | ✅ (own) |
| `templates`, `rules` | ✅ | — | — |
| `refund_policy` | ✅ | — | — |
| `automation_agent_configs` (LLM + carrier) | ✅ | — | — |
| `automation_agent_configs` (copy / prompts) | ✅ | ✅ | — |
| `followup_steps`, `faq_entries`, `status_messages` (copy) | ✅ | ✅ | — |
| `carrier_integrations`, `policy_rules` | ✅ | — | — |
| `refund_decisions` | ✅ (log view) | ✅ (log view) | — |
| `automation_triggers`, `intervention_settings` | ✅ | — | — |
| `automation_activity_log` | read-only | read-only | — |
| `intelligence_items`, `analytics_reports` | ✅ | ✅ | — |
| `notifications` | ✅ (org) | ✅ (org) | ✅ (own) |

\* Org name and timezone only. Ownership transfer is an admin action.

---

## 4.5 Backend functions / RPCs you'll call

| Function | Who | Purpose |
|---|---|---|
| `public.bootstrap_my_org(org_name text)` | any signed-in user with no org | Creates org + seeds defaults. Called once from `AuthContext` after sign-up. |
| `public.convert_lead_to_opportunity(p_lead_id, p_name, p_value)` | admin / owner / agent (owns lead) | Atomic lead → opportunity + transition row. Added in `03-lead-closing-cycle.md` §3.2. |
| `public.current_org_id()` | internal (RLS) | Used by every policy. |
| `public.current_role()` | internal (RLS + future admin policies) | |

Client-side these are called via:

```ts
await supabase.rpc('bootstrap_my_org', { org_name: 'Acme' });
await supabase.rpc('convert_lead_to_opportunity', { p_lead_id, p_name, p_value });
```

---

## 4.6 Storage folder layout

```
proposals/<org_id>/<opportunity_id>/<proposal_id>.pdf
contracts/<org_id>/<opportunity_id>/<filename>.pdf
voice-notes/<org_id>/<meeting_note_id>.webm
```

Client code **must** prefix paths with `<org_id>` — the storage RLS policies check the first segment.
