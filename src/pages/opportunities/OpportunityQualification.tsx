import { AppShell } from '@/components/layout/AppShell';
import { useOpportunityFromRoute } from './useOpportunityFromRoute';
import { StageEditorShell } from '@/components/opportunities/StageEditorShell';
import { QualificationForm } from '@/components/opportunities/QualificationForm';

export default function OpportunityQualificationPage() {
  const { opp, patchOpportunity, canAccess, user } = useOpportunityFromRoute();

  if (!opp)
    return (
      <AppShell title="Qualification">
        <p className="text-[#6B6B80]">Not found</p>
      </AppShell>
    );
  if (!canAccess)
    return (
      <AppShell title="Qualification">
        <p className="text-[#DC2626]">No access</p>
      </AppShell>
    );

  return (
    <AppShell title="Qualification">
      <StageEditorShell opportunityId={opp.id}>
        <QualificationForm opp={opp} patchOpportunity={patchOpportunity} user={user} />
      </StageEditorShell>
    </AppShell>
  );
}
