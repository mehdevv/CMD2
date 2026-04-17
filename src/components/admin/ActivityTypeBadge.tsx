import { cn } from '@/lib/utils';
import { ACTIVITY_LOG_TYPE_LABEL, ACTIVITY_TYPE_CHIP, type ActivityLogType } from '@/components/admin/activityLogTypes';

export function ActivityTypeBadge({ type, className }: { type: ActivityLogType; className?: string }) {
  const chip = ACTIVITY_TYPE_CHIP[type];
  return (
    <span
      className={cn('inline-block rounded px-2 py-0.5 text-[11px] font-medium', className)}
      style={{ background: chip.bg, color: chip.text }}
    >
      {ACTIVITY_LOG_TYPE_LABEL[type]}
    </span>
  );
}
