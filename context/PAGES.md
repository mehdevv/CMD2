# Pages & Features

Every page currently in the Scale platform, what it does, and the features inside it.
Pages are grouped by the sidebar section they appear under.

Legend:
- `[admin]` visible to admin role
- `[owner]` visible to business-owner role
- `[agent]` visible to sales agent role
- `[shared]` visible to multiple roles (details inline)

---

## Auth & onboarding (public / pre-app)

### Login — `src/pages/Login.tsx` → `/login`
Roles: **public**
- Email + password login (mock users, see `src/lib/auth.ts`)
- Show/hide password toggle
- Demo-credentials hint banner: `admin@scale.dz / demo` · `owner@scale.dz / demo` · `agent@scale.dz / demo`
- "Forgot password" link (no-op today)
- Redirects to role-appropriate dashboard on success

### Onboarding — `src/pages/Onboarding.tsx` → `/onboarding`
Roles: first-time admins (any authenticated user today)
- 4-step wizard with progress indicator
- **Step 1 – Connect a channel:** WhatsApp Business API, Instagram DMs, Facebook Messenger (WhatsApp flagged recommended)
- **Step 2 – Invite team:** email + role (admin / owner / agent); list of pending invites; skip allowed
- **Step 3 – Choose a plan:** Freelancer $20, E-commerce $30 (highlighted), Edu Centers $50 — each with user cap, monthly messages, features
- **Step 4 – "You're ready":** summary card showing all 4 automation agents activated
- CTA to `/admin/dashboard`

---

## Workspace section (sidebar: "Workspace")

### Admin Dashboard — `src/pages/AdminDashboard.tsx` → `/admin/dashboard`
Roles: **[admin]**
- **Top KPI row:** Total leads · Open deals · Closed this month · Automation messages sent (30d) with week-over-week deltas
- **Automation activity feed:** timestamped events per channel/agent (from `MOCK_ACTIVITY_FEED`)
- **Channel health:** WhatsApp / Instagram / Facebook connection status + today's message volume; deep links to `/admin/channels`
- **Pending template approvals:** table with approve / reject actions (from `MOCK_PENDING_TEMPLATES`)
- **System alerts:** warning + info messages (rejected templates, aging escalations, plan-limit warnings) plus link to a sample digest in **Reports**

### Owner Dashboard — `src/pages/OwnerDashboard.tsx` → `/dashboard` (when `role=owner`)
Roles: **[owner]**
- **Top KPI row:** Response rate · Deals closed · Open weighted pipeline (DZD) · Win rate (closed outcomes) — pipeline metrics from live mock CRM state (`CrmDataContext`)
- **Open pipeline by stage:** compact counts and value per opportunity stage with link to **Analytics**
- **Intelligence cards (3):** top objection, opportunity, risk — links to `/intelligence` and `/analytics`
- **Team pipeline table:** agent filter dropdown + lead rows with stage, last contact, **Automation status**, links to `/leads/:id` (data from CRM context)
- **Recent meeting summaries:** inline previews with "View" → `/meetings/notes/:id`

### Agent Dashboard — `src/pages/AgentDashboard.tsx` → `/dashboard` (when `role=agent`)
Roles: **[agent]**
- Personalized greeting by first name; subtitle uses **count of active leads** assigned to the signed-in agent (from CRM context)
- **Stats:** My active leads (computed) · Follow-ups today · Messages to approve
- **Needs attention:** escalated leads assigned to this agent
- **Messages to approve:** drafts waiting on human review (card)
- **My opportunities:** up to five open opportunities owned by this agent (`ownerId`) with stage badge and link to `/opportunities/:id`
- **Today's automated follow-ups:** table with contact / preview / channel / scheduled time / status (Scheduled | Sent)

### Leads — `src/pages/Leads.tsx` → `/leads`
Roles: **[shared: admin + owner + agent]**
- **Toolbar:** search, stage filter, channel filter, **enrichment** filter, view toggle (Kanban / List), **Add lead** button
- **Kanban view:** columns per stage (New / Contacted / Qualified / Proposal / Closed), card shows name, channel dot, automation status, last contact
- **List view:** table with name, phone, stage, lead score, enrichment incomplete chip, automation status, assigned agent, last contact; link to related opportunity when `convertedOpportunityId` is set
- Row/card click → `/leads/:id`
- Empty-column state

