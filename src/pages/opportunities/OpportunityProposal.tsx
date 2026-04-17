import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StageEditorShell } from '@/components/opportunities/StageEditorShell';
import { useOpportunityFromRoute } from './useOpportunityFromRoute';
import type { Proposal } from '@/lib/types';
import { canAdvance } from '@/lib/pipeline';

export default function OpportunityProposalPage() {
  const { opp, patchOpportunity, canAccess, user } = useOpportunityFromRoute();
  const [title, setTitle] = useState('Standard offer');
  const [value, setValue] = useState('');

  if (!opp) return <AppShell title="Proposal"><p className="text-[#6B6B80]">Not found</p></AppShell>;
  if (!canAccess) return <AppShell title="Proposal"><p className="text-[#DC2626]">No access</p></AppShell>;

  const addDraft = () => {
    const v = Number(value.replace(/\s/g, '')) || opp.value;
    const now = new Date().toISOString();
    const next: Proposal = {
      id: `prop-${Date.now()}`,
      version: (opp.proposals[opp.proposals.length - 1]?.version ?? 0) + 1,
      title,
      value: v,
      currency: 'DZD',
      status: 'draft',
      createdAt: now,
    };
    patchOpportunity(opp.id, { proposals: [...opp.proposals, next], updatedAt: now });
    setValue('');
  };

  const markSent = (pid: string) => {
    const now = new Date().toISOString();
    const proposals = opp.proposals.map(p =>
      p.id === pid ? { ...p, status: 'sent' as const, sentAt: now } : p
    );
    patchOpportunity(opp.id, { proposals, updatedAt: now });
  };

  const secondOffer = () => {
    const now = new Date().toISOString();
    const last = opp.proposals[opp.proposals.length - 1];
    const baseVal = last?.value ?? opp.value;
    const next: Proposal = {
      id: `prop-${Date.now()}`,
      version: (last?.version ?? 0) + 1,
      title: `${last?.title ?? 'Offer'} — upsell bundle`,
      value: Math.round(baseVal * 1.12),
      currency: 'DZD',
      status: 'draft',
      notes: 'Includes onboarding pack',
      createdAt: now,
    };
    patchOpportunity(opp.id, { proposals: [...opp.proposals, next], updatedAt: now });
  };

  const advance = () => {
    const merged = { ...opp };
    const check = canAdvance(merged, 'negotiation');
    if (!check.ok) {
      window.alert(check.reason);
      return;
    }
    const now = new Date().toISOString();
    const byId = user?.id ?? opp.ownerId;
    patchOpportunity(opp.id, {
      stage: 'negotiation',
      stageEnteredAt: now,
      updatedAt: now,
      stageHistory: [...opp.stageHistory, { from: opp.stage, to: 'negotiation', at: now, by: byId }],
    });
  };

  return (
    <AppShell title="Proposal">
      <StageEditorShell opportunityId={opp.id}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="scale-card p-5 space-y-3">
          <h2 className="text-[17px] font-semibold text-[#1A1A3E]">New version</h2>
          <input className="scale-input w-full" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="scale-input w-full" placeholder="Value DZD" value={value} onChange={e => setValue(e.target.value)} />
          <button type="button" className="scale-btn-primary" onClick={addDraft}>
            Add draft
          </button>
          <button type="button" className="scale-btn-secondary" onClick={secondOffer}>
            Draft a second offer
          </button>
        </div>
        <div className="scale-card p-5">
          <h3 className="text-[15px] font-semibold text-[#1A1A3E] mb-3">Versions</h3>
          <ul className="space-y-2 text-[13px]">
            {opp.proposals.map(p => (
              <li key={p.id} className="border border-[#E4E4E8] rounded-md p-2 flex justify-between gap-2">
                <div>
                  <div className="font-medium text-[#1A1A3E]">v{p.version} · {p.title}</div>
                  <div className="text-[#6B6B80]">{p.value.toLocaleString()} DZD · {p.status}</div>
                </div>
                {p.status === 'draft' && (
                  <button type="button" className="scale-btn-secondary text-[12px] shrink-0" onClick={() => markSent(p.id)}>
                    Mark sent
                  </button>
                )}
              </li>
            ))}
            {opp.proposals.length === 0 && <li className="text-[#9999AA]">No proposals yet.</li>}
          </ul>
          <button type="button" className="scale-btn-primary mt-4" onClick={advance}>
            Move to Negotiation
          </button>
        </div>
      </div>
      </StageEditorShell>
    </AppShell>
  );
}
