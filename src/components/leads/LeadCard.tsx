import { Link } from 'wouter';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';
import type { Lead } from '@/lib/types';
import { isEnrichmentIncomplete } from '@/lib/lead-utils';

export interface LeadCardProps {
  lead: Lead;
}

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <div
      className="rounded-lg border border-[#E4E4E8] bg-white p-3 transition-colors hover:border-[#C8C8D0]"
      data-testid={`card-lead-${lead.id}`}
    >
      <Link href={`/leads/${lead.id}`}>
        <a className="block">
          <div className="mb-1.5 truncate text-[14px] font-medium text-[#1A1A3E]" title={lead.name}>
            {lead.name}
          </div>
          {isEnrichmentIncomplete(lead) && (
            <div className="mb-1 inline-block rounded border border-[#E4E4E8] px-1.5 py-0.5 text-[11px] text-[#6B6B80]">
              Enrichment incomplete
            </div>
          )}
          <ChannelDot channel={lead.channel} showLabel />
          <div className="mt-1.5">
            <AIStatusLabel status={lead.aiStatus} />
          </div>
          <div className="mt-1 truncate text-[12px] text-[#9999AA]" title={lead.lastContact}>
            {lead.lastContact}
          </div>
        </a>
      </Link>
      {lead.convertedOpportunityId && (
        <Link href={`/opportunities/${lead.convertedOpportunityId}`}>
          <a className="mt-2 inline-block text-[12px] text-[#2B62E8]">View opportunity →</a>
        </Link>
      )}
    </div>
  );
}
