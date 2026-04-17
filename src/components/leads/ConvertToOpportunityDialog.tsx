import { useState } from 'react';
import { useLocation } from 'wouter';
import type { Lead, Opportunity } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCrmData } from '@/contexts/CrmDataContext';
import { assignedNameToOwnerId } from '@/lib/lead-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ConvertToOpportunityDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead;
}

export function ConvertToOpportunityDialog({ open, onOpenChange, lead }: ConvertToOpportunityDialogProps) {
  const { user } = useAuth();
  const { addOpportunity, patchLead } = useCrmData();
  const [, setLocation] = useLocation();
  const [dealName, setDealName] = useState('');
  const [value, setValue] = useState(String(lead.dealValue ?? ''));
  const [expectedClose, setExpectedClose] = useState('');

  const ownerId = assignedNameToOwnerId(lead.assignedTo);
  const byId = user?.id ?? ownerId;

  const handleOpen = (v: boolean) => {
    if (v) {
      setDealName(lead.company ? `${lead.company} — ${lead.name}` : lead.name);
      setValue(String(lead.dealValue ?? ''));
      setExpectedClose(lead.closeDate ?? '');
    }
    onOpenChange(v);
  };

  const submit = () => {
    const id = `opp-${Date.now()}`;
    const now = new Date().toISOString();
    const val = Number(value.replace(/\s/g, '')) || 0;
    const opp: Opportunity = {
      id,
      leadId: lead.id,
      name: dealName.trim() || lead.name,
      company: lead.company,
      contactName: lead.name,
      channel: lead.channel,
      ownerId,
      ownerName: lead.assignedTo,
      stage: 'qualification',
      outcome: 'open',
      value: val,
      currency: 'DZD',
      expectedCloseDate: expectedClose || undefined,
      proposals: [],
      payments: [],
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
      stageEnteredAt: now,
      stageHistory: [{ from: 'qualification', to: 'qualification', at: now, by: byId, note: 'Created from lead' }],
      tags: lead.tags,
      qualification: lead.painPoints?.length
        ? {
            need: lead.painPoints.join('; '),
            budget: lead.budgetRange,
            timeline: lead.timeline,
          }
        : undefined,
    };
    addOpportunity(opp);
    patchLead(lead.id, {
      convertedOpportunityId: id,
      aiStatus: 'completed',
      stage: 'qualified',
    });
    onOpenChange(false);
    setLocation(`/opportunities/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md rounded-lg border border-[#E4E4E8] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold text-[#1A1A3E]">Convert to opportunity</DialogTitle>
          <p className="text-[13px] text-[#6B6B80] font-normal">Creates a pipeline record from this qualified lead.</p>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="block text-[12px] text-[#6B6B80] mb-1">Deal name</label>
            <input className="scale-input w-full" value={dealName} onChange={e => setDealName(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] text-[#6B6B80] mb-1">Expected value (DZD)</label>
            <input className="scale-input w-full" value={value} onChange={e => setValue(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] text-[#6B6B80] mb-1">Expected close date</label>
            <input type="date" className="scale-input w-full" value={expectedClose} onChange={e => setExpectedClose(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button type="button" className="scale-btn-secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="button" className="scale-btn-primary" onClick={submit}>
            Create opportunity
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
