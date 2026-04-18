# 03 — Lead enrichment and closing cycle

This is the vertical slice that takes the product from "pretty mockup" to "real CRM you can run a week on". Every user action below is mapped to the exact tables it writes.

```
Add lead ──► enrich ──► mark Qualified ──► Convert to opportunity
   ▼                                          ▼
leads                                      opportunities
                                              │
                   ┌──────────────────────────┼──────────────────────────┐
                   ▼                          ▼                          ▼
             Qualification              Need Analysis                Proposal
           opportunity_qualification  opportunity_need_analysis    proposals (+ line items)
           + competing + risk_flags   + goals + metrics + criteria
                                      + stakeholders
                   │                          │                          │
                   ▼                          ▼                          ▼
              Negotiation              Closing                    Won   / Lost
            opportunity_objections   payments + contract_url    opportunities.outcome
                                     (storage: contracts/…)     + loss_reason / won_detail
                                                                 + stage_transition row
```

---

## 3.1 Pages and the tables they touch

| Page | Purpose | Reads | Writes |
|---|---|---|---|
| `Leads.tsx` | List / board | `leads`, `profiles` (assignee name) | — |
| `Leads.tsx` → **Add lead** dialog | Create lead | — | `leads` |
| `ContactDetail.tsx` | Lead detail | `leads`, `lead_tags`, `lead_pain_points`, `conversations`, `messages`, `meeting_briefs`, `meeting_notes` | `leads`, `lead_tags`, `lead_pain_points`, `conversations.automation_paused` |
| `ContactDetail.tsx` → **Re-enrich** | Fill enrichment | — | `leads` (enrichment columns + `enriched_at`) |
| `ContactDetail.tsx` → **Convert to opportunity** | Promote | `leads` | `opportunities`, `leads.converted_opportunity_id`, `leads.ai_status='completed'`, `opportunity_stage_transitions` |
| `Opportunities.tsx` (list) | Index | `opportunities`, `profiles` | — |
| `OpportunitiesBoard.tsx` | Kanban | `opportunities` | `opportunities.stage` + `opportunity_stage_transitions` on drop |
| `OpportunityDetail.tsx` | Hub + stepper | `opportunities`, `opportunity_stage_transitions` | `opportunities.next_step_*`, `opportunities.stage` (via stepper) |
| `OpportunityQualification.tsx` | BANT form | `opportunity_qualification`, `opportunity_competing_solutions`, `opportunity_risk_flags` | same |
| `OpportunityNeedAnalysis.tsx` | Deep dive | `opportunity_need_analysis`, `opportunity_goals`, `opportunity_metrics_to_move`, `opportunity_decision_criteria`, `opportunity_stakeholders` | same |
| `OpportunityProposal.tsx` | Versions + send | `proposals`, `proposal_line_items` | same; marks previous active proposal `superseded` |
| `OpportunityNegotiation.tsx` | Objections log + payment plan | `opportunity_objections`, `payments` | same |
| `OpportunityClosing.tsx` | Payments + contract | `payments`, `opportunities.contract_url`, `opportunities.payment_status` | same + upload to `contracts` bucket |
| `WonLostDialog` | Finalize | — | `opportunities.outcome`, `stage`, `loss_reason`, `loss_detail`, `won_detail`, `opportunity_stage_transitions` |
| `MeetingBrief.tsx` | Brief generator | `meeting_briefs`, `leads` / `opportunities` | `meeting_briefs` |
| `MeetingNotes.tsx` | Post-meeting | `meeting_notes` | `meeting_notes` + upload to `voice-notes` bucket |

---

## 3.2 Mutation recipes (copy-paste)

### Create lead

```ts
await supabase.from('leads').insert({
  name, phone, email, channel, source,
  assigned_to: user.id,                  // optional; admin may pick someone else
  stage: 'new', ai_status: 'paused',
}).select().single();
```

Tags / pain points live in child tables:

```ts
await supabase.from('lead_tags').insert(tags.map(tag => ({ lead_id, tag })));
await supabase.from('lead_pain_points').insert(points.map(point => ({ lead_id, point })));
```

### Re-enrich a lead

```ts
await supabase.from('leads').update({
  company, company_role, company_size, industry,
  country, city, budget_range, timeline,
  qualification_score,
  enriched_at: new Date().toISOString(),
}).eq('id', leadId);
```

### Convert to opportunity

Run as a **single RPC** so the two writes can't drift. Add this function to `schema.sql` (or as a follow-up migration):

```sql
create or replace function public.convert_lead_to_opportunity(
  p_lead_id uuid,
  p_name text,
  p_value numeric default 0
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_opp_id uuid; v_org uuid; v_owner uuid; v_contact text; v_channel text;
begin
  select org_id, assigned_to, name, channel
    into v_org, v_owner, v_contact, v_channel
    from public.leads where id = p_lead_id;
  if v_org is null then raise exception 'Lead not found'; end if;

  insert into public.opportunities (org_id, lead_id, owner_id, name, contact_name, channel, value)
  values (v_org, p_lead_id, coalesce(v_owner, auth.uid()), p_name, v_contact, v_channel, coalesce(p_value, 0))
  returning id into v_opp_id;

  update public.leads
    set converted_opportunity_id = v_opp_id,
        ai_status = 'completed',
        stage = 'qualified'
    where id = p_lead_id;

  insert into public.opportunity_stage_transitions (opportunity_id, from_stage, to_stage, by)
  values (v_opp_id, 'qualification', 'qualification', auth.uid());

  return v_opp_id;
end;
$$;
```

