import type { LossReason, Opportunity, OpportunityStage, Proposal, StageTransition } from './types';
import { derivePaymentStatus } from './pipeline';

const iso = (d: string) => `${d}T12:00:00.000Z`;

function proposalsFor(stage: OpportunityStage, value: number): Proposal[] {
  if (['qualification', 'need_analysis'].includes(stage)) return [];
  const base: Proposal = {
    id: `prop-${Math.random().toString(36).slice(2, 9)}`,
    version: 1,
    title: 'Standard offer',
    value,
    currency: 'DZD',
    status: stage === 'proposal' ? 'draft' : 'sent',
    createdAt: iso('2026-03-28'),
    sentAt: ['negotiation', 'closing', 'won', 'lost'].includes(stage) ? iso('2026-04-01') : undefined,
  };
  if (stage === 'won' || stage === 'negotiation' || stage === 'closing') {
    return [{ ...base, status: stage === 'won' || stage === 'closing' ? 'accepted' : 'sent' }];
  }
  if (stage === 'lost') {
    return [{ ...base, status: 'rejected' }];
  }
  return [base];
}

function paymentsFor(stage: OpportunityStage, value: number): import('./types').Payment[] {
  if (['qualification', 'need_analysis', 'proposal', 'lost'].includes(stage)) return [];
  if (stage === 'negotiation') {
    return [
      {
        id: `pay-neg-${Math.random().toString(36).slice(2, 6)}`,
        amount: value,
        method: 'bank_transfer',
        status: 'pending',
        dueDate: '2026-04-20',
      },
    ];
  }
  return [
    {
      id: `pay-cl-${Math.random().toString(36).slice(2, 6)}`,
      amount: value,
      method: 'bank_transfer',
      status: 'paid',
      receivedAt: iso('2026-04-12'),
      reference: 'TRF-9921',
    },
  ];
}

function historyFor(stage: OpportunityStage, ownerId: string): StageTransition[] {
  const by = ownerId;
  if (stage === 'qualification') {
    return [{ from: 'qualification', to: 'qualification', at: iso('2026-04-08'), by, note: 'Created' }];
  }
  if (stage === 'need_analysis') {
    return [{ from: 'qualification', to: 'need_analysis', at: iso('2026-03-20'), by }];
  }
  if (stage === 'proposal') {
    return [
      { from: 'qualification', to: 'need_analysis', at: iso('2026-03-21'), by },
      { from: 'need_analysis', to: 'proposal', at: iso('2026-03-25'), by },
    ];
  }
  if (stage === 'negotiation') {
    return [
      { from: 'qualification', to: 'need_analysis', at: iso('2026-02-15'), by },
      { from: 'need_analysis', to: 'proposal', at: iso('2026-02-20'), by },
      { from: 'proposal', to: 'negotiation', at: iso('2026-04-02'), by },
    ];
  }
  if (stage === 'closing') {
    return [
      { from: 'qualification', to: 'need_analysis', at: iso('2026-02-18'), by },
      { from: 'need_analysis', to: 'proposal', at: iso('2026-02-22'), by },
      { from: 'proposal', to: 'negotiation', at: iso('2026-03-10'), by },
      { from: 'negotiation', to: 'closing', at: iso('2026-04-11'), by },
    ];
  }
  if (stage === 'won') {
    return [
      { from: 'qualification', to: 'need_analysis', at: iso('2026-01-10'), by },
      { from: 'need_analysis', to: 'proposal', at: iso('2026-01-14'), by },
      { from: 'proposal', to: 'negotiation', at: iso('2026-01-20'), by },
      { from: 'negotiation', to: 'closing', at: iso('2026-02-01'), by },
      { from: 'closing', to: 'won', at: iso('2026-03-28'), by },
    ];
  }
  if (stage === 'lost') {
    return [
      { from: 'qualification', to: 'need_analysis', at: iso('2026-02-05'), by },
      { from: 'need_analysis', to: 'proposal', at: iso('2026-02-12'), by },
      { from: 'proposal', to: 'lost', at: iso('2026-03-15'), by, note: 'Lost to competitor' },
    ];
  }
  return [];
}

