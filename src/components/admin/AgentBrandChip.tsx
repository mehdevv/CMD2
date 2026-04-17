import { cn } from '@/lib/utils';
import { getAgentBrandForLabel } from '@/lib/agent-brand';

export interface AgentBrandChipProps {
  label: string;
  className?: string;
}

/** Inline pill when the label maps to a known automation agent; otherwise plain truncated text. */
export function AgentBrandChip({ label, className }: AgentBrandChipProps) {
  const brand = getAgentBrandForLabel(label);
  if (!brand) {
    return (
      <span className={cn('truncate text-[#1A1A3E]', className)} title={label}>
        {label}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex max-w-[min(160px,100%)] items-center truncate rounded px-2 py-0.5 text-[11px] font-medium',
        className
      )}
      style={{ background: brand.tint, color: brand.text }}
      title={label}
    >
      {label}
    </span>
  );
}
