import type { AnalyticsReport } from './types';

export const MOCK_REPORTS_SEED: AnalyticsReport[] = [
  {
    id: 'rep-seed-1',
    question: 'Why did we lose more deals last month?',
    createdAt: '2026-04-10T10:00:00.000Z',
    createdBy: 'Sara Owner',
    filters: { channel: 'all', ownerId: 'all', source: 'all', from: '2026-03-01', to: '2026-03-31' },
    summary: 'Losses clustered on price and competitor mentions during late-stage negotiation.',
    sections: [
      {
        id: 'rs-1',
        kind: 'kpi-row',
        title: 'Snapshot',
        payload: { items: [{ label: 'Win rate', value: '42%' }, { label: 'Avg cycle', value: '18d' }] },
      },
      {
        id: 'rs-2',
        kind: 'pie-chart',
        title: 'Loss reasons',
        payload: { data: [{ name: 'Price', value: 4 }, { name: 'Competitor', value: 2 }, { name: 'Timing', value: 1 }] },
      },
    ],
    recommendations: ['Review discount guardrails.', 'Add competitor battlecards to proposal templates.'],
    status: 'ready',
    source: 'mock',
  },
  {
    id: 'rep-seed-2',
    question: 'How is the pipeline this month?',
    createdAt: '2026-04-12T14:00:00.000Z',
    createdBy: 'Karim Admin',
    filters: { channel: 'all', ownerId: 'all', source: 'all' },
    summary: 'Weighted pipeline is healthy; negotiation stage carries the most value.',
    sections: [
      {
        id: 'rs-3',
        kind: 'bar-chart',
        title: 'By stage',
        payload: {
          data: [
            { name: 'qualification', value: 3 },
            { name: 'need_analysis', value: 2 },
            { name: 'proposal', value: 2 },
            { name: 'negotiation', value: 3 },
            { name: 'closing', value: 1 },
          ],
        },
      },
    ],
    recommendations: ['Focus on deals over 14 days in negotiation.', 'Tighten follow-up SLAs for proposal stage.'],
    status: 'ready',
    source: 'mock',
  },
];
