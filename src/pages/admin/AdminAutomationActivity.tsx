import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { DataTable } from '@/components/ui/DataTable';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { ActivityTypeBadge } from '@/components/admin/ActivityTypeBadge';
import { AgentBrandChip } from '@/components/admin/AgentBrandChip';
import { ACTIVITY_LOG_TYPE_LABEL, type ActivityLogType } from '@/components/admin/activityLogTypes';
import { listAutomationActivity } from '@/lib/db/automation';

export default function AdminAutomationActivity() {
  const [q, setQ] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityLogType | ''>('');

  const { data: log = [], isLoading } = useQuery({
    queryKey: ['automation', 'activity'],
    queryFn: () => listAutomationActivity(200),
  });

  const filtered = useMemo(() => {
    return log.filter(row => {
      if (q && !row.leadName.toLowerCase().includes(q.toLowerCase()) && !row.summary.toLowerCase().includes(q.toLowerCase())) return false;
      if (agentFilter && row.agentLabel !== agentFilter) return false;
      if (typeFilter && row.kind !== typeFilter) return false;
      return true;
    });
  }, [log, q, agentFilter, typeFilter]);

  const agents = [...new Set(log.map(r => r.agentLabel))];

  return (
    <AppShell title="Automation activity">
      <PageHeader
        title="Activity log"
        subtitle="Automation events from your workspace — sequences, enrichment, pipeline moves, and escalations."
      />

      <FilterToolbar
        search={{
          value: q,
          onChange: setQ,
          placeholder: 'Search contact or summary…',
        }}
        filters={
          <>
            <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} className="scale-input w-44">
              <option value="">All agents</option>
              {agents.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as ActivityLogType | '')} className="scale-input w-40">
              <option value="">All types</option>
              {(Object.keys(ACTIVITY_LOG_TYPE_LABEL) as ActivityLogType[]).map(t => (
                <option key={t} value={t}>
                  {ACTIVITY_LOG_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </>
        }
      />

      <PageSection padding="none">
        {isLoading ? (
          <div className="py-12 text-center text-[13px] text-[#9999AA]">Loading activity…</div>
        ) : (
        <DataTable
          empty={
            <div className="py-12 text-center text-[13px] text-[#9999AA]">No events yet. Add a lead to start the follow-up sequence.</div>
          }
          columns={[
            { key: 'time', header: 'Time', className: 'whitespace-nowrap text-[#6B6B80]' },
            { key: 'type', header: 'Type' },
            { key: 'agent', header: 'Agent' },
            { key: 'contact', header: 'Contact' },
            { key: 'summary', header: 'Summary' },
          ]}
          rows={filtered.map(row => ({
            id: row.id,
            cells: [
              row.timeLabel,
              <ActivityTypeBadge key="ty" type={row.kind as ActivityLogType} />,
              <AgentBrandChip key="ag" label={row.agentLabel} />,
              <span key="ct" className="font-medium text-[#1A1A3E]">
                {row.leadName}
              </span>,
              <span key="su" className="text-[#6B6B80]">
                {row.summary}
              </span>,
            ],
          }))}
        />
        )}
      </PageSection>
    </AppShell>
  );
}
