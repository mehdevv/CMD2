import { cn } from '@/lib/utils';

export interface TakeoverToggleProps {
  takenOver: boolean;
  onToggle: () => void;
  /** Inbox uses a slightly narrower label on the active state. */
  compact?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function TakeoverToggle({ takenOver, onToggle, compact, className, 'data-testid': testId }: TakeoverToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      data-testid={testId}
      className={cn(
        'scale-btn-secondary text-[13px]',
        takenOver && 'border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2]',
        className
      )}
    >
      {takenOver ? (compact ? 'Release' : 'Release to automation') : 'Take over'}
    </button>
  );
}
