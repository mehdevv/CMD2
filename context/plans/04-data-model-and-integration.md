# 04 — Data model & integration summary

This doc is the "merge checklist". Every change across docs 01-03 that touches a shared file is listed here in one place, so a dev (or an agent) can open the right file and patch in one pass without hunting.

---

## 4.1 `src/lib/types.ts`

Add all of the following (grouped by feature, in this order at the bottom of the file):

```ts
// ─── Lead enrichment ──────────────────────────────────
export type LeadQualificationScore = 'cold' | 'warm' | 'hot';
export type CompanySize = 'solo' | '2-10' | '11-50' | '51-200' | '200+';
// (extend existing Lead with new optional fields — see doc 01 §1.1)

// ─── Opportunity pipeline ─────────────────────────────
export type OpportunityStage =
  | 'qualification' | 'need_analysis' | 'proposal'
  | 'negotiation'   | 'closing'       | 'won' | 'lost';
export type OpportunityOutcome = 'won' | 'lost' | 'open';
export type LossReason = 'price' | 'competitor' | 'no_budget' | 'no_decision' | 'timing' | 'not_a_fit' | 'other';
export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'refunded';

export interface StageTransition { from: OpportunityStage; to: OpportunityStage; at: string; by: string; note?: string; }
export interface Proposal { /* see doc 02 §2.2 */ }
export interface Payment  { /* see doc 02 §2.2 */ }
export interface QualificationAnswers { /* … */ }
export interface NeedAnalysis { /* … */ }
export interface Opportunity { /* … */ }

// ─── Analytics & reports ──────────────────────────────
export interface AnalyticsFilters { from?: string; to?: string; channel?: Channel | 'all'; ownerId?: string | 'all'; source?: string | 'all'; }
export type ReportSectionKind = 'kpi-row' | 'bar-chart' | 'line-chart' | 'pie-chart' | 'funnel-chart' | 'table' | 'text' | 'bullet-list';
export interface ReportSection { id: string; kind: ReportSectionKind; title: string; description?: string; payload: unknown; }
export interface AnalyticsReport { /* see doc 03 §3.3.1 */ }
```

Do NOT modify the existing `Stage` union. The `proposal` and `closed` values there become legacy for leads — opportunities own the post-qualification flow.

---

## 4.2 `src/lib/mock-data.ts`

Add these exports (keep the existing ones untouched):

```ts
export const MOCK_OPPORTUNITIES: Opportunity[] = [ /* 12+ entries spanning all stages */ ];
export const MOCK_LOSS_REASONS: Array<{ value: LossReason; label: string }> = [ … ];
export const MOCK_REPORTS: AnalyticsReport[] = [ /* 3-4 example reports */ ];
```

Also:

- Extend 4-5 entries in `MOCK_LEADS` with the new enrichment fields.
- On 3 of those leads, set `convertedOpportunityId` matching entries in `MOCK_OPPORTUNITIES`.
- On converted leads, set `aiStatus: 'completed'`.

---

## 4.3 `src/lib/` — new files

| File | Role |
|------|------|
| `pipeline.ts` | `canAdvance(opp, to)`, `DEFAULT_PROBABILITY`, `STAGE_SLA_DAYS`, `stageLabel()`, `stageIcon()` helpers |
| `analytics.ts` | Pure selectors over leads/opportunities (`selectFunnel`, `selectPipelineByStage`, `selectWinRate`, etc. — see doc 03 §3.2) |
| `report-planner.ts` | `planReport(question, ctx, filters)` mock implementation with 6 canned handlers + fallback |

All three are side-effect free so they're easy to unit test later.

---

## 4.4 `src/App.tsx`

Add imports + routes in this order (after existing admin routes, before the 404 fallback):

