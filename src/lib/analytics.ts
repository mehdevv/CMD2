import type {
  AnalyticsFilters,
  BreakdownRow,
  Channel,
  FunnelStep,
  Lead,
  Opportunity,
  OpportunityStage,
  TimeSeriesPoint,
} from './types';

function inDateRange(iso: string | undefined, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  if (!iso) return true;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return true;
  if (from && t < new Date(from).getTime()) return false;
  if (to && t > new Date(to + 'T23:59:59.999Z').getTime()) return false;
  return true;
}

function filterLeads(leads: Lead[], f: AnalyticsFilters): Lead[] {
  return leads.filter(l => {
    if (f.channel && f.channel !== 'all' && l.channel !== f.channel) return false;
    if (f.source && f.source !== 'all' && (l.source ?? '').toLowerCase() !== f.source.toLowerCase()) return false;
    if (f.ownerId && f.ownerId !== 'all') {
      const agentName = nameFromOwnerId(f.ownerId);
      if (agentName && l.assignedTo !== agentName) return false;
    }
    if (f.from || f.to) {
      const anchor = l.createdAt ?? l.closeDate;
      if (anchor && !inDateRange(anchor, f.from, f.to)) return false;
    }
    return true;
  });
}

function nameFromOwnerId(ownerId: string): string | undefined {
  const map: Record<string, string> = {
    'agent-1': 'Mehdi Kaci',
    'agent-2': 'Sara Boukhalfa',
    'agent-3': 'Nassim Rahmani',
    'user-2': 'Sara Owner',
  };
  return map[ownerId];
}

function filterOpportunities(opps: Opportunity[], f: AnalyticsFilters): Opportunity[] {
  return opps.filter(o => {
    if (f.channel && f.channel !== 'all' && o.channel !== f.channel) return false;
    if (f.ownerId && f.ownerId !== 'all' && o.ownerId !== f.ownerId) return false;
    if (f.from || f.to) {
      if (!inDateRange(o.createdAt, f.from, f.to)) return false;
    }
    return true;
  });
}

export function selectFunnel(leads: Lead[], opps: Opportunity[], f: AnalyticsFilters): FunnelStep[] {
  const lf = filterLeads(leads, f);
  const of = filterOpportunities(opps, f);
  const totalLeads = lf.length;
  const qualifiedLeads = lf.filter(l =>
    ['qualified', 'proposal', 'closed'].includes(l.stage)
  ).length;
  const oppsCreated = of.length;
  const won = of.filter(o => o.outcome === 'won' || o.stage === 'won').length;
  return [
    { key: 'leads', label: 'Leads', count: totalLeads },
    { key: 'qualified', label: 'Qualified', count: qualifiedLeads },
    { key: 'opportunities', label: 'Opportunities', count: oppsCreated },
    { key: 'won', label: 'Won', count: won },
  ];
}

export function selectPipelineByStage(
  opps: Opportunity[],
  f: AnalyticsFilters
): { stage: OpportunityStage; count: number; value: number }[] {
  const of = filterOpportunities(opps, f);
  const stages: OpportunityStage[] = [
    'qualification',
    'need_analysis',
    'proposal',
    'negotiation',
    'closing',
    'won',
    'lost',
  ];
  return stages.map(stage => {
    const rows = of.filter(o => o.stage === stage);
    return {
      stage,
      count: rows.length,
      value: rows.reduce((s, o) => s + o.value, 0),
    };
  });
}

function leadCreatedDate(lead: Lead, index: number): string {
  if (lead.createdAt) return lead.createdAt;
  const base = new Date('2026-03-01');
  base.setDate(base.getDate() + (index % 45));
  return base.toISOString().slice(0, 10);
}

