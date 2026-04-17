# 01 — Admin role componentization

Scope: every page gated `roles=['admin']` in `App.tsx`, plus the shared admin pieces on `/admin/dashboard`.

**Reuses (from [`00`](./00-uniform-components.md)):** `PageHeader`, `PageSection`, `KpiRow`, `DataTable`, `FilterToolbar`, `DialogShell`, `FormField`, `StickySaveBar`, `ActivityRow`, `UserAvatar`, plus existing `StatCard`, `ChannelDot`, `ScaleBadge`/`TemplateBadge`, `AIStatusLabel`, `EmptyState`, `InfoBlock`, `AgentConfigShell`, `AgentStatusPanel`, `LLMConfigSection`.

Unless stated otherwise, each page should finish with: **no inline hex colors**, **no duplicated header JSX**, and **no locally re-declared table thead styles**.

---

## Admin dashboard — `src/pages/AdminDashboard.tsx`

Current pain: 4 KPI `StatCard`s in a hand-written grid; activity feed, channel health, pending templates, system alerts are all bespoke JSX with hex colors.

Extract:

- `ChannelHealthList` → `src/components/admin/ChannelHealthList.tsx` — props `{ items: Array<{ channel; name; status; msgsToday }> }`.
- `PendingTemplatesTable` → `src/components/admin/PendingTemplatesTable.tsx` — uses `DataTable` + `TemplateBadge` + action buttons; emits `onApprove(id)` / `onReject(id)`.
- `SystemAlertList` → `src/components/admin/SystemAlertList.tsx` — props `{ alerts: Array<{ id; type: 'warning' | 'info'; text: React.ReactNode }> }`; internal icon mapping.
- `AutomationActivityFeed` → `src/components/admin/AutomationActivityFeed.tsx` — wraps `ActivityRow` for `MOCK_ACTIVITY_FEED`.

Acceptance: page body is a `PageHeader` + `KpiRow` + 2-col grid of `PageSection`s wrapping the four extracted widgets.

---

## Admin agents overview — `src/pages/admin/AdminAgentsOverview.tsx` and classic — `src/pages/AdminAgents.tsx`

Extract:

- `AutomationAgentTile` → `src/components/admin/AutomationAgentTile.tsx` — icon, name, description, 3 stat slots, enable toggle, configure button. Same tile is reused for owner automation overview via a separate `scope` prop (`'admin' | 'owner'`).
- `AgentEnableToggle` → `src/components/admin/AgentEnableToggle.tsx` — a labeled switch used inside the tile and on individual agent pages.

Acceptance: both overview pages render a `PageHeader` + 2-col grid of `AutomationAgentTile`.

---

## Admin agent config pages — `/admin/agents/followup`, `/chat`, `/tracking`, `/refund`

Current pain: each page manually assembles `AgentConfigShell` and then re-implements the same subsections (personality, triggers, escalation, metrics).

Extract small, focused blocks and reuse them across all four pages **and** owner versions:

- `AgentPersonalityCard` → `src/components/automation/AgentPersonalityCard.tsx` — name, tone (`RadioCards`), language, system prompt textarea with char counter, forbidden topics (`TagInput`), business context.
- `FollowUpSequenceEditor` → `src/components/automation/FollowUpSequenceEditor.tsx` — step list with delay / mode / template / channels / send window / stop conditions; global send window controls; drag handles.
- `FaqList` → `src/components/automation/FaqList.tsx` — Q/A list, categories, "fallback to LLM" toggle. Used by chat + owner chat.
- `TriggersPanel` → `src/components/automation/TriggersPanel.tsx` — checkbox list + conditional sub-fields + "do not trigger if" block.
- `EscalationPanel` → `src/components/automation/EscalationPanel.tsx` — escalation triggers, keywords, confidence slider, notify-via, pause toggle.
- `MetricsTiles` → `src/components/automation/MetricsTiles.tsx` — 3 display-only tiles matching `StatCard` visually but non-interactive.
- `StatusMessageMappingTable` → `src/components/admin/StatusMessageMappingTable.tsx` — tracking agent only: internal code, customer message, enabled, escalate.
- `DecisionLogTable` → `src/components/admin/DecisionLogTable.tsx` — refund agent + rules page.
- `PolicyRulesEditor` → `src/components/admin/PolicyRulesEditor.tsx` — IF/THEN rule list with live plain-English summary.
- `TestAgentDialog` → `src/components/admin/TestAgentDialog.tsx` — one modal shape with per-agent body slot. Replaces the four separate test modals (`Test Follow-Up`, `Test Chat`, `Test Order Tracking`, `Test Refund`).

