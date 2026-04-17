# Componentization plan

Goal: stop repeating JSX across pages and turn recurring UI into a **small, typed component library**. Same visual language, faster page authoring, one place to change a layout.

This folder holds the plan. Execute it in the order below.

## Source of truth

- Design tokens and copy rules: [../DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- IA / pages: [../PAGES.md](../PAGES.md), [../ROUTES.md](../ROUTES.md)
- Roles / features: [../FEATURES.md](../FEATURES.md)
- Data types: [../DATA_MODEL.md](../DATA_MODEL.md)

Primitives we already have (do **not** rebuild): `AppShell`, `Sidebar`, `Topbar`, `StatCard`, `ChannelDot`, `ScaleBadge` (+ `StageBadge`, `TemplateBadge`), `OpportunityStageBadge`, `StageStepper`, `StageSLABadge`, `AIStatusLabel`, `EmptyState`, `InfoBlock`, `TagInput`, `RadioCards`, `ScaleSlider`, `InlineDuration`, `TimeRange`, `PasswordInput`, `ProgressBar`, `LLMConfigSection`, `AgentConfigShell`, `AgentStatusPanel`, `OwnerFundamentalsCard`, `AskQuestionCard`, `ReportSectionRenderer`, `EnrichmentCard`, `LeadScoreBadge`, `WonLostDialog`, `OpportunityMoveConfirm`, plus shadcn primitives under `src/components/ui/*`.

## Files in this folder

- [`00-uniform-components.md`](./00-uniform-components.md) — cross-role building blocks used on every screen
- [`01-admin.md`](./01-admin.md) — componentize admin pages
- [`02-owner.md`](./02-owner.md) — componentize owner pages
- [`03-agent.md`](./03-agent.md) — componentize agent pages
- [`04-shared-pages.md`](./04-shared-pages.md) — pages reachable by multiple roles (leads / inbox / meetings / opportunities / analytics / reports)
- [`05-rollout.md`](./05-rollout.md) — phased rollout, acceptance checks, migration rules

## How to read a page in this plan

Each page entry follows the same template:

```
### PageName — src/pages/Foo.tsx
Current pain: <what is hard-coded or duplicated today>
Extract:
  - <Component> → src/components/<folder>/<Component>.tsx  (props: …)
Reuses (uniform): <names from 00>
Acceptance: <bullet list — visual parity, no behavior regression, lint/build clean>
```

## Rules for every extraction

1. **Colocate by domain first**, promote to `ui/` only when two domains need it.
   - `src/components/dashboards/*` — role-agnostic dashboard widgets
   - `src/components/leads/*`, `opportunities/*`, `analytics/*`, `automation/*`, `meetings/*`, `admin/*`
   - `src/components/ui/*` — truly generic primitives (after reuse is proven)
2. **No inline hex colors** inside new components. Read from Tailwind classes / CSS tokens in [`src/index.css`](../../src/index.css). If a token is missing, add it to `index.css` instead of hard-coding.
3. **Typed props only.** No `any`. Enum-like props use types from [`src/lib/types.ts`](../../src/lib/types.ts).
4. **Accessibility & copy:** follow DESIGN_SYSTEM — no “AI” in user strings (use “assistant” / “automation”), button `aria-label` when icon-only, links via wouter `<Link>`.
5. **Responsibility stays with the page.** Components are presentational or tiny containers; data-fetching (`useCrmData`, `useAuth`) stays in pages unless the widget is role-agnostic and always needs the same data (e.g. `PipelineSummaryStrip` pulls from `useCrmData` because it is the same everywhere).
6. **One behavior, one component.** A dialog / card / row does one thing. If you find yourself passing `variant="admin" | "owner"`, stop and split.
7. **No regressions.** Each PR must keep `npm run lint` and `npm run build` green and must not change the URL surface (`ROUTES.md`).

## Order of work (high level)

1. Extract **uniform components** ([`00`](./00-uniform-components.md)) — unlocks every downstream PR.
2. Refactor **shared pages** ([`04`](./04-shared-pages.md)) first — biggest surface area, proves the library.
3. Role passes in parallel: **admin** ([`01`](./01-admin.md)), **owner** ([`02`](./02-owner.md)), **agent** ([`03`](./03-agent.md)).
4. Polish + docs ([`05`](./05-rollout.md)): update `PAGES.md` notes when a page switches to the new blocks; delete dead JSX.
