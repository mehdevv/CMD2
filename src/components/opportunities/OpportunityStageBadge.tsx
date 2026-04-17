import type { OpportunityStage } from '@/lib/types';
import { stageLabel } from '@/lib/pipeline';
import { cn } from '@/lib/utils';

const CLASS: Record<OpportunityStage, string> = {
  qualification: 'opp-stage-qualification',
  need_analysis: 'opp-stage-need_analysis',
  proposal: 'opp-stage-proposal',
  negotiation: 'opp-stage-negotiation',
  closing: 'opp-stage-closing',
  won: 'opp-stage-won',
  lost: 'opp-stage-lost',
};

export function OpportunityStageBadge({ stage }: { stage: OpportunityStage }) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md capitalize',
        CLASS[stage]
      )}
    >
      {stageLabel(stage)}
    </span>
  );
}
