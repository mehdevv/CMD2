import { StageBadge } from '@/components/ui/ScaleBadge';
import type { Lead } from '@/lib/types';

export interface DealAsideCardProps {
  lead: Lead;
}

export function DealAsideCard({ lead }: DealAsideCardProps) {
  return (
    <div className="border-b border-[#E4E4E8] p-5">
      <h4 className="mb-3 text-[13px] font-medium text-[#1A1A3E]">Deal</h4>
      <div className="space-y-2.5">
        <div>
          <label className="mb-1 block text-[12px] text-[#6B6B80]">Stage</label>
          <StageBadge stage={lead.stage} />
        </div>
        <div>
          <label className="mb-1 block text-[12px] text-[#6B6B80]">Value</label>
          <input
            type="text"
            defaultValue={lead.dealValue ? `${lead.dealValue.toLocaleString()} DZD` : ''}
            className="scale-input"
            data-testid="input-deal-value"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] text-[#6B6B80]">Close date</label>
          <input type="date" className="scale-input" data-testid="input-close-date" />
        </div>
        <div>
          <label className="mb-1 block text-[12px] text-[#6B6B80]">Notes</label>
          <textarea
            className="scale-input resize-none py-2"
            style={{ height: 64 }}
            placeholder="Deal notes..."
            defaultValue={lead.notes}
            data-testid="textarea-notes"
          />
        </div>
      </div>
    </div>
  );
}
