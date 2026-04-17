# Data model (client mock)

Scale ships **without a backend**. Persistent UI state for the CRM slice lives in `src/contexts/CrmDataContext.tsx`, seeded from `src/lib/mock-data.ts`, `src/lib/mock-opportunities-seed.ts`, and `src/lib/mock-reports-seed.ts`. Types are defined in `src/lib/types.ts`.

## Lead (`Lead`)

- **Pipeline:** `Stage` = `new` | `contacted` | `qualified` | `proposal` | `closed` — this is the **lead** funnel only.
- **Automation:** `aiStatus` drives `AIStatusLabel` (user copy uses “assistant” / “automation”).
- **Enrichment:** optional fields such as `company`, `industry`, `companySize`, `painPoints`, `enrichedAt`, `leadScore`, etc.
- **Conversion:** `convertedOpportunityId` links to an `Opportunity.id` when the lead was converted.

## Opportunity (`Opportunity`)

- **Pipeline:** `OpportunityStage` = `qualification` | `need_analysis` | `proposal` | `negotiation` | `closing` | `won` | `lost` — **never** reuse `Stage` for this.
- **Outcome:** `outcome` (`open` vs terminal) plus `stage` for won/lost.
- **Ownership:** `ownerId` / `ownerName` — agents filter to their own records in product terms; mocks may still list all rows.
- **Value:** `value` + `currency` (`DZD`), optional `probability`; weighted pipeline uses defaults from `src/lib/pipeline.ts` when probability is missing.
- **Nested:** `qualification`, `needAnalysis`, `proposals[]`, `payments[]`, `paymentStatus`, `lossReason`, `stageHistory[]`, `objectionLog`, etc.

## Reports (`AnalyticsReport`)

- Generated / listed under `/analytics/reports`; sections use `ReportSectionKind` (`kpi-row`, `bar-chart`, `pie-chart`, …).
- `planReport` in `src/lib/report-planner.ts` builds a deterministic skeleton from a natural-language question (mock).

## Analytics filters (`AnalyticsFilters`)

- Optional `from`, `to`, `channel`, `ownerId`, `source` — parsed from the `/analytics` query string via `parseAnalyticsFilters` / `stringifyAnalyticsFilters` in `src/lib/analytics.ts`.

## Pipeline rules

- **Legal transitions:** `LEGAL_NEXT` and `canAdvance` in `src/lib/pipeline.ts`. Board and dialogs must not apply illegal stage moves silently.

## Auth

- Demo users in `src/lib/auth.ts`; `ownerId` on opportunities should align with these ids (`agent-1`, …, `user-2`, etc.) for consistent filtering in dashboards.
