# 02 — Opportunity Pipeline

This is the big one. It introduces the **post-qualification** sales flow you described:

```
Qualification ─► Need Analysis ─► Proposal ─► Negotiation ─► Closing ─► Won
                │
                └──────────────► Lost  (can happen from any stage)
```

Everything here is a **new section** — new sidebar group, new routes, new pages, new data types. It deliberately lives separately from `Leads` so the funnel split is obvious in the UI.

---

## 2.1 Mental model

- A **Lead** becomes an **Opportunity** at the moment of qualification (see doc 01, "Convert to Opportunity").
- An Opportunity has **one stage at a time** (`qualification | need_analysis | proposal | negotiation | closing | won | lost`).
- `won` and `lost` are **terminal** stages — the record becomes read-only, but it still shows up in analytics.
- Stage transitions are logged to a **Stage History** so analytics can compute cycle time per stage.
- Every stage has:
  - a **primary action** (e.g. Qualification → "Log qualification meeting")
  - a **required field** to advance (e.g. Proposal → can't advance to Negotiation without a proposal attached)
  - a **timer / SLA badge** (e.g. "Stuck in Negotiation for 12 days")

---

## 2.2 New data types

**File:** `src/lib/types.ts`

```ts
export type OpportunityStage =
  | 'qualification'
  | 'need_analysis'
  | 'proposal'
  | 'negotiation'
  | 'closing'
  | 'won'
  | 'lost';

export type OpportunityOutcome = 'won' | 'lost' | 'open';
export type LossReason =
  | 'price'
  | 'competitor'
  | 'no_budget'
  | 'no_decision'
  | 'timing'
  | 'not_a_fit'
  | 'other';

export interface StageTransition {
  from: OpportunityStage;
  to: OpportunityStage;
  at: string;            // ISO
  by: string;            // user id
  note?: string;
}

export interface Proposal {
  id: string;
  version: number;
  title: string;
  value: number;              // DZD
  currency: 'DZD';
  validUntil?: string;
  fileUrl?: string;           // uploaded PDF
  linkUrl?: string;           // external doc
  lineItems?: Array<{
    name: string;
    qty: number;
    unitPrice: number;
    discountPct?: number;
  }>;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'superseded';
  sentAt?: string;
  createdAt: string;
}

export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'refunded';

export interface Payment {
  id: string;
  amount: number;            // DZD
  method: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'other';
  reference?: string;
  receivedAt?: string;       // set when status becomes paid
  status: PaymentStatus;
  note?: string;
}

export interface QualificationAnswers {
  // BANT light — this seeds Need Analysis
  budget?: string;
  authority?: string;        // who decides
  need?: string;             // primary pain being solved
  timeline?: string;
  competingSolutions?: string[];
  riskFlags?: string[];
}

export interface NeedAnalysis {
  summary: string;
  goals: string[];
  metricsToMove: string[];          // e.g. "reply rate > 80%"
  decisionCriteria: string[];
  stakeholders: Array<{ name: string; role: string }>;
  proposedSolution?: string;
}

export interface Opportunity {
  id: string;
  leadId: string;              // origin lead
  name: string;                // e.g. "BigRetail — WhatsApp automation"
  company?: string;
  contactName: string;
  channel: Channel;
  ownerId: string;             // assigned sales user
  stage: OpportunityStage;
  outcome: OpportunityOutcome; // 'open' until terminal
  value: number;               // expected value in DZD
  currency: 'DZD';
  expectedCloseDate?: string;
  probability?: number;        // 0-100, derived from stage by default

  qualification?: QualificationAnswers;
  needAnalysis?: NeedAnalysis;
  proposals: Proposal[];
  payments: Payment[];
  paymentStatus: PaymentStatus;

  lossReason?: LossReason;
  lossDetail?: string;
  wonDetail?: string;

  createdAt: string;
  updatedAt: string;
  stageEnteredAt: string;      // for SLA badges
  stageHistory: StageTransition[];
  nextStepAt?: string;         // calendar reminder
  nextStepText?: string;
  tags?: string[];
}
```

### Default probabilities

Used in forecast totals on the pipeline view (can be overridden per opportunity):

| Stage | Default probability |
|-------|---------------------|
| qualification   | 20% |
| need_analysis   | 40% |
| proposal        | 60% |
| negotiation     | 75% |
| closing         | 90% |
| won             | 100% |
| lost            | 0%   |

---

## 2.3 Mock data

**File:** `src/lib/mock-data.ts`

Add `MOCK_OPPORTUNITIES: Opportunity[]` with **at least** 12 records spread across stages — including 2 won, 2 lost, and realistic ones in every intermediate stage. Also:

- `MOCK_LOSS_REASONS` — keyed list for the Lost modal.
- Seed `stageHistory` entries so the timeline UI has content.
- Match at least 3 opportunities back to existing leads (set `lead.convertedOpportunityId`).

---

## 2.4 Routes

**File:** `src/App.tsx` — add inside the Switch, under a new `/opportunities/*` block, above the Intelligence routes:

```tsx
{/* Opportunity pipeline (shared) */}
<Route path="/opportunities"><ProtectedRoute component={OpportunitiesPage} /></Route>
<Route path="/opportunities/board"><ProtectedRoute component={OpportunitiesBoardPage} /></Route>
<Route path="/opportunities/:id"><ProtectedRoute component={OpportunityDetailPage} /></Route>
<Route path="/opportunities/:id/qualification"><ProtectedRoute component={OpportunityQualificationPage} /></Route>
<Route path="/opportunities/:id/need-analysis"><ProtectedRoute component={OpportunityNeedAnalysisPage} /></Route>
<Route path="/opportunities/:id/proposal"><ProtectedRoute component={OpportunityProposalPage} /></Route>
<Route path="/opportunities/:id/negotiation"><ProtectedRoute component={OpportunityNegotiationPage} /></Route>
<Route path="/opportunities/:id/closing"><ProtectedRoute component={OpportunityClosingPage} /></Route>
```

All of these use the default shared role-guard (admin + owner + agent). They're scoped on the backend later by `ownerId`.

---

## 2.5 Sidebar changes

**File:** `src/components/layout/Sidebar.tsx`

Add a new section **"Pipeline"** between `Workspace` and `Intelligence`:

```ts
{
  section: 'Pipeline',
  items: [
    { label: 'Opportunities', href: '/opportunities', icon: <Target size={16} />, roles: ['admin', 'owner', 'agent'] },
    { label: 'Pipeline board', href: '/opportunities/board', icon: <Columns size={16} />, roles: ['admin', 'owner', 'agent'] },
  ],
},
```

Icons come from `lucide-react`. If `Target` / `Columns` aren't already imported, add them.

Do **not** add child items for each stage — they're only reached from an opportunity's detail page.

---

## 2.6 Pages

All new files go under `src/pages/opportunities/`.

### 2.6.1 `Opportunities.tsx` — list view

**Route:** `/opportunities`
**Roles:** admin + owner + agent (agents see only their own)

- **Toolbar:** search · stage multi-filter · outcome filter (`Open · Won · Lost`) · owner filter · date range · view toggle (**List / Board**) · **New opportunity** button (rare — usually created via Lead conversion; the button opens the same dialog as Lead conversion but with a lead picker at the top).
- **KPI strip** (4 `StatCard`s): Open pipeline value (DZD, sum of `value * probability` for non-terminal) · Won this month · Avg cycle time · Win rate (won / (won + lost)).
- **Table columns:** Name · Company · Stage (badge) · Value · Probability · Expected close · Owner · Days in stage · Next step.
- Click row → `/opportunities/:id`.

### 2.6.2 `OpportunitiesBoard.tsx` — kanban by stage

**Route:** `/opportunities/board`
**Roles:** same as list

- Columns: Qualification · Need Analysis · Proposal · Negotiation · Closing · Won · Lost.
- Each column shows: count, sum of value, weighted forecast.
- Cards show: name, company, value, owner initials, days in stage (red if > stage SLA — see 2.8).
- Drag a card between columns → open a **Stage change confirmation** modal (pre-requisites enforced, see 2.7). No optimistic silent moves.
- Clicking a card → `/opportunities/:id`.

### 2.6.3 `OpportunityDetail.tsx` — the hub page

**Route:** `/opportunities/:id`
**Roles:** shared (only assigned owner + admin + business owner see it)

Layout mirrors `ContactDetail.tsx` (familiar to users):

```
┌ Breadcrumb: Pipeline / {name}
├ Header: name · company · value DZD · stage badge · owner avatar
│         Actions: [Advance stage ▾] [Mark Won] [Mark Lost] [Edit]
│
├ Stepper (clickable): Qualification → Need Analysis → Proposal → Negotiation → Closing
│                      (current stage highlighted; completed stages checked; future stages muted)
│
├ Left column (60%)
│   - Current stage panel (renders a preview of the stage-specific page, or a CTA to open it)
│   - Activity / timeline: stage transitions + note entries + proposal events + payments
│   - Related conversation link (wouter → /leads/{leadId} → thread)
│
└ Aside (40%)
    - Deal card: stage, value, probability (slider), expected close, owner
    - Next step card: date + free-text field
    - Key contact: from the originating Lead
    - Files: proposals + attachments list
    - Tags
```

**"Advance stage"** dropdown shows only the legal next stages given the current stage + completed pre-reqs. If pre-reqs aren't met, the item is disabled with a tooltip explaining what's missing.

### 2.6.4 `OpportunityQualification.tsx` — **Qualification stage**

**Route:** `/opportunities/:id/qualification`

- Meeting scheduler card:
  - Date/time picker
  - Attendees (team members multi-select + free text for prospect names)
  - Location (in-person / call / video link field)
  - Button **"Generate meeting brief"** → reuses existing `/meetings/brief/:id` flow (we pass `opportunityId` as a query param — extend `MeetingBrief.tsx` to accept it).
- **Qualification form** (renders the `QualificationAnswers` type):
  - Budget (text)
  - Authority — who decides? (text)
  - Need (textarea)
  - Timeline (text)
  - Competing solutions (`TagInput`)
  - Risk flags (`TagInput`)
- **Post-meeting outcome**:
  - Radio cards with **four** choices:
    - **Proceed to Need Analysis** (default, advances stage)
    - **Proceed to Proposal** (skip need analysis when prospect is already decided)
    - **Mark as Won** (rare — only if it's a transactional deal that closes on the call)
    - **Mark as Lost** (opens loss reason modal)
  - Free-text note required when choosing Won or Lost.
- Bottom bar: **Save** · **Save & advance**.

Copy rule: the button is **"Generate meeting brief"**, the card title is **"Qualification meeting"** — do not say "AI meeting brief".

### 2.6.5 `OpportunityNeedAnalysis.tsx` — **Need Analysis stage**

**Route:** `/opportunities/:id/need-analysis`

- Auto-seeded from `QualificationAnswers` on first visit — user edits, doesn't re-type.
- Fields (`NeedAnalysis` type):
  - **Summary** (textarea)
  - **Goals** (`TagInput`)
  - **Metrics to move** (`TagInput`)
  - **Decision criteria** (`TagInput`)
  - **Stakeholders** (repeater: name + role)
  - **Proposed solution** (textarea)
- Helper button: **"Draft with assistant"** — takes conversation thread + qualification answers + enrichment and returns a seed `summary` + `proposedSolution`. Mock implementation: deterministic template string based on pain points.
- Bottom bar: **Save** · **Save & move to Proposal**.
- **Outcome shortcuts** (same pattern as qualification): Mark Won / Mark Lost.

### 2.6.6 `OpportunityProposal.tsx` — **Proposal stage**

**Route:** `/opportunities/:id/proposal`

This page manages **a list of proposals** (versions). The user is explicitly building toward a sellup / upsell per your description, so multiple versions are first-class.

- **Proposals list** (left column):
  - Each row: version number, title, value, status badge (Draft / Sent / Accepted / Rejected / Superseded), sent date.
  - Actions per row: View / Edit / Duplicate / Mark as sent / Mark as accepted.
  - Button **"+ New version"** → opens the proposal editor.
- **Proposal editor** (right column / modal):
  - Title
  - Value (DZD) — auto-summed from line items if used
  - Valid until (date)
  - Line items (repeater): name, qty, unit price, discount %. Running total shown.
  - Notes (textarea)
  - Attach file (PDF) OR paste link
  - Status radio (Draft by default)
  - Helper: **"Draft a second offer"** — prefills a v2 with a typical 10-15% discount or a bundled upsell ("same offer + onboarding pack"). Mock today; later wires to LLM.
- Stage-advance rule: **must have at least one proposal with `status = 'sent'`** to move to Negotiation.
- Outcome shortcuts: Mark Won / Mark Lost.

### 2.6.7 `OpportunityNegotiation.tsx` — **Negotiation stage**

**Route:** `/opportunities/:id/negotiation`

Focus: **payment pending**. The deal is verbally agreed, waiting on money.

- **Accepted proposal summary** (read-only card): version, value, line items.
- **Payment plan**:
  - Toggle: Single payment / Installments
  - If installments: repeater (amount, due date, method)
  - Each row: status (`pending | paid`) — marking paid writes to `Opportunity.payments`.
- **Contract / terms**: attach file or paste link.
- **Objections & concessions log** (list of free-text entries with date + note + delta-to-value field) — this feeds the Intelligence page's objections tab later.
- Stage-advance rule: **at least one `Payment` with status `pending` OR `partially_paid`** exists to advance to Closing (we're literally saying "money is in flight").
- Outcome shortcuts: Mark Won / Mark Lost.

### 2.6.8 `OpportunityClosing.tsx` — **Closing stage**

**Route:** `/opportunities/:id/closing`

Focus: **payment completion + handoff**.

- Payments table (from negotiation) now editable to mark each row **Paid** with date + reference.
- **Derived `paymentStatus`**:
  - `pending` — no payments paid yet
  - `partially_paid` — some paid, some pending
  - `paid` — all paid
- Big green banner when `paymentStatus === 'paid'`: **"All payments received — mark as Won"** with a prominent **Mark as Won** button.
- **Post-sale handoff card**:
  - Onboarding owner (user picker)
  - Onboarding date
  - Notes for onboarding
  - "Send welcome message" button (triggers the Chat agent template — for now just toasts "Welcome message queued").
- Outcome shortcuts: Mark Won (primary here) / Mark Lost (rare — allows cancellation).

---

## 2.7 Stage-transition rules

Enforced in one place so every surface (detail page header, kanban drag, stage page "save & advance") behaves the same.

**File (new):** `src/lib/pipeline.ts`

```ts
export function canAdvance(opp: Opportunity, to: OpportunityStage): { ok: boolean; reason?: string } {
  const from = opp.stage;
  // legal transitions
  const graph: Record<OpportunityStage, OpportunityStage[]> = {
    qualification:  ['need_analysis', 'proposal', 'won', 'lost'],
    need_analysis:  ['proposal', 'won', 'lost'],
    proposal:       ['negotiation', 'won', 'lost'],
    negotiation:    ['closing', 'won', 'lost'],
    closing:        ['won', 'lost'],
    won:            [],
    lost:           [],
  };
  if (!graph[from].includes(to)) return { ok: false, reason: 'Not a legal transition.' };

  // pre-reqs
  if (to === 'negotiation'
      && !opp.proposals.some(p => p.status === 'sent' || p.status === 'accepted')) {
    return { ok: false, reason: 'Send a proposal before moving to Negotiation.' };
  }
  if (to === 'closing'
      && !opp.payments.some(p => p.status === 'pending' || p.status === 'partially_paid' || p.status === 'paid')) {
    return { ok: false, reason: 'Add a payment plan before moving to Closing.' };
  }
  if (to === 'won' && opp.paymentStatus !== 'paid') {
    return { ok: false, reason: 'Mark all payments as paid before Won.' };
  }
  return { ok: true };
}

export const DEFAULT_PROBABILITY: Record<OpportunityStage, number> = {
  qualification: 20,
  need_analysis: 40,
  proposal: 60,
  negotiation: 75,
  closing: 90,
  won: 100,
  lost: 0,
};
```

Every transition writes a `StageTransition` to `opportunity.stageHistory` with `{ from, to, at, by, note? }` and updates `stageEnteredAt`.

---

## 2.8 SLA badges ("days in stage")

Used on the list, the board, and the detail header.

| Stage | Green | Amber | Red |
|-------|-------|-------|-----|
| qualification   | ≤ 3d | 4-7d | >7d |
| need_analysis   | ≤ 5d | 6-10d | >10d |
| proposal        | ≤ 7d | 8-14d | >14d |
| negotiation     | ≤ 7d | 8-14d | >14d |
| closing         | ≤ 3d | 4-7d | >7d |

Put the thresholds in `src/lib/pipeline.ts` so they can be tuned later.

---

## 2.9 Won / Lost dialogs

**File (new):** `src/components/opportunities/WonLostDialog.tsx`

- **Won dialog**:
  - Final value (pre-filled from current opp value, editable)
  - Close date (default: today)
  - Win summary (textarea — "why did they buy?")
  - Save → writes `outcome = 'won'`, `stage = 'won'`, `wonDetail`, marks the accepted proposal as `accepted`.
- **Lost dialog**:
  - Reason radio (`LossReason` enum)
  - Detail (textarea)
  - Save → writes `outcome = 'lost'`, `stage = 'lost'`, `lossReason`, `lossDetail`.
  - Trigger a one-time "Reach out in 90 days" task stub (for future nurture flow — just log it to activity for now).

Both dialogs are launched from every stage page and from the detail header "Mark Won / Mark Lost" actions.

---

## 2.10 Integration with existing pages

### Dashboards

- **Owner Dashboard** (`src/pages/OwnerDashboard.tsx`):
  - Replace the top KPI row 3rd/4th cards with `Open pipeline value` and `Win rate (30d)`.
  - Add a **"Pipeline at a glance"** strip under the intelligence cards: horizontal bars of count per stage.
- **Agent Dashboard** (`src/pages/AgentDashboard.tsx`):
  - New card **"My opportunities needing action"**: 5 rows, sorted by `stageEnteredAt` age × stage SLA weight. Click → detail.
- **Admin Dashboard** (`src/pages/AdminDashboard.tsx`):
  - Leave as-is for now. Analytics is covered in doc 03.

### Leads

- Add link on each lead card: _"View opportunity →"_ when `convertedOpportunityId` is set.

### Meeting Brief / Notes

- `MeetingBrief.tsx` and `MeetingNotes.tsx` already accept `:id`. Extend them to look up the opportunity when the id matches an opportunity instead of a lead — simplest: accept both and check `MOCK_OPPORTUNITIES` first.

---

## 2.11 Automation hand-offs

Agents keep doing their job but with the pipeline in mind:

- **Lead Follow-Up agent** stops for converted leads (already set in doc 01).
- **Client Chat agent** still replies to inbound messages on opportunities, but **when the opportunity is in `negotiation` or `closing`, low-confidence replies escalate to the owner automatically** (not just the assigned agent). Add a note in `AdminAgentChat.tsx` copy but no logic change needed beyond updating the escalation rule default.
- Add a new **activity log row type**: `Opportunity stage change` in `/admin/automation/activity`.
- Add a new **trigger event** in `/admin/automation/triggers`: `Opportunity reached Negotiation` — used later to fire proposal-follow-up reminders.

No changes to the 4 agent admin configurators themselves in this phase.

---

## 2.12 Acceptance criteria

### Data & types
- [ ] `Opportunity`, `Proposal`, `Payment`, `NeedAnalysis`, `QualificationAnswers`, `StageTransition`, `LossReason`, `OpportunityStage`, `OpportunityOutcome`, `PaymentStatus` all live in `types.ts`.
- [ ] `MOCK_OPPORTUNITIES` has 12+ records spanning every stage including `won` and `lost`.
- [ ] `MOCK_LOSS_REASONS` exists.
- [ ] `src/lib/pipeline.ts` exports `canAdvance`, `DEFAULT_PROBABILITY`, `STAGE_SLA_DAYS`.

### Navigation
- [ ] New sidebar section **"Pipeline"** with two items (Opportunities list, Pipeline board).
- [ ] All 7 new routes registered in `App.tsx` with `ProtectedRoute`.
- [ ] Root redirect logic unchanged.

### Pages & UI
- [ ] List page: 4 KPI cards, table, filters, new-opportunity modal, search.
- [ ] Board page: kanban with 7 columns, value totals per column, drag-to-move opens stage-change modal.
- [ ] Detail page: stepper, header actions, 60/40 layout, activity timeline.
- [ ] Each stage page (5) renders the spec'd form, supports **Save**, **Save & advance**, and shortcut Won/Lost.
- [ ] Proposal page supports versions and a **"Draft a second offer"** helper.
- [ ] Closing page shows the green "All payments received" banner when `paymentStatus === 'paid'`.

### Behavior
- [ ] `canAdvance` blocks illegal transitions and missing pre-reqs, with a readable reason.
- [ ] SLA badges render in the right color per stage age.
- [ ] Won dialog updates outcome, stage, `wonDetail`, and stamps the accepted proposal.
- [ ] Lost dialog writes reason + detail and logs a 90-day nurture task.
- [ ] Lead conversion (from doc 01) lands the user on `/opportunities/:id/qualification`.

### Copy
- [ ] No string contains the word "AI" in the opportunity section. Helpers are labelled **"Draft with assistant"**, **"Generate meeting brief"**, etc.

---

## 2.13 Touches

- **Types:** `src/lib/types.ts`
- **Mock data:** `src/lib/mock-data.ts`
- **New file:** `src/lib/pipeline.ts`
- **New pages (7 + 1 board):**
  - `src/pages/opportunities/Opportunities.tsx`
  - `src/pages/opportunities/OpportunitiesBoard.tsx`
  - `src/pages/opportunities/OpportunityDetail.tsx`
  - `src/pages/opportunities/OpportunityQualification.tsx`
  - `src/pages/opportunities/OpportunityNeedAnalysis.tsx`
  - `src/pages/opportunities/OpportunityProposal.tsx`
  - `src/pages/opportunities/OpportunityNegotiation.tsx`
  - `src/pages/opportunities/OpportunityClosing.tsx`
- **New components:**
  - `src/components/opportunities/StageStepper.tsx`
  - `src/components/opportunities/StageBadge.tsx`
  - `src/components/opportunities/WonLostDialog.tsx`
  - `src/components/opportunities/OpportunityKanbanCard.tsx`
  - `src/components/opportunities/ProposalEditor.tsx`
  - `src/components/opportunities/PaymentPlanEditor.tsx`
  - `src/components/opportunities/NeedAnalysisForm.tsx`
- **Modified:**
  - `src/App.tsx` (routes)
  - `src/components/layout/Sidebar.tsx` (new section)
  - `src/pages/OwnerDashboard.tsx` (pipeline KPIs)
  - `src/pages/AgentDashboard.tsx` ("my opps" card)
  - `src/pages/Leads.tsx` (link to opp when converted)
  - `src/pages/ContactDetail.tsx` (Convert-to-Opp dialog from doc 01)
  - `src/pages/MeetingBrief.tsx`, `src/pages/MeetingNotes.tsx` (accept opp id)
  - `src/pages/admin/AdminAutomationTriggers.tsx`, `AdminAutomationActivity.tsx` (new row types)
