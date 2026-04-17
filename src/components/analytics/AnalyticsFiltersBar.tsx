import type { AnalyticsFilters } from '@/lib/types';

export interface AnalyticsFiltersBarProps {
  filters: AnalyticsFilters;
  onChange: (next: AnalyticsFilters) => void;
}

export function AnalyticsFiltersBar({ filters, onChange }: AnalyticsFiltersBarProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <input
        type="date"
        className="scale-input w-40"
        value={filters.from ?? ''}
        onChange={e => onChange({ ...filters, from: e.target.value || undefined })}
      />
      <input
        type="date"
        className="scale-input w-40"
        value={filters.to ?? ''}
        onChange={e => onChange({ ...filters, to: e.target.value || undefined })}
      />
      <select
        className="scale-input w-36"
        value={filters.channel ?? 'all'}
        onChange={e => onChange({ ...filters, channel: e.target.value as AnalyticsFilters['channel'] })}
      >
        <option value="all">All channels</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
      </select>
      <select
        className="scale-input w-40"
        value={filters.ownerId ?? 'all'}
        onChange={e => onChange({ ...filters, ownerId: e.target.value })}
      >
        <option value="all">All owners</option>
        <option value="agent-1">Mehdi Kaci</option>
        <option value="agent-2">Sara Boukhalfa</option>
        <option value="agent-3">Nassim Rahmani</option>
        <option value="user-2">Sara Owner</option>
      </select>
    </div>
  );
}
