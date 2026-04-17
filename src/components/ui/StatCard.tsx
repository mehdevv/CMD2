import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  className?: string;
}

export function StatCard({ label, value, delta, deltaPositive, className }: StatCardProps) {
  const deltaText = delta ? `${deltaPositive ? '+' : ''}${delta}` : '';
  return (
    <div className={cn('scale-card', className)}>
      <div className="truncate text-[28px] font-semibold leading-tight text-[#1A1A3E]" title={String(value)}>
        {value}
      </div>
      <div className="mt-1 truncate text-[13px] text-[#6B6B80]" title={label}>
        {label}
      </div>
      {delta ? (
        <div
          className={cn('mt-1 truncate text-[12px]', deltaPositive ? 'text-[#16A34A]' : 'text-[#DC2626]')}
          title={deltaText}
        >
          {deltaText}
        </div>
      ) : null}
    </div>
  );
}
