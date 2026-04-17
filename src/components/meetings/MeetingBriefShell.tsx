import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { MeetingBrief } from '@/lib/types';

export interface MeetingBriefShellProps {
  breadcrumb: ReactNode;
  title: string;
  brief: MeetingBrief;
  historyContent: ReactNode;
  openDealsContent: ReactNode;
  footer: ReactNode;
}

export function MeetingBriefShell({
  breadcrumb,
  title,
  brief,
  historyContent,
  openDealsContent,
  footer,
}: MeetingBriefShellProps) {
  return (
    <div className="mx-auto max-w-[680px]">
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-1.5 text-[13px] text-[#6B6B80]">{breadcrumb}</div>
        <h1 className="text-[22px] font-semibold text-[#1A1A3E]">{title}</h1>
        <p className="mt-0.5 text-[14px] text-[#6B6B80]">{brief.meetingTime}</p>
        <span className="mt-1 flex items-center gap-1 text-[12px] text-[#9999AA]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9999AA]" />
          Assistant generated
        </span>
      </div>

      <div className="mb-8 border-b border-[#E4E4E8]" />

      <div className="space-y-8">
        <section>
          <div className="mb-2 text-[11px] font-medium tracking-wide text-[#9999AA]">HISTORY &amp; CONTEXT</div>
          <div className="text-[14px] leading-relaxed text-[#1A1A3E]">{historyContent}</div>
        </section>

        <section>
          <div className="mb-2 text-[11px] font-medium tracking-wide text-[#9999AA]">OPEN DEALS</div>
          <div className="text-[14px] leading-relaxed text-[#1A1A3E]">{openDealsContent}</div>
        </section>

        <section>
          <div className="mb-2 text-[11px] font-medium tracking-wide text-[#9999AA]">RISK FLAGS</div>
          <div className="space-y-2">
            {brief.riskFlags.map((flag, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-[#DC2626]" />
                <p className="text-[14px] text-[#DC2626]">{flag}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 text-[11px] font-medium tracking-wide text-[#9999AA]">SUGGESTED TALKING POINTS</div>
          <div className="space-y-2">
            {brief.talkingPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 text-[14px] text-[#9999AA]">—</span>
                <p className="text-[14px] text-[#1A1A3E]">{point}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[#E4E4E8] pt-6">{footer}</div>
    </div>
  );
}
