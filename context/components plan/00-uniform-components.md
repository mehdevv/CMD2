# 00 — Uniform components (used on every role)

These are the shared building blocks. Build **these first** — every role plan depends on them. Each item lists: what to build, where it lives, key props, and where it is currently duplicated in the app so we know to replace those sites.

Folder conventions:

- Layout shell parts → `src/components/layout/*`
- Generic UI that the whole app reuses → `src/components/ui/*`
- Role-agnostic widgets tied to a domain → `src/components/dashboards/*`, `src/components/conversations/*`, `src/components/filters/*`

Already existing primitives are listed in [`README.md`](./README.md); do not rebuild them.

---

## Layout-level

### `PageHeader` — `src/components/layout/PageHeader.tsx`

Title + optional subtitle + breadcrumb + right-aligned action slot.

Props:

```ts
{
  title: string;
  subtitle?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode; // buttons / links
}
```

Replaces the repeated pattern (title `text-[22px] font-semibold text-[#1A1A3E]` + muted paragraph + ad-hoc breadcrumb) in:

- `ContactDetail.tsx` — "Leads / {name}" breadcrumb + actions row
- `Opportunities.tsx`, `OpportunitiesBoard.tsx`, `OpportunityDetail.tsx`, all five stage pages
- `Analytics.tsx`, `AnalyticsReports.tsx`, `AnalyticsReportDetail.tsx`
- `AdminAutomationTriggers.tsx`, `AdminAutomationActivity.tsx`, `AdminAutomationIntervention.tsx`, `AdminNotifications.tsx`
- `MeetingBrief.tsx`, `MeetingNotes.tsx`
- `Leads.tsx`

### `PageSection` — `src/components/layout/PageSection.tsx`

`scale-card` wrapper with header (title + optional action/link) and body. Lets us stop hand-writing `<div className="scale-card">` + `<h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">` everywhere.

Props:

```ts
{
  title?: string;
  description?: string;
  action?: React.ReactNode; // e.g. "View all" link
  padding?: 'default' | 'none';
  children: React.ReactNode;
}
```

### `StickySaveBar` — `src/components/layout/StickySaveBar.tsx`

The "Save changes / Discard" bar used by agent config pages and opportunity stage editors.

Props: `{ dirty: boolean; saving?: boolean; onSave: () => void; onDiscard?: () => void; hint?: string }`.

---

## Data display

### `KpiRow` — `src/components/dashboards/KpiRow.tsx`

Grid wrapper around `StatCard`. Avoids repeating `grid grid-cols-4 gap-4 mb-8` everywhere.

Props: `{ items: Array<React.ComponentProps<typeof StatCard>>; cols?: 2 | 3 | 4 | 5 }`.

Used by: all 3 dashboards, Analytics, Opportunities list, Performance.

### `DataTable` — `src/components/ui/DataTable.tsx`

Thin, typed wrapper around `<table>` that applies the Scale header/row tokens (`bg-[#F7F7F8]`, `border-[#E4E4E8]`, 48px row height, hover `#F7F7F8`). Not a full grid lib — just eliminates the repeated `<thead><tr style={{ background: '#F7F7F8' ... }}>` boilerplate.

Props:

```ts
{
  columns: Array<{ key: string; header: string; className?: string; width?: number }>;
  rows: Array<{ id: string; cells: React.ReactNode[]; href?: string }>;
  empty?: React.ReactNode; // falls back to EmptyState
  density?: 'default' | 'compact';
}
```

Used by: `AdminDashboard` (pending templates, channel health), `AdminAutomationActivity`, `OwnerDashboard` (team pipeline), `AgentDashboard` (follow-ups), `Leads` list, `Opportunities` list, `Performance`, `AdminUsers`, `AdminTemplates`, `AdminRules` decision log, `AdminAgentRefund` decision log.

### `FilterToolbar` — `src/components/filters/FilterToolbar.tsx`

Row of: search input (debounced), zero or more `<select>`s, optional view toggle. Emits a typed filter object.

Props: `{ search?: { value: string; onChange: (v: string) => void; placeholder?: string }; filters?: FilterSpec[]; right?: React.ReactNode }`.

Used by: `Leads`, `Opportunities`, `AdminAutomationActivity`, `AdminUsers`, `AdminTemplates`, `Inbox`.

### `SummaryStrip` — `src/components/dashboards/SummaryStrip.tsx`

Compact horizontal list of `label · value` chips. Used for: opportunity board column totals, "by stage" strip on `OwnerDashboard`, "by channel" breakdown on Analytics.

### `TimelineItem` — `src/components/ui/TimelineItem.tsx`

Vertical timeline row (timestamp, icon, description, optional badge). Used by: `OpportunityDetail` activity list, `ContactDetail` history card, `AdminAutomationActivity` if we want a non-table view later.

