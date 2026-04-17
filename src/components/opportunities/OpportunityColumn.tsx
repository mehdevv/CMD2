import type { DragEvent } from 'react';
import type { Opportunity, OpportunityStage } from '@/lib/types';
import { OpportunityStageBadge } from '@/components/opportunities/OpportunityStageBadge';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';

export interface OpportunityColumnProps {
  stage: OpportunityStage;
  opportunities: Opportunity[];
  onDragOver: (e: DragEvent) => void;
  onDrop: () => void;
  onCardDragStart: (id: string) => void;
  onCardDragEnd: () => void;
}

export function OpportunityColumn({
  stage,
  opportunities,
  onDragOver,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
}: OpportunityColumnProps) {
  const sum = opportunities.reduce((a, o) => a + o.value, 0);

  return (
    <div
      className="flex min-h-[320px] w-52 flex-shrink-0 flex-col rounded-lg border border-[#E4E4E8] bg-[#F7F7F8] p-2"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="mb-2 border-b border-[#E4E4E8] px-1 pb-2">
        <div className="flex items-center justify-between gap-1">
          <OpportunityStageBadge stage={stage} />
          <span className="text-[11px] text-[#9999AA]">{opportunities.length}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[#6B6B80]">{sum.toLocaleString()} DZD</div>
      </div>
      <div className="space-y-2">
        {opportunities.map(o => (
          <OpportunityCard
            key={o.id}
            opportunity={o}
            draggable
            onDragStart={() => onCardDragStart(o.id)}
            onDragEnd={onCardDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
