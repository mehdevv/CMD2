import { cn } from '@/lib/utils';

export interface SummaryStripItem {
  id: string;
  content: React.ReactNode;
}

export interface SummaryStripProps {
  items: SummaryStripItem[];
  className?: string;
}

/** Compact horizontal chips for breakdowns (pipeline by stage, channel totals, etc.). */
export function SummaryStrip({ items, className }: SummaryStripProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {items.map(item => (
        <div
          key={item.id}
          className="flex items-center gap-2 rounded-md border border-[#E4E4E8] bg-white px-3 py-2"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