### `ActivityRow` — `src/components/ui/ActivityRow.tsx`

Single-line "channel dot + agent + action + time" row. Already duplicated in: `AdminDashboard` activity feed, `AgentDashboard` escalations, `OwnerDashboard` meeting summaries.

---

## Forms & inputs

### `FormField` — `src/components/ui/FormField.tsx`

Label + help-text + error wrapper for any `<input>` / `<select>` / custom control. Replaces the ad-hoc `<label className="text-[12px] text-[#6B6B80] mb-1">` pattern in every dialog/stage page.

Props: `{ label: string; help?: string; error?: string; required?: boolean; children: React.ReactNode }`.

Apply in: `EnrichmentDialog`, `ConvertToOpportunityDialog`, `WonLostDialog`, all five `Opportunity*` stage pages, `AdminUsers` invite dialog, `AdminTemplates`, `AdminRules`, `AdminChannels`.

### `CurrencyInput` — `src/components/ui/CurrencyInput.tsx`

Number input that formats DZD with thousands separators and returns a `number`. Use wherever we currently do `value.toLocaleString()` for display and store numbers in state. Targets: `ConvertToOpportunityDialog`, `WonLostDialog`, `OpportunityProposal`, `OpportunityNegotiation`, `OpportunityClosing`.

### `DateInput` — `src/components/ui/DateInput.tsx`

Thin `<input type="date">` wrapped with the shared token styling and `min`/`max` helpers. Avoids repeating `className="scale-input w-40"` + manual ISO slicing.

### `SelectField` / `MultiSelectField` — `src/components/ui/SelectField.tsx`

Typed wrapper so pages stop casting `e.target.value as Whatever`. Paired with `FormField`.

### `DialogShell` — `src/components/ui/DialogShell.tsx`

Opinionated wrapper around the radix `Dialog` with header (title + subtitle), scrollable body, footer with action buttons. All of our dialogs already follow the same structure but inline it:

- `EnrichmentDialog`
- `ConvertToOpportunityDialog`
- `WonLostDialog`
- `OpportunityMoveConfirm`
- admin modals in `AdminAgents`, `AdminRules`, `AdminTemplates`, `AdminChannels`

Props: `{ open; onOpenChange; title; description?; footer: React.ReactNode; size?: 'sm' | 'md' | 'lg' }`.

---

## Conversation & inbox

### `MessageBubble` — `src/components/conversations/MessageBubble.tsx`

Renders one message (sender = `contact | agent | ai`). Replaces the repeated bubble JSX in `ContactDetail.tsx` and `Inbox.tsx`.

### `ConversationThread` — `src/components/conversations/ConversationThread.tsx`

Scrollable list of `MessageBubble` + sticky compose (textarea + send button, disabled state when automation is active). Both `Inbox.tsx` and `ContactDetail.tsx` render this today.

### `TakeoverToggle` — `src/components/conversations/TakeoverToggle.tsx`

Single button that flips between **Take over** and **Release to automation** (copy already aligned with DESIGN_SYSTEM). Used by both pages.

---

## Opportunity & lead helpers (role-agnostic)

### `OpportunityCard` — `src/components/opportunities/OpportunityCard.tsx`

Dense card with name, contact, value, stage badge, SLA badge. Used on: `OpportunitiesBoard` column, `AgentDashboard` "My opportunities", `OwnerDashboard` pipeline summary.

### `OpportunityRow` — `src/components/opportunities/OpportunityRow.tsx`

Row variant for `DataTable` use on the `Opportunities` list page and owner dashboard.

### `LeadCard` / `LeadRow` — `src/components/leads/LeadCard.tsx`, `LeadRow.tsx`

Already partially exists inline in `Leads.tsx` (kanban card + list row). Extract.

---

## Navigation & user

### `UserAvatar` — `src/components/ui/UserAvatar.tsx`

Initials bubble (6–32px) with optional name label. Replaces duplicated `<div className="w-6 h-6 rounded-full bg-[#F0F0F2] ...">` snippets in `Sidebar`, `Topbar`, `OwnerDashboard`, `ContactDetail`, `Inbox`.

### `NavLinkButton` — (stays inside `Sidebar.tsx`)

Already covered by the refactor from the earlier plan; we will not re-extract it beyond what is there.

---

## Acceptance for phase 00

- [ ] Every component above has a typed props interface and a named export.
- [ ] All new components live in `src/components/...` and import only `ui/` + `lib/` siblings — **no imports from `pages/`**.
- [ ] `npm run lint` and `npm run build` are green after the phase.
- [ ] At least **one call site per component** has been migrated to prove the API (pick the smallest page in each).
- [ ] Storybook / visual review is optional but a short `context/components plan/examples.md` may be added with prop tables if we want.
