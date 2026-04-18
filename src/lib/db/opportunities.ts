import { getSupabase } from '@/lib/supabase';
import type {
  Channel,
  NeedAnalysis,
  Opportunity,
  OpportunityStage,
  Payment,
  Proposal,
  QualificationAnswers,
  StageTransition,
} from '@/lib/types';
import { channelFromDb, channelToDb } from '@/lib/db/map-common';
import { derivePaymentStatus } from '@/lib/pipeline';

type ORow = Record<string, unknown> & {
  id: string;
  lead_id: string | null;
  owner_id: string | null;
  name: string;
  company: string | null;
  contact_name: string;
  channel: string;
  stage: string;
  outcome: string;
  value: number;
  currency: string;
  expected_close_date: string | null;
  probability: number | null;
  payment_status: string;
  loss_reason: string | null;
  loss_detail: string | null;
  won_detail: string | null;
  next_step_at: string | null;
  next_step_text: string | null;
  contract_url: string | null;
  onboarding_owner_id: string | null;
  onboarding_date: string | null;
  onboarding_notes: string | null;
  stage_entered_at: string;
  created_at: string;
  updated_at: string;
  owner?: { id: string; name: string } | null;
  opportunity_tags?: { tag: string }[] | null;
  opportunity_qualification?: {
    budget: string | null;
    authority: string | null;
    need: string | null;
    timeline: string | null;
  } | null;
  opportunity_competing_solutions?: { solution: string }[] | null;
  opportunity_risk_flags?: { flag: string }[] | null;
  opportunity_need_analysis?: { summary: string | null; proposed_solution: string | null } | null;
  opportunity_goals?: { label: string }[] | null;
  opportunity_metrics_to_move?: { label: string }[] | null;
  opportunity_decision_criteria?: { label: string }[] | null;
  opportunity_stakeholders?: { name: string; role: string }[] | null;
  proposals?: (ProposalRow & { proposal_line_items?: LineRow[] | null })[] | null;
  payments?: PaymentRow[] | null;
  opportunity_stage_transitions?: TransRow[] | null;
  opportunity_objections?: ObjRow[] | null;
};

type LineRow = {
  id: string;
  name: string;
  qty: number;
  unit_price: number;
  discount_pct: number;
};

type ProposalRow = {
  id: string;
  version: number;
  title: string;
  value: number;
  currency: string;
  valid_until: string | null;
  file_url: string | null;
  link_url: string | null;
  notes: string | null;
  status: string;
  sent_at: string | null;
  created_at: string;
};

type PaymentRow = {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  received_at: string | null;
  due_date: string | null;
  status: string;
  note: string | null;
  created_at: string;
};

type TransRow = {
  from_stage: string;
  to_stage: string;
  at: string;
  by: string | null;
  note: string | null;
};

type ObjRow = { at: string; note: string; value_delta: number | null };

function mapProposal(p: ProposalRow, lines: LineRow[] | null | undefined): Proposal {
  return {
    id: p.id,
    version: p.version,
    title: p.title,
    value: Number(p.value),
    currency: p.currency as Proposal['currency'],
    validUntil: p.valid_until ?? undefined,
    fileUrl: p.file_url ?? undefined,
    linkUrl: p.link_url ?? undefined,
    notes: p.notes ?? undefined,
    status: p.status as Proposal['status'],
    sentAt: p.sent_at ?? undefined,
    createdAt: p.created_at,
    lineItems: (lines ?? []).map(l => ({
      name: l.name,
      qty: Number(l.qty),
      unitPrice: Number(l.unit_price),
      discountPct: Number(l.discount_pct) || undefined,
    })),
  };
}

function mapPayment(p: PaymentRow): Payment {
  return {
    id: p.id,
    amount: Number(p.amount),
    method: p.method as Payment['method'],
    reference: p.reference ?? undefined,
    receivedAt: p.received_at ?? undefined,
    dueDate: p.due_date ?? undefined,
    status: p.status as Payment['status'],
    note: p.note ?? undefined,
  };
}

