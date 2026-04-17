import { LayoutGrid, List, Plus } from 'lucide-react';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import type { Stage } from '@/lib/types';

const STAGES: Stage[] = ['new', 'contacted', 'qualified', 'proposal', 'closed'];
const STAGE_LABELS: Record<Stage, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  closed: 'Closed',
};

export interface LeadFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  stageFilter: string;
  onStageFilterChange: (v: string) => void;
  channelFilter: string;
  onChannelFilterChange: (v: string) => void;
  enrichmentFilter: 'all' | 'complete' | 'incomplete';
  onEnrichmentFilterChange: (v: 'all' | 'complete' | 'incomplete') => void;
  view: 'kanban' | 'list';
  onViewChange: (v: 'kanban' | 'list') => void;
  onAddLead: () => void;
}

export function LeadFilters({
  search,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  channelFilter,
  onChannelFilterChange,
  enrichmentFilter,
  onEnrichmentFilterChange,
  view,
  onViewChange,
  onAddLead,
}: LeadFiltersProps) {
  return (
    <FilterToolbar
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: 'Search leads...',
        inputTestId: 'input-search-leads',
      }}
      filters={
        <>
          <select
            value={stageFilter}
            onChange={e => onStageFilterChange(e.target.value)}
            className="scale-input w-36"
            data-testid="select-filter-stage"
          >
            <option value="">All stages</option>
            {STAGES.map(s => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={channelFilter}
            onChange={e => onChannelFilterChange(e.target.value)}
            className="scale-input w-36"
            data-testid="select-filter-channel"
          >
            <option value="">All channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>
          <select
            value={enrichmentFilter}
            onChange={e => onEnrichmentFilterChange(e.target.value as 'all' | 'complete' | 'incomplete')}
            className="scale-input w-44"
          >
            <option value="all">Enrichment: All</option>
            <option value="complete">Enrichment: Complete</option>
            <option value="incomplete">Enrichment: Incomplete</option>
          </select>
        </>
      }
      right={
        <>
          <div className="flex items-center overflow-hidden rounded-md border border-[#E4E4E8]">
            <button
              type="button"
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] transition-colors ${view === 'kanban' ? 'bg-[#F0F0F2] font-medium text-[#1A1A3E]' : 'text-[#6B6B80] hover:bg-[#F7F7F8]'}`}
              data-testid="button-view-kanban"
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <div className="h-6 w-px bg-[#E4E4E8]" />
            <button
              type="button"
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] transition-colors ${view === 'list' ? 'bg-[#F0F0F2] font-medium text-[#1A1A3E]' : 'text-[#6B6B80] hover:bg-[#F7F7F8]'}`}
              data-testid="button-view-list"
            >
              <List size={14} /> List
            </button>
          </div>
          <button type="button" className="scale-btn-primary" data-testid="button-add-lead" onClick={onAddLead}>
            <Plus size={14} /> Add lead
          </button>
        </>
      }
    />
  );
}
