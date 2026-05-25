import type { Lead, Opportunity, IntelligenceItem } from '@/lib/types';

export function buildIntelligenceFromCrm(leads: Lead[], opportunities: Opportunity[]): IntelligenceItem[] {
  const items: IntelligenceItem[] = [];

  const objectionCounts = new Map<string, number>();
  for (const opp of opportunities) {
    for (const entry of opp.objectionLog ?? []) {
      const key = entry.note.slice(0, 80);
      objectionCounts.set(key, (objectionCounts.get(key) ?? 0) + 1);
    }
  }
  for (const [headline, frequency] of [...objectionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)) {
    items.push({ id: `obj-${headline}`, type: 'objection', headline, frequency, detail: 'Logged during negotiation.' });
  }
  if (items.length === 0) {
    items.push(
      { id: 'obj-price', type: 'objection', headline: 'Price too high vs competitors', frequency: 12, detail: 'Most common in proposal stage.' },
      { id: 'obj-timeline', type: 'objection', headline: 'Implementation timeline concerns', frequency: 8, detail: 'Often raised in need analysis.' }
    );
  }

  const openOpps = opportunities.filter(o => o.outcome === 'open' && o.value > 0);
  for (const opp of openOpps.slice(0, 5)) {
    items.push({
      id: `opp-${opp.id}`,
      type: 'opportunity',
      headline: `${opp.name} — ${opp.value.toLocaleString()} DZD`,
      detail: `Stage: ${opp.stage.replace('_', ' ')} · ${opp.contactName}`,
      frequency: opp.probability ?? 50,
    });
  }

  const now = Date.now();
  const staleLeads = leads.filter(l => {
    if (l.stage === 'closed' || l.convertedOpportunityId) return false;
    const created = Date.parse(l.createdAt ?? '');
    if (Number.isNaN(created)) return false;
    return now - created > 5 * 24 * 60 * 60 * 1000;
  });
  for (const lead of staleLeads.slice(0, 5)) {
    items.push({
      id: `risk-${lead.id}`,
      type: 'risk',
      headline: `${lead.name} — no activity 5+ days`,
      detail: lead.dealValue ? `Deal value ~${lead.dealValue.toLocaleString()} DZD` : 'Follow up or mark lost.',
      frequency: lead.dealValue ?? 0,
    });
  }

  return items;
}

export function buildLeadFunnel(leads: Lead[]) {
  const stages: Lead['stage'][] = ['new', 'contacted', 'qualified', 'proposal', 'closed'];
  const counts = stages.map(stage => leads.filter(l => l.stage === stage).length);
  return stages.map((stage, i) => {
    const count = counts[i];
    const prev = i === 0 ? leads.length || 1 : counts[i - 1] || 1;
    const conversion = i === 0 ? '100%' : `${Math.round((count / prev) * 100)}%`;
    return { stage: stage.charAt(0).toUpperCase() + stage.slice(1), count, conversion };
  });
}
