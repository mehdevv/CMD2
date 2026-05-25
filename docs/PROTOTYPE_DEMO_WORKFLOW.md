# Scale — full prototype demo workflow

Use this script to walk stakeholders through the app and prove the core CRM + automation story works end to end.

**Estimated time:** 20–30 minutes (full flow) · **5 minutes** (highlights only)

---

## Before you start

### Run the app

```bash
cd "Scale software"
npm install
npm run dev
```

Open **http://localhost:5173/login**

### Sign in (tester accounts)

On the login page, click a **Tester accounts** card or use:

| Role | Email | Password | Lands on |
|------|-------|----------|----------|
| **Platform admin** | `admin@scale.test` | `ScaleDemo2026!` | `/admin/dashboard` |
| **Business owner** | `owner@scale.test` | `ScaleDemo2026!` | `/dashboard` |
| **Sales agent** | `karim@demo.scale` | `ScaleDemo2026!` | `/dashboard` |

**Demo mode:** If Supabase users are not seeded yet, the same credentials still work — the app falls back to **local demo mode** (data in the browser). Refresh keeps your session; data persists in `localStorage`.

**Production mode (optional):** Run `npm run seed:demo-users` once with a valid Supabase project to store data in the cloud.

### Recommended presenter flow

1. Start as **owner** for the full CRM journey (lead → close → intelligence).
2. Switch to **admin** for platform supervision only (users, automation config, activity log).
3. Optionally sign in as **agent** — see [`AGENT_WORKFLOW.md`](./AGENT_WORKFLOW.md) for the full lead → automation → close script.

**Role split:** Platform **admin** does not use Leads, Inbox, enrichment, or pipeline — that is **owner/agent** work. Admin supervises and edits platform settings.

Use **two browser profiles** (Chrome normal + incognito) if you want two roles visible at once.

---

## Story in one sentence

> A new lead enters the CRM, automation sends the first follow-up, the team enriches and converts the deal, walks it through every pipeline stage to **Won**, and the platform logs every automation touch along the way.

---

## End-to-end workflow (main demo)

Sign in as **`owner@scale.test`**.

### Phase 1 — Lead enters the CRM

| Step | Where | Action | What to show |
|------|--------|--------|--------------|
| 1 | **Leads** (`/leads`) | Click **Add lead** | Form: name, phone, channel (e.g. WhatsApp) |
| 2 | Same | Save | New card appears in **New** column (kanban) or list row |
| 3 | Open the lead | Click the new contact | **Contact detail** opens |

**What works:** Lead is created and appears in kanban/list. In demo or Supabase mode, a **conversation thread** is created automatically.

---

### Phase 2 — Automation follow-up (AI assistant)

| Step | Where | Action | What to show |
|------|--------|--------|--------------|
| 4 | Contact detail | Conversation panel (left) | **First automation message** from “Lead Follow-Up” (welcome / outreach) |
| 5 | Same | Expand **Follow-up log** | Step 1 logged with status (delivered) |
| 6 | Same | Type a reply as agent → **Send** | Outbound message appears; thread updates |

**What works:** Simulated outbound sequence on lead create, follow-up log, manual agent reply, inbox sync.

**Say:** *“When a lead lands from WhatsApp or Instagram, the follow-up agent starts the sequence; reps can take over anytime.”*

---

### Phase 3 — Enrich & qualify

| Step | Where | Action | What to show |
|------|--------|--------|--------------|
| 7 | Contact detail (right column) | **Re-enrich with assistant** | Company, budget, pain points fill in after ~1s |
| 8 | Same | **Edit** enrichment or add tags / pain points | Fields save on the lead |
| 9 | Header | Change **stage** (e.g. New → Contacted → Qualified) | Stage badge updates; kanban reflects change |

**What works:** Assistant enrichment, manual edits, stage changes, activity logged (enrichment events).

---

### Phase 4 — Convert to opportunity

| Step | Where | Action | What to show |
|------|--------|--------|--------------|
| 10 | Contact header | **Convert to opportunity** | Dialog: deal name, value (DZD), expected close |
| 11 | Same | Confirm | Redirect to `/opportunities/:id` |
| 12 | **Leads** | Re-open original lead | Shows link to opportunity; stage **Qualified** |

