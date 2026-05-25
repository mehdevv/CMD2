import { getSupabase } from '@/lib/supabase';
import { formatLastContact } from '@/lib/db/map-common';
import { isDemoUser, loadDemoSession } from '@/lib/demo-auth';
import { demoListActivityForLead, demoListAllActivity, demoLogActivity } from '@/lib/demo-crm-store';

export type ActivityKind =
  | 'sequence'
  | 'escalation'
  | 'refund'
  | 'tracking'
  | 'chat'
  | 'enrichment'
  | 'opportunity'
  | 'report'
  | 'other';

export interface ActivityLogEntry {
  id: string;
  kind: ActivityKind;
  agentId: string | null;
  agentLabel: string;
  leadId: string | null;
  leadName: string;
  summary: string;
  at: string;
  timeLabel: string;
}

const AGENT_LABELS: Record<string, string> = {
  followup: 'Lead Follow-Up',
  chat: 'Client Chat',
  tracking: 'Order Tracking',
  refund: 'Refund',
};

function agentLabel(agentId: string | null | undefined): string {
  if (!agentId) return '—';
  return AGENT_LABELS[agentId] ?? agentId;
}

type ActivityRow = {
  id: string;
  kind: string;
  agent_id: string | null;
  lead_id: string | null;
  summary: string;
  at: string;
  lead?: { name: string } | { name: string }[] | null;
};

function leadNameFromRow(r: ActivityRow): string {
  const l = r.lead;
  if (!l) return '—';
  if (Array.isArray(l)) return l[0]?.name ?? '—';
  return l.name ?? '—';
}

function mapActivityRow(r: ActivityRow): ActivityLogEntry {
  return {
    id: r.id,
    kind: r.kind as ActivityKind,
    agentId: r.agent_id,
    agentLabel: agentLabel(r.agent_id),
    leadId: r.lead_id,
    leadName: leadNameFromRow(r),
    summary: r.summary,
    at: r.at,
    timeLabel: formatLastContact(r.at),
  };
}

export async function logAutomationActivity(input: {
  orgId: string;
  kind: ActivityKind;
  agentId?: string | null;
  leadId?: string | null;
  opportunityId?: string | null;
  summary: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  if (isDemoUser(loadDemoSession())) {
    if (input.leadId) demoLogActivity(input.leadId, input.summary, input.kind);
    return;
  }
  const supabase = getSupabase();
  const { error } = await supabase.from('automation_activity_log').insert({
    org_id: input.orgId,
    kind: input.kind,
    agent_id: input.agentId ?? null,
    lead_id: input.leadId ?? null,
    opportunity_id: input.opportunityId ?? null,
    summary: input.summary,
    payload: input.payload ?? {},
  });
  if (error) throw error;
}

export async function listAutomationActivity(limit = 100): Promise<ActivityLogEntry[]> {
  if (isDemoUser(loadDemoSession())) {
    return demoListAllActivity(limit).map(a => ({
      id: a.id,
      kind: a.kind as ActivityKind,
      agentId: 'followup',
      agentLabel: agentLabel('followup'),
      leadId: a.leadId,
      leadName: '—',
      summary: a.summary,
      at: a.at,
      timeLabel: formatLastContact(a.at),
    }));
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('automation_activity_log')
    .select('id, kind, agent_id, lead_id, summary, at, lead:leads!automation_activity_log_lead_id_fkey(name)')
    .order('at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as unknown as ActivityRow[] | null)?.map(mapActivityRow) ?? [];
}

export async function listLeadAutomationActivity(leadId: string): Promise<ActivityLogEntry[]> {
  if (isDemoUser(loadDemoSession())) {
    return demoListActivityForLead(leadId).map(a => ({
      id: a.id,
      kind: a.kind as ActivityKind,
      agentId: a.kind === 'refund' ? 'refund' : a.kind === 'tracking' ? 'tracking' : a.kind === 'chat' ? 'chat' : 'followup',
      agentLabel: agentLabel(
        a.kind === 'refund' ? 'refund' : a.kind === 'tracking' ? 'tracking' : a.kind === 'chat' ? 'chat' : 'followup'
      ),
      leadId: a.leadId,
      leadName: '—',
      summary: a.summary,
      at: a.at,
      timeLabel: formatLastContact(a.at),
    }));
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('automation_activity_log')
    .select('id, kind, agent_id, lead_id, summary, at, lead:leads!automation_activity_log_lead_id_fkey(name)')
    .eq('lead_id', leadId)
    .order('at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data as unknown as ActivityRow[] | null)?.map(mapActivityRow) ?? [];
}

/** Prototype: first follow-up step when a lead enters the CRM. */
export async function simulateLeadFollowUp(input: {
  orgId: string;
  leadId: string;
  leadName: string;
  channel: string;
  conversationId: string;
}): Promise<void> {
  const supabase = getSupabase();
  const greeting = `Bonjour ${input.leadName.split(' ')[0]}, merci de nous avoir contacté. Je suis l'assistant Scale — comment puis-je vous aider aujourd'hui ?`;
  const now = new Date().toISOString();

  const { error: msgErr } = await supabase.from('messages').insert({
    conversation_id: input.conversationId,
    org_id: input.orgId,
    sender: 'ai',
    sender_name: 'Lead Follow-Up',
    content: greeting,
    status: 'delivered',
  });
  if (msgErr) throw msgErr;

  await supabase
    .from('conversations')
    .update({ last_message: greeting.slice(0, 120), last_time: now, ai_status: 'active' })
    .eq('id', input.conversationId);

  await logAutomationActivity({
    orgId: input.orgId,
    kind: 'sequence',
    agentId: 'followup',
    leadId: input.leadId,
    summary: `Step 1 sent on ${input.channel} — welcome message delivered`,
    payload: { step: 1, channel: input.channel },
  });
}
