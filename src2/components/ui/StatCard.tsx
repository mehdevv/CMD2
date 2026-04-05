import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  className?: string;
}

export function StatCard({ label, value, delta, deltaPositive, className }: StatCardProps) {
  return (
    <div className={cn('scale-card', className)}>
      <div className="text-[28px] font-semibold text-[#1A1A3E] leading-tight">{value}</div>
      <div className="text-[13px] text-[#6B6B80] mt-1">{label}</div>
      {delta && (
        <div className={cn('text-[12px] mt-1', deltaPositive ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
          {deltaPositive ? '+' : ''}{delta}
        </div>
      )}
    </div>
  );
}
