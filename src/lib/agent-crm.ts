import type { AuthUser } from '@/lib/auth';
import type { Channel, Conversation, Lead } from '@/lib/types';

export function leadsForRole(leads: Lead[], user: AuthUser | null): Lead[] {
  if (!user || user.role !== 'agent') return leads;
  return leads.filter(l => l.assignedToUserId === user.id);
}

export function conversationsForRole(
  leads: Lead[],
  conversations: Conversation[],
  user: AuthUser | null
): Conversation[] {
  if (!user || user.role !== 'agent') return conversations;
  const leadIds = new Set(leadsForRole(leads, user).map(l => l.id));
  return conversations.filter(c => leadIds.has(c.leadId));
}

export function agentCanAccessLead(lead: Lead, user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role !== 'agent') return true;
  return lead.assignedToUserId === user.id;
}

export interface AgentFollowUpRow {
  contact: string;
  preview: string;
  channel: Channel;
  time: string;
  status: string;
}

export function buildAgentFollowUpRows(
  leads: Lead[],
  activity: { leadId: string; summary: string; at: string; kind: string }[],
  userId: string,
  limit = 8
): AgentFollowUpRow[] {
  const myLeadIds = new Set(leads.filter(l => l.assignedToUserId === userId).map(l => l.id));
  const leadById = new Map(leads.map(l => [l.id, l]));

  return activity
    .filter(a => myLeadIds.has(a.leadId) && a.kind !== 'pipeline')
    .slice(0, limit)
    .map(a => {
      const lead = leadById.get(a.leadId);
      const scheduled = a.summary.toLowerCase().includes('scheduled');
      return {
        contact: lead?.name ?? 'Contact',
        preview: a.summary,
        channel: lead?.channel ?? 'whatsapp',
        time: new Date(a.at).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: scheduled ? 'Scheduled' : 'Sent',
      };
    });
}

export function historyItemsFromActivity(
  activity: { summary: string; at: string; kind: string }[],
  lead: Lead
): { date: string; type: string; snippet: string }[] {
  const rows = activity.slice(0, 6).map(a => ({
    date: new Date(a.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    type:
      a.kind === 'sequence'
        ? 'Automation'
        : a.kind === 'enrichment'
          ? 'Enrichment'
          : a.kind === 'pipeline' || a.kind === 'opportunity'
            ? 'Pipeline'
            : 'Activity',
    snippet: a.summary,
  }));
  if (rows.length > 0) return rows;
  return [
    { date: lead.lastContact, type: 'Lead', snippet: `Stage: ${lead.stage}` },
    { date: '—', type: 'Source', snippet: lead.source ?? lead.channel },
  ];
}
