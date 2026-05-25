import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';
import { TakeoverToggle } from '@/components/conversations/TakeoverToggle';
import { getAgentBrandForLabel } from '@/lib/agent-brand';
import type { Conversation } from '@/lib/types';

export interface ThreadHeaderProps {
  conversation: Conversation;
  takenOver: boolean;
  onTakeoverToggle: () => void;
  /** Mobile inbox: return to conversation list */
  onBack?: () => void;
}

function lastAutomationSenderName(messages: Conversation['messages']): string {
  const m = [...messages].reverse().find(x => x.sender === 'ai');
  return m?.senderName ?? 'Client Chat';
}

export function ThreadHeader({ conversation, takenOver, onTakeoverToggle, onBack }: ThreadHeaderProps) {
  const agentLabel = lastAutomationSenderName(conversation.messages);
  const brand = getAgentBrandForLabel(agentLabel);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E4E8] px-3 py-3 sm:gap-3 sm:px-6">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[#6B6B80] hover:bg-[#F7F7F8] md:hidden"
            aria-label="Back to conversations"
            data-testid="button-inbox-back"
          >
            <ArrowLeft size={18} />
          </button>
        ) : null}
        <span className="truncate text-[14px] font-medium text-[#1A1A3E] sm:text-[15px]" title={conversation.leadName}>
          {conversation.leadName}
        </span>
        <ChannelDot channel={conversation.channel} showLabel />
        {brand ? (
          <span
            className="inline-flex max-w-[120px] flex-shrink-0 items-center truncate rounded px-2 py-0.5 text-[11px] font-medium sm:max-w-[140px]"
            style={{ background: brand.tint, color: brand.text }}
            title={agentLabel}
          >
            {agentLabel}
          </span>
        ) : null}
        <AIStatusLabel status={conversation.aiStatus} />
      </div>
      <div className="flex w-full flex-shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
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