```tsx
// Pipeline
import OpportunitiesPage from '@/pages/opportunities/Opportunities';
import OpportunitiesBoardPage from '@/pages/opportunities/OpportunitiesBoard';
import OpportunityDetailPage from '@/pages/opportunities/OpportunityDetail';
import OpportunityQualificationPage from '@/pages/opportunities/OpportunityQualification';
import OpportunityNeedAnalysisPage from '@/pages/opportunities/OpportunityNeedAnalysis';
import OpportunityProposalPage from '@/pages/opportunities/OpportunityProposal';
import OpportunityNegotiationPage from '@/pages/opportunities/OpportunityNegotiation';
import OpportunityClosingPage from '@/pages/opportunities/OpportunityClosing';

// Analytics
import AnalyticsPage from '@/pages/analytics/Analytics';
import AnalyticsReportsPage from '@/pages/analytics/AnalyticsReports';
import AnalyticsReportDetailPage from '@/pages/analytics/AnalyticsReportDetail';
```

Routes:

```tsx
{/* Pipeline (shared) */}
<Route path="/opportunities/board"><ProtectedRoute component={OpportunitiesBoardPage} /></Route>
<Route path="/opportunities/:id/qualification"><ProtectedRoute component={OpportunityQualificationPage} /></Route>
<Route path="/opportunities/:id/need-analysis"><ProtectedRoute component={OpportunityNeedAnalysisPage} /></Route>
<Route path="/opportunities/:id/proposal"><ProtectedRoute component={OpportunityProposalPage} /></Route>
<Route path="/opportunities/:id/negotiation"><ProtectedRoute component={OpportunityNegotiationPage} /></Route>
<Route path="/opportunities/:id/closing"><ProtectedRoute component={OpportunityClosingPage} /></Route>
<Route path="/opportunities/:id"><ProtectedRoute component={OpportunityDetailPage} /></Route>
<Route path="/opportunities"><ProtectedRoute component={OpportunitiesPage} /></Route>

{/* Analytics (admin + owner) */}
<Route path="/analytics/reports/:id"><ProtectedRoute component={AnalyticsReportDetailPage} roles={['admin', 'owner']} /></Route>
<Route path="/analytics/reports"><ProtectedRoute component={AnalyticsReportsPage} roles={['admin', 'owner']} /></Route>
<Route path="/analytics"><ProtectedRoute component={AnalyticsPage} roles={['admin', 'owner']} /></Route>
```

**Order matters** for wouter — put more specific paths before less specific (e.g. `/opportunities/:id/qualification` before `/opportunities/:id`; `/opportunities/board` before `/opportunities/:id`).

---

## 4.5 `src/components/layout/Sidebar.tsx`

Add imports:

```ts
import { Target, Columns3, FileBarChart, Activity } from 'lucide-react';
```

Insert two new sections and adjust ordering so the final nav reads:

```
Workspace
  Dashboard · Leads · Inbox

Pipeline                    ← NEW
  Opportunities · Pipeline board

Insights                    ← renamed from "Intelligence"
  Analytics       ← NEW
  Reports         ← NEW
  Intelligence
  Performance

Automation
  (unchanged)

Settings
  (unchanged)
```

Role visibility:

- **Pipeline** section: all three roles (admin + owner + agent).
- **Insights** section items: admin + owner only (agents see their own perf on their dashboard).

---

## 4.6 Existing pages to patch

| File | Change | Source doc |
|------|--------|-----------|
| `src/pages/Leads.tsx` | Add `Enrichment` filter + `Score` column + "Enrichment incomplete" chip + "View opportunity →" link when converted | 01 · 02 |
| `src/pages/ContactDetail.tsx` | Add `EnrichmentCard` to aside + `Convert to Opportunity` header action + dialog | 01 · 02 |
| `src/pages/OwnerDashboard.tsx` | Replace 2 KPI cards, add "Pipeline at a glance" strip, add "See full analytics" link | 02 · 03 |
| `src/pages/AgentDashboard.tsx` | Add "My opportunities needing action" card | 02 |
| `src/pages/AdminDashboard.tsx` | Add "Generate weekly digest report" row in System Alerts | 03 |
| `src/pages/MeetingBrief.tsx`, `src/pages/MeetingNotes.tsx` | Accept an opportunity id in the `:id` param (check opps first, then leads) | 02 |
| `src/pages/admin/AdminAutomationTriggers.tsx` | Add row "Opportunity reached Negotiation" | 02 |
| `src/pages/admin/AdminAutomationActivity.tsx` | Add filter + row type `Opportunity stage change`, `Converted to opportunity` | 01 · 02 |

