import { Link } from 'wouter';
import { ExternalLink } from 'lucide-react';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { OpportunityStageBadge } from '@/components/opportunities/OpportunityStageBadge';
import { StageSLABadge } from '@/components/opportunities/StageSLABadge';
import type { Opportunity, OpportunityStage } from '@/lib/types';
import { legalNextStages, stageLabel } from '@/lib/pipeline';

export interface OpportunityRecordHeaderProps {
  opportunity: Opportunity;
  onAdvanceStage: (to: OpportunityStage) => void;
  onMarkWon: () => void;
  onMarkLost: () => void;
}

export function OpportunityRecordHeader({
  opportunity: opp,
  onAdvanceStage,
  onMarkWon,
  onMarkLost,
}: OpportunityRecordHeaderProps) {
  const nextOptions = legalNextStages(opp);

  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-[#E4E4E8] pb-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="mb-1 text-[22px] font-semibold text-[#1A1A3E]">{opp.name}</h1>
        <div className="flex flex-wrap items-center gap-2 text-[14px] text-[#6B6B80]">
          <ChannelDot channel={opp.channel} showLabel />
          {opp.company && <span>{opp.company}</span>}
          <span>·</span>
          <span>{opp.value.toLocaleString()} DZD</span>
          <OpportunityStageBadge stage={opp.stage} />
          <StageSLABadge stage={opp.stage} stageEnteredAt={opp.stageEnteredAt} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/leads/${opp.leadId}`}>
          <a className="scale-btn-secondary inline-flex items-center gap-1 text-[13px]">
            Lead record <ExternalLink size={13} />
          </a>
        </Link>
        <div className="relative inline-block">
          <select
            className="scale-input min-w-[160px] text-[13px]"
            defaultValue=""
            onChange={e => {
              const v = e.target.value as OpportunityStage | '';
              e.target.value = '';
              if (!v) return;
              onAdvanceStage(v);
            }}
          >
            <option value="">Advance stage…</option>
            {nextOptions.map(o => (
              <option key={o.stage} value={o.stage} disabled={o.disabled} title={o.reason}>
                {stageLabel(o.stage)}
                {o.disabled ? ' (blocked)' : ''}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="scale-btn-primary text-[13px]" onClick={onMarkWon}>
          Mark won
        </button>
        <button type="button" className="scale-btn-danger text-[13px]" onClick={onMarkLost}>
          Mark lost
        </button>
      </div>
    </div>
  );
}
