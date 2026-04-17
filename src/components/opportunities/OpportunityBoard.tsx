import type { Opportunity, OpportunityStage } from '@/lib/types';
import { OpportunityColumn } from '@/components/opportunities/OpportunityColumn';

const COLS: OpportunityStage[] = [
  'qualification',
  'need_analysis',
  'proposal',
  'negotiation',
  'closing',
  'won',
  'lost',
];

export interface OpportunityBoardProps {
  byStage: (s: OpportunityStage) => Opportunity[];
  onColumnDrop: (stage: OpportunityStage) => void;
  onCardDragStart: (id: string) => void;
  onCardDragEnd: () => void;
}

export function OpportunityBoard({ byStage, onColumnDrop, onCardDragStart, onCardDragEnd }: OpportunityBoardProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {COLS.map(col => (
        <OpportunityColumn
          key={col}
          stage={col}
          opportunities={byStage(col)}
          onDragOver={e => e.preventDefault()}
          onDrop={() => onColumnDrop(col)}
          onCardDragStart={onCardDragStart}
          onCardDragEnd={onCardDragEnd}
        />
      ))}
    </div>
  );
}
