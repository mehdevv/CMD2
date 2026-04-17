import type { Opportunity } from '@/lib/types';
import { stageLabel } from '@/lib/pipeline';
import { TimelineItem } from '@/components/ui/TimelineItem';

export interface OpportunityTimelineProps {
  opportunity: Opportunity;
}

export function OpportunityTimeline({ opportunity }: OpportunityTimelineProps) {
  const entries = [...opportunity.stageHistory].reverse();

  return (
    <div className="space-y-0">
      {entries.map((h, i) => (
        <TimelineItem
          key={`${h.at}-${i}`}
          meta={<span className="font-mono text-[12px] text-[#9999AA]">{h.at.slice(0, 16).replace('T', ' ')}</span>}
          title={`${stageLabel(h.from)} → ${stageLabel(h.to)}`}
          description={h.note}
        />
      ))}
    </div>
  );
}
