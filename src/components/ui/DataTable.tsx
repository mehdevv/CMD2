import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';

export interface DataTableColumn {
  key: string;
  header: string;
  className?: string;
  width?: number | string;
}

export interface DataTableRow {
  id: string;
  cells: React.ReactNode[];
  href?: string;
  'data-testid'?: string;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  empty?: React.ReactNode;
  density?: 'default' | 'compact';
  /** Zebra striping on body rows (odd index gets muted background). */
  striped?: boolean;
  className?: string;
}

export function DataTable({ columns, rows, empty, density = 'default', striped, className }: DataTableProps) {
  const [, navigate] = useLocation();
  const cellY = density === 'compact' ? 'py-2' : 'py-3';

  if (rows.length === 0) {
    return (
      <div className={cn(className)}>
        {empty ?? <EmptyState heading="Nothing to show" subtext="Try adjusting filters or check back later." />}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-[#E4E4E8] bg-[#F7F7F8]">
            {columns.map(col => (
              <th
                key={col.key}
                className={cn('px-4 font-medium text-[#6B6B80]', cellY, col.className)}
                style={col.width !== undefined ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id}
              data-testid={row['data-testid']}
              className={cn(
                'border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]',
                row.href && 'cursor-pointer',
                striped && idx % 2 === 1 && 'bg-[#F7F7F8]'
              )}
              style={density === 'default' ? { minHeight: 48 } : undefined}
              onClick={row.href ? () => navigate(row.href!) : undefined}
            >
              {row.cells.map((cell, i) => (
                <td key={columns[i]?.key ?? i} className={cn('px-4', cellY, columns[i]?.className)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
