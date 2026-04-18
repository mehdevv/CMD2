import { useMemo } from 'react';
import { Link, useParams } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useCrmData } from '@/contexts/CrmDataContext';
import { MeetingBriefShell } from '@/components/meetings/MeetingBriefShell';
import type { MeetingBrief } from '@/lib/types';

export default function MeetingBriefPage() {
  const { id } = useParams();
  const { opportunities, leads } = useCrmData();
  const opp = opportunities.find(o => o.id === id);
  const lead = leads.find(l => l.id === id) ?? (opp ? leads.find(l => l.id === opp.leadId) : undefined);

  const brief: MeetingBrief = useMemo(() => {
    const l = lead;
    const o = opp;
    const now = new Date().toLocaleString();
    if (o && l) {
      return {
        id: `brief-${o.id}`,
        leadId: l.id,
        leadName: l.name,
        dealStage: l.stage,
        dealValue: o.value,
        meetingTime: now,
        historyContext: `${o.contactName} — ${o.company ?? 'Company'} · ${o.value.toLocaleString()} DZD · Stage: ${o.stage}.`,
        openDeals: `${o.name} — follow up on proposal and next steps.`,
        riskFlags: [],
        talkingPoints: ['Confirm budget and authority', 'Align on timeline', 'Address open objections'],
        opportunityId: o.id,
        opportunityName: o.name,
      };
    }
    if (l) {
      return {
        id: `brief-${l.id}`,
        leadId: l.id,
        leadName: l.name,
        dealStage: l.stage,
        dealValue: l.dealValue ?? 0,
        meetingTime: now,
        historyContext: `${l.name} · ${l.channel} · Stage: ${l.stage}.`,
        openDeals: l.convertedOpportunityId
          ? 'This lead is linked to an opportunity — open the pipeline for deal context.'
          : 'No opportunity linked yet — consider converting when qualified.',
        riskFlags: [],
        talkingPoints: ['Clarify needs', 'Confirm next step', 'Capture objections'],
      };
    }
    return {
      id: 'brief-empty',
      leadId: '',
      leadName: 'Unknown',
      dealStage: 'new',
      dealValue: 0,
      meetingTime: now,
      historyContext: 'No CRM record found for this link.',
      openDeals: '—',
      riskFlags: [],
      talkingPoints: [],
    };
  }, [lead, opp]);

  if (!lead && !opp) {
    return (
      <AppShell title="Meeting Brief">
        <p className="text-[14px] text-[#6B6B80]">Record not found.</p>
        <Link href="/leads">
          <a className="mt-2 inline-block text-[14px] text-[#2B62E8]">Back to Leads</a>
        </Link>
      </AppShell>
    );
  }

  const title = opp?.name ?? lead!.name;
  const breadcrumbLeadId = opp?.leadId ?? lead!.id;

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
      <Link href={`/leads/${lead!.id}`}>
        <a className="hover:text-[#1A1A3E]">{lead!.name}</a>
      </Link>
      <ChevronRight size={13} />
      <span className="text-[#1A1A3E]">Meeting brief</span>
    </>
  );

  const historyContent =
    opp != null && lead != null ? (
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
            <Link href={opp ? `/opportunities/${opp.id}` : `/leads/${lead!.id}`}>
              <a className="scale-btn-ghost">{opp ? 'Open opportunity' : 'Open full contact'}</a>
            </Link>
          </>
        }
      />
    </AppShell>
  );
}
