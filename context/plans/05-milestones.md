# 05 — Milestones & sequencing

Ship this in **5 phases**. Each phase ends in a merge-able, demo-able state — you can stop after any phase and the app still works. Rough effort estimates assume one focused developer using an agent for scaffolding.

---

## Phase 0 — Foundations (½ day)

The plumbing that every other phase depends on. Boring but worth doing cleanly.

- [ ] Extend `src/lib/types.ts` with **all** types from doc 02 and 03 (opportunity + proposal + payment + analytics + report). Keep `Lead` changes in a second commit so the diff is reviewable.
- [ ] Create `src/lib/pipeline.ts` with `canAdvance`, `DEFAULT_PROBABILITY`, `STAGE_SLA_DAYS`, `stageLabel`, `stageOrder`.
- [ ] Create empty `src/lib/analytics.ts` with selector function signatures + `// TODO` bodies that return empty arrays. Keeps the types green.
- [ ] Create `src/lib/report-planner.ts` with the `planReport` signature returning a minimal fallback report.
- [ ] Add `MOCK_OPPORTUNITIES` seed (2-3 entries is fine for now), `MOCK_LOSS_REASONS`, empty `MOCK_REPORTS`.
- [ ] Add the new `StageBadge` color tokens to `src/index.css`.

**Demo:** `npm run build` passes. Nothing new is visible yet.

---

## Phase 1 — Lead enrichment (1-2 days)

Covered by [`01-lead-enrichment.md`](./01-lead-enrichment.md).

- [ ] Extend `Lead` type with enrichment fields, backfill mock data.
- [ ] Build `EnrichmentCard` (aside block) and `EnrichmentDialog` (modal).
- [ ] Update `Leads.tsx`: Enrichment filter, Score column, "Enrichment incomplete" chip, "View opportunity →" link.
- [ ] Build `ConvertToOpportunityDialog` (wires to the mock `MOCK_OPPORTUNITIES` we seed in phase 0).
- [ ] Copy audit — zero user-facing "AI" strings in touched files.

**Demo:** pick a lead, edit enrichment, hit **Re-enrich with assistant**, see fields populate. Mark the lead Qualified, click **Convert to Opportunity**, land on a 404-ish screen (opportunity detail isn't built yet — fine, we'll build it next).

---

## Phase 2 — Opportunity pipeline core (3-4 days)

Covered by [`02-opportunity-pipeline.md`](./02-opportunity-pipeline.md) §2.1 - 2.7 + §2.9 - 2.10.

Build in this order so each day ends with something clickable:

1. **Day 1**
   - Routes + sidebar "Pipeline" section
   - `Opportunities.tsx` (list + KPIs + filters)
   - `OpportunityDetail.tsx` shell with stepper + header (no stage page content yet)
   - `WonLostDialog.tsx`
2. **Day 2**
   - `OpportunityQualification.tsx` + `QualificationForm`
   - `OpportunityNeedAnalysis.tsx` + `NeedAnalysisForm`
   - `canAdvance` fully enforced from the detail header
3. **Day 3**
   - `OpportunityProposal.tsx` + `ProposalEditor` (versions + "Draft a second offer" mock)
   - `OpportunityNegotiation.tsx` + `PaymentPlanEditor`
   - `OpportunityClosing.tsx` (pay-off banner, handoff card)
4. **Day 4**
   - `OpportunitiesBoard.tsx` kanban + drag-to-move confirmation modal
   - SLA badges everywhere
   - Dashboard patches (owner + agent)
   - Lead → opportunity link on list/card

**Demo:** convert a lead → walk through all 5 stages → drop to Won → see it on the board and the dashboards.

---

## Phase 3 — Analytics dashboard (1-2 days)

Covered by [`03-ai-reports.md`](./03-ai-reports.md) §3.1 - 3.2.

- [ ] Implement every selector in `analytics.ts` over the mock data.
- [ ] Build `AnalyticsPage` with 5 rows (KPIs, funnel+pipeline, trends, breakdowns, Ask-a-question card).
- [ ] Wire filters to URL query string.
- [ ] Add "See full analytics" link from Owner Dashboard.
- [ ] Sidebar: rename section to "Insights", add Analytics item.

**Demo:** `/analytics` shows real-looking charts driven by mock leads + opportunities. Filters work and persist on reload.

