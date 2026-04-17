import { Link } from 'wouter';
import { PageSection } from '@/components/layout/PageSection';
import { SummaryStrip } from '@/components/dashboards/SummaryStrip';
import { OpportunityStageBadge } from '@/components/opportunities/OpportunityStageBadge';
import type { OpportunityStage } from '@/lib/types';

export interface PipelineSummaryStage {
  stage: OpportunityStage;
  count: number;
  value: number;
}

export interface PipelineSummaryStripProps {
  stages: PipelineSummaryStage[];
  analyticsHref?: string;
  className?: string;
}

export function PipelineSummaryStrip({
  stages,
  analyticsHref = '/analytics',
  className,
}: PipelineSummaryStripProps) {
  if (!stages.some(s => s.count > 0)) return null;

  return (
    <PageSection
      className={className}
      title="Open pipeline by stage"
      action={
        <Link href={analyticsHref}>
          <a className="text-[13px] text-[#2B62E8] hover:underline">Full analytics</a>
        </Link>
      }
    >
      <SummaryStrip
        items={stages.map(s => ({
          id: s.stage,
          content: (
            <>
              <OpportunityStageBadge stage={s.stage} />
              <span className="text-[12px] text-[#6B6B80]">
                {s.count} · {Math.round(s.value).toLocaleString()} DZD
              </span>
            </>
          ),
        }))}
      />
    </PageSection>
  );
}
