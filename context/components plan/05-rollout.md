# 05 — Rollout, acceptance, migration rules

## Phase order

Each phase is one or more PRs. Do not start a phase until the prior phase is merged, **except** that admin / owner / agent passes can run in parallel once the shared work is done.

1. **Phase A — Uniform components** ([`00`](./00-uniform-components.md))
   - Ship one component per PR (or small bundles of ~3 closely-related ones).
   - Each PR must migrate at least one call site so reviewers can see it in use.
2. **Phase B — Shared pages** ([`04`](./04-shared-pages.md))
   - Order: Leads → Contact detail → Inbox → Meetings → Opportunities (list / board / detail / stage pages) → Analytics → Reports.
   - This is the highest-leverage phase; once it lands the role dashboards get trivial.
3. **Phase C — Role passes** ([`01`](./01-admin.md), [`02`](./02-owner.md), [`03`](./03-agent.md))
   - These can run in parallel on different branches.
   - Admin agent-config pages are the biggest; split into 2 PRs if needed (Follow-Up + Chat first, Tracking + Refund second).
4. **Phase D — Polish & docs**
   - Remove dead props / unused hex constants; update `PAGES.md` / `DATA_MODEL.md` if a page gained a new data shape.
   - Lint with `eslint .` and fix any warnings we accepted during migration.

## Per-PR checklist

- [ ] Component has typed props, a named export, and is placed in the correct folder per the rules in [`README.md`](./README.md).
- [ ] **At least one** page in the repo now uses the component (preferred: the smallest page that renders the pattern).
- [ ] No inline hex colors in the new component; tokens live in `src/index.css` or are Tailwind-standard.
- [ ] No imports from `src/pages/*` in `src/components/*`.
- [ ] `npm run lint` clean on changed files (`ReadLints` or `eslint --max-warnings 0 <files>`).
- [ ] `npm run build` green.
- [ ] No URL or role-guard change sneaks in. Routes touched? Update [`../ROUTES.md`](../ROUTES.md) in the same PR.
- [ ] Copy passes the DESIGN_SYSTEM rules (no “AI” in user strings; uses “assistant” / “automation”).

## Migration rules when replacing JSX

1. Grep the repo for identical structure before extracting — confirm we have **≥ 2 call sites** or a clear reason this will be reused.
2. Do not change visual output in the extraction PR. If the original page was off-token, note it in the PR and fix it in a **follow-up** PR so review stays focused.
3. Preserve `data-testid` values on interactive elements (buttons, inputs) so existing smoke tests keep passing.
4. When adding a `scope: 'admin' | 'owner'` (or similar) prop, document the behavior matrix in a comment at the top of the file.
5. A prop named `variant` is a red flag. Consider whether you actually have two components.

## Stop conditions (when to pause and re-plan)

- The component file passes 300 lines — split it.
- Props interface passes 8 fields — consider composition (children / slots) or splitting.
- You are conditionally swapping between two entirely different layouts inside one component — split it.
- The same logic is copied between a page and its extracted component — the logic belongs in `src/lib/*` and both call it.

## What success looks like

- `src/pages/*` files read top-to-bottom as a list of components with small amounts of page-level state.
- Any visual change to a shared pattern (stage badge, KPI card, section card, dialog) lands in **one file** and propagates everywhere.
- New pages can be assembled in an afternoon using existing components; design reviews stop being "why is the padding different on this page?".
