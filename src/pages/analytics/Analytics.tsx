import { useMemo } from 'react';
import { useLocation, useSearch } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { KpiRow } from '@/components/dashboards/KpiRow';
import { useCrmData } from '@/contexts/CrmDataContext';
import {
  parseAnalyticsFilters,
  stringifyAnalyticsFilters,
  selectAvgCycleDays,
  selectBreakdown,
  selectFunnel,
  selectLeadsOverTime,
  selectOpenPipelineValue,
  selectPipelineByStage,
  selectQualifiedRate,
  selectRevenueOverTime,
  selectWinRate,
  selectWonRevenue,
} from '@/lib/analytics';
import { AskQuestionCard } from '@/components/analytics/AskQuestionCard';
import { AnalyticsFiltersBar } from '@/components/analytics/AnalyticsFiltersBar';
import {
  ChannelBreakdownChart,
  FunnelChart,
  LeadsOverTimeChart,
  PipelineByStageChart,
  RevenueOverTimeChart,
} from '@/components/analytics/AnalyticsCharts';
import type { AnalyticsFilters } from '@/lib/types';

export default function AnalyticsPage() {
  const { leads, opportunities } = useCrmData();
  const [, setLoc] = useLocation();
  const search = useSearch();
  const filters: AnalyticsFilters = useMemo(() => parseAnalyticsFilters(search), [search]);

  const funnel = useMemo(() => selectFunnel(leads, opportunities, filters), [leads, opportunities, filters]);
  const pipeline = useMemo(() => selectPipelineByStage(opportunities, filters), [opportunities, filters]);
  const leadsTrend = useMemo(() => selectLeadsOverTime(leads, filters), [leads, filters]);
  const revTrend = useMemo(() => selectRevenueOverTime(opportunities, filters), [opportunities, filters]);
  const winRate = selectWinRate(opportunities, filters);
  const openPipe = selectOpenPipelineValue(opportunities, filters);
  const qualRate = selectQualifiedRate(leads, filters);
  const wonRev = selectWonRevenue(opportunities, filters);
  const avgCycle = selectAvgCycleDays(opportunities, filters);
  const byChannel = selectBreakdown('channel', opportunities, leads, filters);

  const setFiltersNav = (next: AnalyticsFilters) => {
    setLoc(`/analytics${stringifyAnalyticsFilters(next)}`);
  };

  return (
    <AppShell title="Analytics">
      <PageHeader title="Analytics" subtitle="Executive view across leads and opportunities." />

      <AnalyticsFiltersBar filters={filters} onChange={setFiltersNav} />

      <KpiRow
        className="mb-6"
        gridClassName="grid-cols-2 lg:grid-cols-5"
        items={[
          { label: 'Qualified rate', value: `${qualRate}%` },
          { label: 'Win rate', value: `${winRate}%` },
          { label: 'Open weighted pipeline', value: `${Math.round(openPipe).toLocaleString()} DZD` },
          { label: 'Won revenue', value: `${wonRev.toLocaleString()} DZD` },
          { label: 'Avg cycle (closed)', value: `${avgCycle} days` },
        ]}
      />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PageSection title="Funnel">
          <FunnelChart data={funnel} />
        </PageSection>
        <PageSection title="Pipeline by stage">
          <PipelineByStageChart data={pipeline} />
        </PageSection>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PageSection title="Leads over time">
          <LeadsOverTimeChart data={leadsTrend} />
        </PageSection>
        <PageSection title="Revenue won over time">
          <RevenueOverTimeChart data={revTrend} />
        </PageSection>
      </div>

      <PageSection title="Leads by channel" className="mb-6">
        <ChannelBreakdownChart data={byChannel} />
      </PageSection>

      <AskQuestionCard filters={filters} />
    </AppShell>
  );
}
