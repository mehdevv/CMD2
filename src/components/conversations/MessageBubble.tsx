import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getAgentBrandForLabel } from '@/lib/agent-brand';

export interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { sender, senderName, timestamp, content } = message;
  const brand = sender === 'ai' ? getAgentBrandForLabel(senderName) : null;

  return (
    <div className={cn('flex flex-col gap-1', sender === 'agent' ? 'items-end' : 'items-start')}>
      <div className="flex items-center gap-1.5 text-[12px] text-[#9999AA]">
        <span className="truncate max-w-[200px]" title={senderName}>
          {senderName}
        </span>
        <span>·</span>
        <span>{timestamp}</span>
      </div>
      <div
        className={cn(
          'max-w-sm rounded-md px-3 py-2 text-[14px] text-[#1A1A3E]',
          sender === 'ai' && brand && 'border-l-4',
          sender === 'ai' && !brand && 'bg-[#F7F7F8]',
          sender === 'agent' && 'bg-[#EEF3FD]',
          sender === 'contact' && 'border border-[#E4E4E8] bg-white'
        )}
        style={
          sender === 'ai' && brand
            ? { borderLeftColor: brand.solid, background: brand.tint }
            : undefined
        }
      >
        {content}
      </div>
    </div>
  );
}
