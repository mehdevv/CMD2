import { cn } from '@/lib/utils';

export interface PageSectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  padding?: 'default' | 'none';
  children: React.ReactNode;
  className?: string;
}

export function PageSection({ title, description, action, padding = 'default', children, className }: PageSectionProps) {
  const flush = padding === 'none';

  return (
    <div className={cn('scale-card', flush && 'p-0 overflow-hidden', className)}>
      {title || description || action ? (
        <div
          className={cn(
            'flex items-start justify-between gap-3',
            flush ? 'px-4 py-4 border-b border-[#E4E4E8]' : 'mb-4'
          )}
        >
          <div className="min-w-0">
            {title ? <h3 className="text-[15px] font-medium text-[#1A1A3E]">{title}</h3> : null}
            {description ? <p className="text-[13px] text-[#6B6B80] mt-1">{description}</p> : null}
          </div>
          {action ? <div className="flex-shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn(flush && (title || description || action) && 'px-0 pb-0')}>{children}</div>
    </div>
  );
}
