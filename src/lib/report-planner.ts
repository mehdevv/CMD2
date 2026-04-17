import type { AnalyticsFilters, AnalyticsReport, Lead, Opportunity, ReportSection, User } from './types';
import {
  selectAvgCycleDays,
  selectBreakdown,
  selectFunnel,
  selectOpenPipelineValue,
  selectPipelineByStage,
  selectQualifiedRate,
  selectRevenueOverTime,
  selectStuckOpportunities,
  selectWinRate,
  selectWonRevenue,
} from './analytics';

export interface PlannerContext {
  leads: Lead[];
  opportunities: Opportunity[];
  users: User[];
  now: Date;
}

function id(): string {
  return `rep-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function baseReport(
  question: string,
  createdBy: string,
  filters: AnalyticsFilters,
  summary: string,
  sections: ReportSection[],
  recommendations: string[]
): AnalyticsReport {
  return {
    id: id(),
    question,
    createdAt: new Date().toISOString(),
    createdBy,
    filters,
    summary,
    sections,
    recommendations,
    status: 'ready',
    source: 'mock',
  };
}

function kpiSection(title: string, items: { label: string; value: string }[]): ReportSection {
  return {
    id: id(),
    kind: 'kpi-row',
    title,
    payload: { items },
  };
}

export function planReport(
  question: string,
  ctx: PlannerContext,
  filters: AnalyticsFilters,
  createdBy = 'Sara Owner'
): AnalyticsReport {
  const q = question.toLowerCase();
  const { leads, opportunities } = ctx;

  const winRate = selectWinRate(opportunities, filters);
  const pipeline = selectPipelineByStage(opportunities, filters);
  const funnel = selectFunnel(leads, opportunities, filters);
  const avgCycle = selectAvgCycleDays(opportunities, filters);
  const openPipe = selectOpenPipelineValue(opportunities, filters);
  const wonRev = selectWonRevenue(opportunities, filters);
  const qualRate = selectQualifiedRate(leads, filters);
  const revenueTrend = selectRevenueOverTime(opportunities, filters);

  if (q.includes('lose') || q.includes('lost')) {
    const byReason = selectBreakdown('lossReason', opportunities, leads, filters);
    return baseReport(
      question,
      createdBy,
      filters,
      'Losses cluster around a few recurring reasons. Addressing the top driver first usually lifts win rate the fastest.',
      [
        kpiSection('Headline', [
          { label: 'Win rate', value: `${winRate}%` },
          { label: 'Avg cycle (closed)', value: `${avgCycle}d` },
        ]),
        {
          id: id(),
          kind: 'pie-chart',
          title: 'Loss reasons',
          payload: {
            data: byReason.map(r => ({ name: r.label, value: r.count })),
          },
        },
        {
          id: id(),
          kind: 'table',
          title: 'Loss reason counts',
          payload: {
            columns: ['Reason', 'Count'],
            rows: byReason.map(r => [r.label, String(r.count)]),
          },
        },
      ],
      [
        'Review the top loss reason with sales on a weekly call.',
        'Add a discovery checklist so pricing objections surface earlier.',
        'Compare lost deals by channel and shift spend toward better converters.',
      ]
    );
  }

  if (q.includes('win rate') || q.includes('why we win')) {
    const byChannel = selectBreakdown('channel', opportunities, leads, filters);
    const byOwner = selectBreakdown('owner', opportunities, leads, filters);
    return baseReport(
      question,
      createdBy,
      filters,
      'Win rate reflects both pipeline quality and how consistently late-stage steps are executed.',
      [
        kpiSection('Snapshot', [
          { label: 'Win rate', value: `${winRate}%` },
          { label: 'Won revenue', value: `${wonRev.toLocaleString()} DZD` },
        ]),
        {
          id: id(),
          kind: 'bar-chart',
          title: 'Leads by channel',
          payload: { data: byChannel.map(r => ({ name: r.label, value: r.count })) },
        },
        {
          id: id(),
          kind: 'table',
          title: 'Owner pipeline value',
          payload: {
            columns: ['Owner', 'Opportunities', 'Value DZD'],
            rows: byOwner.map(r => [r.label, String(r.count), String(r.value ?? 0)]),
          },
        },
      ],
      [
        'Double down on owners above median win rate — capture their talk tracks.',
        'Tighten qualification criteria if win rate is high but volume is low.',
      ]
    );
  }

  if (q.includes('pipeline') || q.includes('forecast')) {
    return baseReport(
      question,
      createdBy,
      filters,
      'Weighted pipeline combines open opportunity value with stage probability.',
      [
        kpiSection('Forecast', [
          { label: 'Open weighted pipeline', value: `${Math.round(openPipe).toLocaleString()} DZD` },
          { label: 'Qualified rate', value: `${qualRate}%` },
        ]),
        {
          id: id(),
          kind: 'bar-chart',
          title: 'Opportunities by stage',
          payload: { data: pipeline.map(p => ({ name: p.stage, value: p.count })) },
        },
        {
          id: id(),
          kind: 'line-chart',
          title: 'Revenue won over time',
          payload: { data: revenueTrend },
        },
      ],
      [
        'Focus coaching on stages with the largest value stuck longest.',
        'Refresh proposals older than 14 days in negotiation.',
      ]
    );
  }

  if (q.includes('slow') || q.includes('stuck') || q.includes('cycle')) {
    const stuck = selectStuckOpportunities(opportunities, filters, 8);
    return baseReport(
      question,
      createdBy,
      filters,
      'Cycle time spikes when handoffs between stages lack clear owners or payment plans are incomplete.',
      [
        kpiSection('Cycle', [{ label: 'Avg cycle (closed)', value: `${avgCycle} days` }]),
        {
          id: id(),
          kind: 'bar-chart',
          title: 'Count per stage',
          payload: { data: pipeline.map(p => ({ name: p.stage, value: p.count })) },
        },
        {
          id: id(),
          kind: 'table',
          title: 'Slowest open opportunities',
          payload: {
            columns: ['Name', 'Stage', 'Value', 'Days in stage'],
            rows: stuck.map(o => [
              o.name,
              o.stage,
              String(o.value),
              String(Math.floor((Date.now() - new Date(o.stageEnteredAt).getTime()) / 86400000)),
            ]),
          },
        },
      ],
      [
        'Assign a single owner for each stuck deal and set a next-step date within 48 hours.',
        'Move stalled proposals to negotiation only after a sent proposal exists.',
      ]
    );
  }

  if (q.includes('channel')) {
    const byChannel = selectBreakdown('channel', opportunities, leads, filters);
    return baseReport(
      question,
      createdBy,
      filters,
      'Channel mix shows where attention converts — compare with automation spend per channel.',
      [
        {
          id: id(),
          kind: 'funnel-chart',
          title: 'Funnel',
          payload: { steps: funnel },
        },
        {
          id: id(),
          kind: 'bar-chart',
          title: 'Leads by channel',
          payload: { data: byChannel.map(r => ({ name: r.label, value: r.count })) },
        },
      ],
      ['Rebalance ad spend toward channels with higher qualified-to-opportunity conversion.']
    );
  }

  if (q.includes('owner') || q.includes('team') || q.includes('agent')) {
    const byOwner = selectBreakdown('owner', opportunities, leads, filters);
    return baseReport(
      question,
      createdBy,
      filters,
      'Team performance is a mix of velocity, win rate, and average deal size.',
      [
        kpiSection('Team', [
          { label: 'Win rate', value: `${winRate}%` },
          { label: 'Open pipeline', value: `${Math.round(openPipe).toLocaleString()} DZD` },
        ]),
        {
          id: id(),
          kind: 'table',
          title: 'By owner',
          payload: {
            columns: ['Owner', 'Deals', 'Pipeline value'],
            rows: byOwner.map(r => [r.label, String(r.count), String(r.value ?? 0)]),
          },
        },
      ],
      ['Pair lower win-rate owners with top performers on live calls for two weeks.']
    );
  }

  /* default */
  return baseReport(
    question,
    createdBy,
    filters,
    'Overall funnel health is steady; prioritize moving qualified leads into opportunities and tightening closing discipline.',
    [
      kpiSection('Overview', [
        { label: 'Qualified rate', value: `${qualRate}%` },
        { label: 'Win rate', value: `${winRate}%` },
        { label: 'Won revenue', value: `${wonRev.toLocaleString()} DZD` },
      ]),
      {
        id: id(),
        kind: 'funnel-chart',
        title: 'Funnel',
        payload: { steps: funnel },
      },
      {
        id: id(),
        kind: 'bar-chart',
        title: 'Pipeline by stage',
        payload: { data: pipeline.map(p => ({ name: p.stage, value: p.value })) },
      },
      {
        id: id(),
        kind: 'bullet-list',
        title: 'Signals',
        payload: {
          items: [
            `${funnel[0].count} leads in scope`,
            `${funnel[2].count} opportunities created`,
            `${funnel[3].count} won in period`,
          ],
        },
      },
    ],
    [
      'Book weekly pipeline reviews focused on stage aging.',
      'Ensure every qualified lead has a clear next meeting before conversion.',
    ]
  );
}
