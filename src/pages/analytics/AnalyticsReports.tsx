import { useState } from 'react';
import { useLocation } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { DataTable } from '@/components/ui/DataTable';
import { useCrmData } from '@/contexts/CrmDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { planReport } from '@/lib/report-planner';
import { MOCK_USERS } from '@/lib/mock-data';
import type { AnalyticsFilters } from '@/lib/types';
import { AskQuestionCard } from '@/components/analytics/AskQuestionCard';
import { REPORT_LIST_COLUMNS, reportToDataTableRow } from '@/components/analytics/ReportListRow';

const PRESETS = [
  "How's the pipeline this month?",
  'Why did we lose more deals in the last 30 days?',
  'Which channel converts best from lead to won?',
  'Show me our slowest-moving opportunities.',
  'Who on the team has the highest win rate?',
];

export default function AnalyticsReportsPage() {
  const { reports, leads, opportunities, addReport } = useCrmData();
  const { user } = useAuth();
  const [, setLoc] = useLocation();
  const [filters] = useState<AnalyticsFilters>(() => ({
    channel: 'all',
    ownerId: 'all',
    source: 'all',
  }));

  const runPreset = (text: string) => {
    const report = planReport(
      text,
      { leads, opportunities, users: MOCK_USERS, now: new Date() },
      filters,
      user?.name ?? 'User'
    );
    addReport(report);
    setLoc(`/analytics/reports/${report.id}`);
  };

  return (
    <AppShell title="Reports">
      <PageHeader title="Reports" subtitle="Saved answers to business questions." />

      <AskQuestionCard filters={filters} />

      <div className="mt-6 flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p} type="button" className="scale-btn-secondary text-[12px]" onClick={() => runPreset(p)}>
            {p}
          </button>
        ))}
      </div>

      <PageSection className="mt-8" padding="none">
        <DataTable
          columns={REPORT_LIST_COLUMNS}
          rows={reports.map(reportToDataTableRow)}
          empty={<p className="p-6 text-center text-[13px] text-[#9999AA]">No reports yet.</p>}
        />
      </PageSection>
    </AppShell>
  );
}
