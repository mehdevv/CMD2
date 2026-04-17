import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { OpportunityStageBadge } from '@/components/opportunities/OpportunityStageBadge';
import type { Opportunity } from '@/lib/types';

export interface MyOpportunitiesListProps {
  opportunities: Opportunity[];
  emptyMessage?: string;
}

export function MyOpportunitiesList({
  opportunities,
  emptyMessage = 'No open opportunities assigned to you.',
}: MyOpportunitiesListProps) {
  if (opportunities.length === 0) {
    return <p className="text-[13px] text-[#9999AA]">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-0">
      {opportunities.map((o, i) => (
        <div
          key={o.id}
          className={cn(
            'flex items-center gap-3 py-2.5',
            i < opportunities.length - 1 && 'border-b border-[#E4E4E8]'
          )}
        >
          <div className="min-w-0 flex-1">
            <Link href={`/opportunities/${o.id}`}>
              <a
                className="block truncate text-[14px] font-medium text-[#1A1A3E] hover:text-[#2B62E8]"
                title={o.name}
              >
                {o.name}
              </a>
            </Link>
            <p
              className="truncate text-[12px] text-[#6B6B80]"
              title={`${o.value.toLocaleString()} DZD · ${o.contactName}`}
            >
              {o.value.toLocaleString()} DZD · {o.contactName}
            </p>
          </div>
          <OpportunityStageBadge stage={o.stage} />
        </div>
      ))}
    </div>
  );
}
