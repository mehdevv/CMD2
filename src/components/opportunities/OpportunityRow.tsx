import { ChannelDot } from '@/components/ui/ChannelDot';
import type { DataTableColumn, DataTableRow } from '@/components/ui/DataTable';
import { OpportunityStageBadge } from '@/components/opportunities/OpportunityStageBadge';
import { StageSLABadge } from '@/components/opportunities/StageSLABadge';
import type { Opportunity } from '@/lib/types';
import { opportunityProbability } from '@/lib/pipeline';

export const OPPORTUNITY_LIST_COLUMNS: DataTableColumn[] = [
  { key: 'name', header: 'Name' },
  { key: 'company', header: 'Company' },
  { key: 'stage', header: 'Stage' },
  { key: 'value', header: 'Value' },
  { key: 'prob', header: 'Prob.' },
  { key: 'owner', header: 'Owner' },
  { key: 'sla', header: 'SLA' },
  { key: 'go', header: '', className: 'w-16' },
];

export function opportunityToDataTableRow(o: Opportunity): DataTableRow {
  return {
    id: o.id,
    href: `/opportunities/${o.id}`,
    cells: [
      <div key="n" className="flex items-center gap-2">
        <ChannelDot channel={o.channel} />
        <span className="font-medium text-[#1A1A3E]">{o.name}</span>
      </div>,
      <span key="co" className="text-[#6B6B80]">
        {o.company ?? '—'}
      </span>,
      <OpportunityStageBadge key="st" stage={o.stage} />,
      `${o.value.toLocaleString()} DZD`,
      `${opportunityProbability(o)}%`,
      <span key="ow" className="text-[#6B6B80]">
        {o.ownerName ?? o.ownerId}
      </span>,
      <StageSLABadge key="sla" stage={o.stage} stageEnteredAt={o.stageEnteredAt} />,
      <span key="op" className="text-[#2B62E8]">
        Open
      </span>,
    ],
  };
}
