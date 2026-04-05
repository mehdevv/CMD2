import { Link, useParams } from 'wouter';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { MOCK_MEETING_BRIEFS, MOCK_LEADS } from '@/lib/mock-data';

export default function MeetingBriefPage() {
  const { id } = useParams();
  const brief = MOCK_MEETING_BRIEFS[0];
  const lead = MOCK_LEADS.find(l => l.id === id) ?? MOCK_LEADS[3];

  return (
    <AppShell title="Meeting Brief">
      <div className="max-w-[680px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-[13px] text-[#6B6B80] mb-3">
            <Link href="/leads"><a className="hover:text-[#1A1A3E]">Leads</a></Link>
            <ChevronRight size={13} />
            <Link href={`/leads/${lead.id}`}><a className="hover:text-[#1A1A3E]">{lead.name}</a></Link>
            <ChevronRight size={13} />
            <span className="text-[#1A1A3E]">Meeting brief</span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#1A1A3E]">{lead.name}</h1>
          <p className="text-[14px] text-[#6B6B80] mt-0.5">{brief.meetingTime}</p>
          <span className="text-[12px] text-[#9999AA] flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9999AA] inline-block" />
            AI generated
          </span>
        </div>

        <div className="border-b border-[#E4E4E8] mb-8" />

        {/* Brief sections */}
        <div className="space-y-8">
          <div>
            <div className="text-[11px] font-medium text-[#9999AA] tracking-wide mb-2">HISTORY & CONTEXT</div>
            <p className="text-[14px] text-[#1A1A3E] leading-relaxed">{brief.historyContext}</p>
          </div>

          <div>
            <div className="text-[11px] font-medium text-[#9999AA] tracking-wide mb-2">OPEN DEALS</div>
            <p className="text-[14px] text-[#1A1A3E] leading-relaxed">{brief.openDeals}</p>
          </div>

          <div>
            <div className="text-[11px] font-medium text-[#9999AA] tracking-wide mb-2">RISK FLAGS</div>
            <div className="space-y-2">
              {brief.riskFlags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-[#DC2626] mt-0.5 flex-shrink-0" />
                  <p className="text-[14px] text-[#DC2626]">{flag}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-[#9999AA] tracking-wide mb-2">SUGGESTED TALKING POINTS</div>
            <div className="space-y-2">
              {brief.talkingPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[14px] text-[#9999AA] mt-0.5 flex-shrink-0">—</span>
                  <p className="text-[14px] text-[#1A1A3E]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-10 pt-6 border-t border-[#E4E4E8]">
          <Link href={`/meetings/notes/${lead.id}`}>
            <a className="scale-btn-primary">Record post-meeting note</a>
          </Link>
          <Link href={`/leads/${lead.id}`}>
            <a className="scale-btn-ghost">Open full contact</a>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
