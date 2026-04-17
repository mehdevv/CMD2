import type { ReactNode } from 'react';
import { Send } from 'lucide-react';
import type { AIStatus, Message } from '@/lib/types';
import { MessageBubble } from '@/components/conversations/MessageBubble';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';

export type ConversationComposeMode = 'textarea' | 'input';

export interface ConversationThreadProps {
  messages: Message[];
  composeMode?: ConversationComposeMode;
  message: string;
  onMessageChange: (v: string) => void;
  takenOver: boolean;
  onRequestTakeover?: () => void;
  threadAiStatus?: AIStatus;
  sendDisabledReason?: string;
  /** Renders between the message list and the compose bar (e.g. follow-up log). */
  betweenMessagesAndCompose?: ReactNode;
  fillParent?: boolean;
  /** Inbox: no outer card chrome (messages + compose only). */
  variant?: 'card' | 'plain';
}

export function ConversationThread({
  messages,
  composeMode = 'textarea',
  message,
  onMessageChange,
  takenOver,
  onRequestTakeover,
  threadAiStatus,
  sendDisabledReason,
  betweenMessagesAndCompose,
  fillParent,
  variant = 'card',
}: ConversationThreadProps) {
  const placeholder = takenOver
    ? 'Write a message...'
    : composeMode === 'textarea'
      ? 'Automation is handling this conversation. Take over to write manually.'
      : 'Take over to send manually...';

  const shell =
    variant === 'plain'
      ? 'flex min-h-0 flex-1 flex-col overflow-hidden bg-white'
      : 'scale-card flex min-h-0 flex-1 flex-col overflow-hidden p-0';

  return (
    <div className={shell}>
      <div
        className={
          fillParent
            ? 'scale-scroll min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-6'
            : 'scale-scroll max-h-[480px] flex-1 space-y-4 overflow-y-auto overscroll-contain p-5'
        }
      >
        {messages.map(m => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      {betweenMessagesAndCompose}

      <div className="border-t border-[#E4E4E8] p-4">
        <div className="flex gap-2">
          {composeMode === 'textarea' ? (
            <textarea
              value={message}
              onChange={e => onMessageChange(e.target.value)}
              placeholder={placeholder}
              disabled={!takenOver}
              className="scale-input h-20 flex-1 resize-none py-2"
              data-testid="textarea-compose"
            />
          ) : (
            <input
              type="text"
              value={message}
              onChange={e => onMessageChange(e.target.value)}
              placeholder={placeholder}
              disabled={!takenOver}
              className="scale-input flex-1"
              data-testid="input-compose-inbox"
            />
          )}
          <button
            type="button"
            className="scale-btn-primary self-end px-3"
            disabled={!takenOver || !message}
            data-testid={composeMode === 'textarea' ? 'button-send' : 'button-send-inbox'}
          >
            {composeMode === 'textarea' ? <Send size={14} /> : 'Send'}
          </button>
        </div>
        {!takenOver && composeMode === 'textarea' && onRequestTakeover && threadAiStatus && (
          <p className="mt-2 flex items-center gap-1 text-[12px] text-[#9999AA]">
            <AIStatusLabel status={threadAiStatus} /> ·
            <button type="button" className="text-[#2B62E8] hover:underline" onClick={onRequestTakeover}>
              Take over
            </button>{' '}
            to send manually
          </p>
        )}
        {!takenOver && composeMode === 'input' && sendDisabledReason ? (
          <p className="mt-2 text-[12px] text-[#9999AA]">{sendDisabledReason}</p>
        ) : null}
      </div>
    </div>
  );
}
