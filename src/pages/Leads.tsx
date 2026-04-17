import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { DataTable } from '@/components/ui/DataTable';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadsKanbanBoard } from '@/components/leads/LeadsKanbanBoard';
import { AddLeadDialog } from '@/components/leads/AddLeadDialog';
import { LEAD_LIST_COLUMNS, leadToDataTableRow } from '@/components/leads/LeadRow';
import { useCrmData } from '@/contexts/CrmDataContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Stage } from '@/lib/types';
import { assignedNameToOwnerId, isEnrichmentIncomplete } from '@/lib/lead-utils';

export default function LeadsPage() {
  const { user } = useAuth();
  const { leads, addLead } = useCrmData();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [enrichmentFilter, setEnrichmentFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (user?.role === 'agent' && assignedNameToOwnerId(l.assignedTo) !== user.id) return false;
      if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (stageFilter && l.stage !== stageFilter) return false;
      if (channelFilter && l.channel !== channelFilter) return false;
      if (enrichmentFilter === 'complete' && isEnrichmentIncomplete(l)) return false;
      if (enrichmentFilter === 'incomplete' && !isEnrichmentIncomplete(l)) return false;
      return true;
    });
  }, [leads, user, search, stageFilter, channelFilter, enrichmentFilter]);

  const byStage = (stage: Stage) => filtered.filter(l => l.stage === stage);

  return (
    <AppShell title="Leads">
      <PageHeader title="Leads" subtitle="Pipeline before opportunities." />

      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
        enrichmentFilter={enrichmentFilter}
        onEnrichmentFilterChange={setEnrichmentFilter}
        view={view}
        onViewChange={setView}
        onAddLead={() => setAddOpen(true)}
      />

      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} onCreate={addLead} />

      {view === 'kanban' ? (
        <LeadsKanbanBoard leadsByStage={byStage} />
      ) : (
        <PageSection padding="none">
          <DataTable
            striped
            density="compact"
            columns={LEAD_LIST_COLUMNS}
            rows={filtered.map(leadToDataTableRow)}
          />
        </PageSection>
      )}
    </AppShell>
  );
}
