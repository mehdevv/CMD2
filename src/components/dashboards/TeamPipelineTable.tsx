import { DataTable } from '@/components/ui/DataTable';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { StageBadge } from '@/components/ui/ScaleBadge';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';
import { assignedNameToOwnerId } from '@/lib/lead-utils';
import type { Lead } from '@/lib/types';

export interface TeamPipelineTableProps {
  leads: Lead[];
  maxRows?: number;
  /** When set, only leads assigned to this agent id (mock map) are shown. */
  agentIdFilter?: string;
}

export function TeamPipelineTable({ leads, maxRows = 8, agentIdFilter }: TeamPipelineTableProps) {
  const filtered = agentIdFilter
    ? leads.filter(l => assignedNameToOwnerId(l.assignedTo) === agentIdFilter)
    : leads;
  const rows = filtered.slice(0, maxRows);

  return (
    <DataTable
      columns={[
        { key: 'agent', header: 'Agent' },
        { key: 'lead', header: 'Lead' },
        { key: 'stage', header: 'Stage' },
        { key: 'last', header: 'Last contact' },
        { key: 'ai', header: 'Automation status' },
      ]}
      rows={rows.map(lead => ({
        id: lead.id,
        href: `/leads/${lead.id}`,
        cells: [
          <UserAvatar key="a" name={lead.assignedTo} showName />,
          <div key="l" className="flex items-center gap-2">
            <ChannelDot channel={lead.channel} />
            <span className="text-[14px] font-medium text-[#1A1A3E]">{lead.name}</span>
          </div>,
          <StageBadge key="s" stage={lead.stage} />,
          <span key="lc" className="text-[13px] text-[#6B6B80]">
            {lead.lastContact}
          </span>,
          <AIStatusLabel key="ai" status={lead.aiStatus} />,
        ],
      }))}
    />
  );
}
