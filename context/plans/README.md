# Build plans — Sales Pipeline & AI Reports

This folder is the execution plan for the next big chunk of Scale:

1. **Full lead enrichment** on the existing `Leads` / `Contact Detail` flow
2. **Opportunity pipeline** — a brand new section with the stages you described:
   **Qualification → Need Analysis / Won / Lost → Proposal → Negotiation → Closing**
3. **Analytics page with AI-generated reports** ("type what you want to know about your business, get a report")

Each plan doc is self-contained: it lists the pages to add, the routes, the data types, the UI, the acceptance criteria, and the touch points in the existing codebase.

---

## Read in this order

| # | File | Why |
|---|------|-----|
| 01 | [`01-lead-enrichment.md`](./01-lead-enrichment.md) | Expand the current lead record so there's something real to convert into an opportunity. |
| 02 | [`02-opportunity-pipeline.md`](./02-opportunity-pipeline.md) | Core of the request. New `Opportunities` section + stage-specific pages (Qualification, Need Analysis, Proposal, Negotiation, Closing, Won/Lost). |
| 03 | [`03-ai-reports.md`](./03-ai-reports.md) | New `Analytics` page with an AI-driven report generator. |
| 04 | [`04-data-model-and-integration.md`](./04-data-model-and-integration.md) | All `types.ts`, `mock-data.ts`, `Sidebar.tsx`, `App.tsx` changes consolidated in one place (so a dev can merge cleanly). |
| 05 | [`05-milestones.md`](./05-milestones.md) | Phase-by-phase sequencing with acceptance criteria, so you can ship it in 4-5 passes instead of one big bang. |
| 06 | [`06-ui-polish.md`](./06-ui-polish.md) | UI polish pass: thin scrollbars, stable/trimmed sidebar, unified search field, 1-line card copy, per-bot color identity. |
| 07 | [`07-supabase-backend.md`](./07-supabase-backend.md) | Wire Supabase: schema, `.env`, RLS, drop all mock data, real auth, real CRM persistence. |
| 08 | [`08-profile-and-settings.md`](./08-profile-and-settings.md) | Per-user profile page (name, avatar, password, notifications, sessions) and workspace settings (org name, business address, branding, billing, danger zone). |

---

## Vision in 60 seconds

Today Scale handles the **top of the funnel**: leads come in, get enriched a little, AI follows up, human takes over when needed. After that, everything stops — there's no structured place to track what happens *after* a lead replies.

We're adding the **middle and bottom of the funnel**:

```
LEAD                           OPPORTUNITY                                CLOSED
────                           ───────────                                ──────
New → Contacted → Qualified ─► Qualification ─► Need Analysis ─► Proposal ─► Negotiation ─► Closing ─► Won
                               (meeting)        │                                                    ╲
                                                └─► Lost                                              └─► Lost
```

- A **Lead** is a person we're trying to reach.
- An **Opportunity** is a qualified conversation with a deal value, assigned stage, and explicit next action.
- **Conversion moment:** when a lead is marked `Qualified`, we prompt to "Convert to Opportunity". That creates the Opportunity record and hands off to the pipeline pages.
- **Analytics** sits on top of everything (leads + opportunities + conversations + meetings) and lets the user ask for a report in natural language.

---

## Non-goals for this round

- No real backend work — keep using `src/lib/mock-data.ts`. Add new mock datasets; don't wire APIs yet.
- No payment processor integration. "Payment pending / Payment done" is manual status for now (Stripe/CMI/Chargily come in a later phase).
- No new automation **agent** — analysis uses the existing LLM-config plumbing; pipeline pages have small AI helpers (draft proposal, summarize qualification call, suggest next step) but aren't a full 5th agent.
- No e-signature / contract generation. Proposal stage has a **file upload / link** field only.

---

## How this plan is structured

Each doc follows the **task template** from `context/ROADMAP.md`:

- **Where it lives** — exact `src/pages/*` paths
- **Role(s)** — admin / owner / agent
- **User story**
- **Acceptance criteria** — unambiguous checklist
- **Touches** — routes, sidebar, types, mock data, design-system needs
- **Notes on copy** — we still never say "AI" in user-facing strings (per `DESIGN_SYSTEM.md`); use "automation" or "assistant"

Design-system guardrails that apply everywhere:

- Tailwind v4 + `.scale-card` / `.scale-input` / `.scale-btn-*` classes only — no ad-hoc shadows, gradients, or new border radii.
- Max font-weight 600, max radius 8px, Inter font, palette from `src/index.css`.
- Use existing primitives in `src/components/ui/` (`StatCard`, `ChannelDot`, `ScaleBadge`, `EmptyState`, `RadioCards`, etc.) before building new ones.
- Every new page is wrapped in `<AppShell title="…">`.
- Role-guard every new route in `src/App.tsx` via `ProtectedRoute`.