### Contact Detail — `src/pages/ContactDetail.tsx` → `/leads/:id`
Roles: **[shared: admin + owner + agent]**
- Breadcrumb: Leads / {name}
- Header: name, channel dot, phone, source tag; actions: **Generate brief** → `/meetings/brief/:id`, **Take over / Release to automation**, Stage selector; **Convert to opportunity** when qualified
- **3-column layout:**
  - **Conversation thread (55%)**: messages (automation / agent / contact styled differently); **Follow-up log** collapsible (per step preview + delivery status); compose textarea (disabled until user takes over)
  - **Aside**: **Enrichment card** (assistant fields, re-enrich), deal card (stage, value DZD, close date, notes), meeting card (pre-brief + post-note buttons), history card (automation messages, stage changes, lead creation); link to opportunity when converted

### Inbox — `src/pages/Inbox.tsx` → `/inbox`
Roles: **[shared: admin + owner + agent]**
- **Left panel (320px):** search, tabs (All / Automation active / Human Active / Pending), conversation list (avatar initials + last message + time + channel dot + automation status)
- **Right panel:** thread header (name, channel, automation status), View contact link, **Take over / Release** button, messages bubble stream, compose input (disabled until taken over)
- Empty state when no conversation selected

---

## Pipeline section (sidebar: "Pipeline")

### Opportunities (list) — `src/pages/opportunities/Opportunities.tsx` → `/opportunities`
Roles: **[shared: admin + owner + agent]**
- Toolbar search; KPI strip (open weighted pipeline, counts); dense table with stage, owner, value, links to `/opportunities/:id`

### Opportunities (board) — `src/pages/opportunities/OpportunitiesBoard.tsx` → `/opportunities/board`
Roles: **[shared: admin + owner + agent]**
- Kanban by `OpportunityStage`; column sums in DZD; drag-to-move opens confirmation and respects `canAdvance` from `src/lib/pipeline.ts`

### Opportunity detail & stages — `/opportunities/:id` and `/opportunities/:id/...`
Roles: **[shared: admin + owner + agent]** (agents see only opportunities they own in production; mock uses shared dataset)
- Detail hub: header, stepper, timeline, Won/Lost actions
- Stage sub-pages: Qualification, Need analysis, Proposal, Negotiation, Closing — forms and tables per plan `02-opportunity-pipeline.md`

---

## Insights section (sidebar: "Insights")

### Intelligence — `src/pages/Intelligence.tsx` → `/intelligence`
Roles: **[shared: admin + owner]**
- Tabs: **Objections · Opportunities · Risk**
- Filters: date range (week / month / last 30 days), agent filter
- **Objections tab:** horizontal bar chart "top objections by frequency" (recharts); **best responses that worked** (quoted), **script improvements** (ordered recommendations)
- **Opportunities tab:** table of contacts with detected signals + "Reach out" CTA; **stage conversion rates** table (New→Contacted %, etc.)
- **Risk tab:** **at-risk accounts** table (days silent, deal value, assigned agent, Review CTA); **weak follow-up patterns** list

### Performance — `src/pages/Performance.tsx` → `/performance`
Roles: **[shared: admin + owner]**
- **Automation performance:** 4 cards (one per agent) with three metrics each (from `MOCK_AI_AGENT_METRICS`)
- **Sales agent leaderboard:** table of agents ranked by leads / response rate / closed / conversion
- **Weekly digest settings:** send day, include toggles (KPI summary / Intelligence highlights / Agent stats), recipient email

### Analytics — `src/pages/analytics/Analytics.tsx` → `/analytics`
Roles: **[shared: admin + owner]**
- URL-synced filters via `parseAnalyticsFilters` / `stringifyAnalyticsFilters` (`src/lib/analytics.ts`)
- KPI strip, funnel, pipeline-by-stage charts, trends, breakdown tabs, **Ask a question** card (routes toward report generation)

