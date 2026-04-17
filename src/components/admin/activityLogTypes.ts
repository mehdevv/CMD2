import { AGENT_BRAND } from '@/lib/agent-brand';

export type ActivityLogType =
  | 'sequence'
  | 'escalation'
  | 'refund'
  | 'tracking'
  | 'chat'
  | 'enrichment'
  | 'opportunity'
  | 'report';

export const ACTIVITY_LOG_TYPE_LABEL: Record<ActivityLogType, string> = {
  sequence: 'Sequence',
  escalation: 'Escalation',
  refund: 'Refund',
  tracking: 'Tracking',
  chat: 'Chat',
  enrichment: 'Enrichment',
  opportunity: 'Opportunity',
  report: 'Report',
};

/** Type-column chips: four pipeline-aligned types use agent brand tokens; others use semantic tints. */
export const ACTIVITY_TYPE_CHIP: Record<ActivityLogType, { bg: string; text: string }> = {
  sequence: { bg: AGENT_BRAND.followup.tint, text: AGENT_BRAND.followup.text },
  chat: { bg: AGENT_BRAND.chat.tint, text: AGENT_BRAND.chat.text },
  tracking: { bg: AGENT_BRAND.tracking.tint, text: AGENT_BRAND.tracking.text },
  refund: { bg: AGENT_BRAND.refund.tint, text: AGENT_BRAND.refund.text },
  escalation: { bg: '#FEF2F2', text: '#B91C1C' },
  enrichment: { bg: '#F0ECFB', text: '#5B4BB0' },
  opportunity: { bg: '#EEF3FD', text: '#2B62E8' },
  report: { bg: '#ECFDF5', text: '#166534' },
};