function rowToOpportunity(r: ORow): Opportunity {
  const tags = r.opportunity_tags?.map(t => t.tag) ?? [];
  const qual = r.opportunity_qualification;
  const qualification: QualificationAnswers | undefined = qual
    ? {
        budget: qual.budget ?? undefined,
        authority: qual.authority ?? undefined,
        need: qual.need ?? undefined,
        timeline: qual.timeline ?? undefined,
        competingSolutions: r.opportunity_competing_solutions?.map(x => x.solution),
        riskFlags: r.opportunity_risk_flags?.map(x => x.flag),
      }
    : undefined;

  const na = r.opportunity_need_analysis;
  const needAnalysis: NeedAnalysis | undefined = na
    ? {
        summary: na.summary ?? '',
        goals: r.opportunity_goals?.map(g => g.label) ?? [],
        metricsToMove: r.opportunity_metrics_to_move?.map(m => m.label) ?? [],
        decisionCriteria: r.opportunity_decision_criteria?.map(d => d.label) ?? [],
        stakeholders: (r.opportunity_stakeholders ?? []).map(s => ({ name: s.name, role: s.role })),
        proposedSolution: na.proposed_solution ?? undefined,
      }
    : undefined;

  const proposals = (r.proposals ?? [])
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(p => mapProposal(p, p.proposal_line_items ?? []));

  const payments = (r.payments ?? []).map(mapPayment);
  const stageHistory: StageTransition[] = (r.opportunity_stage_transitions ?? [])
    .slice()
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .map(t => ({
      from: t.from_stage as OpportunityStage,
      to: t.to_stage as OpportunityStage,
      at: t.at,
      by: t.by ?? '',
      note: t.note ?? undefined,
    }));

  const objectionLog = (r.opportunity_objections ?? []).map(o => ({
    at: o.at,
    note: o.note,
    valueDelta: o.value_delta ?? undefined,
  }));

  return {
    id: r.id,
    leadId: r.lead_id ?? '',
    name: r.name,
    company: r.company ?? undefined,
    contactName: r.contact_name,
    channel: channelFromDb(r.channel) as Channel,
    ownerId: r.owner_id ?? '',
    ownerName: r.owner?.name,
    stage: r.stage as Opportunity['stage'],
    outcome: r.outcome as Opportunity['outcome'],
    value: Number(r.value),
    currency: r.currency as Opportunity['currency'],
    expectedCloseDate: r.expected_close_date ?? undefined,
    probability: r.probability ?? undefined,
    qualification,
    needAnalysis,
    proposals,
    payments,
    paymentStatus: derivePaymentStatus(payments),
    lossReason: (r.loss_reason as Opportunity['lossReason']) ?? undefined,
    lossDetail: r.loss_detail ?? undefined,
    wonDetail: r.won_detail ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    stageEnteredAt: r.stage_entered_at,
    nextStepAt: r.next_step_at ?? undefined,
    nextStepText: r.next_step_text ?? undefined,
    tags: tags.length ? tags : undefined,
    objectionLog: objectionLog.length ? objectionLog : undefined,
    contractUrl: r.contract_url ?? undefined,
    onboardingOwnerId: r.onboarding_owner_id ?? undefined,
    onboardingDate: r.onboarding_date ?? undefined,
    onboardingNotes: r.onboarding_notes ?? undefined,
    stageHistory,
  };
}

const oppSelect = `
  *,
  owner:profiles!opportunities_owner_id_fkey(id, name),
  opportunity_tags(tag),
  opportunity_qualification(budget, authority, need, timeline),
  opportunity_competing_solutions(solution),
  opportunity_risk_flags(flag),
  opportunity_need_analysis(summary, proposed_solution),
  opportunity_goals(label),
  opportunity_metrics_to_move(label),
  opportunity_decision_criteria(label),
  opportunity_stakeholders(name, role),
  proposals(
    id, version, title, value, currency, valid_until, file_url, link_url, notes, status, sent_at, created_at,
    proposal_line_items(id, name, qty, unit_price, discount_pct)
  ),
  payments(id, amount, method, reference, received_at, due_date, status, note, created_at),
  opportunity_stage_transitions(from_stage, to_stage, at, by, note),
  opportunity_objections(at, note, value_delta)
`;

