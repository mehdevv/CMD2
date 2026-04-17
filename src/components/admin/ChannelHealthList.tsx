import { cn } from '@/lib/utils';
import { ChannelDot } from '@/components/ui/ChannelDot';
import type { Channel } from '@/lib/types';

export interface ChannelHealthItem {
  channel: Channel;
  name: string;
  status: 'connected' | 'disconnected';
  msgsToday: number;
}

export interface ChannelHealthListProps {
  items: ChannelHealthItem[];
  settingsHref?: string;
}

export function ChannelHealthList({ items, settingsHref = '/admin/channels' }: ChannelHealthListProps) {
  return (
    <div className="space-y-0">
      {items.map((ch, i) => (
        <div
          key={ch.channel}
          className={cn('py-3', i < items.length - 1 && 'border-b border-[#E4E4E8]')}
        >
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChannelDot channel={ch.channel} />
              <span className="text-[14px] font-medium text-[#1A1A3E]">{ch.name}</span>
            </div>
            <a href={settingsHref} className="text-[13px] text-[#2B62E8] hover:underline">
              Settings
            </a>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn('text-[12px]', ch.status === 'connected' ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
              ● {ch.status === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-[12px] text-[#9999AA]">·</span>
            <span className="text-[12px] text-[#6B6B80]">{ch.msgsToday.toLocaleString()} msgs today</span>
          </div>
        </div>
      ))}
    </div>
  );
}