function build(
  id: string,
  leadId: string,
  name: string,
  contactName: string,
  company: string | undefined,
  channel: import('./types').Channel,
  ownerId: string,
  ownerName: string,
  stage: OpportunityStage,
  value: number,
  created: string,
  stageEntered: string
): Opportunity {
  const proposals = proposalsFor(stage, value);
  const payments = paymentsFor(stage, value);
  let paymentStatus = derivePaymentStatus(payments);
  if (stage === 'won') paymentStatus = 'paid';
  if (stage === 'lost') paymentStatus = 'pending';

  return {
    id,
    leadId,
    name,
    company,
    contactName,
    channel,
    ownerId,
    ownerName,
    stage,
    outcome: stage === 'won' ? 'won' : stage === 'lost' ? 'lost' : 'open',
    value,
    currency: 'DZD',
    expectedCloseDate: '2026-04-30',
    proposals,
    payments,
    paymentStatus,
    qualification:
      stage === 'qualification'
        ? undefined
        : {
            budget: '40-80k DZD/mo',
            authority: contactName,
            need: 'Faster replies on WhatsApp',
            timeline: 'Next month',
            competingSolutions: ['Spreadsheets'],
            riskFlags: [],
          },
    needAnalysis:
      ['proposal', 'negotiation', 'closing', 'won', 'lost'].includes(stage) && stage !== 'lost'
        ? {
            summary: `${company ?? name} wants to scale support without adding headcount.`,
            goals: ['Cut response time', 'Track team KPIs'],
            metricsToMove: ['Reply rate > 80%'],
            decisionCriteria: ['Price', 'Onboarding time'],
            stakeholders: [{ name: contactName, role: 'Decision maker' }],
            proposedSolution: 'Scale automation + inbox',
          }
        : stage === 'lost'
          ? {
              summary: 'Paused after pricing discussion.',
              goals: [],
              metricsToMove: [],
              decisionCriteria: [],
              stakeholders: [{ name: contactName, role: 'Buyer' }],
            }
          : undefined,
    lossReason: stage === 'lost' ? ('price' as LossReason) : undefined,
    lossDetail: stage === 'lost' ? 'Chose a lower-priced competitor.' : undefined,
    createdAt: iso(created),
    updatedAt: iso('2026-04-15'),
    stageEnteredAt: iso(stageEntered),
    stageHistory: historyFor(stage, ownerId),
    nextStepText: stage === 'qualification' ? 'Schedule discovery call' : 'Follow up on proposal',
    tags: ['pipeline'],
  };
}

export const MOCK_OPPORTUNITIES_SEED: Opportunity[] = [
  build('opp-1', 'lead-3', 'Ouahab Retail — Automation', 'Yacine Ouahab', 'Ouahab Retail', 'facebook', 'agent-3', 'Nassim Rahmani', 'qualification', 22000, '2026-03-12', '2026-04-08'),
  build('opp-2', 'lead-8', 'Bouziane Studio', 'Lynda Bouziane', 'Bouziane Studio', 'instagram', 'agent-2', 'Sara Boukhalfa', 'need_analysis', 18000, '2026-03-18', '2026-04-05'),
  build('opp-3', 'lead-14', 'Merzouk Logistics', 'Asma Merzouk', 'Merzouk Logistics', 'whatsapp', 'agent-2', 'Sara Boukhalfa', 'proposal', 16500, '2026-03-20', '2026-04-09'),
  build('opp-4', 'lead-4', 'Aït Commerce', 'Fatima Zahra Aït', 'Aït Commerce', 'whatsapp', 'agent-1', 'Mehdi Kaci', 'negotiation', 45000, '2026-02-10', '2026-04-02'),
  build('opp-5', 'lead-9', 'Terki Wholesale', 'Mourad Terki', 'Terki Wholesale', 'whatsapp', 'agent-3', 'Nassim Rahmani', 'closing', 32000, '2026-02-22', '2026-04-11'),
  build('opp-6', 'lead-15', 'Hadjadj VIP', 'Bilal Hadjadj', undefined, 'instagram', 'agent-3', 'Nassim Rahmani', 'won', 38000, '2026-01-05', '2026-03-28'),
  build('opp-7', 'lead-19', 'Lazreg Group', 'Tarek Lazreg', 'Lazreg Group', 'facebook', 'agent-1', 'Mehdi Kaci', 'lost', 41000, '2026-02-01', '2026-03-15'),
  build('opp-8', 'lead-1', 'Benali Shop (prospect)', 'Mohamed Benali', 'Benali Shop', 'whatsapp', 'agent-1', 'Mehdi Kaci', 'qualification', 15000, '2026-04-01', '2026-04-14'),
  build('opp-9', 'lead-2', 'Khelif Boutique', 'Amira Khelif', undefined, 'instagram', 'agent-2', 'Sara Boukhalfa', 'need_analysis', 8500, '2026-03-25', '2026-04-10'),
  build('opp-10', 'lead-18', 'Benmeziani Care', 'Dalila Benmeziani', 'Benmeziani Care', 'instagram', 'agent-3', 'Nassim Rahmani', 'proposal', 21000, '2026-03-08', '2026-04-07'),
  build('opp-11', 'lead-5', 'Bensalem (closed lead)', 'Rachid Bensalem', undefined, 'instagram', 'agent-2', 'Sara Boukhalfa', 'won', 12000, '2026-01-20', '2026-03-01'),
  build('opp-12', 'lead-20', 'Edu pilot — Owner', 'Imene Guerfi', 'Edu Center Pilote', 'whatsapp', 'user-2', 'Sara Owner', 'negotiation', 55000, '2026-03-05', '2026-04-12'),
];

export const MOCK_LOSS_REASONS: { value: LossReason; label: string }[] = [
  { value: 'price', label: 'Price' },
  { value: 'competitor', label: 'Competitor' },
  { value: 'no_budget', label: 'No budget' },
  { value: 'no_decision', label: 'No decision' },
  { value: 'timing', label: 'Timing' },
  { value: 'not_a_fit', label: 'Not a fit' },
  { value: 'other', label: 'Other' },
];