**What works:** Lead → opportunity promotion, pipeline record, cross-links between lead and deal.

---

### Phase 5 — Pipeline stages (lead → closing)

From **Opportunity detail** (`/opportunities/:id`), use the **stage stepper** or sidebar links.

| Stage | Route | Actions to demo |
|-------|--------|-----------------|
| **Qualification** | `/opportunities/:id/qualification` | Fill BANT (budget, authority, need, timeline), competing solutions, risk flags → **Save** or **Save & move to Need analysis** |
| **Need analysis** | `/opportunities/:id/need-analysis` | Summary, goals, metrics, stakeholders, proposed solution → Save / advance |
| **Proposal** | `/opportunities/:id/proposal` | Add proposal version, line items, value → mark sent |
| **Negotiation** | `/opportunities/:id/negotiation` | Log an objection; record a partial payment |
| **Closing** | `/opportunities/:id/closing` | Record final payment; note contract (upload if Storage configured) |

**Also show:**

- **Opportunities list** (`/opportunities`) — filter/sort open deals  
- **Board** (`/opportunities/board`) — drag card to next stage (updates stage + timeline)

**What works:** Full stage forms persist; stage history; board drag; payments update payment status.

---

### Phase 6 — Won / Lost

| Step | Where | Action | What to show |
|------|--------|--------|--------------|
| 13 | Opportunity detail | **Mark Won** or **Mark Lost** | Dialog: win detail or loss reason |
| 14 | **Board** | Find the deal | Card in **Won** or **Lost** column |
| 15 | **Owner dashboard** (`/dashboard`) | Refresh view | Pipeline / KPI strip reflects closed deal |

**What works:** Outcome, stage terminal state, board column, dashboard counts.

---

### Phase 7 — Meetings & post-call follow-up

| Step | Where | Action | What to show |
|------|--------|--------|--------------|
| 16 | Contact or opportunity | **Meeting brief** shortcut | `/meetings/brief/:id` — context, talking points, deal stage |
| 17 | Brief page | **Record post-meeting note** | `/meetings/notes/:id` |
| 18 | Notes page | Type notes → **Generate summary** (or stop voice recorder) | Summary, objections, opportunities, next steps |
| 19 | Same | Success banner | “Follow-up scheduled by automation — next touch in 24h” |

**What works:** Brief from live CRM context; notes saved (Supabase or demo store); follow-up activity logged.

---

### Phase 8 — Inbox (unified conversations)

| Step | Where | Action | What to show |
|------|--------|--------|--------------|
| 20 | **Inbox** (`/inbox`) | Select a thread | Same messages as contact detail |
| 21 | Same | **Take over** / release automation | Pauses bot on that thread |
| 22 | Same | Compose reply | Message sends; last message updates |

**What works:** Cross-channel list, takeover toggle, compose.

---

### Phase 9 — Intelligence & analytics (owner)

Sign in as **`owner@scale.test`** if not already.

| Step | Where | What to show |
|------|--------|--------------|
| 23 | **Intelligence** (`/intelligence`) | Objections tab (from deal data or defaults), opportunity signals, at-risk leads |
| 24 | **Performance** (`/performance`) | Automation KPI cards, agent leaderboard from live counts |
| 25 | **Analytics** (`/analytics`) | Funnel / pipeline charts driven by your leads & opportunities |
| 26 | **Reports** (`/analytics/reports`) | Create or open a report; share link |
| 27 | **Billing** (`/billing`) | Current plan, usage bars, invoice history, payment method |

**What works:** Dashboards read from CRM data you created during the demo (not static-only pages). Billing shows workspace subscription details.

---

### Phase 10 — Admin: platform supervision (no client CRM)

Sign out → sign in as **`admin@scale.test`**.

Admin **cannot** open Leads, Inbox, Opportunities, or enrichment — those routes redirect to `/admin/dashboard`.

