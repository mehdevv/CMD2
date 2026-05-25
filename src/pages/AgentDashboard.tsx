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
import { AgentAutomationShowcase } from '@/components/agent/AgentAutomationShowcase';
import { useAuth } from '@/contexts/AuthContext';
import { useCrmData } from '@/contexts/CrmDataContext';
import { buildAgentFollowUpRows, conversationsForRole, leadsForRole } from '@/lib/agent-crm';
import { demoListAllActivity } from '@/lib/demo-crm-store';
import { isDemoUser } from '@/lib/demo-auth';

export default function AgentDashboard() {
  const { user } = useAuth();
  const { leads, opportunities, conversations } = useCrmData();
  const firstName = user?.name.split(' ')[0] ?? 'there';

  const myLeads = useMemo(() => leadsForRole(leads, user), [leads, user]);
  const myConversations = useMemo(
    () => conversationsForRole(leads, conversations, user),
    [leads, conversations, user]
  );

  const draftConversations = useMemo(
    () =>
      myConversations.filter(
        c => !c.automationPaused && (c.messages ?? []).some(m => m.sender === 'ai')
      ).slice(0, 3),
    [myConversations]
  );

  const followUpRows = useMemo(() => {
    if (!user) return [];
    const activity = isDemoUser(user) ? demoListAllActivity(40) : [];
    return buildAgentFollowUpRows(myLeads, activity, user.id);
  }, [myLeads, user]);

  const myActiveLeadCount = useMemo(
    () => myLeads.filter(l => l.stage !== 'closed').length,
    [myLeads]
  );

  const escalated = useMemo(
    () => myLeads.filter(l => l.aiStatus === 'escalated').slice(0, 3),
    [myLeads]
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

  const followUpsToday = followUpRows.filter(r => r.status === 'Sent').length;

  return (
    <AppShell title="Dashboard">
      <PageHeader title="Dashboard" className="mb-3" />
      <GreetingHeader
        className="mb-4"
        firstName={firstName}
        subtitle={`${myActiveLeadCount} lead${myActiveLeadCount === 1 ? '' : 's'} in your pipeline today.`}
      />

      <p className="mb-3 text-[13px] font-medium text-[#1A1A3E]">See the 4 automation agents on real customers</p>
      <AgentAutomationShowcase />

      <KpiRow
        cols={3}
        items={[
          { label: 'My active leads', value: String(myActiveLeadCount) },
          { label: 'Follow-ups today', value: String(followUpsToday || followUpRows.length) },
          { label: 'Messages to review', value: String(draftConversations.length) },
        ]}
      />

      <div className="mb-6 grid grid-cols-2 gap-6">
        <PageSection title="Needs attention">
          <NeedsAttentionList leads={escalated} />
        </PageSection>

        <PageSection title="Messages to approve">
          <DraftsToApproveList conversations={draftConversations} />
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
        {followUpRows.length === 0 ? (
          <p className="px-4 py-6 text-[13px] text-[#9999AA]">No follow-ups scheduled for today — add a lead to start a sequence.</p>
        ) : (
          <TodaysFollowUpsTable rows={followUpRows} />
        )}
      </PageSection>
    </AppShell>
  );
}
