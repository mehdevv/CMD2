import { Link } from 'wouter';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { StageBadge } from '@/components/ui/ScaleBadge';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';
import { LeadScoreBadge } from '@/components/leads/LeadScoreBadge';
import type { DataTableColumn, DataTableRow } from '@/components/ui/DataTable';
import type { Lead } from '@/lib/types';
import { isEnrichmentIncomplete } from '@/lib/lead-utils';

export function leadToDataTableRow(lead: Lead): DataTableRow {
  return {
    id: lead.id,
    href: `/leads/${lead.id}`,
    'data-testid': `row-lead-${lead.id}`,
    cells: [
      <div key="n" className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <ChannelDot channel={lead.channel} />
          <span className="text-[14px] font-medium text-[#1A1A3E] hover:text-[#2B62E8]">{lead.name}</span>
        </div>
        {isEnrichmentIncomplete(lead) && (
          <span className="w-fit rounded border border-[#E4E4E8] px-1.5 text-[11px] text-[#6B6B80]">
            Enrichment incomplete
          </span>
        )}
        {lead.convertedOpportunityId && (
          <Link href={`/opportunities/${lead.convertedOpportunityId}`}>
            <a className="text-[11px] text-[#2B62E8]" onClick={e => e.stopPropagation()}>
              View opportunity →
            </a>
          </Link>
        )}
      </div>,
      <span key="ph" className="text-[13px] text-[#6B6B80]">
        {lead.phone}
      </span>,
      <StageBadge key="st" stage={lead.stage} />,
      <LeadScoreBadge key="sc" score={lead.qualificationScore} />,
      <AIStatusLabel key="ai" status={lead.aiStatus} />,
      <span key="ag" className="text-[13px] text-[#6B6B80]">
        {lead.assignedTo}
      </span>,
      <span key="lc" className="text-[13px] text-[#6B6B80]">
        {lead.lastContact}
      </span>,
      <button key="m" type="button" className="text-[16px] text-[#9999AA] hover:text-[#6B6B80]">
        ···
      </button>,
    ],
  };
}

export const LEAD_LIST_COLUMNS: DataTableColumn[] = [
  { key: 'name', header: 'Name' },
  { key: 'phone', header: 'Phone' },
  { key: 'stage', header: 'Stage' },
  { key: 'score', header: 'Score' },
  { key: 'ai', header: 'Automation status' },
  { key: 'agent', header: 'Agent' },
  { key: 'last', header: 'Last contact' },
  { key: 'menu', header: '' },
];
