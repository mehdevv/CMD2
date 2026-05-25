import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLeadFollowUpLog } from '@/hooks/useLeadFollowUpLog';
import type { Message } from '@/lib/types';

export interface FollowUpLogProps {
  leadId: string;
  messages: Message[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function statusFromKind(kind: string): 'read' | 'delivered' | 'sent' {
  if (kind === 'escalation') return 'sent';
  return 'delivered';
}

const AUTOMATION_ACTIVITY_KINDS = new Set(['sequence', 'chat', 'tracking', 'refund', 'enrichment', 'escalation', 'other', 'opportunity']);

export function FollowUpLog({ leadId, messages, open, onOpenChange }: FollowUpLogProps) {
  const { data: activity = [] } = useLeadFollowUpLog(leadId);

  const automationMessages = messages.filter(m => m.sender === 'ai');
  const steps =
    activity.length > 0
      ? activity
          .filter(a => AUTOMATION_ACTIVITY_KINDS.has(a.kind))
          .slice(0, 6)
          .map((a, i) => ({
            step: i + 1,
            preview: a.summary,
            time: a.timeLabel,
            status: statusFromKind(a.kind),
          }))
      : automationMessages.slice(0, 5).map((m, i) => ({
          step: i + 1,
          preview: m.content,
          time: new Date(m.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status: (m.status ?? 'delivered') as 'read' | 'delivered' | 'sent',
        }));

  return (
    <div className="border-t border-[#E4E4E8]">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center justify-between px-5 py-2.5 text-left text-[13px] text-[#6B6B80] transition-colors hover:bg-[#F7F7F8]"
        data-testid="button-toggle-followup-log"
      >
        <span>Automation log ({steps.length})</span>
        <ChevronRight size={13} className={cn('transition-transform', open && 'rotate-90')} />
      </button>
      {open && (
        <div className="space-y-2 px-5 pb-4">
          {steps.length === 0 ? (
            <p className="text-[13px] text-[#9999AA]">No automation steps yet — add a lead to start the sequence.</p>
          ) : (
            steps.map(log => (
              <div key={log.step} className="flex items-center gap-3 text-[13px]">
                <span className="w-12 text-[#9999AA]">Step {log.step}</span>
                <span className="flex-1 truncate text-[#6B6B80]">{log.preview}</span>
                <span className="text-[#9999AA]">{log.time}</span>
                <span className={`text-[12px] ${log.status === 'read' ? 'text-[#16A34A]' : 'text-[#D97706]'}`}>
                  ● {log.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
