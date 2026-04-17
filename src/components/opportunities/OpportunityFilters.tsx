import { LayoutGrid } from 'lucide-react';
import { Link } from 'wouter';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import type { OpportunityOutcome, OpportunityStage } from '@/lib/types';

export interface OpportunityFiltersProps {
  q: string;
  onQChange: (v: string) => void;
  stage: string;
  onStageChange: (v: string) => void;
  outcome: OpportunityOutcome | 'all';
  onOutcomeChange: (v: OpportunityOutcome | 'all') => void;
  stages: OpportunityStage[];
}

export function OpportunityFilters({
  q,
  onQChange,
  stage,
  onStageChange,
  outcome,
  onOutcomeChange,
  stages,
}: OpportunityFiltersProps) {
  return (
    <FilterToolbar
      search={{
        value: q,
        onChange: onQChange,
        placeholder: 'Search…',
      }}
      filters={
        <>
          <select className="scale-input w-40" value={stage} onChange={e => onStageChange(e.target.value)}>
            <option value="">All stages</option>
            {stages.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="scale-input w-36"
            value={outcome}
            onChange={e => onOutcomeChange(e.target.value as OpportunityOutcome | 'all')}
          >
            <option value="all">All outcomes</option>
            <option value="open">Open</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </>
      }
      right={
        <Link href="/opportunities/board">
          <a className="scale-btn-secondary inline-flex items-center gap-1.5 text-[13px]">
            <LayoutGrid size={14} /> Pipeline board
          </a>
        </Link>
      }
    />
  );
}
