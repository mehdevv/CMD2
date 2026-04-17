import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TimelineItemProps {
  meta: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function TimelineItem({ meta, title, description, badge, className }: TimelineItemProps) {
  return (
    <div className={cn('border-b border-[#E4E4E8] pb-3 last:border-0', className)}>
      <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#9999AA]">
        {meta}
        {badge}
      </div>
      {title ? <div className="mt-0.5 text-[13px] font-medium text-[#1A1A3E]">{title}</div> : null}
      {description ? <p className="mt-0.5 text-[13px] text-[#6B6B80]">{description}</p> : null}
    </div>
  );
}
