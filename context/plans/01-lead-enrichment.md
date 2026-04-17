# 01 — Lead Enrichment

Goal: before a lead can become an opportunity, the record has to be rich enough to act on. Today `Lead` only has name / phone / channel / stage / aiStatus / assignedTo / lastContact / dealValue? / source? / notes? / closeDate? / tags?. That's too thin.

This doc upgrades the **existing** `Leads.tsx` and `ContactDetail.tsx` pages — no new routes, no new sidebar items. One new modal and one expanded sidebar panel.

---

## 1.1 Expand the `Lead` type

**File:** `src/lib/types.ts`

Add these fields to `Lead` (all optional — backwards-compat with existing mock data):

```ts
export type LeadQualificationScore = 'cold' | 'warm' | 'hot';
export type CompanySize = 'solo' | '2-10' | '11-50' | '51-200' | '200+';
export type LeadTemperature = 'cold' | 'warm' | 'hot';

export interface Lead {
  // …existing fields…

  // — Contact enrichment —
  email?: string;
  whatsapp?: string;        // separate from phone because some regions split these
  instagramHandle?: string;
  facebookHandle?: string;
  website?: string;
  linkedin?: string;

  // — Company enrichment —
  company?: string;
  companyRole?: string;     // job title
  companySize?: CompanySize;
  industry?: string;
  location?: { country?: string; city?: string };

  // — Qualification hints (BANT-ish, kept light) —
  budgetRange?: string;     // free text: "40-80k DZD/mo"
  timeline?: string;        // free text: "Next 2 weeks"
  painPoints?: string[];
  qualificationScore?: LeadQualificationScore;

  // — Lifecycle bookkeeping —
  createdAt?: string;
  enrichedAt?: string;
  convertedOpportunityId?: string;  // set when we create an Opportunity from this lead
}
```

Leave the existing `Stage` union as-is (`new | contacted | qualified | proposal | closed`). When a lead is converted, its stage is set to `qualified` AND an `Opportunity` is created — from that point forward, the pipeline UI lives on the opportunity side (see doc 02). The `proposal` and `closed` values on `Lead.stage` become legacy / read-only.

---

## 1.2 Update mock data

**File:** `src/lib/mock-data.ts`

- Backfill 3-4 of the existing `MOCK_LEADS` entries with the new enrichment fields (e-commerce seller, education center director, freelancer, SMB owner — matches the personas in `replit_automation_agents_full_prompt.md`).
- Add 2 brand-new leads where `enrichedAt` is unset — so the UI can render the **"Enrichment incomplete"** state.
- Add one lead with `convertedOpportunityId` set, pointing to an entry we'll add in `MOCK_OPPORTUNITIES` (doc 02).

---

## 1.3 New UI — enrichment side panel on Contact Detail

