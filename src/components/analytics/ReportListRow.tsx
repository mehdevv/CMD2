import type { DataTableColumn, DataTableRow } from '@/components/ui/DataTable';
import type { AnalyticsReport } from '@/lib/types';

export const REPORT_LIST_COLUMNS: DataTableColumn[] = [
  { key: 'q', header: 'Question' },
  { key: 'created', header: 'Created' },
  { key: 'author', header: 'Author' },
  { key: 'status', header: 'Status' },
  { key: 'open', header: '' },
];

export function reportToDataTableRow(r: AnalyticsReport): DataTableRow {
  return {
    id: r.id,
    href: `/analytics/reports/${r.id}`,
    cells: [
      <span key="q" className="max-w-md truncate text-[#1A1A3E]">
        {r.question}
      </span>,
      <span key="c" className="text-[#6B6B80]">
        {new Date(r.createdAt).toLocaleString()}
      </span>,
      <span key="a" className="text-[#6B6B80]">
        {r.createdBy}
      </span>,
      <span key="s" className="capitalize">
        {r.status}
      </span>,
      <span key="o" className="text-[#2B62E8]">
        Open
      </span>,
    ],
  };
}
