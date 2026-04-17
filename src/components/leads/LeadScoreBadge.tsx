import type { LeadQualificationScore } from '@/lib/types';
import { cn } from '@/lib/utils';

export function LeadScoreBadge({ score }: { score?: LeadQualificationScore }) {
  if (!score) {
    return (
      <span className="text-[11px] px-2 py-0.5 rounded border border-[#E4E4E8] text-[#9999AA]">—</span>
    );
  }
  const styles: Record<LeadQualificationScore, string> = {
    cold: 'bg-[#F0F0F2] text-[#6B6B80] border border-[#E4E4E8]',
    warm: 'bg-[#FFF5E5] text-[#B45309] border border-[#E4E4E8]',
    hot: 'bg-[#EEF3FD] text-[#1E3A8A] border border-[#E4E4E8]',
  };
  return (
    <span className={cn('text-[11px] px-2 py-0.5 rounded font-medium capitalize', styles[score])}>
      {score}
    </span>
  );
}
