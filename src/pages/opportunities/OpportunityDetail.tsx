import { useMemo, useState } from 'react';
import { Link, useParams } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageSection } from '@/components/layout/PageSection';
import { useCrmData } from '@/contexts/CrmDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { WonLostDialog } from '@/components/opportunities/WonLostDialog';
import { StageStepper } from '@/components/opportunities/StageStepper';
import { OpportunityRecordHeader } from '@/components/opportunities/OpportunityRecordHeader';
import { OpportunityTabsNav } from '@/components/opportunities/OpportunityTabsNav';
import { OpportunityTimeline } from '@/components/opportunities/OpportunityTimeline';
import type { OpportunityStage } from '@/lib/types';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { opportunities, patchOpportunity } = useCrmData();
  const opp = opportunities.find(o => o.id === id);
  const [wonLostOpen, setWonLostOpen] = useState(false);
  const [wonLostMode, setWonLostMode] = useState<'won' | 'lost' | null>(null);

  const canAccess = useMemo(() => {
    if (!user || !opp) return false;
    if (user.role === 'admin' || user.role === 'owner') return true;
    return opp.ownerId === user.id;
  }, [user, opp]);

  if (!opp) {
    return (
      <AppShell title="Opportunity">
        <p className="text-[14px] text-[#6B6B80]">Opportunity not found.</p>
        <Link href="/opportunities">
          <a className="mt-2 inline-block text-[14px] text-[#2B62E8]">Back to opportunities</a>
        </Link>
      </AppShell>
    );
  }

  if (!canAccess) {
    return (
      <AppShell title="Opportunity">
        <div className="scale-card border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[14px] text-[#B91C1C]">
          You do not have access to this opportunity.
        </div>
      </AppShell>
    );
  }

  const advanceTo = (to: OpportunityStage) => {
    const now = new Date().toISOString();
    patchOpportunity(opp.id, {
      stage: to,
      stageEnteredAt: now,
      updatedAt: now,
      outcome: to === 'won' ? 'won' : to === 'lost' ? 'lost' : 'open',
      stageHistory: [...opp.stageHistory, { from: opp.stage, to, at: now, by: user?.id ?? opp.ownerId }],
    });
  };

  return (
    <AppShell title={opp.name}>
      <WonLostDialog
        open={wonLostOpen}
        mode={wonLostMode}
        opportunity={opp}
        onOpenChange={v => {
          setWonLostOpen(v);
          if (!v) setWonLostMode(null);
        }}
        onConfirm={patch => patchOpportunity(opp.id, patch)}
      />

      <div className="mb-3 flex items-center gap-1.5 text-[13px] text-[#6B6B80]">
        <Link href="/opportunities">
          <a className="hover:text-[#1A1A3E]">Pipeline</a>
        </Link>
        <ChevronRight size={13} />
        <span className="truncate text-[#1A1A3E]">{opp.name}</span>
      </div>

      <OpportunityRecordHeader
        opportunity={opp}
        onAdvanceStage={advanceTo}
        onMarkWon={() => {
          setWonLostMode('won');
          setWonLostOpen(true);
        }}
        onMarkLost={() => {
          setWonLostMode('lost');
          setWonLostOpen(true);
        }}
      />

      <StageStepper opportunityId={opp.id} current={opp.stage} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PageSection title="Stage workspace" description="Open the workspace for the current stage to capture notes, proposals, and payments.">
            <OpportunityTabsNav opportunityId={opp.id} />
          </PageSection>

          <PageSection title="Activity">
            <OpportunityTimeline opportunity={opp} />
          </PageSection>
        </div>

        <div className="space-y-4">
          <PageSection title="Deal">
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#9999AA]">Value</span>
                <span className="text-[#1A1A3E]">{opp.value.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9999AA]">Payment</span>
                <span className="text-[#1A1A3E] capitalize">{opp.paymentStatus.replace(/_/g, ' ')}</span>
              </div>
              {opp.expectedCloseDate && (
                <div className="flex justify-between">
                  <span className="text-[#9999AA]">Expected close</span>
                  <span className="text-[#1A1A3E]">{opp.expectedCloseDate}</span>
                </div>
              )}
            </div>
          </PageSection>
          <PageSection title="Next step">
            <p className="text-[13px] text-[#6B6B80]">{opp.nextStepText ?? '—'}</p>
            {opp.nextStepAt && <p className="mt-1 text-[12px] text-[#9999AA]">{opp.nextStepAt}</p>}
          </PageSection>
        </div>
      </div>
    </AppShell>
  );
}