export async function listOpportunities(): Promise<Opportunity[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('opportunities').select(oppSelect).order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as ORow[] | null)?.map(rowToOpportunity) ?? [];
}

async function deleteNested(supabase: ReturnType<typeof getSupabase>, opportunityId: string) {
  const { data: propRows } = await supabase.from('proposals').select('id').eq('opportunity_id', opportunityId);
  const propIds = propRows?.map(p => p.id as string) ?? [];
  if (propIds.length) {
    await supabase.from('proposal_line_items').delete().in('proposal_id', propIds);
  }
  await supabase.from('proposals').delete().eq('opportunity_id', opportunityId);
  await supabase.from('payments').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_objections').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_stage_transitions').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_stakeholders').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_decision_criteria').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_metrics_to_move').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_goals').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_competing_solutions').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_risk_flags').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_qualification').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_need_analysis').delete().eq('opportunity_id', opportunityId);
  await supabase.from('opportunity_tags').delete().eq('opportunity_id', opportunityId);
}

async function insertNested(supabase: ReturnType<typeof getSupabase>, opportunityId: string, opp: Opportunity) {
  if (opp.tags?.length) {
    await supabase.from('opportunity_tags').insert(opp.tags.map(tag => ({ opportunity_id: opportunityId, tag })));
  }
  const q = opp.qualification;
  if (q) {
    await supabase.from('opportunity_qualification').insert({
      opportunity_id: opportunityId,
      budget: q.budget ?? null,
      authority: q.authority ?? null,
      need: q.need ?? null,
      timeline: q.timeline ?? null,
    });
    if (q.competingSolutions?.length) {
      await supabase
        .from('opportunity_competing_solutions')
        .insert(q.competingSolutions.map(solution => ({ opportunity_id: opportunityId, solution })));
    }
    if (q.riskFlags?.length) {
      await supabase.from('opportunity_risk_flags').insert(q.riskFlags.map(flag => ({ opportunity_id: opportunityId, flag })));
    }
  }
  const na = opp.needAnalysis;
  if (na) {
    await supabase.from('opportunity_need_analysis').insert({
      opportunity_id: opportunityId,
      summary: na.summary,
      proposed_solution: na.proposedSolution ?? null,
    });
    for (const label of na.goals ?? []) {
      await supabase.from('opportunity_goals').insert({ opportunity_id: opportunityId, label });
    }
    for (const label of na.metricsToMove ?? []) {
      await supabase.from('opportunity_metrics_to_move').insert({ opportunity_id: opportunityId, label });
    }
    for (const label of na.decisionCriteria ?? []) {
      await supabase.from('opportunity_decision_criteria').insert({ opportunity_id: opportunityId, label });
    }
    for (const s of na.stakeholders ?? []) {
      await supabase.from('opportunity_stakeholders').insert({
        opportunity_id: opportunityId,
        name: s.name,
        role: s.role,
      });
    }
  }
  for (const t of opp.stageHistory ?? []) {
    await supabase.from('opportunity_stage_transitions').insert({
      opportunity_id: opportunityId,
      from_stage: t.from,
      to_stage: t.to,
      at: t.at,
      by: t.by || null,
      note: t.note ?? null,
    });
  }
  for (const o of opp.objectionLog ?? []) {
    await supabase.from('opportunity_objections').insert({
      opportunity_id: opportunityId,
      at: o.at,
      note: o.note,
      value_delta: o.valueDelta ?? null,
    });
  }
  for (const pr of opp.proposals ?? []) {
    const { data: prow, error } = await supabase
      .from('proposals')
      .insert({
        opportunity_id: opportunityId,
        version: pr.version,
        title: pr.title,
        value: pr.value,
        currency: pr.currency,
        valid_until: pr.validUntil ?? null,
        file_url: pr.fileUrl ?? null,
        link_url: pr.linkUrl ?? null,
        notes: pr.notes ?? null,
        status: pr.status,
        sent_at: pr.sentAt ?? null,
        created_at: pr.createdAt,
      })
      .select('id')
      .single();
    if (error) throw error;
    const pid = prow.id as string;
    for (const li of pr.lineItems ?? []) {
      await supabase.from('proposal_line_items').insert({
        proposal_id: pid,
        name: li.name,
        qty: li.qty,
        unit_price: li.unitPrice,
        discount_pct: li.discountPct ?? 0,
      });
    }
  }
  for (const pay of opp.payments ?? []) {
    await supabase.from('payments').insert({
      opportunity_id: opportunityId,
      amount: pay.amount,
      method: pay.method,
      reference: pay.reference ?? null,
      received_at: pay.receivedAt ?? null,
      due_date: pay.dueDate ?? null,
      status: pay.status,
      note: pay.note ?? null,
    });
  }
}