### Reports — `src/pages/analytics/AnalyticsReports.tsx` → `/analytics/reports`
Roles: **[shared: admin + owner]**
- List of saved / mock reports with status; link to detail

### Report detail — `src/pages/analytics/AnalyticsReportDetail.tsx` → `/analytics/reports/:id`
Roles: **[shared: admin + owner]**
- Renders sections via `ReportSectionRenderer`; **Export PDF** uses print layout (sidebar/topbar hidden); **Copy link** copies URL to clipboard

---

## Meetings (sub-pages, shared)

### Meeting Brief — `src/pages/MeetingBrief.tsx` → `/meetings/brief/:id`
Roles: **[shared]**
- Breadcrumb to lead or opportunity when `:id` matches an opportunity first, otherwise a lead
- "Assistant generated" tag
- Sections: **History & context · Open deals · Risk flags · Suggested talking points**
- Actions: **Record post-meeting note**, **Open full contact**

### Meeting Notes — `src/pages/MeetingNotes.tsx` → `/meetings/notes/:id`
Roles: **[shared]**
- Breadcrumb to lead or opportunity (same resolution order as brief)
- Recorder: tap-to-record button with live timer, fallback "Or type your notes" textarea
- After submit: **Meeting summary · Objections captured · Opportunities · Next steps** (assistant-generated)
- Green confirmation: "Follow-up scheduled by automation — next touch in 24 hours"

---

## Automation section (admin-facing)

### Automation Agents overview — `src/pages/admin/AdminAgentsOverview.tsx` → `/admin/agents`
Roles: **[admin]**
- Header with links to Triggers · Human intervention · Activity log · Classic workspace · Intervention alerts
- 2-column grid of 4 agent cards: icon, name, description, 3 stats (sequences active / reply rate / etc.), last-edited, per-agent enable toggle, **Configure** CTA → agent page

### Lead Follow-Up Agent (admin config) — `src/pages/admin/AdminAgentFollowUp.tsx` → `/admin/agents/followup`
Roles: **[admin]** · layout: 3-column `AgentConfigShell` (left: anchor nav, center: sections, right: `AgentStatusPanel`)
- **LLM configuration** (shared block): provider, API key + test, model, temperature, max tokens
- **Agent personality:** name, tone (radio cards: professional / friendly / direct / custom), language, system prompt (textarea + char counter), forbidden topics tag input, business context
- **Follow-up sequence:** drag-handled step timeline — per step: delay (value+unit), message mode (template / AI-generated / hybrid), template picker, instruction, channels, send window, stop conditions; global sequence settings (max steps, global send window, timezone, weekend toggle, restart-after-30d toggle)
- **Assignment rules:** strategy (round-robin / by channel / by territory / default pool), default pool, re-assign if sales paused
- **Triggers:** checkbox list (new lead any / per channel / stage change / manual / tag added); conditional sub-fields; "do not trigger if" conditions
- **Human intervention:** escalation triggers, complaint keywords, high-value threshold, notify-via (in-app / email / WA), notification template, pause-after-escalation toggle
- **Tracked metrics** (display cards): sequence completion rate, reply rate per step, avg time to first response
- Sticky save bar + **Test Follow-Up Agent** modal

### Client Chat Agent (admin config) — `src/pages/admin/AdminAgentChat.tsx` → `/admin/agents/chat`
Roles: **[admin]**
- **LLM configuration** + extras: max response time, holding message
- **Personality & mood:** tone radio cards, emoji level, mirror-customer-energy toggle, opening message, system prompt
- **Knowledge base (FAQ):** Q/A list with add / remove / categories, "Fallback to LLM" toggle
- **Response rules:** max consecutive automation messages, after-hours behavior (24/7 / outside-hours message / disabled with schedule)
- **Triggers:** new inbound message / unassigned threads only / channel filters
- **Human intervention:** confidence slider, keyword escalation, sentiment, attachment-received, refund mention, order-number mention, idle timeout
- **Tracked metrics:** questions answered vs escalated, escalation rate, avg resolution time
- **Test Chat Agent** modal: simulated chat with per-reply confidence display

