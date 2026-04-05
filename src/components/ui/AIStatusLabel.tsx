import { AIStatus } from '@/lib/types';

const statusConfig: Record<AIStatus, { label: string; color: string }> = {
  active: { label: 'AI active', color: '#16A34A' },
  paused: { label: 'Paused', color: '#D97706' },
  completed: { label: 'Completed', color: '#9999AA' },
  escalated: { label: 'Escalated', color: '#DC2626' },
};

interface AIStatusLabelProps {
  status: AIStatus;
  className?: string;
}

export function AIStatusLabel({ status, className }: AIStatusLabelProps) {
  const config = statusConfig[status];
  return (
    <span className={className} style={{ color: config.color, fontSize: 13, fontWeight: 400 }}>
      {config.label}
    </span>
  );
}
