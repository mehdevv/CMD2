import { Link } from 'wouter';
import { ChevronRight, FileText } from 'lucide-react';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { TakeoverToggle } from '@/components/conversations/TakeoverToggle';
import type { Lead, Stage } from '@/lib/types';

export interface ContactHeaderProps {
  lead: Lead;
  takenOver: boolean;
  onTakeoverToggle: () => void;
  onStageChange: (stage: Stage) => void;
  onConvertClick: () => void;
}

export function ContactHeader({
  lead,
  takenOver,
  onTakeoverToggle,
  onStageChange,
  onConvertClick,
}: ContactHeaderProps) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-1.5 text-[13px] text-[#6B6B80]">
        <Link href="/leads">
          <a className="hover:text-[#1A1A3E]">Leads</a>
        </Link>
        <ChevronRight size={13} />
        <span className="text-[#1A1A3E]">{lead.name}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E4E4E8] pb-4">
        <div>
          <h1 className="mb-1 text-[22px] font-semibold text-[#1A1A3E]">{lead.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#6B6B80]">
            <ChannelDot channel={lead.channel} showLabel />
            <span>{lead.phone}</span>
            {lead.source && (
              <span className="rounded bg-[#F0F0F2] px-2 py-0.5 text-xs text-[#6B6B80]">{lead.source}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link href={`/meetings/brief/${lead.id}`}>
            <a className="scale-btn-ghost gap-1.5">
              <FileText size={14} /> Generate brief
            </a>
          </Link>
          {lead.convertedOpportunityId ? (
            <Link href={`/opportunities/${lead.convertedOpportunityId}`}>
              <a className="scale-btn-secondary gap-1.5">Open opportunity</a>
            </Link>
          ) : (
            <button
              type="button"
              className="scale-btn-primary"
              disabled={lead.stage !== 'qualified'}
              title={lead.stage !== 'qualified' ? 'Mark this lead as Qualified first.' : undefined}
              onClick={onConvertClick}
            >
              Convert to opportunity
            </button>
          )}
          <TakeoverToggle takenOver={takenOver} onToggle={onTakeoverToggle} data-testid="button-take-over" />
          <select
            value={lead.stage}
            onChange={e => onStageChange(e.target.value as Stage)}
            className="scale-input w-36"
            data-testid="select-stage"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