---

## Phase 4 — Reports generator (1-2 days)

Covered by [`03-ai-reports.md`](./03-ai-reports.md) §3.3 - 3.5.

- [ ] Add `AnalyticsReport` + `ReportSection` types (already in phase 0, now actually use them).
- [ ] Implement 6 canned handlers + fallback in `report-planner.ts`, each returning a well-formed `AnalyticsReport`.
- [ ] Build `AnalyticsReports.tsx` with hero card + suggested-prompt chips + saved reports table.
- [ ] Build `AnalyticsReportDetail.tsx` with `ReportSectionRenderer` covering all 8 section kinds.
- [ ] Implement print-stylesheet PDF export + share-link toast.
- [ ] Seed `MOCK_REPORTS` with 3-4 ready reports across different shapes.
- [ ] Admin Dashboard System Alert: "Generate weekly digest report" deep-link.

**Demo:** type "Why did we lose more deals last month?" → a report renders with a pie chart of loss reasons, a breakdown, and recommendations. Save, reopen, export to PDF.

---

## Phase 5 — Polish & handoff (½ day)

- [ ] Update `context/PAGES.md`, `context/ROUTES.md`, `context/FEATURES.md` to cover the new sections (keep the docs in sync).
- [ ] Add a `context/DATA_MODEL.md` if it doesn't exist yet — a single diagram / table of the new entities and their relationships.
- [ ] Audit all new pages for:
  - `<AppShell title="…">` wrapper
  - `ProtectedRoute` with correct roles
  - Empty states everywhere data can be empty
  - No raw `<a>` tags — all internal links use wouter `<Link>`
  - No "AI" in user-facing strings
- [ ] Run `npm run lint` + `npm run build`, fix remaining issues.
- [ ] Screen-capture a full demo flow (lead → enrichment → conversion → all 5 stages → analytics → report) for the README.

---

## Dependencies & sequencing notes

- **Phase 1 can be pushed after phase 2** if you want to prioritize the pipeline — the `ConvertToOpportunityDialog` can live on ContactDetail even before enrichment cards are built. But enrichment data makes phase 2 feel richer (pre-filled Need Analysis, better Qualification forms).
- **Phase 3 before phase 4** is firm — the reports page reuses every selector and component from the analytics dashboard.
- Phases 1-4 are all frontend-only on mock data. **Backend integration is its own separate track**, tracked in `context/ROADMAP.md` under "Data & backend".

---

## Risk register

| Risk | Mitigation |
|------|-----------|
| Pipeline types leak into existing `Lead.stage` and cause subtle bugs | Keep `OpportunityStage` and `Stage` as **separate unions**. Don't alias them. |
| Drag-to-move on the kanban allows illegal transitions | Force every move through `canAdvance` + confirmation modal. Don't apply optimistic state. |
| Report UI pretends to use AI but is actually rule-based — users might call it out | Keep language deliberately hedged: "Analyzing your business data…", never "AI analyzed". When the real LLM lands, the copy doesn't need to change. |
| Mock data drift between `MOCK_LEADS` and `MOCK_OPPORTUNITIES` breaks links | Seed opportunities with a helper `buildOpportunityFromLead(leadId)` so the two stay in sync. |
| `/opportunities/:id/qualification` conflict with `/opportunities/:id` route matching in wouter | Always register the more-specific path first in `App.tsx` (doc 04 §4.4 covers this). |
| Navigation bloat — we're adding 2 sidebar sections | Keep Insights collapsed-by-default if the sidebar grows further; for now the 5 sections fit under 220px. |

---

## What to build next (after these 5 phases)

Already listed in `context/ROADMAP.md`, but highlight these as natural follow-ons:

1. **Real LLM for reports** — swap `report-planner.ts` behind the existing signature.
2. **5th automation agent: Proposal follow-up** — auto-nudges opportunities stuck in Proposal > 7 days with prospect-appropriate messages.
3. **Payment processor integration** (Chargily / CMI / Stripe) — replace manual payment status with real webhooks.
4. **Forecasting** — time-series ML prediction card on the Analytics page ("Expected to close in April: 1.2M DZD ± 180k").
5. **Mobile responsive pass** on Opportunities pages (they're desktop-first today).
