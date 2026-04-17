import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StageEditorShell } from '@/components/opportunities/StageEditorShell';
import { useOpportunityFromRoute } from './useOpportunityFromRoute';
import type { NeedAnalysis, Opportunity } from '@/lib/types';
import type { AuthUser } from '@/lib/auth';
import { TagInput } from '@/components/ui/TagInput';
import { canAdvance } from '@/lib/pipeline';

const EMPTY: NeedAnalysis = {
  summary: '',
  goals: [],
  metricsToMove: [],
  decisionCriteria: [],
  stakeholders: [],
};

function buildInitialForm(opp: Opportunity): NeedAnalysis {
  if (opp.needAnalysis) return { ...EMPTY, ...opp.needAnalysis };
  const qual = opp.qualification;
  if (qual) {
    return {
      ...EMPTY,
      summary: `${opp.contactName} — ${qual.need ?? 'Discovery in progress'}`,
      goals: ['Improve response time', 'Centralize reporting'],
    };
  }
  return { ...EMPTY };
}

function NeedAnalysisEditor({
  opp,
  initialForm,
  patchOpportunity,
  user,
}: {
  opp: Opportunity;
  initialForm: NeedAnalysis;
  patchOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  user: AuthUser | null;
}) {
  const [form, setForm] = useState<NeedAnalysis>(initialForm);
  const [busy, setBusy] = useState(false);

  const draftAssistant = () => {
    setBusy(true);
    window.setTimeout(() => {
      setForm(f => ({
        ...f,
        summary: `${opp.company ?? opp.name} needs a single inbox with clear ownership and measurable SLAs.`,
        proposedSolution: 'Deploy Scale with automation playbooks and weekly pipeline reviews.',
      }));
      setBusy(false);
    }, 800);
  };

  const save = () => patchOpportunity(opp.id, { needAnalysis: form, updatedAt: new Date().toISOString() });

  const advance = () => {
    const merged = { ...opp, needAnalysis: form };
    const check = canAdvance(merged, 'proposal');
    if (!check.ok) {
      window.alert(check.reason);
      return;
    }
    const now = new Date().toISOString();
    const byId = user?.id ?? opp.ownerId;
    patchOpportunity(opp.id, {
      needAnalysis: form,
      stage: 'proposal',
      stageEnteredAt: now,
      updatedAt: now,
      stageHistory: [...opp.stageHistory, { from: opp.stage, to: 'proposal', at: now, by: byId }],
    });
  };

  return (
    <div className="scale-card p-5 max-w-2xl space-y-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-[17px] font-semibold text-[#1A1A3E]">Need analysis</h2>
        <button type="button" className="scale-btn-secondary text-[13px]" disabled={busy} onClick={draftAssistant}>
          {busy ? 'Working…' : 'Draft with assistant'}
        </button>
      </div>
      <textarea className="scale-input w-full min-h-[96px] py-2" placeholder="Summary" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
      <label className="text-[12px] text-[#6B6B80]">Goals</label>
      <TagInput value={form.goals} onChange={v => setForm(f => ({ ...f, goals: v }))} />
      <label className="text-[12px] text-[#6B6B80]">Metrics to move</label>
      <TagInput value={form.metricsToMove} onChange={v => setForm(f => ({ ...f, metricsToMove: v }))} />
      <label className="text-[12px] text-[#6B6B80]">Decision criteria</label>
      <TagInput value={form.decisionCriteria} onChange={v => setForm(f => ({ ...f, decisionCriteria: v }))} />
      <textarea className="scale-input w-full min-h-[72px] py-2" placeholder="Proposed solution" value={form.proposedSolution ?? ''} onChange={e => setForm(f => ({ ...f, proposedSolution: e.target.value }))} />
      <div className="flex gap-2 pt-2">
        <button type="button" className="scale-btn-secondary" onClick={save}>
          Save
        </button>
        <button type="button" className="scale-btn-primary" onClick={advance}>
          Save &amp; move to Proposal
        </button>
      </div>
    </div>
  );
}

export default function OpportunityNeedAnalysisPage() {
  const { opp, patchOpportunity, canAccess, user } = useOpportunityFromRoute();

  const initialForm = useMemo(() => (opp ? buildInitialForm(opp) : EMPTY), [opp]);

  const editorKey = opp ? `${opp.id}-${opp.needAnalysis ? 'saved' : 'draft'}` : 'none';

  if (!opp) return <AppShell title="Need analysis"><p className="text-[#6B6B80]">Not found</p></AppShell>;
  if (!canAccess) return <AppShell title="Need analysis"><p className="text-[#DC2626]">No access</p></AppShell>;

  return (
    <AppShell title="Need analysis">
      <StageEditorShell opportunityId={opp.id}>
        <NeedAnalysisEditor key={editorKey} opp={opp} initialForm={initialForm} patchOpportunity={patchOpportunity} user={user} />
      </StageEditorShell>
    </AppShell>
  );
}
