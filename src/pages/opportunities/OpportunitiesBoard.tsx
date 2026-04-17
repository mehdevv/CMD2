import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCrmData } from '@/contexts/CrmDataContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Opportunity, OpportunityStage } from '@/lib/types';
import { OpportunityMoveConfirm } from '@/components/opportunities/OpportunityMoveConfirm';
import { OpportunityBoard } from '@/components/opportunities/OpportunityBoard';

export default function OpportunitiesBoardPage() {
  const { user } = useAuth();
  const { opportunities, patchOpportunity } = useCrmData();
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ opp: Opportunity; to: OpportunityStage } | null>(null);

  const visible = useMemo(() => {
    if (user?.role === 'agent') return opportunities.filter(o => o.ownerId === user.id);
    return opportunities;
  }, [opportunities, user]);

  const byStage = (s: OpportunityStage) => visible.filter(o => o.stage === s);

  const applyMove = () => {
    if (!pending) return;
    const { opp, to } = pending;
    const now = new Date().toISOString();
    patchOpportunity(opp.id, {
      stage: to,
      stageEnteredAt: now,
      updatedAt: now,
      outcome: to === 'won' ? 'won' : to === 'lost' ? 'lost' : 'open',
      stageHistory: [...opp.stageHistory, { from: opp.stage, to, at: now, by: user?.id ?? opp.ownerId }],
    });
    setPending(null);
  };

  return (
    <AppShell title="Pipeline board">
      <PageHeader
        title="Pipeline board"
        subtitle="Drag a card to another column, then confirm."
        actions={
          <Link href="/opportunities">
            <a className="scale-btn-secondary text-[13px]">List view</a>
          </Link>
        }
      />

      <OpportunityMoveConfirm
        open={!!pending}
        onOpenChange={v => !v && setPending(null)}
        opportunity={pending?.opp ?? null}
        targetStage={pending?.to ?? null}
        onConfirm={() => {
          applyMove();
          setPending(null);
        }}
      />

      <OpportunityBoard
        byStage={byStage}
        onColumnDrop={col => {
          if (!dragId) return;
          const opp = visible.find(o => o.id === dragId);
          if (opp) setPending({ opp, to: col });
          setDragId(null);
        }}
        onCardDragStart={setDragId}
        onCardDragEnd={() => setDragId(null)}
      />
    </AppShell>
  );
}
