# 03 — Analytics page + on-demand AI reports

You asked for two things:

1. A proper **Analytics page** where owners and admins can see how the business is doing across leads, opportunities, conversations, and agents — today `Performance.tsx` is only automation-agent stats.
2. An **on-demand report generator** where the user types a question in natural language and gets back a structured, data-backed report ("Compare my win rate across channels last quarter and suggest what to do about it").

Both live under a new **`/analytics`** route (admin + owner). `/performance` stays — it becomes the **Automation** sub-view of analytics, linked from the same page.

---

## 3.1 Route & sidebar

**File:** `src/App.tsx`

```tsx
<Route path="/analytics"><ProtectedRoute component={AnalyticsPage} roles={['admin', 'owner']} /></Route>
<Route path="/analytics/reports"><ProtectedRoute component={AnalyticsReportsPage} roles={['admin', 'owner']} /></Route>
<Route path="/analytics/reports/:id"><ProtectedRoute component={AnalyticsReportDetailPage} roles={['admin', 'owner']} /></Route>
```

**File:** `src/components/layout/Sidebar.tsx` — rename the `Intelligence` section to **`Insights`** (internal) and add Analytics + Reports. Keep existing items intact so we don't break muscle memory.

```ts
{
  section: 'Insights',
  items: [
    { label: 'Analytics',   href: '/analytics',          icon: <BarChart3 size={16} />, roles: ['admin', 'owner'] },
    { label: 'Reports',     href: '/analytics/reports',  icon: <FileBarChart size={16} />, roles: ['admin', 'owner'] },
    { label: 'Intelligence',href: '/intelligence',       icon: <TrendingUp size={16} />, roles: ['admin', 'owner'] },
    { label: 'Performance', href: '/performance',        icon: <Activity size={16} />,  roles: ['admin', 'owner'] },
  ],
}
```

(If label "Insights" feels off, keep "Intelligence" as the label and think of Analytics/Reports as the newer canonical entry points.)

---

## 3.2 `AnalyticsPage` — the main dashboard

**File:** `src/pages/analytics/Analytics.tsx`
**Route:** `/analytics`
**Roles:** admin + owner

### Layout

```
┌ Top filter bar: Date range · Channel · Owner · Source
│
├ Row 1 — Headline KPIs (6 StatCards)
│   Total leads · Qualified rate · Open pipeline value · Win rate · Avg cycle time · Revenue (won × sum)
│
├ Row 2 — Funnel + Pipeline chart (side-by-side)
│   Left: Funnel chart (Leads → Qualified → Opportunities → Won) with drop-off % between steps
│   Right: Bar chart — Opportunities count by stage (+ value overlay)
│
├ Row 3 — Trends (two line charts side-by-side)
│   Left: Leads created per day
│   Right: Revenue won per day
│
├ Row 4 — Breakdowns (tabs)
│   Tabs: By channel · By source · By owner · By loss reason
│   Each tab: a small table + a tiny chart (horizontal bar)
│
└ Row 5 — Ask a question card   (the big deal)
    Prominent card with a single textarea:
    "Ask anything about your business — e.g. 'Why did we lose more deals in March?'"
    [Generate report] button → /analytics/reports/:newId
```

### Chart stack

- Reuse **`recharts`** — already in the project (used by `Intelligence.tsx`).
- Put chart building blocks in `src/components/analytics/` so the Reports detail page can reuse them.

### Data

All computed from `MOCK_LEADS` + `MOCK_OPPORTUNITIES` in-memory for now. Put the selectors in:

**File (new):** `src/lib/analytics.ts`

```ts
export interface AnalyticsFilters {
  from?: string; to?: string;
  channel?: Channel | 'all';
  ownerId?: string | 'all';
  source?: string | 'all';
}

export function selectFunnel(leads: Lead[], opps: Opportunity[], f: AnalyticsFilters): FunnelSeries;
export function selectPipelineByStage(opps: Opportunity[], f: AnalyticsFilters): StageSeries;
export function selectLeadsOverTime(leads: Lead[], f: AnalyticsFilters): TimeSeries;
export function selectRevenueOverTime(opps: Opportunity[], f: AnalyticsFilters): TimeSeries;
export function selectBreakdown(dim: 'channel'|'source'|'owner'|'lossReason', opps: Opportunity[], f: AnalyticsFilters): BreakdownRow[];
export function selectWinRate(opps: Opportunity[], f: AnalyticsFilters): number;
export function selectAvgCycleDays(opps: Opportunity[], f: AnalyticsFilters): number;
```

Keep them pure and deterministic so the Reports feature can call them too.

