import { useState } from 'react';
import type { Channel } from '@/lib/types';
import type { AddLeadPayload } from '@/contexts/CrmDataContext';
import { DialogShell } from '@/components/ui/DialogShell';
import { FormField } from '@/components/ui/FormField';

export interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: AddLeadPayload) => void | Promise<void>;
}

export function AddLeadDialog({ open, onOpenChange, onCreate }: AddLeadDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [source, setSource] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName('');
    setPhone('');
    setChannel('whatsapp');
    setSource('');
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || !phone.trim()) return;
    setBusy(true);
    try {
      await onCreate({
        name: trimmed,
        phone: phone.trim(),
        channel,
        source: source.trim() || undefined,
      });
      reset();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={v => {
        if (!v) reset();
        onOpenChange(v);
      }}
      title="Add lead"
      description="Creates a new lead in your pipeline and opens a conversation thread."
      footer={
        <>
          <button type="button" className="scale-btn-secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="scale-btn-primary"
            disabled={!name.trim() || !phone.trim() || busy}
            onClick={() => void submit()}
          >
            {busy ? 'Saving…' : 'Create lead'}
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
