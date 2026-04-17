import type { Channel } from '@/lib/types';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { cn } from '@/lib/utils';

export interface ActivityRowProps {
  channel: Channel;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  trailing?: React.ReactNode;
  showDivider?: boolean;
  /** When set, a 3px left bar uses this color (automation agent accent). */
  leftAccentColor?: string | null;
}

/** Single-line feed row: channel + primary label + optional body + trailing meta. */
export function ActivityRow({ channel, primary, secondary, trailing, showDivider, leftAccentColor }: ActivityRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2.5',
        leftAccentColor && 'border-l-[3px] pl-2',
        showDivider && 'border-b border-[#E4E4E8]'
      )}
      style={leftAccentColor ? { borderLeftColor: leftAccentColor } : undefined}
    >
      <ChannelDot channel={channel} />
      <span className="min-w-[120px] max-w-[140px] truncate text-[13px] font-medium text-[#1A1A3E]">{primary}</span>
      {secondary != null ? (
        <span className="min-w-0 flex-1 truncate text-[13px] text-[#6B6B80]">{secondary}</span>
      ) : (
        <span className="min-w-0 flex-1" />
      )}
      {trailing != null ? (
        <span className="flex-shrink-0 whitespace-nowrap text-[12px] text-[#9999AA]">{trailing}</span>
      ) : null}
    </div>
  );
}
