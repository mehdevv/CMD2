import { Link, useParams } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { MOCK_MEETING_BRIEFS, MOCK_LEADS } from '@/lib/mock-data';
import { useCrmData } from '@/contexts/CrmDataContext';
import { MeetingBriefShell } from '@/components/meetings/MeetingBriefShell';

export default function MeetingBriefPage() {
  const { id } = useParams();
  const { opportunities, leads } = useCrmData();
  const brief = MOCK_MEETING_BRIEFS[0];
  const opp = opportunities.find(o => o.id === id);
  const leadFromCrm = leads.find(l => l.id === id);
  const lead = leadFromCrm ?? MOCK_LEADS.find(l => l.id === id) ?? MOCK_LEADS[3];

  const title = opp?.name ?? lead.name;
  const breadcrumbLeadId = opp?.leadId ?? lead.id;

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
      <span className="text-[#1A1A3E]">Meeting brief</span>
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
      <span className="text-[#1A1A3E]">Meeting brief</span>
    </>
  );

  const historyContent =
    opp != null ? (
      <p>
        {opp.contactName} — {opp.company ?? 'Company'} · {opp.value.toLocaleString()} DZD · Stage: {opp.stage}.{' '}
        {brief.historyContext}
      </p>
    ) : (
      <p>{brief.historyContext}</p>
    );

  const openDealsContent =
    opp != null ? (
      <p>{`${opp.name} — weighted follow-up on proposal and payment plan.`}</p>
    ) : (
      <p>{brief.openDeals}</p>
    );

  return (
    <AppShell title="Meeting Brief">
      <MeetingBriefShell
        breadcrumb={breadcrumb}
        title={title}
        brief={brief}
        historyContent={historyContent}
        openDealsContent={openDealsContent}
        footer={
          <>
            <Link href={`/meetings/notes/${breadcrumbLeadId}`}>
              <a className="scale-btn-primary">Record post-meeting note</a>
            </Link>
            <Link href={opp ? `/opportunities/${opp.id}` : `/leads/${lead.id}`}>
              <a className="scale-btn-ghost">{opp ? 'Open opportunity' : 'Open full contact'}</a>
            </Link>
          </>
        }
      />
    </AppShell>
  );
}
