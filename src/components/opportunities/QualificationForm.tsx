import { useState } from 'react';
import { TagInput } from '@/components/ui/TagInput';
import type { Opportunity, QualificationAnswers } from '@/lib/types';
import type { AuthUser } from '@/lib/auth';
import { canAdvance } from '@/lib/pipeline';

export interface QualificationFormProps {
  opp: Opportunity;
  patchOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  user: AuthUser | null;
}

export function QualificationForm({ opp, patchOpportunity, user }: QualificationFormProps) {
  const [form, setForm] = useState<QualificationAnswers>(() => ({ ...(opp.qualification ?? {}) }));

  const save = () => {
    patchOpportunity(opp.id, { qualification: form, updatedAt: new Date().toISOString() });
  };

  const saveAndAdvance = (to: 'need_analysis' | 'proposal') => {
    const merged = { ...opp, qualification: form };
    const check = canAdvance(merged, to);
    if (!check.ok) {
      window.alert(check.reason);
      return;
    }
    const now = new Date().toISOString();
    const byId = user?.id ?? opp.ownerId;
    patchOpportunity(opp.id, {
      qualification: form,
      stage: to,
      stageEnteredAt: now,
      updatedAt: now,
      stageHistory: [...opp.stageHistory, { from: opp.stage, to, at: now, by: byId }],
    });
  };

  return (
    <div className="scale-card max-w-2xl space-y-3 p-5">
      <h2 className="text-[17px] font-semibold text-[#1A1A3E]">Qualification meeting</h2>
      <input
        className="scale-input w-full"
        placeholder="Budget"
        value={form.budget ?? ''}
        onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
      />
      <input
        className="scale-input w-full"
        placeholder="Authority (who decides)"
        value={form.authority ?? ''}
        onChange={e => setForm(f => ({ ...f, authority: e.target.value }))}
      />
      <textarea
        className="scale-input min-h-[80px] w-full py-2"
        placeholder="Need / pain"
        value={form.need ?? ''}
        onChange={e => setForm(f => ({ ...f, need: e.target.value }))}
      />
      <input
        className="scale-input w-full"
        placeholder="Timeline"
        value={form.timeline ?? ''}
        onChange={e => setForm(f => ({ ...f, timeline: e.target.value }))}
      />
      <label className="text-[12px] text-[#6B6B80]">Competing solutions</label>
      <TagInput value={form.competingSolutions ?? []} onChange={v => setForm(f => ({ ...f, competingSolutions: v }))} />
      <label className="text-[12px] text-[#6B6B80]">Risk flags</label>
      <TagInput value={form.riskFlags ?? []} onChange={v => setForm(f => ({ ...f, riskFlags: v }))} />
      <div className="flex flex-wrap gap-2 pt-3">
        <button type="button" className="scale-btn-secondary" onClick={save}>
          Save
        </button>
        <button type="button" className="scale-btn-primary" onClick={() => saveAndAdvance('need_analysis')}>
          Save &amp; move to Need analysis
        </button>
        <button type="button" className="scale-btn-secondary" onClick={() => saveAndAdvance('proposal')}>
          Save &amp; skip to Proposal
        </button>
      </div>
    </div>
  );
}