export function selectLeadsOverTime(leads: Lead[], f: AnalyticsFilters): TimeSeriesPoint[] {
  const lf = filterLeads(leads, { ...f, from: undefined, to: undefined });
  const byDay = new Map<string, number>();
  lf.forEach((lead, i) => {
    const d = leadCreatedDate(lead, i);
    if (!inDateRange(d, f.from, f.to)) return;
    byDay.set(d, (byDay.get(d) ?? 0) + 1);
  });
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export function selectRevenueOverTime(opps: Opportunity[], f: AnalyticsFilters): TimeSeriesPoint[] {
  const of = filterOpportunities(opps, f).filter(o => o.stage === 'won' || o.outcome === 'won');
  const byDay = new Map<string, number>();
  of.forEach(o => {
    const wonAt = o.stageHistory.filter(h => h.to === 'won').pop()?.at ?? o.updatedAt;
    const d = wonAt.slice(0, 10);
    if (!inDateRange(wonAt, f.from, f.to)) return;
    byDay.set(d, (byDay.get(d) ?? 0) + o.value);
  });
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export function selectBreakdown(
  dim: 'channel' | 'source' | 'owner' | 'lossReason',
  opps: Opportunity[],
  leads: Lead[],
  f: AnalyticsFilters
): BreakdownRow[] {
  if (dim === 'source' || dim === 'channel') {
    const lf = filterLeads(leads, f);
    const map = new Map<string, number>();
    lf.forEach(l => {
      const key = dim === 'channel' ? l.channel : (l.source ?? 'Unknown');
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return [...map.entries()].map(([key, count]) => ({
      key,
      label: key,
      count,
    }));
  }
  if (dim === 'owner') {
    const of = filterOpportunities(opps, f);
    const map = new Map<string, { count: number; value: number }>();
    of.forEach(o => {
      const k = o.ownerName ?? o.ownerId;
      const cur = map.get(k) ?? { count: 0, value: 0 };
      cur.count += 1;
      cur.value += o.value;
      map.set(k, cur);
    });
    return [...map.entries()].map(([key, v]) => ({
      key,
      label: key,
      count: v.count,
      value: v.value,
    }));
  }
  /* lossReason */
  const of = filterOpportunities(opps, f).filter(o => o.stage === 'lost' || o.outcome === 'lost');
  const map = new Map<string, number>();
  of.forEach(o => {
    const r = o.lossReason ?? 'other';
    map.set(r, (map.get(r) ?? 0) + 1);
  });
  return [...map.entries()].map(([key, count]) => ({
    key,
    label: key.replace(/_/g, ' '),
    count,
  }));
}

export function selectWinRate(opps: Opportunity[], f: AnalyticsFilters): number {
  const of = filterOpportunities(opps, f).filter(o => o.outcome === 'won' || o.outcome === 'lost' || o.stage === 'won' || o.stage === 'lost');
  const won = of.filter(o => o.outcome === 'won' || o.stage === 'won').length;
  const lost = of.filter(o => o.outcome === 'lost' || o.stage === 'lost').length;
  const denom = won + lost;
  if (!denom) return 0;
  return Math.round((100 * won) / denom);
}

export function selectAvgCycleDays(opps: Opportunity[], f: AnalyticsFilters): number {
  const closed = filterOpportunities(opps, f).filter(
    o => o.stage === 'won' || o.stage === 'lost' || o.outcome !== 'open'
  );
  const durations: number[] = [];
  closed.forEach(o => {
    const start = new Date(o.createdAt).getTime();
    const endIso = o.stageHistory.length ? o.stageHistory[o.stageHistory.length - 1].at : o.updatedAt;
    const end = new Date(endIso).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      durations.push(Math.floor((end - start) / (1000 * 60 * 60 * 24)));
    }
  });
  if (!durations.length) return 0;
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
}

export function selectOpenPipelineValue(opps: Opportunity[], f: AnalyticsFilters): number {
  const of = filterOpportunities(opps, f).filter(
    o => o.outcome === 'open' && o.stage !== 'won' && o.stage !== 'lost'
  );
  return of.reduce((sum, o) => {
    const p = o.probability ?? defaultProb(o.stage);
    return sum + (o.value * p) / 100;
  }, 0);
}

function defaultProb(stage: OpportunityStage): number {
  const m: Record<OpportunityStage, number> = {
    qualification: 20,
    need_analysis: 40,
    proposal: 60,
    negotiation: 75,
    closing: 90,
    won: 100,
    lost: 0,
  };
  return m[stage];
}

export function selectQualifiedRate(leads: Lead[], f: AnalyticsFilters): number {
  const lf = filterLeads(leads, f);
  if (!lf.length) return 0;
  const q = lf.filter(l => ['qualified', 'proposal', 'closed'].includes(l.stage)).length;
  return Math.round((100 * q) / lf.length);
}

export function selectWonRevenue(opps: Opportunity[], f: AnalyticsFilters): number {
  return filterOpportunities(opps, f)
    .filter(o => o.stage === 'won' || o.outcome === 'won')
    .reduce((s, o) => s + o.value, 0);
}

export function selectStuckOpportunities(
  opps: Opportunity[],
  f: AnalyticsFilters,
  limit = 5
): Opportunity[] {
  const of = filterOpportunities(opps, f).filter(
    o => o.outcome === 'open' && o.stage !== 'won' && o.stage !== 'lost'
  );
  const scored = of.map(o => {
    const entered = new Date(o.stageEnteredAt).getTime();
    const days = Number.isNaN(entered) ? 0 : (Date.now() - entered) / (1000 * 60 * 60 * 24);
    return { o, days };
  });
  return scored
    .sort((a, b) => b.days - a.days)
    .slice(0, limit)
    .map(x => x.o);
}

export function parseAnalyticsFilters(search: string): AnalyticsFilters {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const channel = q.get('channel') as Channel | 'all' | null;
  return {
    from: q.get('from') ?? undefined,
    to: q.get('to') ?? undefined,
    channel: channel && ['whatsapp', 'instagram', 'facebook', 'all'].includes(channel) ? channel : 'all',
    ownerId: q.get('ownerId') ?? 'all',
    source: q.get('source') ?? 'all',
  };
}

export function stringifyAnalyticsFilters(f: AnalyticsFilters): string {
  const q = new URLSearchParams();
  if (f.from) q.set('from', f.from);
  if (f.to) q.set('to', f.to);
  if (f.channel && f.channel !== 'all') q.set('channel', f.channel);
  if (f.ownerId && f.ownerId !== 'all') q.set('ownerId', f.ownerId);
  if (f.source && f.source !== 'all') q.set('source', f.source);
  const s = q.toString();
  return s ? `?${s}` : '';
}
