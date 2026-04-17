import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { KpiRow } from '@/components/dashboards/KpiRow';
import { DataTable } from '@/components/ui/DataTable';
import { useCrmData } from '@/contexts/CrmDataContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Opportunity, OpportunityOutcome, OpportunityStage } from '@/lib/types';
import { selectAvgCycleDays, selectOpenPipelineValue, selectWinRate, selectWonRevenue } from '@/lib/analytics';
import { OpportunityFilters } from '@/components/opportunities/OpportunityFilters';
import { OPPORTUNITY_LIST_COLUMNS, opportunityToDataTableRow } from '@/components/opportunities/OpportunityRow';

function filterOpps(
  opps: Opportunity[],
  opts: {
    userRole: string;
    userId: string;
    q: string;
    stage: string;
    outcome: string;
  }
): Opportunity[] {
  return opps.filter(o => {
    if (opts.userRole === 'agent' && o.ownerId !== opts.userId) return false;
    if (
      opts.q &&
      !o.name.toLowerCase().includes(opts.q.toLowerCase()) &&
      !o.contactName.toLowerCase().includes(opts.q.toLowerCase())
    )
      return false;
    if (opts.stage && o.stage !== opts.stage) return false;
    if (opts.outcome === 'open' && o.outcome !== 'open') return false;
    if (opts.outcome === 'won' && o.outcome !== 'won') return false;
    if (opts.outcome === 'lost' && o.outcome !== 'lost') return false;
    return true;
  });
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const { opportunities } = useCrmData();
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');
  const [outcome, setOutcome] = useState<OpportunityOutcome | 'all'>('all');

  const filtered = useMemo(
    () =>
      filterOpps(opportunities, {
        userRole: user?.role ?? 'agent',
        userId: user?.id ?? '',
        q,
        stage,
        outcome: outcome === 'all' ? '' : outcome,
      }),
    [opportunities, user, q, stage, outcome]
  );

  const filters = {};
  const openPipe = selectOpenPipelineValue(opportunities, filters);
  const winRate = selectWinRate(opportunities, filters);
  const avgCycle = selectAvgCycleDays(opportunities, filters);
  const wonRev = selectWonRevenue(opportunities, filters);
  const wonCount = opportunities.filter(o => o.stage === 'won' || o.outcome === 'won').length;

  const stages: OpportunityStage[] = [
    'qualification',
    'need_analysis',
    'proposal',
    'negotiation',
    'closing',
    'won',
    'lost',
  ];

  return (
    <AppShell title="Opportunities">
      <PageHeader title="Opportunities" subtitle="Pipeline records after leads are qualified." />

      <KpiRow
        className="mb-6"
        gridClassName="grid-cols-2 lg:grid-cols-4"
        items={[
          { label: 'Open weighted pipeline', value: `${Math.round(openPipe).toLocaleString()} DZD` },
          { label: 'Win rate', value: `${winRate}%` },
          { label: 'Avg cycle (closed)', value: `${avgCycle} days` },
          {
            label: 'Won deals',
            value: String(wonCount),
            delta: `${wonRev.toLocaleString()} DZD`,
            deltaPositive: true,
          },
        ]}
      />

      <OpportunityFilters
        q={q}
        onQChange={setQ}
        stage={stage}
        onStageChange={setStage}
        outcome={outcome}
        onOutcomeChange={setOutcome}
        stages={stages}
      />

      <PageSection padding="none">
        <DataTable
          striped
          density="compact"
          empty={<p className="p-8 text-center text-[13px] text-[#9999AA]">No opportunities match filters.</p>}
          columns={OPPORTUNITY_LIST_COLUMNS}
          rows={filtered.map(opportunityToDataTableRow)}
        />
      </PageSection>
    </AppShell>
  );
}
