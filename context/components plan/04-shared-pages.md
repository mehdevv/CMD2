# 04 — Shared pages

Pages reachable by multiple roles. Componentize these **before** the role passes — every dashboard consumes these building blocks.

**Reuses (from [`00`](./00-uniform-components.md)):** `PageHeader`, `PageSection`, `KpiRow`, `DataTable`, `FilterToolbar`, `DialogShell`, `FormField`, `CurrencyInput`, `DateInput`, `SelectField`, `SummaryStrip`, `ActivityRow`, `TimelineItem`, `UserAvatar`, `MessageBubble`, `ConversationThread`, `TakeoverToggle`.

---

## Leads — `src/pages/Leads.tsx`

Extract:

- `LeadCard` → `src/components/leads/LeadCard.tsx` (kanban).
- `LeadRow` → `src/components/leads/LeadRow.tsx` (list; paired with `DataTable`).
- `LeadsKanbanBoard` → `src/components/leads/LeadsKanbanBoard.tsx` — columns per `Stage`, column header shows count; cards come from `LeadCard`.
- `LeadFilters` → `src/components/leads/LeadFilters.tsx` — wraps `FilterToolbar` with the lead-specific select set (stage, channel, enrichment complete).
- `AddLeadDialog` → `src/components/leads/AddLeadDialog.tsx` — uses `DialogShell` + `FormField`.

Acceptance: `Leads.tsx` = `PageHeader` + `LeadFilters` + (`LeadsKanbanBoard` or `DataTable` with `LeadRow`).

## Contact detail — `src/pages/ContactDetail.tsx`

Extract:

- `ContactHeader` → `src/components/leads/ContactHeader.tsx` (breadcrumb, title, channel / phone / source chips, actions).
- `DealAsideCard` → `src/components/leads/DealAsideCard.tsx` (stage / value / close date / notes; already uses `EnrichmentCard` alongside).
- `HistoryCard` → `src/components/leads/HistoryCard.tsx` (automation messages + stage changes + creation; uses `TimelineItem`).
- `MeetingShortcutsCard` → `src/components/leads/MeetingShortcutsCard.tsx` (pre-brief + post-note buttons).
- `FollowUpLog` → `src/components/leads/FollowUpLog.tsx` — already partly inline; expose as its own collapsible.

Acceptance: `ContactDetail.tsx` body = `ContactHeader` + two-col layout of `ConversationThread` + aside (`EnrichmentCard`, `DealAsideCard`, `MeetingShortcutsCard`, `HistoryCard`) + `ConvertToOpportunityDialog` (existing).

## Inbox — `src/pages/Inbox.tsx`

Extract:

- `ConversationListPanel` → `src/components/conversations/ConversationListPanel.tsx` — search, tabs, rows with `UserAvatar` + `ChannelDot` + `AIStatusLabel`.
- `ConversationListRow` → `src/components/conversations/ConversationListRow.tsx`.
- `ThreadHeader` → `src/components/conversations/ThreadHeader.tsx` — title + channel + automation status + "View contact" link + `TakeoverToggle`.

Acceptance: `Inbox.tsx` is a two-pane layout of `ConversationListPanel` + `ConversationThread`.

## Meetings — `src/pages/MeetingBrief.tsx`, `src/pages/MeetingNotes.tsx`

Extract:

- `MeetingBriefShell` → `src/components/meetings/MeetingBriefShell.tsx`
  - Sections: **History & context · Open deals · Risk flags · Suggested talking points**; reads from a typed `MeetingBrief` model.
- `MeetingNotesShell` → `src/components/meetings/MeetingNotesShell.tsx`
  - Recorder + textarea; post-submit sections (summary / objections / opportunities / next steps); green "follow-up scheduled by automation" banner (already corrected).
- `VoiceRecorder` → `src/components/meetings/VoiceRecorder.tsx` — tap-to-record + timer.

Acceptance: each page is `PageHeader` + shell component; no inline section JSX.

---

## Opportunities — `src/pages/opportunities/*`

### List — `Opportunities.tsx`

- `OpportunityFilters` → `src/components/opportunities/OpportunityFilters.tsx` (wraps `FilterToolbar` with stage / owner / channel filters).
- `OpportunityRow` → `src/components/opportunities/OpportunityRow.tsx` (for `DataTable`).

Page body = `PageHeader` + `KpiRow` (open weighted, counts) + `OpportunityFilters` + `DataTable`.

### Board — `OpportunitiesBoard.tsx`

- `OpportunityBoard` → `src/components/opportunities/OpportunityBoard.tsx` — columns for `OpportunityStage`, drag handlers, count + sum per column. Uses `OpportunityCard` and surfaces an `onMove(opp, to)` callback.
- `OpportunityColumn` → `src/components/opportunities/OpportunityColumn.tsx` — header + scrollable body.
- Dialogs: existing `OpportunityMoveConfirm` + `WonLostDialog`.

