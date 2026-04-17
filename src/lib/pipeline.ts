import type { Opportunity, OpportunityStage, Payment, PaymentStatus } from './types';

export const OPPORTUNITY_STAGE_ORDER: OpportunityStage[] = [
  'qualification',
  'need_analysis',
  'proposal',
  'negotiation',
  'closing',
  'won',
  'lost',
];

export const DEFAULT_PROBABILITY: Record<OpportunityStage, number> = {
  qualification: 20,
  need_analysis: 40,
  proposal: 60,
  negotiation: 75,
  closing: 90,
  won: 100,
  lost: 0,
};

/** Green / amber / red day thresholds per stage (green max, amber max). */
export const STAGE_SLA_DAYS: Record<
  Exclude<OpportunityStage, 'won' | 'lost'>,
  { green: number; amber: number }
> = {
  qualification: { green: 3, amber: 7 },
  need_analysis: { green: 5, amber: 10 },
  proposal: { green: 7, amber: 14 },
  negotiation: { green: 7, amber: 14 },
  closing: { green: 3, amber: 7 },
};

export const LEGAL_NEXT: Record<OpportunityStage, OpportunityStage[]> = {
  qualification: ['need_analysis', 'proposal', 'won', 'lost'],
  need_analysis: ['proposal', 'won', 'lost'],
  proposal: ['negotiation', 'won', 'lost'],
  negotiation: ['closing', 'won', 'lost'],
  closing: ['won', 'lost'],
  won: [],
  lost: [],
};

export function stageLabel(stage: OpportunityStage): string {
  const labels: Record<OpportunityStage, string> = {
    qualification: 'Qualification',
    need_analysis: 'Need analysis',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closing: 'Closing',
    won: 'Won',
    lost: 'Lost',
  };
  return labels[stage];
}

export function daysInStage(stageEnteredAt: string, now = new Date()): number {
  const start = new Date(stageEnteredAt).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((now.getTime() - start) / (1000 * 60 * 60 * 24)));
}

export function slaTone(
  stage: OpportunityStage,
  stageEnteredAt: string,
  now = new Date()
): 'neutral' | 'amber' | 'red' {
  if (stage === 'won' || stage === 'lost') return 'neutral';
  const days = daysInStage(stageEnteredAt, now);
  const cfg = STAGE_SLA_DAYS[stage];
  if (days > cfg.amber) return 'red';
  if (days > cfg.green) return 'amber';
  return 'neutral';
}

export function derivePaymentStatus(payments: Payment[]): PaymentStatus {
  if (!payments.length) return 'pending';
  const paid = payments.filter(p => p.status === 'paid').length;
  const pendingLike = payments.filter(p => p.status === 'pending' || p.status === 'partially_paid').length;
  if (paid === payments.length) return 'paid';
  if (paid > 0 && pendingLike > 0) return 'partially_paid';
  if (paid > 0) return 'paid';
  return 'pending';
}

export function canAdvance(
  opp: Opportunity,
  to: OpportunityStage
): { ok: boolean; reason?: string } {
  const from = opp.stage;
  if (from === 'won' || from === 'lost') {
    return { ok: false, reason: 'This opportunity is already closed.' };
  }
  const allowed = LEGAL_NEXT[from];
  if (!allowed.includes(to)) {
    return { ok: false, reason: 'Not a legal transition from the current stage.' };
  }

  if (to === 'negotiation') {
    const hasSent = opp.proposals.some(p => p.status === 'sent' || p.status === 'accepted');
    if (!hasSent) {
      return { ok: false, reason: 'Send a proposal before moving to Negotiation.' };
    }
  }

  if (to === 'closing') {
    const hasPlan = opp.payments.some(
      p => p.status === 'pending' || p.status === 'partially_paid' || p.status === 'paid'
    );
    if (!hasPlan) {
      return { ok: false, reason: 'Add a payment plan before moving to Closing.' };
    }
  }

  if (to === 'won') {
    const earlyWinStages: OpportunityStage[] = ['qualification', 'need_analysis', 'proposal'];
    if (!earlyWinStages.includes(from) && opp.paymentStatus !== 'paid') {
      return { ok: false, reason: 'Mark all payments as paid before Won.' };
    }
  }

  return { ok: true };
}

export function opportunityProbability(opp: Opportunity): number {
  if (opp.probability != null) return opp.probability;
  return DEFAULT_PROBABILITY[opp.stage];
}

export function legalNextStages(opp: Opportunity): { stage: OpportunityStage; disabled?: boolean; reason?: string }[] {
  const candidates = LEGAL_NEXT[opp.stage] ?? [];
  return candidates.map(to => {
    const r = canAdvance(opp, to);
    return { stage: to, disabled: !r.ok, reason: r.reason };
  });
}
