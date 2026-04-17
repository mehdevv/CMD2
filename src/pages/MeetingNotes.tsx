import { Link, useParams } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { MOCK_LEADS, MOCK_MEETING_NOTES } from '@/lib/mock-data';
import { useCrmData } from '@/contexts/CrmDataContext';
import { MeetingNotesShell } from '@/components/meetings/MeetingNotesShell';

export default function MeetingNotesPage() {
  const { id } = useParams();
  const { opportunities, leads } = useCrmData();
  const opp = opportunities.find(o => o.id === id);
  const leadFromCrm = leads.find(l => l.id === id);
  const lead = leadFromCrm ?? MOCK_LEADS.find(l => l.id === id) ?? MOCK_LEADS[3];
  const existingNote = MOCK_MEETING_NOTES[0];

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
      <Link href={`/leads/${lead.id}`}>
        <a className="hover:text-[#1A1A3E]">{lead.name}</a>
      </Link>
      <ChevronRight size={13} />
      <span className="text-[#1A1A3E]">Post-meeting notes</span>
    </>
  );

  return (
    <AppShell title="Meeting Notes">
      <MeetingNotesShell
        breadcrumb={breadcrumb}
        title={opp?.name ?? lead.name}
        existingNote={existingNote}
        leadId={lead.id}
      />
    </AppShell>
  );
}