Client:

```ts
const { data: oppId, error } = await supabase.rpc('convert_lead_to_opportunity', {
  p_lead_id: lead.id,
  p_name: `${lead.name} — ${lead.company ?? 'Opportunity'}`,
  p_value: estimatedValue ?? 0,
});
```

### Advance an opportunity stage

Always write a transition row so the timeline stays complete:

```ts
async function moveStage(oppId: string, from: Stage, to: Stage, note?: string) {
  const { error: e1 } = await supabase.from('opportunities')
    .update({ stage: to, stage_entered_at: new Date().toISOString() })
    .eq('id', oppId);
  if (e1) throw e1;

  const { error: e2 } = await supabase.from('opportunity_stage_transitions').insert({
    opportunity_id: oppId, from_stage: from, to_stage: to, note,
  });
  if (e2) throw e2;
}
```

Use client-side `canAdvance(opp, to)` (from `src/lib/pipeline.ts`) to gate this call.

### Save proposal (versioned)

```ts
// supersede any currently active one
await supabase.from('proposals')
  .update({ status: 'superseded' })
  .eq('opportunity_id', oppId)
  .in('status', ['draft', 'sent']);

const { data: proposal } = await supabase.from('proposals').insert({
  opportunity_id: oppId,
  version: nextVersion,
  title, value, valid_until, notes,
  status: 'draft',
}).select().single();

await supabase.from('proposal_line_items').insert(
  lineItems.map(li => ({ proposal_id: proposal!.id, ...li }))
);
```

When the user hits **Send**, update `status='sent'` and stamp `sent_at`.

### Record a payment

```ts
await supabase.from('payments').insert({
  opportunity_id: oppId,
  amount, method, reference, received_at, due_date,
  status: 'paid',
});
```

After every insert/update, recompute `opportunities.payment_status` client-side (sum of paid vs proposal value) and write it back. Keep this in `src/lib/pipeline.ts` so the logic is one place.

### Upload contract

```ts
const path = await uploadPrivate('contracts', orgId, `${oppId}/${file.name}`, file);
await supabase.from('opportunities').update({ contract_url: path }).eq('id', oppId);
```

Render the contract by requesting a signed URL on demand (`getSignedUrl('contracts', path)`).

### Mark Won / Lost

```ts
await supabase.from('opportunities').update({
  outcome,                           // 'won' | 'lost'
  stage: outcome,                    // same token by design
  loss_reason: outcome === 'lost' ? lossReason : null,
  loss_detail: outcome === 'lost' ? lossDetail : null,
  won_detail:  outcome === 'won'  ? wonDetail  : null,
  payment_status: outcome === 'won' ? 'paid' : undefined,
}).eq('id', oppId);

await supabase.from('opportunity_stage_transitions').insert({
  opportunity_id: oppId, from_stage: currentStage, to_stage: outcome,
});
```

### Meeting note with voice

```ts
const { data: row } = await supabase.from('meeting_notes').insert({
  lead_id: leadId, opportunity_id: oppId ?? null,
  summary, objections, opportunities_found, next_steps,
}).select().single();

if (voiceBlob) {
  const path = await uploadPrivate('voice-notes', orgId, `${row!.id}.webm`, voiceBlob);
  await supabase.from('meeting_notes').update({ voice_file_url: path }).eq('id', row!.id);
}
```

---

## 3.3 Page-by-page wiring order (the cheap version)

Day-by-day this is ~3 days focused work:

1. **Leads list + Add lead dialog** — fastest feedback loop, proves the stack.
2. **Contact detail (read)** → **enrichment editor** → tags / pain points.
3. **Convert to Opportunity** via the RPC.
4. **Opportunities list + board** (read-only first, then drag-to-move).
5. **Opportunity detail shell** + stepper (reads transitions).
6. **Qualification + Need Analysis forms** (simple upsert patterns).
7. **Proposal editor** (version bump + line items).
8. **Negotiation** (objections) + **Closing** (payments + contract upload).
9. **Won / Lost dialog**.
10. **Meetings** (brief + notes + voice upload).

---

## 3.4 Acceptance demo

Sign in as a fresh admin → everything empty. Run through:

1. `/leads` → **Add lead** → "Amine Derbel / +213 666 / WhatsApp".
2. Open it → fill enrichment → add 2 tags, 1 pain point → save.
3. **Convert to Opportunity** → land on `/opportunities/<id>`.
4. Qualification → Need Analysis → Proposal (add line items, send) → Negotiation (log 1 objection + one partial payment) → Closing (upload a PDF contract, record final payment).
5. **Mark Won** → the lead card on `/leads` now shows "View opportunity →"; the opportunity appears on the Won column of the board; dashboards update.
6. Record a meeting note with a voice blob → file lands in `voice-notes/<org_id>/<note_id>.webm`.

Open the Supabase Table Editor after the demo — every row matches what you typed in the UI.
