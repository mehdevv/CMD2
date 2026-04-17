import { Link } from 'wouter';
import type { Opportunity } from '@/lib/types';
import { StageSLABadge } from '@/components/opportunities/StageSLABadge';

export interface OpportunityCardProps {
  opportunity: Opportunity;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function OpportunityCard({ opportunity, draggable, onDragStart, onDragEnd }: OpportunityCardProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="cursor-grab rounded-md border border-[#E4E4E8] bg-white p-2 active:cursor-grabbing hover:border-[#C8C8D0]"
    >
      <Link href={`/opportunities/${opportunity.id}`}>
        <a className="block truncate text-[13px] font-medium text-[#1A1A3E] hover:text-[#2B62E8]">{opportunity.name}</a>
      </Link>
      <div
        className="mt-1 truncate text-[11px] text-[#6B6B80]"
        title={`${opportunity.contactName} · ${opportunity.value.toLocaleString()} DZD`}
      >
        {opportunity.contactName} · {opportunity.value.toLocaleString()} DZD
      </div>
      <div className="mt-1">
        <StageSLABadge stage={opportunity.stage} stageEnteredAt={opportunity.stageEnteredAt} />
      </div>
    </div>
  );
}
