import { ChannelDot } from '@/components/ui/ChannelDot';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { AgentBrandChip } from '@/components/admin/AgentBrandChip';
import { MotionListRow } from '@/components/motion';
import type { Conversation } from '@/lib/types';
import { primaryAgentLabel } from '@/lib/mock-agent-conversations';
import { cn } from '@/lib/utils';

export interface ConversationListRowProps {
  conversation: Conversation;
  selected: boolean;
  onSelect: () => void;
}

export function ConversationListRow({ conversation, selected, onSelect }: ConversationListRowProps) {
  const agentLabel = primaryAgentLabel(conversation.messages ?? []);

  return (
    <MotionListRow
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'relative w-full border-b border-[#E4E4E8] text-left transition-colors duration-200',
          selected ? 'border-l-2 border-l-[#2B62E8] bg-[#F7F8FF]' : 'hover:bg-[#F7F7F8]'
        )}
        style={{ padding: '12px 14px', minHeight: 72 }}
        data-testid={`row-conv-${conversation.id}`}
      >
        <div className="flex items-start gap-2.5">
          <UserAvatar name={conversation.leadName} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center justify-between">
              <span className="truncate text-[14px] font-medium text-[#1A1A3E]">{conversation.leadName}</span>
              <span className="ml-2 flex-shrink-0 text-[12px] text-[#9999AA]">{conversation.lastTime}</span>
            </div>
            <p className="truncate text-[13px] text-[#6B6B80]">{conversation.lastMessage}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <AIStatusLabel status={conversation.aiStatus} />
                <AgentBrandChip label={agentLabel} className="max-w-[120px] truncate" />
              </div>
              <ChannelDot channel={conversation.channel} />
            </div>
          </div>
        </div>
      </button>
    </MotionListRow>
  );
}
