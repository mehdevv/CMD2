import { useState } from 'react';
import { ExternalLink, Pencil } from 'lucide-react';
import type { Lead } from '@/lib/types';
import { isEnrichmentIncomplete, mockAssistantEnrichment } from '@/lib/lead-utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { EnrichmentDialog } from './EnrichmentDialog';
import { LeadScoreBadge } from './LeadScoreBadge';

interface EnrichmentCardProps {
  lead: Lead;
  onPatch: (patch: Partial<Lead>) => void;
}

export function EnrichmentCard({ lead, onPatch }: EnrichmentCardProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const incomplete = isEnrichmentIncomplete(lead);

  const handleReEnrich = () => {
    setBusy(true);
    window.setTimeout(() => {
      onPatch(mockAssistantEnrichment(lead));
      setBusy(false);
    }, 1200);
  };

  return (
    <>
      <div className="p-5 border-b border-[#E4E4E8]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[13px] font-medium text-[#1A1A3E]">Enrichment</h4>
          <button type="button" className="scale-btn-ghost text-[13px] gap-1 py-1" onClick={() => setOpen(true)}>
            <Pencil size={13} /> Edit
          </button>
        </div>

        {incomplete && !lead.email && !lead.company ? (
          <div>
            <EmptyState
              heading="No enrichment yet"
              subtext="Add contact details or run the assistant to pre-fill company signals."
            />
            <div className="flex gap-2 justify-center flex-wrap -mt-8 mb-2">
              <button type="button" className="scale-btn-secondary text-[13px]" onClick={() => setOpen(true)}>
                Add details
              </button>
              <button type="button" className="scale-btn-primary text-[13px]" disabled={busy} onClick={handleReEnrich}>
                {busy ? 'Working…' : 'Re-enrich with assistant'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-[13px]">
            {lead.email && (
              <div>
                <span className="text-[#9999AA]">Email</span>
                <div className="text-[#1A1A3E]">{lead.email}</div>
              </div>
            )}
            {(lead.company || lead.companyRole) && (
              <div>
                <span className="text-[#9999AA]">Company</span>
                <div className="text-[#1A1A3E]">
                  {lead.company ?? '—'}
                  {lead.companySize && <span className="text-[#6B6B80]"> · {lead.companySize} employees</span>}
                </div>
                {lead.companyRole && <div className="text-[#6B6B80]">{lead.companyRole}</div>}
              </div>
            )}
            {lead.website && (
              <div>
                <span className="text-[#9999AA]">Website</span>
                <a href={lead.website} target="_blank" rel="noreferrer" className="text-[#2B62E8] flex items-center gap-1">
                  {lead.website.replace(/^https?:\/\//, '')} <ExternalLink size={12} />
                </a>
              </div>
            )}
            {(lead.location?.city || lead.location?.country) && (
              <div>
                <span className="text-[#9999AA]">Location</span>
                <div className="text-[#1A1A3E]">
                  {[lead.location?.city, lead.location?.country].filter(Boolean).join(', ')}
                </div>
              </div>
            )}
            {lead.painPoints && lead.painPoints.length > 0 && (
              <div>
                <span className="text-[#9999AA]">Pain points</span>
                <ul className="list-disc list-inside text-[#6B6B80] mt-0.5">
                  {lead.painPoints.map(p => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {(lead.budgetRange || lead.timeline) && (
              <div className="grid grid-cols-2 gap-2">
                {lead.budgetRange && (
                  <div>
                    <span className="text-[#9999AA]">Budget</span>
                    <div className="text-[#1A1A3E]">{lead.budgetRange}</div>
                  </div>
                )}
                {lead.timeline && (
                  <div>
                    <span className="text-[#9999AA]">Timeline</span>
                    <div className="text-[#1A1A3E]">{lead.timeline}</div>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[#9999AA]">Score</span>
              <LeadScoreBadge score={lead.qualificationScore} />
            </div>
            <div className="pt-2 border-t border-[#E4E4E8] flex items-center justify-between">
              <span className="text-[12px] text-[#9999AA]">
                {lead.enrichedAt ? `Last enriched · ${new Date(lead.enrichedAt).toLocaleDateString()}` : 'Not enriched'}
              </span>
              <button type="button" className="scale-btn-ghost text-[12px] py-1" disabled={busy} onClick={handleReEnrich}>
                {busy ? 'Working…' : 'Re-enrich with assistant'}
              </button>
            </div>
          </div>
        )}
      </div>

      <EnrichmentDialog open={open} onOpenChange={setOpen} lead={lead} onSave={onPatch} />
    </>
  );
}
