import type { OpportunityStage } from '@/lib/types';
import { daysInStage, slaTone, stageLabel } from '@/lib/pipeline';
import { cn } from '@/lib/utils';

export function StageSLABadge({ stage, stageEnteredAt }: { stage: OpportunityStage; stageEnteredAt: string }) {
  if (stage === 'won' || stage === 'lost') return null;
  const days = daysInStage(stageEnteredAt);
  const tone = slaTone(stage, stageEnteredAt);
  return (
    <span
      className={cn(
        'text-[11px] px-2 py-0.5 rounded border',
        tone === 'neutral' && 'border-[#E4E4E8] text-[#6B6B80] bg-[#F7F7F8]',
        tone === 'amber' && 'border-[#F59E0B] text-[#B45309] bg-[#FFFBEB]',
        tone === 'red' && 'border-[#FCA5A5] text-[#B91C1C] bg-[#FEF2F2]'
      )}
    >
      {days}d in {stageLabel(stage)}
    </span>
  );
}
