import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { AgentBrandChip } from '@/components/admin/AgentBrandChip';
import type { Conversation } from '@/lib/types';

export interface DraftsToApproveListProps {
  conversations: Conversation[];
}

function lastAutomationAgentLabel(messages: Conversation['messages']): string {
  const m = [...messages].reverse().find(x => x.sender === 'ai');
  return m?.senderName ?? 'Client Chat';
}

export function DraftsToApproveList({ conversations }: DraftsToApproveListProps) {
  return (
    <div className="space-y-0">
      {conversations.map((conv, i) => (
        <div
          key={conv.id}
          className={cn(
            'flex items-start gap-3 py-2.5',
            i < conversations.length - 1 && 'border-b border-[#E4E4E8]'
          )}
        >
          <ChannelDot channel={conv.channel} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-[#1A1A3E]" title={conv.leadName}>
              {conv.leadName}
            </p>
            <p className="truncate text-[12px] text-[#6B6B80]" title={conv.lastMessage}>
              {conv.lastMessage}
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
            <AgentBrandChip
              label={lastAutomationAgentLabel(conv.messages)}
              className="max-w-[104px] justify-end"
            />
            <Link href={`/leads/${conv.leadId}`}>
              <a className="whitespace-nowrap text-[13px] text-[#2B62E8] hover:underline">Review</a>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