| Step | Where | What to show |
|------|--------|--------------|
| 27 | **Admin dashboard** (`/admin/dashboard`) | Platform overview KPIs |
| 28 | **Automation → Agents** (`/admin/agents`) | Four agents: Follow-Up, Chat, Tracking, Refund |
| 29 | **Follow-Up config** (`/admin/agents/followup`) | Sequence steps, triggers, LLM block (UI) |
| 30 | **Activity log** (`/admin/automation/activity`) | Audit trail of owner/agent actions from Phases 1–8 |
| 31 | **Triggers** (`/admin/automation/triggers`) | Event → agent matrix |
| 32 | **Users / Channels / Templates / Billing settings** | Platform configuration (plan catalog, payment provider) |

**What works:** Read-only supervision via activity log; admin edits automation and platform settings only.

**Say:** *“The business team runs CRM in their workspace; platform admin configures automation and audits what happened.”*

---

### Phase 11 — Agent role (scoped access)

See **[`AGENT_WORKFLOW.md`](./AGENT_WORKFLOW.md)** for the full step-by-step agent demo (add lead → automation → enrich → convert → Won).

Sign in as **`karim@demo.scale`**.

| Step | Where | What to show |
|------|--------|--------------|
| 33 | **Dashboard** | “My leads”, my opportunities, follow-ups |
| 34 | **Leads** | Only leads assigned to Karim (not the full owner view) |
| 35 | **Inbox** | Threads for assigned contacts |

**What works:** Role-based filtering; same CRM tools, narrower data scope.

---

## 5-minute highlight reel

If time is short, run only these steps:

1. **Login** as owner → **Add lead**  
2. Open contact → show **automation message** + **follow-up log**  
3. **Re-enrich** → **Convert to opportunity**  
4. **Qualification** → **Proposal** → **Mark Won**  
5. **Admin** → **Activity log** (prove events fired)

---

## Demo data flow (reference)

```text
Add lead
   │
   ├─► Conversation + automation Step 1
   ├─► Follow-up log entry
   │
   ▼
Enrich / stage updates
   │
   ▼
Convert to opportunity
   │
   ├─► Qualification → Need analysis → Proposal → Negotiation → Closing
   │
   ▼
Won / Lost
   │
   ▼
Meeting brief → Post-meeting notes → scheduled follow-up
   │
   ▼
Intelligence / Analytics / Performance (live counts)
   │
   ▼
Admin activity log (audit trail)
```

---

## Checklist — “does it work?”

Use this when validating before a client demo:

- [ ] Login with all three tester accounts  
- [ ] Admin cannot access `/leads`, `/inbox`, or `/opportunities` (redirects to admin dashboard)  
- [ ] Add lead (as owner) → appears on kanban  
- [ ] Automation message visible on new lead  
- [ ] Follow-up log shows at least one step  
- [ ] Re-enrich fills company / pain fields  
- [ ] Convert to opportunity opens pipeline  
- [ ] Save qualification and advance stage  
- [ ] Board drag moves opportunity  
- [ ] Mark Won updates board  
- [ ] Meeting notes generate summary  
- [ ] Inbox takeover + send message  
- [ ] Intelligence / Performance show non-empty data after actions  
- [ ] Admin activity log lists recent events  
- [ ] Agent login sees subset of leads only  

---

## Prototype vs production (be transparent)

| Area | Prototype today | Production later |
|------|-----------------|------------------|
| **Auth** | Demo fallback + optional Supabase | Full Supabase Auth, email confirm |
| **Channels** | WhatsApp / IG / FB as labels | Real webhook ingest |
| **Automation bots** | Simulated first message + logs | Edge functions + LLM live |
| **Payments** | Manual entries in Closing | Payment processor webhooks |
| **Some admin settings** | UI persistence partial | Full DB write on all settings |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| “Invalid email or password” | Use exact tester emails + `ScaleDemo2026!`; click a tester card on `/login` |
| Empty leads after login | Hard refresh; demo mode seeds sample data on first load |
| Activity log empty | Perform at least one action (add lead, enrich, convert) then revisit `/admin/automation/activity` |
| Supabase errors in console | Demo mode still works; or run `npm run seed:demo-users` when project is online |

---

## Related docs

- Routes: `context/ROUTES.md`  
- Features by role: `context/FEATURES.md`  
- Lead → closing (technical): `context/backend connectivity/03-lead-closing-cycle.md`  
- Supabase setup: `supabase/README.md`
