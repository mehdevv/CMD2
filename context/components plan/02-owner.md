# 02 — Owner role componentization

Scope: everything an `owner` user sees — `/dashboard` (owner branch), `/automation/*` pages, and the owner-visible shared pages (covered in [`04-shared-pages.md`](./04-shared-pages.md)).

**Reuses (from [`00`](./00-uniform-components.md)):** `PageHeader`, `PageSection`, `KpiRow`, `DataTable`, `SummaryStrip`, `ActivityRow`, `UserAvatar`, plus existing `StatCard`, `ChannelDot`, `StageBadge`, `OpportunityStageBadge`, `AIStatusLabel`, `EmptyState`, `OwnerFundamentalsCard`.

Owners reuse **most** admin automation subcomponents in a read/guided mode — that is why `AgentPersonalityCard`, `FollowUpSequenceEditor`, `FaqList`, `TriggersPanel`, `EscalationPanel`, `MetricsTiles` from [`01-admin.md`](./01-admin.md) all take a `scope: 'admin' | 'owner'` prop (or a `readonly` flag) to render the owner-friendly variant. **Do not** fork them per role.

---

## Owner dashboard — `src/pages/OwnerDashboard.tsx`

Current pain: three intelligence cards, a pipeline summary strip, a team pipeline table, and a recent-meetings list are all inline.

Extract:

- `IntelligenceHighlightCard` → `src/components/dashboards/IntelligenceHighlightCard.tsx`
  - props: `{ kind: 'danger' | 'success' | 'warning'; label: string; headline: string; detail: string; links: Array<{ label: string; href: string }> }`
  - Also reused by `Intelligence.tsx` pages / future admin digest cards.
- `PipelineSummaryStrip` → `src/components/dashboards/PipelineSummaryStrip.tsx`
  - Consumes `useCrmData` or accepts `{ opportunities, filters? }`. Renders the "open pipeline by stage" row currently hand-rolled on the owner dashboard.
- `TeamPipelineTable` → `src/components/dashboards/TeamPipelineTable.tsx`
  - Uses `DataTable` + `ChannelDot` + `StageBadge` + `AIStatusLabel` + `UserAvatar`. Takes an `agentFilter` prop for the dropdown.
- `RecentMeetingList` → `src/components/meetings/RecentMeetingList.tsx`
  - Reused on `MeetingNotes.tsx` history and admin digest.

Acceptance: page body is

```tsx
<PageHeader title="Dashboard" />
<KpiRow items={...} />
<PipelineSummaryStrip />
<div className="grid grid-cols-3 gap-4 mb-8">{intel.map(IntelligenceHighlightCard)}</div>
<Link /* Full analytics */ />
<PageSection title="Team pipeline" action={<AgentFilterSelect />}><TeamPipelineTable /></PageSection>
<PageSection title="Recent meeting summaries"><RecentMeetingList items={...} /></PageSection>
```

---

## Owner automation overview — `src/pages/owner/automation/OwnerAutomationOverview.tsx`

Use the same `AutomationAgentTile` as admin (from [`01-admin.md`](./01-admin.md)) with `scope="owner"`. This removes the owner-specific tile code entirely.

Extract `OwnerAutomationExplainer` → `src/components/automation/OwnerAutomationExplainer.tsx`: the banner "model, API keys, and org-wide limits are managed by admin — you control prompts, FAQs, sequences, and customer-facing text" (single component so copy lives in one place).

Page body: `PageHeader` + `OwnerAutomationExplainer` + grid of `AutomationAgentTile` + optional `PageSection` with owner-specific KPI tiles.

---

## Owner agent config pages — `/automation/followup`, `/chat`, `/tracking`, `/refund`

These pages are, per plan, "owner-scoped subsets" of their admin twins.

Rebuild each page as:

```
AgentConfigShell
  <OwnerFundamentalsCard />                  // existing
  <AgentPersonalityCard scope="owner" />
  <FollowUpSequenceEditor scope="owner" />   // follow-up page
  <FaqList scope="owner" />                  // chat page
  <TriggersPanel scope="owner" />            // subset of triggers owner can edit
  <EscalationPanel scope="owner" readonly />
<StickySaveBar />
```

When a subcomponent receives `scope="owner"`, it hides the LLM-config slot, API-key fields, refund policy-threshold fields, etc. — the rule set is described in the component's own doc block.

**No new files** beyond `OwnerAutomationExplainer.tsx` are strictly needed for these four pages. The whole phase is about *subtracting* JSX.

---

## Owner-visible shared pages

These pages are covered in [`04-shared-pages.md`](./04-shared-pages.md). For owners specifically, verify:

- `/leads`, `/leads/:id`, `/inbox`, `/meetings/*` — presentation is role-neutral, nothing owner-only to extract.
- `/opportunities` — owner sees everyone's opportunities (same as admin); uses the same `OpportunityRow` / `OpportunityCard`.
- `/analytics`, `/analytics/reports`, `/analytics/reports/:id` — same Analytics components.

---

## Page-by-page acceptance summary (owner)

| Page | Hard-coded JSX removed | New components consumed |
|------|------------------------|-------------------------|
| `/dashboard` (owner) | KPI grid, intel cards, pipeline strip, team table, meetings list | `PageHeader`, `KpiRow`, `IntelligenceHighlightCard`, `PipelineSummaryStrip`, `TeamPipelineTable`, `RecentMeetingList`, `PageSection` |
| `/automation` | agent tiles + explainer | `PageHeader`, `OwnerAutomationExplainer`, `AutomationAgentTile` |
| `/automation/followup` + 3 | personality / sequence / triggers / escalation JSX | `AgentConfigShell`, `OwnerFundamentalsCard`, `AgentPersonalityCard`, `FollowUpSequenceEditor` / `FaqList` / `StatusMessageMappingTable` / `PolicyRulesEditor`, `TriggersPanel`, `EscalationPanel`, `StickySaveBar` |

Exit criteria: owner pages contain zero automation-config JSX that also exists in admin pages — all of it comes through shared components with a `scope` prop.
