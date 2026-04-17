import type { Opportunity, OpportunityStage } from '@/lib/types';
import { canAdvance, stageLabel } from '@/lib/pipeline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface OpportunityMoveConfirmProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  opportunity: Opportunity | null;
  targetStage: OpportunityStage | null;
  onConfirm: () => void;
}

export function OpportunityMoveConfirm({
  open,
  onOpenChange,
  opportunity,
  targetStage,
  onConfirm,
}: OpportunityMoveConfirmProps) {
  if (!open || !opportunity || !targetStage) return null;
  const check = canAdvance(opportunity, targetStage);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg border border-[#E4E4E8] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold text-[#1A1A3E]">Change stage</DialogTitle>
          <p className="text-[13px] text-[#6B6B80] font-normal">
            Move to <span className="font-medium text-[#1A1A3E]">{stageLabel(targetStage)}</span>
          </p>
        </DialogHeader>
        {!check.ok && <p className="text-[13px] text-[#DC2626]">{check.reason}</p>}
        <DialogFooter className="gap-2">
          <button type="button" className="scale-btn-secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="button" className="scale-btn-primary" disabled={!check.ok} onClick={onConfirm}>
            Confirm move
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
