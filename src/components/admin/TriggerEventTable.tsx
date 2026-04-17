import { Link } from 'wouter';
import { DataTable } from '@/components/ui/DataTable';
import { getAgentBrandForLabel } from '@/lib/agent-brand';

export interface TriggerEventRow {
  id: string;
  event: string;
  agent: string;
  effect: string;
  configureHref: string;
}

export interface TriggerEventTableProps {
  rows: TriggerEventRow[];
  enabled: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function TriggerEventTable({ rows, enabled, onToggle }: TriggerEventTableProps) {
  return (
    <DataTable
      columns={[
        { key: 'on', header: '', className: 'w-10' },
        { key: 'event', header: 'Trigger event' },
        { key: 'agent', header: 'Agent' },
        { key: 'effect', header: 'What happens' },
        { key: 'cfg', header: 'Configure', className: 'w-28' },
      ]}
      rows={rows.map(row => ({
        id: row.id,
        cells: [
          <input
            key="cb"
            type="checkbox"
            checked={!!enabled[row.id]}
            onChange={() => onToggle(row.id)}
            className="mt-0.5 h-4 w-4"
            aria-label={`Enable ${row.event}`}
          />,
          <span key="ev" className="font-medium text-[#1A1A3E]">
            {row.event}
          </span>,
          <span key="ag" className="flex items-center gap-2 text-[#6B6B80]">
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: getAgentBrandForLabel(row.agent)?.solid ?? '#D4D4DA' }}
              aria-hidden
            />
            {row.agent}
          </span>,
          <span key="ef" className="text-[#1A1A3E]">
            {row.effect}
          </span>,
          <Link key="ln" href={row.configureHref}>
            <a className="text-[#2B62E8] hover:underline">Open</a>
          </Link>,
        ],
      }))}
    />
  );
}
