import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { InfoBlock } from '@/components/ui/InfoBlock';
import { TriggerEventTable, type TriggerEventRow } from '@/components/admin/TriggerEventTable';

const TRIGGER_ROWS: TriggerEventRow[] = [
  { id: 'new_lead', event: 'New lead arrives (any channel)', agent: 'Lead Follow-Up', effect: 'Start sequence — step 1 sent immediately', configureHref: '/admin/agents/followup' },
  { id: 'lead_reply', event: 'Lead replies to any automation message', agent: 'Lead Follow-Up', effect: 'Stop sequence — mark as Contacted (configurable)', configureHref: '/admin/agents/followup' },
  { id: 'inbound', event: 'Customer sends a DM or message', agent: 'Client Chat', effect: 'Match knowledge base / generate reply', configureHref: '/admin/agents/chat' },
  { id: 'order_status', event: 'Order status changes in CRM', agent: 'Order Tracking', effect: 'Send mapped status message to customer', configureHref: '/admin/agents/tracking' },
  { id: 'refund_intent', event: 'Customer intent: refund / return', agent: 'Refund', effect: 'Open refund flow — policy check', configureHref: '/admin/agents/refund' },
  { id: 'low_conf', event: 'Low confidence or negative sentiment', agent: 'Any active agent', effect: 'Urgent alert + optional pause', configureHref: '/admin/automation/intervention' },
  { id: 'takeover', event: 'Sales taps Take over', agent: '—', effect: 'Pause all automation on that thread', configureHref: '/admin/automation/intervention' },
  {
    id: 'lead_enriched',
    event: 'Lead enrichment completes (assistant)',
    agent: 'Lead Follow-Up',
    effect: 'Update record fields — score and signals visible on Leads and profile',
    configureHref: '/leads',
  },
  {
    id: 'opp_stage',
    event: 'Opportunity moves to a new pipeline stage',
    agent: '—',
    effect: 'Log transition, refresh board totals, flag SLA if stage stalls',
    configureHref: '/opportunities',
  },
  {
    id: 'report_ready',
    event: 'Analytics report finishes generating',
    agent: '—',
    effect: 'Publish to Reports list — owner notified when recommendations exist',
    configureHref: '/analytics/reports',
  },
];

export default function AdminAutomationTriggers() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TRIGGER_ROWS.map(r => [r.id, true]))
  );

  const toggle = (id: string) => setEnabled(e => ({ ...e, [id]: !e[id] }));

  return (
    <AppShell title="Triggers & automations">
      <PageHeader
        title="Triggers & automations"
        subtitle="Scale runs on events: when something happens, the matching automation agent runs. Toggle rows off to disable that path (production would persist per organization)."
        className="mb-6 max-w-2xl"
      />

      <div className="mb-6">
        <InfoBlock>
          Message variables available in templates: {'{{name}}'}, {'{{product}}'}, {'{{company}}'}, {'{{agent_name}}'} — replaced at send time.
        </InfoBlock>
      </div>

      <PageSection padding="none" className="overflow-hidden">
        <TriggerEventTable rows={TRIGGER_ROWS} enabled={enabled} onToggle={toggle} />
      </PageSection>

      <p className="mt-4 text-[12px] text-[#9999AA]">
        Sequences and delays are configured on each agent page (e.g. Lead Follow-Up → Follow-up sequence).
      </p>
    </AppShell>
  );
}
