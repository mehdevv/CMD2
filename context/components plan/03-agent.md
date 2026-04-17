# 03 — Agent role componentization

Scope: every screen an `agent` user reaches — `/dashboard` (agent branch) and the agent-visible shared pages (`/leads`, `/leads/:id`, `/inbox`, `/meetings/*`, `/opportunities/*`).

Agents do **not** configure automation; most of this pass is about the **personalized dashboard** and making sure the shared pages respect `ownerId`.

**Reuses (from [`00`](./00-uniform-components.md)):** `PageHeader`, `PageSection`, `KpiRow`, `DataTable`, `SummaryStrip`, `ActivityRow`, `UserAvatar`, plus existing `StatCard`, `ChannelDot`, `StageBadge`, `OpportunityStageBadge`, `AIStatusLabel`, `EmptyState`.

---

## Agent dashboard — `src/pages/AgentDashboard.tsx`

Current pain: greeting + stats are inline; "needs attention", "messages to approve", "my opportunities", and "today's automated follow-ups" are each hand-rolled.

Extract:

- `GreetingHeader` → `src/components/dashboards/GreetingHeader.tsx`
  - props: `{ firstName: string; subtitle?: React.ReactNode }`; used by agent dashboard and potentially a future morning-digest email preview.
- `NeedsAttentionList` → `src/components/agent/NeedsAttentionList.tsx`
  - Row = `{ lead: Lead; reason: string; href: string }`. Visual is an `ActivityRow` with a danger-tinted reason.
- `DraftsToApproveList` → `src/components/agent/DraftsToApproveList.tsx`
  - Row = `{ conversation: Conversation }`. Reuses `ChannelDot` + truncated last message.
- `MyOpportunitiesList` → `src/components/agent/MyOpportunitiesList.tsx`
  - Row builds on `OpportunityRow` (role-agnostic) but limited to 5 items and renders a footer link to `/opportunities`.
- `TodaysFollowUpsTable` → `src/components/agent/TodaysFollowUpsTable.tsx`
  - Thin wrapper over `DataTable` with the typed follow-up row `{ contact, preview, channel, time, status: 'Scheduled' | 'Sent' }`.

Acceptance: page body is

```tsx
<PageHeader title="Dashboard" />
<GreetingHeader firstName={...} subtitle={`${myActiveLeadCount} lead${…} in your pipeline today.`} />
<KpiRow items={[...]} />
<div className="grid grid-cols-2 gap-6 mb-6">
  <PageSection title="Needs attention"><NeedsAttentionList /></PageSection>
  <PageSection title="Messages to approve"><DraftsToApproveList /></PageSection>
</div>
<PageSection title="My opportunities" action={<Link href="/opportunities">View all</Link>}>
  <MyOpportunitiesList />
</PageSection>
<PageSection title="Today's automated follow-ups">
  <TodaysFollowUpsTable />
</PageSection>
```

---

## Agent's view of shared pages

These pages are componentized in [`04-shared-pages.md`](./04-shared-pages.md). For the **agent** pass, only verify the following:

- `/leads` and `/leads/:id`: the `LeadRow` / `LeadCard` components respect an optional `ownerFilter` prop so the list can be scoped to `assignedNameToOwnerId(lead.assignedTo) === user.id` without bespoke JSX.
- `/opportunities` list + board: `OpportunityRow` / `OpportunityCard` takes an `ownerFilter` prop that pages pass when `user.role === 'agent'`.
- `/opportunities/:id/*`: the stage editors (from [`04-shared-pages.md`](./04-shared-pages.md)) already go through `useOpportunityFromRoute`, which handles `canAccess`. No agent-specific components.
- `/meetings/brief/:id`, `/meetings/notes/:id`: resolution order (opportunity-first, lead-fallback) is the same; `MeetingBriefShell` / `MeetingNotesShell` from [`04`](./04-shared-pages.md) are the only components.

So the agent pass itself introduces **no new shared components** — it just wires the filter props.

---

## Page-by-page acceptance summary (agent)

| Page | Hard-coded JSX removed | New components consumed |
|------|------------------------|-------------------------|
| `/dashboard` (agent) | greeting, stats, 4 list/table sections | `PageHeader`, `GreetingHeader`, `KpiRow`, `PageSection`, `NeedsAttentionList`, `DraftsToApproveList`, `MyOpportunitiesList`, `TodaysFollowUpsTable` |
| `/leads`, `/leads/:id` | (shared) | `FilterToolbar`, `DataTable`, `LeadRow`, `LeadCard`, `EnrichmentCard` (existing), `ConvertToOpportunityDialog` (existing) |
| `/opportunities` + board + detail | (shared) | `OpportunityRow`, `OpportunityCard`, `StageStepper`, `OpportunityStageBadge` |

Exit criteria: the agent dashboard file is < 150 lines of JSX; nothing under `src/pages/` duplicates `<table><thead>` styles after this pass.
