import { useState } from 'react';
import type { LossReason, Opportunity } from '@/lib/types';
import { MOCK_LOSS_REASONS } from '@/lib/mock-opportunities-seed';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';

interface WonLostDialogProps {
  open: boolean;
  mode: 'won' | 'lost' | null;
  opportunity: Opportunity | null;
  onOpenChange: (v: boolean) => void;
  onConfirm: (patch: Partial<Opportunity>) => void;
}

export function WonLostDialog({ open, mode, opportunity, onOpenChange, onConfirm }: WonLostDialogProps) {
  const { user } = useAuth();
  const byId = user?.id ?? 'user-2';
  const [value, setValue] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [summary, setSummary] = useState('');
  const [lossReason, setLossReason] = useState<LossReason>('price');
  const [lossDetail, setLossDetail] = useState('');

  const reset = () => {
    if (opportunity) {
      setValue(String(opportunity.value));
      setCloseDate(new Date().toISOString().slice(0, 10));
      setSummary('');
      setLossReason('price');
      setLossDetail('');
    }
  };

  if (!open || !mode || !opportunity) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md rounded-lg border border-[#E4E4E8] bg-white">
        {mode === 'won' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-[17px] font-semibold text-[#1A1A3E]">Mark as won</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <FormField label="Final value (DZD)">
                <input className="scale-input w-full" value={value} onChange={e => setValue(e.target.value)} />
              </FormField>
              <FormField label="Close date">
                <input type="date" className="scale-input w-full" value={closeDate} onChange={e => setCloseDate(e.target.value)} />
              </FormField>
              <FormField label="Win summary">
                <textarea className="scale-input min-h-[72px] w-full py-2" value={summary} onChange={e => setSummary(e.target.value)} />
              </FormField>
            </div>
            <DialogFooter className="gap-2">
              <button type="button" className="scale-btn-secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="scale-btn-primary"
                onClick={() => {
                  const now = new Date().toISOString();
                  onConfirm({
                    stage: 'won',
                    outcome: 'won',
                    value: Number(value.replace(/\s/g, '')) || opportunity?.value || 0,
                    expectedCloseDate: closeDate,
                    wonDetail: summary,
                    paymentStatus: 'paid',
                    updatedAt: now,
                    stageEnteredAt: now,
                    stageHistory: [
                      ...(opportunity?.stageHistory ?? []),
                      {
                        from: opportunity!.stage,
                        to: 'won',
                        at: now,
                        by: byId,
                        note: summary,
                      },
                    ],
                  });
                  onOpenChange(false);
                }}
              >
                Confirm won
              </button>
            </DialogFooter>
          </>
        )}
        {mode === 'lost' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-[17px] font-semibold text-[#1A1A3E]">Mark as lost</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <FormField label="Reason">
                <select className="scale-input w-full" value={lossReason} onChange={e => setLossReason(e.target.value as LossReason)}>
                  {MOCK_LOSS_REASONS.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Detail">
                <textarea className="scale-input min-h-[72px] w-full py-2" value={lossDetail} onChange={e => setLossDetail(e.target.value)} />
              </FormField>
            </div>
            <DialogFooter className="gap-2">
              <button type="button" className="scale-btn-secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="scale-btn-danger"
                onClick={() => {
                  const now = new Date().toISOString();
                  onConfirm({
                    stage: 'lost',
                    outcome: 'lost',
                    lossReason,
                    lossDetail,
                    updatedAt: now,
                    stageEnteredAt: now,
                    stageHistory: [
                      ...(opportunity?.stageHistory ?? []),
                      {
                        from: opportunity!.stage,
                        to: 'lost',
                        at: now,
                        by: byId,
                        note: lossDetail,
                      },
                    ],
                  });
                  onOpenChange(false);
                }}
              >
                Confirm lost
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