### Empty & loading states

- Empty data in a slice: render `EmptyState` inside the chart card (consistent with other pages).
- Loading: skeleton rows — re-use whatever skeleton pattern `AdminDashboard` already uses (or add one to `src/components/ui/`).

---

## 3.3 Reports — the AI piece

A **Report** is a saved answer to a natural-language question. It has:

- The question
- A set of **sections** (each is a chart / table / bullet list / text blurb)
- A **summary** and **recommendations**
- Filters used when generated
- Created timestamp + author

### 3.3.1 Data types

**File:** `src/lib/types.ts`

```ts
export type ReportSectionKind =
  | 'kpi-row'            // grid of StatCards
  | 'bar-chart'
  | 'line-chart'
  | 'pie-chart'
  | 'funnel-chart'
  | 'table'
  | 'text'
  | 'bullet-list';

export interface ReportSection {
  id: string;
  kind: ReportSectionKind;
  title: string;
  description?: string;
  // A stable payload shape per kind; discriminated union in code.
  payload: unknown;
}

export interface AnalyticsReport {
  id: string;
  question: string;
  createdAt: string;
  createdBy: string;
  filters: AnalyticsFilters;
  summary: string;               // 2-4 sentence TL;DR
  sections: ReportSection[];     // rendered in order
  recommendations: string[];     // 3-5 actionable bullets
  status: 'draft' | 'ready' | 'error';
  source: 'mock' | 'llm';        // 'mock' today, 'llm' later
  shareUrl?: string;
}
```

### 3.3.2 Mock "planner"

**File (new):** `src/lib/report-planner.ts`

The real flow will be: question → LLM → JSON plan (what slices of data to query) → we run the selectors from `analytics.ts` → LLM writes the prose → we render.

For now, ship a **rule-based mock planner** that returns a plausible `AnalyticsReport` for a handful of question shapes. This unblocks the UI and lets the real LLM drop in later behind the same signature.

```ts
export interface PlannerContext {
  leads: Lead[];
  opportunities: Opportunity[];
  users: User[];
  now: Date;
}

export function planReport(question: string, ctx: PlannerContext, filters: AnalyticsFilters): AnalyticsReport;
```

Ship at least these canned handlers (case-insensitive keyword match):

| Keyword(s) in question | Report shape |
|---|---|
| "win rate", "why we win" | KPI row (win rate, avg value) · bar chart by channel · breakdown table by owner · 3 recs |
| "lose", "lost", "why did we lose" | Pie chart of loss reasons · bar chart by stage where lost · breakdown by channel · recs |
| "pipeline", "forecast" | Stage bar chart · weighted forecast KPI · line chart revenue-over-time · recs |
| "slow", "stuck", "cycle time" | Avg cycle time per stage (bar) · top 5 stuck opps table · recs |
| "channel" | Channel breakdown for leads + opps · funnel per channel · recs |
| "owner", "team", "agent performance" | Leaderboard table (count / value / win rate) · recs |
| **fallback** | Generic "How's business?" report: funnel + pipeline + revenue trend + top insights |

Every report includes at least:
- 1 KPI row
- 1 chart section
- 1 breakdown table
- `summary`: 2-4 sentences
- `recommendations`: 3-5 bullets

### 3.3.3 Pages

#### `AnalyticsReports.tsx` — reports list

**Route:** `/analytics/reports`

- Hero **"Ask a question"** card at the top (same as on Analytics page, copy linked here).
- **Suggested prompts** chips below the textarea — click to prefill:
  - _"How's the pipeline this month?"_
  - _"Why did we lose more deals in the last 30 days?"_
  - _"Which channel converts best from lead to won?"_
  - _"Show me our slowest-moving opportunities."_
  - _"Who on the team has the highest win rate?"_
- **Saved reports table**: Question · Created · Author · Status badge · Open.
- **New report** flow: clicking "Generate" routes to `/analytics/reports/:id` with `status=draft`, the detail page polls for `ready`.

#### `AnalyticsReportDetail.tsx` — a single report

**Route:** `/analytics/reports/:id`

- Header: question as H1 · small timestamp + author line · **Export PDF** · **Duplicate & edit filters** · **Share link**.
- **TL;DR** (summary) in a `.scale-card` at the top.
- **Recommendations** card (3-5 bullets) near the top — this is what drives actual behaviour change.
- Sections rendered in order via a `<ReportSectionRenderer>`. Each kind has its own component:
  - `KpiRowSection` — 3-6 StatCards
  - `BarChartSection` / `LineChartSection` / `PieChartSection` — recharts wrappers
  - `FunnelChartSection` — reuse the funnel from Analytics
  - `TableSection` — simple table
  - `TextSection` — paragraph
  - `BulletListSection`
