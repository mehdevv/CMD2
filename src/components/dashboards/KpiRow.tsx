import { StatCard, type StatCardProps } from '@/components/ui/StatCard';
import { cn } from '@/lib/utils';

const COLS: Record<2 | 3 | 4 | 5, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export interface KpiRowProps {
  items: StatCardProps[];
  cols?: 2 | 3 | 4 | 5;
  /** When set, replaces the default `grid-cols-*` from `cols` (e.g. `grid-cols-2 lg:grid-cols-4`). */
  gridClassName?: string;
  className?: string;
}

export function KpiRow({ items, cols = 4, gridClassName, className }: KpiRowProps) {
  return (
    <div className={cn('grid gap-4 mb-8', gridClassName ?? COLS[cols], className)}>
      {items.map((item, i) => (
        <StatCard key={`${item.label}-${String(item.value)}-${i}`} {...item} />
      ))}
    </div>
  );
}
