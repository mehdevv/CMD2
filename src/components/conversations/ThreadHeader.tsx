import { Link } from 'wouter';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';
import { TakeoverToggle } from '@/components/conversations/TakeoverToggle';
import { getAgentBrandForLabel } from '@/lib/agent-brand';
import type { Conversation } from '@/lib/types';

export interface ThreadHeaderProps {
  conversation: Conversation;
  takenOver: boolean;
  onTakeoverToggle: () => void;
}

function lastAutomationSenderName(messages: Conversation['messages']): string {
  const m = [...messages].reverse().find(x => x.sender === 'ai');
  return m?.senderName ?? 'Client Chat';
}

export function ThreadHeader({ conversation, takenOver, onTakeoverToggle }: ThreadHeaderProps) {
  const agentLabel = lastAutomationSenderName(conversation.messages);
  const brand = getAgentBrandForLabel(agentLabel);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E4E4E8] px-6 py-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <span className="truncate text-[15px] font-medium text-[#1A1A3E]" title={conversation.leadName}>
          {conversation.leadName}
        </span>
        <ChannelDot channel={conversation.channel} showLabel />
        {brand ? (
          <span
            className="inline-flex max-w-[140px] flex-shrink-0 items-center truncate rounded px-2 py-0.5 text-[11px] font-medium"
            style={{ background: brand.tint, color: brand.text }}
            title={agentLabel}
          >
            {agentLabel}
          </span>
        ) : null}
        <AIStatusLabel status={conversation.aiStatus} />
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <Link href={`/leads/${conversation.leadId}`}>
          <a className="scale-btn-ghost text-[13px]">View contact</a>
        </Link>
        <TakeoverToggle
          compact
          takenOver={takenOver}
          onToggle={onTakeoverToggle}
          data-testid="button-inbox-take-over"
        />
      </div>
    </div>
  );
}