- Each section has a small **"Open in Analytics"** link that deep-links into `/analytics` with the same filters preapplied.

### 3.3.4 Generation UX

- On **Generate report** submit:
  1. Client-side: validate the question (min 6 chars) and the filters.
  2. Create a new `AnalyticsReport` with `status='draft'`, push to `MOCK_REPORTS`, navigate to detail.
  3. Detail page shows a skeleton with the question pinned at top and a thin progress strip "Analyzing your business data…". Simulate a 1.8s wait.
  4. Call `planReport(question, ctx, filters)`, patch the report, flip `status='ready'`, render.
- If `planReport` returns `status='error'`, render an error card with a **Retry** button.

### 3.3.5 Copy

- Button: **"Generate report"** — not "Generate with AI".
- Placeholder: **"Ask anything about your business…"**
- Loading: **"Analyzing your business data…"** — not "AI is thinking".
- Status badges: `Draft · Ready · Error`.

---

## 3.4 Exports & sharing (v1, keep cheap)

- **Export PDF:** use the browser's `window.print()` with a print stylesheet that hides the sidebar + topbar. Good enough until we wire a real PDF lib.
- **Share link:** copy current URL to clipboard with a toast. Assume the app will be behind auth anyway.

---

## 3.5 Acceptance criteria

### Analytics page
- [ ] `/analytics` renders 5 rows per spec with live numbers derived from `MOCK_LEADS + MOCK_OPPORTUNITIES` + filters.
- [ ] Filters work on every chart simultaneously and persist in the URL query string.
- [ ] All chart cards have empty states when no data is in range.
- [ ] "Ask a question" card is present and navigates to a new report on submit.

### Reports
- [ ] `AnalyticsReport` type + `MOCK_REPORTS` exist.
- [ ] `report-planner.ts` has 6 canned handlers + a fallback.
- [ ] `/analytics/reports` lists saved reports with the hero Ask card and suggestion chips.
- [ ] `/analytics/reports/:id` renders summary, recommendations, and ordered sections, with a skeleton during "generation".
- [ ] Every question shape listed in 3.3.2 returns a valid, renderable report.
- [ ] Export PDF prints cleanly (no sidebar, no topbar, charts visible).
- [ ] Copy rule holds — no "AI" in user-facing strings.

### Integration
- [ ] Owner Dashboard's intelligence cards gain a **"See full analytics"** link → `/analytics`.
- [ ] Admin Dashboard's "System alerts" section gets a **"Generate weekly digest report"** row that routes to `/analytics/reports` with a canned prompt prefilled.

---

## 3.6 Touches

- **Routes:** 3 new entries in `src/App.tsx`
- **Sidebar:** `src/components/layout/Sidebar.tsx` — add Analytics + Reports to Insights section
- **Types:** `src/lib/types.ts` — `AnalyticsFilters`, `AnalyticsReport`, `ReportSection`, `ReportSectionKind`
- **Mock data:** `src/lib/mock-data.ts` — `MOCK_REPORTS` seed (3-4 example reports across the canned shapes)
- **New libs:**
  - `src/lib/analytics.ts` (pure selectors)
  - `src/lib/report-planner.ts` (mock planner — single function the LLM will later replace)
- **New pages:**
  - `src/pages/analytics/Analytics.tsx`
  - `src/pages/analytics/AnalyticsReports.tsx`
  - `src/pages/analytics/AnalyticsReportDetail.tsx`
- **New components:** `src/components/analytics/` — `FunnelChart`, `StageBarChart`, `TimeSeriesLine`, `LossReasonPie`, `AskQuestionCard`, `ReportSectionRenderer`, `SuggestedPromptChips`
- **Modified:** `OwnerDashboard.tsx`, `AdminDashboard.tsx` (small deep-links)

---

## 3.7 How the real LLM drops in later

When we're ready to replace the mock:

1. `planReport()` becomes an async function that sends:
   - The question
   - A schema describing what selectors exist in `analytics.ts` and what each returns
   - A sample of the filtered data
2. The LLM returns a JSON plan: `{ summary, sections: [{kind, title, data_source, args}], recommendations }`.
3. Server (or client) runs each `data_source(args)` using `analytics.ts`, fills `section.payload`.
4. Response flips `status='ready'`.

No UI changes required — the same `<ReportSectionRenderer>` + the same `AnalyticsReport` shape work for both mock and real. This is why the boundary above (`planReport` signature, `ReportSection.payload: unknown`) is worth getting right now.
