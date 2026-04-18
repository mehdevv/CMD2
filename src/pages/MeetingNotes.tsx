import { useMemo } from 'react';
import { Link, useParams } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useCrmData } from '@/contexts/CrmDataContext';
import { MeetingNotesShell } from '@/components/meetings/MeetingNotesShell';
import type { MeetingNote } from '@/lib/types';

export default function MeetingNotesPage() {
  const { id } = useParams();
  const { opportunities, leads } = useCrmData();
  const opp = opportunities.find(o => o.id === id);
  const lead = leads.find(l => l.id === id) ?? (opp ? leads.find(l => l.id === opp.leadId) : undefined);

  const existingNote: MeetingNote = useMemo(() => {
    const l = lead;
    const o = opp;
    const name = o?.contactName ?? l?.name ?? 'Contact';
    return {
      id: `note-${id}`,
      leadId: l?.id ?? o?.leadId ?? '',
      leadName: name,
      summary:
        o != null
          ? `Discussion covered ${o.stage} stage progress, pricing at ${o.value.toLocaleString()} DZD, and agreed follow-ups.`
          : `Discussion with ${name} captured key needs and next steps from the lead record.`,
      objections: ['Pricing sensitivity', 'Implementation timeline'],
      opportunities: o ? [`Advance ${o.name} toward closing`, 'Send revised scope document'] : ['Qualify budget', 'Book follow-up call'],
      nextSteps: ['Send recap email within 24h', 'Update CRM stage', 'Schedule check-in'],
      createdAt: new Date().toISOString(),
      opportunityId: o?.id,
    };
  }, [lead, opp, id]);

  if (!lead && !opp) {
    return (
      <AppShell title="Meeting Notes">
        <p className="text-[14px] text-[#6B6B80]">Record not found.</p>
        <Link href="/leads">
          <a className="mt-2 inline-block text-[14px] text-[#2B62E8]">Back to Leads</a>
        </Link>
      </AppShell>
    );
  }

  const breadcrumb = opp ? (
    <>
      <Link href="/opportunities">
        <a className="hover:text-[#1A1A3E]">Pipeline</a>
      </Link>
      <ChevronRight size={13} />
      <Link href={`/opportunities/${opp.id}`}>
        <a className="hover:text-[#1A1A3E]">{opp.name}</a>
      </Link>
      <ChevronRight size={13} />
      <span className="text-[#1A1A3E]">Post-meeting notes</span>
    </>
  ) : (
    <>
      <Link href="/leads">
        <a className="hover:text-[#1A1A3E]">Leads</a>
      </Link>
      <ChevronRight size={13} />
      <Link href={`/leads/${lead!.id}`}>
        <a className="hover:text-[#1A1A3E]">{lead!.name}</a>
      </Link>
      <ChevronRight size={13} />
      <span className="text-[#1A1A3E]">Post-meeting notes</span>
    </>
  );

  return (
    <AppShell title="Meeting Notes">
      <MeetingNotesShell
        breadcrumb={breadcrumb}
        title={opp?.name ?? lead!.name}
        existingNote={existingNote}
        leadId={lead!.id}
      />
    </AppShell>
  );
}