**File:** `src/pages/ContactDetail.tsx` (modify, don't fork)

Current layout is 3-column: conversation (55%) | aside (deal card + meeting + history). We add a **collapsible Enrichment card** at the top of the aside, above "Deal":

```
┌─ Enrichment ──────────────────── [Edit] ─┐
│ Email       karim@bigretail.dz           │
│ Company     BigRetail · 11-50 employees  │
│ Role        Head of Ops                  │
│ Website     bigretail.dz ↗               │
│ Location    Algiers, DZ                  │
│ Socials     @bigretail  · LinkedIn ↗     │
│                                          │
│ Pain points                              │
│   • Slow WhatsApp replies                │
│   • No visibility on team performance    │
│                                          │
│ Budget      40-80k DZD/mo                │
│ Timeline    Next 2 weeks                 │
│ Score       [Hot]                        │
│                                          │
│ ─────────────────────────────────────    │
│ Last enriched · 3 days ago               │
│ [Re-enrich with assistant]  (button)     │
└──────────────────────────────────────────┘
```

- **Edit** opens the `<EnrichmentDialog>` (below).
- **Re-enrich with assistant** is a stub button today — when clicked, it calls a mock function that fills in `company`, `industry`, `companySize`, and `painPoints` based on the email domain. Show a spinner for 1.2s then populate. This is the scaffolding for real enrichment later (email → Clearbit/Apollo/Hunter).
- When the lead has **no enrichment data** (no email, no company), render an **EmptyState** inside the card: _"No enrichment yet — add contact details or run the assistant."_ with two CTAs.

### `<EnrichmentDialog>` component

**File (new):** `src/components/leads/EnrichmentDialog.tsx`

- Controlled modal (use existing `Dialog` primitive from `src/components/ui/` — same as `AdminTemplates` editor modal).
- Sections, each collapsible:
  1. **Contact** — email, WhatsApp, Instagram, Facebook, LinkedIn, website
  2. **Company** — company name, role, size (radio cards `solo / 2-10 / 11-50 / 51-200 / 200+`), industry (free text with datalist of common values), country + city
  3. **Qualification** — budget range (text), timeline (text), pain points (`TagInput`), qualification score (radio: `Cold · Warm · Hot`)
  4. **Tags** — existing `TagInput`
- Primary action: **Save changes** — updates the lead in-memory (no API), sets `enrichedAt = now()`.
- Secondary action: **Cancel**
- Tertiary: **Run assistant** (top-right) — same mock enrichment as the aside button.

### Copy rules

- The button label is **"Re-enrich with assistant"** — not "AI enrich" (per design-system rule).
- The status strip at the bottom is **"Last enriched · 3 days ago"** — not "Last AI enriched".

---

## 1.4 New UI — enrichment hints on the Leads list

**File:** `src/pages/Leads.tsx` (modify)

Two small additions:

1. **Kanban cards** get a third line when enrichment is missing:
   - If `enrichedAt` is unset **or** `email` / `company` are missing:
     render a tiny chip `[Enrichment incomplete]` below the name (muted border, `#E4E4E8`, no background, 11px).
2. **List view** gets a new column `Score` (Cold / Warm / Hot) after `Stage`.
   Use `ScaleBadge` with:
   - `Cold` → neutral grey
   - `Warm` → amber (use `#C77A00` text on `#FFF5E5` bg — add to `.scale-*` tokens if missing)
   - `Hot` → accent blue (use the existing `.ai-active` treatment)

Toolbar: add a second filter **"Enrichment: All · Complete · Incomplete"** next to the existing stage / channel filters.

---

## 1.5 Convert-to-Opportunity action

This is the bridge to doc 02. It lives on the `ContactDetail` page header.

**Placement:** header action bar (next to existing "Generate brief" / "Take over" / Stage selector).

**Button:** `Convert to Opportunity` — **disabled** when `stage != 'qualified'` with a tooltip: _"Mark this lead as Qualified first."_

**On click:** open `<ConvertToOpportunityDialog>`:

- Pre-fills from the lead: name, company, channel, assignedTo, dealValue, painPoints → opportunity `needSummary`.
- Required: **Deal name** (default: `{company ?? name}`), **Expected value DZD** (from lead.dealValue), **Expected close date**, **Source** (pre-filled), **Stage** (locked to `qualification`).
- On save: push to `MOCK_OPPORTUNITIES`, set `lead.convertedOpportunityId`, redirect to `/opportunities/:id`.

If the lead is **already converted** (`convertedOpportunityId` set), the button becomes `Open Opportunity →` and links straight to `/opportunities/:id`.

---

## 1.6 Automation hand-off (no-op but wired)

Once the opportunity is created, the Lead Follow-Up agent on this contact should switch off automatically (so we don't spam a qualified prospect with "are you still there?" messages).

- In `mock-data.ts`, flip `lead.aiStatus` to `completed` when `convertedOpportunityId` is set.
- The **Automation activity log** (`/admin/automation/activity`) gets a new row type **"Converted to opportunity"** — add it to the filter dropdown and the table.
- No change to the agents' admin pages.

---

## 1.7 Acceptance criteria

- [ ] `Lead` type carries every new field; no TypeScript errors across the codebase.
- [ ] 2+ existing mock leads show complete enrichment; 2+ show the incomplete state.
- [ ] Contact Detail aside has an **Enrichment** card that matches the spec above.
- [ ] Clicking **Edit** opens a modal with 4 collapsible sections; saving updates the in-memory lead and sets `enrichedAt`.
- [ ] The **Re-enrich with assistant** button fills in company/industry/pain points from the email domain after a simulated 1.2s wait (deterministic mock).
- [ ] Leads list shows `Enrichment incomplete` chip on kanban cards and a `Score` column in list view.
- [ ] Convert-to-Opportunity button is disabled unless stage is `qualified`; when clicked, it creates the opportunity and redirects to `/opportunities/:id`.
- [ ] The word "AI" does not appear in any new user-facing string.

---

## 1.8 Touches

- **Types:** `src/lib/types.ts`
- **Mock data:** `src/lib/mock-data.ts`
- **Pages modified:** `src/pages/Leads.tsx`, `src/pages/ContactDetail.tsx`
- **New components:**
  - `src/components/leads/EnrichmentCard.tsx` (aside block)
  - `src/components/leads/EnrichmentDialog.tsx` (modal)
  - `src/components/leads/ConvertToOpportunityDialog.tsx` (modal)
- **Design-system:** Add `warm` and `hot` badge variants to `ScaleBadge` if not already present.
- **No new routes or sidebar items.**