Acceptance: each of the 4 pages is < 120 lines of JSX and reads as a list of the extracted blocks.

---

## Admin automation cross-cutting pages

### Triggers — `src/pages/admin/AdminAutomationTriggers.tsx`

Extract `TriggerEventTable` → `src/components/admin/TriggerEventTable.tsx`. Rows = `{ id, event, agent, effect, href, enabled }`. Emits `onToggle(id)`. Uses `DataTable`.

### Human intervention — `src/pages/admin/AdminAutomationIntervention.tsx`

Reuses `EscalationPanel` + new `InterventionDefaultsCard` → `src/components/admin/InterventionDefaultsCard.tsx`.

### Activity log — `src/pages/admin/AdminAutomationActivity.tsx`

- Use `FilterToolbar` (search + agent select + type select).
- Extract `ActivityTypeBadge` → `src/components/admin/ActivityTypeBadge.tsx` with the existing type → color map centralized.
- Body is `DataTable`.

### Notifications — `src/pages/admin/AdminNotifications.tsx`

Just `PageHeader` + `EmptyState`; no new component required.

---

## Admin settings pages

### `AdminUsers.tsx`, `AdminChannels.tsx`, `AdminTemplates.tsx`, `AdminRules.tsx`, `AdminBilling.tsx`

Shared needs:

- `UserRow` → `src/components/admin/UserRow.tsx` (name + email + role chip + status + actions).
- `InviteUserDialog` → `src/components/admin/InviteUserDialog.tsx` using `DialogShell` + `FormField`.
- `ChannelCard` → `src/components/admin/ChannelCard.tsx` — connect / disconnect / webhook URL + API token (password input), health dot. Reused from admin dashboard's `ChannelHealthList` visual but with editable rows.
- `TemplateRow` → `src/components/admin/TemplateRow.tsx` (name + channel dot + status + actions).
- `SubmitTemplateDialog` → `src/components/admin/SubmitTemplateDialog.tsx`.
- `RulePreviewCard` → `src/components/admin/RulePreviewCard.tsx` — IF/THEN plain-English preview; already scattered across `AdminRules`/`AdminAgentRefund`.
- `PlanCard` → `src/components/admin/PlanCard.tsx` — Freelancer / E-commerce / Edu Centers used in `AdminBilling` **and** `Onboarding`. Props let us mark one `highlighted` or `current`.
- `InvoiceRow` → `src/components/admin/InvoiceRow.tsx`.

Acceptance: each settings page is `PageHeader` + `FilterToolbar` (where relevant) + `DataTable`/card grid + dialogs.

---

## Page-by-page acceptance summary (admin)

| Page | Hard-coded JSX removed | New components consumed |
|------|------------------------|-------------------------|
| `/admin/dashboard` | KPI grid, 4 section cards | `PageHeader`, `KpiRow`, `PageSection`, `ChannelHealthList`, `PendingTemplatesTable`, `SystemAlertList`, `AutomationActivityFeed` |
| `/admin/agents` + `workspace` | agent cards | `AutomationAgentTile`, `AgentEnableToggle` |
| `/admin/agents/followup` + 3 | personality / triggers / escalation / metrics JSX | `AgentConfigShell`, `AgentPersonalityCard`, `FollowUpSequenceEditor` (follow-up), `FaqList` (chat), `StatusMessageMappingTable` (tracking), `PolicyRulesEditor` + `DecisionLogTable` (refund), `TriggersPanel`, `EscalationPanel`, `MetricsTiles`, `TestAgentDialog`, `StickySaveBar` |
| `/admin/automation/triggers` | trigger table | `PageHeader`, `TriggerEventTable` |
| `/admin/automation/intervention` | forms | `EscalationPanel`, `InterventionDefaultsCard` |
| `/admin/automation/activity` | filters + table | `FilterToolbar`, `DataTable`, `ActivityTypeBadge` |
| `/admin/users` | invite + rows | `FilterToolbar`, `DataTable` + `UserRow`, `InviteUserDialog` |
| `/admin/channels` | connect cards | `ChannelCard` |
| `/admin/templates` | list + modal | `DataTable` + `TemplateRow`, `SubmitTemplateDialog` |
| `/admin/rules` | rule editor + test | `PolicyRulesEditor`, `RulePreviewCard`, `TestAgentDialog` |
| `/admin/billing` | plan grid + invoices | `PlanCard`, `DataTable` + `InvoiceRow` |

Exit criteria: no admin page imports `@radix-ui/react-dialog` directly (all dialogs go through `DialogShell`); no admin page declares hex colors inline; `npm run build` passes.
