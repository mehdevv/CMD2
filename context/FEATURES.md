# Features by role

High-level feature matrix so you can quickly see who has access to what.

## Feature × Role matrix

| Area | Feature | Admin | Owner | Agent |
|------|---------|:-----:|:-----:|:-----:|
| **Auth** | Sign in / out | ✅ | ✅ | ✅ |
| **Onboarding** | Channel connect, invite team, pick plan | ✅ | (not routed) | (not routed) |
| **Dashboard** | KPIs + activity feed + channel health + pending templates + alerts | ✅ (admin) | — | — |
| **Dashboard** | KPIs + pipeline strip + intelligence cards + team pipeline + meeting summaries | — | ✅ | — |
| **Dashboard** | My leads + my opportunities + follow-ups + drafts to approve | — | — | ✅ |
| **Leads** | Kanban + list + filters + enrichment + add lead | ✅ | ✅ | ✅ |
| **Leads** | Open contact detail + enrichment + conversation + deal card + meeting shortcuts + convert to opportunity | ✅ | ✅ | ✅ |
| **Opportunities** | List + board + detail + stage tabs + Won/Lost (mock CRM state) | ✅ | ✅ | ✅ |
| **Inbox** | Triaged conversation list + take-over / release + compose | ✅ | ✅ | ✅ |
| **Meetings** | Pre-meeting brief | ✅ | ✅ | ✅ |
| **Meetings** | Post-meeting notes (voice + text) with assistant summary | ✅ | ✅ | ✅ |
| **Intelligence** | Objections / Opportunities / Risk tabs | ✅ | ✅ | — |
| **Performance** | Agent metrics + leaderboard + weekly digest | ✅ | ✅ | — |
| **Analytics** | KPIs + charts + URL filters + ask-question entry | ✅ | ✅ | — |
| **Reports** | List + detail + print export + share link | ✅ | ✅ | — |
| **Automation (admin)** | Overview of 4 agents | ✅ | — | — |
| **Automation (admin)** | Lead Follow-Up config (LLM + prompts + sequence + triggers + escalations) | ✅ | — | — |
| **Automation (admin)** | Client Chat config (LLM + FAQ + rules + triggers + escalations) | ✅ | — | — |
| **Automation (admin)** | Order Tracking config (carrier API + status map + satisfaction + alerts) | ✅ | — | — |
| **Automation (admin)** | Refund config (policy + rules + flow + decision log) | ✅ | — | — |
| **Automation (admin)** | Triggers matrix | ✅ | — | — |
| **Automation (admin)** | Human intervention global defaults | ✅ | — | — |
| **Automation (admin)** | Activity log | ✅ | — | — |
| **Automation (owner)** | Your automation overview | — | ✅ | — |
| **Automation (owner)** | Per-agent: personality, sequences, FAQ, customer-facing copy | — | ✅ | — |
| **Settings** | Users (invite / deactivate) | ✅ | — | — |
| **Settings** | Channels (connect / disconnect / webhook / API token) | ✅ | — | — |
| **Settings** | Templates (CRUD + approval status) | ✅ | — | — |
| **Settings** | Rules (refund policy + IF/THEN + test) | ✅ | — | — |
| **Settings** | Billing (plan + invoices + payment method) | ✅ | — | — |

## Feature groups (functional)

### Core CRM
- Lead pipeline (stages: new / contacted / qualified / proposal / closed)
- Lead enrichment (assistant) with re-enrich and conversion to **Opportunity**
- **Opportunity pipeline** (stages: qualification → need analysis → proposal → negotiation → closing → won/lost) with weighted value and activity timeline (client-side only)
- Contact detail with inline conversation, take-over, notes
- Unified inbox across WhatsApp / Instagram / Facebook
- Pre-meeting brief generation (assistant)
- Post-meeting notes with assistant summary (voice or typed)

### Intelligence & reporting
- Objection tracking with frequency + best-response mining
- Opportunity signals with stage conversion funnel
- Risk accounts (days-silent + deal value)
- Sales agent leaderboard
- Automation agent metrics (per-agent 3 KPIs)
- Weekly digest email configuration
- **Analytics** dashboard (funnel, pipeline, trends, breakdowns) and **Reports** (planner + saved mock reports)

### Automation (the 4 agents)
All four detailed in [`AGENTS.md`](./AGENTS.md). Summary:
1. **Lead Follow-Up** — outbound sequences on new leads, stops on reply
2. **Client Chat** — inbound FAQ + LLM fallback, 24/7
3. **Order Tracking** — proactive carrier status messaging + satisfaction check
4. **Refund** — policy evaluation, auto-approve or escalate

Cross-cutting automation features:
- Triggers matrix (event → agent)
- Human intervention (global escalation, notifications, takeover)
- Activity log (all automation events)
- Take-over from inbox / contact detail (pauses automation on that thread)

### Platform / admin
- User management with 3 roles
- Multi-channel connections (WA / IG / FB; Telegram + TikTok roadmapped)
- Message template library with approval workflow (WhatsApp template policy)
- Rule engine (refund policy + IF/THEN rules)
- Billing + plan selection
- Webhook + API token exposure for integrations

### Design system & copy
- Inter font, flat/minimal palette (see `DESIGN_SYSTEM.md`)
- No "AI" in user-facing strings (use "automation" or agent name)
- Reusable blocks: `AgentConfigShell`, `AgentStatusPanel`, `LLMConfigSection`, `RadioCards`, `TagInput`, `InlineDuration`, `TimeRange`, `ScaleSlider`, `InfoBlock`, `PasswordInput`, `StatCard`, `ChannelDot`, `ScaleBadge`

## Gaps / known TODOs spotted in the codebase

- `/onboarding` is not role-guarded — any signed-in user can see it.
- `src/pages/not-found.tsx` exists but isn't routed (router redirects instead).
- Agents configured through the "classic workspace" (`/admin/agents/workspace`) and the per-agent pages share no state yet.
- "Forgot password" on Login is a placeholder (`href="#"`).
- Copy may still say "AI" in a few legacy admin strings (e.g. some test-result labels). Prefer "automation" or "assistant" in new UI (see `DESIGN_SYSTEM.md`).
- Templates "Submit for review" button in modal doesn't wire up yet.
- Channels "Disconnect" and template Edit / Duplicate / Delete are UI-only.
- No Telegram / TikTok DMs connectors (explicitly marked "Coming soon").
- No API / backend yet — everything runs off mocks in `src/lib/mock-data.ts` and `localStorage` for auth.
