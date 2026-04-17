import { Link } from 'wouter';
import type { OpportunityStage } from '@/lib/types';
import { OPPORTUNITY_STAGE_ORDER, stageLabel } from '@/lib/pipeline';
import { cn } from '@/lib/utils';

const STEPPER_STAGES = OPPORTUNITY_STAGE_ORDER.filter(s => s !== 'won' && s !== 'lost');

interface StageStepperProps {
  opportunityId: string;
  current: OpportunityStage;
}

export function StageStepper({ opportunityId, current }: StageStepperProps) {
  const currentIdx = STEPPER_STAGES.indexOf(current === 'won' || current === 'lost' ? 'closing' : current);
  const effectiveIdx = current === 'won' ? STEPPER_STAGES.length : current === 'lost' ? Math.max(0, currentIdx) : currentIdx;

  const hrefFor = (s: OpportunityStage) => {
    const sub: Record<string, string> = {
      qualification: 'qualification',
      need_analysis: 'need-analysis',
      proposal: 'proposal',
      negotiation: 'negotiation',
      closing: 'closing',
    };
    return `/opportunities/${opportunityId}/${sub[s]}`;
  };

  return (
    <div className="flex items-center gap-1 flex-wrap mb-6">
      {STEPPER_STAGES.map((s, i) => {
        const done = i < effectiveIdx || current === 'won';
        const active = i === effectiveIdx && current !== 'won' && current !== 'lost';
        const lost = current === 'lost' && i >= effectiveIdx;
        return (
          <div key={s} className="flex items-center gap-1">
            {i > 0 && <div className="w-4 h-px bg-[#E4E4E8]" />}
            <Link href={hrefFor(s)}>
              <a
                className={cn(
                  'text-[12px] px-2.5 py-1 rounded-md border transition-colors',
                  done && 'bg-[#E5F5EC] border-[#BBF7D0] text-[#166534]',
                  active && 'bg-[#EEF3FD] border-[#2B62E8] text-[#1A1A3E] font-medium',
                  !done && !active && 'bg-white border-[#E4E4E8] text-[#9999AA] hover:bg-[#F7F7F8]',
                  lost && !done && 'opacity-50'
                )}
              >
                {stageLabel(s)}
              </a>
            </Link>
          </div>
        );
      })}
      {current === 'won' && (
        <span className="text-[12px] ml-2 px-2.5 py-1 rounded-md border border-[#BBF7D0] bg-[#E5F5EC] text-[#166534] font-medium">Won</span>
      )}
      {current === 'lost' && (
        <span className="text-[12px] ml-2 px-2.5 py-1 rounded-md border border-[#FECACA] bg-[#FBECEC] text-[#B91C1C] font-medium">Lost</span>
      )}
    </div>
  );
}
