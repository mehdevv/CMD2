import { useMemo } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { KpiRow } from '@/components/dashboards/KpiRow';
import { GreetingHeader } from '@/components/agent/GreetingHeader';
import { NeedsAttentionList } from '@/components/agent/NeedsAttentionList';
import { DraftsToApproveList } from '@/components/agent/DraftsToApproveList';
import { MyOpportunitiesList } from '@/components/agent/MyOpportunitiesList';
import { TodaysFollowUpsTable } from '@/components/agent/TodaysFollowUpsTable';
import { MOCK_CONVERSATIONS } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useCrmData } from '@/contexts/CrmDataContext';
import { assignedNameToOwnerId } from '@/lib/lead-utils';

const AI_DRAFTS = MOCK_CONVERSATIONS.slice(0, 3);

const TODAY_FOLLOWUPS = [
  { contact: 'Mohamed Benali', preview: 'Hey, just following up — are you still interested?', channel: 'whatsapp' as const, time: '10:00 AM', status: 'Scheduled' },
  { contact: 'Sofiane Meziane', preview: 'Bonjour, je ne veux pas que vous passiez à côté...', channel: 'facebook' as const, time: '2:00 PM', status: 'Scheduled' },
  { contact: 'Nadia Hamdi', preview: "Last message from me, let me know when you're ready!", channel: 'whatsapp' as const, time: '11:30 AM', status: 'Sent' },
];

export default function AgentDashboard() {
  const { user } = useAuth();
  const { leads, opportunities } = useCrmData();
  const firstName = user?.name.split(' ')[0] ?? 'there';

  const myActiveLeadCount = useMemo(
    () =>
      user
        ? leads.filter(l => assignedNameToOwnerId(l.assignedTo) === user.id && l.stage !== 'closed').length
        : 0,
    [leads, user]
  );

  const escalated = useMemo(
    () =>
      user
        ? leads
            .filter(l => l.aiStatus === 'escalated' && assignedNameToOwnerId(l.assignedTo) === user.id)
            .slice(0, 3)
        : [],
    [leads, user]
  );

  const myOpenOpps = useMemo(
    () =>
      user
        ? opportunities
            .filter(
              o =>
                o.ownerId === user.id &&
                o.outcome === 'open' &&
                o.stage !== 'won' &&
                o.stage !== 'lost'
            )
            .sort(
              (a, b) =>
                new Date(b.stageEnteredAt).getTime() - new Date(a.stageEnteredAt).getTime()
            )
            .slice(0, 5)
        : [],
    [opportunities, user]
  );

  return (
    <AppShell title="Dashboard">
      <PageHeader title="Dashboard" className="mb-3" />
      <GreetingHeader
        className="mb-8"
        firstName={firstName}
        subtitle={`${myActiveLeadCount} lead${myActiveLeadCount === 1 ? '' : 's'} in your pipeline today.`}
      />

      <KpiRow
        cols={3}
        items={[
          { label: 'My active leads', value: String(myActiveLeadCount) },
          { label: 'Follow-ups today', value: '5' },
          { label: 'Messages to approve', value: '3' },
        ]}
      />

      <div className="mb-6 grid grid-cols-2 gap-6">
        <PageSection title="Needs attention">
          <NeedsAttentionList leads={escalated} />
        </PageSection>

        <PageSection title="Messages to approve">
          <DraftsToApproveList conversations={AI_DRAFTS} />
        </PageSection>
      </div>

      <PageSection
        className="mb-6"
        title="My opportunities"
        action={
          <Link href="/opportunities">
            <a className="text-[13px] text-[#2B62E8] hover:underline">View all</a>
          </Link>
        }
      >
        <MyOpportunitiesList opportunities={myOpenOpps} />
      </PageSection>

      <PageSection title={"Today's automated follow-ups"} padding="none">
        <TodaysFollowUpsTable rows={TODAY_FOLLOWUPS} />
      </PageSection>
    </AppShell>
  );
}
