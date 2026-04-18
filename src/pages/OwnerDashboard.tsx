import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { KpiRow } from '@/components/dashboards/KpiRow';
import { PipelineSummaryStrip } from '@/components/dashboards/PipelineSummaryStrip';
import { IntelligenceHighlightCard } from '@/components/dashboards/IntelligenceHighlightCard';
import { TeamPipelineTable } from '@/components/dashboards/TeamPipelineTable';
import { RecentMeetingList } from '@/components/meetings/RecentMeetingList';
import { useCrmData } from '@/contexts/CrmDataContext';
import { selectOpenPipelineValue, selectPipelineByStage, selectWinRate } from '@/lib/analytics';

const INTELLIGENCE = [
  {
    tone: 'danger' as const,
    label: 'Top objection',
    headline: '"Le prix est trop élevé" — 8 conversations this week',
    detail: 'Response rate drops 40% after this objection. Consider a script update.',
    links: [
      { href: '/intelligence', label: 'View details' },
      { href: '/analytics', label: 'Analytics' },
    ],
  },
  {
    tone: 'success' as const,
    label: 'Opportunity',
    headline: '5 Facebook leads reached Qualified in 48h',
    detail: "This week's ad batch is converting 23% better than average.",
    links: [
      { href: '/intelligence', label: 'View details' },
      { href: '/analytics', label: 'Analytics' },
    ],
  },
  {
    tone: 'warning' as const,
    label: 'Risk',
    headline: '3 accounts silent for 14+ days',
    detail: 'Total open deal value at risk: 58,500 DZD. Immediate follow-up recommended.',
    links: [
      { href: '/intelligence', label: 'View details' },
      { href: '/analytics', label: 'Analytics' },
    ],
  },
];

const DASH_FILTERS = {} as const;

export default function OwnerDashboard() {
  const { leads, opportunities, teamMembers } = useCrmData();
  const agentOptions = teamMembers.filter(u => u.role === 'agent');
  const [agentIdFilter, setAgentIdFilter] = useState('');

  const openPipe = useMemo(() => selectOpenPipelineValue(opportunities, DASH_FILTERS), [opportunities]);
  const winRate = useMemo(() => selectWinRate(opportunities, DASH_FILTERS), [opportunities]);
  const byStage = useMemo(() => selectPipelineByStage(opportunities, DASH_FILTERS), [opportunities]);
  const openStages = useMemo(
    () => byStage.filter(s => s.stage !== 'won' && s.stage !== 'lost'),
    [byStage]
  );

  return (
    <AppShell title="Dashboard">
      <PageHeader title="Dashboard" subtitle="Team performance, pipeline, and recent signals." className="mb-6" />

      <KpiRow
        cols={4}
        items={[
          { label: 'Response rate', value: '94%', delta: '2% vs last week', deltaPositive: true },
          { label: 'Deals closed', value: '18', delta: '5 vs last month', deltaPositive: true },
          {
            label: 'Open weighted pipeline',
            value: `${Math.round(openPipe).toLocaleString()} DZD`,
            delta: 'All owners & agents',
            deltaPositive: true,
          },
          {
            label: 'Win rate (closed)',
            value: `${winRate}%`,
            delta: 'Won vs lost outcomes',
            deltaPositive: winRate >= 40,
          },
        ]}
      />

      <PipelineSummaryStrip stages={openStages} className="mb-6" />

      <div className="mb-8 grid grid-cols-3 gap-4">
        {INTELLIGENCE.map((item, i) => (
          <IntelligenceHighlightCard key={i} {...item} />
        ))}
      </div>

      <div className="mb-6">
        <Link href="/analytics">
          <a className="text-[14px] font-medium text-[#2B62E8] hover:underline">See full analytics →</a>
        </Link>
      </div>

      <PageSection
        className="mb-6"
        title="Team pipeline"
        padding="none"
        action={
          <select
            value={agentIdFilter}
            onChange={e => setAgentIdFilter(e.target.value)}
            className="scale-input w-40 text-[13px]"
            style={{ height: 32 }}
          >
            <option value="">All agents</option>
            {agentOptions.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        }
      >
        <TeamPipelineTable leads={leads} agentIdFilter={agentIdFilter || undefined} maxRows={8} />
      </PageSection>

      <PageSection title="Recent meeting summaries">
        <p className="text-[13px] text-[#9999AA] mb-2">Record notes from a contact to build this list.</p>
        <RecentMeetingList items={[]} />
      </PageSection>
    </AppShell>
  );
}