### Order Tracking Agent (admin config) — `src/pages/admin/AdminAgentTracking.tsx` → `/admin/agents/tracking`
Roles: **[admin]**
- **LLM configuration**
- **Delivery carrier API:** base URL, API key (password + test), auth type, polling / webhook, order_id mapping, test-connection, fetch-sample-shipment
- **Status → message mapping** (table): internal code (confirmed / shipped / out_for_delivery / delivered / failed / returned), editable customer message, enabled toggle, escalation flag per row
- **Satisfaction & handoff:** satisfaction-check toggle, keywords/sentiment for unsatisfied → triggers Refund agent + owner notification; static flow diagram
- **Triggers:** on order status change event
- **Human & owner alerts:** on failed delivery, unsatisfied customer, API errors — templates + recipients
- **Test Order Tracking** modal: pick order + status, preview customer message

### Refund Agent (admin config) — `src/pages/admin/AdminAgentRefund.tsx` → `/admin/agents/refund`
Roles: **[admin]**
- **LLM configuration** (recommend stronger model + lower temperature)
- **Personality:** empathetic / professional / minimal tone
- **Refund policy:** window (days), auto-approve max amount (DZD), proof-of-purchase required, partial-refund allowed
- **Policy rules (IF/THEN):** condition (order value / days since / refund count 90d) + comparator + value + action (auto-approve / escalate / reject) with live plain-English summary
- **Conversation flow outline:** acknowledge → collect reason → verify → policy check → decision → confirmation/hold; escalation hold message template with `{{owner_response_sla}}`
- **Owner notifications:** toggle every-request vs escalations-only, recipients, channels, template, SLA
- **Decision log** (table): time, contact, decision, amount, reason
- **Test Refund** modal: order value + days + limits → decision

### Admin Agents workspace (classic) — `src/pages/AdminAgents.tsx` → `/admin/agents/workspace`
Roles: **[admin]**
- Older all-in-one tabbed view of the 4 agents (Follow-Up / Chat / Refund / Tracking) + per-agent enable sidebar
- Tab: **Follow-up** — simple step list with delay + message
- Tab: **Chat** — FAQ Q/A table + tone dropdown
- Tab: **Refund** — policy form + IF/THEN rules + test scenario
- Tab: **Order Tracking** — status-message mapping
- Kept as a secondary path while the per-agent pages are canonical

### Admin Notifications — `src/pages/admin/AdminNotifications.tsx` → `/admin/notifications`
Roles: **[admin]**
- Empty-state placeholder for human-intervention alerts ("connect channels and enable agents to start monitoring")

### Triggers & automations — `src/pages/admin/AdminAutomationTriggers.tsx` → `/admin/automation/triggers`
Roles: **[admin]**
- Explanation banner + message-variable info block
- Table: **trigger event | agent | what happens | configure (link to agent page)**
- Per-row enable checkbox
- Rows: new lead, lead reply, inbound customer DM, order status change, refund intent, low confidence / negative sentiment, sales taps "Take over", **lead enrichment completes**, **opportunity stage change**, **analytics report generated**

### Human intervention (global) — `src/pages/admin/AdminAutomationIntervention.tsx` → `/admin/automation/intervention`
Roles: **[admin]**
- **Global escalation:** reasons multi-select, default confidence threshold slider, instant-escalation keywords tag input
- **Notifications:** default channels (in-app / email / WA), default recipient pool, urgent in-app template, pause-after-escalation toggle
- **Take over:** explainer, allow-resume after resolve toggle, cooldown hours
- Save + link to activity log

### Activity log — `src/pages/admin/AdminAutomationActivity.tsx` → `/admin/automation/activity`
Roles: **[admin]**
- Search by contact / summary
- Filter by agent + filter by type (Sequence / Escalation / Refund / Tracking / Chat / Enrichment / Opportunity / Report)
- Table: time, type (colored badge), agent, contact, summary
- Empty state when no matches

