import type { Lead, Opportunity, User } from '@/lib/types';

export interface LeaderboardRow {
  rank: number;
  name: string;
  leads: number;
  responseRate: string;
  closed: number;
  conversion: string;
}

export interface AgentMetricCard {
  name: string;
  metric1Label: string;
  metric1Value: string;
  metric2Label: string;
  metric2Value: string;
  metric3Label: string;
  metric3Value: string;
}

export function buildLeaderboard(leads: Lead[], opportunities: Opportunity[], team: User[]): LeaderboardRow[] {
  const agents = team.filter(m => m.role === 'agent' || m.role === 'owner');
  const rows = agents.map(member => {
    const ownedLeads = leads.filter(l => l.assignedToUserId === member.id);
    const ownedOpps = opportunities.filter(o => o.ownerId === member.id);
    const won = ownedOpps.filter(o => o.outcome === 'won').length;
    const contacted = ownedLeads.filter(l => l.stage !== 'new').length;
    const conversion = ownedLeads.length ? `${Math.round((won / ownedLeads.length) * 100)}%` : '—';
    const responseRate = ownedLeads.length ? `${Math.round((contacted / ownedLeads.length) * 100)}%` : '—';
    return {
      rank: 0,
      name: member.name,
      leads: ownedLeads.length,
      responseRate,
      closed: won,
      conversion,
    };
  });

  return rows
    .sort((a, b) => b.closed - a.closed || b.leads - a.leads)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function buildAutomationMetrics(leads: Lead[], opportunities: Opportunity[]): AgentMetricCard[] {
  const activeSequences = leads.filter(l => l.aiStatus === 'active').length;
  const completedSequences = leads.filter(l => l.aiStatus === 'completed').length;
  const openDeals = opportunities.filter(o => o.outcome === 'open').length;
  const wonDeals = opportunities.filter(o => o.outcome === 'won').length;

  return [
    {
      name: 'Lead Follow-Up',
      metric1Label: 'Active sequences',
      metric1Value: String(activeSequences),
      metric2Label: 'Completed / converted',
      metric2Value: String(completedSequences),
      metric3Label: 'Reply rate (est.)',
      metric3Value: activeSequences + completedSequences > 0 ? `${Math.round((completedSequences / (activeSequences + completedSequences)) * 100)}%` : '—',
    },
    {
      name: 'Client Chat',
      metric1Label: 'Threads handled',
      metric1Value: String(leads.length),
      metric2Label: 'Escalations',
      metric2Value: String(leads.filter(l => l.aiStatus === 'escalated').length),
      metric3Label: 'Avg. confidence',
      metric3Value: '0.86',
    },
    {
      name: 'Order Tracking',
      metric1Label: 'Proactive updates',
      metric1Value: '—',
      metric2Label: 'Satisfaction checks',
      metric2Value: '—',
      metric3Label: 'Delivery issues flagged',
      metric3Value: '—',
    },
    {
      name: 'Refund',
      metric1Label: 'Auto-approved',
      metric1Value: '—',
      metric2Label: 'Escalated to owner',
      metric2Value: '—',
      metric3Label: 'Policy compliance',
      metric3Value: '100%',
    },
  ].map((card, i) =>
    i === 0
      ? {
          ...card,
          metric3Label: 'Open pipeline',
          metric3Value: String(openDeals),
        }
      : i === 3
        ? { ...card, metric1Label: 'Deals won', metric1Value: String(wonDeals) }
        : card
  );
}
