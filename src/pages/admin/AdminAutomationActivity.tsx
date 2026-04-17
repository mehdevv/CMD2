import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { DataTable } from '@/components/ui/DataTable';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { ActivityTypeBadge } from '@/components/admin/ActivityTypeBadge';
import { AgentBrandChip } from '@/components/admin/AgentBrandChip';
import { ACTIVITY_LOG_TYPE_LABEL, type ActivityLogType } from '@/components/admin/activityLogTypes';

interface LogRow {
  id: string;
  time: string;
  type: ActivityLogType;
  agent: string;
  contact: string;
  summary: string;
}

const MOCK_LOG: LogRow[] = [
  { id: '1', time: 'Today 14:32', type: 'escalation', agent: 'Client Chat', contact: 'Yasmine B.', summary: 'Confidence 0.42 — escalated to Mehdi K.' },
  { id: '2', time: 'Today 14:18', type: 'sequence', agent: 'Lead Follow-Up', contact: 'Omar T.', summary: 'Sequence stopped — lead replied (step 2 skipped)' },
  { id: '3', time: 'Today 13:55', type: 'tracking', agent: 'Order Tracking', contact: 'Leïla M.', summary: 'Status shipped → message sent (WhatsApp)' },
  { id: '4', time: 'Today 12:40', type: 'refund', agent: 'Refund', contact: 'Karim H.', summary: 'Auto-approved — 1,200 DZD within policy' },
  { id: '5', time: 'Today 11:02', type: 'escalation', agent: 'Refund', contact: 'Samir K.', summary: 'Escalated to owner — value 18,500 DZD' },
  { id: '6', time: 'Yesterday 18:22', type: 'chat', agent: 'Client Chat', contact: 'Nadia R.', summary: 'FAQ match — delivery times (98% confidence)' },
  { id: '7', time: 'Yesterday 16:10', type: 'sequence', agent: 'Lead Follow-Up', contact: 'Hichem A.', summary: 'Step 3 sent — +1 day delay' },
  { id: '8', time: 'Yesterday 09:45', type: 'tracking', agent: 'Order Tracking', contact: 'Amel S.', summary: 'Dissatisfied reply — Refund agent triggered + owner notified' },
  { id: '9', time: 'Yesterday 08:30', type: 'enrichment', agent: 'Lead Follow-Up', contact: 'Riad M.', summary: 'Assistant enrichment completed — company size + pain points saved' },
  { id: '10', time: 'Yesterday 08:05', type: 'opportunity', agent: '—', contact: 'Boutique Atlas', summary: 'Stage Need analysis → Proposal — value 240,000 DZD' },
  { id: '11', time: 'Mon 16:20', type: 'report', agent: '—', contact: '—', summary: 'Report “Why did we lose more deals last month?” generated for Sara Owner' },
];

export default function AdminAutomationActivity() {
  const [q, setQ] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityLogType | ''>('');

  const filtered = useMemo(() => {
    return MOCK_LOG.filter(row => {
      if (q && !row.contact.toLowerCase().includes(q.toLowerCase()) && !row.summary.toLowerCase().includes(q.toLowerCase())) return false;
      if (agentFilter && row.agent !== agentFilter) return false;
      if (typeFilter && row.type !== typeFilter) return false;
      return true;
    });
  }, [q, agentFilter, typeFilter]);

  const agents = [...new Set(MOCK_LOG.map(r => r.agent))];

  return (
    <AppShell title="Automation activity">
      <PageHeader
        title="Activity log"
        subtitle="Automation events, escalations, refund decisions, and sequence stops (sample data)."
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
        <DataTable
          empty={
            <div className="py-12 text-center text-[13px] text-[#9999AA]">No events match your filters.</div>
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
              row.time,
              <ActivityTypeBadge key="ty" type={row.type} />,
              <AgentBrandChip key="ag" label={row.agent} />,
              <span key="ct" className="font-medium text-[#1A1A3E]">
                {row.contact}
              </span>,
              <span key="su" className="text-[#6B6B80]">
                {row.summary}
              </span>,
            ],
          }))}
        />
      </PageSection>
    </AppShell>
  );
}
