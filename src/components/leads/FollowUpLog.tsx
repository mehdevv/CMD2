import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_STEPS = [
  { step: 1, preview: 'Bonjour Mohamed, merci de nous avoir contacté...', time: '2h ago', status: 'read' as const },
  { step: 2, preview: 'Hey, just following up — are you still interested?', time: '5h ago', status: 'delivered' as const },
];

export interface FollowUpLogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowUpLog({ open, onOpenChange }: FollowUpLogProps) {
  return (
    <div className="border-t border-[#E4E4E8]">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center justify-between px-5 py-2.5 text-left text-[13px] text-[#6B6B80] transition-colors hover:bg-[#F7F7F8]"
        data-testid="button-toggle-followup-log"
      >
        <span>Follow-up log</span>
        <ChevronRight size={13} className={cn('transition-transform', open && 'rotate-90')} />
      </button>
      {open && (
        <div className="space-y-2 px-5 pb-4">
          {MOCK_STEPS.map(log => (
            <div key={log.step} className="flex items-center gap-3 text-[13px]">
              <span className="w-12 text-[#9999AA]">Step {log.step}</span>
              <span className="flex-1 truncate text-[#6B6B80]">{log.preview}</span>
              <span className="text-[#9999AA]">{log.time}</span>
              <span className={`text-[12px] ${log.status === 'read' ? 'text-[#16A34A]' : 'text-[#D97706]'}`}>
                ● {log.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