export async function insertOpportunity(orgId: string, opp: Opportunity): Promise<string> {
  const supabase = getSupabase();
  const payStatus = opp.payments?.length ? derivePaymentStatus(opp.payments) : opp.paymentStatus;
  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      org_id: orgId,
      lead_id: opp.leadId || null,
      owner_id: opp.ownerId || null,
      name: opp.name,
      company: opp.company ?? null,
      contact_name: opp.contactName,
      channel: channelToDb(opp.channel),
      stage: opp.stage,
      outcome: opp.outcome,
      value: opp.value,
      currency: opp.currency,
      expected_close_date: opp.expectedCloseDate ?? null,
      probability: opp.probability ?? null,
      payment_status: payStatus,
      loss_reason: opp.lossReason ?? null,
      loss_detail: opp.lossDetail ?? null,
      won_detail: opp.wonDetail ?? null,
      next_step_at: opp.nextStepAt ?? null,
      next_step_text: opp.nextStepText ?? null,
      contract_url: opp.contractUrl ?? null,
      onboarding_owner_id: opp.onboardingOwnerId ?? null,
      onboarding_date: opp.onboardingDate ?? null,
      onboarding_notes: opp.onboardingNotes ?? null,
      stage_entered_at: opp.stageEnteredAt,
      created_at: opp.createdAt,
      updated_at: opp.updatedAt,
    })
    .select('id')
    .single();
  if (error) throw error;
  const id = data.id as string;
  await insertNested(getSupabase(), id, opp);
  return id;
}

export async function syncOpportunity(opp: Opportunity): Promise<void> {
  const supabase = getSupabase();
  const payStatus = derivePaymentStatus(opp.payments ?? []);
  const { error } = await supabase
    .from('opportunities')
    .update({
      lead_id: opp.leadId || null,
      owner_id: opp.ownerId || null,
      name: opp.name,
      company: opp.company ?? null,
      contact_name: opp.contactName,
      channel: channelToDb(opp.channel),
      stage: opp.stage,
      outcome: opp.outcome,
      value: opp.value,
      currency: opp.currency,
      expected_close_date: opp.expectedCloseDate ?? null,
      probability: opp.probability ?? null,
      payment_status: payStatus,
      loss_reason: opp.lossReason ?? null,
      loss_detail: opp.lossDetail ?? null,
      won_detail: opp.wonDetail ?? null,
      next_step_at: opp.nextStepAt ?? null,
      next_step_text: opp.nextStepText ?? null,
      contract_url: opp.contractUrl ?? null,
      onboarding_owner_id: opp.onboardingOwnerId ?? null,
      onboarding_date: opp.onboardingDate ?? null,
      onboarding_notes: opp.onboardingNotes ?? null,
      stage_entered_at: opp.stageEnteredAt,
      updated_at: opp.updatedAt,
    })
    .eq('id', opp.id);
  if (error) throw error;
  await deleteNested(supabase, opp.id);
  await insertNested(supabase, opp.id, opp);
}
