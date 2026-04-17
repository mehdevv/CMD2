export type AgentId = 'followup' | 'chat' | 'tracking' | 'refund';

export interface AgentBrandTokens {
  label: string;
  tint: string;
  solid: string;
  text: string;
}

export const AGENT_BRAND: Record<AgentId, AgentBrandTokens> = {
  followup: {
    label: 'Lead Follow-Up',
    tint: '#EEF3FD',
    solid: '#2B62E8',
    text: '#1E3A8A',
  },
  chat: {
    label: 'Client Chat',
    tint: '#F0ECFB',
    solid: '#5B4BB0',
    text: '#3B2E7A',
  },
  tracking: {
    label: 'Order Tracking',
    tint: '#F0FDF4',
    solid: '#16A34A',
    text: '#166534',
  },
  refund: {
    label: 'Refund',
    tint: '#FFFBEB',
    solid: '#D97706',
    text: '#B45309',
  },
};

const NORMALIZE = (s: string) => s.trim().toLowerCase();

/** Map free-text agent labels (mock + UI) to a known automation agent id. */
export function resolveAgentIdFromLabel(label: string): AgentId | null {
  const n = NORMALIZE(label);
  if (!n || n === '—' || n === '-') return null;
  if (n.includes('lead follow') || n.includes('follow-up') || n.includes('follow up')) return 'followup';
  if (n.includes('client chat') || n.includes('scale ai') || n === 'automation') return 'chat';
  if (n.includes('order tracking') || n.includes('tracking')) return 'tracking';
  if (n.includes('refund')) return 'refund';
  if (n.includes('any active agent')) return null;
  return null;
}

export function getAgentBrandForLabel(label: string): AgentBrandTokens | null {
  const id = resolveAgentIdFromLabel(label);
  return id ? AGENT_BRAND[id] : null;
}

/** Top bar / chrome accent for automation agent config routes. */
export function getAgentBrandSolidForPathname(pathname: string): string | undefined {
  if (pathname.startsWith('/admin/agents/followup') || pathname.startsWith('/automation/followup')) {
    return AGENT_BRAND.followup.solid;
  }
  if (pathname.startsWith('/admin/agents/chat') || pathname.startsWith('/automation/chat')) {
    return AGENT_BRAND.chat.solid;
  }
  if (pathname.startsWith('/admin/agents/tracking') || pathname.startsWith('/automation/tracking')) {
    return AGENT_BRAND.tracking.solid;
  }
  if (pathname.startsWith('/admin/agents/refund') || pathname.startsWith('/automation/refund')) {
    return AGENT_BRAND.refund.solid;
  }
  return undefined;
}
