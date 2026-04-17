import { useState } from 'react';
import type { CompanySize, Lead, LeadQualificationScore } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { TagInput } from '@/components/ui/TagInput';
import { mockAssistantEnrichment } from '@/lib/lead-utils';

const COMPANY_SIZES: CompanySize[] = ['solo', '2-10', '11-50', '51-200', '200+'];
const SCORES: LeadQualificationScore[] = ['cold', 'warm', 'hot'];

interface EnrichmentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead;
  onSave: (patch: Partial<Lead>) => void;
}

function EnrichmentDialogBody({
  lead,
  onSave,
  onOpenChange,
}: {
  lead: Lead;
  onSave: (patch: Partial<Lead>) => void;
  onOpenChange: (v: boolean) => void;
}) {
  const [email, setEmail] = useState(lead.email ?? '');
  const [whatsapp, setWhatsapp] = useState(lead.whatsapp ?? '');
  const [website, setWebsite] = useState(lead.website ?? '');
  const [linkedin, setLinkedin] = useState(lead.linkedin ?? '');
  const [instagramHandle, setInstagramHandle] = useState(lead.instagramHandle ?? '');
  const [facebookHandle, setFacebookHandle] = useState(lead.facebookHandle ?? '');
  const [company, setCompany] = useState(lead.company ?? '');
  const [companyRole, setCompanyRole] = useState(lead.companyRole ?? '');
  const [companySize, setCompanySize] = useState<CompanySize | ''>(lead.companySize ?? '');
  const [industry, setIndustry] = useState(lead.industry ?? '');
  const [city, setCity] = useState(lead.location?.city ?? '');
  const [country, setCountry] = useState(lead.location?.country ?? '');
  const [budgetRange, setBudgetRange] = useState(lead.budgetRange ?? '');
  const [timeline, setTimeline] = useState(lead.timeline ?? '');
  const [painPoints, setPainPoints] = useState<string[]>(lead.painPoints ?? []);
  const [qualificationScore, setQualificationScore] = useState<LeadQualificationScore | ''>(lead.qualificationScore ?? '');
  const [tags, setTags] = useState<string[]>(lead.tags ?? []);
  const [assistantBusy, setAssistantBusy] = useState(false);

  const handleAssistant = () => {
    setAssistantBusy(true);
    window.setTimeout(() => {
      const patch = mockAssistantEnrichment({ ...lead, email: email || lead.email });
      if (patch.company) setCompany(patch.company);
      if (patch.industry) setIndustry(patch.industry);
      if (patch.companySize) setCompanySize(patch.companySize as CompanySize);
      if (patch.painPoints?.length) setPainPoints(patch.painPoints);
      setAssistantBusy(false);
    }, 1200);
  };

  const handleSave = () => {
    onSave({
      email: email || undefined,
      whatsapp: whatsapp || undefined,
      website: website || undefined,
      linkedin: linkedin || undefined,
      instagramHandle: instagramHandle || undefined,
      facebookHandle: facebookHandle || undefined,
      company: company || undefined,
      companyRole: companyRole || undefined,
      companySize: companySize || undefined,
      industry: industry || undefined,
      location: city || country ? { city: city || undefined, country: country || undefined } : undefined,
      budgetRange: budgetRange || undefined,
      timeline: timeline || undefined,
      painPoints: painPoints.length ? painPoints : undefined,
      qualificationScore: qualificationScore || undefined,
      tags: tags.length ? tags : undefined,
      enrichedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <>
      <DialogHeader className="p-5 border-b border-[#E4E4E8]">
        <DialogTitle className="text-[17px] font-semibold text-[#1A1A3E]">Edit enrichment</DialogTitle>
        <p className="text-[13px] text-[#6B6B80] font-normal mt-1">{lead.name}</p>
      </DialogHeader>

      <div className="scale-scroll max-h-[60vh] space-y-5 overflow-y-auto overscroll-contain p-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="scale-btn-secondary text-[13px]"
            disabled={assistantBusy}
            onClick={handleAssistant}
          >
            {assistantBusy ? 'Working…' : 'Run assistant'}
          </button>
        </div>

        <section>
          <h5 className="text-[12px] font-medium text-[#9999AA] uppercase tracking-wide mb-2">Contact</h5>
          <div className="grid grid-cols-1 gap-2">
            <input className="scale-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="scale-input" placeholder="WhatsApp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            <input className="scale-input" placeholder="Website" value={website} onChange={e => setWebsite(e.target.value)} />
            <input className="scale-input" placeholder="LinkedIn URL" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
            <input className="scale-input" placeholder="Instagram handle" value={instagramHandle} onChange={e => setInstagramHandle(e.target.value)} />
            <input className="scale-input" placeholder="Facebook handle" value={facebookHandle} onChange={e => setFacebookHandle(e.target.value)} />
          </div>
        </section>

        <section>
          <h5 className="text-[12px] font-medium text-[#9999AA] uppercase tracking-wide mb-2">Company</h5>
          <div className="grid grid-cols-1 gap-2">
            <input className="scale-input" placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)} />
            <input className="scale-input" placeholder="Role / title" value={companyRole} onChange={e => setCompanyRole(e.target.value)} />
            <select
              className="scale-input"
              value={companySize}
              onChange={e => setCompanySize(e.target.value as CompanySize | '')}
            >
              <option value="">Company size</option>
              {COMPANY_SIZES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input className="scale-input" placeholder="Industry" value={industry} onChange={e => setIndustry(e.target.value)} />
            <div className="flex gap-2">
              <input className="scale-input flex-1" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
              <input className="scale-input flex-1" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
            </div>
          </div>
        </section>

        <section>
          <h5 className="text-[12px] font-medium text-[#9999AA] uppercase tracking-wide mb-2">Qualification</h5>
          <div className="grid grid-cols-1 gap-2">
            <input className="scale-input" placeholder="Budget range" value={budgetRange} onChange={e => setBudgetRange(e.target.value)} />
            <input className="scale-input" placeholder="Timeline" value={timeline} onChange={e => setTimeline(e.target.value)} />
            <label className="text-[12px] text-[#6B6B80]">Pain points</label>
            <TagInput value={painPoints} onChange={setPainPoints} placeholder="Add + Enter" />
            <label className="text-[12px] text-[#6B6B80]">Score</label>
            <div className="flex gap-2 flex-wrap">
              {SCORES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQualificationScore(s)}
                  className={`text-[13px] px-3 py-1.5 rounded-md border capitalize ${
                    qualificationScore === s
                      ? 'border-[#2B62E8] bg-[#EEF3FD] text-[#1A1A3E]'
                      : 'border-[#E4E4E8] text-[#6B6B80] hover:bg-[#F7F7F8]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <label className="text-[12px] text-[#6B6B80]">Tags</label>
            <TagInput value={tags} onChange={setTags} placeholder="Add tag + Enter" />
          </div>
        </section>
      </div>

      <DialogFooter className="p-5 border-t border-[#E4E4E8] flex gap-2 justify-end">
        <button type="button" className="scale-btn-secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </button>
        <button type="button" className="scale-btn-primary" onClick={handleSave}>
          Save changes
        </button>
      </DialogFooter>
    </>
  );
}

export function EnrichmentDialog({ open, onOpenChange, lead, onSave }: EnrichmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scale-scroll max-h-[90vh] max-w-xl overflow-y-auto overscroll-contain rounded-lg border border-[#E4E4E8] bg-white p-0">
        {open ? <EnrichmentDialogBody key={lead.id} lead={lead} onSave={onSave} onOpenChange={onOpenChange} /> : null}
      </DialogContent>
    </Dialog>
  );
}
