import { useState } from 'react';
import type { Channel, Lead } from '@/lib/types';
import { DialogShell } from '@/components/ui/DialogShell';
import { FormField } from '@/components/ui/FormField';

export interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (lead: Lead) => void;
}

export function AddLeadDialog({ open, onOpenChange, onCreate }: AddLeadDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [source, setSource] = useState('');

  const reset = () => {
    setName('');
    setPhone('');
    setChannel('whatsapp');
    setSource('');
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed || !phone.trim()) return;
    const id = `lead-${Date.now()}`;
    const lead: Lead = {
      id,
      name: trimmed,
      phone: phone.trim(),
      channel,
      stage: 'new',
      aiStatus: 'active',
      assignedTo: 'Unassigned',
      lastContact: 'Just now',
      source: source.trim() || undefined,
      qualificationScore: 'cold',
      createdAt: new Date().toISOString(),
    };
    onCreate(lead);
    reset();
    onOpenChange(false);
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={v => {
        if (!v) reset();
        onOpenChange(v);
      }}
      title="Add lead"
      description="Creates a new lead in your pipeline (sample app — stored in session only)."
      footer={
        <>
          <button type="button" className="scale-btn-secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="button" className="scale-btn-primary" disabled={!name.trim() || !phone.trim()} onClick={submit}>
            Create lead
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <FormField label="Full name" required>
          <input className="scale-input w-full" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </FormField>
        <FormField label="Phone" required>
          <input className="scale-input w-full" value={phone} onChange={e => setPhone(e.target.value)} />
        </FormField>
        <FormField label="Channel">
          <select className="scale-input w-full" value={channel} onChange={e => setChannel(e.target.value as Channel)}>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>
        </FormField>
        <FormField label="Source" help="Optional — e.g. Meta Ads, referral.">
          <input className="scale-input w-full" value={source} onChange={e => setSource(e.target.value)} placeholder="Website, ad campaign…" />
        </FormField>
      </div>
    </DialogShell>
  );
}
