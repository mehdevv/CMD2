import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { ChannelDot } from '@/components/ui/ChannelDot';
import type { Lead } from '@/lib/types';

export interface NeedsAttentionListProps {
  leads: Lead[];
  emptyMessage?: string;
}

export function NeedsAttentionList({ leads, emptyMessage = 'No escalations right now.' }: NeedsAttentionListProps) {
  if (leads.length === 0) {
    return <p className="text-[13px] text-[#9999AA]">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-0">
      {leads.map((lead, i) => (
        <div
          key={lead.id}
          className={cn('flex items-center gap-3 py-2.5', i < leads.length - 1 && 'border-b border-[#E4E4E8]')}
        >
          <ChannelDot channel={lead.channel} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-[#1A1A3E]" title={lead.name}>
              {lead.name}
            </p>
            <p
              className="truncate text-[12px] text-[#DC2626]"
              title="Escalated by automation — needs human review"
            >
              Escalated by automation — needs human review
            </p>
          </div>
          <Link href={`/leads/${lead.id}`}>
            <a className="text-[13px] text-[#2B62E8] hover:underline">Open</a>
          </Link>
        </div>
      ))}
    </div>
  );
}
