import type { Lead, Stage } from '@/lib/types';
import { LeadCard } from '@/components/leads/LeadCard';

const STAGES: Stage[] = ['new', 'contacted', 'qualified', 'proposal', 'closed'];
const STAGE_LABELS: Record<Stage, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  closed: 'Closed',
};

export interface LeadsKanbanBoardProps {
  leadsByStage: (stage: Stage) => Lead[];
}

export function LeadsKanbanBoard({ leadsByStage }: LeadsKanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map(stage => {
        const stageLeads = leadsByStage(stage);
        return (
          <div key={stage} className="w-56 flex-shrink-0">
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className="text-[13px] font-medium text-[#1A1A3E]">{STAGE_LABELS[stage]}</span>
              <span className="rounded-full bg-[#F0F0F2] px-1.5 py-0.5 text-[11px] text-[#9999AA]">{stageLeads.length}</span>
            </div>
            <div className="space-y-2">
              {stageLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
              {stageLeads.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#E4E4E8] p-4 text-center">
                  <p className="text-[12px] text-[#9999AA]">No leads</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