---

## Automation section (owner-facing)

### Owner Automation overview — `src/pages/owner/automation/OwnerAutomationOverview.tsx` → `/automation`
Roles: **[owner]**
- Explainer: "model, API keys, and org-wide limits are managed by admin — you control prompts, FAQs, sequences, and customer-facing text"
- 2-column grid of 4 cards (same 4 agents) with enable toggle and **Configure** → owner agent page

### Owner Lead Follow-Up — `/automation/followup` (`OwnerAgentFollowUp.tsx`)
Roles: **[owner]**
- **Fundamentals card** (platform defaults read-only banner)
- **Agent & prompts:** name, tone, language, system prompt, forbidden topics (no LLM config)
- **Follow-up sequence:** step cards (owner version — no stop-conditions ownership)
- **Assignment, Triggers, Escalation messages** — owner-scoped subset of admin page

### Owner Client Chat — `/automation/chat` (`OwnerAgentChat.tsx`)
Roles: **[owner]** — owner-scoped copy of `AdminAgentChat` (personality + FAQ + response rules + customer-facing messages, no LLM config)

### Owner Order Tracking — `/automation/tracking` (`OwnerAgentTracking.tsx`)
Roles: **[owner]** — **customer-facing** status messages editor; carrier/API is admin-only

### Owner Refund — `/automation/refund` (`OwnerAgentRefund.tsx`)
Roles: **[owner]** — customer-facing refund messages + tone; policy numbers set by admin

---

## Settings section (admin)

### Users — `src/pages/AdminUsers.tsx` → `/admin/users`
Roles: **[admin]**
- Toolbar: search + role filter + **Invite user** (modal)
- Table: avatar initials, name, email, role badge, last active, status badge (active / invited / inactive)
- Row actions: Edit, Deactivate
- Invite modal: email + role (admin / owner / agent); adds to list with `status = invited`

### Channels — `src/pages/AdminChannels.tsx` → `/admin/channels`
Roles: **[admin]**
- **Connected channels:** WhatsApp Business, Instagram — rows with handle, today's volume, Connected status, Manage (→ workspace), Disconnect
- **Add a channel:** cards — Facebook Messenger (connect), Telegram (coming soon), TikTok DMs (coming soon)
- **Webhook & API:** webhook endpoint (copy), API token (masked + show/hide toggle)

### Templates — `src/pages/AdminTemplates.tsx` → `/admin/templates`
Roles: **[admin]**
- Toolbar: search, channel filter, status filter (approved / pending / rejected), **New template** (modal)
- Table: name, body preview, channel, status badge, used-in count, actions (Edit / Duplicate / Delete)
- Editor modal (2 columns): form (name, channel, body with variable hints) + live WhatsApp-style preview

### Rules — `src/pages/AdminRules.tsx` → `/admin/rules`
Roles: **[admin]**
- **Refund policy** card: refund window (days), auto-approve limit (DZD), proof-of-purchase toggle, Save
- **Business rules** (IF/THEN) card: condition (order value above/below / days since purchase above) → value → action (auto-approve / escalate / reject); add + remove rows
- **Test a scenario** card: order value + customer type + days since → "AI decision" string output

### Billing — `src/pages/AdminBilling.tsx` → `/admin/billing`
Roles: **[admin]**
- **Current plan** card: plan name + price + renewal date; progress bars for Messages used (420k / 500k) and Seats used (5 / 25); Change plan link
- **All plans:** 3 cards (Freelancer / E-commerce [current] / Edu Centers) with features, message cap, users cap, Upgrade buttons
- **Invoice history** table: date, description, amount, status badge, download PDF icon
- **Payment method:** card last-4, expiry, billing email, Update payment method link

---

## Fallbacks

- `src/pages/not-found.tsx` exists but is unreferenced today; the router redirects unknown routes to the dashboard / login.
- Root (`/`) redirects to `/admin/dashboard` (admin) or `/dashboard` (owner/agent) or `/login` when unauthenticated.
