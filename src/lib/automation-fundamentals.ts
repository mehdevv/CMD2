export type AutomationAgentKey = 'followup' | 'chat' | 'tracking' | 'refund';

export interface OrgAutomationFundamentals {
  provider: string;
  model: string;
  maxTokens: number;
  creativityCap: string;
  apiManagedByAdmin: true;
  extraNotes?: string;
}

/** Mock “org defaults” set by platform admin — owners see this read-only. */
/** Refund rules owned by admin — shown read-only to business owners. */
export const ORG_REFUND_POLICY_FOR_OWNER = {
  refundWindowDays: 30,
  autoApproveMaxDzd: 10000,
  proofOfPurchaseRequired: true,
  partialRefundsAllowed: true,
};

export const ORG_AUTOMATION_FUNDAMENTALS: Record<AutomationAgentKey, OrgAutomationFundamentals> = {
  followup: {
    provider: 'OpenAI',
    model: 'gpt-4o-mini',
    maxTokens: 180,
    creativityCap: '0.5 max (admin)',
    apiManagedByAdmin: true,
    extraNotes: 'Keys and billing are managed by your organization admin.',
  },
  chat: {
    provider: 'OpenAI',
    model: 'gpt-4o',
    maxTokens: 220,
    creativityCap: '0.6 max (admin)',
    apiManagedByAdmin: true,
    extraNotes: 'Holding-message timeout is capped at 12s by admin.',
  },
  tracking: {
    provider: 'OpenAI',
    model: 'gpt-4o-mini',
    maxTokens: 120,
    creativityCap: '0.35 max (admin)',
    apiManagedByAdmin: true,
    extraNotes: 'Carrier API credentials are configured by admin only.',
  },
  refund: {
    provider: 'OpenAI',
    model: 'gpt-4o',
    maxTokens: 200,
    creativityCap: '0.25 max (admin)',
    apiManagedByAdmin: true,
    extraNotes: 'Refund window, auto-approve limit, and rule engine are set by admin.',
  },
};
