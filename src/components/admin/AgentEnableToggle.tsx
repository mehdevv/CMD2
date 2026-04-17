import { cn } from '@/lib/utils';

export interface AgentEnableToggleProps {
  enabled: boolean;
  onToggle: () => void;
  'aria-label'?: string;
}

export function AgentEnableToggle({ enabled, onToggle, 'aria-label': ariaLabel }: AgentEnableToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel ?? 'Toggle agent'}
      className={cn(
        'relative mt-1 h-5 w-10 flex-shrink-0 rounded-full transition-colors',
        enabled ? 'bg-[#2B62E8]' : 'bg-[#E4E4E8]'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
          enabled ? 'left-[22px]' : 'left-0.5'
        )}
      />
    </button>
  );
}