---

## 4.7 New components inventory

Grouped by folder so the PR can be reviewed in chunks:

```
src/components/leads/
  EnrichmentCard.tsx
  EnrichmentDialog.tsx
  ConvertToOpportunityDialog.tsx

src/components/opportunities/
  StageStepper.tsx
  StageBadge.tsx
  OpportunityKanbanCard.tsx
  ProposalEditor.tsx
  PaymentPlanEditor.tsx
  NeedAnalysisForm.tsx
  QualificationForm.tsx
  WonLostDialog.tsx
  OpportunityHeader.tsx
  StageSLABadge.tsx

src/components/analytics/
  AskQuestionCard.tsx
  SuggestedPromptChips.tsx
  FunnelChart.tsx
  StageBarChart.tsx
  TimeSeriesLine.tsx
  LossReasonPie.tsx
  BreakdownTable.tsx
  ReportSectionRenderer.tsx
  ReportSectionCard.tsx
```

---

## 4.8 Design-system additions

Most work reuses `.scale-card`, `.scale-btn-*`, `ScaleBadge`, `StatCard`, `EmptyState`, `TagInput`, `RadioCards`, `ScaleSlider`. A few net-new pieces:

- **Stage badge colors** — extend the palette per stage. Target tokens (add to `src/index.css` and wire into a new `StageBadge.tsx`):
  - `qualification`   → neutral grey `#6B6B80` on `#F0F0F2`
  - `need_analysis`   → purple-ish `#6D5CC3` on `#F0ECFB`
  - `proposal`        → blue `#2B62E8` on `#EEF3FD`
  - `negotiation`     → amber `#C77A00` on `#FFF5E5`
  - `closing`         → teal `#0E8F83` on `#E5F5F2`
  - `won`             → green `#1F9D55` on `#E5F5EC`
  - `lost`            → red `#C64747` on `#FBECEC`
- **Score badge colors** — `cold/warm/hot` per doc 01.
- **Funnel chart** — new `recharts` wrapper; not a native recharts type, so implement with `<BarChart layout="vertical">` + manual axis ticks. Keep lines flat (no glow).
- **Stepper** — clickable numeric steps with a thin connector line; use `#E4E4E8` for inactive, `#2B62E8` for active, `#1F9D55` for completed. No animation beyond color fade.

---

## 4.9 Ownership & role enforcement (client-side only for now)

Until real auth lands:

- List pages (`/opportunities`, `/analytics`) filter by `ownerId === user.id` when `user.role === 'agent'`.
- Admin + owner see everything.
- Opportunity detail page renders an inline "You don't have access to this opportunity" banner if an agent tries to open someone else's (no redirect — easier to debug).

---

## 4.10 URL-state conventions

Adopt for all new pages (and retrofit where cheap):

- Filters live in the URL query string (`?from=2026-03-01&to=2026-03-31&channel=whatsapp&ownerId=user_123`).
- Report detail persists which tab/section is open via `?section=losses`.
- This makes reports shareable and deep-linkable without a backend.

---

## 4.11 What doesn't change

To avoid scope creep, **do not** touch:

- `AuthContext.tsx` / `auth.ts` (stays mock + localStorage)
- Automation agent admin pages (no new agent, no config changes beyond the trigger+activity additions)
- `AdminTemplates`, `AdminRules`, `AdminChannels`, `AdminBilling`
- `Intelligence.tsx`, `Performance.tsx` — they stay in place alongside Analytics; we may retire them after Analytics proves itself in a later phase.
