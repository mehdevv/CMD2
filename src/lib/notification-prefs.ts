export type NotificationEventKey =
  | 'lead_assigned'
  | 'thread_reply'
  | 'opportunity_stage_automation'
  | 'automation_escalated'
  | 'weekly_report'
  | 'mentions';

export interface NotificationChannelPrefs {
  in_app: boolean;
  email: boolean;
}

export const NOTIFICATION_EVENT_ROWS: Array<{ key: NotificationEventKey; label: string }> = [
  { key: 'lead_assigned', label: 'Lead assigned to me' },
  { key: 'thread_reply', label: 'New reply on my thread' },
  { key: 'opportunity_stage_automation', label: 'Opportunity stage changed by automation' },
  { key: 'automation_escalated', label: 'Automation escalated to me' },
  { key: 'weekly_report', label: 'Weekly report ready' },
  { key: 'mentions', label: 'Mentions (@me)' },
];

const DEFAULTS: Record<NotificationEventKey, NotificationChannelPrefs> = {
  lead_assigned: { in_app: true, email: false },
  thread_reply: { in_app: true, email: false },
  opportunity_stage_automation: { in_app: true, email: false },
  automation_escalated: { in_app: true, email: false },
  weekly_report: { in_app: true, email: false },
  mentions: { in_app: true, email: false },
};

function parseRow(raw: unknown): NotificationChannelPrefs | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const in_app = o.in_app;
  const email = o.email;
  if (typeof in_app !== 'boolean' || typeof email !== 'boolean') return null;
  return { in_app, email };
}

/** Merge stored `notification_prefs` with product defaults. */
export function resolvedNotificationPrefs(
  stored: Record<string, unknown> | null | undefined
): Record<NotificationEventKey, NotificationChannelPrefs> {
  const out = { ...DEFAULTS };
  if (!stored) return out;
  for (const key of Object.keys(DEFAULTS) as NotificationEventKey[]) {
    const parsed = parseRow(stored[key]);
    if (parsed) out[key] = parsed;
  }
  return out;
}

/** Build a JSONB-safe delta for one cell toggle (always includes both channels for that key). */
export function patchNotificationKey(
  current: Record<NotificationEventKey, NotificationChannelPrefs>,
  key: NotificationEventKey,
  field: keyof NotificationChannelPrefs,
  value: boolean
): Record<string, NotificationChannelPrefs> {
  const prev = current[key];
  return { [key]: { ...prev, [field]: value } };
}
