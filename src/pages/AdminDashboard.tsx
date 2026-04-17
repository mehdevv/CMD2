import { Link } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { KpiRow } from '@/components/dashboards/KpiRow';
import { ChannelHealthList } from '@/components/admin/ChannelHealthList';
import { PendingTemplatesTable } from '@/components/admin/PendingTemplatesTable';
import { SystemAlertList } from '@/components/admin/SystemAlertList';
import { AutomationActivityFeed } from '@/components/admin/AutomationActivityFeed';
import { MOCK_ACTIVITY_FEED, MOCK_PENDING_TEMPLATES } from '@/lib/mock-data';

const channelHealth = [
  { channel: 'whatsapp' as const, name: 'WhatsApp Business', status: 'connected' as const, msgsToday: 847 },
  { channel: 'instagram' as const, name: 'Instagram DMs', status: 'connected' as const, msgsToday: 312 },
  { channel: 'facebook' as const, name: 'Facebook Messenger', status: 'connected' as const, msgsToday: 198 },
];

const systemAlerts = [
  { id: 1, type: 'warning' as const, text: 'WhatsApp template "Last Follow Up" was rejected by Meta. Review and resubmit.' },
  { id: 2, type: 'info' as const, text: '2 escalated conversations have been waiting for human takeover for 2+ hours.' },
  { id: 3, type: 'info' as const, text: 'Message volume at 84% of monthly limit (E-commerce plan).' },
];

export default function AdminDashboard() {
  return (
    <AppShell title="Dashboard">
      <PageHeader
        title="Admin overview"
        subtitle="Channels, automation activity, templates, and system alerts."
        className="mb-6"
      />

      <KpiRow
        items={[
          { label: 'Total leads', value: '1,248', delta: '43 vs last week', deltaPositive: true },
          { label: 'Open deals', value: '87', delta: '-3 vs last week', deltaPositive: false },
          { label: 'Closed this month', value: '18', delta: '5 vs last month', deltaPositive: true },
          { label: 'Automation messages sent (30d)', value: '12,407', delta: '8% vs last month', deltaPositive: true },
        ]}
      />

      <div className="mb-6 grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <PageSection title="Automation activity">
          <AutomationActivityFeed items={MOCK_ACTIVITY_FEED} />
        </PageSection>

        <PageSection title="Channel health">
          <ChannelHealthList items={channelHealth} />
        </PageSection>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <PageSection title="Pending template approvals" padding="none">
          <PendingTemplatesTable rows={MOCK_PENDING_TEMPLATES} />
        </PageSection>

        <PageSection title="System alerts">
          <SystemAlertList
            alerts={systemAlerts}
            footer={
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 text-[16px] text-[#2B62E8]">ℹ</span>
                <p className="text-[13px] leading-snug text-[#6B6B80]">
                  Weekly loss digest is ready in{' '}
                  <Link href="/analytics/reports/rep-seed-1">
                    <a className="text-[#2B62E8] hover:underline">Reports</a>
                  </Link>
                  .
                </p>
              </div>
            }
          />
        </PageSection>
      </div>
    </AppShell>
  );
}