### Detail — `OpportunityDetail.tsx`

- `OpportunityRecordHeader` → `src/components/opportunities/OpportunityRecordHeader.tsx` — sticky record header: name, amount, stage badge, SLA badge, owner avatar, actions.
- `OpportunityTimeline` → `src/components/opportunities/OpportunityTimeline.tsx` — stage transitions + proposals + payments in one feed using `TimelineItem`.
- `OpportunityTabsNav` → `src/components/opportunities/OpportunityTabsNav.tsx` — stage sub-page tabs (qualification / need analysis / proposal / negotiation / closing).

### Stage pages — `OpportunityQualification.tsx`, `OpportunityNeedAnalysis.tsx`, `OpportunityProposal.tsx`, `OpportunityNegotiation.tsx`, `OpportunityClosing.tsx`

- `StageEditorShell` → `src/components/opportunities/StageEditorShell.tsx` — back link, section title, save/advance button row; every stage page wraps its form body in it.
- `QualificationForm` → `src/components/opportunities/QualificationForm.tsx`
- `NeedAnalysisForm` → `src/components/opportunities/NeedAnalysisForm.tsx`
- `ProposalsTable` → `src/components/opportunities/ProposalsTable.tsx`
- `PaymentsTable` → `src/components/opportunities/PaymentsTable.tsx`
- `ObjectionLogList` → `src/components/opportunities/ObjectionLogList.tsx`

Acceptance: every stage page ≤ ~80 lines JSX, all dialogs go through `DialogShell`, and no page reaches into raw radix primitives.

---

## Analytics & reports — `src/pages/analytics/*`

### Analytics — `Analytics.tsx`

- `AnalyticsFiltersBar` → `src/components/analytics/AnalyticsFiltersBar.tsx` — date range + channel + owner; reads/writes `AnalyticsFilters`, URL-synced via `parseAnalyticsFilters`/`stringifyAnalyticsFilters`.
- `FunnelChart`, `PipelineByStageChart`, `LeadsOverTimeChart`, `RevenueOverTimeChart`, `BreakdownTabs` — thin wrappers over recharts with Scale axis styling so the page isn't a wall of `<ResponsiveContainer>`.
- `AskQuestionCard` — already exists.

### Reports — `AnalyticsReports.tsx`, `AnalyticsReportDetail.tsx`

- `ReportListRow` → `src/components/analytics/ReportListRow.tsx` (question, created at / by, status chip, open link).
- `ReportActions` → `src/components/analytics/ReportActions.tsx` — Export PDF + Copy link buttons (already `no-print` classed).
- `ReportSectionRenderer` — already exists.

---

## Page-by-page acceptance summary (shared)

| Page | New components consumed |
|------|-------------------------|
| `/leads` | `LeadFilters`, `LeadsKanbanBoard`, `DataTable` + `LeadRow`, `AddLeadDialog` |
| `/leads/:id` | `ContactHeader`, `ConversationThread`, `EnrichmentCard`, `DealAsideCard`, `MeetingShortcutsCard`, `HistoryCard`, `FollowUpLog`, `ConvertToOpportunityDialog` |
| `/inbox` | `ConversationListPanel`, `ConversationThread`, `ThreadHeader`, `TakeoverToggle`, `MessageBubble` |
| `/meetings/brief/:id` | `PageHeader`, `MeetingBriefShell` |
| `/meetings/notes/:id` | `PageHeader`, `MeetingNotesShell`, `VoiceRecorder` |
| `/opportunities` | `PageHeader`, `KpiRow`, `OpportunityFilters`, `DataTable` + `OpportunityRow` |
| `/opportunities/board` | `PageHeader`, `OpportunityBoard`, `OpportunityColumn`, `OpportunityCard`, `OpportunityMoveConfirm`, `WonLostDialog` |
| `/opportunities/:id` | `OpportunityRecordHeader`, `OpportunityTabsNav`, `OpportunityTimeline`, `StageStepper` (existing) |
| `/opportunities/:id/*` (stage pages) | `StageEditorShell`, stage-specific form component, `WonLostDialog` |
| `/analytics` | `AnalyticsFiltersBar`, `FunnelChart`, `PipelineByStageChart`, `LeadsOverTimeChart`, `RevenueOverTimeChart`, `BreakdownTabs`, `AskQuestionCard` |
| `/analytics/reports` | `PageHeader`, `DataTable` + `ReportListRow` |
| `/analytics/reports/:id` | `PageHeader`, `ReportActions`, `ReportSectionRenderer` |

Exit criteria: no page in `src/pages/opportunities`, `src/pages/analytics`, or any of the shared meeting / inbox / leads pages declares `<table>`/`<thead>` styles inline, imports hex colors, or contains the same dialog markup as another page.
