import { Link } from 'wouter';
import { FileText, Mic } from 'lucide-react';

export interface MeetingShortcutsCardProps {
  leadId: string;
}

export function MeetingShortcutsCard({ leadId }: MeetingShortcutsCardProps) {
  return (
    <div className="border-b border-[#E4E4E8] p-5">
      <h4 className="mb-3 text-[13px] font-medium text-[#1A1A3E]">Meeting</h4>
      <div className="space-y-2">
        <Link href={`/meetings/brief/${leadId}`}>
          <a className="scale-btn-secondary flex w-full justify-center text-[13px]">
            <FileText size={13} /> Pre-meeting brief
          </a>
        </Link>
        <Link href={`/meetings/notes/${leadId}`}>
          <a className="scale-btn-secondary flex w-full justify-center text-[13px]">
            <Mic size={13} /> Post-meeting note
          </a>
        </Link>
      </div>
    </div>
  );
}
